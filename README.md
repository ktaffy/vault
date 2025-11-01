# Vault

*Tinder for underground rap. Swipe through 15-second snippets. Find artists you like.*

## Problem
Good artists have no avenue to get music into their fans' hands without label backing or paid promo.

## The Solution
Every swipe guarantees your snippet gets heard. No algorithms to game. No playlists to beg for. Just pure discovery.

## How It Works
### For Listeners
1. Open app → snippet autoplays
2. 🔥 = save/follow artist
3. 🗑️ = next snippet
4. Get addicted to discovering

### For Artists
1. Upload **ONE** 15-second unreleased snippet
2. Watch your play count grow
3. Get real fans, not bots

## Tech Stack
- **Backend:** Go, PostgreSQL, AWS S3
- **Frontend:** React Native, Expo, Redux Toolkit
- **Infrastructure:** Railway (backend), EAS (mobile builds)

## Documentation

**Start Here:**
- [Setup Guide](docs/setup.md) - Get the project running locally

**Development:**
- [Development Workflow](docs/workflows.md) - Daily development process
- [Project Structure](docs/project-structure.md) - Code organization

**API Reference:**
- [API Documentation](docs/backend/api.md) - All endpoints
- [Database Schema](docs/backend/db.md) - Database structure
- [Backend Architecture](docs/backend/design.md) - 3-layer pattern

**Frontend:**
- [Frontend Architecture](docs/frontend/arch.md) - React Native structure

## Quick Start
```bash
# 1. Setup (first time only) - runs docker image and migrations
npm install
go mod tidy
make setup

# 2. Start backend
make server

# 3. Start frontend (in another terminal)
make app-dev
```

See [Setup Guide](docs/SETUP.md) for detailed instructions.

## Key Commands
```bash
# Database
make setup              # Initial setup
make postgres           # Open database shell
make migrate-up         # Run migrations
make migrate-create name=migration_name

# Development
make server             # Run backend (local)
make server-staging     # Run backend (staging)
make app-dev            # Run Expo dev client

# Builds
make build-staging      # Build + submit to TestFlight
make build-prod         # Build + submit to App Store (NEVER DO THIS)
```

## Contributing

1. Read [Development Workflow](docs/WORKFLOWS.md)
2. Create a feature branch
3. Make your changes
4. Test locally
5. Open a pull request