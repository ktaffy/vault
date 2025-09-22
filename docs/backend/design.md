# <span style="color: #9478e9ff;">Vault</span> Backend Design Pattern

## Architecture Overview
Clear separation of concerns\
`HTTP Request -> Handler -> Service -> Repository -> Database`

## Layer Responsibilities
1. **Handler (HTTP Layer)**
    - Handles HTTP requests/responses
    - Validates request body binding
    - Extracts auth context (user_id from JWT)
    - Returns appropriate HTTP status codes
    - No business logic
2. **Service (Business Logic)**
    - Contains all business rules
    - Orchestrates complex operations
    - Manages transactions
    - Handles external services (email, S3)
    - No HTTP concerns, No SQL
3. **Repository (Data Access)**
    - Direct database interactions
    - SQL queries only
    - Returns domain models
    - No business logic, No HTTP

## File Structure
```
backend/
├── cmd/
│   └── main.go                # Entry point, wire dependencies
├── internal/
│   ├── user/                   # USER MODULE
│   │   ├── user.go             # Domain models & interfaces
│   │   ├── user_handler.go     # HTTP handlers
│   │   ├── user_service.go     # Business logic
│   │   └── user_repo.go        # Database queries
│   ├── snippet/                # SNIPPET MODULE
│   │   ├── snippet.go          # Domain models & interfaces
│   │   ├── snippet_handler.go  # HTTP handlers
│   │   ├── snippet_service.go  # Business logic
│   │   └── snippet_repo.go     # Database queries
│   ├── swipe/                  # SWIPE MODULE
│   │   ├── swipe.go            # Domain models & interfaces
│   │   ├── swipe_handler.go    # HTTP handlers
│   │   ├── swipe_service.go    # Business logic
│   │   └── swipe_repo.go       # Database queries
│   ├── feed/                   # FEED MODULE (coming next)
│   │   ├── feed.go             # Domain models & interfaces
│   │   ├── feed_handler.go     # HTTP handlers
│   │   ├── feed_service.go     # Business logic
│   │   └── feed_repo.go        # Database queries
│   └── stats/                  # STATS MODULE (coming last)
│       ├── stats.go            # Domain models & interfaces
│       ├── stats_handler.go    # HTTP handlers
│       ├── stats_service.go    # Business logic
│       └── stats_repo.go       # Database queries
├── middleware/
│   └── auth.go                 # JWT middleware
├── router/
│   └── router.go               # Route definitions
├── db/
│   ├── db.go                   # Database connection
│   └── migrations/             # SQL migrations
├── util/
│   ├── password.go             # Password hashing
│   ├── token.go                # JWT token generation
│   ├── sanitize.go             # Input sanitization
│   └── audio.go                # S3 upload + audio file handling + cleanup
└── config/
    └── config.go               # Environment config