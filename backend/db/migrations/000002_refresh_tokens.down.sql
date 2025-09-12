DROP FUNCTION IF EXISTS cleanup_expired_tokens();
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;
DROP INDEX IF EXISTS idx_refresh_tokens_token_hash;
DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
DROP TABLE IF EXISTS refresh_tokens;