DROP FUNCTION IF EXISTS calculate_similarities();
DROP INDEX IF EXISTS idx_similarities_artist_b;
DROP INDEX IF EXISTS idx_similarities_artist_a;
DROP INDEX IF EXISTS idx_similarities_score;
DROP TABLE IF EXISTS artist_similarities;