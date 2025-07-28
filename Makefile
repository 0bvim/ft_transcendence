# Core application services (without monitoring UI: kibana, prometheus, grafana)
DEV_SERVICES = ms-frontend ms-auth ms-game tournament blockchain-node blockchain logstash elasticsearch

# Services paths
MS-AUTH=packages/ms-auth
MS-FRONTEND=packages/ms-frontend
MS-GAME=packages/ms-game
MS-BLOCKCHAIN=packages/ms-blockchain
MS-TOURNAMENT=packages/ms-tournament

# All Services
SERVICES_PATH=$(MS-AUTH) $(MS-FRONTEND) $(MS-GAME) $(MS-BLOCKCHAIN) $(MS-TOURNAMENT)

# Default to Linux
OS := Linux

# Check for macOS (Darwin kernel)
ifeq ($(shell uname -s), Darwin)
    OS := macOS
endif

up: generate-certs
	@echo "🚀 Starting services in detached mode..."
	docker compose up -d --build

dev:
	@echo "Starting development services (without monitoring stack)..."
	docker compose up -d --build $(DEV_SERVICES)

down:
	@echo "Stopping services... "
	docker compose down

dev-clean:
	@echo "Cleaning and rebuilding development services..."
	docker compose down $(DEV_SERVICES)
	docker compose build --no-cache $(DEV_SERVICES)
	docker compose up -d $(DEV_SERVICES)

restart:
	@echo "Restarting services..."
	docker compose restart

run:
	@echo "Opening application services..."
	@if command -v xdg-open > /dev/null; then \
			xdg-open http://localhost:3010 & \
			xdg-open http://localhost:3003; \
		elif command -v open > /dev/null; then \
			open http://localhost:3010 & \
			open http://localhost:3003; \
		else \
			echo "Could not detect browser opener. Please manually open:"; \
			echo "  Frontend: http://localhost:3010"; \
			echo "  Game: http://localhost:3003"; \
		fi

clean:
	@echo "Removing all Docker resources..."
	docker compose down -v --rmi all
	docker system prune -af
	docker volume prune -f

fclean: clean
	@echo "🔥 Removing certificates and generated files..."
	@for service in $(SERVICES_PATH); do \
		if [ -d $$service/certs ]; then \
			echo "Removing $$service/certs..."; \
			rm -rf $$service/certs; \
		fi; \
	done
	@if [ -d devops/certs ]; then \
		echo "Removing devops/certs..."; \
		rm -rf devops/certs; \
	fi
	@echo "✅ fclean complete."

metrics:
	@echo "Opening monitoring dashboards..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open http://localhost:3002 & \
		xdg-open http://localhost:5601; \
	elif command -v open > /dev/null; then \
		open http://localhost:3002 & \
		open http://localhost:5601; \
	else \
		echo "Could not detect browser opener. Please manually open:"; \
		echo "  Grafana: http://localhost:3002"; \
		echo "  Kibana: http://localhost:5601"; \
	fi

help:
	@echo "ft_transcendence Commands:"
	@echo "make up          - Start all services (frontend, auth, game, monitoring stack)"
	@echo "make dev         - Start development services (excludes Kibana, Prometheus, Grafana UI)"
	@echo "make down        - Stop all services"
	@echo "make dev-clean   - Clean and rebuild development services only"
	@echo "make run         - Open application URLs in browser"
	@echo "make clean       - Full cleanup (remove containers, volumes, images)"
	@echo "make fclean      - Full cleanup and remove generated certificates"
	@echo "make metrics     - Open monitoring dashboards (Grafana & Kibana)"

define generate_elk_certificates
	# Generate ELK stack wildcard certificates using our custom script
	if [ -f ./devops/scripts/generate-elk-certs.sh ]; then \
		echo "🔐 Generating ELK stack wildcard certificates..."; \
		./devops/scripts/generate-elk-certs.sh; \
	else \
		echo "❌ Certificate generation script not found at ./devops/scripts/generate-elk-certs.sh"; \
		exit 1; \
	fi
endef

define generate_microservice_certificates
	# Generate certificates for microservices (if needed)
	for service in $(SERVICES_PATH); do \
		if [ ! -d $$service/certs ]; then \
			mkdir -p $$service/certs; \
		fi; \
		if [ -f $$service/certs/cert.pem ] && [ -f $$service/certs/key.pem ]; then \
				echo "✅ Certificates already exist for $$service"; \
		else \
			echo "🔧 Creating new certificates for $$service"; \
			if command -v mkcert > /dev/null; then \
				mkcert -cert-file $$service/certs/cert.pem -key-file $$service/certs/key.pem 127.0.0.1 localhost; \
			else \
				echo "⚠️ mkcert not found, skipping microservice certificates"; \
			fi; \
		fi; \
	done
endef

define install_mkcert
	if command -v mkcert > /dev/null; then \
		echo "✅ mkcert already installed"; \
	else \
		echo "⚙️ Installing mkcert..."; \
		if [ "$(OS)" = "Linux" ]; then \
			sudo apt-get install mkcert; \
		elif [ "$(OS)" = "macOS" ]; then \
			brew install mkcert; \
		else \
			echo "🅧 Could not detect package manager. Please install mkcert manually."; \
		fi \
	fi
endef

generate-certs:
	@echo "⏲️ Generating SSL certificates..."
	@$(call generate_elk_certificates)
	@$(call install_mkcert)
	@$(call generate_microservice_certificates)

.PHONY: up dev down dev-clean restart logs clean fclean metrics generate-certs
