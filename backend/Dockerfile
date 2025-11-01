FROM golang:1.25.0-alpine AS builder

RUN apk add --no-cache ffmpeg git

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -ldflags="-s -w" -o main ./cmd/main.go

FROM alpine:latest

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

# Run the app
CMD ["./main"]
