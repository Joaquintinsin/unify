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
require_relative '../app'

RSpec.describe 'GET /api/documents', type: :request do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  let(:db_response) do
    [
      { 'id' => '1', 'academic_year' => '2021', 'subject' => 'Math', 'exam_type' => 'Midterm',
        'file_name' => 'exam1.pdf', 'document_url' => 'http://example.com/exam1.pdf' },
      { 'id' => '2', 'academic_year' => '2021', 'subject' => 'Science', 'exam_type' => 'Final',
        'file_name' => 'exam2.pdf', 'document_url' => 'http://example.com/exam2.pdf' }
    ]
  end

  before do
    allow_any_instance_of(Sinatra::Application).to receive(:db_connection).and_yield(double('conn', exec: db_response))
  end

  it 'returns a list of documents' do
    get '/api/documents'

    expect(last_response.status).to eq(200)
    expect(last_response.content_type).to eq('application/json')

    documents = JSON.parse(last_response.body)
    expect(documents.size).to eq(2)
    expect(documents).to match_array([
                                       { 'id' => '1', 'academic_year' => '2021', 'subject' => 'Math', 'exam_type' => 'Midterm',
                                         'file_name' => 'exam1.pdf', 'document_url' => 'http://example.com/exam1.pdf' },
                                       { 'id' => '2', 'academic_year' => '2021', 'subject' => 'Science', 'exam_type' => 'Final',
                                         'file_name' => 'exam2.pdf', 'document_url' => 'http://example.com/exam2.pdf' }
                                     ])
  end
end
