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

  // Add Logstash HTTP output for ELK stack (Docker internal communication)
  const logstashHost = process.env.LOGSTASH_HOST || "logstash";
  const logstashPort = parseInt(process.env.LOGSTASH_PORT || "5001", 10);
  const logstashProtocol = process.env.LOGSTASH_PROTOCOL || "http";

  if (logstashHost && logstashPort) {
    const https = require("https");
    const http = require("http");
    let logQueue: string[] = [];
    let isProcessingQueue = false;

    const sendLogToLogstash = async (logEntry: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(logEntry);
        const client = logstashProtocol === 'https' ? https : http;
        
        const options = {
          hostname: logstashHost,
          port: logstashPort,
          path: '/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
          // For HTTPS, allow self-signed certificates in development
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        };

        const req = client.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (error: any) => {
          reject(error);
        });

        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
      });
    };

    const processLogQueue = async () => {
      if (isProcessingQueue || logQueue.length === 0) return;
      
      isProcessingQueue = true;
      const logger = pino({ name: serviceName });
      
      while (logQueue.length > 0) {
        const logEntry = logQueue.shift();
        if (!logEntry) continue;
        
        try {
          await sendLogToLogstash(JSON.parse(logEntry));
        } catch (error) {
          logger.debug(`Failed to send log to Logstash: ${error}`);
          // Re-queue the log entry for retry (but limit retries)
          if (logQueue.length < 500) {
            logQueue.unshift(logEntry);
          }
          break; // Stop processing on error to avoid flooding
        }
      }
      
      isProcessingQueue = false;
    };

    // Process queue periodically
    setInterval(processLogQueue, 1000);

    streams.push({
      stream: {
        write: (msg: string) => {
          try {
            const logEntry = JSON.parse(msg);
            logEntry.timestamp = logEntry.time || new Date().toISOString();
            logEntry.service = logEntry.name || serviceName;
            const formattedLog = JSON.stringify(logEntry);

            // Queue the log for HTTPS processing
            logQueue.push(formattedLog);
            // Limit queue size to prevent memory issues
            if (logQueue.length > 1000) {
              logQueue.shift(); // Remove oldest log
            }
          } catch (error) {
            // Only log Logstash errors at debug level to reduce noise
            const logger = pino({ name: serviceName, level: 'debug' });
            logger.debug(`Error formatting log for Logstash:`, error);
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
        level: (label: any) => {
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
