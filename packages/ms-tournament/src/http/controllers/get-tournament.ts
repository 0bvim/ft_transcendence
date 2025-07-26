import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getTournamentUseCase } from '../../use-cases/get-tournament-use-case';

const getTournamentParamsSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
});

export async function getTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = getTournamentParamsSchema.parse(request.params);
    
    const tournament = await getTournamentUseCase(id);
    
    if (!tournament) {
      return reply.status(404).send({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    return reply.status(200).send({
      success: true,
      data: tournament
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    request.log.error('Error getting tournament:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
