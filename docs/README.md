# 📚 ft_transcendence Documentation

Welcome to the comprehensive documentation for the ft_transcendence project - a modern web-based Pong game with tournament system, blockchain integration, and advanced observability.

## 📖 Table of Contents

## 🏗️ Architecture
Understanding the system design and structure
- **[System Architecture](architecture/system-architecture.mmd)** - Overall system design and microservices architecture
- **[Data Flow Diagram](architecture/data-flow-diagram.mmd)** - Clean data flow through the system
- **[Deployment Infrastructure](architecture/deployment-infrastructure.mmd)** - Docker deployment and infrastructure overview
- **[Network Architecture](architecture/network-architecture.mmd)** - Network ports, connections, and communication paths
- **[Service Dependencies](architecture/service-dependencies.mmd)** - Service dependency hierarchy and startup order
- **[Container Architecture](architecture/containers/)** - Docker containers and deployment structure
  - [Container Diagram](architecture/containers/Containers.mmd)
  - [Sequence Diagram](architecture/containers/diagram_sequence.mmd)

## 🔄 Flow Diagrams
Process flows and interactions between components
- **[API Communication Flow](flows/api-communication-flow.mmd)** - Clean API interactions between services
- **[Authentication Flow](flows/authentication-flow.mmd)** - User authentication and authorization process
- **[Tournament & Game Flow](flows/tournament-game-flow.mmd)** - Tournament creation, matching, and game mechanics
- **[Observability & Monitoring Flow](flows/observability-monitoring-flow.mmd)** - Logging, metrics, and monitoring pipeline

## ⚙️ Setup & Configuration
Getting started with the project
- **[Environment Setup](setup/environment-setup.md)** - Complete environment configuration guide
- **[API Testing Examples](setup/api-testing-examples.md)** - curl commands and API testing samples

## 📋 Guides & References
Technical guides and how-to documentation
- **[Observability Guide](guides/observability-guide.md)** - Logging, metrics, and monitoring implementation

## 📄 Project Information
Official project documentation
- **[Project Subject](project/subject.txt)** - Original project requirements and specifications

---

## 🚀 Quick Start

1. **Environment Setup**: Start with [Environment Setup](setup/environment-setup.md)
2. **System Overview**: Review [System Architecture](architecture/system-architecture.mmd)
3. **Infrastructure**: Understand [Deployment Infrastructure](architecture/deployment-infrastructure.mmd)
4. **API Testing**: Use [API Testing Examples](setup/api-testing-examples.md) to verify functionality

## 🔍 Finding What You Need

| Looking for... | Go to... |
|----------------|----------|
| How to set up the project | [Setup](setup/) |
| System design and architecture | [Architecture](architecture/) |
| Network and deployment info | [Infrastructure diagrams](architecture/) |
| Process flows and workflows | [Flows](flows/) |  
| Implementation guides | [Guides](guides/) |
| Official project requirements | [Project](project/) |

## 📊 Diagram Formats

This documentation uses [Mermaid](https://mermaid.js.org/) diagrams (`.mmd` files) for visual representations. All diagrams follow a clean, monitoring-tools style with:
- Consistent color coding by service type
- Clear port and connection information
- Neutral theme for better readability

You can:
- View them directly in GitHub
- Render them in VS Code with the Mermaid Preview extension
- Use online tools like [Mermaid Live Editor](https://mermaid.live/)

## 🎨 Diagram Style Guide

Our diagrams use consistent color coding:
- **🟢 Frontend**: Green (#4caf50)
- **🟠 Auth Service**: Orange (#ff9800)  
- **🟣 Tournament Service**: Purple (#9c27b0)
- **🔴 Game Service**: Pink (#e91e63)
- **🟦 Blockchain Service**: Teal (#009688)
- **🟡 Databases**: Yellow (#fbc02d)
- **⚫ External Services**: Gray (#757575)
- **🟤 Monitoring Stack**: Various warm colors

---

*Last updated: January 2025*  
*Documentation organized and cleaned up in feature/docs-organization branch* 