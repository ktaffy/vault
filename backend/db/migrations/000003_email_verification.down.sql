DROP INDEX IF EXISTS idx_email_verification_expires_at;
DROP INDEX IF EXISTS idx_email_verification_token_hash;
DROP INDEX IF EXISTS idx_email_verification_user_id;
DROP TABLE IF EXISTS email_verification_tokens;