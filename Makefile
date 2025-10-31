DB_URL := postgres://vault:vault@localhost:5432/vault?sslmode=disable
MIGRATIONS_PATH := backend/db/migrations

setup:
	docker compose up -d
	@echo "Wating for postgres"
	@sleep 5
	make migrate-up

end:
	docker compose down

server:
	cd backend && go run cmd/main.go
app-expo:
	cd frontend && npx expo start --clear --tunnel

app-dev:
	cd frontend && npx expo start --dev-client --tunnel

db-table:
	docker exec -it vault-vault-1 psql -U vault -d vault -c "\d $(table)"

clean-all-data:
	docker exec -it vault-vault-1 psql -U vault -d vault -c "\
		TRUNCATE TABLE refresh_tokens CASCADE; \
		TRUNCATE TABLE email_tokens CASCADE; \
		TRUNCATE TABLE password_tokens CASCADE; \
		TRUNCATE TABLE snippets CASCADE; \
		TRUNCATE TABLE users RESTART IDENTITY CASCADE;"

postgres:
	docker exec -it vault-vault-1 psql -U vault -d vault

check-table:
	docker exec -it vault-vault-1 psql -U vault -d vault -c "SELECT * FROM $(table);"

migrate-create:
	migrate create -ext sql -dir $(MIGRATIONS_PATH) -seq $(name)

migrate-up:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down 1

migrate-version:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" version

migrate-clean:
	migrate -path $(MIGRATIONS_PATH) -database $(DB_URL) force $(version)

build-dev-all:
	cd frontend && eas build --platform all --profile development

build-prod-all:
	cd frontend && eas build --platform all --profile production

build-dev-android:
	cd frontend && eas build --platform android --profile development

build-dev-ios:
	cd frontend && eas build --platform ios --profile development

build-prod-android:
	cd frontend && eas build --platform android --profile production

build-prod-ios:
	cd frontend && eas build --platform ios --profile production --auto-submit

.PHONY: setup end postgres migrate-create migrate-up migrate-down migrate-version migrate-clean server db-table check-table clean-all-data app build-prod-all build-dev-all build-dev-android build-dev-ios build-prod-android build-prod-ios app-dev