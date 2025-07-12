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
          serviceName: "frontend",
  logLevel: process.env["LOG_LEVEL"] || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
});

// Initialize async setup
const initializeApp = async () => {
  // Logging for service startup
  app.log.info("Frontend service starting up");

  // Serve static assets (CSS, JS, images, etc.)
  app.get("/app.js", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const jsPath = path.join(__dirname, "../static/app.js");
      const jsContent = fs.readFileSync(jsPath, "utf-8");
      return reply.type("application/javascript").send(jsContent);
    } catch (error) {
      app.log.error(error, "Error serving app.js");
      return reply.code(404).send("File not found");
    }
  });

  // SPA route - serve index.html for all routes (client-side routing)
  app.get("*", async (request: FastifyRequest, reply: FastifyReply) => {
    app.log.info(
      {
        action: "spa_route",
        path: request.url,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      },
      "SPA route accessed"
    );

    try {
      // For SPA, always serve index.html and let client-side routing handle it
      const indexPath = path.join(__dirname, "../static/index.html");
      const indexHtml = fs.readFileSync(indexPath, "utf-8");
      return reply.type("text/html").send(indexHtml);
    } catch (error) {
      app.log.error(error, "Error serving index.html");
      return reply.code(500).send("Internal Server Error");
    }
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await app.close();
    app.log.info("Server closed successfully");
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

    const address = await app.listen({
      port: parseInt(process.env["PORT"] || "3001"),
      host: "0.0.0.0",
    });

    const serverAddress = address as string;
    app.log.info(
      {
        service: "frontend",
        address: serverAddress,
      },
      "Frontend service started successfully"
    );
  } catch (err) {
    app.log.error(err, "Error starting server");
    process.exit(1);
  }
};

start();
