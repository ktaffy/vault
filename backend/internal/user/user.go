package user

import "context"

type User struct {
	ID         int64   `json:"id" db:"id"`
	Username   string  `json:"username" db:"username"`
	Email      string  `json:"email" db:"email"`
	Password   string  `json:"password" db:"password"`
	IsArtist   string  `json:"is_artist" db:"is_artist"`
	ProfileBio *string `json:"profile_bio" db:"profile_bio"`
	PfpUrl     *string `json:"pfp_url" db:"pfp_url"`
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

type UpdateProfileReq struct {
	Username   string `json:"username,omitempty" db:"username,omitempty"`
	Email      string `json:"email,omitempty" db:"email,omitempty"`
	ProfileBio string `json:"profile_bio,omitempty" db:"profile_bio,omitempty"`
	PfpUrl     string `json:"pfp_url,omitempty" db:"pfp_url,omitempty"`
}

type UpdateProfileRes struct {
	Message string   `json:"message"`
	User    UserInfo `json:"user"`
}

type Repo interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
	GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error)
	StoreRefreshToken(ctx context.Context, userID int64, tokenHash string) error
	ValidateRefreshToken(ctx context.Context, tokenHash string) (int64, error)
	RevokeUserTokens(ctx context.Context, userID int64) error
	UpdateUser(ctx context.Context, userID int64, updates map[string]interface{}) (*User, error)
}

type Service interface {
	CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error)
	Login(c context.Context, req *LoginUserReq) (*LoginUserRes, string, error)
	RefreshAccess(c context.Context, refreshToken string) (*LoginUserRes, string, error)
	Logout(c context.Context, refreshToken string) error
	UpdateProfile(c context.Context, userID int64, req *UpdateProfileReq) (*UpdateProfileRes, error)
}
