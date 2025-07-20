# 🎮 ft_transcendence - Microservices Pong Platform

> **A modern transcendence project with microservices architecture, blockchain integration, and professional DevOps practices**

## 🏗️ Project Overview

**ft_transcendence** is a comprehensive Pong gaming platform built with:

- **🎯 Real-time Pong Game** - Multi-player support with WebSocket integration
- **🏆 Tournament System** - Complete bracket management and scoring
- **⛓️ Blockchain Integration** - Immutable tournament score recording
- **🔐 Advanced Authentication** - JWT, 2FA, Google OAuth, WebAuthn
- **📊 Full Observability** - ELK stack + Prometheus/Grafana monitoring
- **🐳 Containerized Architecture** - Docker-based microservices

## 🚀 Quick Start

```bash
# 1. Setup environment
cp env.example .env
# Edit .env with your configuration

# 2. Start all services
docker-compose up -d

# 3. Access the application
open http://localhost:3010
```

## 📚 Documentation Structure

### 🔧 Setup & Configuration
- **[Environment Setup](docs/setup/environment-setup.md)** - Complete environment configuration guide
- **[Blockchain Wallet Setup](docs/setup/blockchain-wallet-setup.md)** - Blockchain wallet and token setup  
- **[ENV Setup](docs/setup/env-setup.md)** - Legacy environment setup reference

### 🏗️ Architecture
- **[Blockchain Architecture](docs/architecture/blockchain-architecture.md)** - Two-layer blockchain design with charts
- **[Container Architecture](docs/architecture/containers.mmd)** - Container relationships diagram
- **[Sequence Diagrams](docs/architecture/sequence-diagram.mmd)** - System interaction flows

### 🔧 Services
- **[Authentication Service](docs/services/auth-service.md)** - JWT, 2FA, OAuth implementation
- **[Frontend Service](docs/services/frontend-service.md)** - TypeScript + Tailwind SPA
- **[Game Service](docs/services/game-service.md)** - Real-time Pong game engine
- **[Observability](docs/services/observability.md)** - Logging, metrics, and monitoring

### 🌐 API Reference
- **[Authentication API](docs/api/auth-api-requests.md)** - Complete API endpoints with curl examples

### 📋 Project Reference
- **[Subject Requirements](docs/subject.txt)** - Original ft_transcendence project requirements

## 🛠️ Technology Stack

### **Frontend**
- **TypeScript** + **Tailwind CSS** + **Vite**
- **p5.js** for game rendering
- **WebSocket** for real-time gameplay

### **Backend Microservices**
- **Fastify** (Node.js framework)
- **SQLite** with **Prisma ORM**
- **JWT** + **2FA** authentication
- **WebAuthn** security

### **Blockchain**
- **Hardhat** local development network
- **Solidity** smart contracts
- **Avalanche** compatible (testnet/mainnet ready)

### **DevOps & Monitoring**
- **Docker** + **docker-compose**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Prometheus** + **Grafana**
- **Professional logging** and metrics

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Game Service  │    │  Auth Service   │
│   :3010         │◄──►│   :3003         │◄──►│   :3001         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │  Tournament     │    │   Blockchain    │    │  Blockchain     │
         │  Service :4243  │◄──►│   Service :3004 │◄──►│   Node :8545    │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
                                         │
         ┌─────────────────┐             ▼
         │   Monitoring    │    ┌─────────────────┐
         │   Stack         │◄───│  Smart Contract │
         │   ELK + P/G     │    │  TournamentScoring│
         └─────────────────┘    └─────────────────┘
```

## 🎮 Features

### **🏓 Core Game**
- ✅ Real-time multiplayer Pong
- ✅ AI opponent with adjustable difficulty
- ✅ Smooth 60fps gameplay
- ✅ WebSocket-based networking

### **🏆 Tournament System**
- ✅ Single elimination brackets
- ✅ Automatic matchmaking
- ✅ Live score tracking
- ✅ Blockchain score verification

### **🔐 Security & Authentication**
- ✅ JWT-based authentication
- ✅ Two-Factor Authentication (TOTP + WebAuthn)
- ✅ Google OAuth integration
- ✅ Secure password hashing (bcrypt)

### **⛓️ Blockchain Integration**
- ✅ Local development blockchain
- ✅ Automatic smart contract deployment
- ✅ Immutable tournament scoring
- ✅ Avalanche testnet/mainnet ready

### **📊 Professional DevOps**
- ✅ Complete containerization
- ✅ Health checks and monitoring
- ✅ Structured logging (ELK stack)  
- ✅ Metrics and alerting (Prometheus/Grafana)

## 🌐 Service Endpoints

| Service | Port | Endpoint | Description |
|---------|------|----------|-------------|
| **Frontend** | 3010 | http://localhost:3010 | Main web interface |
| **Authentication** | 3001 | http://localhost:3001 | Auth API |
| **Game** | 3003 | http://localhost:3003 | Game engine + WebSocket |
| **Tournament** | 4243 | http://localhost:4243 | Tournament management |
| **Blockchain** | 3004 | http://localhost:3004 | Blockchain API |
| **Prometheus** | 9090 | http://localhost:9090 | Metrics dashboard |
| **Grafana** | 3002 | http://localhost:3002 | Monitoring UI |
| **Kibana** | 5601 | http://localhost:5601 | Log analysis |

## 🔍 Health Checks

```bash
# Check all services
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Game  
curl http://localhost:4243/health  # Tournament
curl http://localhost:3004/health  # Blockchain

# Monitor system
open http://localhost:9090/targets  # Prometheus targets
open http://localhost:3002          # Grafana dashboards
```

## 🏁 Subject Compliance

This implementation fulfills all **ft_transcendence subject requirements**:

- ✅ **Mandatory**: TypeScript frontend, Docker deployment, Pong game, tournament system
- ✅ **Major Modules**: Backend framework (Fastify), User management, Blockchain scores
- ✅ **Major Modules**: Remote players, 2FA/JWT, Microservices architecture  
- ✅ **Major Modules**: DevOps (ELK stack), AI opponent
- ✅ **Minor Modules**: Database (SQLite), Frontend toolkit (Tailwind), Monitoring

**Total: 7+ Major Modules + Multiple Minor Modules** = Complete subject compliance

## 👥 Contributing

1. Follow the established patterns in the documentation
2. Update relevant docs when making changes
3. Test changes with `docker-compose up -d`
4. Check service health endpoints

## 📝 License

This project is part of the 42 School ft_transcendence curriculum.

---

**🎯 Ready to play? Start with the [Environment Setup Guide](docs/setup/environment-setup.md)!**