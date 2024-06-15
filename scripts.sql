-- Create Database
CREATE DATABASE unify;

-- Create the Subjects table
CREATE TABLE Subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Create the Documents table
CREATE TABLE Documents (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES Subjects(id),
    filename VARCHAR(255) NOT NULL,
    file_content BYTEA,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
