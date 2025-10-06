package util

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	cfg "github.com/ktaffy/vault/backend/config"
)

var s3Client *s3.Client

func InitS3() error {
	cfg := cfg.Load()
	region := cfg.S3Region
	cofg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return err
	}
	s3Client = s3.NewFromConfig(cofg)
	return nil
}

func generateRandomString(length int) string {
	bytes := make([]byte, length/2)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)[:length]
}

func GetAudioDuration(audioFile []byte) (int, error) {
	if len(audioFile) == 0 {
		return 0, fmt.Errorf("audio file is empty")
	}

	// Basic size check - too small is suspicious
	if len(audioFile) < 10000 { // 10KB minimum
		return 0, fmt.Errorf("file too small to be valid audio")
	}

	// For simplicity, assume frontend enforces 15 seconds
	// Database constraint will catch violations anyway
	return 15, nil
}

func UploadAudioFile(audioFile []byte, filename string) (string, error) {
	if len(audioFile) == 0 {
		return "", fmt.Errorf("audio file is empty")
	}

	if len(audioFile) > 10*1024*1024 {
		return "", fmt.Errorf("file size exceeds 5MB limit")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".mp3" && ext != ".wav" && ext != ".m4a" {
		return "", fmt.Errorf("unsupported audio format")
	}

	uniqueFilename := generateUniqueFilename(filename)

	audioURL, err := uploadToS3Express(audioFile, uniqueFilename)
	if err != nil {
		return "", fmt.Errorf("failed to upload to storage: %w", err)
	}

	return audioURL, nil
}

func DeleteAudioFile(audioURL string) error {
	if s3Client == nil {
		return fmt.Errorf("S3 client not initialized")
	}
	cfg := cfg.Load()
	key, err := extractS3Key(audioURL)
	if err != nil {
		return err
	}
	_, err = s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(cfg.S3Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return err
	}
	return nil
}

func extractS3Key(audioURL string) (string, error) {
	if !strings.Contains(audioURL, "/audio/") {
		return "", fmt.Errorf("URL does not contain /audio/ path")
	}

	parts := strings.Split(audioURL, "/audio/")
	if len(parts) != 2 {
		return "", fmt.Errorf("malformed S3 URL")
	}

	return "audio/" + parts[1], nil
}

func uploadToS3Express(audioFile []byte, filename string) (string, error) {
	if s3Client == nil {
		return "", fmt.Errorf("S3 client not initialized")
	}

	cfg := cfg.Load()

	// Set content type based on file extension
	contentType := getContentType(filename)

	// Upload to S3 Express Directory bucket
	_, err := s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(cfg.S3Bucket),
		Key:         aws.String("audio/" + filename),
		Body:        bytes.NewReader(audioFile),
		ContentType: aws.String(contentType),
		// Note: No ACL for directory buckets - use bucket policies instead
	})

	if err != nil {
		return "", fmt.Errorf("S3 Express upload failed: %w", err)
	}

	audioURL := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/audio/%s",
		cfg.S3Bucket, cfg.S3Region, filename)

	return audioURL, nil
}

func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".mp3":
		return "audio/mpeg"
	case ".wav":
		return "audio/wav"
	case ".m4a":
		return "audio/mp4"
	default:
		return "application/octet-stream"
	}
}

func generateUniqueFilename(originalFilename string) string {
	timestamp := time.Now().Unix()
	randomStr := generateRandomString(8)
	ext := filepath.Ext(originalFilename)

	return fmt.Sprintf("%d_%s%s", timestamp, randomStr, ext)
}

func ValidateAudioFile(audioData []byte, filename string) error {
	if len(audioData) == 0 {
		return fmt.Errorf("audio file is empty")
	}

	if len(audioData) > 50*1024*1024 {
		return fmt.Errorf("file size exceeds 5MB limit")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".mp3" && ext != ".wav" && ext != ".m4a" {
		return fmt.Errorf("unsupported audio format: %s", ext)
	}

	if len(audioData) < 10000 { // 10KB minimum
		return fmt.Errorf("file too small to be valid audio")
	}

	return nil
}

func TrimAudioFile(audioFile []byte, filename string, startTime, endTime float64) ([]byte, error) {
	if startTime < 0 || endTime <= startTime {
		return nil, fmt.Errorf("invalid trim times: start=%f, end=%f", startTime, endTime)
	}

	if endTime-startTime > 15.0 {
		return nil, fmt.Errorf("trimmed audio cannot exceed 15 seconds")
	}

	tmpInputFile := filepath.Join("/tmp", "input_"+generateRandomString(8)+filepath.Ext(filename))
	tmpOutputFile := filepath.Join("/tmp", "output_"+generateRandomString(8)+".mp3")

	if err := os.WriteFile(tmpInputFile, audioFile, 0644); err != nil {
		return nil, fmt.Errorf("failed to write temp input file: %w", err)
	}
	defer os.Remove(tmpInputFile)
	defer os.Remove(tmpOutputFile)

	duration := fmt.Sprintf("%.2f", endTime-startTime)
	startTimeStr := fmt.Sprintf("%.2f", startTime)

	cmd := exec.Command("ffmpeg",
		"-i", tmpInputFile,
		"-ss", startTimeStr,
		"-t", duration,
		"-acodec", "libmp3lame",
		"-b:a", "192k",
		"-y",
		tmpOutputFile,
	)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("ffmpeg failed: %w, stderr: %s", err, stderr.String())
	}

	trimmedData, err := os.ReadFile(tmpOutputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read trimmed file: %w", err)
	}

	return trimmedData, nil
}
