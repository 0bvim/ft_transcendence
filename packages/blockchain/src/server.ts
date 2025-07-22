import fastify from 'fastify';
import cors from '@fastify/cors';
import { BlockchainService } from './services/blockchain-service';
import { blockchainRoutes } from './routes/blockchain-routes';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.development' });

// Environment variables
const PORT = parseInt(process.env.PORT || '3003');
const NODE_ENV = process.env.NODE_ENV || 'development';
const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const TOURNAMENT_SCORING_CONTRACT_ADDRESS = process.env.TOURNAMENT_SCORING_CONTRACT_ADDRESS || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';

// Initialize Fastify server
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Validate required environment variables
if (!TOURNAMENT_SCORING_CONTRACT_ADDRESS) {
  console.error('❌ TOURNAMENT_SCORING_CONTRACT_ADDRESS is required');
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY is required');
  process.exit(1);
}

async function startServer() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: [FRONTEND_URL, 'http://localhost:3010'],
      credentials: true
    });

    // Initialize blockchain service
    console.log('🔗 Initializing blockchain service...');
    const blockchainService = new BlockchainService(
      AVALANCHE_RPC_URL,
      TOURNAMENT_SCORING_CONTRACT_ADDRESS,
      PRIVATE_KEY
    );

    // Verify blockchain connection
    console.log('🔍 Verifying blockchain connection...');
    const isDeployed = await blockchainService.isContractDeployed();
    const networkInfo = await blockchainService.getNetworkInfo();
    
    if (!isDeployed) {
      console.warn('⚠️  Smart contract is not deployed at the specified address');
      console.warn('Contract Address:', TOURNAMENT_SCORING_CONTRACT_ADDRESS);
      console.warn('Network:', networkInfo.name, `(Chain ID: ${networkInfo.chainId})`);
    } else {
      console.log('✅ Smart contract verified successfully');
      console.log('Contract Address:', TOURNAMENT_SCORING_CONTRACT_ADDRESS);
      console.log('Network:', networkInfo.name, `(Chain ID: ${networkInfo.chainId})`);
    }

    // Register blockchain routes
    console.log('🛣️  Registering blockchain routes...');
    await server.register(async (fastify) => {
      await blockchainRoutes(fastify, blockchainService);
    }, { prefix: '/api/blockchain' });

    // Add global error handler
    server.setErrorHandler((error, request, reply) => {
      console.error('❌ Global error handler:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? error.message : 'An error occurred'
      });
    });

    // Add health check endpoint
    server.get('/health', async (request, reply) => {
      try {
        const isHealthy = await blockchainService.isContractDeployed();
        const networkInfo = await blockchainService.getNetworkInfo();
        
        return reply.status(200).send({
          success: true,
          message: 'Blockchain service is healthy',
          data: {
            service: 'blockchain',
            version: '1.0.0',
            environment: NODE_ENV,
            contractDeployed: isHealthy,
            network: networkInfo,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: 'Health check failed',
          message: 'Blockchain service is not healthy'
        });
      }
    });

    // Start server
    const address = await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Blockchain service running at ${address}`);
    console.log(`📚 API Documentation: ${address}/documentation`);
    console.log(`🔍 Health Check: ${address}/health`);
    console.log(`🏥 Blockchain API: ${address}/api/blockchain`);

  } catch (error) {
    console.error('❌ Failed to start blockchain service:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Start the server
startServer();
