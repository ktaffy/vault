package router

import (
	"github.com/gin-gonic/gin"
	"github.com/ktaffy/vault/backend/internal/user"
	"github.com/ktaffy/vault/backend/middleware"
)

var r *gin.Engine

func InitRouter(userHandler *user.Handler) {
	r = gin.Default()

	// Public Routes
	r.POST("/signup", userHandler.CreateUser)
	r.POST("/login", userHandler.Login)
	r.POST("/refresh", userHandler.RefreshToken)
	r.GET("/logout", userHandler.Logout)
	r.POST("/verify-email", userHandler.VerifyEmail)
	r.POST("/forgot-password", userHandler.ForgotPassword)
	r.POST("/reset-password", userHandler.ResetPassword)

	// Protected Routes
	r.PUT("/update-profile", middleware.JWTAuth(), userHandler.UpdateProfile)
	r.PUT("/toggle-artist", middleware.JWTAuth(), userHandler.ToggleArtist)
	r.POST("/resend-verification", middleware.JWTAuth(), userHandler.ResendVerification)
}

func Start(addr string) error {
	return r.Run(addr)
}
