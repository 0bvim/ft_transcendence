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
  // Allow tournament to start with a single participant. The host can begin at any time.
  if (tournament.participants.length < 1) {
    throw new Error('Not enough players to start tournament (minimum 1 required)');
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

  // Create first round matches
  const matches = [];
  const round = 1;
  let matchNumber = 1;

  // Handle byes for odd number of participants
  let participantsForRound = [...participants];
  if (participantsForRound.length % 2 !== 0) {
    const byeParticipant = participantsForRound.pop()!;
    matches.push({
      tournamentId: tournament.id,
      round,
      matchNumber: matchNumber++,
      player1Id: byeParticipant.id,
      player2Id: null, // Bye
      status: 'COMPLETED' as const,
      winnerId: byeParticipant.id, // Auto-win
      startedAt: new Date(),
      completedAt: new Date(),
    });
    console.log(`[StartUC] Participant ${byeParticipant.displayName} gets a bye in round 1.`);
  }

  for (let i = 0; i < participantsForRound.length; i += 2) {
    const player1 = participantsForRound[i];
    const player2 = participantsForRound[i + 1];

    // This check should not be necessary if logic is correct, but as a safeguard:
    if (!player1 || !player2) {
        console.error('[StartUC] Error creating match: player is undefined. Skipping match.', { player1, player2 });
        continue;
    }

    matches.push({
      tournamentId: tournament.id,
      round,
      matchNumber: matchNumber++,
      player1Id: player1.id,
      player2Id: player2.id,
      status: 'WAITING' as const,
    });
  }

  console.log(`[StartUC] Creating ${matches.length} matches for round 1.`);

  // Set the first match to IN_PROGRESS
  const firstMatch = matches.find(m => m.status === 'WAITING');
  if (firstMatch) {
    firstMatch.status = 'IN_PROGRESS' as const;
    (firstMatch as any).startedAt = new Date();
    console.log(`[StartUC] Setting first match ${firstMatch.matchNumber} to IN_PROGRESS.`);
  }

  // Create matches in the database
  await prisma.match.createMany({
    data: matches,
  });

  console.log('[StartUC] First round matches created successfully.');

  // Return the updated tournament object with matches
  const updatedTournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
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

async function startFirstRoundMatches(tournamentId: string) {
  // Get all first round matches with participant details
  const firstRoundMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: 1,
      status: 'WAITING'
    }
  });

  // Get all participants to check if they're AI or human
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    select: {
      id: true,
      participantType: true,
      displayName: true
    }
  });

  const participantMap = new Map(participants.map(p => [p.id, p]));

  // Process each match
  for (const match of firstRoundMatches) {
    const player1 = participantMap.get(match.player1Id!);
    const player2 = participantMap.get(match.player2Id!);

    // Check if both players are AI
    if (player1?.participantType === 'AI' && player2?.participantType === 'AI') {
      // AI vs AI match - automatically resolve with random winner
      const randomWinner = Math.random() < 0.5 ? match.player1Id : match.player2Id;
      const randomScore1 = Math.floor(Math.random() * 3) + 1; // Score between 1-3
      const randomScore2 = Math.floor(Math.random() * 3) + 1;
      
      // Ensure winner has higher score
      const finalScore1 = randomWinner === match.player1Id ? Math.max(randomScore1, randomScore2 + 1) : randomScore1;
      const finalScore2 = randomWinner === match.player2Id ? Math.max(randomScore2, randomScore1 + 1) : randomScore2;

      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'COMPLETED',
          winnerId: randomWinner,
          player1Score: finalScore1,
          player2Score: finalScore2,
          startedAt: new Date(),
          completedAt: new Date()
        }
      });


    } else {
      // Human vs AI or Human vs Human match - start normally for gameplay
      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });
    }
  }
}
