require 'sinatra'
require 'sinatra/cors'
require 'sinatra/json'
require 'pg'
require 'fileutils'
require 'dotenv/load'
require 'pdf-reader'
require 'openai'
require 'base64'
require 'open-uri'

set :cors, true
set :allow_origin, 'http://localhost:3000'
set :allow_methods, 'GET,HEAD,POST'
set :allow_headers, 'content-type,if-modified-since'
set :expose_headers, 'location,link'

set :bind, '0.0.0.0'
set :upload_folder, 'public/uploads'

DB_SETTINGS = {
  host: 'host.docker.internal',
  dbname: 'unify',
  user: 'postgres',
  password: 'password'
}

OpenAI.configure do |config|
  config.access_token = ''
end

post '/api/generate-questions' do
  logger.info 'Received request to generate quiz'
  logger.info "Params: #{params.inspect}"

  file = nil

  if params[:file] && params[:file][:tempfile]
    file = params[:file][:tempfile]
    status 200
    logger.info 'Successfully received file from tempfile'
  elsif params[:url]
    begin
      file = URI.open(params[:url])
      status 200
      logger.info 'Successfully opened file from URL'
    rescue StandardError => e
      logger.error "Failed to open file from URL: #{e.message}"
      status 400
      return json error: 'Failed to open file from URL'
    end
  end

  if file.nil?
    logger.error 'No file or URL provided'
    status 400
    return json error: 'No file or URL provided'
  end

  full_text = extract_text_from_pdf(file)

  if full_text.empty?
    logger.error 'Failed to extract text from PDF'
    status 500
    return json error: 'Failed to extract text from PDF'
  end

  structured_prompt = ''"
  Generate 10 insightful questions based on the following text. For each question, provide 4 multiple-choice options and indicate the correct answer.
  Please format each question as a JSON object within a list, with 'question', 'options' (a list of choices), and 'answer' (the correct choice) keys.
  Provide the response in Spanish.
  "''

  begin
    client = OpenAI::Client.new
    response = client.chat(
      parameters: {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: structured_prompt },
          { role: 'user', content: full_text }
        ],
        max_tokens: 3000,
        temperature: 0.5
      }
    )

    logger.info 'Received response from OpenAI'
    logger.info "Response: #{response.inspect}"

    response_content = response['choices'][0]['message']['content'].strip
    # Eliminar el bloque de código delimitador si existe
    response_content.gsub!(/^```json\n/, '')
    response_content.gsub!(/\n```$/, '')

    structured_response = JSON.parse(response_content)

    status 200
    json questions_and_answers: structured_response
  rescue JSON::ParserError => e
    logger.error "Failed to parse JSON response: #{e.message}"
    status 500
    return json error: 'Failed to parse JSON response'
  rescue StandardError => e
    logger.error "Failed to generate quiz: #{e.message}"
    status 500
    return json error: 'Failed to generate quiz'
  end
end

post '/api/users' do
  content_type :json

  request.body.rewind
  request_payload = JSON.parse(request.body.read)

  username = request_payload['username']
  profilePicture = request_payload['profilePicture']
  email = request_payload['email']

  logger.info 'Received request to login or register an account'
  logger.info "Params: #{request_payload.inspect}"

  halt 400, { error: 'Missing parameters' }.to_json unless username && profilePicture && email

  begin
    db_connection do |conn|
      conn.transaction do
        user_exists = conn.exec_params('SELECT COUNT(*) FROM Users WHERE email = $1', [email]).getvalue(0, 0).to_i > 0

        if user_exists
          status 200
          { message: 'Login into an existing account' }.to_json
        else
          conn.exec_params('INSERT INTO Users (email, username, profilePicture) VALUES ($1, $2, $3)',
                           [email, username, profilePicture])
          status 201
          { message: 'Register an account successfully' }.to_json
        end
      end
    end
  rescue PG::Error => e
    logger.error "Database error: #{e.message}"
    halt 500, { error: 'Database error' }.to_json
  end
end

post '/api/logout' do
  redirect '/login'
end

get '/api/documents' do
  documents = db_connection do |conn|
    result = conn.exec('SELECT id, academic_year, subject, exam_type, file_name, document_url FROM document ORDER BY academic_year, subject, exam_type;')
    result.map do |row|
      {
        id: row['id'],
        academic_year: row['academic_year'],
        subject: row['subject'],
        exam_type: row['exam_type'],
        file_name: row['file_name'],
        document_url: row['document_url']
      }
    end
  end

  content_type :json
  json documents
end

helpers do
  def db_connection
    connection = PG.connect(DB_SETTINGS)
    yield(connection)
  ensure
    connection.close if connection
  end

  def extract_text_from_pdf(file)
    text = ''
    reader = nil

    begin
      reader = PDF::Reader.new(file)
      reader.pages.each do |page|
        text << page.text
      end
    rescue StandardError => e
      logger.error "Direct PDF text extraction failed: #{e.message}"
    end

    if text.strip.empty?
      logger.info 'Attempting OCR extraction as fallback'
      begin
        images = pdf_to_images(file)
        images.each do |image|
          ocr_text = extract_text_from_image(image)
          text << ocr_text
        end
      rescue StandardError => e
        logger.error "OCR text extraction failed: #{e.message}"
      end
    end

    if text.strip.empty?
      logger.warn 'No text could be extracted from the PDF'
      text = 'No se pudo extraer texto del archivo PDF.'
    end

    text
  end

  def pdf_to_images(file)
    images = []
    MiniMagick::Tool::Convert.new do |convert|
      convert.density 300
      convert << file.path
      convert << 'png:-'
    end.each_frame do |frame|
      images << frame
    end
    images
  end

  def extract_text_from_image(image)
    RTesseract.new(image.path).to_s
  end
end
