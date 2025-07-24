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
  displayName: string; // Added missing displayName parameter
}

export async function createTournamentUseCase(input: CreateTournamentInput) {
  const {
    name,
    description,
    maxPlayers,
    tournamentType,
    aiDifficulty = 'MEDIUM',
    autoStart,
    userId,
    displayName
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
      status: 'WAITING',
      currentPlayers: 1 // Start with 1 since creator will be added as participant
    },
    include: {
      participants: true,
      matches: true
    }
  });

  // Add the tournament creator as the first participant
  await prisma.tournamentParticipant.create({
    data: {
      tournamentId: tournament.id,
      userId,
      displayName,
      participantType: 'HUMAN',
      status: 'ACTIVE'
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
    await addAIParticipants(tournament.id, maxPlayers, aiDifficulty, 1); // Pass 1 since creator is already added
  }

  // Fetch the updated tournament with all participants
  const updatedTournament = await prisma.tournament.findUnique({
    where: { id: tournament.id },
    include: {
      participants: true,
      matches: true
    }
  });

  return updatedTournament;
}

async function addAIParticipants(tournamentId: string, maxPlayers: number, difficulty: string, existingHumanCount = 0) {
  // Calculate how many AI participants to add
  // For mixed tournaments, we want to fill about half the slots with AI initially
  const aiCount = Math.floor(maxPlayers / 2); 
  
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

  // Update tournament participant count (existing humans + AI)
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { currentPlayers: existingHumanCount + aiCount }
  });
}
