package user

import (
	"context"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/ktaffy/vault/backend/util"
)

const secretKey = "secret"

type service struct {
	Repo
	timeOut time.Duration
}

func NewService(repo Repo) Service {
	return &service{
		repo,
		time.Duration(2) * time.Second,
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

	res := &CreateUserRes{
		ID:       strconv.Itoa(int(r.ID)),
		Username: r.Username,
		Email:    r.Email,
	}

	return res, nil
}

type JWTClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (s *service) Login(c context.Context, req *LoginUserReq) (*LoginUserRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeOut)
	defer cancel()

	u, err := s.Repo.GetUserByEmailOrUsername(ctx, req.Identifier)
	if err != nil {
		return nil, err
	}

	err = util.CheckPassword(req.Password, u.Password)
	if err != nil {
		return nil, err
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       strconv.Itoa(int(u.ID)),
		Username: u.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    strconv.Itoa(int(u.ID)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	ss, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return nil, err
	}

	res := &LoginUserRes{
		accessToken: ss,
		Username:    u.Username,
		ID:          strconv.Itoa(int(u.ID)),
	}

	return res, nil
}
