package feed

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

func (h *Handler) GetNextSnippet(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	resp, err := h.Service.GetNextSnippet(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if resp.Snippet == nil {
		c.JSON(http.StatusOK, gin.H{"message": resp.Message})
		return
	}

	c.JSON(http.StatusOK, resp)
}
