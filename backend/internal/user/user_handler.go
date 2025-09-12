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
	if refresh_token, err := c.Cookie("refresh_token"); err == nil && refresh_token != "" {
		resp, newRefreshToken, err := h.Service.RefreshAccess(c.Request.Context(), refresh_token)
		if err != nil {
			c.SetCookie("refresh_token", "", -1, "/", h.config.CookieDomain, h.config.CookieSecure, true)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session expired, please log in again"})
			return
		}
		maxAge := int(h.config.RefreshTokenDuration.Seconds())
		c.SetCookie("refresh_token", newRefreshToken, maxAge, "/", h.config.CookieDomain, h.config.CookieSecure, true)
		c.JSON(http.StatusOK, resp)
		return
	}
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
