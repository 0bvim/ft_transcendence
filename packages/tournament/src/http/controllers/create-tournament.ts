import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createTournamentUseCase } from '../../use-cases/create-tournament-use-case';

const createTournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required').max(100, 'Tournament name too long'),
  description: z.string().optional(),
  maxPlayers: z.number().int().min(4).max(8),
  tournamentType: z.enum(['HUMANS_ONLY', 'MIXED']),
  aiDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  autoStart: z.boolean().default(true),
  userId: z.string().min(1, 'User ID is required'), // TODO: Get from auth middleware
});

export async function createTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = createTournamentSchema.parse(request.body);
    
    const tournament = await createTournamentUseCase(data);
    
    return reply.status(201).send({
      success: true,
      data: tournament,
      message: 'Tournament created successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    request.log.error('Error creating tournament:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
