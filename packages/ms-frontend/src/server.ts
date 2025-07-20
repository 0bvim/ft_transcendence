import Fastify from "fastify";
import { setupObservability } from "@ft-transcendence/observability";
import path from "path";
import fs from "fs";

const app = Fastify();

// Setup observability for ELK stack and Prometheus metrics
setupObservability(app, {
  serviceName: "frontend-service",
  logLevel: process.env["LOG_LEVEL"] || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
  metricsPath: "/metrics",
});

// Initialize the frontend server
const initializeApp = async () => {
  app.log.info("Frontend service starting up");

  // Serve static files from dist directory
  await app.register(require("@fastify/static"), {
    root: path.join(__dirname, "../dist"),
    prefix: "/",
  });

  // SPA fallback for client-side routing
  app.setNotFoundHandler(async (request, reply) => {
    // Skip API routes and assets
    if (request.url.startsWith('/api/') || 
        request.url.startsWith('/health') || 
        request.url.startsWith('/metrics') ||
        request.url.includes('.')) {
      reply.code(404).send({ error: 'Not Found' });
      return;
    }

    app.log.info({
      action: "spa_fallback",
      path: request.url,
      ip: request.ip,
      userAgent: request.headers["user-agent"],
    }, "SPA fallback to index.html");

    const indexPath = path.join(__dirname, "../dist/index.html");
    const content = fs.readFileSync(indexPath);
    return reply.type("text/html").send(content);
  });

  // Client logs endpoint - receive logs from browser and forward to ELK
  app.post('/api/logs/client', async (request, reply) => {
    const body = request.body as { logs: any[] };
    
    if (body && Array.isArray(body.logs)) {
      body.logs.forEach(logEntry => {
        const logData = {
          ...logEntry,
          service: "frontend-service",
          logType: "client-side"
        };
        const message = `Client Log: ${logEntry.message}`;
        
        switch (logEntry.level) {
          case 'error':
            app.log.error(logData, message);
            break;
          case 'warn':
            app.log.warn(logData, message);
            break;
          case 'debug':
            app.log.debug(logData, message);
            break;
          default:
            app.log.info(logData, message);
        }
      });
    }
    
    return { status: 'ok', processed: body?.logs?.length || 0 };
  });

  // API proxy routes to other services
  await app.register(require("@fastify/http-proxy"), {
    upstream: "http://tournament:4243",
    prefix: "/api/tournament",
    rewritePrefix: "/api/tournament",
    logLevel: "info"
  });

  await app.register(require("@fastify/http-proxy"), {
    upstream: "http://blockchain:3004", 
    prefix: "/api/blockchain",
    rewritePrefix: "/api/blockchain",
    logLevel: "info"
  });

  await app.register(require("@fastify/http-proxy"), {
    upstream: "http://game:3003",
    prefix: "/api/game", 
    rewritePrefix: "/api/game",
    logLevel: "info"
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await app.close();
    app.log.info("Frontend service closed successfully");
    process.exit(0);
  } catch (error) {
    app.log.error(error, "Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const start = async () => {
  try {
    await initializeApp();
    
    const port = parseInt(process.env["PORT"] || "3010");
    const address = await app.listen({
      port: port,
      host: "0.0.0.0",
    });

    app.log.info({
      service: "frontend-service",
      address: address,
      port: port,
    }, "Frontend service started successfully");
  } catch (err) {
    app.log.error(err, "Error starting frontend service");
    process.exit(1);
  }
};

start(); 