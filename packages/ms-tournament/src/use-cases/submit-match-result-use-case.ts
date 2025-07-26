import { PrismaClient } from '@prisma/client';
import { blockchainClient } from '../services/blockchain-client';

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
    throw new Error('Match not found');
  }

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

  // Authorization check - only participants or tournament creator can submit results
  const isParticipant = match.tournament.participants.some(p => 
    p.userId === submittedBy && (p.id === match.player1Id || p.id === match.player2Id)
  );
  const isCreator = match.tournament.createdBy === submittedBy;
  
  if (!isParticipant && !isCreator) {
    throw new Error('Unauthorized: Only match participants or tournament creator can submit results');
  }

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

  // Record match result on blockchain (non-blocking)
  try {
    const blockchainResult = await blockchainClient.recordMatchResult({
      tournamentId: 1, // TODO: Get actual blockchain tournament ID from database
      round: match.round,
      player1Id: match.player1Id || '',
      player2Id: match.player2Id || '',
      winnerId,
      player1Score,
      player2Score
    });

    if (blockchainResult) {
      // Blockchain result recorded successfully
    }
  } catch (error) {
    // Blockchain recording failed, continue silently
  }

  // Update user stats
  await updateUserStats(match.player1Id!, match.player2Id!, winnerId);

  // Eliminate the loser
  const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
  await eliminateParticipant(loserId!);

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
  // Check if all matches in current round are completed
  const roundMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: currentRound
    }
  });

  const completedMatches = roundMatches.filter(m => m.status === 'COMPLETED');
  
  if (completedMatches.length === roundMatches.length) {
    // All matches in current round are completed, create next round
    await createNextRound(tournamentId, currentRound);
  } else {
    // Start next match in current round if available
    const nextMatch = roundMatches.find(m => m.status === 'WAITING');
    if (nextMatch) {
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
  // Get winners from completed round
  const completedMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      round: completedRound,
      status: 'COMPLETED'
    }
  });

  const winners = completedMatches.map(m => m.winnerId).filter(Boolean);
  
  if (winners.length === 1) {
    // Tournament is complete!
    await completeTournament(tournamentId, winners[0]!);
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

    // Create matches in database
    for (const match of nextRoundMatches) {
      await prisma.match.create({
        data: match as any
      });
    }

    // Start first match of next round
    const firstMatch = nextRoundMatches.find(m => m.status === 'WAITING');
    if (firstMatch) {
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

async function completeTournament(tournamentId: string, winnerId: string) {
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

  // Set final positions for other participants
  await setFinalPositions(tournamentId);
}

async function setFinalPositions(tournamentId: string) {
  // Get all participants who were eliminated
  const participants = await prisma.tournamentParticipant.findMany({
    where: {
      tournamentId,
      eliminated: true
    },
    orderBy: {
      eliminatedAt: 'desc' // Latest eliminations get higher positions
    }
  });

  // Assign positions starting from 2nd place
  let position = 2;
  for (const participant of participants) {
    await prisma.tournamentParticipant.update({
      where: { id: participant.id },
      data: { finalPosition: position }
    });

    // Update user stats for top 3 finishers
    if (participant.participantType === 'HUMAN' && participant.userId) {
      if (position === 2) {
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
