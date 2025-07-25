import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createTournamentUseCase } from '../../use-cases/create-tournament-use-case';

const createTournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required').max(100, 'Tournament name too long'),
  description: z.string().optional(),
  maxPlayers: z.number().int().min(4).max(8),
  aiDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']), // Always required since we only support MIXED
  autoStart: z.boolean().default(true),
  userId: z.string().min(1, 'User ID is required'), // TODO: Get from auth middleware
  displayName: z.string().min(1, 'Display name is required'), // For creating participants
});

export async function createTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = createTournamentSchema.parse(request.body);
    const tournament = await createTournamentUseCase(data, request.log);
    
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
    
    request.log.error({
      action: 'tournament_creation_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'Error creating tournament');
    
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
