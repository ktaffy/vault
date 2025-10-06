package snippet

import (
	"io"
	"net/http"
	"strconv"

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

	startTimeStr := c.PostForm("start_time")
	endTimeStr := c.PostForm("end_time")

	startTime := 0.0
	endTime := 15.0

	if startTimeStr != "" {
		if st, err := strconv.ParseFloat(startTimeStr, 64); err == nil {
			startTime = st
		}
	}

	if endTimeStr != "" {
		if et, err := strconv.ParseFloat(endTimeStr, 64); err == nil {
			endTime = et
		}
	}

	if endTime-startTime > 15.0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "snippet cannot exceed 15 seconds"})
		return
	}

	if startTime < 0 || endTime <= startTime {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid trim times"})
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

func (h *Handler) UpdateSnippet(c *gin.Context) {
	artistID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Same multipart form parsing as upload
	err := c.Request.ParseMultipartForm(5 << 20)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse form"})
		return
	}

	title := c.PostForm("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "audio file is required"})
		return
	}
	defer file.Close()

	audioData, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read audio file"})
		return
	}

	req := &UpdateReq{Title: title}

	resp, err := h.Service.UpdateSnippet(c.Request.Context(), artistID.(int64), req, audioData, fileHeader.Filename)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) DeleteSnippet(c *gin.Context) {
	artistID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	err := h.Service.DeleteSnippet(c.Request.Context(), artistID.(int64))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Snippet deleted successfully"})
}

func (h *Handler) GetSnippetByID(c *gin.Context) {
	snippetIDStr := c.Param("id")
	if snippetIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "snippet ID is required"})
		return
	}

	snippetID, err := strconv.ParseInt(snippetIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid snippet ID"})
		return
	}

	snippet, err := h.Service.GetSnippetByID(c.Request.Context(), snippetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, snippet)
}
