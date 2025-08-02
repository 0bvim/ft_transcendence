import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { tournamentRoutes } from "./routes/tournament";
import { setupObservability } from "@ft-transcendence/observability";
import { ZodError } from "zod";
import { env } from "./env";
import path from "path";
import fs from "fs";

const pems = {
  private: fs.readFileSync(path.join(__dirname, "../certs/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../certs/cert.pem")),
};

const app = fastify({
  https: {
    key: pems.private,
    cert: pems.cert,
  },
});

//Setup Observability
setupObservability(app, {
  serviceName: "tournament",
  logLevel: process.env["LOG_LEVEL"] || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
  metricsPath: "/metrics",
});

// Register CORS plugin - Accept all origins for development
app.register(fastifyCors, {
  origin: true, // Accept all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
});

app.register(tournamentRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Validation error",
      details: error.errors,
    });
  }

  console.error(error);
  reply.status(500).send({ error: "Internal server error" });
});

async function start() {
  try {
    await app.listen({
      port: parseInt(env.PORT),
      host: "0.0.0.0",
    });
    console.log(`🚀 Tournament service running on https://0.0.0.0:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
