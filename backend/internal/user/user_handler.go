package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ktaffy/vault/backend/config"
)

type Handler struct {
	Service
	config *config.Config
}

func NewHandler(s Service) *Handler {
	return &Handler{
		Service: s,
		config:  config.Load(),
	}
}

func (h *Handler) CreateUser(c *gin.Context) {
	var u CreateUserReq
	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.Service.CreateUser(c.Request.Context(), &u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, refreshToken, err := h.Service.Login(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	maxAge := int(h.config.RefreshTokenDuration.Seconds())
	c.SetCookie("refresh_token", refreshToken, maxAge, "/", h.config.CookieDomain, h.config.CookieSecure, true)
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Logout(c *gin.Context) {
	if refreshToken, err := c.Cookie("refresh_token"); err == nil {
		h.Service.Logout(c.Request.Context(), refreshToken)
	}
	c.SetCookie("refresh_token", "", -1, "/", h.config.CookieDomain, h.config.CookieSecure, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var req UpdateProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.Service.UpdateProfile(c.Request.Context(), userID.(int64), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) ToggleArtist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	resp, err := h.Service.ToggleArtist(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no refresh token"})
		return
	}
	resp, newRefreshToken, err := h.Service.RefreshAccess(c.Request.Context(), refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}
	maxAge := int(h.config.RefreshTokenDuration.Seconds())
	c.SetCookie("refresh_token", newRefreshToken, maxAge, "/", h.config.CookieDomain, h.config.CookieSecure, true)
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) VerifyEmail(c *gin.Context) {
	var req VerifyEmailReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.Service.VerifyEmail(c.Request.Context(), req.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message:": "Email verified successfully"})
}

func (h *Handler) ResendVerification(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	err := h.Service.ResendVerificationEmail(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send verification email"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "verification email sent"})
}
