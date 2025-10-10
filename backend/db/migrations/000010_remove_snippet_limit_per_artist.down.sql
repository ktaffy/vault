-- Re-add the UNIQUE constraint (only if rolling back)
-- WARNING: This will fail if there are multiple snippets per artist
ALTER TABLE snippets ADD CONSTRAINT snippets_artist_id_key UNIQUE (artist_id);