import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import dotenv from "dotenv";
import { setupObservability } from "@ft-transcendence/observability";
import { AddressInfo } from "net";
import path from "path";
import fs from "fs";
import { z } from "zod";

dotenv.config();

const app = Fastify();

// Setup observability for ELK stack
setupObservability(app, {
  serviceName: "game-service",
  logLevel: process.env["LOG_LEVEL"] || "info",
  enableMetrics: true,
  enableHealthCheck: true,
  healthPath: "/health",
  metricsPath: "/metrics",
});

// Validation schemas for tournament integration
const TournamentMatchSchema = z.object({
  matchId: z.string().min(1),
  tournamentId: z.string().min(1),
  player1: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    isAI: z.boolean().default(false),
    aiDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional()
  }),
  player2: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    isAI: z.boolean().default(false),
    aiDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional()
  })
});

const MatchResultSchema = z.object({
  matchId: z.string().min(1),
  winnerId: z.string().min(1),
  player1Score: z.number().int().min(0),
  player2Score: z.number().int().min(0),
  userId: z.string().min(1) // User submitting the result
});

// Initialize async setup
const initializeApp = async () => {
  // Logging for service startup
  app.log.info("Game service starting up");

  // Tournament API endpoints
  await registerTournamentRoutes();

  // Register static file serving (much simpler!)
  await app.register(require("@fastify/static"), {
    root: path.join(__dirname, "../dist/game"),
    prefix: "/",
  });

  // SPA fallback route - serve index.html for unknown routes
  app.setNotFoundHandler(
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.log.info(
        {
          action: "spa_fallback",
          path: request.url,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "SPA fallback to index.html",
      );

      const indexPath = path.join(__dirname, "../dist/game/index.html");
      const content = fs.readFileSync(indexPath);
      return reply.type("text/html").send(content);
    },
  );
};

// Tournament API routes
async function registerTournamentRoutes() {
  // Get tournament match details for game initialization
  app.get('/api/tournament/match/:matchId', {
    schema: {
      description: 'Get tournament match details for game',
      tags: ['tournament'],
      params: {
        type: 'object',
        required: ['matchId'],
        properties: {
          matchId: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { matchId: string } }>, reply: FastifyReply) => {
    try {
      const { matchId } = request.params;
      
      // Get match details from tournament service
      const tournamentServiceUrl = process.env.TOURNAMENT_SERVICE_URL || 'http://tournament:4243';
      const response = await fetch(`${tournamentServiceUrl}/matches/${matchId}`);
      
      if (!response.ok) {
        return reply.status(404).send({
          success: false,
          error: 'Match not found'
        });
      }
      
      const matchData = await response.json() as any;
      
      return reply.status(200).send({
        success: true,
        data: matchData.data
      });
      
    } catch (error) {
      app.log.error('Error fetching match details:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch match details'
      });
    }
  });

  // Submit match result back to tournament service
  app.post('/api/tournament/match/result', {
    schema: {
      description: 'Submit tournament match result',
      tags: ['tournament'],
      body: {
        type: 'object',
        required: ['matchId', 'winnerId', 'player1Score', 'player2Score', 'userId'],
        properties: {
          matchId: { type: 'string', minLength: 1 },
          winnerId: { type: 'string', minLength: 1 },
          player1Score: { type: 'number', minimum: 0 },
          player2Score: { type: 'number', minimum: 0 },
          userId: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const matchResult = MatchResultSchema.parse(request.body);
      
      app.log.info('Submitting match result to tournament service', {
        action: 'submit_match_result',
        matchId: matchResult.matchId,
        winnerId: matchResult.winnerId,
        scores: {
          player1: matchResult.player1Score,
          player2: matchResult.player2Score
        }
      });
      
      // Submit result to tournament service
      const tournamentServiceUrl = process.env.TOURNAMENT_SERVICE_URL || 'http://tournament:4243';
      const response = await fetch(`${tournamentServiceUrl}/matches/${matchResult.matchId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          winnerId: matchResult.winnerId,
          player1Score: matchResult.player1Score,
          player2Score: matchResult.player2Score,
          userId: matchResult.userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        app.log.error('Tournament service rejected match result', {
          status: response.status,
          error: errorData
        });
        
        return reply.status(response.status).send({
          success: false,
          error: errorData.message || 'Failed to submit match result'
        });
      }
      
      const result = await response.json() as any;
      
      app.log.info('Match result submitted successfully', {
        action: 'submit_match_result_success',
        matchId: matchResult.matchId,
        result: result
      });
      
      return reply.status(200).send({
        success: true,
        data: result.data,
        message: 'Match result submitted successfully'
      });
      
    } catch (error) {
      app.log.error('Error submitting match result:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to submit match result'
      });
    }
  });

  // Serve tournament match game with context
  app.get('/tournament/:tournamentId/match/:matchId', async (request: FastifyRequest<{ 
    Params: { tournamentId: string, matchId: string }
  }>, reply: FastifyReply) => {
    try {
      const { tournamentId, matchId } = request.params;
      
      app.log.info('Serving tournament match game', {
        action: 'serve_tournament_game',
        tournamentId,
        matchId
      });
      
      // Serve the game HTML with tournament context
      const indexPath = path.join(__dirname, "../dist/game/index.html");
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Inject tournament context into the HTML
      const tournamentContext = {
        matchId,
        tournamentId,
        isTournamentMatch: true,
        gameServiceUrl: `http://${request.headers.host}`
      };
      
      content = content.replace(
        '<div id="pong"></div>',
        `<div id="pong"></div>
        <script>
          window.TOURNAMENT_CONTEXT = ${JSON.stringify(tournamentContext)};
        </script>`
      );
      
      return reply.type("text/html").send(content);
      
    } catch (error) {
      app.log.error('Error serving tournament match game:', error);
      return reply.status(500).send('Failed to load tournament match');
    }
  });
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await app.close();
    app.log.info("Game service closed successfully");
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

    const port = parseInt(process.env["PORT"] || "3003");
    const address = await app.listen({
      port: port,
      host: "0.0.0.0",
    });

    app.log.info(
      {
        service: "game-service",
        address: address,
        port: port,
      },
      "Game service started successfully",
    );
  } catch (err) {
    app.log.error(err, "Error starting game service");
    process.exit(1);
  }
};

start();
