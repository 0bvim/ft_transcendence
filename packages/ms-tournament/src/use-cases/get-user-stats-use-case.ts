import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserStatsUseCase(userId: string) {
  // Get user stats
  const stats = await prisma.userStats.findUnique({
    where: { userId }
  });

  if (!stats) {
    // Return default stats if user hasn't participated in any tournaments
    return {
      userId,
      displayName: 'Unknown',
      totalTournaments: 0,
      wins: 0,
      losses: 0,
      tournamentsWon: 0,
      tournamentsSecond: 0,
      tournamentsThird: 0,
      winRate: 0,
      averagePosition: 0,
      recentTournaments: []
    };
  }

  // Calculate additional stats
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
  
  // Calculate average tournament position
  const totalPlacements = stats.tournamentsWon + stats.tournamentsSecond + stats.tournamentsThird;
  const weightedSum = (stats.tournamentsWon * 1) + (stats.tournamentsSecond * 2) + (stats.tournamentsThird * 3);
  const averagePosition = totalPlacements > 0 ? weightedSum / totalPlacements : 0;

  // Get recent tournament history
  const recentTournaments = await prisma.tournamentParticipant.findMany({
    where: {
      userId,
      tournament: {
        status: 'COMPLETED'
      }
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          completedAt: true,
          participants: {
            select: {
              id: true,
              displayName: true,
              finalPosition: true
            }
          }
        }
      }
    },
    orderBy: {
      tournament: {
        completedAt: 'desc'
      }
    },
    take: 10
  });

  const formattedRecentTournaments = recentTournaments.map(participation => ({
    tournamentId: participation.tournament.id,
    tournamentName: participation.tournament.name,
    completedAt: participation.tournament.completedAt,
    finalPosition: participation.finalPosition,
    totalParticipants: participation.tournament.participants.length,
    eliminated: participation.eliminated,
    eliminatedAt: participation.eliminatedAt
  }));

  return {
    ...stats,
    totalGames,
    winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
    averagePosition: Math.round(averagePosition * 100) / 100,
    recentTournaments: formattedRecentTournaments
  };
}
