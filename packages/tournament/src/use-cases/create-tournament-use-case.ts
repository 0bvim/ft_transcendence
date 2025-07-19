import { PrismaClient } from '@prisma/client';
import { TournamentType, AIDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTournamentInput {
  name: string;
  description?: string;
  maxPlayers: number;
  tournamentType: 'HUMANS_ONLY' | 'MIXED';
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  autoStart: boolean;
  userId: string;
}

export async function createTournamentUseCase(input: CreateTournamentInput) {
  const {
    name,
    description,
    maxPlayers,
    tournamentType,
    aiDifficulty = 'MEDIUM',
    autoStart,
    userId
  } = input;

  // Validate input
  if (maxPlayers < 4 || maxPlayers > 8) {
    throw new Error('Tournament must have between 4 and 8 players');
  }

  if (tournamentType === 'MIXED' && !aiDifficulty) {
    throw new Error('AI difficulty must be specified for mixed tournaments');
  }

  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      name,
      description,
      maxPlayers,
      tournamentType: tournamentType as TournamentType,
      aiDifficulty: aiDifficulty as AIDifficulty,
      autoStart,
      createdBy: userId,
      status: 'WAITING'
    },
    include: {
      participants: true,
      matches: true
    }
  });

  // If it's a mixed tournament, add AI participants to fill slots
  if (tournamentType === 'MIXED') {
    await addAIParticipants(tournament.id, maxPlayers, aiDifficulty);
  }

  return tournament;
}

async function addAIParticipants(tournamentId: string, maxPlayers: number, difficulty: string) {
  const aiCount = Math.floor(maxPlayers / 2); // Fill half the slots with AI initially
  
  for (let i = 1; i <= aiCount; i++) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId: null, // AI participants don't have user IDs
        displayName: `AI_${difficulty}_${i}`,
        participantType: 'AI',
        status: 'ACTIVE'
      }
    });
  }

  // Update tournament participant count
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { currentPlayers: aiCount }
  });
}
