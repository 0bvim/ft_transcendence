import { PrismaClient } from '@prisma/client';
import { TournamentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface GetTournamentsInput {
  status?: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  userId?: string;
  page: number;
  limit: number;
}

export async function getTournamentsUseCase(input: GetTournamentsInput) {
  const { status, userId, page, limit } = input;
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status as TournamentStatus;
  }
  
  if (userId) {
    where.createdBy = userId;
  }
  
  // Get tournaments with participant counts
  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
      where,
      skip,
      take: limit,
      include: {
        participants: {
          select: {
            id: true,
            displayName: true,
            participantType: true,
            status: true
          }
        },
        matches: {
          select: {
            id: true,
            status: true,
            round: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.tournament.count({ where })
  ]);
  
  // Transform tournaments to include computed fields
  const transformedTournaments = tournaments.map(tournament => ({
    ...tournament,
    currentPlayers: tournament.participants.length,
    activeMatches: tournament.matches.filter(match => match.status === 'IN_PROGRESS').length,
    completedMatches: tournament.matches.filter(match => match.status === 'COMPLETED').length
  }));
  
  return {
    tournaments: transformedTournaments,
    total
  };
}
