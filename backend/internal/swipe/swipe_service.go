package swipe

import (
	"context"
	"fmt"
	"time"

	"github.com/ktaffy/vault/backend/config"
	"github.com/ktaffy/vault/backend/internal/snippet"
	"github.com/ktaffy/vault/backend/internal/user"
)

type service struct {
	swipeRepo   Repo
	userRepo    user.Repo
	snippetRepo snippet.Repo
	config      *config.Config
	timeOut     time.Duration
}

func NewService(swipeRepo Repo, userRepo user.Repo, snippetRepo snippet.Repo) Service {
	return &service{
		swipeRepo:   swipeRepo,
		userRepo:    userRepo,
		snippetRepo: snippetRepo,
		config:      config.Load(),
		timeOut:     5 * time.Second,
	}
}

func (s *service) RecordSwipe(c context.Context, userID int64, req *SwipeReq) (*SwipeRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	_, err := s.snippetRepo.GetSnippetByID(ctx, req.SnippetID)
	if err != nil {
		return nil, err
	}

	hasSwiper, err := s.swipeRepo.HasUserSwipedSnippet(ctx, userID, req.SnippetID)
	if err != nil {
		return nil, err
	}
	if hasSwiper {
		return nil, fmt.Errorf("already swiped this snippet")
	}

	swipe := &Swipe{
		UserID:    userID,
		SnippetID: req.SnippetID,
		Action:    req.Action,
		SwipedAt:  time.Now(),
	}

	err = s.swipeRepo.CreateSwipe(ctx, swipe)
	if err != nil {
		return nil, err
	}

	res := &SwipeRes{
		Success: true,
	}

	// db trigger handles updates and follows

	if req.Action == "fire" {
		res.FollowedArtist = true
	}

	return res, nil
}

func (s *service) GetLikedSnippets(c context.Context, userID int64) ([]*snippet.Snippet, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	snippets, err := s.swipeRepo.GetLikedSnippets(ctx, userID)
	if err != nil {
		return nil, err
	}

	return snippets, nil
}
