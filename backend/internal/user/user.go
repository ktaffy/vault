package user

import "context"

type User struct {
	ID       int64  `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
	IsArtist string `json:"is_artist" db:"is_artist"`
}

type CreateUserReq struct {
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

type CreateUserRes struct {
	ID       string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
}

type LoginUserReq struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password" db:"password"`
}

type LoginUserRes struct {
	AccessToken string   `json:"access_token"`
	ExpiresIn   int      `json:"expires_in"`
	User        UserInfo `json:"user"`
}

type UserInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type Repo interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
	GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error)
	StoreRefreshToken(ctx context.Context, userID int64, tokenHash string) error
	ValidateRefreshToken(ctx context.Context, tokenHash string) (int64, error)
	RevokeUserTokens(ctx context.Context, userID int64) error
}

type Service interface {
	CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error)
	Login(c context.Context, req *LoginUserReq) (*LoginUserRes, string, error)
	RefreshAccess(c context.Context, refreshToken string) (*LoginUserRes, string, error)
	Logout(c context.Context, refreshToken string) error
}
