import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JoinTournamentInput {
  tournamentId: string;
  userId: string;
  displayName: string;
}

export async function joinTournamentUseCase(input: JoinTournamentInput) {
  const { tournamentId, userId, displayName } = input;

  // Check if tournament exists and get current state
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true
    }
  });

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  // Check if tournament is still accepting players
  if (tournament.status !== 'WAITING') {
    throw new Error('Tournament already started or completed');
  }

  // Check if tournament is full
  if (tournament.participants.length >= tournament.maxPlayers) {
    throw new Error('Tournament is full');
  }

  // Check if user already joined this tournament
  const existingParticipant = tournament.participants.find(p => p.userId === userId);
  if (existingParticipant) {
    throw new Error('Already joined this tournament');
  }

  // Add participant to tournament
  const participant = await prisma.tournamentParticipant.create({
    data: {
      tournamentId,
      userId,
      displayName,
      participantType: 'HUMAN',
      status: 'ACTIVE'
    }
  });

  // Update tournament participant count
  const updatedTournament = await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      currentPlayers: tournament.participants.length + 1
    },
    include: {
      participants: true
    }
  });

  // Check if we should auto-start the tournament
  if (updatedTournament.autoStart && updatedTournament.currentPlayers >= 4) {
    // Auto-start tournament if it has enough players
    await autoStartTournament(tournamentId);
  }

  // Initialize or update user stats
  await initializeUserStats(userId, displayName);

  return {
    participant,
    tournament: updatedTournament
  };
}

async function autoStartTournament(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true
    }
  });

  if (!tournament || tournament.status !== 'WAITING') {
    return;
  }

  // Generate bracket and matches
  const matches = generateSingleEliminationBracket(tournament.participants);
  
  // Create matches in database
  for (const match of matches) {
    await prisma.match.create({
      data: {
        tournamentId,
        round: match.round,
        matchNumber: match.matchNumber,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        status: 'WAITING'
      }
    });
  }

  // Update tournament status
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'ACTIVE',
      startedAt: new Date()
    }
  });
}

function generateSingleEliminationBracket(participants: any[]) {
  const matches = [];
  let currentRound = 1;
  let currentParticipants = [...participants];

  while (currentParticipants.length > 1) {
    const roundMatches = [];
    
    for (let i = 0; i < currentParticipants.length; i += 2) {
      if (i + 1 < currentParticipants.length) {
        roundMatches.push({
          round: currentRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: currentParticipants[i].id,
          player2Id: currentParticipants[i + 1].id
        });
      }
    }

    matches.push(...roundMatches);
    
    // Calculate next round participants (winners advance)
    currentParticipants = new Array(Math.ceil(currentParticipants.length / 2));
    currentRound++;
  }

  return matches;
}

async function initializeUserStats(userId: string, displayName: string) {
  const existingStats = await prisma.userStats.findUnique({
    where: { userId }
  });

  if (!existingStats) {
    await prisma.userStats.create({
      data: {
        userId,
        displayName,
        totalTournaments: 1
      }
    });
  } else {
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalTournaments: existingStats.totalTournaments + 1,
        displayName // Update display name in case it changed
      }
    });
  }
}
