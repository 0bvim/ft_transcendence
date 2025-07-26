import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getTournamentsUseCase } from '../../use-cases/get-tournaments-use-case';

const getTournamentsQuerySchema = z.object({
  status: z.enum(['WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  userId: z.string().optional(), // Filter by user's tournaments
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export async function getTournaments(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = getTournamentsQuerySchema.parse(request.query);
    
    const result = await getTournamentsUseCase(query);
    
    return reply.status(200).send({
      success: true,
      data: result.tournaments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        pages: Math.ceil(result.total / query.limit)
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    request.log.error('Error getting tournaments:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
