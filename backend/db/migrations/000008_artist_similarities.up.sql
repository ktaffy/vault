CREATE TABLE artist_similarities (
    artist_a INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_b INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(artist_a, artist_b)
);

CREATE INDEX idx_similarities_score ON artist_similarities(similarity_score DESC);