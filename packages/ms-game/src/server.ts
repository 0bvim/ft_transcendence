import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
// import { setupObservability } from '@ft-transcendence/observability';
import { GameManager } from './gameManager.js';
import { WebSocketMessage } from './types.js';
import { env } from './env.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create game manager instance
const gameManager = new GameManager();

// Create Fastify instance with HTTPS
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL
  },
  https: {
    key: fs.readFileSync(path.join(__dirname, '..', env.HTTPS_KEY_PATH)),
    cert: fs.readFileSync(path.join(__dirname, '..', env.HTTPS_CERT_PATH))
  }
});

// Setup Observability
// setupObservability(fastify, {
//   serviceName: 'game-service',
//   logLevel: env.LOG_LEVEL,
//   enableMetrics: true,
//   enableHealthCheck: true,
//   healthPath: '/health',
//   metricsPath: '/metrics',
// });

// Register CORS plugin
fastify.register(fastifyCors, {
  origin: true, // Accept all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});

// Register WebSocket plugin
fastify.register(websocket);

// WebSocket routes for different game modes
fastify.register(async function (fastify) {
  // Multiplayer game connection (requires authentication)
  fastify.get('/ws/multiplayer', { websocket: true }, async (connection, req) => {
    const result = await gameManager.addPlayer(connection.socket, req, {
      type: 'multiplayer',
      requiresAuth: true,
      maxPlayers: 2
    });

    if (!result.success) {
      connection.socket.close(1008, result.error || 'Authentication failed');
      return;
    }

    const playerId = result.playerId!;
    console.log(`Multiplayer player ${playerId} connected`);

    connection.socket.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        gameManager.handlePlayerMessage(playerId, message);
      } catch (error) {
        console.error(`Error parsing message from player ${playerId}:`, error);
      }
    });

    connection.socket.on('close', () => {
      console.log(`Multiplayer player ${playerId} disconnected`);
      gameManager.removePlayer(playerId);
    });

    connection.socket.on('error', (error) => {
      console.error(`WebSocket error for player ${playerId}:`, error);
      gameManager.removePlayer(playerId);
    });
  });

  // Local duel connection (no authentication required)
  fastify.get('/ws/local', { websocket: true }, async (connection, req) => {
    const result = await gameManager.addPlayer(connection.socket, req, {
      type: 'local',
      requiresAuth: false,
      maxPlayers: 2
    });

    if (!result.success) {
      connection.socket.close(1008, result.error || 'Connection failed');
      return;
    }

    const playerId = result.playerId!;
    console.log(`Local player ${playerId} connected`);

    connection.socket.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        gameManager.handlePlayerMessage(playerId, message);
      } catch (error) {
        console.error(`Error parsing message from local player ${playerId}:`, error);
      }
    });

    connection.socket.on('close', () => {
      console.log(`Local player ${playerId} disconnected`);
      gameManager.removePlayer(playerId);
    });

    connection.socket.on('error', (error) => {
      console.error(`WebSocket error for local player ${playerId}:`, error);
      gameManager.removePlayer(playerId);
    });
  });

  // Tournament game connection (requires authentication)
  fastify.get('/ws/tournament', { websocket: true }, async (connection, req) => {
    const result = await gameManager.addPlayer(connection.socket, req, {
      type: 'tournament',
      requiresAuth: true,
      maxPlayers: 2
    });

    if (!result.success) {
      connection.socket.close(1008, result.error || 'Authentication failed');
      return;
    }

    const playerId = result.playerId!;
    console.log(`Tournament player ${playerId} connected`);

    connection.socket.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        gameManager.handlePlayerMessage(playerId, message);
      } catch (error) {
        console.error(`Error parsing message from tournament player ${playerId}:`, error);
      }
    });

    connection.socket.on('close', () => {
      console.log(`Tournament player ${playerId} disconnected`);
      gameManager.removePlayer(playerId);
    });

    connection.socket.on('error', (error) => {
      console.error(`WebSocket error for tournament player ${playerId}:`, error);
      gameManager.removePlayer(playerId);
    });
  });
});

// API routes
fastify.get('/api/stats', async (request, reply) => {
  return {
    waitingPlayers: gameManager.getWaitingPlayersCount(),
    activeGames: gameManager.getActiveGamesCount()
  };
});

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ms-game'
  };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ 
      port: env.PORT, 
      host: env.HOST 
    });
    
    console.log(`🎮 Game Service running on https://${env.HOST}:${env.PORT}`);
    console.log(`📊 Stats available at: https://${env.HOST}:${env.PORT}/api/stats`);
    console.log(`🔌 WebSocket endpoints:`);
    console.log(`   - Multiplayer: wss://${env.HOST}:${env.PORT}/ws/multiplayer`);
    console.log(`   - Local Duel: wss://${env.HOST}:${env.PORT}/ws/local`);
    console.log(`   - Tournament: wss://${env.HOST}:${env.PORT}/ws/tournament`);
    console.log(`\n🔒 Using self-signed certificates - browsers will show security warning`);
    console.log(`   Accept the warning to proceed with the game\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down game service...');
  await fastify.close();
  process.exit(0);
});

start();
