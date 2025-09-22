CREATE TABLE artist_similarities (
    artist_a INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_b INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(artist_a, artist_b)
);

CREATE INDEX idx_similarities_score ON artist_similarities(similarity_score DESC);
CREATE INDEX idx_similarities_artist_a ON artist_similarities(artist_a);
CREATE INDEX idx_similarities_artist_b ON artist_similarities(artist_b);

-- Function to calculate artist similarities
CREATE OR REPLACE FUNCTION calculate_similarities() RETURNS void AS $$
BEGIN
    -- Clear existing similarities
    TRUNCATE artist_similarities;
    
    -- Calculate similarities based on users who fired both artists
    INSERT INTO artist_similarities (artist_a, artist_b, similarity_score)
    SELECT 
        s1.artist_id as artist_a,
        s2.artist_id as artist_b,
        (COUNT(DISTINCT sw1.user_id)::DECIMAL / 
         GREATEST(s1_stats.fire_count, s2_stats.fire_count, 1)) as score
    FROM swipes sw1
    JOIN swipes sw2 ON sw1.user_id = sw2.user_id
    JOIN snippets s1 ON sw1.snippet_id = s1.id
    JOIN snippets s2 ON sw2.snippet_id = s2.id
    JOIN (
        SELECT artist_id, fire_count 
        FROM snippets 
        WHERE fire_count >= 10
    ) s1_stats ON s1.artist_id = s1_stats.artist_id
    JOIN (
        SELECT artist_id, fire_count 
        FROM snippets 
        WHERE fire_count >= 10  
    ) s2_stats ON s2.artist_id = s2_stats.artist_id
    WHERE sw1.action = 'fire' 
        AND sw2.action = 'fire'
        AND s1.artist_id != s2.artist_id
        AND s1_stats.fire_count >= 10  -- Only artists with decent engagement
        AND s2_stats.fire_count >= 10
    GROUP BY s1.artist_id, s2.artist_id, s1_stats.fire_count, s2_stats.fire_count
    HAVING COUNT(DISTINCT sw1.user_id) >= 3  -- At least 3 shared users
        AND (COUNT(DISTINCT sw1.user_id)::DECIMAL / 
             GREATEST(s1_stats.fire_count, s2_stats.fire_count, 1)) >= 0.1;
             
    -- Update timestamp
    UPDATE artist_similarities SET last_calculated = NOW();
END;
$$ LANGUAGE plpgsql;