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
	@echo "⏳ Waiting for Elasticsearch to be ready..."
	@$(call wait_for_elasticsearch)
	@echo "🔐 Setting up ELK users automatically..."
	@$(call setup_elk_users)
	@echo "🔐 Setting up Prometheus authentication automatically..."
	@$(call setup_prometheus_auth)

dev:
	@echo "Starting development services (without monitoring stack)..."
	docker compose up -d --build $(DEV_SERVICES)

down:
	@echo "Stopping services... "
	@if [ -f .env ]; then \
		docker-compose --env-file .env down; \
	else \
		docker-compose down; \
	fi

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
			xdg-open https://localhost:3000 & \
			xdg-open https://localhost:3006; \
		elif command -v open > /dev/null; then \
			open https://localhost:3000 & \
			open https://localhost:3006; \
		else \
			echo "Could not detect browser opener. Please manually open:"; \
			echo "  Frontend: https://localhost:3000"; \
			echo "  Game: https://localhost:3006"; \
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
	@echo "make setup-elk-users - Set up ELK users with fixed passwords from .env"
	@echo "make metrics     - Open monitoring dashboards (Grafana & Kibana)"

define generate_observability_certificates
	# Generate certificates for observability stack (ELK + Prometheus + Grafana)
	if [ ! -d devops/certs ]; then \
		mkdir -p devops/certs; \
	fi; \
	for service in elasticsearch kibana logstash prometheus grafana; do \
		if [ -f devops/certs/$$service.crt ] && [ -f devops/certs/$$service.key ]; then \
			if openssl x509 -checkend 86400 -noout -in devops/certs/$$service.crt > /dev/null 2>&1; then \
				echo "✅ Valid certificates already exist for $$service"; \
			else \
				echo "🔧 Regenerating expired certificates for $$service"; \
				if command -v mkcert > /dev/null; then \
					mkcert -cert-file devops/certs/$$service.crt -key-file devops/certs/$$service.key *.localhost localhost 127.0.0.1; \
				else \
					echo "⚠️ mkcert not found, skipping $$service certificates"; \
				fi; \
			fi; \
		else \
			echo "🔧 Creating new certificates for $$service"; \
			if command -v mkcert > /dev/null; then \
				mkcert -cert-file devops/certs/$$service.crt -key-file devops/certs/$$service.key *.localhost localhost 127.0.0.1; \
			else \
				echo "⚠️ mkcert not found, skipping $$service certificates"; \
			fi; \
		fi; \
	done; \
	# Generate CA certificate for ELK internal communication \
	if [ ! -f devops/certs/ca.crt ]; then \
		echo "🔧 Creating CA certificate for ELK internal communication"; \
		if command -v mkcert > /dev/null; then \
			mkcert -install > /dev/null 2>&1 || true; \
			if [ -f "$$(mkcert -CAROOT)/rootCA.pem" ]; then \
				cp "$$(mkcert -CAROOT)/rootCA.pem" devops/certs/ca.crt; \
				echo "✅ CA certificate copied from mkcert"; \
			else \
				echo "⚠️ mkcert CA not found, creating self-signed CA"; \
				openssl req -x509 -newkey rsa:2048 -keyout devops/certs/ca.key -out devops/certs/ca.crt -days 365 -nodes -subj "/CN=ELK-CA" 2>/dev/null; \
			fi; \
		else \
			echo "🔧 Creating self-signed CA certificate"; \
			openssl req -x509 -newkey rsa:2048 -keyout devops/certs/ca.key -out devops/certs/ca.crt -days 365 -nodes -subj "/CN=ELK-CA" 2>/dev/null; \
		fi; \
	fi; \
	# Fix permissions for certificate files \
	chmod 644 devops/certs/*.crt 2>/dev/null || true; \
	chmod 644 devops/certs/*.key 2>/dev/null || true
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
	@$(call install_mkcert)
	@$(call generate_observability_certificates)
	@$(call generate_microservice_certificates)
	@$(call ensure_ca_certificate)

define ensure_ca_certificate
	# Ensure CA certificate exists for ELK internal communication
	if [ ! -f devops/certs/ca.crt ]; then \
		echo "🔧 Creating CA certificate for ELK internal communication"; \
		if command -v mkcert > /dev/null; then \
			mkcert -install > /dev/null 2>&1 || true; \
			if [ -f "$$(mkcert -CAROOT)/rootCA.pem" ]; then \
				cp "$$(mkcert -CAROOT)/rootCA.pem" devops/certs/ca.crt; \
				echo "✅ CA certificate copied from mkcert"; \
			else \
				echo "⚠️ mkcert CA not found, creating self-signed CA"; \
				openssl req -x509 -newkey rsa:2048 -keyout devops/certs/ca.key -out devops/certs/ca.crt -days 365 -nodes -subj "/CN=ELK-CA" 2>/dev/null; \
			fi; \
		else \
			echo "🔧 Creating self-signed CA certificate"; \
			openssl req -x509 -newkey rsa:2048 -keyout devops/certs/ca.key -out devops/certs/ca.crt -days 365 -nodes -subj "/CN=ELK-CA" 2>/dev/null; \
		fi; \
		chmod 644 devops/certs/ca.crt 2>/dev/null || true; \
	else \
		echo "✅ CA certificate already exists"; \
	fi
endef

define wait_for_elasticsearch
	# Wait for Elasticsearch to be ready before setting up users
	for i in $$(seq 1 60); do \
		if curl -k -s https://elasticsearch.localhost:9200/_cluster/health > /dev/null 2>&1; then \
			echo "✅ Elasticsearch is ready"; \
			break; \
		fi; \
		echo "⏳ Waiting for Elasticsearch (attempt $$i/60)..."; \
		sleep 2; \
	done
endef

define setup_elk_users
	# Set up ELK built-in users with fixed passwords from .env
	echo "🔐 Setting up ELK Stack built-in users with fixed passwords..."; \
	echo "📄 Loading environment variables from .env..."; \
	if [ ! -f .env ]; then \
		echo "❌ .env file not found."; \
		exit 1; \
	fi; \
	NEW_ELASTIC_PASSWORD=$$(grep '^ELASTIC_PASSWORD=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
	echo "✅ Loaded environment variables from .env"; \
	echo "🔍 Checking Elasticsearch availability..."; \
	for i in $$(seq 1 30); do \
		if curl -k -s https://elasticsearch.localhost:9200/_cluster/health > /dev/null 2>&1; then \
			echo "✅ Elasticsearch is running"; \
			break; \
		fi; \
		echo "⏳ Waiting for Elasticsearch (attempt $$i/30)..."; \
		sleep 2; \
	done; \
	echo "🔐 Ensuring 'elastic' user password is set from .env..."; \
	curl -k -s -u "elastic:changeme" -X POST "https://elasticsearch.localhost:9200/_security/user/elastic/_password" -H "Content-Type: application/json" -d "{\"password\":\"$$NEW_ELASTIC_PASSWORD\"}" > /dev/null; \
	echo "🔐 Setting up all other built-in user passwords..."; \
	for user in kibana_system logstash_system beats_system apm_system remote_monitoring_user; do \
		echo "🔑 Setting password for user: $$user"; \
		password_var=$$(echo $$user | tr '[:lower:]' '[:upper:]' | sed 's/_SYSTEM/_SYSTEM/' | sed 's/REMOTE_MONITORING_USER/REMOTE_MONITORING_USER/')_PASSWORD; \
		password=$$(grep "^$$password_var=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		if [ -z "$$password" ]; then \
			password="syspass"; \
		fi; \
		response=$$(curl -k -s -w "%{http_code}" -u "elastic:$$NEW_ELASTIC_PASSWORD" \
			-X POST "https://elasticsearch.localhost:9200/_security/user/$$user/_password" \
			-H "Content-Type: application/json" \
			-d "{\"password\":\"$$password\"}"); \
		http_code=$$(echo "$$response" | tail -c 4); \
		if [ "$$http_code" = "200" ]; then \
			echo "✅ Password set successfully for $$user"; \
		else \
			echo "❌ Failed to set password for $$user (HTTP $$http_code)"; \
		fi; \
	done; \
	echo "🧪 Verifying user authentication..."; \
	for user in elastic kibana_system logstash_system; do \
		password_var=$$(echo $$user | tr '[:lower:]' '[:upper:]' | sed 's/_SYSTEM/_SYSTEM/')_PASSWORD; \
		password=$$(grep "^$$password_var=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		if [ -z "$$password" ]; then \
			if [ "$$user" = "elastic" ]; then \
				password="changeme"; \
			else \
				password="syspass"; \
			fi; \
		fi; \
		if curl -k -s -u "$$user:$$password" https://elasticsearch.localhost:9200/_security/_authenticate > /dev/null 2>&1; then \
			echo "✅ $$user authentication verified"; \
		else \
			echo "❌ $$user authentication failed"; \
		fi; \
	done; \
	echo "🎉 ELK Stack user setup completed!"
endef

define setup_prometheus_auth
	# Set up Prometheus basic authentication with bcrypt hash from .env
	echo "🔐 Setting up Prometheus basic authentication..."; \
	echo "📄 Loading environment variables from .env..."; \
	if [ ! -f .env ]; then \
		echo "❌ .env file not found."; \
		exit 1; \
	fi; \
	PROMETHEUS_USERNAME=$$(grep '^PROMETHEUS_USERNAME=' .env | cut -d'=' -f2 | tr -d '"'); \
	PROMETHEUS_PASSWORD=$$(grep '^PROMETHEUS_PASSWORD=' .env | cut -d'=' -f2 | tr -d '"'); \
	if [ -z "$$PROMETHEUS_USERNAME" ] || [ -z "$$PROMETHEUS_PASSWORD" ]; then \
		echo "❌ PROMETHEUS_USERNAME or PROMETHEUS_PASSWORD not found in .env"; \
		exit 1; \
	fi; \
	echo "🔑 Generating bcrypt hash for Prometheus password..."; \
	PASSWORD_HASH=$$(docker run --rm httpd:2.4-alpine htpasswd -bnBC 10 "" "$$PROMETHEUS_PASSWORD" | tr -d ':\n' | sed 's/^//'); \
	echo "📝 Updating Prometheus web-config.yml with authentication..."; \
	echo "tls_server_config:" > devops/prometheus/web-config.yml; \
	echo "  cert_file: /etc/prometheus/certs/prometheus.crt" >> devops/prometheus/web-config.yml; \
	echo "  key_file: /etc/prometheus/certs/prometheus.key" >> devops/prometheus/web-config.yml; \
	echo "" >> devops/prometheus/web-config.yml; \
	echo "basic_auth_users:" >> devops/prometheus/web-config.yml; \
	echo "  $$PROMETHEUS_USERNAME: $$PASSWORD_HASH" >> devops/prometheus/web-config.yml
	echo "✅ Prometheus authentication configured with user: $$PROMETHEUS_USERNAME"
endef

setup-elk-users:
	@echo "🔐 Setting up ELK users with fixed passwords..."
	@$(call setup_elk_users)

setup-prometheus-auth:
	@echo "🔐 Setting up Prometheus authentication..."
	@$(call setup_prometheus_auth)

.PHONY: up dev down dev-clean restart logs clean fclean metrics generate-certs setup-elk-users setup-prometheus-auth
