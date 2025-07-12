# Environment Setup Guide - ft_transcendence

## 🚀 Quick Start

1. **Copy environment files for each service:**
   ```bash
   # Main environment (optional - has defaults)
   cp env.example .env
   
   # Game service environment
   cp packages/ms-game/env_example packages/ms-game/.env
   ```

2. **Start all services:**
   ```bash
   make up
   ```

3. **Access your services:**
   - Frontend: http://localhost:3010
   - Authentication: http://localhost:3001
   - Game: http://localhost:3003
   - Grafana: http://localhost:3002
   - Kibana: http://localhost:5601

## 📋 Service Configuration

### Frontend Service (ms-frontend) - Port 3010
Built with Vite + TypeScript + Tailwind CSS
- **URL**: http://localhost:3010
- **Container**: `frontend`
- **Health Check**: http://localhost:3010/health

Configuration in `packages/ms-frontend/vite.config.ts`:
```typescript
server: {
  port: 3010,
  host: true,
}
```

### Authentication Service (ms-auth) - Port 3001
Built with Fastify + Prisma + JWT
- **URL**: http://localhost:3001
- **Container**: `authentication`
- **Health Check**: http://localhost:3001/health

Features:
- JWT-based authentication
- Google OAuth integration
- WebAuthn support
- SQLite database with Prisma ORM

### Game Service (ms-game) - Port 3003
Built with Fastify + p5.js
- **URL**: http://localhost:3003
- **Container**: `game`
- **Health Check**: http://localhost:3003/health

Configuration in `packages/ms-game/env_example`:
```bash
PORT=3003
NODE_ENV=production
HOST=0.0.0.0
LOG_LEVEL=info
GAME_MODE=pong
ENABLE_AI=true
```

## 📊 Monitoring Stack

The project includes a complete observability stack:

### ELK Stack (Logging)
- **Elasticsearch**: http://localhost:9200 (data storage)
- **Kibana**: http://localhost:5601 (log visualization)
- **Logstash**: TCP port 5001 (log processing)

### Prometheus + Grafana (Metrics)
- **Grafana**: http://localhost:3002 (metrics dashboard - admin/admin)
- **Prometheus**: http://localhost:9090 (metrics collection)

## 🔧 Docker Compose Configuration

All services are orchestrated in `docker-compose.yml`:

```yaml
services:
  ms-frontend:     # Port 3010 -> Frontend UI
  ms-auth:         # Port 3001 -> Authentication API
  ms-game:         # Port 3003 -> Game Service
  elasticsearch:   # Port 9200 -> Search & Analytics
  kibana:          # Port 5601 -> Log Visualization
  logstash:        # Port 5001 -> Log Processing
  prometheus:      # Port 9090 -> Metrics Collection
  grafana:         # Port 3002 -> Metrics Dashboard
```

### Container Names
- `frontend` (ms-frontend service)
- `authentication` (ms-auth service)
- `game` (ms-game service)
- `elasticsearch`
- `kibana`
- `logstash`
- `prometheus`
- `grafana`

## 🌐 Environment Variables

### Main Configuration (.env)
```bash
# Project
PROJECT_NAME=ft_transcendence
ENVIRONMENT=development

# Services
FRONTEND_PORT=3010
AUTH_PORT=3001
GAME_PORT=3003

# Monitoring
GRAFANA_PORT=3002
KIBANA_PORT=5601
PROMETHEUS_PORT=9090
ELASTICSEARCH_PORT=9200
LOGSTASH_TCP_PORT=5001

# Network
NETWORK_NAME=ft-net
```

### Game Service (packages/ms-game/.env)
```bash
PORT=3003
NODE_ENV=production
HOST=0.0.0.0
LOG_LEVEL=info
GAME_MODE=pong
ENABLE_AI=true
```

## 🛠️ Development Commands

```bash
# Service Management
make up          # Start all services (with build)
make down        # Stop all services
make restart     # Restart all services

# Quick Access
make run         # Open frontend (3010) and game (3003) in browser
make metrics     # Open Grafana (3002) and Kibana (5601) in browser

# Cleanup
make clean       # Remove all containers, volumes, and images

# Help
make help        # Show all available commands
```

## 🐛 Troubleshooting

### Check Service Status
```bash
# View all containers
docker ps

# Check specific service logs
docker-compose logs frontend
docker-compose logs authentication
docker-compose logs game

# Check health endpoints
curl http://localhost:3010/health  # Frontend
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Game
```

### Port Conflicts
If ports are already in use, update the environment variables:

```bash
# In .env file
FRONTEND_PORT=3011  # Change from 3010
GAME_PORT=3004      # Change from 3003
GRAFANA_PORT=3005   # Change from 3002
```

### Memory Issues
For low-memory systems, reduce Elasticsearch memory:

```yaml
# In docker-compose.yml
elasticsearch:
  environment:
    - ES_JAVA_OPTS=-Xms256m -Xmx256m  # Reduce from 512m
```

### Database Issues (Auth Service)
The auth service uses SQLite with Prisma:

```bash
# Access auth container
docker exec -it authentication sh

# Run Prisma commands
npx prisma db push
npx prisma studio
```

### Log Connectivity
Services automatically attempt to connect to Logstash:
- If Logstash is unavailable, services continue with console logging
- Check Logstash connectivity in service logs
- Logs are still visible via `docker-compose logs [service]`

## 🎯 Architecture Overview

### Microservices Pattern
```
Frontend (3010) ←→ Auth Service (3001) ←→ Game Service (3003)
     ↓                    ↓                        ↓
                    Monitoring Stack
         (Elasticsearch + Kibana + Logstash + Prometheus + Grafana)
```

### Technology Stack
- **Frontend**: Vite, TypeScript, Tailwind CSS
- **Auth**: Fastify, Prisma, JWT, SQLite
- **Game**: Fastify, p5.js, TypeScript
- **Monitoring**: ELK Stack, Prometheus, Grafana
- **Container**: Docker, Docker Compose

### Key Features
- 🏗️ **Microservices architecture** with independent services
- 🔐 **Modern authentication** with JWT and OAuth
- 🎮 **Real-time game** with p5.js rendering
- 📊 **Complete observability** with metrics and logs
- 🐳 **Containerized deployment** with Docker
- 🛠️ **Developer-friendly** with hot reloading and health checks

## 📈 Production Considerations

### Security
- JWT tokens for authentication
- CORS configured for microservices
- Environment-based secrets
- Health checks for reliability

### Scalability
- Independent service scaling
- Load balancer ready
- Stateless service design
- Database per service pattern

### Monitoring
- Structured JSON logging
- Prometheus metrics collection
- Real-time log streaming
- Custom dashboards in Grafana

This setup provides a complete, production-ready foundation for the ft_transcendence project with modern DevOps practices and microservices architecture.