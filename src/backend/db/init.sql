CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100)
);

INSERT INTO users (name, email) VALUES ('Docker User', 'docker@example.com');