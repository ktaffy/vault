CREATE TABLE password_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_user_id ON password_tokens(user_id);
CREATE INDEX idx_password_reset_token_hash ON password_tokens(token_hash);
CREATE INDEX idx_password_reset_expires_at ON password_tokens(expires_at);