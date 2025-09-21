package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/ktaffy/vault/backend/db"
	"github.com/ktaffy/vault/backend/internal/snippet"
	"github.com/ktaffy/vault/backend/internal/user"
	"github.com/ktaffy/vault/backend/router"
	"github.com/ktaffy/vault/backend/util"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("No .env file found or error loading it: %v", err)
	}
	if err := util.InitS3(); err != nil {
		log.Fatalf("Could not init S3: %v", err)
	}
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not init db conenction")
	}
	userRep := user.NewRepo(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	snipRep := snippet.NewRepo(dbConn.GetDB())
	snipSvc := snippet.NewService(snipRep)
	snipHandler := snippet.NewHandler(snipSvc)

	port := os.Getenv("SERVER_PORT")

	router.InitRouter(userHandler, snipHandler)
	router.Start(":" + port)
}
