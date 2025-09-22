package swipe

import (
	"context"
	"time"
)

type Swipe struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	SnippetID int64     `json:"snippet_id" db:"snippet_id"`
	Action    string    `json:"action" db:"action"`
	SwipedAt  time.Time `json:"swiped_at" db:"swiped_at"`
}

type SwipeReq struct {
	SnippetID int64  `json:"snippet_id" binding:"required"`
	Action    string `json:"action" binding:"required,oneof=fire skip"`
}

type SwipeRes struct {
	Success        bool `json:"success"`
	FollowedArtist bool `json:"followed_artist,omitempty"`
}

type Repo interface {
	CreateSwipe(ctx context.Context, swipe *Swipe) error
	HasUserSwipedSnippet(ctx context.Context, userID, snippetID int64) (bool, error)
}

type Service interface {
	RecordSwipe(c context.Context, userID int64, req *SwipeReq) (*SwipeRes, error)
}
