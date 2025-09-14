package user

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/ktaffy/vault/backend/config"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
	BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)
}

type repo struct {
	db     DBTX
	config *config.Config
}

func NewRepo(db DBTX) Repo {
	return &repo{db: db, config: config.Load()}
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

func (r *repo) GetUserByID(ctx context.Context, userID int64) (*User, error) {
	u := User{}
	query := "SELECT id, email, username, password FROM users WHERE id = $1"
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&u.ID, &u.Email, &u.Username, &u.Password)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repo) GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error) {
	u := User{}
	query := "SELECT id, email, username, password FROM users WHERE email = $1 OR username = $1"
	err := r.db.QueryRowContext(ctx, query, identifier).Scan(&u.ID, &u.Email, &u.Username, &u.Password)
	if err != nil {
		return nil, err
	}

	r.db.ExecContext(ctx, "UPDATE users SET last_login = NOW() WHERE id = $1", u.ID)
	return &u, nil
}

func (r *repo) UpdateUser(ctx context.Context, userID int64, updates map[string]interface{}) (*User, error) {
	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1
	for field, value := range updates {
		setParts = append(setParts, fmt.Sprintf("%s = $%d", field, argIndex))
		args = append(args, value)
		argIndex++
	}
	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d RETURNING id, username, email, profile_bio, pfp_url", strings.Join(setParts, ", "), argIndex)
	args = append(args, userID)
	u := &User{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&u.ID, &u.Username, &u.Email, &u.ProfileBio, &u.PfpUrl)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *repo) ToggleArtist(ctx context.Context, userID int64) error {
	query := `UPDATE users SET is_artist = NOT is_artist WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return err
	}
	return nil
}

// Repo Token Methods
func (r *repo) StoreRefreshToken(ctx context.Context, userID int64, tokenHash string) error {
	r.db.ExecContext(ctx, `
		DELETE FROM refresh_tokens
		WHERE user_id = $1 AND id NOT IN (
			SELECT id FROM refresh_tokens
			WHERE user_id = $1
			ORDER BY last_used DESC
			LIMIT 4
		)`, userID)
	query := `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
		VALUES ($1, $2, $3)`
	_, err := r.db.ExecContext(ctx, query, userID, tokenHash, time.Now().Add(r.config.RefreshTokenDuration))
	return err
}

func (r *repo) ValidateRefreshToken(ctx context.Context, tokenHash string) (int64, error) {
	var userID int64
	query := `SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()`
	err := r.db.QueryRowContext(ctx, query, tokenHash).Scan(&userID)
	if err != nil {
		return 0, err
	}
	updateQuery := "UPDATE refresh_tokens SET last_used = NOW() WHERE token_hash = $1"
	r.db.ExecContext(ctx, updateQuery, tokenHash)
	return userID, nil
}

func (r *repo) RevokeUserTokens(ctx context.Context, userID int64) error {
	query := "DELETE FROM refresh_tokens WHERE user_id = $1"
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
