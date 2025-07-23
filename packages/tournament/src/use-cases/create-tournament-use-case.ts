import { PrismaClient } from '@prisma/client';
import { TournamentType, AIDifficulty } from '@prisma/client';
import { blockchainClient } from '../services/blockchain-client';

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

  // Create tournament in database
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

  // Create tournament on blockchain (non-blocking)
  try {
    const blockchainResult = await blockchainClient.createTournament({
      name,
      description: description || '',
      maxParticipants: maxPlayers
    });

    if (blockchainResult) {
      // Store blockchain tournament ID for future reference
      // Note: We could add a blockchainTournamentId field to the Tournament model
      // For now, we'll log it
      console.log(`Tournament ${tournament.id} created on blockchain with ID: ${blockchainResult.tournamentId}`);
    }
  } catch (error) {
    // Blockchain creation failed, but tournament creation in DB succeeded
    console.warn(`Failed to create tournament ${tournament.id} on blockchain:`, error);
  }

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
