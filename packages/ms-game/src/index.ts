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
  // Tournament API endpoints
  await registerTournamentRoutes();

  // SPA fallback with tournament context injection via URL parameters and static file serving
  app.get('/game/*', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;
    
    // Handle static files first (CSS, JS, images, etc.)
    if (url.includes('.')) {
      const filePath = path.join(__dirname, "../dist/game", url.replace('/game/', ''));
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          
          // Set appropriate content type
          let contentType = 'text/plain';
          switch (ext) {
            case '.html': contentType = 'text/html'; break;
            case '.js': contentType = 'application/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
            case '.json': contentType = 'application/json'; break;
          }
          
          return reply.type(contentType).send(content);
        }
      } catch (error) {
        // File not found, fall through to SPA handling
      }
    }
    
    // SPA fallback - serve index.html with tournament context injection
    const indexPath = path.join(__dirname, "../dist/game/index.html");
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for tournament parameters
    const tournamentId = (request.query as any)?.tournament as string;
    const matchId = (request.query as any)?.match as string;
    
    if (tournamentId && matchId) {
      // Create tournament context
      const tournamentContext = {
        matchId,
        tournamentId,
        isTournamentMatch: true,
        gameServiceUrl: `http://${request.headers.host}`
      };
      
      // Inject tournament context script
      const tournamentScript = `
        <script>
          window.TOURNAMENT_CONTEXT = ${JSON.stringify(tournamentContext)};
        </script>`;
      
      // Append the tournament script to the content
      content = content + tournamentScript;
    }
    
    return reply.type("text/html").send(content);
  });

  // Root route redirect to game
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.redirect('/game/');
  });
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
      const tournamentServiceUrl = process.env.TOURNAMENT_SERVICE_URL || 'http://tournament:3003';
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
      
      app.log.info({
        action: 'match_result_submission_started',
        matchId: matchResult.matchId,
        winnerId: matchResult.winnerId,
        player1Score: matchResult.player1Score,
        player2Score: matchResult.player2Score,
        userId: matchResult.userId
      }, `Match result submission started for match ${matchResult.matchId}`);
      
      // Submit result to tournament service
      const tournamentServiceUrl = process.env.TOURNAMENT_SERVICE_URL || 'http://tournament:3003';
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
        
        app.log.error({
          action: 'match_result_submission_rejected',
          matchId: matchResult.matchId,
          status: response.status,
          error: errorData.message || 'Unknown error'
        }, `Tournament service rejected match result for ${matchResult.matchId}`);
        
        return reply.status(response.status).send({
          success: false,
          error: errorData.message || 'Failed to submit match result'
        });
      }
      
      const result = await response.json() as any;
      
      app.log.info({
        action: 'match_result_submission_success',
        matchId: matchResult.matchId,
        winnerId: matchResult.winnerId,
        scores: `${matchResult.player1Score}-${matchResult.player2Score}`
      }, `Match result submitted successfully for ${matchResult.matchId}`);
      
      return reply.status(200).send({
        success: true,
        data: result.data,
        message: 'Match result submitted successfully'
      });
      
    } catch (error) {
      app.log.error({
        action: 'match_result_submission_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to submit match result');
      
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
