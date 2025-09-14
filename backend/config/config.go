package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	DatabaseURL string

	JWTSecret           string
	AccessTokenDuration time.Duration

	ServerPort string
	ServerHost string

	Environment string

	CookieDomain string
	CookieSecure bool

	RefreshTokenDuration    time.Duration
	MaxRefreshTokensPerUser int

	EmailVerificationDuration time.Duration
	SMTPHost                  string
	SMTPPort                  int
	SMTPUsername              string
	SMTPPassword              string
	FromEmail                 string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DB_URL"),

		JWTSecret:           getEnv("JWT_SECRET"),
		AccessTokenDuration: parseDuration(getEnv("JWT_ACCESS_DURATION")),

		ServerPort: getEnv("SERVER_PORT"),
		ServerHost: getEnv("SERVER_HOST"),

		Environment: getEnv("ENVIRONMENT"),

		CookieDomain: getEnv("COOKIE_DOMAIN"),
		CookieSecure: parseBool(getEnv("COOKIE_SECURE")),

		RefreshTokenDuration:    parseDuration(getEnv("REFRESH_TOKEN_DURATION")),
		MaxRefreshTokensPerUser: parseInt(getEnv("MAX_REFRESH_TOKENS_PER_USER")),

		EmailVerificationDuration: parseDuration(getEnv("EMAIL_VERIFICATION_DURATION")),
		SMTPHost:                  getEnv("SMTP_HOST"),
		SMTPPort:                  parseInt(getEnv("SMTP_PORT")),
		SMTPUsername:              getEnv("SMTP_USERNAME"),
		SMTPPassword:              getEnv("SMTP_PASSWORD"),
		FromEmail:                 getEnv("FROM_EMAIL"),
	}
}

func getEnv(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return ""
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 24 * time.Hour // fallback
	}
	return d
}

func parseBool(s string) bool {
	b, err := strconv.ParseBool(s)
	if err != nil {
		return false
	}
	return b
}

func parseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return i
}
