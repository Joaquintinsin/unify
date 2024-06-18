require 'rspec'
require 'rack/test'
require 'sinatra'
require 'sinatra/cors'
require 'sinatra/json'
require 'json'
require 'pg'
require 'fileutils'
require 'dotenv/load'
require 'pdf-reader'
require 'openai'
require 'base64'
require 'open-uri'
require_relative '../app.rb'

ENV['RACK_ENV'] = 'test'

describe 'API /api/users' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  # ver pq falla, espera 201 y recibe 500
  context 'When all parameters are provided' do
    let(:valid_params) do
      {
        username: 'testuser',
        profilePicture: 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon',
        email: 'test@example.com'
      }.to_json
    end

    it 'Creates a new user and returns a 201 status code' do
      post '/api/users', valid_params, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(201)
      expect(last_response.body).to include('User created successfully')
    end
  end

  # ver si ahora se arreglo, poniendo el codigo del app.rb aca para inicializar la bd etc
  context 'When email already exists' do
    before do
      def db_connection
        begin
          connection = PG.connect(DB_SETTINGS)
          yield(connection)
        ensure
          connection.close if connection
        end
      end
      # Cargo primero un test@example.com en la base asi simulo tener alguno cargado de antemano
      db_connection do |conn|
        conn.transaction do
            conn.exec_params('INSERT INTO Users (email, username, profilePicture) VALUES ($1, $2, $3)', ['test@example.com', 'testuser2', 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon'])
        end
      end
    end

    let(:duplicate_email_params) do
      {
        username: 'testuser2',
        profilePicture: 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon',
        email: 'test@example.com'
      }.to_json
    end

    it 'Returns a 409 status code with an error message' do
      post '/api/users', duplicate_email_params, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(409)
      expect(last_response.body).to include('Email already exists')
    end
  end
end
