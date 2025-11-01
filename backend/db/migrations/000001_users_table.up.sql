CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_artist" BOOLEAN DEFAULT FALSE,
    "email_verified" BOOLEAN DEFAULT FALSE,
    "profile_bio" TEXT,
    "pfp_url" VARCHAR(500),
    "date_created" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);