# Core application services (without monitoring UI: kibana, prometheus, grafana)
DEV_SERVICES = ms-frontend ms-auth ms-game tournament blockchain-node blockchain logstash elasticsearch

# Services paths
MS-AUTH=packages/ms-auth
MS-FRONTEND=packages/ms-frontend
MS-GAME=packages/ms-game
# unlock after finish implementation of services
# MS-BLOCKCHAIN=packages/ms-blockchain
# MS-OBSERVABILITY=packages/ms-observability
# MS-TOURNAMENT=packages/ms-tournament

# All Services
# SERVICES_PATH=$(MS-AUTH) $(MS-BLOCKCHAIN) $(MS-FRONTEND) $(MS-GAME) $(MS-OBSERVABILITY) $(MS-TOURNAMENT)
SERVICES_PATH=$(MS-AUTH) $(MS-FRONTEND) $(MS-GAME)

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
	@echo "make metrics     - Open monitoring dashboards (Grafana & Kibana)"

define create_certificates
	# Generate certificates for microservices
	for service in $(SERVICES_PATH); do \
		if [ ! -d $$service/certs ]; then \
			mkdir -p $$service/certs; \
		fi; \
		if [ -f $$service/certs/cert.pem ] && [ -f $$service/certs/key.pem ]; then \
				echo "✅ Certificates already exist for $$service"; \
		else \
			echo "🔧 Creating new certificates for $$service"; \
			mkcert -cert-file $$service/certs/cert.pem -key-file $$service/certs/key.pem 127.0.0.1 localhost; \
		fi; \
	done

	# Generate certificates for observability stack
	if [ ! -d devops/certs ]; then \
		mkdir -p devops/certs; \
	fi; \
	for service in elasticsearch kibana logstash prometheus grafana; do \
		if [ -f devops/certs/$$service.crt ] && [ -f devops/certs/$$service.key ]; then \
			if openssl x509 -checkend 86400 -noout -in devops/certs/$$service.crt > /dev/null 2>&1; then \
				echo "✅ Valid certificates already exist for $$service"; \
			else \
				echo "🔧 Regenerating expired certificates for $$service"; \
				mkcert -cert-file devops/certs/$$service.crt -key-file devops/certs/$$service.key localhost 127.0.0.1; \
			fi; \
		else \
			echo "🔧 Creating new certificates for $$service"; \
			mkcert -cert-file devops/certs/$$service.crt -key-file devops/certs/$$service.key localhost 127.0.0.1; \
		fi; \
	done; \
	# Generate PKCS12 keystore for Logstash SSL \
	if [ -f devops/certs/logstash.crt ] && [ -f devops/certs/logstash.key ]; then \
		echo "🔧 Creating PKCS12 keystore for Logstash"; \
		openssl pkcs12 -export -out devops/certs/logstash.p12 -inkey devops/certs/logstash.key -in devops/certs/logstash.crt -password pass:logstash 2>/dev/null || true; \
	fi; \
	# Fix permissions for certificate files to ensure containers can read them \
	chmod 644 devops/certs/*.crt 2>/dev/null || true; \
	chmod 644 devops/certs/*.key 2>/dev/null || true; \
	chmod 644 devops/certs/*.p12 2>/dev/null || true
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
	@$(call install_mkcert)
	@$(call create_certificates)

.PHONY: up dev down dev-clean restart logs clean metrics generate-certs
