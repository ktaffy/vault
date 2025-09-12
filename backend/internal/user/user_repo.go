package user

import (
	"context"
	"database/sql"
	"time"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
	BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)
}

type repo struct {
	db DBTX
}

func NewRepo(db DBTX) Repo {
	return &repo{db: db}
}

func (r *repo) CreateUser(ctx context.Context, user *User) (*User, error) {
	var lastInsertId int
	query := "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) returning id"
	err := r.db.QueryRowContext(ctx, query, user.Username, user.Password, user.Email).Scan(&lastInsertId)
	if err != nil {
		return nil, err
	}
	user.ID = int64(lastInsertId)
	return user, nil
}

func (r *repo) GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error) {
	u := User{}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	query := "SELECT id, email, username, password FROM users WHERE email = $1 OR username = $1"
	err = r.db.QueryRowContext(ctx, query, identifier).Scan(
		&u.ID,
		&u.Email,
		&u.Username,
		&u.Password,
	)
	if err != nil {
		return nil, err
	}

	updateQuery := "UPDATE users SET last_login = $1 WHERE id = $2"
	_, err = tx.ExecContext(ctx, updateQuery, time.Now(), u.ID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &u, nil
}
