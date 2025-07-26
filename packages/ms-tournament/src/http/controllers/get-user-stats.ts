import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getUserStatsUseCase } from '../../use-cases/get-user-stats-use-case';

const getUserStatsParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export async function getUserStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = getUserStatsParamsSchema.parse(request.params);
    
    const stats = await getUserStatsUseCase(id);
    
    if (!stats) {
      return reply.status(404).send({
        success: false,
        error: 'User stats not found'
      });
    }
    
    return reply.status(200).send({
      success: true,
      data: stats
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    request.log.error('Error getting user stats:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
