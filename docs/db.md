# POSSIBLE DB SCHEMA WILL BE ADJUSTED AS FEATURES GET DONE

```
-- CORE USER MANAGEMENT
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_artist BOOLEAN DEFAULT FALSE,
    global_rep_score INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_bio TEXT,
    profile_picture_url VARCHAR(500),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

```
-- COMMUNITIES (Artist-owned groups)
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_type VARCHAR(20) CHECK (access_type IN ('open', 'invite_only', 'application')) DEFAULT 'open',
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```
```
-- COMMUNITY MEMBERSHIP
CREATE TABLE community_members (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('member', 'moderator', 'owner')) DEFAULT 'member',
    rep_score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(community_id, user_id)
);
```
```
-- COMMUNITY TAGS (Created by artists/mods)
CREATE TABLE community_tags (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_color VARCHAR(7), -- Hex color code
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, tag_name)
);
```
```
-- TAG PERMISSIONS (Who can use which tags)
CREATE TABLE tag_permissions (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER REFERENCES community_tags(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('member', 'moderator', 'owner', 'artist_only')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- POSTS
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES community_tags(id),
    title VARCHAR(500),
    content TEXT,
    post_type VARCHAR(20) CHECK (post_type IN ('text', 'image', 'video', 'audio', 'mixed', 'snippet')) NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    visibility_score INTEGER DEFAULT 0, -- Calculated field for feed algorithm
    requires_approval BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- For community champions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- POST REACTIONS (Upvotes, Downvotes)
CREATE TABLE post_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) CHECK (reaction_type IN ('upvote', 'downvote')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);
```
```
-- POST REPLIES
CREATE TABLE post_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    parent_reply_id INTEGER REFERENCES post_replies(id), -- For nested replies
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- EVENTS
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    event_type VARCHAR(30) CHECK (event_type IN ('listening_party', 'beat_battle', 'cover_art_challenge', 'random_call')) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_participants INTEGER,
    rep_distribution_rules JSONB, -- Flexible rules storage
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- EVENT PARTICIPANTS
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    participation_time INTEGER DEFAULT 0, -- In minutes
    rep_earned INTEGER DEFAULT 0,
    submission_url VARCHAR(500), -- For beat battles, art challenges
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);
```
```
-- MUSIC SNIPPETS (Artist uploads)
CREATE TABLE music_snippets (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    audio_url VARCHAR(500) NOT NULL,
    duration INTEGER, -- In seconds
    genre VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- USER LISTENING HISTORY (For recommendations)
CREATE TABLE listening_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    snippet_id INTEGER REFERENCES music_snippets(id) ON DELETE CASCADE,
    listen_duration INTEGER, -- How long they listened in seconds
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- RECOMMENDATIONS
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recommended_artist_id INTEGER REFERENCES users(id),
    recommended_community_id INTEGER REFERENCES communities(id),
    recommendation_score DECIMAL(5,2),
    recommendation_type VARCHAR(20) CHECK (recommendation_type IN ('artist', 'community', 'snippet')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- COMMUNITY INVITES
CREATE TABLE community_invites (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    invited_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(50) UNIQUE,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- DIRECT MESSAGES
CREATE TABLE direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- USER BADGES/ACHIEVEMENTS
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE, -- NULL for global badges
    badge_type VARCHAR(50) NOT NULL, -- 'active_member', 'valued_contributor', 'community_champion', etc.
    badge_level VARCHAR(20), -- 'bronze', 'silver', 'gold', etc.
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
-- INDEXES for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility_score ON posts(visibility_score DESC);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_events_community_id ON events(community_id);
CREATE INDEX idx_events_start_time ON events(start_time);
```