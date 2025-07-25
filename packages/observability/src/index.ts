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
    let logQueue: string[] = [];

    const flushQueuedLogs = () => {
      if (logstashStream && logstashStream.writable && logQueue.length > 0) {
        // Use structured logging instead of console.log for internal operations
        const logger = pino({ name: serviceName });
        logger.debug(`Flushing ${logQueue.length} queued logs to Logstash`);
        logQueue.forEach((logEntry) => {
          logstashStream.write(logEntry + "\n");
        });
        logQueue = [];
      }
    };

    const connectToLogstash = () => {
      if (connectionAttempted) return;
      connectionAttempted = true;

      const attemptConnection = (retryCount = 0) => {
        try {
          logstashStream = new net.Socket();
          logstashStream.setKeepAlive(true, 30000); // Keep alive for 30 seconds

          logstashStream.connect(logstashPort, logstashHost, () => {
            // Log connection success only at debug level to reduce noise
            const logger = pino({ name: serviceName, level: 'info' });
            logger.info(`Connected to Logstash at ${logstashHost}:${logstashPort}`);
            flushQueuedLogs();
          });

          logstashStream.on("error", (err: Error) => {
            const logger = pino({ name: serviceName });
            logger.warn(`Logstash connection error: ${err.message} (continuing with console logging)`);
            logstashStream = null;

            // Retry connection after 5 seconds if under 3 attempts
            if (retryCount < 3) {
              setTimeout(() => {
                connectionAttempted = false;
                attemptConnection(retryCount + 1);
              }, 5000);
            }
          });

          logstashStream.on("close", () => {
            const logger = pino({ name: serviceName });
            logger.debug(`Logstash connection closed`);
            logstashStream = null;

            // Retry connection after 10 seconds if under 3 attempts
            if (retryCount < 3) {
              setTimeout(() => {
                connectionAttempted = false;
                attemptConnection(retryCount + 1);
              }, 10000);
            }
          });
        } catch (error) {
          const logger = pino({ name: serviceName });
          logger.warn(`Could not connect to Logstash (continuing with console logging)`);
          logstashStream = null;
        }
      };

      attemptConnection();
    };

    // Try to connect immediately, then retry if needed
    setTimeout(connectToLogstash, 500);

    streams.push({
      stream: {
        write: (msg: string) => {
          try {
            const logEntry = JSON.parse(msg);
            logEntry.timestamp = logEntry.time || new Date().toISOString();
            logEntry.service = logEntry.name || serviceName;
            const formattedLog = JSON.stringify(logEntry);

            if (logstashStream && logstashStream.writable) {
              logstashStream.write(formattedLog + "\n");
            } else {
              // Queue the log if Logstash is not connected yet
              logQueue.push(formattedLog);
              // Limit queue size to prevent memory issues
              if (logQueue.length > 1000) {
                logQueue.shift(); // Remove oldest log
              }
            }
          } catch (error) {
            // Only log Logstash errors at debug level to reduce noise
            const logger = pino({ name: serviceName, level: 'debug' });
            logger.debug(`Error writing to Logstash:`, error);
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

const setupRequestLogging = (
  fastify: FastifyInstance,
  serviceName: string,
  metricsPath: string = "/metrics",
  healthPath: string = "/health",
): void => {
  // Only log setup completion at info level
  fastify.log.info(`Request logging configured for service: ${serviceName}`);

  // Add request logging hook - but filter out noisy endpoints
  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const url = request.url;
      
      // Skip logging for monitoring endpoints to reduce noise
      if (url === metricsPath || url === healthPath) {
        return;
      }

      // Only log important requests (API calls, not static assets)
      if (url.startsWith('/api/') || url.startsWith('/auth/') || url.startsWith('/tournament/')) {
        fastify.log.info(
          {
            method: request.method,
            url: request.url,
            userAgent: request.headers["user-agent"],
            ip: request.ip,
            service: serviceName,
          },
          `API request: ${request.method} ${request.url}`,
        );
      }
    },
  );

  fastify.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const url = request.url;
      
      // Skip logging for monitoring endpoints
      if (url === metricsPath || url === healthPath) {
        return;
      }

      // Log all responses with status >= 400 (errors) for debugging
      // Log info for important API endpoints with successful responses
      if (reply.statusCode >= 400) {
        fastify.log.warn(
          {
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            responseTime: reply.elapsedTime,
            service: serviceName,
          },
          `Error response: ${request.method} ${request.url} - ${reply.statusCode} (${reply.elapsedTime}ms)`,
        );
      } else if (url.startsWith('/api/') || url.startsWith('/auth/') || url.startsWith('/tournament/')) {
        // Only log successful API calls at debug level to reduce noise
        fastify.log.debug(
          {
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            responseTime: reply.elapsedTime,
            service: serviceName,
          },
          `API response: ${request.method} ${request.url} - ${reply.statusCode} (${reply.elapsedTime}ms)`,
        );
      }
    },
  );
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

  // Set up request logging with filtering
  setupRequestLogging(fastify, serviceName, metricsPath, healthPath);

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
