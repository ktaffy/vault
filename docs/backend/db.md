# <span style="color: #9478e9ff;">Vault</span> Complete DB Schema
## 8 Tables Total

```sql
-- 1. USERS (Artists and Listeners combined)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_artist BOOLEAN DEFAULT FALSE, -- becomes true after first upload
    email_verified BOOLEAN DEFAULT FALSE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```
```sql
-- 2. Refresh Tokens
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```
```sql
-- 3. Email Tokens
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
```
```sql
-- 4. Password Tokens
CREATE TABLE password_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_user_id ON password_tokens(user_id);
CREATE INDEX idx_password_reset_token_hash ON password_tokens(token_hash);
CREATE INDEX idx_password_reset_expires_at ON password_tokens(expires_at);
```
```sql
-- 5. Snippets (One per artist for now)
CREATE TABLE snippets (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    audio_url VARCHAR(500) NOT NULL, -- S3/Cloudinary URL
    duration_seconds INTEGER DEFAULT 15 CHECK(duration_seconds <= 15),
    play_count INTEGER DEFAULT 0,
    fire_count INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0,
    fire_rate DECIMAL(3, 2) GENERATED ALWAYS AS (
        CASE
            WHEN (fire_count + skip_count) > 0
            THEN fire_count::DECIMAL / (fire_count + skip_count)
            ELSE 0
        END
    ) STORED,
    is_active BOOEAN DEFAULT TRUE, -- shadowban if fire_rate too low
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id) -- enforces ONE snippet per artist
);

CREATE INDEX idx_snippets_artist ON snippets(artist_id);
CREATE INDEX idx_snippets_vibe ON snippets(vibe);
CREATE INDEX idx_snippets_active ON snippets(is_active);
CREATE INDEX idx_snippets_fire_rate ON snippets(fire_rate DESC);
```
```sql
-- 6. SWIPES (NEW - Every user interaction)
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
```
```sql
-- 7. FOLLOWS (NEW - Auto-createed when you fire)
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(follower_id, artist_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_artist ON follows(artist_id);
```
```sql
-- 8. Artist Similarities (For taste matching) 
CREATE TABLE artist_similarities (
    artist_a INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_b INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(artist_a, artist_b)
);

CREATE INDEX idx_similarities_score ON artist_similarities(similarity_score DESC);
```

## 5 Functions Total
```sql
-- 1. Token Cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```
```sql
-- 2. Auto update snippet stats on every swipe
CREATE OR REPLACE FUNCTION update_snippet_stats() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'fire' THEN
        UPDATE snippets 
        SET fire_count = fire_count + 1,
            play_count = play_count + 1
        WHERE id = NEW.snippet_id;
        
        -- Auto-follow the artist
        INSERT INTO follows (follower_id, artist_id)
        SELECT NEW.user_id, artist_id FROM snippets 
        WHERE id = NEW.snippet_id
        ON CONFLICT DO NOTHING;
        
        -- Mark user as artist after first upload
        UPDATE users 
        SET is_artist = TRUE 
        WHERE id = (SELECT artist_id FROM snippets WHERE id = NEW.snippet_id);
    ELSE
        UPDATE snippets 
        SET skip_count = skip_count + 1,
            play_count = play_count + 1
        WHERE id = NEW.snippet_id;
    END IF;
    
    -- Update user last_login (using your existing field)
    UPDATE users SET last_login = NOW() WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_snippet_stats
AFTER INSERT ON swipes
FOR EACH ROW EXECUTE FUNCTION update_snippet_stats();
```
```sql
-- 3. Auto shadowban snippets with bad fire rate
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
```
```sql
CREATE OR REPLACE FUNCTION mark_as_artist() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET is_artist = TRUE WHERE id = NEW.artist_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_as_artist
AFTER INSERT ON snippets
FOR EACH ROW EXECUTE FUNCTION mark_as_artist();
```
```sql
-- 4. Calculate artist similarities (run as cron job every hour)
CREATE OR REPLACE FUNCTION calculate_similarities() RETURNS void AS $$
BEGIN
    TRUNCATE artist_similarities;
    
    INSERT INTO artist_similarities (artist_a, artist_b, similarity_score)
    SELECT 
        s1.artist_id as artist_a,
        s2.artist_id as artist_b,
        COUNT(DISTINCT sw1.user_id)::DECIMAL / 
            LEAST(s1.fire_count, s2.fire_count) as score
    FROM swipes sw1
    JOIN swipes sw2 ON sw1.user_id = sw2.user_id
    JOIN snippets s1 ON sw1.snippet_id = s1.id
    JOIN snippets s2 ON sw2.snippet_id = s2.id
    WHERE sw1.action = 'fire' 
        AND sw2.action = 'fire'
        AND s1.artist_id != s2.artist_id
        AND s1.fire_count > 10
        AND s2.fire_count > 10
    GROUP BY s1.artist_id, s2.artist_id
    HAVING COUNT(DISTINCT sw1.user_id) >= 3;
END;
$$ LANGUAGE plpgsql;
```