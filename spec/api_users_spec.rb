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
