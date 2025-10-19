package user

import "context"

type User struct {
	ID         int64   `json:"id" db:"id"`
	Username   string  `json:"username" db:"username"`
	Email      string  `json:"email" db:"email"`
	Password   string  `json:"password" db:"password"`
	IsArtist   bool    `json:"is_artist" db:"is_artist"`
	IsActive   bool    `string:"is_active" db:"is_active"`
	ProfilePic *string `json:"profile_pic" db:"pfp_url"`
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
	ID         string  `json:"id"`
	Username   string  `json:"username"`
	Email      string  `json:"email"`
	ProfilePic *string `json:"profile_pic,omitempty"`
}

type UpdateProfileReq struct {
	Username string `json:"username,omitempty" db:"username,omitempty"`
	Email    string `json:"email,omitempty" db:"email,omitempty"`
}

type UpdateProfileRes struct {
	Message string   `json:"message"`
	User    UserInfo `json:"user"`
}

type UpdateArtistRes struct {
	Message string `json:"message"`
}

type VerifyEmailReq struct {
	Token string `json:"token"`
}

type ForgotPasswordReq struct {
	Email string `json:"email"`
}

type ResetPasswordReq struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

type DeactivateAccountReq struct {
	Password string `json:"password"`
}

type DeleteAccountReq struct {
	Password        string `json:"password"`
	ConfirmDeletion string `json:"confirm_deletion"`
}

type ReactivateAccountReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Repo interface {
	CreateUser(ctx context.Context, user *User) (*User, error)

	GetUserByID(ctx context.Context, userID int64) (*User, error)
	GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	GetInactiveUserByID(ctx context.Context, userID int64) (*User, error)
	GetInactiveUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error)

	StoreRefreshToken(ctx context.Context, userID int64, tokenHash string) error
	ValidateRefreshToken(ctx context.Context, tokenHash string) (int64, error)
	RevokeUserTokens(ctx context.Context, userID int64) error

	UpdateUser(ctx context.Context, userID int64, updates map[string]interface{}) (*User, error)
	ToggleArtist(ctx context.Context, userID int64) error

	StoreEmailToken(ctx context.Context, userID int64, tokenHash string) error
	ValidateEmailToken(ctx context.Context, tokenHash string) (int64, error)
	MarkEmailVerified(ctx context.Context, userID int64) error

	StorePasswordToken(ctx context.Context, userID int64, tokenHash string) error
	ValidatePasswordToken(ctx context.Context, tokenHash string) (int64, error)
	UpdatePassword(ctx context.Context, userID int64, newPassword string) error

	DeactivateUser(ctx context.Context, userID int64) error
	ReactivateUser(ctx context.Context, userID int64) error
	DeleteUser(ctx context.Context, userID int64) error
}

type Service interface {
	CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error)
	Login(c context.Context, req *LoginUserReq) (*LoginUserRes, string, error)
	RefreshAccess(c context.Context, refreshToken string) (*LoginUserRes, string, error)
	Logout(c context.Context, refreshToken string) error
	UpdateProfile(c context.Context, userID int64, req *UpdateProfileReq, profilePicData []byte, profilePicFilename string) (*UpdateProfileRes, error)
	ToggleArtist(c context.Context, userID int64) (*UpdateArtistRes, error)
	SendVerificationEmail(c context.Context, userID int64) error
	VerifyEmail(c context.Context, token string) error
	ResendVerificationEmail(c context.Context, userID int64) error
	RequestPasswordReset(c context.Context, email string) error
	ResetPassword(c context.Context, token, newPassword string) error
	DeactivateAccount(c context.Context, userID int64, password string) error
	DeleteAccount(c context.Context, userID int64, password string) error
	ReactivateAccount(c context.Context, email, password string) (*LoginUserRes, string, error)
}
