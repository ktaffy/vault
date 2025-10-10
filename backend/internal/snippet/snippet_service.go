package snippet

import (
	"context"
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
	ctx, cancel := context.WithTimeout(c, 2*time.Minute)
	defer cancel()

	if err := util.ValidateAudioFile(audioFile, filename); err != nil {
		return nil, err
	}

	trimmedAudio, err := util.TrimAudioFile(audioFile, filename, req.StartTime, req.EndTime)
	if err != nil {
		return nil, fmt.Errorf("failed to trim audio: %w", err)
	}

	audioURL, err := util.UploadAudioFile(trimmedAudio, filename)
	if err != nil {
		return nil, fmt.Errorf("failed to upload audio file: %w", err)
	}

	snippet := &Snippet{
		ArtistID: artistID,
		Title:    req.Title,
		AudioURL: audioURL,
		Duration: 15,
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

func (s *service) UpdateSnippet(c context.Context, artistID int64, req *UpdateReq, audioFile []byte, filename string) (*UpdateRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	existingSnippet, err := s.Repo.GetSnippetByArtistID(ctx, artistID)
	if err != nil {
		return nil, fmt.Errorf("no existing snippet found to update")
	}

	if err := util.ValidateAudioFile(audioFile, filename); err != nil {
		return nil, err
	}

	audioURL, err := util.UploadAudioFile(audioFile, filename)
	if err != nil {
		return nil, fmt.Errorf("failed to upload new audio file: %w", err)
	}

	snippet := &Snippet{
		ArtistID: artistID,
		Title:    req.Title,
		AudioURL: audioURL,
		Duration: 15,
	}

	updatedSnippet, err := s.Repo.UpdateSnippet(ctx, artistID, snippet)
	if err != nil {
		go util.DeleteAudioFile(audioURL)
		return nil, fmt.Errorf("failed to update snippet: %w", err)
	}

	go func() {
		if err := util.DeleteAudioFile(existingSnippet.AudioURL); err != nil {
			fmt.Printf("Warning: failed to delete old audio file %s: %v\n", existingSnippet.AudioURL, err)
		}
	}()

	res := &UpdateRes{
		ID:       updatedSnippet.ID,
		Title:    updatedSnippet.Title,
		AudioURL: updatedSnippet.AudioURL,
		Message:  "Snippet updated successfully",
	}

	return res, nil
}

func (s *service) DeleteSnippet(c context.Context, artistID, snippetID int64) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	isOwner, err := s.Repo.IsSnippetOwnedByArtist(ctx, snippetID, artistID)
	if err != nil {
		return fmt.Errorf("failed to verify snippet ownership: %w", err)
	}
	if !isOwner {
		return fmt.Errorf("unauthorized: snippet does not belong to this artist")
	}

	existingSnippet, err := s.Repo.GetSnippetByID(ctx, snippetID)
	if err != nil {
		return fmt.Errorf("snippet not found")
	}

	err = s.Repo.DeleteSnippet(ctx, snippetID)
	if err != nil {
		return fmt.Errorf("failed to delete snippet from database: %w", err)
	}

	go func() {
		if err := util.DeleteAudioFile(existingSnippet.AudioURL); err != nil {
			fmt.Printf("Warning: failed to delete audio file %s: %v\n", existingSnippet.AudioURL, err)
		}
	}()

	return nil
}

func (s *service) GetSnippetByID(c context.Context, snippetID int64) (*Snippet, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	snippet, err := s.Repo.GetSnippetByID(ctx, snippetID)
	if err != nil {
		return nil, fmt.Errorf("snippet not found")
	}

	return snippet, nil
}

func (s *service) GetAllSnippets(c context.Context, artistID int64) ([]*Snippet, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	snippets, err := s.Repo.GetAllSnippetsByArtist(ctx, artistID)
	if err != nil {
		return nil, err
	}
	return snippets, nil
}
