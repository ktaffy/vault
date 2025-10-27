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

	if swipeCount < 20 {
		availableSnippets, err := s.Repo.GetAvailableSnippets(ctx, userID)
		if err != nil {
			return nil, err
		}
		if len(availableSnippets) == 0 {
			return &NextSnippetRes{Message: "No more snippets available"}, nil
		}

		randomSnippet := availableSnippets[rand.Intn(len(availableSnippets))]
		return &NextSnippetRes{Snippet: randomSnippet}, nil
	}

	queueSize, err := s.Repo.GetUserQueueSize(ctx, userID)
	if err != nil {
		return nil, err
	}

	if queueSize == 0 {
		err = s.RefillUserQueue(ctx, userID)
		if err != nil {
			return nil, err
		}
	} else if queueSize <= 3 {
		go func() {
			bgCtx := context.Background()
			s.RefillUserQueue(bgCtx, userID)
		}()
	}

	nextSnippet, err := s.Repo.GetNextFromQueue(ctx, userID)
	if err != nil {
		return s.generateSnippetRealTime(ctx, userID)
	}

	go func() {
		bgCtx := context.Background()
		s.Repo.RemoveFromQueue(bgCtx, userID, nextSnippet.SnippetID)
	}()

	return &NextSnippetRes{Snippet: nextSnippet}, nil
}

func (s *service) RefillUserQueue(c context.Context, userID int64) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	availableSnippets, err := s.Repo.GetAvailableSnippets(ctx, userID)
	if err != nil {
		return err
	}

	if len(availableSnippets) == 0 {
		return nil
	}

	candidates := s.selectCandidates(ctx, availableSnippets, userID)
	if len(candidates) == 0 {
		return nil
	}

	scoredSnippets := s.scoreAndSortCandidates(ctx, candidates, userID)

	queueSnippets := scoredSnippets
	if len(queueSnippets) > 10 {
		queueSnippets = queueSnippets[:10]
	}

	return s.Repo.AddToQueue(ctx, userID, queueSnippets)
}

func (s *service) scoreAndSortCandidates(ctx context.Context, candidates []*FeedItem, userID int64) []*FeedItem {
	if len(candidates) <= 1 {
		return candidates
	}

	firedArtists, _ := s.Repo.GetUserFiredArtists(ctx, userID)
	similarArtists, _ := s.Repo.GetSimilarArtists(ctx, firedArtists)

	similarArtistMap := make(map[int64]bool)
	for _, artistID := range similarArtists {
		similarArtistMap[artistID] = true
	}

	type scoredSnippet struct {
		snippet *FeedItem
		score   float64
	}

	var scored []scoredSnippet
	for _, candidate := range candidates {
		score := s.calculateScore(candidate, similarArtistMap)
		scored = append(scored, scoredSnippet{
			snippet: candidate,
			score:   score,
		})
	}

	for i := 0; i < len(scored)-1; i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].score > scored[i].score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}

	var result []*FeedItem
	for _, item := range scored {
		result = append(result, item.snippet)
	}

	return result
}

func (s *service) generateSnippetRealTime(ctx context.Context, userID int64) (*NextSnippetRes, error) {
	availableSnippets, err := s.Repo.GetAvailableSnippets(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(availableSnippets) == 0 {
		return &NextSnippetRes{Message: "No more snippets available"}, nil
	}

	candidates := s.selectCandidates(ctx, availableSnippets, userID)
	if len(candidates) == 0 {
		randomSnippet := availableSnippets[rand.Intn(len(availableSnippets))]
		return &NextSnippetRes{Snippet: randomSnippet}, nil
	}

	scoredSnippets := s.scoreAndSortCandidates(ctx, candidates, userID)
	if len(scoredSnippets) == 0 {
		randomSnippet := availableSnippets[rand.Intn(len(availableSnippets))]
		return &NextSnippetRes{Snippet: randomSnippet}, nil
	}
	bestSnippet := scoredSnippets[0]
	return &NextSnippetRes{Snippet: bestSnippet}, nil
}

func (s *service) selectCandidates(ctx context.Context, available []*FeedItem, userID int64) []*FeedItem {
	if len(available) <= 100 {
		return available
	}

	firedArtists, err := s.Repo.GetUserFiredArtists(ctx, userID)
	if err != nil {
		firedArtists = []int64{}
	}

	similarArtists, err := s.Repo.GetSimilarArtists(ctx, firedArtists)
	if err != nil {
		similarArtists = []int64{}
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
