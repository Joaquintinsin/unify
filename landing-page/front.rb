require 'sinatra'
require 'sinatra/cors'
require 'sinatra/json'
require 'pg'
require 'fileutils'
require 'dotenv/load'
require 'pdf-reader'
require 'openai'

set :port, 5000

get '/' do
    erb :index
end

post '/login' do
    erb :loginReg
end

post '/ingresar' do
    erb :login
end