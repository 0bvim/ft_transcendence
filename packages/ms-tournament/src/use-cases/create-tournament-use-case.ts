import { PrismaClient } from '@prisma/client';
import { TournamentType, AIDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTournamentInput {
  name: string;
  description?: string;
  maxPlayers: number;
  userId: string;
  displayName: string; // Added missing displayName parameter
}

export async function createTournamentUseCase(input: CreateTournamentInput, logger?: any) {
  const {
    name,
    description,
    maxPlayers,
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
  }, `Tournament creation started: ${name} by user ${userId}`);

  // Create tournament in database
  const tournament = await prisma.tournament.create({
    data: {
      name,
      description,
      maxPlayers,
      createdBy: userId,
      status: 'WAITING',
      currentPlayers: 1 // Start with the creator
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
  await addAIParticipants(tournament.id, maxPlayers, 1, logger); // Pass 1 since creator is already added

  // If autoStart is enabled, generate matches and start the tournament immediately

  // Fetch the updated tournament with all participants and matches
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

async function addAIParticipants(tournamentId: string, maxPlayers: number, existingHumanCount = 0, logger?: any) {
  // Calculate how many AI participants to add - fill ALL remaining slots
  const remainingSlots = maxPlayers - existingHumanCount;
  
  logger?.debug({
    action: 'adding_ai_participants',
    tournamentId,
    remainingSlots,
  }, `Adding ${remainingSlots} AI participants to tournament ${tournamentId}`);
  
  for (let i = 1; i <= remainingSlots; i++) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId: null, // AI participants don't have user IDs
        displayName: `AI Player ${i}`,
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

// Tournament bracket generation logic (copied from start-tournament-use-case.ts)
async function generateTournamentBracket(tournamentId: string, logger?: any) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  // Shuffle participants for fair bracket
  const participants = [...tournament.participants];
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  logger?.info({
    action: 'bracket_generation_started',
    tournamentId,
    participantCount: participants.length
  }, `Generating bracket for tournament ${tournamentId} with ${participants.length} participants`);

  // Generate first round matches
  const matches = [];
  const firstRound = 1;
  let matchNumber = 1;

  for (let i = 0; i < participants.length; i += 2) {
    const player1 = participants[i];
    const player2 = participants[i + 1];

    // Create match data
    const matchData = {
      tournamentId,
      round: firstRound,
      matchNumber: matchNumber++,
      player1Id: player1.id,
      player2Id: player2.id,
      status: 'WAITING' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    matches.push(matchData);

    logger?.info({
      action: 'match_created',
      tournamentId,
      matchNumber: matchData.matchNumber,
      player1: player1.displayName,
      player2: player2.displayName
    }, `Created match ${matchData.matchNumber}: ${player1.displayName} vs ${player2.displayName}`);
  }

  // Set the first match to IN_PROGRESS if it involves at least one human
  if (matches.length > 0) {
    const firstMatch = matches[0];
    const player1 = participants.find(p => p.id === firstMatch.player1Id);
    const player2 = participants.find(p => p.id === firstMatch.player2Id);
    
    if (player1?.participantType === 'HUMAN' || player2?.participantType === 'HUMAN') {
      firstMatch.status = 'IN_PROGRESS';
      logger?.info({
        action: 'first_match_started',
        tournamentId,
        matchNumber: firstMatch.matchNumber
      }, `Setting first match ${firstMatch.matchNumber} to IN_PROGRESS`);
    }
  }

  // Create matches in the database
  await prisma.match.createMany({
    data: matches,
  });

  logger?.info({
    action: 'bracket_generation_completed',
    tournamentId,
    matchesCreated: matches.length
  }, `First round matches created successfully for tournament ${tournamentId}`);
}
