import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { joinTournamentUseCase } from '../../use-cases/join-tournament-use-case';

const joinTournamentParamsSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
});

const joinTournamentBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'), // TODO: Get from auth middleware
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
});

export async function joinTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = joinTournamentParamsSchema.parse(request.params);
    const { userId, displayName } = joinTournamentBodySchema.parse(request.body);
    
    const result = await joinTournamentUseCase({
      tournamentId: id,
      userId,
      displayName,
    });
    
    return reply.status(200).send({
      success: true,
      data: result,
      message: 'Successfully joined tournament'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes('Tournament not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Tournament not found'
        });
      }
      
      if (error.message.includes('Tournament is full')) {
        return reply.status(409).send({
          success: false,
          error: 'Tournament is full'
        });
      }
      
      if (error.message.includes('Already joined')) {
        return reply.status(409).send({
          success: false,
          error: 'Already joined this tournament'
        });
      }
      
      if (error.message.includes('Tournament already started')) {
        return reply.status(409).send({
          success: false,
          error: 'Tournament has already started'
        });
      }
    }
    
    request.log.error('Error joining tournament:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
