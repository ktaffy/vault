package util

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
)

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
