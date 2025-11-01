# Getting Started with Vault

## Prerequisites
Install these first:
- **Node.js 18+** and npm
- **Go 1.21+**
- **Docker Desktop** (for PostgreSQL)
- **Expo CLI**: `npm install -g expo-cli`
- **AWS CLI** (for S3 access)
- **golang-migrate**: `brew install golang-migrate` (Mac) or see [install guide](link)

## Initial Setup

### 1. Clone and Install
```bash
git clone <repo>
cd vault
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env.local
# Edit .env.local - contact me for vars
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env - add your local backend URL
```

### 4. Database Setup
```bash
# From project root
make setup  # Starts Docker Postgres + runs migrations
```

### 5. Start Development
```bash
# Terminal 1 - Backend
make server

# Terminal 2 - Frontend
make app-dev
```

### 6. Verify It Works
- Backend: http://localhost:8080/health should return 404
- Frontend: Expo should open with QR code, scan with Expo Go app
- Create account and upload a snippet to test full flow

## Common Issues

### "Port 5432 already in use"
Another Postgres running. Stop it: `brew services stop postgresql` or check Docker.

### "Migration version dirty"
Database is in bad state:
```bash
make migrate-clean version=X  # X = last successful version
make migrate-up
```

### "S3 Access Denied"
Check AWS credentials: `aws configure` and verify bucket permissions.

### Backend won't start
- Check .env.local has all required variables
- Verify Postgres is running: `docker ps`
- Check logs for specific error

### Frontend "Network Error"
- Verify backend is running on correct port
- Check frontend/.env has correct API_URL
- Try ngrok if on physical device: `ngrok http 8080`