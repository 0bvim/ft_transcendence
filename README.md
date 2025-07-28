# ft_transcendence - Microservices Architecture

🎮 **A modern transcendence project with microservices architecture and professional DevOps practices**

## 📋 Project Overview

This is a **microservices-based ft_transcendence** implementation featuring:

- 🏗️ **Microservices Architecture**: Separate services for frontend, authentication, and game
- 🎯 **Pong Game**: Classic game built with TypeScript and p5.js
- 🔐 **Authentication Service**: JWT-based auth with Google OAuth and WebAuthn support
- 🌐 **Frontend Service**: Modern UI with Vite, TypeScript, and Tailwind CSS
- 📊 **Complete Observability**: ELK Stack + Prometheus + Grafana for monitoring
- 🐳 **Containerized**: All services run in Docker containers
- 📈 **Production Ready**: Structured logging, metrics, health checks

## 🚀 Quick Start

```bash
# 1. Clone and navigate to project
cd ft_transcendence

# 2. Start all services
make up

# 3. Open applications in browser
make run

# 4. View monitoring dashboards
make metrics
```

## 🌐 Service URLs

| Service | URL | Description | Status |
|---------|-----|-------------|--------|
| **Frontend** | http://localhost:3010 | Main application interface | ✅ |
| **Authentication** | http://localhost:3001 | Auth API endpoints | ✅ |
| **Game** | http://localhost:3003 | Pong game service | ✅ |
| **Grafana** | http://localhost:3002 | Metrics dashboard (admin/admin) | ✅ |
| **Kibana** | http://localhost:5601 | Logs visualization | ✅ |
| **Prometheus** | http://localhost:9090 | Metrics collection | ✅ |
| **Elasticsearch** | http://localhost:9200 | Search and analytics | ✅ |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ft_transcendence                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   Frontend      │  │   Auth Service  │  │   Game Service  │            │
│  │   (Port 3010)   │  │   (Port 3001)   │  │   (Port 3003)   │            │
│  │                 │  │                 │  │                 │            │
│  │ • Vite + TS     │  │ • Fastify       │  │ • Fastify       │            │
│  │ • Tailwind CSS  │  │ • Prisma ORM    │  │ • p5.js Game    │            │
│  │ • UI Components │  │ • JWT Auth      │  │ • Static Assets │            │
│  │                 │  │ • Google OAuth  │  │ • Health Check  │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     Monitoring & Observability                         │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Elasticsearch│  │   Kibana    │  │  Logstash   │  │ Prometheus  │   │ │
│  │  │ (Port 9200) │  │ (Port 5601) │  │ (Port 5001) │  │ (Port 9090) │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │  ┌─────────────┐                                                        │ │
│  │  │   Grafana   │                                                        │ │
│  │  │ (Port 3002) │                                                        │ │
│  │  └─────────────┘                                                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
ft_transcendence/
├── packages/
│   ├── ms-frontend/           # Frontend microservice (Vite + TypeScript)
│   │   ├── src/              # Source code
│   │   ├── public/           # Static assets
│   │   ├── Dockerfile        # Container configuration
│   │   ├── package.json      # Dependencies
│   │   └── vite.config.ts    # Vite configuration
│   │
│   ├── ms-auth/              # Authentication microservice (Fastify + Prisma)
│   │   ├── src/              # Source code
│   │   ├── prisma/           # Database schema
│   │   ├── Dockerfile        # Container configuration
│   │   └── package.json      # Dependencies
│   │
│   ├── ms-game/              # Game microservice (Fastify + p5.js)
│   │   ├── src/              # Server source code
│   │   ├── public/           # Game assets
│   │   ├── Dockerfile        # Container configuration
│   │   ├── package.json      # Dependencies
│   │   └── env_example       # Environment template
│   │
│   └── observability/        # Shared observability library
│       ├── src/              # Logging and metrics utilities
│       └── package.json      # Dependencies
│
├── devops/
│   ├── elasticsearch/        # Elasticsearch configuration
│   ├── grafana/              # Grafana dashboards and config
│   ├── kibana/               # Kibana configuration
│   ├── logstash/             # Logstash pipeline configuration
│   └── prometheus/           # Prometheus scraping configuration
│
├── docs/
│   └── doc-devops/           # Architecture diagrams
│
├── docker-compose.yml        # All services orchestration
├── Makefile                  # Development commands
├── env.example               # Environment variables template
└── README.md                 # This file
```

## 🛠️ Available Commands

```bash
# Service Management
make up          # Start all services (with build)
make down        # Stop all services
make restart     # Restart all services

# Quick Access
make run         # Open application URLs in browser
make metrics     # Open monitoring dashboards (Grafana & Kibana)

# Cleanup
make clean       # Complete cleanup (containers, volumes, images)

# Help
make help        # Show all available commands
```

## 🔧 Development Setup

### Prerequisites
- Docker and Docker Compose
- Make (for convenience commands)

### Environment Configuration

1. **Copy environment files:**
```bash
# Main environment (optional - has defaults)
cp .env.example .env

# Game service environment
cp packages/ms-game/env_example packages/ms-game/.env
```

2. **Start development:**
```bash
make up
```

3. **Access services:**
- Frontend: http://localhost:3010
- Game: http://localhost:3003
- Auth API: http://localhost:3001

## 📊 Monitoring & Observability

### Logs (ELK Stack)
- **Elasticsearch**: Stores and indexes logs
- **Logstash**: Processes and forwards logs
- **Kibana**: Visualizes logs and provides search interface

### Metrics (Prometheus + Grafana)
- **Prometheus**: Collects metrics from services
- **Grafana**: Creates dashboards and visualizations

### Health Checks
All services provide health endpoints:
- Frontend: http://localhost:3010/health
- Auth: http://localhost:3001/health
- Game: http://localhost:3003/health

## 🎮 Game Features

- **Classic Pong gameplay** with modern graphics
- **TypeScript implementation** for type safety
- **p5.js rendering** for smooth graphics
- **Responsive design** for different screen sizes
- **Real-time game state** management

## 🔐 Authentication Features

- **JWT-based authentication**
- **Google OAuth integration**
- **WebAuthn support** for passwordless login
- **Secure session management**
- **CORS configuration** for microservices

## 🌟 Technical Highlights

### Microservices Architecture
- ✅ **Service separation** by domain
- ✅ **Independent deployments**
- ✅ **Scalable design**
- ✅ **Technology diversity** (different tech per service)

### DevOps Practices
- ✅ **Containerization** with Docker
- ✅ **Service orchestration** with docker-compose
- ✅ **Monitoring** with Prometheus + Grafana
- ✅ **Logging** with ELK stack
- ✅ **Health checks** and readiness probes
- ✅ **Environment configuration**

### Modern Development
- ✅ **TypeScript** for type safety
- ✅ **Modern frameworks** (Vite, Fastify)
- ✅ **Database ORM** (Prisma)
- ✅ **Linting and formatting**
- ✅ **Hot reloading** in development

## 🚀 Production Deployment

The project is designed for production deployment with:

- **Docker containers** for consistent environments
- **Health checks** for container orchestration
- **Structured logging** for log aggregation
- **Metrics collection** for monitoring
- **Environment-based configuration**
- **Security best practices**

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports are already in use
2. **Docker issues**: Ensure Docker daemon is running
3. **Build failures**: Check logs with `docker-compose logs [service]`
4. **Health check failures**: Verify service is responding on correct port

### Debugging Commands

```bash
# Check service logs
docker-compose logs ms-frontend
docker-compose logs ms-auth
docker-compose logs ms-game

# Check service health
curl http://localhost:3010/health
curl http://localhost:3001/health
curl http://localhost:3003/health

# Check metrics
curl http://localhost:3003/metrics
```

## 📈 Performance Monitoring

### Key Metrics to Monitor
- **HTTP request duration**
- **Request rate**
- **Error rate**
- **Memory usage**
- **CPU usage**

### Dashboards
- **Grafana**: Real-time metrics and alerting
- **Kibana**: Log analysis and troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make up`
5. Submit a pull request

## 📚 Architecture Documentation

- [Container Architecture](docs/doc-devops/Containers.mmd) - Service relationships
- [Observability Setup](packages/observability/) - Logging and metrics library
- [Environment Configuration](.env.example) - Configuration options

---

**ft_transcendence** - Modern microservices architecture with professional DevOps practices

*Built with TypeScript, Docker, and industry-standard monitoring tools*