# Vault

A mobile app for finding underground rap before it blows up. You swipe through short snippets of unreleased songs from lesser-known artists. Swipe right to save the song and follow the artist, swipe left to skip.

This repo is the first version of Vault, which I built end to end. Go API, Postgres, S3 audio storage, and a React Native app. I'm keeping it public as a portfolio piece. Development has since moved to a private repo, so this one isn't maintained.

## Stack

- Backend: Go, PostgreSQL, AWS S3
- Frontend: React Native, Expo, Redux Toolkit
- Infra: Docker for local Postgres, Railway for the backend, EAS for iOS builds, GitHub Actions

## Repo layout

- `backend/` - Go API, built in three layers (handlers, services, repositories), plus migrations
- `frontend/` - React Native app
- `Makefile` - commands for setup, running, migrations, and builds
- `compose.yaml` - local Postgres

## Running it locally

You'll need Docker, Go, and Node. The staging and prod environments are shut down, so this only runs locally, against your own Postgres and S3 setup.

```bash
npm install
go mod tidy
make setup      # starts postgres and runs migrations
make server     # backend
make app-dev    # frontend, in a second terminal
```

Other commands:

```bash
make postgres                       # open a db shell
make migrate-up                     # run migrations
make migrate-create name=<name>     # new migration
```