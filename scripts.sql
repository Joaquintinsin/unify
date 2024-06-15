-- Create Database
CREATE DATABASE unify;

-- Create the Subjects table
CREATE TABLE Subjects (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT
);

-- Create the Documents table
CREATE TABLE Documents (
    ID SERIAL PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Creation_Date DATE NOT NULL,
    File BYTEA,
    Subject_ID INT REFERENCES Subjects(ID)
);