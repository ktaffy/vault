CREATE TABLE swipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
    action VARCHAR(10) CHECK (action IN ('fire', 'skip')) NOT NULL,
    swiped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, snippet_id)  -- can't swipe same snippet twice
);

CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_swipes_snippet ON swipes(snippet_id);
CREATE INDEX idx_swipes_action ON swipes(action);
CREATE INDEX idx_swipes_time ON swipes(swiped_at DESC);

CREATE OR REPLACE FUNCTION update_snippet_stats() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'fire' THEN
        UPDATE snippets 
        SET fire_count = fire_count + 1,
            play_count = play_count + 1
        WHERE id = NEW.snippet_id;
    ELSE -- skip
        UPDATE snippets 
        SET skip_count = skip_count + 1,
            play_count = play_count + 1
        WHERE id = NEW.snippet_id;
    END IF;
    
    UPDATE users SET last_login = NOW() WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_snippet_stats
AFTER INSERT ON swipes
FOR EACH ROW EXECUTE FUNCTION update_snippet_stats();

CREATE OR REPLACE FUNCTION check_shadowban() RETURNS TRIGGER AS $$
BEGIN
    -- If 100+ swipes and less than 5% fire rate, shadowban
    IF (NEW.fire_count + NEW.skip_count) >= 100 AND 
       NEW.fire_rate < 0.05 THEN
        NEW.is_active := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_shadowban
BEFORE UPDATE ON snippets
FOR EACH ROW EXECUTE FUNCTION check_shadowban();