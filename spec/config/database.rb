DB_SETTINGS = {
  host: ENV.fetch('DB_HOST', 'localhost'),
  dbname: ENV.fetch('DB_NAME', 'unify'),
  user: ENV.fetch('DB_USER', 'postgres'),
  password: ENV.fetch('DB_PASSWORD', 'password')
}
