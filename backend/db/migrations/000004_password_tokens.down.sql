DROP INDEX IF EXISTS idx_password_reset_expires_at;
DROP INDEX IF EXISTS idx_password_reset_token_hash;
DROP INDEX IF EXISTS idx_password_reset_user_id;
DROP TABLE IF EXISTS password_tokens;