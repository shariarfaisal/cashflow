-- +goose Up
-- Create users table for desktop app (simplified for single-user)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL DEFAULT 'Default User',
    email TEXT,
    preferences TEXT, -- JSON field for user preferences
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user for desktop app
INSERT OR IGNORE INTO users (id, name) VALUES ('default', 'Default User');

-- +goose Down
DROP TABLE IF EXISTS users;