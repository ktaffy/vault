package snippet

import (
	"context"
	"time"
)

type Snippet struct {
	ID         int64     `json:"id" db:"id"`
	ArtistID   int64     `json:"artist_id" db:"artist_id"`
	Title      string    `json:"title" db:"title"`
	AudioURL   string    `json:"audio_url" db:"audio_url"`
	Duration   int       `json:"duration_seconds" db:"duration_seconds"`
	PlayCount  int       `json:"play_count" db:"play_count"`
	FireCount  int       `json:"fire_count" db:"fire_count"`
	SkipCount  int       `json:"skip_count" db:"skip_count"`
	FireRate   float64   `json:"fire_rate" db:"fire_rate"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	UploadedAt time.Time `json:"uploaded_at" db:"uploaded_at"`
}

type UploadReq struct {
	Title     string  `json:"title" form:"title" binding:"required,max=100"`
	StartTime float64 `json:"start_time" form:"start_time"`
	EndTime   float64 `json:"end_time" form:"end_time"`
}

type UploadRes struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	AudioURL string `json:"audio_url"`
	Message  string `json:"message"`
}

type UpdateReq struct {
	Title string `json:"title" form:"title" binding:"required,max=100"`
}

type UpdateRes struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	AudioURL string `json:"audio_url"`
	Message  string `json:"message"`
}

type Repo interface {
	CreateSnippet(ctx context.Context, snippet *Snippet) (*Snippet, error)
	GetSnippetByArtistID(ctx context.Context, artistID int64) (*Snippet, error)
	UpdateSnippet(ctx context.Context, artistID int64, snippet *Snippet) (*Snippet, error)
	DeleteSnippet(ctx context.Context, snippetID int64) error
	GetSnippetByID(ctx context.Context, snippetID int64) (*Snippet, error)
	IsSnippetOwnedByArtist(ctx context.Context, snippetID, artistID int64) (bool, error)
	GetAllSnippetsByArtist(ctx context.Context, artistID int64) ([]*Snippet, error)
}

type Service interface {
	UploadSnippet(c context.Context, artistID int64, req *UploadReq, audioFile []byte, filename string) (*UploadRes, error)
	GetSnippet(c context.Context, artistID int64) (*Snippet, error)
	UpdateSnippet(c context.Context, artistID int64, req *UpdateReq, audioFile []byte, filename string) (*UpdateRes, error)
	DeleteSnippet(c context.Context, artistID int64, snippetID int64) error
	GetSnippetByID(c context.Context, snippetID int64) (*Snippet, error)
	GetAllSnippets(c context.Context, artistID int64) ([]*Snippet, error)
}
