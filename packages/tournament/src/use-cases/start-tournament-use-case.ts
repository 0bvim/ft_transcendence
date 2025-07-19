import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StartTournamentInput {
  tournamentId: string;
  userId: string;
}

export async function startTournamentUseCase(input: StartTournamentInput) {
  const { tournamentId, userId } = input;

  // Check if tournament exists and get current state
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true,
      matches: true
    }
  });

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  // Check if user is authorized to start the tournament
  if (tournament.createdBy !== userId) {
    throw new Error('Unauthorized: Only tournament creator can start the tournament');
  }

  // Check if tournament is in correct state
  if (tournament.status !== 'WAITING') {
    throw new Error('Tournament has already started or completed');
  }

  // Check if tournament has enough players
  if (tournament.participants.length < 4) {
    throw new Error('Not enough players to start tournament (minimum 4 required)');
  }

  // If tournament type is MIXED and doesn't have enough AI participants, add them
  if (tournament.tournamentType === 'MIXED') {
    await ensureAIParticipants(tournament);
  }

  // Generate bracket and matches if not already generated
  if (tournament.matches.length === 0) {
    await generateTournamentBracket(tournamentId);
  }

  // Update tournament status
  const updatedTournament = await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'ACTIVE',
      startedAt: new Date()
    },
    include: {
      participants: true,
      matches: {
        include: {
          participants: true
        }
      }
    }
  });

  return updatedTournament;
}

async function ensureAIParticipants(tournament: any) {
  const humanParticipants = tournament.participants.filter((p: any) => p.participantType === 'HUMAN');
  const aiParticipants = tournament.participants.filter((p: any) => p.participantType === 'AI');
  
  // Calculate how many AI participants we need to reach the next power of 2
  const totalParticipants = humanParticipants.length + aiParticipants.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(totalParticipants)));
  const neededAI = Math.max(0, Math.min(nextPowerOf2 - humanParticipants.length, tournament.maxPlayers - humanParticipants.length));
  
  // Add AI participants if needed
  const aiToAdd = neededAI - aiParticipants.length;
  for (let i = 0; i < aiToAdd; i++) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: null,
        displayName: `AI_${tournament.aiDifficulty}_${aiParticipants.length + i + 1}`,
        participantType: 'AI',
        status: 'ACTIVE'
      }
    });
  }

  // Update tournament participant count
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: {
      currentPlayers: humanParticipants.length + neededAI
    }
  });
}

async function generateTournamentBracket(tournamentId: string) {
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

  // Generate single-elimination bracket
  const matches = generateSingleEliminationBracket(participants);
  
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

  // Start first round matches
  await startFirstRoundMatches(tournamentId);
}

function generateSingleEliminationBracket(participants: any[]) {
  const matches = [];
  let currentRound = 1;
  let currentParticipants = [...participants];

  // Generate matches for each round until we have a winner
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
      } else {
        // Odd number of participants, this one gets a bye
        roundMatches.push({
          round: currentRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: currentParticipants[i].id,
          player2Id: null, // Bye
          winnerId: currentParticipants[i].id // Automatic win
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

async function startFirstRoundMatches(tournamentId: string) {
  // Get first round matches
  const firstRoundMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: 1,
      status: 'WAITING'
    }
  });

  // Start the first match
  if (firstRoundMatches.length > 0) {
    await prisma.match.update({
      where: { id: firstRoundMatches[0].id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });
  }
}
