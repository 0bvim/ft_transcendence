import { FastifyInstance } from "fastify";
import { z } from "zod";
import { TournamentService } from "../lib/tournament-service";
import { authenticateToken } from "../middleware/auth";

const tournamentService = new TournamentService();

// Validation schemas
const createTournamentSchema = z.object({
  size: z.number().int().min(4).max(8).refine(val => val === 4 || val === 8, {
    message: "Tournament size must be 4 or 8 players"
  }),
  aiDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  playerAliases: z.array(z.string().min(1).max(50)).min(1).max(8),
});

const completeTournamentSchema = z.object({
  winnerId: z.string().optional(),
  winnerName: z.string().min(1),
});

export async function tournamentRoutes(fastify: FastifyInstance) {
  
  // Create a new tournament
  fastify.post("/tournaments", {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      try {
        const body = createTournamentSchema.parse(request.body);
        const userId = request.user!.id;

        // Validate that host is included in human players or add them
        let humanPlayers = body.playerAliases.map(alias => ({ userId, alias }));
        
        // Validate total players doesn't exceed tournament size
        if (humanPlayers.length > body.size) {
          return reply.status(400).send({
            error: `Too many human players. Maximum ${body.size} players allowed.`
          });
        }

        const tournament = await tournamentService.createTournament({
          hostUserId: userId,
          size: body.size,
          aiDifficulty: body.aiDifficulty,
          humanPlayers,
        });

        reply.status(201).send(tournament);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        console.error("Error creating tournament:", error);
        reply.status(500).send({ error: "Failed to create tournament" });
      }
    }
  });

  // Get tournament by ID
  fastify.get("/tournaments/:id", {
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tournament = await tournamentService.getTournamentById(id);
        reply.send(tournament);
      } catch (error) {
        console.error("Error fetching tournament:", error);
        reply.status(404).send({ error: "Tournament not found" });
      }
    }
  });

  // Start tournament
  fastify.post("/tournaments/:id/start", {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user!.id;

        // Verify user is the host
        const tournament = await tournamentService.getTournamentById(id);
        if (tournament.hostUserId !== userId) {
          return reply.status(403).send({ error: "Only tournament host can start the tournament" });
        }

        if (tournament.status !== "setup") {
          return reply.status(400).send({ error: "Tournament is not in setup phase" });
        }

        const updatedTournament = await tournamentService.startTournament(id);
        reply.send(updatedTournament);
      } catch (error) {
        console.error("Error starting tournament:", error);
        reply.status(500).send({ error: "Failed to start tournament" });
      }
    }
  });

  // Complete tournament
  fastify.patch("/tournaments/:id/complete", {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = completeTournamentSchema.parse(request.body);
        const userId = request.user!.id;

        // Verify user is the host
        const tournament = await tournamentService.getTournamentById(id);
        if (tournament.hostUserId !== userId) {
          return reply.status(403).send({ error: "Only tournament host can complete the tournament" });
        }

        if (tournament.status !== "in_progress") {
          return reply.status(400).send({ error: "Tournament is not in progress" });
        }

        const updatedTournament = await tournamentService.completeTournament(
          id,
          body.winnerId || null,
          body.winnerName
        );
        reply.send(updatedTournament);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        console.error("Error completing tournament:", error);
        reply.status(500).send({ error: "Failed to complete tournament" });
      }
    }
  });

  // Get user's tournaments
  fastify.get("/tournaments/user/:userId", {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      try {
        const { userId } = request.params as { userId: string };
        
        // Users can only view their own tournaments unless admin
        if (request.user!.id !== userId) {
          return reply.status(403).send({ error: "Access denied" });
        }

        const tournaments = await tournamentService.getUserTournaments(userId);
        reply.send(tournaments);
      } catch (error) {
        console.error("Error fetching user tournaments:", error);
        reply.status(500).send({ error: "Failed to fetch tournaments" });
      }
    }
  });

  // Get tournament bracket
  fastify.get("/tournaments/:id/bracket", {
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tournament = await tournamentService.getTournamentById(id);
        const bracketRounds = tournamentService.generateBracket(tournament.participants);
        
        // Flatten the bracket rounds into a single matches array
        const matches = bracketRounds.flat();
        
        reply.send({ 
          participants: tournament.participants,
          matches: matches
        });
      } catch (error) {
        console.error("Error generating bracket:", error);
        reply.status(500).send({ error: "Failed to generate bracket" });
      }
    }
  });

  // Get next match for tournament
  fastify.get("/tournaments/:id/next-match", {
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const tournament = await tournamentService.getTournamentById(id);
        const bracketRounds = tournamentService.generateBracket(tournament.participants);
        
        // Find the first pending match
        const allMatches = bracketRounds.flat();
        const nextMatch = allMatches.find(match => match.status === 'pending');
        
        reply.send(nextMatch || null);
      } catch (error) {
        console.error("Error getting next match:", error);
        reply.status(500).send({ error: "Failed to get next match" });
      }
    }
  });

  // Simulate specific AI vs AI match
  fastify.post("/tournaments/:id/matches/:matchId/simulate", {
    handler: async (request, reply) => {
      try {
        const { id, matchId } = request.params as { id: string, matchId: string };
        const tournament = await tournamentService.getTournamentById(id);
        const bracketRounds = tournamentService.generateBracket(tournament.participants);
        
        // Find the specific match to simulate
        const allMatches = bracketRounds.flat();
        const matchIndex = parseInt(matchId);
        const matchToSimulate = allMatches.find(match => match.matchIndex === matchIndex);
        
        if (!matchToSimulate) {
          return reply.status(404).send({ error: "Match not found" });
        }
        
        // Simulate the match
        const result = tournamentService.simulateAIMatch();
        const winner = result ? matchToSimulate.player1 : matchToSimulate.player2;
        
        // Update match status (in a real implementation, you'd update the database)
        matchToSimulate.winner = winner;
        matchToSimulate.status = 'completed';
        
        reply.send({ 
          matchIndex: matchToSimulate.matchIndex,
          winner: winner,
          player1Wins: result, 
          player2Wins: !result 
        });
      } catch (error) {
        console.error("Error simulating match:", error);
        reply.status(500).send({ error: "Failed to simulate match" });
      }
    }
  });

  // Simulate AI vs AI match
  fastify.post("/tournaments/simulate-ai-match", {
    handler: async (request, reply) => {
      try {
        const result = tournamentService.simulateAIMatch();
        reply.send({ player1Wins: result, player2Wins: !result });
      } catch (error) {
        console.error("Error simulating AI match:", error);
        reply.status(500).send({ error: "Failed to simulate match" });
      }
    }
  });

  // Remove duplicate health check - observability already provides one
}
