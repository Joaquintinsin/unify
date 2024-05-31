require 'sinatra'
require 'sinatra/cors'
require 'sinatra/json'
require 'pg'
require 'fileutils'
require 'dotenv/load'
require 'pdf-reader'
require 'openai'

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

get '/api/hello' do
  json message: 'Hello World'
end

post '/api/generate-questions' do
  logger.info "Received request to generate quiz"

  unless params[:file] && params[:file][:tempfile]
    logger.error "No file provided"
    status 400
    return json error: 'No file provided'
  end

  file = params[:file][:tempfile]

  begin
    reader = PDF::Reader.new(file)
    full_text = reader.pages.map(&:text).join("\n")
    logger.info "Successfully read PDF file"
  rescue => e
    logger.error "Failed to read PDF file: #{e.message}"
    status 500
    return json error: e.message
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
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: structured_prompt },
          { role: "user", content: full_text }
        ],
        max_tokens: 3000,
        temperature: 0.5
      }
    )

    logger.info "Received response from OpenAI"

    response_content = response['choices'][0]['message']['content']

    puts response_content

    begin
      structured_response = JSON.parse(response_content)
      logger.info "Successfully parsed response into JSON"
    rescue JSON::ParserError => e
      logger.error "Failed to parse response into JSON: #{e.message}"
      status 500
      return json error: 'Failed to parse response into JSON'
    end

    json questions_and_answers: structured_response
  rescue => e
    logger.error "Failed to generate quiz: #{e.message}"
    status 500
    return json error: 'Failed to generate quiz'
  end
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

post '/api/uploads' do
  logger.info "Received file upload request ----- :)"
  if params[:file].nil? || params[:file][:tempfile].nil?
    logger.error "No file was uploaded"
    status 400
    return json error: 'No file was uploaded.'
  end

  file_path = save_file(params[:file])
  logger.info "File saved to #{file_path}"

  if file_path
    db_connection do |conn|
      conn.exec_params("INSERT INTO documents (title, file_path) VALUES ($1, $2)", ['Documento de Ejemplo', file_path])
    end
    json path: file_path
  else
    status 500
    json error: 'Failed to save the file.'
  end
end

get '/api/documents' do
  documents = db_connection do |conn|
    result = conn.exec('SELECT document_id, title, file_path FROM documents;')
    result.map do |row|
      {
        id: row['document_id'],
        title: row['title'],
        file_path: row['file_path']
      }
    end
  end

  json documents
end

get '/users' do
  db_connection do |conn|
    result = conn.exec('SELECT * FROM users;')
    json result.map { |row| row }
  end
end

get '/' do
  "Hello, World!"
end
