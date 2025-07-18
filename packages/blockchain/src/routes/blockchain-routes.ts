import { FastifyInstance } from 'fastify';
import { BlockchainController } from '../controllers/blockchain-controller';
import { BlockchainService } from '../services/blockchain-service';

export async function blockchainRoutes(
  fastify: FastifyInstance,
  blockchainService: BlockchainService
) {
  const controller = new BlockchainController(blockchainService);

  // Tournament blockchain operations
  fastify.post('/tournaments', {
    schema: {
      description: 'Create a new tournament on the blockchain',
      tags: ['blockchain', 'tournaments'],
      body: {
        type: 'object',
        required: ['name', 'description', 'maxParticipants'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', minLength: 1, maxLength: 500 },
          maxParticipants: { type: 'number', minimum: 4, maximum: 8 }
        }
      }
    }
  }, controller.createTournament.bind(controller));

  fastify.post('/tournaments/:tournamentId/participants', {
    schema: {
      description: 'Add a participant to a tournament on the blockchain',
      tags: ['blockchain', 'tournaments'],
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
          tournamentId: { type: 'string', pattern: '^[0-9]+$' }
        }
      },
      body: {
        type: 'object',
        required: ['userId', 'displayName', 'participantType'],
        properties: {
          userId: { type: 'string', minLength: 1 },
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
          participantType: { type: 'string', enum: ['HUMAN', 'AI'] }
        }
      }
    }
  }, controller.addParticipant.bind(controller));

  fastify.post('/tournaments/:tournamentId/start', {
    schema: {
      description: 'Start a tournament on the blockchain',
      tags: ['blockchain', 'tournaments'],
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
          tournamentId: { type: 'string', pattern: '^[0-9]+$' }
        }
      }
    }
  }, controller.startTournament.bind(controller));

  fastify.post('/tournaments/matches', {
    schema: {
      description: 'Record a match result on the blockchain',
      tags: ['blockchain', 'matches'],
      body: {
        type: 'object',
        required: ['tournamentId', 'round', 'player1Id', 'player2Id', 'winnerId', 'player1Score', 'player2Score'],
        properties: {
          tournamentId: { type: 'number', minimum: 1 },
          round: { type: 'number', minimum: 1 },
          player1Id: { type: 'string', minLength: 1 },
          player2Id: { type: 'string', minLength: 1 },
          winnerId: { type: 'string', minLength: 1 },
          player1Score: { type: 'number', minimum: 0 },
          player2Score: { type: 'number', minimum: 0 }
        }
      }
    }
  }, controller.recordMatchResult.bind(controller));

  fastify.post('/tournaments/complete', {
    schema: {
      description: 'Complete a tournament on the blockchain',
      tags: ['blockchain', 'tournaments'],
      body: {
        type: 'object',
        required: ['tournamentId', 'winnerId', 'finalPositions'],
        properties: {
          tournamentId: { type: 'number', minimum: 1 },
          winnerId: { type: 'string', minLength: 1 },
          finalPositions: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 4,
            maxItems: 8
          }
        }
      }
    }
  }, controller.completeTournament.bind(controller));

  // Tournament data retrieval
  fastify.get('/tournaments/:tournamentId', {
    schema: {
      description: 'Get tournament details from the blockchain',
      tags: ['blockchain', 'tournaments'],
      params: {
        type: 'object',
        required: ['tournamentId'],
        properties: {
          tournamentId: { type: 'string', pattern: '^[0-9]+$' }
        }
      }
    }
  }, controller.getTournament.bind(controller));

  fastify.get('/matches/:matchId', {
    schema: {
      description: 'Get match details from the blockchain',
      tags: ['blockchain', 'matches'],
      params: {
        type: 'object',
        required: ['matchId'],
        properties: {
          matchId: { type: 'string', pattern: '^[0-9]+$' }
        }
      }
    }
  }, controller.getMatch.bind(controller));

  // User data retrieval
  fastify.get('/users/:userId/achievements', {
    schema: {
      description: 'Get user achievements from the blockchain',
      tags: ['blockchain', 'users'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', minLength: 1 }
        }
      }
    }
  }, controller.getUserAchievements.bind(controller));

  fastify.get('/users/:userId/tournaments', {
    schema: {
      description: 'Get user tournament history from the blockchain',
      tags: ['blockchain', 'users'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', minLength: 1 }
        }
      }
    }
  }, controller.getUserTournaments.bind(controller));

  // Verification endpoints
  fastify.get('/verify/:resultHash', {
    schema: {
      description: 'Verify a match result on the blockchain',
      tags: ['blockchain', 'verification'],
      params: {
        type: 'object',
        required: ['resultHash'],
        properties: {
          resultHash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }
        }
      }
    }
  }, controller.verifyMatchResult.bind(controller));

  // Network and status endpoints
  fastify.get('/network', {
    schema: {
      description: 'Get blockchain network information',
      tags: ['blockchain', 'network']
    }
  }, controller.getNetworkInfo.bind(controller));

  fastify.get('/stats', {
    schema: {
      description: 'Get blockchain statistics',
      tags: ['blockchain', 'stats']
    }
  }, controller.getStats.bind(controller));

  // Health check endpoint
  fastify.get('/health', {
    schema: {
      description: 'Check blockchain service health',
      tags: ['health']
    }
  }, async (request, reply) => {
    try {
      const isDeployed = await blockchainService.isContractDeployed();
      const networkInfo = await blockchainService.getNetworkInfo();
      
      return reply.status(200).send({
        success: true,
        message: 'Blockchain service is healthy',
        data: {
          contractDeployed: isDeployed,
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
}
