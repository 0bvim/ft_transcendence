# Environment Setup Guide - ft_transcendence

## 🚀 Quick Start

1. **Copy environment files for each service:**
   ```bash
   cp packages/frontend/env_example packages/frontend/.env
   cp packages/game/env_example packages/game/.env
   ```

2. **Start all services:**
   ```bash
   make up
   ```

3. **Access your services:**
   - Frontend: http://localhost:3005
   - Game: http://localhost:3002  
   - Grafana: http://localhost:3001
   - Kibana: http://localhost:5601

## 📋 Service Configuration

### Frontend Service (Port 3005)
```bash
# packages/frontend/.env
PORT=3005
NODE_ENV=production
HOST=0.0.0.0
LOG_LEVEL=info
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000
GAME_SERVICE_URL=http://localhost:3002
```

### Game Service (Port 3002)
```bash
# packages/game/.env
PORT=3002
NODE_ENV=production
HOST=0.0.0.0
LOG_LEVEL=info
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000
GAME_MODE=pong
ENABLE_AI=true
```

## 📊 Monitoring Stack

The project includes a complete monitoring stack with:

### ELK Stack (Logging)
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601
- **Logstash**: TCP port 5000

### Prometheus + Grafana (Metrics)
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🔧 Docker Compose Configuration

All services are configured in `docker-compose.yml` with sensible defaults:

```yaml
services:
  frontend:    # Port 3005
  game:        # Port 3002
  elasticsearch: # Port 9200
  kibana:      # Port 5601
  logstash:    # Port 5000
  prometheus:  # Port 9090
  grafana:     # Port 3001
```

## 🛠️ Troubleshooting

### Port Conflicts
If any ports are already in use, you can change them by updating the corresponding environment variables in `docker-compose.yml`:

```yaml
# Example: Change frontend port
frontend:
  ports:
    - "3006:3005"  # Use port 3006 instead of 3005
```

### Memory Issues
If you encounter memory issues with Elasticsearch:

```bash
# In docker-compose.yml, reduce memory allocation:
elasticsearch:
  environment:
    - ES_JAVA_OPTS=-Xms256m -Xmx256m
```

### Log Connectivity
Services will automatically try to connect to Logstash. If it's not available:
- Services will continue to log to console
- No need to change configuration

## 🎯 Project Overview

This setup provides:
1. **Two main services**: Frontend (login/UI) and Game (Pong)
2. **Complete monitoring**: Logs in Kibana, metrics in Grafana
3. **Simple commands**: `make up` to start, `make down` to stop
4. **Professional setup**: All logs visible in console + dashboards

### Quick Commands
```bash
make up      # Start everything
make down    # Stop everything
make run     # Open apps in browser
make metrics # Open monitoring dashboards
make clean   # Full cleanup
```

The project demonstrates modern DevOps practices including:
- Containerized applications
- Structured logging
- Metrics collection
- Service monitoring
- Modern web development
