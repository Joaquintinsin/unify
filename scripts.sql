-- Create Database
CREATE DATABASE unify;

-- Create the Documents table
CREATE TABLE document (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(255),
    subject VARCHAR(255),
    exam_type VARCHAR(255),
    file_name VARCHAR(255),
    document_url VARCHAR(1024)
);

-- Create the Users table
CREATE TABLE Users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    profilePicture VARCHAR(100)
);
