CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(follower_id, artist_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_artist ON follows(artist_id);

CREATE OR REPLACE FUNCTION auto_follow_on_fire() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'fire' THEN
        -- Auto-follow the artist
        INSERT INTO follows (follower_id, artist_id)
        SELECT NEW.user_id, artist_id FROM snippets 
        WHERE id = NEW.snippet_id
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_follow_on_fire
AFTER INSERT ON swipes
FOR EACH ROW EXECUTE FUNCTION auto_follow_on_fire();