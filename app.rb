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
set :allow_origin, "http://localhost:3000"
set :allow_methods, "GET,HEAD,POST"
set :allow_headers, "content-type,if-modified-since"
set :expose_headers, "location,link"

set :bind, '0.0.0.0'
set :upload_folder, 'public/uploads'

DB_SETTINGS = {
  host: 'host.docker.internal',
  dbname: 'unify',
  user: 'postgres',
  password: 'password'
}

OpenAI.configure do |config|
  config.access_token = ""
end

post '/api/generate-questions' do
  logger.info "Received request to generate quiz"
  logger.info "Params: #{params.inspect}"

  file = nil

  if params[:file] && params[:file][:tempfile]
    file = params[:file][:tempfile]
    logger.info "Successfully received file from tempfile"
  elsif params[:url]
    begin
      file = URI.open(params[:url])
      logger.info "Successfully opened file from URL"
    rescue => e
      logger.error "Failed to open file from URL: #{e.message}"
      status 400
      return json error: 'Failed to open file from URL'
    end
  end

  if file.nil?
    logger.error "No file or URL provided"
    status 400
    return json error: 'No file or URL provided'
  end

  full_text = extract_text_from_pdf(file)

  if full_text.empty?
    logger.error "Failed to extract text from PDF"
    status 500
    return json error: 'Failed to extract text from PDF'
  end

  structured_prompt = """
  Generate 10 insightful questions based on the following text. For each question, provide 4 multiple-choice options and indicate the correct answer.
  Please format each question as a JSON object within a list, with 'question', 'options' (a list of choices), and 'answer' (the correct choice) keys.
  Provide the response in Spanish.
  """

  begin
    client = OpenAI::Client.new
    response = client.chat(
      parameters: {
        model: "gpt-4o", # Usa el modelo con capacidad de visión
        messages: [
          { role: "system", content: structured_prompt },
          { role: "user", content: full_text }
        ],
        max_tokens: 3000,
        temperature: 0.5
      }
    )

    logger.info "Received response from OpenAI"
    logger.info "Response: #{response.inspect}"

    response_content = response['choices'][0]['message']['content'].strip
    # Eliminar el bloque de código delimitador si existe
    response_content.gsub!(/^```json\n/, '')
    response_content.gsub!(/\n```$/, '')

    structured_response = JSON.parse(response_content)

    json questions_and_answers: structured_response
  rescue JSON::ParserError => e
    logger.error "Failed to parse JSON response: #{e.message}"
    status 500
    return json error: 'Failed to parse JSON response'
  rescue => e
    logger.error "Failed to generate quiz: #{e.message}"
    status 500
    return json error: 'Failed to generate quiz'
  end
end

def extract_text_from_pdf(file)
  text = ""
  reader = nil

  begin
    reader = PDF::Reader.new(file)
    reader.pages.each do |page|
      text << page.text
    end
  rescue => e
    logger.error "Direct PDF text extraction failed: #{e.message}"
  end

  if text.strip.empty?
    logger.info "Attempting OCR extraction as fallback"
    begin
      images = pdf_to_images(file)
      images.each do |image|
        ocr_text = extract_text_from_image(image)
        text << ocr_text
      end
    rescue => ocr_error
      logger.error "OCR text extraction failed: #{ocr_error.message}"
    end
  end

  if text.strip.empty?
    logger.warn "No text could be extracted from the PDF"
    text = "No se pudo extraer texto del archivo PDF."
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

post '/api/users' do
  username = params[:username]
  profilePicture = params[:profilePicture]
  email = params[:email]

  # Validación básica de los parámetros
  halt 400, { error: 'Missing parameters' }.to_json unless username && profilePicture && email

  db_connection do |conn|
    conn.transaction do |conn|
      count_rows_query = conn.exec_params('SELECT COUNT(*) FROM Users WHERE email = $1', [email]).getvalue(0, 0).to_i
      if count_rows_query == 0
        conn.exec_params('INSERT INTO Users (email, username, profilePicture) VALUES ($1, $2, $3)', 
                         [email, username, profilePicture])
        status 201
        { message: 'User created successfully' }.to_json
      else
        halt 409, { error: 'Email already exists' }.to_json
      end
    end
  end
end

post '/api/logout' do
  redirect '/login'
end

helpers do
  def db_connection
    begin
      connection = PG.connect(DB_SETTINGS)
      yield(connection)
    ensure
      connection.close if connection
    end
  end

  def save_file(file)
    filename = file[:filename]
    file_path = File.join(settings.upload_folder, filename)
    FileUtils.mkdir_p(settings.upload_folder) unless File.exist?(settings.upload_folder)

    begin
      File.open(file_path, 'wb') do |f|
        f.write(file[:tempfile].read)
      end
      logger.info "File successfully saved to #{file_path}"
    rescue => e
      logger.error "Failed to save file: #{e.message}"
      return nil
    end

    file_path
  end
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
