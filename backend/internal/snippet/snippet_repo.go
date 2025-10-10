package snippet

import (
	"context"
	"database/sql"
	"fmt"

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

func (r *repo) UpdateSnippet(ctx context.Context, artistID int64, snippet *Snippet) (*Snippet, error) {
	query := `UPDATE snippets 
              SET title = $1, audio_url = $2, duration_seconds = $3, uploaded_at = CURRENT_TIMESTAMP,
                  play_count = 0, fire_count = 0, skip_count = 0
              WHERE artist_id = $4 
              RETURNING id, artist_id, title, audio_url, duration_seconds, 
                        play_count, fire_count, skip_count, fire_rate, is_active, uploaded_at`

	err := r.db.QueryRowContext(ctx, query,
		snippet.Title,
		snippet.AudioURL,
		snippet.Duration,
		artistID,
	).Scan(
		&snippet.ID,
		&snippet.ArtistID,
		&snippet.Title,
		&snippet.AudioURL,
		&snippet.Duration,
		&snippet.PlayCount,
		&snippet.FireCount,
		&snippet.SkipCount,
		&snippet.FireRate,
		&snippet.IsActive,
		&snippet.UploadedAt,
	)

	if err != nil {
		return nil, err
	}

	return snippet, nil
}

func (r *repo) DeleteSnippet(ctx context.Context, snippetID int64) error {
	query := `DELETE FROM snippets WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, snippetID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no snippet found with id %d", snippetID)
	}

	return nil
}

func (r *repo) GetSnippetByID(ctx context.Context, snippetID int64) (*Snippet, error) {
	s := &Snippet{}
	query := `SELECT id, artist_id, title, audio_url, duration_seconds, 
              play_count, fire_count, skip_count, fire_rate, is_active, uploaded_at 
              FROM snippets WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, snippetID).Scan(
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

func (r *repo) GetAllSnippetsByArtist(ctx context.Context, artistID int64) ([]*Snippet, error) {
	query := `SELECT id, artist_id, title, audio_url, duration_seconds, 
		play_count, fire_count, skip_count, fire_rate, is_active, uploaded_at 
		FROM snippets WHERE artist_id = $1 ORDER BY uploaded_at DESC`

	rows, err := r.db.QueryContext(ctx, query, artistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var snippets []*Snippet
	for rows.Next() {
		s := &Snippet{}
		err := rows.Scan(
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
		snippets = append(snippets, s)
	}

	return snippets, nil
}

func (r *repo) IsSnippetOwnedByArtist(ctx context.Context, snippetID, artistID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM snippets WHERE id = $1 AND artist_id = $2)`
	err := r.db.QueryRowContext(ctx, query, snippetID, artistID).Scan(&exists)
	return exists, err
}
