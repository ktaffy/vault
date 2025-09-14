package util

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"

	"github.com/golang-jwt/jwt/v4"
)

type JWTClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", nil
	}
	return hex.EncodeToString(bytes), nil
}

func HashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}
