package user

import (
	"context"
	"fmt"
	"net/smtp"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/ktaffy/vault/backend/config"
	"github.com/ktaffy/vault/backend/util"
)

type service struct {
	Repo
	config  *config.Config
	timeOut time.Duration
}

func NewService(repo Repo) Service {
	return &service{
		Repo:    repo,
		config:  config.Load(),
		timeOut: 5 * time.Second,
	}
}

func (s *service) CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	cleanEmail, err := util.SanitizeEmail(req.Email)
	if err != nil {
		return nil, err
	}

	cleanPass, err := util.SanitizePassword(req.Password)
	if err != nil {
		return nil, err
	}

	hashPass, err := util.HashPassword(cleanPass)
	if err != nil {
		return nil, err
	}
	u := &User{
		Username: req.Username,
		Email:    cleanEmail,
		Password: hashPass,
	}

	r, err := s.Repo.CreateUser(ctx, u)
	if err != nil {
		return nil, err
	}

	go func() {
		if err := s.SendVerificationEmail(context.Background(), r.ID); err != nil {
			fmt.Printf("Failed to send verification email: %v\n", err)
		}
	}()

	res := &CreateUserRes{
		ID:       strconv.Itoa(int(r.ID)),
		Username: r.Username,
		Email:    r.Email,
	}

	return res, nil
}

func (s *service) Login(c context.Context, req *LoginUserReq) (*LoginUserRes, string, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	u, err := s.Repo.GetUserByEmailOrUsername(ctx, req.Identifier)
	if err != nil {
		return nil, "", err
	}

	err = util.CheckPassword(req.Password, u.Password)
	if err != nil {
		return nil, "", err
	}

	userIDStr := strconv.FormatInt(u.ID, 10)

	accessToken, err := s.generateAccessToken(userIDStr, u.Username)
	if err != nil {
		return nil, "", err
	}

	refreshToken, err := util.GenerateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	// store refresh token
	tokenHash := util.HashToken(refreshToken)
	if err := s.Repo.StoreRefreshToken(ctx, u.ID, tokenHash); err != nil {
		return nil, "", err
	}

	res := &LoginUserRes{
		AccessToken: accessToken,
		ExpiresIn:   int(s.config.AccessTokenDuration.Seconds()),
		User: UserInfo{
			ID:       userIDStr,
			Username: u.Username,
			Email:    u.Email,
		},
	}

	return res, refreshToken, nil
}

func (s *service) Logout(c context.Context, refreshToken string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	tokenHash := util.HashToken(refreshToken)
	userID, err := s.Repo.ValidateRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil
	}
	return s.Repo.RevokeUserTokens(ctx, userID)
}

func (s *service) UpdateProfile(c context.Context, userID int64, req *UpdateProfileReq) (*UpdateProfileRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	updates := make(map[string]interface{})

	if req.Username != "" {
		if len(req.Username) < 3 || len(req.Username) > 50 {
			return nil, fmt.Errorf("username must be between 3-50 characters")
		}
		updates["username"] = req.Username
	}

	if req.Email != "" {
		cleanEmail, err := util.SanitizeEmail(req.Email)
		if err != nil {
			return nil, err
		}
		updates["email"] = cleanEmail
		updates["email_verified"] = false // reset status on email change
	}

	if req.ProfileBio != "" {
		if len(req.ProfileBio) > 500 {
			return nil, fmt.Errorf("bio too long (max 500 characters)")
		}
		updates["profile_bio"] = req.ProfileBio
	}

	if req.PfpUrl != "" {
		updates["pfp_url"] = req.PfpUrl
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	updatedUser, err := s.Repo.UpdateUser(ctx, userID, updates)
	if err != nil {
		return nil, err
	}

	res := &UpdateProfileRes{
		Message: "Profile updated successfully",
		User: UserInfo{
			ID:       strconv.Itoa(int(updatedUser.ID)),
			Username: updatedUser.Username,
			Email:    updatedUser.Email,
		},
	}

	return res, nil
}

func (s *service) RefreshAccess(c context.Context, refreshToken string) (*LoginUserRes, string, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	tokenHash := util.HashToken(refreshToken)
	userID, err := s.Repo.ValidateRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil, "", err
	}

	user, err := s.Repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, "", err
	}

	userIDStr := strconv.FormatInt(user.ID, 10)

	accessToken, err := s.generateAccessToken(userIDStr, user.Username)
	if err != nil {
		return nil, "", err
	}

	newRefreshToken, err := util.GenerateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	newTokenHash := util.HashToken(newRefreshToken)
	if err := s.Repo.StoreRefreshToken(ctx, user.ID, newTokenHash); err != nil {
		return nil, "", err
	}

	resp := &LoginUserRes{
		AccessToken: accessToken,
		ExpiresIn:   int(s.config.AccessTokenDuration.Seconds()),
		User: UserInfo{
			ID:       userIDStr,
			Username: user.Username,
			Email:    user.Email,
		},
	}
	return resp, newRefreshToken, nil
}

func (s *service) ToggleArtist(c context.Context, userID int64) (*UpdateArtistRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()
	err := s.Repo.ToggleArtist(ctx, userID)
	if err != nil {
		return nil, err
	}
	res := &UpdateArtistRes{
		Message: "Artist mode toggled successfully",
	}
	return res, nil
}

func (s *service) SendVerificationEmail(c context.Context, userID int64) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	user, err := s.Repo.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	token, err := util.GenerateRefreshToken()
	if err != nil {
		return err
	}

	tokenHash := util.HashToken(token)
	if err := s.Repo.StoreEmailToken(ctx, userID, tokenHash); err != nil {
		return err
	}
	return s.sendEmail(user.Email, token)
}

func (s *service) VerifyEmail(c context.Context, token string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()
	tokenHash := util.HashToken(token)
	userID, err := s.Repo.ValidateEmailToken(ctx, tokenHash)
	if err != nil {
		return err
	}
	return s.Repo.MarkEmailVerified(ctx, userID)
}

func (s *service) ResendVerificationEmail(c context.Context, userID int64) error {
	return s.SendVerificationEmail(c, userID)
}

func (s *service) RequestPasswordReset(c context.Context, email string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	cleanEmail, err := util.SanitizeEmail(email)
	if err != nil {
		return err
	}

	user, err := s.Repo.GetUserByEmail(ctx, cleanEmail)
	if err != nil {
		return nil
	}

	token, err := util.GenerateRefreshToken()
	if err != nil {
		return err
	}

	tokenHash := util.HashToken(token)
	if err := s.Repo.StorePasswordToken(ctx, user.ID, tokenHash); err != nil {
		return err
	}

	return s.sendPasswordResetEmail(user.Email, token)
}

func (s *service) ResetPassword(c context.Context, token, newPassword string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	cleanPassword, err := util.SanitizePassword(newPassword)
	if err != nil {
		return err
	}

	hashPass, err := util.HashPassword(cleanPassword)
	if err != nil {
		return err
	}

	tokenHash := util.HashToken(token)
	userID, err := s.Repo.ValidatePasswordToken(ctx, tokenHash)
	if err != nil {
		return err
	}

	if err := s.Repo.UpdatePassword(ctx, userID, hashPass); err != nil {
		return err
	}

	return s.Repo.RevokeUserTokens(ctx, userID)
}

func (s *service) DeactivateAccount(c context.Context, userID int64, password string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	user, err := s.Repo.GetInactiveUserByID(ctx, userID)
	if err != nil {
		return err
	}

	if err := util.CheckPassword(password, user.Password); err != nil {
		return err
	}

	if err := s.Repo.DeactivateUser(ctx, userID); err != nil {
		return err
	}

	return s.Repo.RevokeUserTokens(ctx, userID)
}

func (s *service) DeleteAccount(c context.Context, userID int64, password string) error {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	user, err := s.Repo.GetInactiveUserByID(ctx, userID)
	if err != nil {
		return err
	}

	if err := util.CheckPassword(password, user.Password); err != nil {
		return err
	}

	return s.Repo.DeleteUser(ctx, userID)
}

func (s *service) ReactivateAccount(c context.Context, email, password string) (*LoginUserRes, string, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	cleanEmail, err := util.SanitizeEmail(email)
	if err != nil {
		return nil, "", err
	}

	user, err := s.Repo.GetInactiveUserByEmailOrUsername(ctx, cleanEmail)
	if err != nil {
		return nil, "", err
	}

	if err := util.CheckPassword(password, user.Password); err != nil {
		return nil, "", err
	}

	if err := s.Repo.ReactivateUser(ctx, user.ID); err != nil {
		return nil, "", err
	}

	userIDStr := strconv.FormatInt(user.ID, 10)

	accessToken, err := s.generateAccessToken(userIDStr, user.Username)
	if err != nil {
		return nil, "", err
	}

	refreshToken, err := util.GenerateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	tokenHash := util.HashToken(refreshToken)
	if err := s.Repo.StoreRefreshToken(ctx, user.ID, tokenHash); err != nil {
		return nil, "", err
	}

	res := &LoginUserRes{
		AccessToken: accessToken,
		ExpiresIn:   int(s.config.AccessTokenDuration.Seconds()),
		User: UserInfo{
			ID:       userIDStr,
			Username: user.Username,
			Email:    user.Email,
		},
	}

	return res, refreshToken, nil
}

// Helper methods (doesnt fit in util package dont want circular dependency)
func (s *service) generateAccessToken(userID, username string) (string, error) {
	claims := util.JWTClaims{
		ID:       userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.AccessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

func (s *service) sendEmail(email, token string) error {
	url := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", token)
	subject := "Verify your Vault account"
	body := fmt.Sprintf(`
		<h2>Welcome to Vault</h2>
		<p>Click link to verify account</p>
		<a href="%s">Verify Email</a>
		<p>This link will expire in 24 hours.</p>
	`, url)
	from := s.config.FromEmail
	password := s.config.SMTPPassword
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html\r\n\r\n%s", from, email, subject, body)
	auth := smtp.PlainAuth("", s.config.SMTPUsername, password, s.config.SMTPHost)
	addr := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	return smtp.SendMail(addr, auth, from, []string{email}, []byte(msg))
}

func (s *service) sendPasswordResetEmail(email, token string) error {
	url := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", token) // Change in production

	subject := "Reset your Vault password"
	body := fmt.Sprintf(`
		<h2>Password Reset Request</h2>
		<p>You requested to reset your password. Click the link below:</p>
		<a href="%s">Reset Password</a>
		<p>This link will expire in 24 hours.</p>
		<p>If you didn't request this, ignore this email.</p>
	`, url)

	from := s.config.FromEmail
	password := s.config.SMTPPassword

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html\r\n\r\n%s", from, email, subject, body)

	auth := smtp.PlainAuth("", s.config.SMTPUsername, password, s.config.SMTPHost)
	addr := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)

	return smtp.SendMail(addr, auth, from, []string{email}, []byte(msg))
}
