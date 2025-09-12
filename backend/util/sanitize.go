package util

import (
	"errors"
	"net/mail"
	"strings"
	"unicode"
)

func SanitizeEmail(email string) (string, error) {
	email = strings.TrimSpace(email)
	if email == "" {
		return "", errors.New("email cannot be empty")
	}
	if len(email) > 254 {
		return "", errors.New("email too long")
	}
	addr, err := mail.ParseAddress(email)
	if err != nil {
		return "", errors.New("invalid email format")
	}
	return strings.ToLower(addr.Address), nil
}

func SanitizePassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("password cannot be empty")
	}
	if len(password) < 8 {
		return "", errors.New("password must be at least 8 characters")
	}
	if len(password) > 128 {
		return "", errors.New("password too long")
	}
	for _, char := range password {
		if unicode.IsSpace(char) {
			return "", errors.New("password contains invalid characters")
		}
	}
	return password, nil
}
