# Environment Setup Guide - ft_transcendence

## 🚀 Quick Start

1. **Copy environment files for each service:**
   ```bash
   # Main environment (optional - has defaults)
   cp env.example .env
   
   # Game service environment
   cp packages/ms-game/env_example packages/ms-game/.env
   ```

2. **Configure Google OAuth (Required for login):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set Application type to "Web application"
   - Add authorized redirect URIs:
     - For localhost: `http://localhost:3001/auth/google/callback`
     - For your IP: `http://YOUR_IP_ADDRESS:3001/auth/google/callback` (replace YOUR_IP_ADDRESS with your actual IP)
   - Copy Client ID and Client Secret to your `.env` file

3. **Start all services:**
   ```bash
   make up
   ```

4. **Access your services:**
   - Frontend: http://localhost:3010
   - Authentication: http://localhost:3001
   - Game: http://localhost:3003
   - Grafana: http://localhost:3002
   - Kibana: http://localhost:5601

## 🌐 Multi-Machine Access Setup

To access your application from different machines on the network:

1. **Find your machine's IP address:**
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig | findstr "IPv4"
   ```

2. **Configure the HOST environment variable:**
   ```bash
   # In your .env file
   HOST=192.168.1.100  # Replace with your actual IP address
   FRONTEND_HOST=192.168.1.100
   ```

3. **Update Google OAuth settings:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Update your OAuth 2.0 Client ID
   - Add your IP address to authorized redirect URIs:
     - `http://192.168.1.100:3001/auth/google/callback`

4. **Access from other machines:**
   - Frontend: http://192.168.1.100:3010
   - Authentication: http://192.168.1.100:3001
   - Game: http://192.168.1.100:3003

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
- Google OAuth integration (requires Google Cloud setup)
- WebAuthn support
- SQLite database with Prisma ORM

**Required Environment Variables:**
```bash
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3010/auth/google/callback
```

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

# Dynamic Host Configuration
# Set HOST to your machine's IP address for multi-machine access
HOST=localhost
FRONTEND_HOST=localhost

# Google OAuth (Required for login)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
# GOOGLE_REDIRECT_URI is auto-generated based on HOST and FRONTEND_PORT
# Override only if needed: GOOGLE_REDIRECT_URI=http://your-custom-host:3010/auth/google/callback

# WebAuthn
# WEBAUTHN_RP_ID and WEBAUTHN_ORIGIN are auto-generated based on HOST
# Override only if needed: WEBAUTHN_RP_ID=your-custom-host
WEBAUTHN_RP_NAME=ft_transcendence
# WEBAUTHN_ORIGIN=http://your-custom-host:3010
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

## 🐛 Troubleshooting Multi-Machine Access

### Step 1: Check Your Configuration

Visit the debug endpoint to verify your configuration:
```bash
curl http://YOUR_IP:3001/debug/config
```

This will show you:
- Environment variables being used
- Google OAuth configuration
- WebAuthn settings
- Host configuration

### Step 2: Verify Network Connectivity

Test if your services are accessible from other machines:
```bash
# Test auth service
curl http://YOUR_IP:3001/debug/config

# Test frontend (should return HTML)
curl http://YOUR_IP:3010
```

### Step 3: Check Environment Variables

Make sure your `.env` file is properly configured:
```bash
# In your .env file
HOST=192.168.1.100  # Your actual IP address
FRONTEND_HOST=192.168.1.100  # Same as HOST
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

### Step 4: Google OAuth Setup

1. **Check Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Ensure these redirect URIs are added:
     - `http://localhost:3001/auth/google/callback`
     - `http://YOUR_IP:3001/auth/google/callback`

2. **Test Google OAuth Flow**:
   ```bash
   # Get the OAuth URL
   curl http://YOUR_IP:3001/auth/google
   
   # Should return: {"authUrl": "https://accounts.google.com/oauth/authorize?..."}
   ```

### Step 5: Check Console Logs

Look at the auth service logs for debugging information:
```bash
# If using Docker
docker-compose logs authentication

# If running locally
# Check the terminal where you started the auth service
```

### Step 6: Test From Another Machine

1. **Find your IP address**:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig | findstr "IPv4"
   ```

2. **Access from another machine**:
   - Frontend: `http://YOUR_IP:3010`
   - Auth debug: `http://YOUR_IP:3001/debug/config`

### Common Issues and Solutions

#### Issue: "Google login failed, please try again"
**Possible causes:**
- Incorrect Google OAuth redirect URI
- Missing environment variables
- CORS issues

**Solutions:**
1. Check Google OAuth redirect URI in Google Cloud Console
2. Verify environment variables with debug endpoint
3. Check browser console for CORS errors

#### Issue: "Registration errors"
**Possible causes:**
- Database connection issues
- Validation errors
- Missing JWT secret

**Solutions:**
1. Check auth service logs for specific error messages
2. Verify JWT_SECRET is set in environment
3. Test with debug endpoint

#### Issue: "Cannot connect to auth service"
**Possible causes:**
- Firewall blocking port 3001
- Wrong IP address
- Service not running

**Solutions:**
1. Check if port 3001 is open: `telnet YOUR_IP 3001`
2. Verify service is running: `docker-compose ps`
3. Check firewall settings

### Debug Commands

```bash
# Check if services are running
docker-compose ps

# Check auth service logs
docker-compose logs authentication

# Check frontend logs
docker-compose logs frontend

# Test auth service health
curl http://YOUR_IP:3001/debug/config

# Test frontend health
curl http://YOUR_IP:3010

# Check network connectivity
ping YOUR_IP
telnet YOUR_IP 3001
telnet YOUR_IP 3010
```

### Google OAuth Issues
Common OAuth problems and solutions:

```bash
# Error: redirect_uri_mismatch
# Solution: Update Google Cloud Console with correct redirect URI
# Go to Google Cloud Console → APIs & Services → Credentials
# Add the appropriate redirect URI:
# - For localhost: http://localhost:3001/auth/google/callback
# - For IP access: http://YOUR_IP:3001/auth/google/callback

# Error: invalid_client
# Solution: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env

# Error: CORS issues when accessing from different machines
# Solution: Set HOST environment variable to your machine's IP
# HOST=192.168.1.100 in your .env file

# Error: access_denied
# Solution: User denied permission or OAuth app not verified
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
- Google OAuth 2.0 integration
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