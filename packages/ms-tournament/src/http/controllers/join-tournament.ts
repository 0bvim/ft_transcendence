import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { joinTournamentUseCase } from '../../use-cases/join-tournament-use-case';

const joinTournamentParamsSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
});

const joinTournamentBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
});

export async function joinTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: tournamentId } = joinTournamentParamsSchema.parse(request.params);
    const { userId, displayName } = joinTournamentBodySchema.parse(request.body);
    
    const result = await joinTournamentUseCase({
      tournamentId,
      userId,
      displayName
    }, request.log);
    
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
    
    // Handle business logic errors with appropriate HTTP status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('already') || errorMessage.includes('full')) {
      statusCode = 409; // Conflict
    } else if (errorMessage.includes('started') || errorMessage.includes('completed')) {
      statusCode = 400; // Bad request
    }
    
    request.log.error({
      action: 'tournament_join_controller_error',
      error: errorMessage,
      statusCode
    }, 'Error in join tournament controller');
    
    return reply.status(statusCode).send({
      success: false,
      error: errorMessage
    });
  }
}
