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
│   ├── user/                  # Existing user module
│   │   ├── user.go            # Domain models & interfaces
│   │   ├── user_handler.go    # HTTP handlers
│   │   ├── user_service.go    # Business logic
│   │   └── user_repo.go       # Database queries
│   └── snippet/               # snippet module
│       ├── snippet.go         # Domain models & interfaces
│       ├── snippet_handler.go # HTTP handlers
│       ├── snippet_service.go # Business logic
│       └── snippet_repo.go    # Database queries
├── middleware/
│   └── auth.go                 # JWT middleware (existing)
├── router/
│   └── router.go               # Route definitions
├── db/
│   ├── db.go                   # Database connection
│   └── migrations/             # SQL migrations
├── util/
│   ├── password.go             # Password hashing (existing)
│   ├── token.go                # Token generation (existing)
│   ├── sanitize.go             # Input sanitization (existing)
│   └── storage.go              # NEW: S3/Cloudinary upload
└── config/
    └── config.go               # Environment config
```