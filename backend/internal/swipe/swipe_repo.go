package swipe

import (
	"context"
	"database/sql"

	"github.com/ktaffy/vault/backend/config"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
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
