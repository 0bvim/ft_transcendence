# Environment Setup Guide

## Overview
The ft_transcendence project uses a hybrid environment variable management approach with:
- Root `.env` file for common/shared variables
- Service-specific `.env` files for application-specific configurations

## Setup Instructions

### 1. Root Environment Configuration
Copy the root environment template:
```bash
cp ..env.example .env
```

Edit `.env` with your specific values for:
- Project configuration
- Port allocations
- Logging settings
- Shared security settings

### 2. Service-Specific Environment Configuration
Each microservice requires its own `.env` file. Copy the templates:

```bash
# Frontend service
cp packages/ms-frontend/..env.example packages/ms-frontend/.env

# Authentication service  
cp packages/ms-auth/..env.example packages/ms-auth/.env

# Game service
cp packages/ms-game/..env.example packages/ms-game/.env

# Tournament service
cp packages/ms-tournament/..env.example packages/ms-tournament/.env

# Blockchain service
cp packages/ms-blockchain/..env.example packages/ms-blockchain/.env
```

### 3. Required Environment Variables

#### Root .env
- `PROJECT_NAME`: Project identifier
- `NETWORK_NAME`: Docker network name
- `*_PORT`: Port allocations for each service
- `LOG_LEVEL`: Logging level
- `JWT_SECRET`: Shared JWT secret

#### Service-Specific .env Files
Each service has its own requirements documented in the respective `.env.example` files.

### 4. Security Notes
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific configurations

## Port Allocations
- ms-frontend: 3000
- ms-auth: 3001  
- ms-game: 3002
- ms-tournament: 3003
- ms-blockchain: 3004
- ms-blockchain-node: 3005

## Docker Compose Integration
The docker-compose.yml references both levels:
```yaml
env_file:
  - .env                    # Root common variables
  - ./packages/SERVICE/.env # Service-specific variables
```

This allows for flexible environment management across development, staging, and production environments.
