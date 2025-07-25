import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTournamentUseCase(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          participantType: true,
          status: true,
          eliminated: true,
          eliminatedAt: true,
          finalPosition: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      matches: {
        select: {
          id: true,
          round: true,
          matchNumber: true,
          status: true,
          player1Id: true,
          player2Id: true,
          winnerId: true,
          player1Score: true,
          player2Score: true,
          startedAt: true,
          completedAt: true,
          createdAt: true
        },
        orderBy: [
          { round: 'asc' },
          { matchNumber: 'asc' }
        ]
      }
    }
  });

  if (!tournament) {
    return null;
  }

  // Add computed fields
  const currentPlayers = tournament.participants.length;
  const activeMatches = tournament.matches.filter(match => match.status === 'IN_PROGRESS');
  const completedMatches = tournament.matches.filter(match => match.status === 'COMPLETED');
  const waitingMatches = tournament.matches.filter(match => match.status === 'WAITING');
  
  // Calculate tournament progress
  const totalMatches = tournament.matches.length;
  const progressPercentage = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0;
  
  // Get current round
  const currentRound = activeMatches.length > 0 ? activeMatches[0].round : 
                     waitingMatches.length > 0 ? waitingMatches[0].round : 
                     completedMatches.length > 0 ? Math.max(...completedMatches.map(m => m.round)) : 0;

  // Transform matches to include participant names
  const transformedMatches = tournament.matches.map(match => {
    const player1 = tournament.participants.find(p => p.id === match.player1Id);
    const player2 = tournament.participants.find(p => p.id === match.player2Id);
    const winner = tournament.participants.find(p => p.id === match.winnerId);
    
    return {
      ...match,
      player1: player1 ? {
        id: player1.id,
        userId: player1.userId, // Include userId for frontend logic
        displayName: player1.displayName,
        participantType: player1.participantType
      } : null,
      player2: player2 ? {
        id: player2.id,
        userId: player2.userId, // Include userId for frontend logic
        displayName: player2.displayName,
        participantType: player2.participantType
      } : null,
      winner: winner ? {
        id: winner.id,
        userId: winner.userId, // Include userId for frontend logic
        displayName: winner.displayName,
        participantType: winner.participantType
      } : null
    };
  });

  return {
    ...tournament,
    currentPlayers,
    activeMatches: activeMatches.length,
    completedMatches: completedMatches.length,
    waitingMatches: waitingMatches.length,
    progressPercentage: Math.round(progressPercentage),
    currentRound,
    matches: transformedMatches
  };
}
