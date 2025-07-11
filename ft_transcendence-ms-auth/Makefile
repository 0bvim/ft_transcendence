.PHONY: all
all:
	@echo nothing yet

# prisma studio is a web interface for managing your database
.PHONY: studio
studio:
	@echo "Running prisma studio on web browser..."
	@npx prisma studio

# if clone this repo for the first time, run this command to set up the project
.PHONY: first_setup
first_setup:
	@echo "Running first setup..."
	@npm install
	@npm run build
	@echo "First setup complete."

# run migrations based on setup in package.json
.PHONY: migrations
migrations:
	@echo "Running migrations..."
	@npm run db:migrate

.PHONY: db_push
db_push:
	@echo "Pushing database..."
	@npx prisma db push

.PHONY: db_generate
db_generate:
	@echo "Generating database..."
	@npx prisma generate

# generate migration files based on prisma schema changes
.PHONY: gen-migrate-files
gen-migrate-files:
	@echo "Generating migration files..."
	@npx prisma migrate dev --create-only

.PHONY: lint
lint:
	@echo "Running linter..."
	@npm run lint

.PHONY: lint-fix
lint-fix:
	@echo "Running linter..."
	@npm run lint:fix

.PHONY: start
start: first_setup migrations
	npm run start

.PHONY: dev
dev: first_setup migrations
	npm run dev

.PHONY: container
container:
	@echo "Running container..."
	@docker compose up -d --build

.PHONY: container-down
container-down:
	@echo "Running container..."
	@docker compose down

.PHONY: dev-container
dev-container:
	@echo "Running container..."
	@docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d --build

.PHONY: test
test:
	@echo "Running tests..."
	@npm run test

.PHONY: test-coverage
test-coverage:
	@echo "Running tests..."
	@npm run test:coverage
