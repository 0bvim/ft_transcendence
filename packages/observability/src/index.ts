import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import pino, { Logger } from "pino";
import promClient from "prom-client";

export interface ObservabilityConfig {
  serviceName: string;
  logLevel?: string;
  enableMetrics?: boolean;
  enableHealthCheck?: boolean;
  metricsPath?: string;
  healthPath?: string;
}

export interface ObservabilitySetup {
  logger: Logger;
  metricsRegistry: promClient.Registry;
}

const setupLogging = (serviceName: string, logLevel?: string): Logger => {
  const level = logLevel || process.env.LOG_LEVEL || "info";

  // Create streams for logging
  const streams: any[] = [];

  // Always add console output
  streams.push({
    stream: pino.destination({
      sync: false,
    }),
    level,
  });

  // Add Logstash output for ELK stack (simplified)
  const logstashHost = process.env.LOGSTASH_HOST || "logstash";
  const logstashPort = parseInt(process.env.LOGSTASH_PORT || "5001", 10);

  if (logstashHost && logstashPort) {
    const net = require("net");
    let logstashStream: any = null;
    let connectionAttempted = false;

    const connectToLogstash = () => {
      if (connectionAttempted) return;
      connectionAttempted = true;

      try {
        logstashStream = new net.Socket();
        logstashStream.setKeepAlive(true, 30000); // Keep alive for 30 seconds

        logstashStream.connect(logstashPort, logstashHost, () => {
          console.log(
            `✅ Connected to Logstash at ${logstashHost}:${logstashPort}`,
          );
        });

        logstashStream.on("error", (err: Error) => {
          console.log(
            `⚠️  Logstash connection error: ${err.message} (continuing with console logging)`,
          );
          logstashStream = null;
        });

        logstashStream.on("close", () => {
          console.log(`🔌 Logstash connection closed`);
          logstashStream = null;
        });
      } catch (error) {
        console.log(
          `⚠️  Could not connect to Logstash (continuing with console logging)`,
        );
        logstashStream = null;
      }
    };

    // Try to connect after services are more likely to be ready
    setTimeout(connectToLogstash, 10000); // 10 seconds instead of 2

    streams.push({
      stream: {
        write: (msg: string) => {
          try {
            if (logstashStream && logstashStream.writable) {
              const logEntry = JSON.parse(msg);
              logEntry.timestamp = logEntry.time || new Date().toISOString();
              logEntry.service = logEntry.name || serviceName;
              logstashStream.write(JSON.stringify(logEntry) + "\n");
            }
          } catch (error) {
            console.log(`⚠️  Error writing to Logstash:`, error);
          }
        },
      },
      level,
    });
  }

  return pino(
    {
      name: serviceName,
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
    },
    pino.multistream(streams),
  );
};

const setupMetrics = (
  fastify: FastifyInstance,
  serviceName: string,
  metricsPath: string = "/metrics",
): promClient.Registry => {
  const register = new promClient.Registry();
  register.setDefaultLabels({ service: serviceName });

  // Collect default metrics
  promClient.collectDefaultMetrics({
    register,
  });

  // HTTP request duration histogram
  const httpRequestDuration = new promClient.Histogram({
    name: "http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "status_code", "service"],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000],
    registers: [register],
  });

  // HTTP request counter
  const httpRequestsTotal = new promClient.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code", "service"],
    registers: [register],
  });

  // Track request metrics
  fastify.addHook(
    "onResponse",
    (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void,
    ) => {
      const route = request.routeOptions.url || request.url;

      // Skip metrics endpoint to avoid self-monitoring
      if (route !== metricsPath) {
        const labels = {
          method: request.method,
          route,
          status_code: reply.statusCode.toString(),
          service: serviceName,
        };

        httpRequestDuration.labels(labels).observe(reply.elapsedTime);
        httpRequestsTotal.labels(labels).inc();
      }
      done();
    },
  );

  // Metrics endpoint
  fastify.get(
    metricsPath,
    {
      schema: {
        description: "Prometheus metrics endpoint",
        tags: ["monitoring"],
        response: {
          200: {
            type: "string",
            description: "Prometheus metrics in text format",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.header("Content-Type", register.contentType);
      return register.metrics();
    },
  );

  return register;
};

const setupHealthCheck = (
  fastify: FastifyInstance,
  serviceName: string,
  healthPath: string = "/health",
): void => {
  fastify.get(
    healthPath,
    {
      schema: {
        description: "Health check endpoint",
        tags: ["monitoring"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return {
        status: "ok",
        service: serviceName,
        timestamp: new Date().toISOString(),
      };
    },
  );
};

export const setupObservability = (
  fastify: FastifyInstance,
  config: string | ObservabilityConfig,
): ObservabilitySetup => {
  // Handle both string and object configs
  let observabilityConfig: ObservabilityConfig;
  if (typeof config === "string") {
    observabilityConfig = { serviceName: config };
  } else {
    observabilityConfig = config;
  }

  const {
    serviceName,
    logLevel = "info",
    enableMetrics = true,
    enableHealthCheck = true,
    metricsPath = "/metrics",
    healthPath = "/health",
  } = observabilityConfig;

  const logger = setupLogging(serviceName, logLevel);

  // Set up Fastify logger
  fastify.log = logger;

  let metricsRegistry: promClient.Registry;
  if (enableMetrics) {
    metricsRegistry = setupMetrics(fastify, serviceName, metricsPath);
  } else {
    metricsRegistry = new promClient.Registry();
  }

  if (enableHealthCheck) {
    setupHealthCheck(fastify, serviceName, healthPath);
  }

  return {
    logger,
    metricsRegistry,
  };
};
