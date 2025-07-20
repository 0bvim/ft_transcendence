import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import dotenv from "dotenv";
import { setupObservability } from "@ft-transcendence/observability";
import { AddressInfo } from "net";
import path from "path";
import fs from "fs";

dotenv.config();

const app = Fastify();

// Setup observability for ELK stack
setupObservability(app, {
  serviceName: "game-service",
  logLevel: process.env["LOG_LEVEL"] || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
  metricsPath: "/metrics",
});

// Initialize async setup
const initializeApp = async () => {
  // Logging for service startup
  app.log.info("Game service starting up");

  // Register static file serving (much simpler!)
  await app.register(require("@fastify/static"), {
    root: path.join(__dirname, "../dist/game"),
    prefix: "/",
  });

  // Game client logs endpoint - receive logs from browser and forward to ELK
  app.post('/api/logs/game-client', async (request, reply) => {
    const body = request.body as { logs: any[] };
    
    if (body && Array.isArray(body.logs)) {
      body.logs.forEach(logEntry => {
        const logData = {
          ...logEntry,
          service: "game-service",
          logType: "client-side"
        };
        const message = `Game Client Log: ${logEntry.message}`;
        
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

  // SPA fallback route - serve index.html for unknown routes
  app.setNotFoundHandler(
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.log.info(
        {
          action: "spa_fallback",
          path: request.url,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "SPA fallback to index.html",
      );

      const indexPath = path.join(__dirname, "../dist/game/index.html");
      const content = fs.readFileSync(indexPath);
      return reply.type("text/html").send(content);
    },
  );
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await app.close();
    app.log.info("Game service closed successfully");
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
    // Initialize the app first
    await initializeApp();

    const port = parseInt(process.env["PORT"] || "3003");
    const address = await app.listen({
      port: port,
      host: "0.0.0.0",
    });

    app.log.info(
      {
        service: "game-service",
        address: address,
        port: port,
      },
      "Game service started successfully",
    );
  } catch (err) {
    app.log.error(err, "Error starting game service");
    process.exit(1);
  }
};

start();
