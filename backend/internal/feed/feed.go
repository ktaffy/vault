package feed

import (
	"context"
	"time"
)

type FeedItem struct {
	ID         int64     `json:"id" db:"id"`
	SnippetID  int64     `json:"snippet_id" db:"snippet_id"`
	ArtistID   int64     `json:"artist_id" db:"artist_id"`
	ArtistName string    `json:"artist_name" db:"artist_name"`
	Title      string    `json:"title" db:"title"`
	AudioURL   string    `json:"audio_url" db:"audio_url"`
	Duration   int       `json:"duration_seconds" db:"duration_seconds"`
	PlayCount  int       `json:"play_count" db:"play_count"`
	FireCount  int       `json:"fire_count" db:"fire_count"`
	FireRate   float64   `json:"fire_rate" db:"fire_rate"`
	UploadedAt time.Time `json:"uploaded_at" db:"uploaded_at"`
}

type NextSnippetRes struct {
	Snippet *FeedItem `json:"snippet"`
	Message string    `json:"message,omitempty"`
}

type Repo interface {
	GetAvailableSnippets(ctx context.Context, userID int64) ([]*FeedItem, error)
	GetUserSwipeCount(ctx context.Context, userID int64) (int, error)
	GetUserFiredArtists(ctx context.Context, userID int64) ([]int64, error)
	GetSimilarArtists(ctx context.Context, artistIDs []int64) ([]int64, error)
	GetUserQueueSize(ctx context.Context, userID int64) (int, error)
	GetNextFromQueue(ctx context.Context, userID int64) (*FeedItem, error)
	RemoveFromQueue(ctx context.Context, userID int64, snippetID int64) error
	AddToQueue(ctx context.Context, userID int64, snippets []*FeedItem) error
	ClearUserQueue(ctx context.Context, userID int64) error
}

type Service interface {
	GetNextSnippet(c context.Context, userID int64) (*NextSnippetRes, error)
	RefillUserQueue(c context.Context, userID int64) error
}
