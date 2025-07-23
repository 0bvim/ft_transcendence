import { FastifyInstance } from "fastify";
import { createTournament } from "./controllers/create-tournament";
import { getTournaments } from "./controllers/get-tournaments";
import { getTournament } from "./controllers/get-tournament";
import { joinTournament } from "./controllers/join-tournament";
import { startTournament } from "./controllers/start-tournament";
import { submitMatchResult } from "./controllers/submit-match-result";
import { getUserStats } from "./controllers/get-user-stats";
import { env } from "../env";

export async function appRoutes(app: FastifyInstance) {
  // Debug endpoint - remove in production
  app.get("/debug/config", async (request, reply) => {
    return reply.status(200).send({
      environment: process.env.NODE_ENV,
      cors_configured: true,
      database_url: env.DATABASE_URL,
      auth_service_url: env.AUTH_SERVICE_URL,
      game_service_url: env.GAME_SERVICE_URL,
      blockchain_service_url: env.BLOCKCHAIN_SERVICE_URL,
      port: env.PORT,
    });
  });

  // Tournament management routes
  app.post("/tournaments", createTournament);
  app.get("/tournaments", getTournaments);
  app.get("/tournaments/:id", getTournament);
  app.post("/tournaments/:id/join", joinTournament);
  app.post("/tournaments/:id/start", startTournament);
  
  // Match management routes
  app.get("/matches/:id", getMatchDetails);
  app.post("/matches/:id/result", submitMatchResult);
  
  // User stats routes
  app.get("/users/:id/stats", getUserStats);
  
  // Tournament status routes
  app.get("/tournaments/:id/matches", async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Implement get tournament matches
    return reply.status(200).send({ tournamentId: id, matches: [] });
  });
  
  app.get("/tournaments/:id/participants", async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Implement get tournament participants
    return reply.status(200).send({ tournamentId: id, participants: [] });
  });
}

// Get match details controller (inline for now)
async function getMatchDetails(request: any, reply: any) {
  try {
    const { id: matchId } = request.params;
    
    // Get match with tournament and participant details
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            tournamentType: true,
            aiDifficulty: true
          }
        },
        participants: {
          select: {
            id: true,
            displayName: true,
            participantType: true,
            userId: true
          }
        }
      }
    });

    if (!match) {
      return reply.status(404).send({
        success: false,
        error: 'Match not found'
      });
    }

    // Get participant details
    const allParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId: match.tournamentId,
        id: { in: [match.player1Id, match.player2Id].filter(Boolean) }
      },
      select: {
        id: true,
        displayName: true,
        participantType: true,
        userId: true
      }
    });

    const player1 = allParticipants.find(p => p.id === match.player1Id);
    const player2 = allParticipants.find(p => p.id === match.player2Id);

    // Format match data for game service
    const matchData = {
      matchId: match.id,
      tournamentId: match.tournamentId,
      tournament: match.tournament,
      round: match.round,
      matchNumber: match.matchNumber,
      status: match.status,
      player1: player1 ? {
        id: player1.id,
        displayName: player1.displayName,
        isAI: player1.participantType === 'AI',
        aiDifficulty: player1.participantType === 'AI' ? match.tournament?.aiDifficulty : undefined,
        userId: player1.userId
      } : null,
      player2: player2 ? {
        id: player2.id,
        displayName: player2.displayName,
        isAI: player2.participantType === 'AI',
        aiDifficulty: player2.participantType === 'AI' ? match.tournament?.aiDifficulty : undefined,
        userId: player2.userId
      } : null,
      startedAt: match.startedAt,
      createdAt: match.createdAt
    };

    await prisma.$disconnect();

    return reply.status(200).send({
      success: true,
      data: matchData
    });

  } catch (error) {
    request.log.error('Error fetching match details:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
