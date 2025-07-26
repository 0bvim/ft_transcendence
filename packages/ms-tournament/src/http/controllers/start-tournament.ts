import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { startTournamentUseCase } from '../../use-cases/start-tournament-use-case';

const startTournamentParamsSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
});

const startTournamentBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'), // TODO: Get from auth middleware
});

export async function startTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = startTournamentParamsSchema.parse(request.params);
    const { userId } = startTournamentBodySchema.parse(request.body);
    
    const result = await startTournamentUseCase({
      tournamentId: id,
      userId,
    });
    
    return reply.status(200).send({
      success: true,
      data: result,
      message: 'Tournament started successfully'
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
      
      if (error.message.includes('Unauthorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Only tournament creator can start the tournament'
        });
      }
      
      if (error.message.includes('Already started')) {
        return reply.status(409).send({
          success: false,
          error: 'Tournament has already started'
        });
      }
      
      if (error.message.includes('Not enough players')) {
        return reply.status(409).send({
          success: false,
          error: 'Not enough players to start tournament (minimum 4 required)'
        });
      }
    }
    
    request.log.error('Error starting tournament:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
