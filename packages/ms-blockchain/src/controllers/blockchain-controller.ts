import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { BlockchainService } from '../services/blockchain-service';

// Validation schemas
const createTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  maxParticipants: z.number().min(4).max(8)
});

const addParticipantSchema = z.object({
  tournamentId: z.number().positive(),
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50),
  participantType: z.enum(['HUMAN', 'AI'])
});

const recordMatchResultSchema = z.object({
  tournamentId: z.number().positive(),
  round: z.number().positive(),
  player1Id: z.string().min(1),
  player2Id: z.string().min(1),
  winnerId: z.string().min(1),
  player1Score: z.number().min(0),
  player2Score: z.number().min(0)
});

const completeTournamentSchema = z.object({
  tournamentId: z.number().positive(),
  winnerId: z.string().min(1),
  finalPositions: z.array(z.string().min(1))
});

export class BlockchainController {
  private blockchainService: BlockchainService;

  constructor(blockchainService: BlockchainService) {
    this.blockchainService = blockchainService;
  }

  /**
   * Create a new tournament on the blockchain
   */
  async createTournament(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = createTournamentSchema.parse(request.body);
      
      const result = await this.blockchainService.createTournament(
        body.name,
        body.description,
        body.maxParticipants
      );
      
      return reply.status(201).send({
        success: true,
        message: 'Tournament created successfully on blockchain',
        data: {
          tournamentId: result.tournamentId,
          transactionHash: result.transactionHash
        }
      });
    } catch (error) {
      request.log.error('Blockchain tournament creation failed', { 
        action: 'createTournament',
        error: error instanceof Error ? error.message : error,
        input: request.body
      });
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid input',
          message: error.errors[0].message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to create tournament on blockchain'
      });
    }
  }

  /**
   * Add a participant to a tournament
   */
  async addParticipant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = addParticipantSchema.parse(request.body);
      
      const transactionHash = await this.blockchainService.addParticipant(
        body.tournamentId,
        body.userId,
        body.displayName,
        body.participantType
      );
      
      return reply.status(200).send({
        success: true,
        message: 'Participant added successfully to blockchain',
        data: {
          transactionHash
        }
      });
    } catch (error) {
      request.log.error('Blockchain participant addition failed', {
        action: 'addParticipant', 
        error: error instanceof Error ? error.message : error,
        input: request.body
      });
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid input',
          message: error.errors[0].message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to add participant to blockchain'
      });
    }
  }

  /**
   * Start a tournament on the blockchain
   */
  async startTournament(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tournamentId } = request.params as { tournamentId: string };
      
      const transactionHash = await this.blockchainService.startTournament(
        parseInt(tournamentId)
      );
      
      return reply.status(200).send({
        success: true,
        message: 'Tournament started successfully on blockchain',
        data: {
          transactionHash
        }
      });
    } catch (error) {
      request.log.error('Blockchain tournament start failed', {
        action: 'startTournament',
        error: error instanceof Error ? error.message : error,
        tournamentId: (request.params as { tournamentId: string }).tournamentId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to start tournament on blockchain'
      });
    }
  }

  /**
   * Record a match result on the blockchain
   */
  async recordMatchResult(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = recordMatchResultSchema.parse(request.body);
      
      const transactionHash = await this.blockchainService.recordMatchResult(
        body.tournamentId,
        body.round,
        body.player1Id,
        body.player2Id,
        body.winnerId,
        body.player1Score,
        body.player2Score
      );
      
      return reply.status(200).send({
        success: true,
        message: 'Match result recorded successfully on blockchain',
        data: {
          transactionHash
        }
      });
    } catch (error) {
      request.log.error('Blockchain match result recording failed', {
        action: 'recordMatchResult',
        error: error instanceof Error ? error.message : error,
        input: request.body
      });
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid input',
          message: error.errors[0].message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to record match result on blockchain'
      });
    }
  }

  /**
   * Complete a tournament on the blockchain
   */
  async completeTournament(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = completeTournamentSchema.parse(request.body);
      
      const transactionHash = await this.blockchainService.completeTournament(
        body.tournamentId,
        body.winnerId,
        body.finalPositions
      );
      
      return reply.status(200).send({
        success: true,
        message: 'Tournament completed successfully on blockchain',
        data: {
          transactionHash
        }
      });
    } catch (error) {
      request.log.error('Blockchain tournament completion failed', {
        action: 'completeTournament',
        error: error instanceof Error ? error.message : error,
        input: request.body
      });
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid input',
          message: error.errors[0].message
        });
      }
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to complete tournament on blockchain'
      });
    }
  }

  /**
   * Get tournament details from blockchain
   */
  async getTournament(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tournamentId } = request.params as { tournamentId: string };
      
      const tournament = await this.blockchainService.getTournament(
        parseInt(tournamentId)
      );
      
      return reply.status(200).send({
        success: true,
        message: 'Tournament retrieved successfully from blockchain',
        data: {
          tournament
        }
      });
    } catch (error) {
      request.log.error('Blockchain tournament retrieval failed', {
        action: 'getTournament',
        error: error instanceof Error ? error.message : error,
        tournamentId: (request.params as { tournamentId: string }).tournamentId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to get tournament from blockchain'
      });
    }
  }

  /**
   * Get match details from blockchain
   */
  async getMatch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { matchId } = request.params as { matchId: string };
      
      const match = await this.blockchainService.getMatch(parseInt(matchId));
      
      return reply.status(200).send({
        success: true,
        message: 'Match retrieved successfully from blockchain',
        data: {
          match
        }
      });
    } catch (error) {
      request.log.error('Blockchain match retrieval failed', {
        action: 'getMatch',
        error: error instanceof Error ? error.message : error,
        params: request.params
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to get match from blockchain'
      });
    }
  }

  /**
   * Get user achievements from blockchain
   */
  async getUserAchievements(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      
      const achievements = await this.blockchainService.getUserAchievements(userId);
      
      return reply.status(200).send({
        success: true,
        message: 'User achievements retrieved successfully from blockchain',
        data: {
          achievements
        }
      });
    } catch (error) {
      request.log.error('Blockchain user achievements retrieval failed', {
        action: 'getUserAchievements', 
        error: error instanceof Error ? error.message : error,
        userId: (request.params as { userId: string }).userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to get user achievements from blockchain'
      });
    }
  }

  /**
   * Get user tournaments from the blockchain
   */
  async getUserTournaments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      
      const tournaments = await this.blockchainService.getUserTournaments(userId);
      
      return reply.status(200).send({
        success: true,
        data: tournaments
      });
    } catch (error) {
      request.log.error('Blockchain user tournaments retrieval failed', {
        action: 'getUserTournaments',
        error: error instanceof Error ? error.message : error,
        userId: (request.params as { userId: string }).userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error', 
        message: 'Failed to get user tournaments from blockchain'
      });
    }
  }

  /**
   * Verify match result on the blockchain
   */
  async verifyMatchResult(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { resultHash } = request.params as { resultHash: string };
      
      const isVerified = await this.blockchainService.verifyMatchResult(resultHash);
      
      return reply.status(200).send({
        success: true,
        data: { isVerified, resultHash }
      });
    } catch (error) {
      request.log.error('Blockchain match verification failed', {
        action: 'verifyMatchResult',
        error: error instanceof Error ? error.message : error,
        resultHash: (request.params as { resultHash: string }).resultHash
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to verify match result on blockchain'
      });
    }
  }

  /**
   * Get blockchain network information
   */
  async getNetworkInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const networkInfo = await this.blockchainService.getNetworkInfo();
      const contractAddress = this.blockchainService.getContractAddress();
      const isDeployed = await this.blockchainService.isContractDeployed();
      
      return reply.status(200).send({
        success: true,
        message: 'Network information retrieved successfully',
        data: {
          network: networkInfo,
          contractAddress,
          isDeployed
        }
      });
    } catch (error) {
      request.log.error('Blockchain network info retrieval failed', {
        action: 'getNetworkInfo',
        error: error instanceof Error ? error.message : error
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Network error',
        message: 'Failed to get network information'
      });
    }
  }

  /**
   * Get blockchain statistics
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournamentCount = await this.blockchainService.getTournamentCount();
      const networkInfo = await this.blockchainService.getNetworkInfo();
      
      return reply.status(200).send({
        success: true,
        data: {
          tournamentCount,
          network: networkInfo
        }
      });
    } catch (error) {
      request.log.error('Blockchain stats retrieval failed', {
        action: 'getStats', 
        error: error instanceof Error ? error.message : error
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Blockchain error',
        message: 'Failed to get blockchain statistics'
      });
    }
  }
}
