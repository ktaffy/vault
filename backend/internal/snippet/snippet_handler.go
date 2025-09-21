package snippet

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ktaffy/vault/backend/config"
	"github.com/ktaffy/vault/backend/util"
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

func (h *Handler) UploadSnippet(c *gin.Context) {
	artistID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	err := c.Request.ParseMultipartForm(5 << 20) // 5MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse form"})
		return
	}

	title := c.PostForm("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	if len(title) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title too long (max 100 characters)"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "audio file is required"})
		return
	}
	defer file.Close()

	if fileHeader.Size > 5*1024*1024 { // 5MB
		c.JSON(http.StatusBadRequest, gin.H{"error": "file size exceeds 5MB limit"})
		return
	}

	audioData, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read audio file"})
		return
	}

	if err := util.ValidateAudioFile(audioData, fileHeader.Filename); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req := &UploadReq{
		Title: title,
	}

	resp, err := h.Service.UploadSnippet(c.Request.Context(), artistID.(int64), req, audioData, fileHeader.Filename)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetArtistSnippet(c *gin.Context) {
	artistID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	snippet, err := h.Service.GetSnippet(c.Request.Context(), artistID.(int64))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, snippet)
}
