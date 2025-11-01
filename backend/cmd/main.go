package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/ktaffy/vault/backend/db"
	"github.com/ktaffy/vault/backend/internal/feed"
	"github.com/ktaffy/vault/backend/internal/snippet"
	"github.com/ktaffy/vault/backend/internal/swipe"
	"github.com/ktaffy/vault/backend/internal/user"
	"github.com/ktaffy/vault/backend/jobs"
	"github.com/ktaffy/vault/backend/router"
	"github.com/ktaffy/vault/backend/util"
)

func main() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "local"
	}
	if env == "local" {
		envFile := fmt.Sprintf(".env.%s", env)
		if err := godotenv.Load(envFile); err != nil {
			log.Fatalf("No %s file found or error loading it: %v", envFile, err)
		}
		log.Printf("Loaded environment from file: %s", env)
	} else {
		log.Printf("Running in %s environment - using system environment variables", env)
	}
	if err := util.InitS3(); err != nil {
		log.Fatalf("Could not init S3: %v", err)
	}
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not init db conenction")
	}
	// User Module
	userRep := user.NewRepo(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	// Snippet Module
	snipRep := snippet.NewRepo(dbConn.GetDB())
	snipSvc := snippet.NewService(snipRep)
	snipHandler := snippet.NewHandler(snipSvc)

	// Swipe Module
	swipeRep := swipe.NewRepo(dbConn.GetDB())
	swipeSvc := swipe.NewService(swipeRep, userRep, snipRep)
	swipeHandler := swipe.NewHandler(swipeSvc)

	// Feed module
	feedRep := feed.NewRepo(dbConn.GetDB())
	feedSvc := feed.NewService(feedRep)
	feedHandler := feed.NewHandler(feedSvc)

	// Background jobs
	jobManager := jobs.NewJobManager(dbConn, feedSvc)
	jobManager.Start()

	port := os.Getenv("SERVER_PORT")

	router.InitRouter(env, userHandler, snipHandler, swipeHandler, feedHandler)
	router.Start(":" + port)
}
