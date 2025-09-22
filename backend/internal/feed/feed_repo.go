package feed

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

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

func (r *repo) GetAvailableSnippets(ctx context.Context, userID int64) ([]*FeedItem, error) {
	query := `
		SELECT s.id, s.artist_id, u.username, s.title, s.audio_url, 
			   s.duration_seconds, s.play_count, s.fire_count, s.fire_rate, s.uploaded_at
		FROM snippets s
		JOIN users u ON s.artist_id = u.id
		WHERE s.is_active = TRUE 
		  AND s.artist_id != $1
		  AND s.id NOT IN (
			  SELECT snippet_id FROM swipes WHERE user_id = $1
		  )`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var snippets []*FeedItem
	for rows.Next() {
		item := &FeedItem{}
		err := rows.Scan(
			&item.SnippetID, &item.ArtistID, &item.ArtistName,
			&item.Title, &item.AudioURL, &item.Duration,
			&item.PlayCount, &item.FireCount, &item.FireRate, &item.UploadedAt,
		)
		if err != nil {
			return nil, err
		}
		snippets = append(snippets, item)
	}

	return snippets, nil
}

func (r *repo) GetUserSwipeCount(ctx context.Context, userID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM swipes WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}

func (r *repo) GetUserFiredArtists(ctx context.Context, userID int64) ([]int64, error) {
	query := `
		SELECT DISTINCT s.artist_id 
		FROM swipes sw
		JOIN snippets s ON sw.snippet_id = s.id
		WHERE sw.user_id = $1 AND sw.action = 'fire'`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artistIDs []int64
	for rows.Next() {
		var artistID int64
		if err := rows.Scan(&artistID); err != nil {
			return nil, err
		}
		artistIDs = append(artistIDs, artistID)
	}

	return artistIDs, nil
}

func (r *repo) GetSimilarArtists(ctx context.Context, artistIDs []int64) ([]int64, error) {
	if len(artistIDs) == 0 {
		return []int64{}, nil
	}

	placeholders := make([]string, len(artistIDs))
	args := make([]interface{}, len(artistIDs))
	for i, id := range artistIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT DISTINCT artist_b 
		FROM artist_similarities 
		WHERE artist_a IN (%s) AND similarity_score > 0.3
		ORDER BY similarity_score DESC
		LIMIT 50`, strings.Join(placeholders, ","))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var similarArtists []int64
	for rows.Next() {
		var artistID int64
		if err := rows.Scan(&artistID); err != nil {
			return nil, err
		}
		similarArtists = append(similarArtists, artistID)
	}

	return similarArtists, nil
}
