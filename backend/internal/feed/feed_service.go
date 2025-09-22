package feed

import (
	"context"
	"math"
	"math/rand"
	"time"

	"github.com/ktaffy/vault/backend/config"
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

func (s *service) GetNextSnippet(c context.Context, userID int64) (*NextSnippetRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	swipeCount, err := s.Repo.GetUserSwipeCount(ctx, userID)
	if err != nil {
		return nil, err
	}

	availableSnippets, err := s.Repo.GetAvailableSnippets(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(availableSnippets) == 0 {
		return &NextSnippetRes{
			Message: "No more snippets available",
		}, nil
	}

	// Phase 1: Random for first 20 swipes
	if swipeCount < 20 {
		randomSnippet := availableSnippets[rand.Intn(len(availableSnippets))]
		return &NextSnippetRes{
			Snippet: randomSnippet,
		}, nil
	}

	// Phase 2/3: Candidate selection + scoring
	candidates := s.selectCandidates(ctx, availableSnippets, userID)
	if len(candidates) == 0 {
		// Fallback to random if no candidates
		randomSnippet := availableSnippets[rand.Intn(len(availableSnippets))]
		return &NextSnippetRes{
			Snippet: randomSnippet,
		}, nil
	}

	bestSnippet := s.scoreAndRankCandidates(ctx, candidates, userID)
	return &NextSnippetRes{
		Snippet: bestSnippet,
	}, nil
}

func (s *service) selectCandidates(ctx context.Context, available []*FeedItem, userID int64) []*FeedItem {
	if len(available) <= 100 {
		return available
	}

	firedArtists, err := s.Repo.GetUserFiredArtists(ctx, userID)
	if err != nil {
		firedArtists = []int64{} // Continue without similarity matching
	}

	similarArtists, err := s.Repo.GetSimilarArtists(ctx, firedArtists)
	if err != nil {
		similarArtists = []int64{} // Continue without similarity matching
	}

	similarArtistMap := make(map[int64]bool)
	for _, artistID := range similarArtists {
		similarArtistMap[artistID] = true
	}

	var candidates []*FeedItem

	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	for _, snippet := range available {
		if snippet.UploadedAt.After(thirtyDaysAgo) && len(candidates) < 40 {
			candidates = append(candidates, snippet)
		}
	}

	for _, snippet := range available {
		if snippet.FireRate > 0.3 && len(candidates) < 70 {
			candidates = append(candidates, snippet)
		}
	}

	for _, snippet := range available {
		if similarArtistMap[snippet.ArtistID] && len(candidates) < 90 {
			candidates = append(candidates, snippet)
		}
	}

	for _, snippet := range available {
		if len(candidates) >= 100 {
			break
		}
		alreadyAdded := false
		for _, candidate := range candidates {
			if candidate.SnippetID == snippet.SnippetID {
				alreadyAdded = true
				break
			}
		}
		if !alreadyAdded {
			candidates = append(candidates, snippet)
		}
	}

	return candidates
}

func (s *service) scoreAndRankCandidates(ctx context.Context, candidates []*FeedItem, userID int64) *FeedItem {
	if len(candidates) == 1 {
		return candidates[0]
	}

	firedArtists, _ := s.Repo.GetUserFiredArtists(ctx, userID)
	similarArtists, _ := s.Repo.GetSimilarArtists(ctx, firedArtists)

	similarArtistMap := make(map[int64]bool)
	for _, artistID := range similarArtists {
		similarArtistMap[artistID] = true
	}

	bestSnippet := candidates[0]
	bestScore := s.calculateScore(bestSnippet, similarArtistMap)

	for _, candidate := range candidates[1:] {
		score := s.calculateScore(candidate, similarArtistMap)
		if score > bestScore {
			bestScore = score
			bestSnippet = candidate
		}
	}

	return bestSnippet
}

func (s *service) calculateScore(snippet *FeedItem, userTasteMap map[int64]bool) float64 {
	tasteScore := 0.0
	if userTasteMap[snippet.ArtistID] {
		tasteScore = 1.0
	}

	popularityScore := snippet.FireRate
	if snippet.FireCount > 100 {
		popularityScore += 0.2
	}
	if popularityScore > 1.0 {
		popularityScore = 1.0
	}

	daysSinceUpload := time.Since(snippet.UploadedAt).Hours() / 24
	recencyScore := math.Max(0, 1.0-daysSinceUpload/30.0)

	finalScore := (tasteScore * 0.5) + (popularityScore * 0.3) + (recencyScore * 0.2)

	return finalScore
}
