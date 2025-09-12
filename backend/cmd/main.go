package main

import (
	"log"

	"github.com/ktaffy/vault/backend/db"
	"github.com/ktaffy/vault/backend/internal/user"
	"github.com/ktaffy/vault/backend/router"
)

func main() {
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not init db conenction")
	}
	userRep := user.NewRepo(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	router.InitRouter(userHandler)
	router.Start(":8080")
}
