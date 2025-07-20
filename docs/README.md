# 📚 ft_transcendence Documentation

Welcome to the comprehensive documentation for the ft_transcendence project. This documentation is organized to help you understand, setup, and maintain the entire system.

## 🚀 Quick Navigation

### 🔧 **Setup & Configuration**
Get started with environment setup and configuration:

| Document | Description | Use Case |
|----------|-------------|----------|
| **[Environment Setup](setup/environment-setup.md)** | Complete environment configuration guide | 🌟 **Start here for setup** |
| **[Blockchain Wallet Setup](setup/blockchain-wallet-setup.md)** | Blockchain wallet and token configuration | Blockchain development |
| **[ENV Setup](setup/env-setup.md)** | Legacy environment setup reference | Troubleshooting |

### 🏗️ **Architecture**
Understand the system design and architecture:

| Document | Description | Visual |
|----------|-------------|--------|
| **[Blockchain Architecture](architecture/blockchain-architecture.md)** | Two-layer blockchain design with detailed charts | 📊 Rich diagrams |
| **[Container Architecture](architecture/containers.mmd)** | Container relationships diagram | 🐳 Mermaid chart |
| **[Sequence Diagrams](architecture/sequence-diagram.mmd)** | System interaction flows | 🔄 Process flows |

### 🔧 **Services**
Deep dive into individual microservices:

| Service | Document | Technology Stack |
|---------|----------|------------------|
| **Authentication** | **[Auth Service](services/auth-service.md)** | Fastify + JWT + 2FA + OAuth |
| **Frontend** | **[Frontend Service](services/frontend-service.md)** | TypeScript + Tailwind + Vite |
| **Game** | **[Game Service](services/game-service.md)** | Fastify + p5.js + WebSocket |
| **Observability** | **[Observability](services/observability.md)** | ELK Stack + Prometheus |

### 🌐 **API Reference**
API documentation and examples:

| API | Document | Description |
|-----|----------|-------------|
| **Authentication** | **[Auth API](api/auth-api-requests.md)** | Complete API endpoints with curl examples |

### 📋 **Project Reference**
Official project specifications:

| Document | Description | Type |
|----------|-------------|------|
| **[Subject Requirements](subject.txt)** | Original ft_transcendence project requirements | Reference |

## 🎯 **Documentation by Use Case**

### **🚀 I want to get started quickly**
1. [Environment Setup](setup/environment-setup.md) - Complete setup guide
2. [Root README](../README.md) - Project overview and quick start
3. [Health Checks](../README.md#-health-checks) - Verify everything works

### **🏗️ I want to understand the architecture**
1. [Blockchain Architecture](architecture/blockchain-architecture.md) - Core blockchain design
2. [Container Architecture](architecture/containers.mmd) - Service relationships
3. [System Architecture](../README.md#-system-architecture) - High-level overview

### **🔧 I want to work on a specific service**
1. Choose your service: [Auth](services/auth-service.md) | [Frontend](services/frontend-service.md) | [Game](services/game-service.md)
2. [Environment Setup](setup/environment-setup.md#service-specific-setup-optional) - Service-specific config
3. [API Reference](api/auth-api-requests.md) - If working with APIs

### **⚙️ I want to deploy or configure**
1. [Environment Setup](setup/environment-setup.md) - Complete configuration guide  
2. [Blockchain Wallet Setup](setup/blockchain-wallet-setup.md) - Blockchain configuration
3. [Docker Environment Variables](setup/environment-setup.md#-docker-environment-variables) - Container config

### **🐛 I need to troubleshoot**
1. [Troubleshooting Guide](setup/environment-setup.md#-troubleshooting) - Common issues
2. [Health Checks](../README.md#-health-checks) - Service verification
3. [Service Logs](setup/environment-setup.md#environment-variable-priority) - Debugging

### **📊 I want to monitor the system**
1. [Observability](services/observability.md) - Monitoring setup
2. [Prometheus Configuration](setup/environment-setup.md#-monitoring--observability) - Metrics
3. [Service Endpoints](../README.md#-service-endpoints) - Monitoring URLs

## 📁 **Documentation Structure**

```
docs/
├── README.md                           # 📍 This index file
├── subject.txt                         # 📋 Project requirements
├── assets/                            # 🖼️ Images and diagrams
│   ├── containers.png                 
│   └── sequence-diagram.png           
├── setup/                             # 🔧 Setup & Configuration
│   ├── environment-setup.md           # 🌟 Main setup guide
│   ├── blockchain-wallet-setup.md     # ⛓️ Blockchain setup
│   └── env-setup.md                   # 🔧 Legacy setup
├── architecture/                      # 🏗️ System Architecture
│   ├── blockchain-architecture.md     # ⛓️ Blockchain design
│   ├── containers.mmd                 # 🐳 Container diagram
│   └── sequence-diagram.mmd           # 🔄 Process flows
├── services/                          # 🔧 Service Documentation
│   ├── auth-service.md                # 🔐 Authentication
│   ├── frontend-service.md            # 🎨 Frontend
│   ├── game-service.md                # 🎮 Game engine
│   └── observability.md               # 📊 Monitoring
└── api/                               # 🌐 API Reference
    └── auth-api-requests.md           # 🔐 Auth API docs
```

## 🛠️ **Documentation Standards**

### **Format Standards**
- ✅ **Markdown** (.md) for all documentation
- ✅ **Mermaid** (.mmd) for diagrams where applicable
- ✅ **Consistent naming** with kebab-case
- ✅ **Clear headers** with emoji indicators

### **Content Standards**
- ✅ **Start with overview** - What and why
- ✅ **Include examples** - Code samples and commands
- ✅ **Add troubleshooting** - Common issues and solutions
- ✅ **Link related docs** - Cross-references
- ✅ **Keep updated** - Reflect current implementation

### **Navigation Standards**
- ✅ **Clear hierarchy** - Logical document organization
- ✅ **Consistent linking** - Relative paths from docs/
- ✅ **Table of contents** - For longer documents
- ✅ **Quick reference** - Key information upfront

## 🤝 **Contributing to Documentation**

When adding or updating documentation:

1. **Follow the established structure** in this README
2. **Update this index** when adding new documents
3. **Use consistent formatting** and naming patterns
4. **Include practical examples** and troubleshooting tips
5. **Cross-reference related documents**

## 📞 **Getting Help**

- **Quick start issues**: [Environment Setup](setup/environment-setup.md)
- **Architecture questions**: [Blockchain Architecture](architecture/blockchain-architecture.md)
- **API usage**: [Auth API Reference](api/auth-api-requests.md)
- **Service-specific help**: Check individual service docs in [services/](services/)

---

**🎯 Ready to get started? Begin with [Environment Setup](setup/environment-setup.md)!** 