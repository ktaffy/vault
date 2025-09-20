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
    is_active BOOLEAN DEFAULT TRUE, -- shadowban if fire_rate too low
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id) -- enforces ONE snippet per artist
);

CREATE INDEX idx_snippets_artist ON snippets(artist_id);
CREATE INDEX idx_snippets_active ON snippets(is_active);
CREATE INDEX idx_snippets_fire_rate ON snippets(fire_rate DESC);