import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { submitMatchResultUseCase } from '../../use-cases/submit-match-result-use-case';

const submitMatchResultParamsSchema = z.object({
  id: z.string().min(1, 'Match ID is required'),
});

const submitMatchResultBodySchema = z.object({
  winnerId: z.string().min(1, 'Winner ID is required'),
  scorePlayer1: z.number().int().min(0),
  scorePlayer2: z.number().int().min(0),
  userId: z.string().min(1, 'User ID is required'), // TODO: Get from auth middleware - for authorization
});

export async function submitMatchResult(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = submitMatchResultParamsSchema.parse(request.params);
    const { winnerId, scorePlayer1, scorePlayer2, userId } = submitMatchResultBodySchema.parse(request.body);
    
    const result = await submitMatchResultUseCase({
      matchId: id,
      winnerId,
      player1Score: scorePlayer1,
      player2Score: scorePlayer2,
      submittedBy: userId,
    });
    
    return reply.status(200).send({
      success: true,
      data: result,
      message: 'Match result submitted successfully'
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
      if (error.message.includes('Match not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Match not found'
        });
      }
      
      if (error.message.includes('Unauthorized')) {
        return reply.status(403).send({
          success: false,
          error: 'Not authorized to submit result for this match'
        });
      }
      
      if (error.message.includes('Already completed')) {
        return reply.status(409).send({
          success: false,
          error: 'Match result already submitted'
        });
      }
      
      if (error.message.includes('Invalid winner')) {
        return reply.status(400).send({
          success: false,
          error: 'Winner must be one of the match participants'
        });
      }
    }
    
    request.log.error('Error submitting match result:', error);
    console.error('[Controller] Detailed error in submitMatchResult:', {
      error: error.message,
      stack: error.stack,
      matchId: request.params?.id,
      body: request.body
    });
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
