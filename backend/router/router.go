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
	r.GET("/logout", userHandler.Logout)

	// Protected Routes
	r.PUT("/update-profile", middleware.JWTAuth(), userHandler.UpdateProfile)
}

func Start(addr string) error {
	return r.Run(addr)
}
