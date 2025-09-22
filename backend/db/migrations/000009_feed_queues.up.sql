CREATE TABLE feed_queues (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, snippet_id),
    UNIQUE(user_id, position)
);

CREATE INDEX idx_feed_queues_user_position ON feed_queues(user_id, position);
CREATE INDEX idx_feed_queues_user_id ON feed_queues(user_id);