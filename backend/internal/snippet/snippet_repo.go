package snippet

import (
	"context"
	"database/sql"

	"github.com/ktaffy/vault/backend/config"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
	BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)
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

func (r *repo) CreateSnippet(ctx context.Context, snippet *Snippet) (*Snippet, error) {
	var lastInsertID int64
	query := `INSERT INTO snippets(artist_id, title, audio_url, duration_seconds) VALUES ($1, $2, $3, $4) RETURNING id`
	err := r.db.QueryRowContext(ctx, query,
		snippet.ArtistID,
		snippet.Title,
		snippet.AudioURL,
		snippet.Duration,
	).Scan(&lastInsertID)

	if err != nil {
		return nil, err
	}

	snippet.ID = lastInsertID
	return snippet, nil
}

func (r *repo) GetSnippetByArtistID(ctx context.Context, artistID int64) (*Snippet, error) {
	s := &Snippet{}
	query := `SELECT id, artist_id, title, audio_url, duration_seconds, 
		play_count, fire_count, skip_count, fire_rate, is_active, uploaded_at 
		FROM snippets WHERE artist_id = $1`
	err := r.db.QueryRowContext(ctx, query, artistID).Scan(
		&s.ID,
		&s.ArtistID,
		&s.Title,
		&s.AudioURL,
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

	return s, nil
}
