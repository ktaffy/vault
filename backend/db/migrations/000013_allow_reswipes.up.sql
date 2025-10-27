DROP TRIGGER IF EXISTS trigger_update_snippet_stats ON swipes;
DROP TRIGGER IF EXISTS trigger_auto_follow_on_fire ON swipes;

CREATE OR REPLACE FUNCTION update_snippet_stats_v2() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.action = 'fire' THEN
            UPDATE snippets 
            SET fire_count = fire_count + 1,
                play_count = play_count + 1
            WHERE id = NEW.snippet_id;
        ELSE
            UPDATE snippets 
            SET skip_count = skip_count + 1,
                play_count = play_count + 1
            WHERE id = NEW.snippet_id;
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.action = 'fire' AND NEW.action = 'skip' THEN
            UPDATE snippets 
            SET fire_count = fire_count - 1,
                skip_count = skip_count + 1
            WHERE id = NEW.snippet_id;
            
        ELSIF OLD.action = 'skip' AND NEW.action = 'fire' THEN
            UPDATE snippets 
            SET skip_count = skip_count - 1,
                fire_count = fire_count + 1
            WHERE id = NEW.snippet_id;
        END IF;
    END IF;
    
    UPDATE users SET last_login = NOW() WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_snippet_stats_v2
AFTER INSERT OR UPDATE ON swipes
FOR EACH ROW EXECUTE FUNCTION update_snippet_stats_v2();

CREATE TRIGGER trigger_auto_follow_on_fire_v2
AFTER INSERT ON swipes
FOR EACH ROW EXECUTE FUNCTION auto_follow_on_fire();