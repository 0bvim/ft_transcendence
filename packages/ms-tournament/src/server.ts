import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { appRoutes } from "./http/routes";
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
  logLevel: env.LOG_LEVEL,
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
  app.log.info("Tournament service starting up");
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });
    app.log.info(`Tournament service running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
