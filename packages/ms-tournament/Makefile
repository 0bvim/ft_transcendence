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

# Tournament specific commands
.PHONY: db_reset
db_reset:
	@echo "Resetting database..."
	@npx prisma migrate reset --force

.PHONY: db_seed
db_seed:
	@echo "Seeding database..."
	@npx prisma db seed

.PHONY: setup
setup: first_setup db_generate migrations
	@echo "Tournament service setup complete."

.PHONY: start
start: first_setup migrations
	npm run start

.PHONY: dev
dev: db_generate db_push
	npm run dev

.PHONY: prod
prod: first_setup db_generate migrations
	npm run start
