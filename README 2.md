# ft_transcendence - DevOps Edition

🎮 **A modern Pong game with professional monitoring and logging**

## 📋 What's This Project?

This is a **simplified ft_transcendence** implementation focused on DevOps practices. It includes:

- 🎯 **Pong Game**: Classic game built with TypeScript and p5.js
- 🌐 **Frontend**: Login interface with retro styling
- 📊 **Complete Monitoring**: ELK stack (Elasticsearch, Logstash, Kibana) + Prometheus + Grafana
- 🐳 **Containerized**: Everything runs in Docker containers
- 📈 **Production Ready**: Structured logging, metrics, health checks

## 🚀 Quick Start (3 Commands)

```bash
# 1. Set up environment
cp packages/frontend/env_example packages/frontend/.env
cp packages/game/env_example packages/game/.env

# 2. Start everything
make up

# 3. Open in browser
make run
```

**That's it!** You now have a complete application with monitoring running.

## 🎯 What You'll See

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3005 | Login interface (use any username/password) |
| **Game** | http://localhost:3002 | Pong game (opens from frontend) |
| **Kibana** | http://localhost:5601 | View application logs |
| **Grafana** | http://localhost:3001 | View metrics (admin/admin) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ft_transcendence                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (3005)  │  Game (3002)  │  Monitoring Stack      │
│  ├─ Login UI      │  ├─ Pong Game │  ├─ Elasticsearch      │
│  ├─ TypeScript    │  ├─ p5.js     │  ├─ Kibana (logs)      │
│  └─ Fastify       │  └─ Fastify   │  ├─ Logstash           │
│                   │               │  ├─ Prometheus         │
│                   │               │  └─ Grafana (metrics)  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Commands

```bash
# Start all services
make up

# Stop all services  
make down

# Open applications in browser
make run

# Open monitoring dashboards
make metrics

# Complete cleanup (remove containers, volumes, images)
make clean

# Show all commands
make help
```

## 📁 Project Structure

```
ft-transcendence-devops/
├── packages/
│   ├── frontend/           # Login and UI service
│   ├── game/              # Pong game service
│   └── observability/     # Logging and metrics library
├── devops/
│   ├── grafana/           # Grafana dashboards
│   ├── prometheus/        # Prometheus configuration
│   └── logstash/          # Logstash pipeline
├── docker-compose.yml     # All services configuration
├── Makefile              # Simple commands
└── ENV_SETUP.md          # Detailed environment setup
```

## 🎓 Technical Features

This project demonstrates:

### DevOps Practices
- ✅ **Containerization** with Docker
- ✅ **Service orchestration** with docker-compose
- ✅ **Monitoring** with Prometheus + Grafana
- ✅ **Logging** with ELK stack
- ✅ **Health checks** and metrics

### Web Development
- ✅ **TypeScript** for type safety
- ✅ **Node.js** backend services
- ✅ **Modern frontend** with Tailwind CSS
- ✅ **Game development** with p5.js

### Production Concepts
- ✅ **Structured logging** (JSON format)
- ✅ **Metrics collection** (Prometheus format)
- ✅ **Environment configuration**
- ✅ **Service communication**

## 📊 Monitoring Features

### Logs (Kibana)
- Real-time log streaming
- Structured JSON logs
- Service-specific filtering
- Error tracking

### Metrics (Grafana)
- HTTP request metrics
- System resource usage
- Application performance
- Custom dashboards

### Health Checks
- `/health` endpoint on each service
- Container health monitoring
- Service dependency tracking

## 🔧 Development

### Adding New Features
1. Services are in `packages/` directory
2. Each service has its own `Dockerfile`
3. Environment variables in `env_example` files
4. Logs automatically go to ELK stack
5. Metrics automatically collected

### Debugging
```bash
# View logs for specific service
docker-compose logs frontend
docker-compose logs game

# Check service health
curl http://localhost:3005/health
curl http://localhost:3002/health

# View metrics
curl http://localhost:3005/metrics
```

## 🌟 Why This Project?

1. **Real-world skills**: Production-ready monitoring and logging
2. **Complete stack**: Frontend, backend, monitoring, logging
3. **Simple setup**: Everything works with `make up`
4. **Professional**: Clear architecture, good documentation
5. **Scalable**: Easy to add new services and features

## 🚀 Key Benefits

- **Meets ft_transcendence requirements**: Pong game, TypeScript, Docker
- **Production-ready practices**: Monitoring, logging, DevOps
- **Clean architecture**: Simple setup, clear commands
- **Professional quality**: Industry-standard tools and practices

## 🤝 Contributing

Feel free to:
- Add new monitoring dashboards
- Improve game features
- Enhance logging
- Add new services
- Improve documentation

## 📚 Learn More

- [Environment Setup](ENV_SETUP.md) - Detailed configuration guide
- [Observability Guide](packages/observability/docs.md) - Logging and metrics
- [Subject Requirements](docs/doc-devops/en.subject.txt) - Original ft_transcendence requirements

---

**Modern DevOps practices for web applications**

*Professional monitoring and logging for game development*
