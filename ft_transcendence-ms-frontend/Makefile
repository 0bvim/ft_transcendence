.PHONY: all
all:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make preview     - Preview production build"
	@echo "  make lint        - Run linter"
	@echo "  make lint-fix    - Fix linting issues"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make container   - Build and run production container"
	@echo "  make dev-container - Build and run development container"

.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install

.PHONY: dev
dev: install
	@echo "Starting development server..."
	@npm run dev

.PHONY: build
build: install
	@echo "Building for production..."
	@npm run build

.PHONY: preview
preview: build
	@echo "Previewing production build..."
	@npm run preview

.PHONY: lint
lint:
	@echo "Running linter..."
	@npm run lint

.PHONY: lint-fix
lint-fix:
	@echo "Fixing linting issues..."
	@npm run lint:fix

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist node_modules/.cache

.PHONY: container
container:
	@echo "Building and running production container..."
	@docker-compose up --build -d

.PHONY: container-down
container-down:
	@echo "Stopping containers..."
	@docker-compose down

.PHONY: dev-container
dev-container:
	@echo "Building and running development container..."
	@docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build -d

.PHONY: logs
logs:
	@echo "Showing container logs..."
	@docker-compose logs -f

.PHONY: shell
shell:
	@echo "Opening shell in container..."
	@docker-compose exec ms-frontend sh 