# Observability Package - Technical Guide

This package provides **logging, metrics, and health checks** for your ft_transcendence services.

## 🚀 Quick Start

### 1. Install in your service
```bash
npm install @ft-transcendence/observability
```

### 2. Add to your Fastify service
```javascript
const Fastify = require('fastify');
const { setupObservability } = require('@ft-transcendence/observability');

const fastify = Fastify();

// One line setup!
setupObservability(fastify, 'my-service-name');

// Your routes
fastify.get('/', async () => {
  fastify.log.info('Hello world!');
  return { message: 'Hello World!' };
});

fastify.listen({ port: 3000 });
```

### 3. What you get automatically:
- ✅ **Structured logging** (JSON format)
- ✅ **Health endpoint** at `/health`
- ✅ **Metrics endpoint** at `/metrics` (for Prometheus)
- ✅ **ELK stack integration** (if available)

## 📊 Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Returns `{"status":"ok","service":"my-service","timestamp":"..."}` |
| `GET /metrics` | Prometheus metrics for monitoring |

## 🔧 Configuration

### Simple
```javascript
setupObservability(fastify, 'my-service');
```

### With options
```javascript
setupObservability(fastify, {
  serviceName: 'my-service',
  logLevel: 'info',        // debug, info, warn, error
  enableMetrics: true,     // Enable /metrics endpoint
  enableHealthCheck: true  // Enable /health endpoint
});
```

## 🌐 Environment Variables

```bash
# Optional - for ELK stack integration
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000

# Log level
LOG_LEVEL=info
```

## 📝 Logging Examples

```javascript
// Basic logging
fastify.log.info('User logged in');
fastify.log.error('Database connection failed');

// Structured logging
fastify.log.info({ userId: 123, action: 'login' }, 'User logged in');
```

## 🔍 How it works

1. **Console Logging**: Always enabled for development
2. **ELK Integration**: Automatically sends logs to Logstash if available
3. **Metrics**: Tracks HTTP requests, response times, and system metrics
4. **Health Check**: Simple endpoint to verify service is running

## 🎯 Features

This package provides professional observability capabilities for your ft_transcendence project:

- **Simple setup**: One function call to enable all features
- **Production ready**: Structured logging and metrics collection
- **Flexible**: Works with or without ELK stack
- **Lightweight**: Minimal performance impact

The logs will appear in:
- Your console (always)
- Kibana dashboard (if ELK stack is running)
- Grafana metrics (if Prometheus is configured)
