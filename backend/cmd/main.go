package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/ktaffy/vault/backend/db"
	"github.com/ktaffy/vault/backend/internal/user"
	"github.com/ktaffy/vault/backend/router"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or error loading it: %v", err)
	}
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not init db conenction")
	}
	userRep := user.NewRepo(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	port := os.Getenv("SERVER_PORT")

	router.InitRouter(userHandler)
	router.Start(":" + port)
}
