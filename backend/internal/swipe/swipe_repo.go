package swipe

import (
	"context"
	"database/sql"

	"github.com/ktaffy/vault/backend/config"
	"github.com/ktaffy/vault/backend/internal/snippet"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
}

type repo struct {
	db     DBTX
	config *config.Config
}

func NewRepo(db DBTX) Repo {
	return &repo{
		db:     db,
		config: config.Load(),
	}
}

func (r *repo) HasUserSwipedSnippet(ctx context.Context, userID, snippetID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM swipes WHERE user_id = $1 AND snippet_id = $2)`
	err := r.db.QueryRowContext(ctx, query, userID, snippetID).Scan(&exists)
	return exists, err
}

func (r *repo) CreateSwipe(ctx context.Context, swipe *Swipe) error {
	query := `INSERT INTO swipes (user_id, snippet_id, action, swiped_at) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, swipe.UserID, swipe.SnippetID, swipe.Action, swipe.SwipedAt)
	return err
}

func (r *repo) GetLikedSnippets(ctx context.Context, userID int64) ([]*snippet.Snippet, error) {
	query := `
		SELECT 
			s.id,
			s.artist_id,
			s.title,
			s.audio_url,
			s.cover_art_url,
			s.duration_seconds,
			s.play_count,
			s.fire_count,
			s.skip_count,
			s.fire_rate,
			s.is_active,
			s.uploaded_at
		FROM swipes sw
		JOIN snippets s ON sw.snippet_id = s.id
		WHERE sw.user_id = $1 AND sw.action = 'fire'
		ORDER BY sw.swiped_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var snippets []*snippet.Snippet
	for rows.Next() {
		s := &snippet.Snippet{}
		err := rows.Scan(
			&s.ID,
			&s.ArtistID,
			&s.Title,
			&s.AudioURL,
			&s.CoverArtURL,
			&s.Duration,
			&s.PlayCount,
			&s.FireCount,
			&s.SkipCount,
			&s.FireRate,
			&s.IsActive,
			&s.UploadedAt,
		)
		if err != nil {
			return nil, err
		}
		snippets = append(snippets, s)
	}

	return snippets, nil
}
