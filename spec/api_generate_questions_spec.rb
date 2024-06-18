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

describe 'POST /api/generate-questions' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  let(:valid_pdf_path) { 'spec/fixtures/thisIsAPDF.pdf' }
  let(:valid_pdf_url) { 'https://res.cloudinary.com/dzay08nuf/image/upload/v1718633437/unify/jkirax0eio36rbimgksx.pdf' }

  context 'when no file or URL is provided' do
    it 'returns a 400 status code with an error message' do
      post '/api/generate-questions'
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('No file or URL provided')
    end
  end

  context 'when a valid file is provided' do
    it 'returns a 200 status code with the generated questions' do
      file = Rack::Test::UploadedFile.new(valid_pdf_path, 'application/pdf')
      post '/api/generate-questions', file: file
      expect(last_response.status).to eq(200)
      expect(last_response.body).to include('questions_and_answers')
    end
  end

  context 'when a valid URL is provided' do
    it 'returns a 200 status code with the generated questions' do
      post '/api/generate-questions', url: valid_pdf_url
      expect(last_response.status).to eq(200)
      expect(last_response.body).to include('questions_and_answers')
    end
  end

  context 'when the URL cannot be opened' do
    it 'returns a 400 status code with an error message' do
      allow(URI).to receive(:open).with(valid_pdf_url).and_raise(OpenURI::HTTPError.new('404 Not Found', nil))

      post '/api/generate-questions', url: valid_pdf_url
      expect(last_response.status).to eq(400)
      expect(last_response.body).to include('Failed to open file from URL')
    end
  end

  context 'when JSON parsing of the OpenAI response fails' do
    it 'returns a 500 status code with an error message' do
      client = instance_double(OpenAI::Client)
      allow(OpenAI::Client).to receive(:new).and_return(client)
      allow(client).to receive(:chat).and_return({ 'choices' => [{ 'message' => { 'content' => 'Invalid JSON response' } }] })

      file = Rack::Test::UploadedFile.new(valid_pdf_path, 'application/pdf')
      post '/api/generate-questions', file: file
      expect(last_response.status).to eq(500)
      expect(last_response.body).to include('Failed to parse JSON response')
    end
  end
end
