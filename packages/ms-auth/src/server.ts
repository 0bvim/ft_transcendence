import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { appRoutes } from "./http/routes";
import { setupObservability } from "@ft-transcendence/observability";
import { ZodError } from "zod";
import { env } from "./env";
import selfsigned from "selfsigned";

const pems = selfsigned.generate([{ name: "commonName", value: "localhost" }], {
  days: 365,
  algorithm: "sha256",
  keySize: 2048,
});

const app = fastify({
  https: {
    key: pems.private,
    cert: pems.cert,
  },
});

//Setup Observability
setupObservability(app, {
  serviceName: "authentication",
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

// Register multipart plugin for file uploads
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB instead of 5MB
    files: 1,
  },
});

app.register(appRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    // when error come from Zod, it's a validation error
    return reply
      .status(400)
      .send({ message: "Validation error", issues: error.format() });
  }

  // For other errors, we log them and return a generic error message
  app.log.error(error);

  return reply.status(500).send({ message: "Internal Server error." });
});

const start = async () => {
  app.log.info("Auth service starting up");
  try {
    await app.listen({
      port: env.PORT ? Number(process.env.PORT) : 3001,
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
