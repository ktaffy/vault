package jobs

import (
	"context"
	"log"
	"time"

	"github.com/ktaffy/vault/backend/db"
	"github.com/ktaffy/vault/backend/internal/feed"
)

type JobManager struct {
	db      *db.Database
	feedSvc feed.Service
}

func NewJobManager(db *db.Database, feedService feed.Service) *JobManager {
	return &JobManager{
		db:      db,
		feedSvc: feedService,
	}
}

func (jm *JobManager) Start() {
	log.Println("Starting background jobs...")

	// sim calc every 6 hrs
	go jm.runPeriodically("similarity-calculation", 6*time.Hour, jm.calculateSimilarities)

	// token cleanup every 24 hrs
	go jm.runPeriodically("token-cleanup", 24*time.Hour, jm.cleanupExpiredTokens)

	// queue db cleanup every 1 hour
	go jm.runPeriodically("queue-cleanup", 1*time.Hour, jm.cleanupOldQueues)
}

func (jm *JobManager) runPeriodically(jobName string, interval time.Duration, jobFunc func()) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	log.Printf("Running %s job...", jobName)
	jobFunc()

	for range ticker.C {
		log.Printf("Running %s job...", jobName)
		jobFunc()
	}
}

func (jm *JobManager) calculateSimilarities() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()

	_, err := jm.db.GetDB().ExecContext(ctx, "SELECT calculate_similarities()")
	if err != nil {
		log.Printf("Error calculating similarities: %v", err)
		return
	}

	log.Println("Artist similarities calculated successfully")
}

func (jm *JobManager) cleanupExpiredTokens() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	_, err := jm.db.GetDB().ExecContext(ctx, "SELECT cleanup_expired_tokens()")
	if err != nil {
		log.Printf("Error cleaning up expired tokens: %v", err)
		return
	}

	_, err = jm.db.GetDB().ExecContext(ctx, `
		DELETE FROM email_tokens WHERE expires_at < NOW()`)
	if err != nil {
		log.Printf("Error cleaning up expired email tokens: %v", err)
		return
	}

	_, err = jm.db.GetDB().ExecContext(ctx, `
		DELETE FROM password_tokens WHERE expires_at < NOW()`)
	if err != nil {
		log.Printf("Error cleaning up expired password tokens: %v", err)
		return
	}

	log.Println("Expired tokens cleaned up successfully")
}

func (jm *JobManager) cleanupOldQueues() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	_, err := jm.db.GetDB().ExecContext(ctx, `
		DELETE FROM feed_queues WHERE created_at < NOW() - INTERVAL '24 hours'`)
	if err != nil {
		log.Printf("Error cleaning up old queues: %v", err)
		return
	}

	log.Println("Old queue entries cleaned up successfully")
}

// Manual job triggers for admin use
func (jm *JobManager) TriggerSimilarityCalculation() error {
	go jm.calculateSimilarities()
	return nil
}

func (jm *JobManager) RefreshUserQueue(userID int64) error {
	ctx := context.Background()
	return jm.feedSvc.RefillUserQueue(ctx, userID)
}
