require 'sinatra'
require 'sinatra/cors'
require 'sinatra/json'
require 'pg'
require 'fileutils'

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
      puts "File successfully saved to #{file_path}"
    rescue => e
      puts "Failed to save file: #{e.message}"
      return nil
    end
  
    file_path
  end
end

post '/api/upload' do
  puts "Received file upload request"
  if params[:file].nil? || params[:file][:tempfile].nil?
    status 400
    return json error: 'No file was uploaded.'
  end

  file_path = save_file(params[:file])
  puts "File saved to #{file_path}"

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
        id: row['id'],
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