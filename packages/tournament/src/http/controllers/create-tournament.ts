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
  displayName: z.string().min(1, 'Display name is required'), // For creating participants
});

export async function createTournament(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('=== CREATE TOURNAMENT DEBUG ===');
    console.log('Request body received:', JSON.stringify(request.body, null, 2));
    
    const data = createTournamentSchema.parse(request.body);
    console.log('Validation successful, parsed data:', JSON.stringify(data, null, 2));
    
    const tournament = await createTournamentUseCase(data);
    
    return reply.status(201).send({
      success: true,
      data: tournament,
      message: 'Tournament created successfully'
    });
    
  } catch (error) {
    console.log('=== CREATE TOURNAMENT ERROR ===');
    console.log('Error type:', error.constructor.name);
    console.log('Error details:', error);
    
    if (error instanceof z.ZodError) {
      console.log('Validation errors:', JSON.stringify(error.errors, null, 2));
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
