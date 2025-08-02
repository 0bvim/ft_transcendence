import { PrismaClient } from '@prisma/client';
import { TournamentType, AIDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTournamentInput {
  name: string;
  description?: string;
  maxPlayers: number;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD'; // Always required since we only support MIXED
  autoStart: boolean;
  userId: string;
  displayName: string; // Added missing displayName parameter
}

export async function createTournamentUseCase(input: CreateTournamentInput, logger?: any) {
  const {
    name,
    description,
    maxPlayers,
    aiDifficulty,
    autoStart,
    userId,
    displayName
  } = input;

  // Validate input
  if (maxPlayers < 4 || maxPlayers > 8) {
    throw new Error('Tournament must have between 4 and 8 players');
  }

  logger?.info({
    action: 'tournament_creation_started',
    userId,
    tournamentName: name,
    maxPlayers,
    aiDifficulty,
    autoStart
  }, `Tournament creation started: ${name} by user ${userId}`);

  // Create tournament in database (always MIXED type)
  const tournament = await prisma.tournament.create({
    data: {
      name,
      description,
      maxPlayers,
      tournamentType: 'MIXED', // Always MIXED
      aiDifficulty: aiDifficulty as AIDifficulty,
      autoStart,
      createdBy: userId,
      status: 'WAITING',
      currentPlayers: maxPlayers // Always full since we auto-fill with AI
    },
    include: {
      participants: true,
      matches: true
    }
  });

  logger?.info({
    action: 'tournament_created',
    tournamentId: tournament.id,
    userId,
    tournamentName: name,
    maxPlayers
  }, `Tournament created successfully: ${tournament.id}`);

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

  // Always add AI participants to fill remaining slots
  await addAIParticipants(tournament.id, maxPlayers, aiDifficulty, 1, logger); // Pass 1 since creator is already added

  // Fetch the updated tournament with all participants
  const updatedTournament = await prisma.tournament.findUnique({
    where: { id: tournament.id },
    include: {
      participants: true,
      matches: true
    }
  });

  logger?.info({
    action: 'tournament_setup_completed',
    tournamentId: tournament.id,
    totalParticipants: updatedTournament?.participants.length,
    humanParticipants: updatedTournament?.participants.filter(p => p.participantType === 'HUMAN').length,
    aiParticipants: updatedTournament?.participants.filter(p => p.participantType === 'AI').length
  }, `Tournament setup completed: ${tournament.id} with ${updatedTournament?.participants.length} participants`);

  return updatedTournament;
}

async function addAIParticipants(tournamentId: string, maxPlayers: number, difficulty: string, existingHumanCount = 0, logger?: any) {
  // Calculate how many AI participants to add - fill ALL remaining slots
  const remainingSlots = maxPlayers - existingHumanCount;
  
  logger?.debug({
    action: 'adding_ai_participants',
    tournamentId,
    remainingSlots,
    difficulty
  }, `Adding ${remainingSlots} AI participants to tournament ${tournamentId}`);
  
  for (let i = 1; i <= remainingSlots; i++) {
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

  // Update tournament participant count (existing humans + AI to fill all slots)
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { currentPlayers: maxPlayers } // Always fill to max capacity
  });
}
