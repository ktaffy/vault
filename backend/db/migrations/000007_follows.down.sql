DROP TRIGGER IF EXISTS trigger_auto_follow_on_fire ON swipes;

DROP FUNCTION IF EXISTS auto_follow_on_fire();

DROP INDEX IF EXISTS idx_follows_artist;
DROP INDEX IF EXISTS idx_follows_follower;

DROP TABLE IF EXISTS follows;