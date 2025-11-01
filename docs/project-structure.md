# Project Structure

## Repository Overview
```
vault/
├── backend/          # Go API server
├── frontend/         # React Native mobile app
├── docs/            # Documentation (you are here)
├── compose.yaml     # Docker Postgres setup
├── Makefile         # Development commands
└── README.md        # Project overview
```

## Backend Structure
```
backend/
├── cmd/
│   └── main.go                 # Entry point - wires up all dependencies
│
├── internal/                   # Core application code
│   ├── user/                   # User management module
│   │   ├── user.go            # Domain models & interfaces
│   │   ├── user_handler.go    # HTTP endpoints (signup, login, profile)
│   │   ├── user_service.go    # Business logic (validation, auth)
│   │   └── user_repo.go       # Database queries
│   │
│   ├── snippet/                # Snippet (audio) module
│   │   ├── snippet.go         # Domain models & interfaces
│   │   ├── snippet_handler.go # HTTP endpoints (upload, stats)
│   │   ├── snippet_service.go # Business logic (S3 upload, validation)
│   │   └── snippet_repo.go    # Database queries
│   │
│   ├── swipe/                  # Swipe interaction module
│   │   ├── swipe.go           # Domain models & interfaces
│   │   ├── swipe_handler.go   # HTTP endpoints (fire, skip)
│   │   ├── swipe_service.go   # Business logic (follow, stats update)
│   │   └── swipe_repo.go      # Database queries
│   │
│   └── feed/                   # Feed algorithm module
│       ├── feed.go            # Domain models & interfaces
│       ├── feed_handler.go    # HTTP endpoints (next snippet)
│       ├── feed_service.go    # Business logic (feed algorithm)
│       └── feed_repo.go       # Database queries
│
├── middleware/
│   └── auth.go                 # JWT authentication middleware
│
├── router/
│   └── router.go              # Route definitions & setup
│
├── db/
│   ├── db.go                  # Database connection setup
│   └── migrations/            # SQL migration files
│       ├── 000001_init.up.sql
│       ├── 000001_init.down.sql
│       └── ...
│
├── util/                       # Shared utilities
│   ├── audio.go               # S3 audio upload/delete
│   ├── image.go               # S3 image upload/delete
│   ├── password.go            # Password hashing/validation
│   ├── token.go               # JWT generation/validation
│   └── sanitize.go            # Input sanitization
│
├── config/
│   └── config.go              # Environment configuration loader
│
├── jobs/
│   └── feed_refresh.go        # Background job for feed updates
│
├── .env.local                 # Local environment variables (not committed)
└── go.mod                     # Go dependencies
```

## Frontend Structure
```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Generic components (Button, Input)
│   │   ├── feed/             # Feed-specific components
│   │   ├── auth/             # Auth-specific components
│   │   └── upload/           # Upload-specific components
│   │
│   ├── screens/              # Full-page screens
│   │   ├── auth/            # Authentication screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── EmailVerificationScreen.tsx
│   │   ├── main/            # Main app screens
│   │   │   ├── FeedScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── artist/          # Artist-only screens
│   │       ├── ArtistDashboardScreen.tsx
│   │       ├── UploadScreen.tsx
│   │       └── StatsScreen.tsx
│   │
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.tsx       # Root navigator (auth routing)
│   │   ├── AuthNavigator.tsx      # Auth stack navigator
│   │   ├── MainTabNavigator.tsx   # Main tab navigator
│   │   └── types.ts               # Navigation type definitions
│   │
│   ├── store/                # Redux state management
│   │   ├── slices/
│   │   │   ├── authSlice.ts       # Authentication state
│   │   │   ├── feedSlice.ts       # Feed/snippet state
│   │   │   ├── audioSlice.ts      # Audio playback state
│   │   │   └── themeSlice.ts      # Theme (dark/light) state
│   │   └── store.ts               # Redux store configuration
│   │
│   ├── services/             # External service integrations
│   │   ├── api/             # Backend API calls
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── feed.ts           # Feed endpoints
│   │   │   ├── snippets.ts       # Snippet endpoints
│   │   │   ├── swipes.ts         # Swipe endpoints
│   │   │   └── client.ts         # Axios instance setup
│   │   ├── audio/           # Audio management
│   │   │   ├── AudioManager.ts   # Core audio player
│   │   │   └── AudioQueue.ts     # Preloading queue
│   │   └── storage/         # Local storage
│   │       └── SecureStorage.ts  # Secure token storage
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useAudio.ts          # Audio control hook
│   │   ├── useFeed.ts           # Feed data hook
│   │   ├── useSwipe.ts          # Swipe actions hook
│   │   └── useTheme.ts          # Theme hook
│   │
│   ├── styles/              # Styling and themes
│   │   └── themes/
│   │       ├── dark.ts          # Dark theme (black & purple)
│   │       ├── light.ts         # Light theme (white & purple)
│   │       └── colors.ts        # Shared color palette
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts               # API response types
│   │   ├── audio.ts             # Audio types
│   │   ├── navigation.ts        # Navigation types
│   │   └── theme.ts             # Theme types
│   │
│   ├── utils/               # Utility functions
│   │   ├── audioCache.ts        # Audio caching logic
│   │   ├── constants.ts         # App constants
│   │   └── validation.ts        # Input validation
│   │
│   └── config/
│       └── environment.ts       # Environment-based config
│
├── assets/                  # Static assets
│   ├── images/
│   └── fonts/
│
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables (not committed)
```

## Key Architecture Patterns

### Backend: 3-Layer Architecture
```
HTTP Request
    ↓
Handler (HTTP Layer)
    - Parse request
    - Validate input
    - Call service
    - Return response
    ↓
Service (Business Logic)
    - Business rules
    - Orchestration
    - Call repository
    ↓
Repository (Data Layer)
    - SQL queries
    - Database access
    ↓
Database
```

**Example Flow (User Signup):**
1. `POST /signup` → `user_handler.go` validates request
2. Handler calls `userService.CreateUser()`
3. Service hashes password, calls `userRepo.CreateUser()`
4. Repo executes `INSERT INTO users...`
5. Service sends verification email
6. Handler returns HTTP 201 with user data

### Frontend: Redux + Component Architecture
```
User Action
    ↓
Component (UI)
    ↓
Custom Hook (useFeed, useAuth)
    ↓
Redux Thunk/Action
    ↓
API Service (api/feed.ts)
    ↓
Backend API
    ↓
Redux Reducer updates state
    ↓
Component re-renders
```

**Example Flow (Swiping Fire):**
1. User taps 🔥 button
2. `SwipeActions` component calls `useSwipe().fire()`
3. Hook dispatches Redux action
4. Action calls `swipeService.recordSwipe()`
5. API call to `POST /swipe`
6. Redux updates feed state (move to next snippet)
7. `FeedScreen` re-renders with new snippet

## Module Responsibilities

### Backend Modules

**user/**
- Authentication (signup, login, token refresh)
- Profile management
- Email verification
- Password reset

**snippet/**
- Audio file upload to S3
- Snippet creation with metadata
- Cover art upload
- Artist stats retrieval

**swipe/**
- Recording fire/skip actions
- Auto-following artists on fire
- Updating snippet engagement counts
- Liked snippets history

**feed/**
- Feed algorithm (personalized/random)
- Next snippet selection
- Feed preloading
- Background feed refresh job

### Frontend Modules

**auth screens**
- Welcome/onboarding
- Login/signup forms
- Email verification flow

**feed screens**
- Infinite scroll snippet player
- Swipe gestures (fire/skip)
- Audio autoplay

**profile screens**
- User profile editing
- Liked snippets library
- Account settings

**artist screens**
- Snippet upload with cover art
- Play count stats dashboard

## Important Files

### Configuration Files

**compose.yaml**
- Local Postgres Docker setup
- Port 5432 exposed

**Makefile**
- All development commands
- Database management
- Build scripts

**frontend/eas.json**
- Build profiles (dev/staging/production)
- TestFlight submission config

**backend/.env.local** (not committed)
- Local environment variables
- Use `.env.example` as template

## Data Flow Examples

### Upload Snippet Flow
```
UploadScreen
    ↓
snippetService.uploadSnippet()
    ↓
POST /snippet/upload (multipart/form-data)
    ↓
snippet_handler validates file
    ↓
snippet_service uploads to S3
    ↓
snippet_repo saves to DB
    ↓
user marked as artist
```

### Swipe Feed Flow
```
FeedScreen loads
    ↓
useFeed() hook dispatches fetchNextSnippet
    ↓
GET /feed/next
    ↓
feed_service runs algorithm
    ↓
feed_repo queries personalized snippets
    ↓
Returns snippet with audio_url
    ↓
Audio preloads in background
    ↓
User swipes fire/skip
    ↓
POST /swipe
    ↓
Move to next snippet
```

## Where to Add New Features

**New API endpoint?**
→ Add to appropriate `internal/[module]/*_handler.go`
→ Register route in `router/router.go`

**New business logic?**
→ Add to `internal/[module]/*_service.go`

**New database query?**
→ Add to `internal/[module]/*_repo.go`

**New database table?**
→ Create migration: `make migrate-create name=add_table`

**New screen?**
→ Add to `frontend/src/screens/`
→ Register in navigator

**New API call?**
→ Add to `frontend/src/services/api/`

**New state?**
→ Add slice to `frontend/src/store/slices/`