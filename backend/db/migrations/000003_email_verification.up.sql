CREATE TABLE email_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_email_verification_user_id ON email_tokens(user_id);
CREATE INDEX idx_email_verification_token_hash ON email_tokens(token_hash);
CREATE INDEX idx_email_verification_expires_at ON email_tokens(expires_at);