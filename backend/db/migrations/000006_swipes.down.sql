DROP TRIGGER IF EXISTS trigger_check_shadowban ON snippets;
DROP TRIGGER IF EXISTS trigger_update_snippet_stats ON swipes;

DROP FUNCTION IF EXISTS check_shadowban();
DROP FUNCTION IF EXISTS update_snippet_stats();

DROP INDEX IF EXISTS idx_swipes_time;
DROP INDEX IF EXISTS idx_swipes_action;
DROP INDEX IF EXISTS idx_swipes_snippet;
DROP INDEX IF EXISTS idx_swipes_user;

DROP TABLE IF EXISTS swipes;