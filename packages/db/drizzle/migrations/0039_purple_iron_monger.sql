CREATE INDEX idx_users_settings ON users USING GIN (settings);
