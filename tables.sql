CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  profile_name VARCHAR(255),
  profile_picture TEXT,
  gender VARCHAR(50),
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  bio TEXT,
  twitter_handle VARCHAR(255),
  facebook_handle VARCHAR(255),
  instagram_handle VARCHAR(255),
  occupation VARCHAR(255),
  education VARCHAR(255),
  preferred_language VARCHAR(50),
  preferred_theme VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_private BOOLEAN DEFAULT FALSE
);

CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE authors (
  author_id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  biography TEXT,
  profile_picture TEXT,
  nationality VARCHAR(100),
  date_of_birth DATE,
  date_of_death DATE
);

CREATE TABLE documents (
  document_id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author_id INTEGER REFERENCES authors(author_id),
  created_by INTEGER REFERENCES users(user_id),
  description TEXT,
  pdf_url TEXT,
  cover_image_url TEXT,
  published_date DATE,
  language VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  rating DECIMAL(3, 2),
  review TEXT,
  category_id INTEGER REFERENCES categories(category_id),
  status VARCHAR(50) DEFAULT 'pending',
  file_path TEXT
);

CREATE TABLE download_history (
  user_id INTEGER REFERENCES users(user_id),
  document_id INTEGER REFERENCES documents(document_id),
  download_date TIMESTAMP,
  PRIMARY KEY (user_id, document_id)
);

CREATE TABLE friend_requests (
  requester_id INTEGER REFERENCES users(user_id),
  recipient_id INTEGER REFERENCES users(user_id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (requester_id, recipient_id)
);

CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES users(user_id),
  requester_id INTEGER REFERENCES users(user_id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  type VARCHAR(255),
  message TEXT,
  document_id INTEGER REFERENCES documents(document_id),
  document_approved BOOLEAN DEFAULT FALSE,
  document_name_approved VARCHAR(255)
);

CREATE TABLE reading_groups (
  reading_group_id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  current_document_id INTEGER REFERENCES documents(document_id)
);

CREATE TABLE reading_group_members (
  reading_group_id INTEGER REFERENCES reading_groups(reading_group_id),
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (reading_group_id, user_id)
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(document_id),
  user_id INTEGER REFERENCES users(user_id),
  rating DECIMAL(3, 2),
  comment TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE tokens (
  token_id SERIAL PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  user_id INTEGER REFERENCES users(user_id)
);

CREATE TABLE user_friends (
  user_id INTEGER REFERENCES users(user_id),
  friend_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE user_favorite_documents (
  user_id INTEGER REFERENCES users(user_id),
  document_id INTEGER REFERENCES documents(document_id),
  PRIMARY KEY (user_id, document_id)
);

-- Table for document genres (assuming a many-to-many relationship)
CREATE TABLE genres (
  genre_id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE document_genres (
  document_id INTEGER REFERENCES documents(document_id),
  genre_id INTEGER REFERENCES genres(genre_id),
  PRIMARY KEY (document_id, genre_id)
);

-- Table for document tags (assuming a many-to-many relationship)
CREATE TABLE tags (
  tag_id SERIAL PRIMARY KEY,
  tag VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE document_tags (
  document_id INTEGER REFERENCES documents(document_id),
  tag_id INTEGER REFERENCES tags(tag_id),
  PRIMARY KEY (document_id, tag_id)
);