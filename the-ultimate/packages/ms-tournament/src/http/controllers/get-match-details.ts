import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getMatchDetailsParamsSchema = z.object({
  id: z.string().min(1, 'Match ID is required'),
});

export async function getMatchDetails(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = getMatchDetailsParamsSchema.parse(request.params);
    
    // Get match with tournament and participant details
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!match) {
      return reply.status(404).send({
        success: false,
        error: 'Match not found'
      });
    }

    // Get participant details
    const player1 = match.player1Id ? await prisma.tournamentParticipant.findUnique({
      where: { id: match.player1Id },
      select: {
        id: true,
        userId: true,
        displayName: true,
        participantType: true
      }
    }) : null;

    const player2 = match.player2Id ? await prisma.tournamentParticipant.findUnique({
      where: { id: match.player2Id },
      select: {
        id: true,
        userId: true,
        displayName: true,
        participantType: true
      }
    }) : null;

    // Format response for game service
    const matchData = {
      localVersus: match.localVersus,
      controls: match.localVersus ? {
        p1: match.player1Keys || 'W,S',
        p2: match.player2Keys || 'ARROW_UP,ARROW_DOWN'
      } : undefined,
      matchId: match.id,
      tournamentId: match.tournamentId,
      status: match.status,
      player1: player1 ? {
        id: player1.id,
        displayName: player1.displayName,
        isAI: player1.participantType === 'AI',
        userId: player1.userId
      } : null,
      player2: player2 ? {
        id: player2.id,
        displayName: player2.displayName,
        isAI: player2.participantType === 'AI',
        userId: player2.userId
      } : null
    };
    
    return reply.status(200).send({
      success: true,
      data: matchData
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    request.log.error('Error getting match details:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
} 