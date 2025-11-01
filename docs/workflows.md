# Development Workflows

## Daily Development Flow

### Starting New Work
```bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-name
```

### While Developing
```bash
# Make changes, test locally
git add .
git commit -m "Clear description of changes"
git push origin feature/descriptive-name
```

### Opening a Pull Request
1. Push your branch
2. Open PR on GitHub
3. Add description explaining what and why
4. Request review from team member

## Pre-Push Checklist

Before pushing code, verify:

### Backend Changes
- Code compiles: `cd backend && go build ./...`
- No console errors when running locally
- If DB changed: migrations tested (up and down)
- No hardcoded secrets or URLs
- Updated API docs if endpoints changed

### Frontend Changes
- App runs without errors: `make app-dev`
- Tested on both iOS simulator and physical device (if possible)
- No `console.log()` statements left in production code
- Redux state changes don't break existing features
- Navigation flow still works

### Database Changes
- Created both `.up.sql` and `.down.sql` files
- Tested migration up: `make migrate-up`
- Tested migration down: `make migrate-down`
- Migration is reversible

## Working with Database Migrations

### Creating a New Migration
```bash
# From project root
make migrate-create name=add_user_bio_field
```

This creates two files in `backend/db/migrations/`:
- `000XXX_add_user_bio_field.up.sql`
- `000XXX_add_user_bio_field.down.sql`

### Writing Migrations
**Up migration** (000XXX_add_user_bio_field.up.sql):
```sql
ALTER TABLE users ADD COLUMN bio TEXT;
```

**Down migration** (000XXX_add_user_bio_field.down.sql):
```sql
ALTER TABLE users DROP COLUMN bio;
```

### Testing Migrations
```bash
# Apply migration
make migrate-up

# Verify in database
make postgres
\d users  -- Check if bio column exists
\q

# Test reverting
make migrate-down

# Apply again for development
make migrate-up
```

### Migration Best Practices
- Keep migrations small and focused (one logical change)
- Always test both up and down
- Don't modify existing migrations after they're merged
- Add indexes in separate migrations for performance

## Working with Makefile Commands

### Database Commands
```bash
make setup                    # Initial setup: start Docker + run migrations
make end                      # Stop Docker Postgres
make postgres                 # Open psql shell
make check-table table=users  # View table contents
make db-table table=users     # View table schema
make clean-all-data           # DANGER: Wipe all data (dev only)
```

### Migration Commands
```bash
make migrate-create name=migration_name
make migrate-up               # Run pending migrations
make migrate-down             # Revert last migration
make migrate-version          # Show current migration version
make migrate-clean version=X  # Fix dirty migration state
```

### Development Servers
```bash
make server                   # Run backend (local env)
make server-staging           # Run backend (staging env)
make app-dev                  # Run Expo dev client with tunnel
make app-expo                 # Run Expo with clear cache
```

### Build Commands
```bash
make build-dev                # Build iOS dev build
make build-staging            # Build + submit to TestFlight
make build-prod               # Build + submit to App Store (NEVER DO THIS)
```

## Testing Changes

### Backend Testing
```bash
cd backend
go run cmd/main.go

# In another terminal, test endpoints
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

### Frontend Testing
```bash
make app-dev

# Test flows:
# 1. Sign up new account
# 2. Verify email flow
# 3. Upload snippet (as artist)
# 4. Swipe through feed
# 5. Test fire/skip actions
# 6. Check profile updates
```

## Deploying Changes

### Backend (Railway Auto-Deploy)
```bash
# Staging environment
git push origin main  # Railway auto-deploys

# Check logs in Railway dashboard
# Verify migrations ran successfully
```

### Frontend (Manual Build for TestFlight)
```bash
# Build and submit to TestFlight
make build-staging

# Check build status
npx eas build:list

# Once build completes, it auto-submits to TestFlight
# Apple review takes ~24 hours
```

## Code Organization Rules

### Backend
- Each feature gets its own module in `internal/`
- Module structure: `[feature].go`, `[feature]_handler.go`, `[feature]_service.go`, `[feature]_repo.go`
- Handlers = HTTP layer only (no business logic)
- Services = Business logic (no SQL)
- Repos = Database access (no business logic)

### Frontend
- Screens in `src/screens/` (full pages)
- Reusable components in `src/components/`
- API calls in `src/services/api/`
- State management in `src/store/slices/`
- Custom hooks in `src/hooks/`

## Git Commit Messages

Use clear, descriptive commit messages:

**Good:**
```
Add cover art upload to snippets
Fix authentication token refresh bug
Update feed to preload 3 snippets ahead
```

**Bad:**
```
updates
fixed stuff
wip
```

## Branch Naming

- Features: `feature/add-user-profile-bio`
- Bugs: `fix/login-token-expiry`
- Hotfixes: `hotfix/s3-upload-crash`

## When to Ask for Help

- Migration fails and you can't rollback
- Breaking changes to API contracts
- S3/AWS permission issues
- Production bugs or data issues
- Unsure about architecture decisions