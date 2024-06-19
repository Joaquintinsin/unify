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
require 'spec_helper'
require_relative '../app'

ENV['RACK_ENV'] = 'test'

describe 'API /api/users' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def db_connection
    PG.connect(
      host: ENV['DB_HOST'],
      dbname: ENV['DB_NAME'],
      user: ENV['DB_USER'],
      password: ENV['DB_PASSWORD']
    )
  end

  before(:each) do
    db_connection do |conn|
      conn.exec('TRUNCATE Users RESTART IDENTITY CASCADE')
    end
  end

  # Hay problemas con la base de datos, debe haber conflictos entre docker y postgres, o las gemas, algo...
  context 'when all parameters are provided' do
    let(:valid_params) do
      {
        username: 'testuser',
        profilePicture: 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon',
        email: 'test@example.com'
      }.to_json
    end

    it 'registers a new user and returns a 201 status code if user does not exist' do
      post '/api/users', valid_params, { 'CONTENT_TYPE' => 'application/json' }
      puts last_response.body  # Añadir log para depurar
      expect(last_response.status).to eq(201)
      expect(last_response.body).to include('Register an account successfully')
    end

    it 'logs in an existing user and returns a 200 status code if user already exists' do
      db_connection do |conn|
        conn.exec_params('INSERT INTO Users (email, username, profilePicture) VALUES ($1, $2, $3)',
                         ['test@example.com', 'testuser', 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon'])
      end
      post '/api/users', valid_params, { 'CONTENT_TYPE' => 'application/json' }
      puts last_response.body  # Añadir log para depurar
      expect(last_response.status).to eq(200)
      expect(last_response.body).to include('Login into an existing account')
    end
  end

  context 'when parameters are missing' do
    it 'returns a 400 status code with an error message' do
      post '/api/users', {}.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('Missing parameters')
    end

    it 'returns a 400 status code if username is missing' do
      post '/api/users', { email: 'test@example.com', profilePicture: 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon' }.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('Missing parameters')
    end

    it 'returns a 400 status code if profilePicture is missing' do
      post '/api/users', { email: 'test@example.com', username: 'testuser' }.to_json,
           { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('Missing parameters')
    end

    it 'returns a 400 status code if email is missing' do
      post '/api/users', { username: 'testuser', profilePicture: 'https://www.vecteezy.com/png/20911740-user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon' }.to_json, { 'CONTENT_TYPE' => 'application/json' }
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('Missing parameters')
    end
  end
end
