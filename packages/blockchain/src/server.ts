import fastify from "fastify";
import cors from "@fastify/cors";
import { BlockchainService } from "./services/blockchain-service";
import { blockchainRoutes } from "./routes/blockchain-routes";
import { setupObservability } from "@ft-transcendence/observability";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();
dotenv.config({ path: ".env.development" });

// Environment variables
const PORT = parseInt(process.env.PORT || "3003");
const NODE_ENV = process.env.NODE_ENV || "development";
const AVALANCHE_RPC_URL =
  process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const TOURNAMENT_SCORING_CONTRACT_ADDRESS =
  process.env.TOURNAMENT_SCORING_CONTRACT_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3010";

// Initialize Fastify server
const server = fastify({
  logger: false, // Will be set up by observability
});

// Setup observability for ELK stack
setupObservability(server, {
  serviceName: "blockchain",
  logLevel: process.env.LOG_LEVEL || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
  metricsPath: "/metrics",
});

// Validate required environment variables
if (!TOURNAMENT_SCORING_CONTRACT_ADDRESS) {
  server.log.error("TOURNAMENT_SCORING_CONTRACT_ADDRESS is required");
  process.exit(1);
}

if (!PRIVATE_KEY) {
  server.log.error("PRIVATE_KEY is required");
  process.exit(1);
}

async function startServer() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: [FRONTEND_URL, "http://localhost:3010"],
      credentials: true,
    });

    // Initialize blockchain service
    server.log.info("Initializing blockchain service...");
    const blockchainService = new BlockchainService(
      AVALANCHE_RPC_URL,
      TOURNAMENT_SCORING_CONTRACT_ADDRESS,
      PRIVATE_KEY,
      server.log
    );

    // Verify blockchain connection
    server.log.info("Verifying blockchain connection...");
    const isDeployed = await blockchainService.isContractDeployed();
    const networkInfo = await blockchainService.getNetworkInfo();

    if (!isDeployed) {
      server.log.warn(
        {
          contractAddress: TOURNAMENT_SCORING_CONTRACT_ADDRESS,
          network: networkInfo.name,
          chainId: networkInfo.chainId,
        },
        "Smart contract is not deployed at the specified address"
      );
    } else {
      server.log.info(
        {
          contractAddress: TOURNAMENT_SCORING_CONTRACT_ADDRESS,
          network: networkInfo.name,
          chainId: networkInfo.chainId,
        },
        "Smart contract verified successfully"
      );
    }

    // Register blockchain routes
    server.log.info("Registering blockchain routes...");
    await server.register(
      async (fastify) => {
        await blockchainRoutes(fastify, blockchainService);
      },
      { prefix: "/api/blockchain" }
    );

    // Add global error handler
    server.setErrorHandler((error, request, reply) => {
      server.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "Global error handler triggered"
      );

      reply.status(500).send({
        success: false,
        error: "Internal server error",
        message:
          NODE_ENV === "development" ? error.message : "An error occurred",
      });
    });

    // Enhanced health check endpoint (observability provides basic /health)
    server.get("/health/detailed", async (request, reply) => {
      try {
        const isHealthy = await blockchainService.isContractDeployed();
        const networkInfo = await blockchainService.getNetworkInfo();

        server.log.info(
          {
            action: "health_check_detailed",
            contractDeployed: isHealthy,
            network: networkInfo,
          },
          "Detailed health check performed"
        );

        return reply.status(200).send({
          success: true,
          message: "Blockchain service is healthy",
          data: {
            service: "blockchain",
            version: "1.0.0",
            environment: NODE_ENV,
            contractDeployed: isHealthy,
            network: networkInfo,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        server.log.error(
          {
            action: "health_check_detailed",
            error: error instanceof Error ? error.message : String(error),
          },
          "Detailed health check failed"
        );

        return reply.status(500).send({
          success: false,
          error: "Health check failed",
          message: "Blockchain service is not healthy",
        });
      }
    });

    // Start server
    const address = await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(
      {
        service: "blockchain",
        address: address,
        port: PORT,
        environment: NODE_ENV,
        contractAddress: TOURNAMENT_SCORING_CONTRACT_ADDRESS,
      },
      "Blockchain service started successfully"
    );
  } catch (error) {
    server.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        port: PORT,
        environment: NODE_ENV,
      },
      "Failed to start blockchain service"
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  server.log.info("Received SIGTERM, shutting down gracefully...");
  await server.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  server.log.info("Received SIGINT, shutting down gracefully...");
  await server.close();
  process.exit(0);
});

// Start the server
startServer();
