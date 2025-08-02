import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubmitMatchResultInput {
  matchId: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
  submittedBy: string;
}

export async function submitMatchResultUseCase(input: SubmitMatchResultInput) {
  const { matchId, winnerId, player1Score, player2Score, submittedBy } = input;
  console.log(`[UC] Starting submitMatchResult for matchId: ${matchId}`);

  // Get match with tournament and participants
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: {
        include: {
          participants: true
        }
      },
      participants: true
    }
  });

  if (!match) {
    console.error(`[UC] Match not found: ${matchId}`);
    throw new Error('Match not found');
  }
  console.log('[UC] Match found:', { id: match.id, status: match.status, round: match.round });

  // Check if match is already completed
  if (match.status === 'COMPLETED') {
    throw new Error('Match result already submitted');
  }

  // Check if match is in progress
  if (match.status !== 'IN_PROGRESS') {
    throw new Error('Match is not in progress');
  }

  // Validate winner is one of the participants
  if (match.player1Id !== winnerId && match.player2Id !== winnerId) {
    throw new Error('Invalid winner: Winner must be one of the match participants');
  }

  // Authorization check - participants, tournament creator, or local-versus matches can submit results
  const isParticipant = match.tournament.participants.some(p => 
    p.userId === submittedBy && p.status === 'ACTIVE'
  );
  const isTournamentCreator = match.tournament.createdBy === submittedBy;
  const isLocalVersus = match.localVersus;
  
  if (!isParticipant && !isTournamentCreator && !isLocalVersus) {
    console.warn(`[UC] Unauthorized submission by userId: ${submittedBy} for matchId: ${matchId}`);
    throw new Error('Unauthorized: Only tournament participants or creator can submit match results');
  }
  console.log(`[UC] Authorization successful for userId: ${submittedBy}`);

  // Update match result in database
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'COMPLETED',
      winnerId,
      player1Score,
      player2Score,
      completedAt: new Date()
    }
  });
  console.log(`[UC] Match ${matchId} status updated to COMPLETED.`);

  // Update user stats
  await updateUserStats(match.player1Id!, match.player2Id!, winnerId);

  // Eliminate the loser
  const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
  // Add a safeguard: only eliminate if a loser is clearly identified.
  if (loserId) {
    await eliminateParticipant(loserId);
    console.log(`[UC] Participant ${loserId} eliminated.`);
  } else {
    console.warn(`[UC] No loser to eliminate for match ${matchId}. This might be a bye match.`);
  }

  // Progress tournament to next round
  await progressTournament(match.tournament.id, match.round);

  return updatedMatch;
}

async function updateUserStats(player1Id: string, player2Id: string, winnerId: string) {
  // Get participant details to check if they're human players
  const [player1, player2] = await Promise.all([
    prisma.tournamentParticipant.findUnique({ where: { id: player1Id } }),
    prisma.tournamentParticipant.findUnique({ where: { id: player2Id } })
  ]);

  // Only update stats for human players
  if (player1?.participantType === 'HUMAN' && player1.userId) {
    if (winnerId === player1Id) {
      await updatePlayerStats(player1.userId, 'win');
    } else {
      await updatePlayerStats(player1.userId, 'loss');
    }
  }

  if (player2?.participantType === 'HUMAN' && player2.userId) {
    if (winnerId === player2Id) {
      await updatePlayerStats(player2.userId, 'win');
    } else {
      await updatePlayerStats(player2.userId, 'loss');
    }
  }
}

async function updatePlayerStats(userId: string, result: 'win' | 'loss') {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  
  if (!stats) {
    // This shouldn't happen if join tournament properly initialized stats
    return;
  }

  await prisma.userStats.update({
    where: { userId },
    data: {
      wins: result === 'win' ? stats.wins + 1 : stats.wins,
      losses: result === 'loss' ? stats.losses + 1 : stats.losses
    }
  });
}

async function eliminateParticipant(participantId: string) {
  await prisma.tournamentParticipant.update({
    where: { id: participantId },
    data: {
      status: 'ELIMINATED',
      eliminated: true,
      eliminatedAt: new Date()
    }
  });
}

async function progressTournament(tournamentId: string, currentRound: number) {
  console.log(`[Progress] Checking progress for tournament ${tournamentId}, round ${currentRound}`);
  // Check if all matches in current round are completed
  const roundMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: currentRound
    }
  });

  const completedMatches = roundMatches.filter(m => m.status === 'COMPLETED');
  console.log(`[Progress] Round ${currentRound} status: ${completedMatches.length}/${roundMatches.length} matches completed.`);
  
  if (completedMatches.length === roundMatches.length) {
    // All matches in current round are completed, create next round
    console.log(`[Progress] Round ${currentRound} complete. Creating next round.`);
    await createNextRound(tournamentId, currentRound);
  } else {
    // Start next match in current round if available
    const nextMatch = roundMatches.find(m => m.status === 'WAITING');
    if (nextMatch) {
      console.log(`[Progress] Starting next match in round ${currentRound}: ${nextMatch.id}`);
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });
    }
  }
}

async function createNextRound(tournamentId: string, completedRound: number) {
  console.log(`[CreateRound] Creating round ${completedRound + 1} for tournament ${tournamentId}`);
  // Get winners from the *current* completed round only
  const currentRoundMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: completedRound,
      status: 'COMPLETED'
    }
  });

  const winners = currentRoundMatches.map(m => m.winnerId).filter(Boolean) as string[];
  console.log(`[CreateRound] Winners from round ${completedRound}:`, winners);
  
  if (winners.length === 1) {
    // Tournament is complete!
    console.log(`[CreateRound] Tournament ${tournamentId} complete. Winner is ${winners[0]}`);
    // The final match was just played in the 'completedRound'
    const finalMatch = currentRoundMatches[0];
    await completeTournament(tournamentId, finalMatch);
    return;
  }

  if (winners.length > 1) {
    // Create next round matches
    const nextRound = completedRound + 1;
    const nextRoundMatches = [];

    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        nextRoundMatches.push({
          tournamentId,
          round: nextRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: winners[i],
          player2Id: winners[i + 1],
          status: 'WAITING'
        });
      } else {
        // Odd number of winners, this one gets a bye
        console.log(`[CreateRound] Participant ${winners[i]} gets a bye to the next round.`);
        nextRoundMatches.push({
          tournamentId,
          round: nextRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: winners[i],
          player2Id: null,
          winnerId: winners[i],
          status: 'COMPLETED'
        });
      }
    }
    console.log(`[CreateRound] Creating ${nextRoundMatches.length} matches for round ${nextRound}.`);

    // Create matches in database
    for (const match of nextRoundMatches) {
      await prisma.match.create({
        data: match as any
      });
    }

    // Start first match of next round
    const firstMatch = nextRoundMatches.find(m => m.status === 'WAITING');
    if (firstMatch) {
      console.log(`[CreateRound] Starting first match of round ${nextRound}.`);
      await prisma.match.updateMany({
        where: {
          tournamentId,
          round: nextRound,
          matchNumber: firstMatch.matchNumber
        },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });
    }
  }
}

async function completeTournament(tournamentId: string, finalMatch: { player1Id?: string | null, player2Id?: string | null, winnerId?: string | null }) {
  const winnerId = finalMatch.winnerId!;
  console.log(`[Complete] Completing tournament ${tournamentId}. Winner: ${winnerId}`);

  // Update tournament status
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });

  // Set winner status
  await prisma.tournamentParticipant.update({
    where: { id: winnerId },
    data: {
      status: 'WINNER',
      finalPosition: 1
    }
  });

  // --- BEGIN: Set second place finisher --- 
  const loserId = finalMatch.player1Id === winnerId ? finalMatch.player2Id : finalMatch.player1Id;
  if (loserId) {
    await prisma.tournamentParticipant.update({
      where: { id: loserId },
      data: {
        status: 'ELIMINATED', // Mark as eliminated
        eliminated: true,
        eliminatedAt: new Date(),
        finalPosition: 2 // Set as 2nd place
      }
    });
    console.log(`[Complete] Set participant ${loserId} to 2nd place.`);

    // Update user stats for 2nd place
    const secondPlace = await prisma.tournamentParticipant.findUnique({ where: { id: loserId } });
    if (secondPlace?.participantType === 'HUMAN' && secondPlace.userId) {
      await prisma.userStats.update({
        where: { userId: secondPlace.userId },
        data: { tournamentsSecond: { increment: 1 } }
      });
    }
  }
  // --- END: Set second place finisher ---

  // Update winner's tournament stats
  const winner = await prisma.tournamentParticipant.findUnique({
    where: { id: winnerId }
  });

  if (winner?.participantType === 'HUMAN' && winner.userId) {
    await prisma.userStats.update({
      where: { userId: winner.userId },
      data: {
        tournamentsWon: { increment: 1 }
      }
    });
  }

  // Set final positions for other participants (3rd place and below)
  await setFinalPositions(tournamentId);
}

async function setFinalPositions(tournamentId: string) {
  console.log(`[Complete] Setting final positions for tournament ${tournamentId}`);
  // Get all participants who were eliminated *and* don't have a position yet
  const participants = await prisma.tournamentParticipant.findMany({
    where: {
      tournamentId,
      eliminated: true,
      finalPosition: null // Exclude winner (pos 1) and 2nd place
    },
    orderBy: {
      eliminatedAt: 'desc' // Latest eliminations get higher positions
    }
  });
  console.log(`[Complete] Found ${participants.length} eliminated participants to rank.`);

  // Assign positions starting from 3rd place
  let position = 3;
  for (const participant of participants) {
    await prisma.tournamentParticipant.update({
      where: { id: participant.id },
      data: { finalPosition: position }
    });

    // Update user stats for top 3 finishers
    if (participant.participantType === 'HUMAN' && participant.userId) {
      if (position === 2) { // This block is now redundant but safe
        await prisma.userStats.update({
          where: { userId: participant.userId },
          data: { tournamentsSecond: { increment: 1 } }
        });
      } else if (position === 3) {
        await prisma.userStats.update({
          where: { userId: participant.userId },
          data: { tournamentsThird: { increment: 1 } }
        });
      }
    }

    position++;
  }
}
