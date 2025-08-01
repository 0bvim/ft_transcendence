import { FastifyInstance } from 'fastify';

// Simplified multiplayer manager for local tournament coordination
// No WebSocket needed - players join tournaments remotely but play locally on same machine
class TournamentCoordinator {
  private matches: Map<string, any> = new Map();

  // Create a match entry for tournament coordination
  createMatch(matchId: string, player1Id: string, player2Id: string) {
    const match = {
      id: matchId,
      player1: player1Id,
      player2: player2Id,
      status: 'waiting', // waiting, ready, in_progress, completed
      hostMachine: null, // Which machine will host the local game
      createdAt: new Date().toISOString()
    };
    
    this.matches.set(matchId, match);
    return match;
  }

  // Set which machine will host the local multiplayer game
  setHostMachine(matchId: string, hostUserId: string) {
    const match = this.matches.get(matchId);
    if (match) {
      match.hostMachine = hostUserId;
      match.status = 'ready';
    }
    return match;
  }

  // Get match details for coordination
  getMatch(matchId: string) {
    return this.matches.get(matchId);
  }

  // Update match status
  updateMatchStatus(matchId: string, status: string, result?: any) {
    const match = this.matches.get(matchId);
    if (match) {
      match.status = status;
      if (result) {
        match.result = result;
      }
    }
    return match;
  }

  // Clean up completed matches
  cleanupMatch(matchId: string) {
    this.matches.delete(matchId);
  }
}

export const tournamentCoordinator = new TournamentCoordinator();

// Simple HTTP-based coordination routes (no WebSocket needed)
export async function setupMultiplayerRoutes(fastify: FastifyInstance) {
  // Create a match for tournament coordination
  fastify.post('/api/match/create', async (request, reply) => {
    const { matchId, player1Id, player2Id } = request.body as any;
    
    if (!matchId || !player1Id || !player2Id) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }
    
    const match = tournamentCoordinator.createMatch(matchId, player1Id, player2Id);
    return { success: true, match };
  });

  // Set host machine for local multiplayer
  fastify.post('/api/match/:matchId/set-host', async (request, reply) => {
    const { matchId } = request.params as { matchId: string };
    const { hostUserId } = request.body as any;
    
    const match = tournamentCoordinator.setHostMachine(matchId, hostUserId);
    if (!match) {
      return reply.code(404).send({ error: 'Match not found' });
    }
    
    return { success: true, match };
  });

  // Get match status for coordination
  fastify.get('/api/match/:matchId/status', async (request, reply) => {
    const { matchId } = request.params as { matchId: string };
    const match = tournamentCoordinator.getMatch(matchId);
    
    if (!match) {
      return reply.code(404).send({ error: 'Match not found' });
    }
    
    return match;
  });

  // Update match status and results
  fastify.post('/api/match/:matchId/update', async (request, reply) => {
    const { matchId } = request.params as { matchId: string };
    const { status, result } = request.body as any;
    
    const match = tournamentCoordinator.updateMatchStatus(matchId, status, result);
    if (!match) {
      return reply.code(404).send({ error: 'Match not found' });
    }
    
    return { success: true, match };
  });
}
