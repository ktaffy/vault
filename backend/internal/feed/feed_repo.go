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
		AND s.id NOT IN (
			SELECT snippet_id 
			FROM swipes 
			WHERE user_id = $1 
				AND swiped_at > NOW() - INTERVAL '5 minutes'
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

func (r *repo) GetUserQueueSize(ctx context.Context, userID int64) (int, error) {
	var count int
	query := "SELECT COUNT(*) FROM feed_queues WHERE user_id = $1"
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}

func (r *repo) GetNextFromQueue(ctx context.Context, userID int64) (*FeedItem, error) {
	query := `
        SELECT fq.snippet_id, s.artist_id, u.username, s.title, s.audio_url,
               s.duration_seconds, s.play_count, s.fire_count, s.fire_rate, s.uploaded_at
        FROM feed_queues fq
        JOIN snippets s ON fq.snippet_id = s.id
        JOIN users u ON s.artist_id = u.id
        WHERE fq.user_id = $1
        ORDER BY fq.position ASC
        LIMIT 1`

	item := &FeedItem{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&item.SnippetID, &item.ArtistID, &item.ArtistName,
		&item.Title, &item.AudioURL, &item.Duration,
		&item.PlayCount, &item.FireCount, &item.FireRate, &item.UploadedAt,
	)

	if err != nil {
		return nil, err
	}

	return item, nil
}

func (r *repo) RemoveFromQueue(ctx context.Context, userID int64, snippetID int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`DELETE FROM feed_queues WHERE user_id = $1 AND snippet_id = $2`,
		userID, snippetID)
	if err != nil {
		return err
	}

	// Reorder positions to fill the gap
	_, err = tx.ExecContext(ctx, `
        UPDATE feed_queues 
        SET position = position - 1 
        WHERE user_id = $1 AND position > (
            SELECT COALESCE(MAX(position), 0) 
            FROM feed_queues 
            WHERE user_id = $1
        )`, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *repo) AddToQueue(ctx context.Context, userID int64, snippets []*FeedItem) error {
	if len(snippets) == 0 {
		return nil
	}

	var maxPos int
	err := r.db.QueryRowContext(ctx,
		`SELECT COALESCE(MAX(position), 0) FROM feed_queues WHERE user_id = $1`,
		userID).Scan(&maxPos)
	if err != nil {
		return err
	}

	for i, snippet := range snippets {
		position := maxPos + i + 1
		_, err := r.db.ExecContext(ctx, `
            INSERT INTO feed_queues (user_id, snippet_id, position) 
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, snippet_id) DO NOTHING`,
			userID, snippet.SnippetID, position)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *repo) ClearUserQueue(ctx context.Context, userID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM feed_queues WHERE user_id = $1`, userID)
	return err
}
