# 🔧 Environment Setup Guide

This document provides comprehensive guidance for setting up environment variables across the entire ft_transcendence project.

## 📁 Environment File Structure

The project uses a hierarchical environment variable structure:

```
ft_transcendence/
├── env.example                     # 🌍 Root environment (all services)
├── packages/ms-auth/env.example     # 🔐 Authentication service
├── packages/ms-frontend/env.example # 🎨 Frontend service  
├── packages/ms-game/env.example     # 🎮 Game service
├── packages/tournament/env.example  # 🏆 Tournament service
└── packages/blockchain/env.example  # ⛓️  Blockchain service
```

## 🚀 Quick Start

### 1. Root Environment Setup

```bash
# Copy the main environment file
cp env.example .env

# Edit with your specific values
nano .env
```

### 2. Service-Specific Setup (Optional)

```bash
# Authentication Service
cp packages/ms-auth/env.example packages/ms-auth/.env

# Frontend Service  
cp packages/ms-frontend/env.example packages/ms-frontend/.env

# Game Service
cp packages/ms-game/env.example packages/ms-game/.env

# Tournament Service
cp packages/tournament/env.example packages/tournament/.env

# Blockchain Service
cp packages/blockchain/env.example packages/blockchain/.env
```

## 🔑 Required Secrets

### Generate JWT Secrets

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use the output for JWT_SECRET and SESSION_SECRET
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3010` (development)
   - `http://localhost:3001` (auth service)
6. Add redirect URIs:
   - `http://localhost:3001/auth/google/callback`

## 🏗️ Environment Hierarchy

### Root Environment (`.env`)
The main `.env` file contains **ALL** variables and serves as the single source of truth.

### Service Environment (Optional)
Individual services can override root values by having their own `.env` files.

**Priority Order:**
1. Service-specific `.env` (highest priority)
2. Root `.env` 
3. Default values in code (lowest priority)

## 🔍 Monitoring & Observability

### Prometheus Configuration

The Prometheus configuration is located in:
- **Config**: `devops/prometheus/prometheus.yml`
- **Alerts**: `devops/prometheus/alerts.yml`

#### Service Job Names
| Service | Job Name | Container | Port |
|---------|----------|-----------|------|
| Frontend | `ms-frontend` | `frontend` | 3010 |
| Auth | `ms-auth` | `authentication` | 3001 |
| Game | `ms-game` | `game` | 3003 |
| Tournament | `tournament` | `tournament` | 4243 |
| Blockchain | `blockchain` | `blockchain` | 3004 |

All services expose metrics at `/metrics` endpoint.

## ⛓️ Blockchain Configuration

### Local Development (Recommended)
```env
AVALANCHE_RPC_URL=http://blockchain-node:8545
AVALANCHE_CHAIN_ID=1337
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Testnet (Advanced)
```env
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
BLOCKCHAIN_PRIVATE_KEY=your_generated_private_key_here
```

## 🗄️ Database Configuration

Each service uses SQLite databases:
- **Auth**: `packages/ms-auth/prisma/dev.db`
- **Tournament**: `packages/tournament/tournament.db`
- **Blockchain**: Local blockchain node (ephemeral)

## 🚪 Port Assignments

| Service | Port | Container Name | Description |
|---------|------|----------------|-------------|
| Frontend | 3010 | `frontend` | Main web interface |
| Auth | 3001 | `authentication` | Authentication API |
| Game | 3003 | `game` | Game engine & WebSocket |
| Tournament | 4243 | `tournament` | Tournament management |
| Blockchain | 3004 | `blockchain` | Blockchain interface |
| Blockchain Node | 8545 | `blockchain-node` | Local Ethereum node |
| Prometheus | 9090 | `prometheus` | Metrics collection |
| Grafana | 3002 | `grafana` | Metrics dashboard |
| Elasticsearch | 9200 | `elasticsearch` | Log storage |
| Logstash | 5001 | `logstash` | Log processing |
| Kibana | 5601 | `kibana` | Log visualization |

## 🔧 Service Communication

### Internal (Container-to-Container)
```env
AUTH_SERVICE_URL=http://authentication:3001
TOURNAMENT_SERVICE_URL=http://tournament:4243
GAME_SERVICE_URL=http://game:3003
BLOCKCHAIN_SERVICE_URL=http://blockchain:3004
```

### External (Browser Access)
```env
API_BASE_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3010
```

## 🐳 Docker Environment Variables

Environment variables are passed to containers via `docker-compose.yml`:

```yaml
services:
  authentication:
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=${AUTH_PORT:-3001}
      - JWT_SECRET=${JWT_SECRET}
      # ... other variables
```

## 🛠️ Development vs Production

### Development
- `NODE_ENV=development`
- Debug logging enabled
- Hot reload in some services
- Local blockchain node

### Production  
- `NODE_ENV=production`
- Optimized builds
- HTTPS enabled (when configured)
- External blockchain networks (if needed)

## 📊 Validation

### Check Environment Loading
```bash
# Start services and check logs
docker-compose up -d
docker-compose logs authentication | grep "Environment"
```

### Verify Prometheus Targets
1. Open http://localhost:9090/targets
2. All services should show as "UP"

### Test Service Communication
```bash
# Health check all services
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Game
curl http://localhost:4243/health  # Tournament
curl http://localhost:3004/health  # Blockchain
```

## ⚠️ Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT_SECRET and SESSION_SECRET
3. **Rotate secrets regularly** in production
4. **Limit OAuth redirect URIs** to specific domains
5. **Use HTTPS in production**

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check for missing environment variables
docker-compose logs service_name | grep -i "environment\|env\|missing"
```

**Prometheus targets down:**
```bash
# Check if service exposes /metrics
curl http://localhost:PORT/metrics
```

**Service communication fails:**
```bash
# Verify internal network connectivity
docker network ls
docker network inspect ft-net
```

### Environment Variable Priority

1. Check service-specific `.env`
2. Check root `.env`
3. Check `docker-compose.yml` defaults
4. Check code defaults

For debugging, add logging to see which values are being used:
```javascript
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  // ... other important vars
});
``` 