.PHONY: all
all:
	@echo nothing yet

# if clone this repo for the first time, run this command to set up the project
.PHONY: first_setup
first_setup:
	@echo "Running first setup..."
	@npm install
	@echo "First setup complete."

# compile smart contracts
.PHONY: compile
compile:
	@echo "Compiling smart contracts..."
	@npm run build:contracts

# deploy smart contracts to local network
.PHONY: deploy-local
deploy-local:
	@echo "Deploying smart contracts to local network..."
	@./node_modules/.bin/hardhat run scripts/deploy-local.ts --network localhost

# deploy smart contracts to testnet
.PHONY: deploy-testnet
deploy-testnet:
	@echo "Deploying smart contracts to testnet..."
	@./node_modules/.bin/hardhat run scripts/deploy.ts --network fuji

# start hardhat node for local development
.PHONY: node
node:
	@echo "Starting Hardhat node..."
	@npx hardhat node

.PHONY: lint
lint:
	@echo "Running linter..."
	@npm run lint

.PHONY: lint-fix
lint-fix:
	@echo "Running linter..."
	@npm run lint:fix

.PHONY: start
start: first_setup compile
	npm run start

.PHONY: dev
dev: first_setup compile
	npm run dev

.PHONY: prod
prod: first_setup build-server
	npm run start

.PHONY: build-server
build-server:
	@echo "Building server code..."
	@npm run build:server

.PHONY: container
container:
	@echo "Running container..."
	@docker compose up -d --build

.PHONY: container-down
container-down:
	@echo "Running container..."
	@docker compose down

.PHONY: test
test:
	@echo "Running tests..."
	@npm run test

.PHONY: clean
clean:
	@echo "Cleaning artifacts..."
	@npx hardhat clean

# Generate a new wallet for blockchain transactions
.PHONY: generate-wallet
generate-wallet:
	@echo "Generating new wallet..."
	@npm run generate-wallet

# Check wallet balance
.PHONY: check-balance
check-balance:
	@echo "Checking wallet balance..."
	@npm run check-balance
