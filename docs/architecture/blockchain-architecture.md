# ⛓️ Blockchain Architecture Documentation

This document explains the blockchain architecture implementation in the ft_transcendence project, including the two-layer service design and integration patterns.

## 🏗️ Overview

The ft_transcendence project implements a **two-layer blockchain architecture** that separates blockchain infrastructure from application logic, providing a scalable and maintainable solution for tournament score recording.

## 📐 Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Frontend[Frontend Service<br/>:3010]
        Browser[User Browser]
    end
    
    subgraph "Application Layer"
        Auth[Authentication<br/>:3001]
        Tournament[Tournament Service<br/>:4243]
        Game[Game Service<br/>:3003]
        BlockchainAPI[Blockchain Service<br/>:3004]
    end
    
    subgraph "Infrastructure Layer"
        BlockchainNode[Blockchain Node<br/>:8545<br/>Hardhat Local Network]
        SmartContract[TournamentScoring<br/>Smart Contract]
    end
    
    subgraph "Monitoring Layer"
        Prometheus[Prometheus<br/>:9090]
        Grafana[Grafana<br/>:3002]
    end
    
    Browser --> Frontend
    Frontend --> Auth
    Frontend --> Tournament
    Frontend --> Game
    
    Tournament --> BlockchainAPI
    Auth --> BlockchainAPI
    
    BlockchainAPI --> BlockchainNode
    BlockchainNode --> SmartContract
    
    BlockchainAPI --> Prometheus
    Tournament --> Prometheus
    Auth --> Prometheus
    Game --> Prometheus
    
    Prometheus --> Grafana
    
    classDef client fill:#e1f5fe
    classDef app fill:#f3e5f5
    classDef infra fill:#e8f5e8
    classDef monitor fill:#fff3e0
    
    class Frontend,Browser client
    class Auth,Tournament,Game,BlockchainAPI app
    class BlockchainNode,SmartContract infra
    class Prometheus,Grafana monitor
```

## 🔄 Two-Layer Blockchain Design

### Layer 1: Blockchain Infrastructure (`blockchain-node`)

```mermaid
graph LR
    subgraph "Blockchain Node Container"
        HardhatNode[Hardhat Node<br/>npx hardhat node]
        Accounts[20 Pre-funded<br/>Accounts<br/>10,000 ETH each]
        Network[Local Ethereum<br/>Network<br/>Chain ID: 1337]
    end
    
    HardhatNode --> Accounts
    HardhatNode --> Network
    
    External[External Services] --> |JSON-RPC<br/>Port 8545| HardhatNode
    
    classDef infra fill:#e8f5e8
    class HardhatNode,Accounts,Network infra
```

**Responsibilities:**
- ✅ Provides Ethereum-compatible blockchain network
- ✅ Handles transaction mining and block creation
- ✅ Manages account balances and state
- ✅ Exposes JSON-RPC API on port 8545

### Layer 2: Application Service (`blockchain`)

```mermaid
graph TB
    subgraph "Blockchain Service Container"
        API[REST API<br/>:3004/api/blockchain/*]
        SmartContractLogic[Smart Contract<br/>Deployment & Interaction]
        BusinessLogic[Tournament<br/>Business Logic]
        Validation[Data Validation<br/>& Processing]
    end
    
    subgraph "External Dependencies"
        TournamentService[Tournament Service<br/>:4243]
        AuthService[Auth Service<br/>:3001]
        BlockchainNode[Blockchain Node<br/>:8545]
    end
    
    API --> SmartContractLogic
    API --> BusinessLogic
    API --> Validation
    
    SmartContractLogic --> BlockchainNode
    BusinessLogic --> TournamentService
    BusinessLogic --> AuthService
    
    classDef app fill:#f3e5f5
    classDef external fill:#ffecb3
    
    class API,SmartContractLogic,BusinessLogic,Validation app
    class TournamentService,AuthService,BlockchainNode external
```

**Responsibilities:**
- ✅ Deploys and manages smart contracts
- ✅ Provides REST API for blockchain operations
- ✅ Integrates with other microservices
- ✅ Handles business logic and validation

## 🔐 Smart Contract Interaction Flow

```mermaid
sequenceDiagram
    participant T as Tournament Service
    participant B as Blockchain Service
    participant N as Blockchain Node
    participant SC as Smart Contract
    
    Note over B,N: Service Startup
    B->>N: Check connection
    B->>N: Deploy TournamentScoring contract
    N->>SC: Create contract instance
    SC->>B: Return contract address
    
    Note over T,SC: Tournament Lifecycle
    T->>B: POST /api/blockchain/tournament
    B->>B: Validate tournament data
    B->>N: Call createTournament()
    N->>SC: Execute createTournament
    SC->>N: Emit TournamentCreated event
    N->>B: Return transaction receipt
    B->>T: Return tournament blockchain ID
    
    Note over T,SC: Match Result Recording
    T->>B: POST /api/blockchain/match-result
    B->>B: Validate match data
    B->>N: Call recordMatchResult()
    N->>SC: Execute recordMatchResult
    SC->>N: Emit MatchResultRecorded event
    N->>B: Return transaction receipt
    B->>T: Confirm result recorded
```

## 📊 Data Flow Architecture

```mermaid
graph TB
    subgraph "Data Sources"
        User[User Actions]
        Tournament[Tournament Events]
        Game[Game Results]
    end
    
    subgraph "Processing Layer"
        Frontend[Frontend<br/>Data Collection]
        Services[Microservices<br/>Business Logic]
        Blockchain[Blockchain Service<br/>Validation & Storage]
    end
    
    subgraph "Storage Layer"
        Database[(SQLite<br/>Databases)]
        SmartContract[Smart Contracts<br/>Immutable Storage]
        Logs[ELK Stack<br/>Log Storage]
    end
    
    User --> Frontend
    Tournament --> Services
    Game --> Services
    
    Frontend --> Services
    Services --> Database
    Services --> Blockchain
    
    Blockchain --> SmartContract
    Services --> Logs
    Blockchain --> Logs
    
    classDef source fill:#e3f2fd
    classDef process fill:#f3e5f5
    classDef storage fill:#e8f5e8
    
    class User,Tournament,Game source
    class Frontend,Services,Blockchain process
    class Database,SmartContract,Logs storage
```

## 🚀 Service Deployment Flow

```mermaid
graph TB
    subgraph "Initialization Phase"
        DockerCompose[docker-compose up]
        BuildImages[Build Container Images]
        CreateNetwork[Create Docker Network]
    end
    
    subgraph "Infrastructure Startup"
        StartNode[Start blockchain-node]
        WaitHealthy[Wait for Health Check]
        NodeReady[Blockchain Node Ready]
    end
    
    subgraph "Service Startup"
        StartBlockchain[Start blockchain service]
        WaitForNode[Wait for blockchain-node]
        DeployContracts[Deploy Smart Contracts]
        StartAPI[Start REST API]
        ServiceReady[Blockchain Service Ready]
    end
    
    subgraph "Integration"
        RegisterPrometheus[Register with Prometheus]
        ConnectServices[Connect to Other Services]
        SystemReady[System Fully Operational]
    end
    
    DockerCompose --> BuildImages
    BuildImages --> CreateNetwork
    CreateNetwork --> StartNode
    
    StartNode --> WaitHealthy
    WaitHealthy --> NodeReady
    
    NodeReady --> StartBlockchain
    StartBlockchain --> WaitForNode
    WaitForNode --> DeployContracts
    DeployContracts --> StartAPI
    StartAPI --> ServiceReady
    
    ServiceReady --> RegisterPrometheus
    RegisterPrometheus --> ConnectServices
    ConnectServices --> SystemReady
    
    classDef init fill:#e3f2fd
    classDef infra fill:#e8f5e8
    classDef service fill:#f3e5f5
    classDef integration fill:#fff3e0
    
    class DockerCompose,BuildImages,CreateNetwork init
    class StartNode,WaitHealthy,NodeReady infra
    class StartBlockchain,WaitForNode,DeployContracts,StartAPI,ServiceReady service
    class RegisterPrometheus,ConnectServices,SystemReady integration
```

## 🔧 Configuration Architecture

```mermaid
graph TB
    subgraph "Environment Configuration"
        RootEnv[Root .env<br/>Single Source of Truth]
        ServiceEnv[Service .env<br/>Optional Overrides]
        DockerCompose[docker-compose.yml<br/>Container Configuration]
    end
    
    subgraph "Blockchain Configuration"
        LocalConfig[Local Development<br/>blockchain-node:8545<br/>Chain ID: 1337]
        TestnetConfig[Testnet Option<br/>Avalanche Fuji<br/>Chain ID: 43113]
        MainnetConfig[Mainnet Option<br/>Avalanche Mainnet<br/>Chain ID: 43114]
    end
    
    subgraph "Smart Contract Configuration"
        ContractDeployment[Automatic Deployment<br/>Local Mode]
        ContractAddress[Dynamic Address<br/>Resolution]
        ContractABI[Generated TypeScript<br/>Types & Interfaces]
    end
    
    RootEnv --> ServiceEnv
    ServiceEnv --> DockerCompose
    
    DockerCompose --> LocalConfig
    DockerCompose -.-> TestnetConfig
    DockerCompose -.-> MainnetConfig
    
    LocalConfig --> ContractDeployment
    ContractDeployment --> ContractAddress
    ContractAddress --> ContractABI
    
    classDef env fill:#e3f2fd
    classDef blockchain fill:#e8f5e8
    classDef contract fill:#f3e5f5
    
    class RootEnv,ServiceEnv,DockerCompose env
    class LocalConfig,TestnetConfig,MainnetConfig blockchain
    class ContractDeployment,ContractAddress,ContractABI contract
```

## 📈 Monitoring & Observability

```mermaid
graph TB
    subgraph "Service Metrics"
        BlockchainMetrics[Blockchain Service<br/>HTTP Requests<br/>Contract Calls<br/>Gas Usage]
        NodeMetrics[Blockchain Node<br/>Block Height<br/>Transaction Pool<br/>Network Stats]
    end
    
    subgraph "Collection & Storage"
        Prometheus[Prometheus<br/>Metrics Collection<br/>:9090]
        Elasticsearch[Elasticsearch<br/>Log Storage<br/>:9200]
        Logstash[Logstash<br/>Log Processing<br/>:5001]
    end
    
    subgraph "Visualization"
        Grafana[Grafana<br/>Metrics Dashboard<br/>:3002]
        Kibana[Kibana<br/>Log Analysis<br/>:5601]
    end
    
    subgraph "Alerting"
        PrometheusAlerts[Prometheus Alerts<br/>Service Down<br/>High Response Time<br/>Error Rate]
    end
    
    BlockchainMetrics --> Prometheus
    NodeMetrics --> Prometheus
    
    BlockchainMetrics --> Logstash
    NodeMetrics --> Logstash
    
    Logstash --> Elasticsearch
    Prometheus --> Grafana
    Elasticsearch --> Kibana
    
    Prometheus --> PrometheusAlerts
    
    classDef metrics fill:#e3f2fd
    classDef collection fill:#e8f5e8
    classDef visualization fill:#f3e5f5
    classDef alerting fill:#ffecb3
    
    class BlockchainMetrics,NodeMetrics metrics
    class Prometheus,Elasticsearch,Logstash collection
    class Grafana,Kibana visualization
    class PrometheusAlerts alerting
```

## ⚙️ Docker Services Configuration

### Blockchain Node Service
```yaml
blockchain-node:
  container_name: blockchain-node
  build:
    context: ./packages
    dockerfile: ./blockchain/Dockerfile
    target: development
  command: npx hardhat node --hostname 0.0.0.0 --port 8545
  ports:
    - "8545:8545"
  environment:
    - NODE_ENV=development
  networks:
    - ft-net
  healthcheck:
    test: ["CMD", "sh", "-c", "wget --no-verbose --tries=1 --spider http://localhost:8545 || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 30s
```

### Blockchain Application Service
```yaml
blockchain:
  container_name: blockchain
  build:
    context: ./packages
    dockerfile: ./blockchain/Dockerfile
    target: prod
  ports:
    - "3004:3004"
  environment:
    - NODE_ENV=production
    - PORT=3004
    - AVALANCHE_RPC_URL=http://blockchain-node:8545
    - AVALANCHE_CHAIN_ID=1337
    - PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  depends_on:
    logstash:
      condition: service_healthy
    blockchain-node:
      condition: service_healthy
```

## 🎯 Benefits of Two-Layer Architecture

### ✅ **Separation of Concerns**
- **Infrastructure layer** handles blockchain protocol
- **Application layer** handles business logic
- Clean boundaries between responsibilities

### ✅ **Scalability**
- Services can scale independently
- Multiple application instances can share one blockchain node
- Easy to switch between different blockchain networks

### ✅ **Development Experience**
- Fast local development with instant transactions
- Deterministic testing environment
- No external dependencies or token requirements

### ✅ **Production Flexibility**
- Easy migration from local to testnet/mainnet
- Configuration-driven blockchain selection
- Maintained separation of concerns in production

### ✅ **Subject Compliance**
- ✅ **"Testing blockchain environment"** - Perfect isolation
- ✅ **"Without risks"** - No external dependencies
- ✅ **"Avalanche + Solidity"** - Compatible tooling and standards

## 🔄 Alternative Deployment Scenarios

### Local Development (Current)
```mermaid
graph LR
    App[Blockchain Service] --> Node[Local Hardhat Node]
    Node --> Contract[Deployed Contract]
```

### Testnet Deployment
```mermaid
graph LR
    App[Blockchain Service] --> Testnet[Avalanche Fuji<br/>External Network]
    Testnet --> Contract[Deployed Contract]
```

### Production Deployment
```mermaid
graph LR
    App[Blockchain Service] --> Mainnet[Avalanche Mainnet<br/>External Network]
    Mainnet --> Contract[Deployed Contract]
```

## 📋 Service Dependencies

```mermaid
graph TB
    BlockchainNode[blockchain-node<br/>Infrastructure Service]
    Logstash[logstash<br/>Logging Service]
    
    BlockchainService[blockchain<br/>Application Service]
    
    TournamentService[tournament<br/>Business Logic]
    AuthService[authentication<br/>User Management]
    
    BlockchainNode --> BlockchainService
    Logstash --> BlockchainService
    
    BlockchainService --> TournamentService
    BlockchainService --> AuthService
    
    classDef infra fill:#e8f5e8
    classDef app fill:#f3e5f5
    classDef business fill:#e3f2fd
    
    class BlockchainNode,Logstash infra
    class BlockchainService app
    class TournamentService,AuthService business
```

## 🚀 Getting Started

1. **Start the system:**
   ```bash
   docker-compose up -d
   ```

2. **Verify blockchain node:**
   ```bash
   curl http://localhost:8545
   ```

3. **Check blockchain service:**
   ```bash
   curl http://localhost:3004/health
   ```

4. **Monitor with Prometheus:**
   ```bash
   open http://localhost:9090/targets
   ```

This architecture provides a robust, scalable, and maintainable blockchain integration that perfectly aligns with the ft_transcendence project requirements and subject specifications. 