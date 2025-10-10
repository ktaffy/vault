package util

import (
	"bytes"
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	cfg "github.com/ktaffy/vault/backend/config"
)

func ValidateImageFile(imageFile []byte, filename string) error {
	if len(imageFile) == 0 {
		return fmt.Errorf("image file is empty")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return fmt.Errorf("unsupported image format (must be jpg, png, or webp)")
	}

	return nil
}

func UploadImageFile(imageFile []byte, filename string) (string, error) {
	if err := ValidateImageFile(imageFile, filename); err != nil {
		return "", err
	}

	uniqueFilename := generateUniqueFilename(filename)
	imageURL, err := uploadImageToS3(imageFile, uniqueFilename)
	if err != nil {
		return "", fmt.Errorf("failed to upload to storage: %w", err)
	}

	return imageURL, nil
}

func DeleteImageFile(imageURL string) error {
	if s3Client == nil {
		return fmt.Errorf("S3 client not initialized")
	}

	cfg := cfg.Load()
	key, err := extractImageS3Key(imageURL)
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

func extractImageS3Key(imageURL string) (string, error) {
	if !strings.Contains(imageURL, "/images/cover_art/") {
		return "", fmt.Errorf("URL does not contain /images/cover_art/ path")
	}

	parts := strings.Split(imageURL, "/images/cover_art/")
	if len(parts) != 2 {
		return "", fmt.Errorf("malformed S3 URL")
	}

	return "images/cover_art/" + parts[1], nil
}

func uploadImageToS3(imageFile []byte, filename string) (string, error) {
	if s3Client == nil {
		return "", fmt.Errorf("S3 client not initialized")
	}

	cfg := cfg.Load()
	contentType := getImageContentType(filename)

	_, err := s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(cfg.S3Bucket),
		Key:         aws.String("images/cover_art/" + filename),
		Body:        bytes.NewReader(imageFile),
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return "", fmt.Errorf("S3 image upload failed: %w", err)
	}

	imageURL := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/images/cover_art/%s",
		cfg.S3Bucket, cfg.S3Region, filename)

	return imageURL, nil
}

func getImageContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	default:
		return "application/octet-stream"
	}
}
