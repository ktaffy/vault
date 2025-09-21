package snippet

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ktaffy/vault/backend/config"
	"github.com/ktaffy/vault/backend/util"
)

type service struct {
	Repo
	config  *config.Config
	timeOut time.Duration
}

func NewService(repo Repo) Service {
	return &service{
		Repo:    repo,
		config:  config.Load(),
		timeOut: 5 * time.Second,
	}
}

func (s *service) UploadSnippet(c context.Context, artistID int64, req *UploadReq, audioFile []byte, filename string) (*UploadRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	existingSnippet, err := s.Repo.GetSnippetByArtistID(ctx, artistID)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to check existing snippet: %w", err)
	}
	if existingSnippet != nil {
		return nil, fmt.Errorf("artist already has a snippet uploaded")
	}

	// Validate audio file
	if len(audioFile) == 0 {
		return nil, fmt.Errorf("audio file is required")
	}

	// Get audio duration (you'll need to implement this in util)
	duration, err := util.GetAudioDuration(audioFile)
	if err != nil {
		return nil, fmt.Errorf("failed to get audio duration: %w", err)
	}

	if duration > 15 {
		return nil, fmt.Errorf("audio duration cannot exceed 15 seconds")
	}

	// Upload file to storage (you'll need to implement this in util)
	audioURL, err := util.UploadAudioFile(audioFile, filename)
	if err != nil {
		return nil, fmt.Errorf("failed to upload audio file: %w", err)
	}

	snippet := &Snippet{
		ArtistID: artistID,
		Title:    req.Title,
		AudioURL: audioURL,
		Duration: duration,
	}

	createdSnippet, err := s.Repo.CreateSnippet(ctx, snippet)
	if err != nil {
		return nil, fmt.Errorf("failed to create snippet: %w", err)
	}

	res := &UploadRes{
		ID:       createdSnippet.ID,
		Title:    createdSnippet.Title,
		AudioURL: createdSnippet.AudioURL,
		Message:  "Snippet uploaded successfully",
	}

	return res, nil
}

func (s *service) GetSnippet(c context.Context, artistID int64) (*Snippet, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	snippet, err := s.Repo.GetSnippetByArtistID(ctx, artistID)
	if err != nil {
		return nil, err
	}
	return snippet, nil
}
