package db

import (
	"github.com/jmoiron/sqlx"
	"github.com/ktaffy/vault/backend/config"
	_ "github.com/lib/pq"
)

type Database struct {
	db *sqlx.DB
}

func NewDatabase() (*Database, error) {
	cfg := config.Load()
	db, err := sqlx.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	return &Database{db: db}, nil
}

func (d *Database) Close() {
	d.db.Close()
}

func (d *Database) GetDB() *sqlx.DB {
	return d.db
}
