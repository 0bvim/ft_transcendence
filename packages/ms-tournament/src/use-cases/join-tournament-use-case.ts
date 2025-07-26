import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JoinTournamentInput {
  tournamentId: string;
  userId: string;
  displayName: string;
}

export async function joinTournamentUseCase(input: JoinTournamentInput, logger?: any) {
  const { tournamentId, userId, displayName } = input;

  logger?.info({
    action: 'tournament_join_started',
    tournamentId,
    userId,
    displayName
  }, `User ${userId} attempting to join tournament ${tournamentId}`);

  // Check if tournament exists and get current state
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true
    }
  });

  if (!tournament) {
    logger?.warn({
      action: 'tournament_join_failed',
      tournamentId,
      userId,
      reason: 'tournament_not_found'
    }, `Tournament ${tournamentId} not found for join attempt by ${userId}`);
    throw new Error('Tournament not found');
  }

  // Check if tournament is still accepting players
  if (tournament.status !== 'WAITING') {
    logger?.warn({
      action: 'tournament_join_failed',
      tournamentId,
      userId,
      reason: 'tournament_not_accepting',
      tournamentStatus: tournament.status
    }, `Tournament ${tournamentId} not accepting players (status: ${tournament.status})`);
    throw new Error('Tournament already started or completed');
  }

  // Check if user already joined this tournament
  const existingParticipant = tournament.participants.find(p => p.userId === userId);
  if (existingParticipant) {
    logger?.warn({
      action: 'tournament_join_failed',
      tournamentId,
      userId,
      reason: 'already_joined'
    }, `User ${userId} already joined tournament ${tournamentId}`);
    throw new Error('Already joined this tournament');
  }

  // Replace an AI participant with the human player (tournaments are always MIXED)
  const aiParticipants = tournament.participants.filter(p => p.participantType === 'AI');
  
  if (aiParticipants.length === 0) {
    logger?.warn({
      action: 'tournament_join_failed',
      tournamentId,
      userId,
      reason: 'no_ai_slots_available',
      totalParticipants: tournament.participants.length
    }, `No AI slots available in tournament ${tournamentId} for user ${userId}`);
    throw new Error('Tournament is full - no AI participants available to replace');
  }

  // Replace the first AI participant with the human player
  const aiToReplace = aiParticipants[0];
  
  await prisma.tournamentParticipant.update({
    where: { id: aiToReplace.id },
    data: {
      userId,
      displayName,
      participantType: 'HUMAN',
      status: 'ACTIVE'
    }
  });

  logger?.info({
    action: 'tournament_join_success',
    tournamentId,
    userId,
    displayName,
    replacedAiSlot: aiToReplace.displayName
  }, `User ${userId} successfully joined tournament ${tournamentId}, replacing ${aiToReplace.displayName}`);

  // Get updated tournament data
  const updatedTournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true
    }
  });

  // Initialize or update user stats
  await initializeUserStats(userId, displayName, logger);

  const humanParticipants = updatedTournament!.participants.filter(p => p.participantType === 'HUMAN').length;
  const aiParticipants_count = updatedTournament!.participants.filter(p => p.participantType === 'AI').length;
  
  logger?.info({
    action: 'tournament_participant_stats',
    tournamentId,
    humanParticipants,
    aiParticipants: aiParticipants_count,
    totalParticipants: updatedTournament!.participants.length
  }, `Tournament ${tournamentId} now has ${humanParticipants} humans and ${aiParticipants_count} AIs`);

  return {
    participant: updatedTournament!.participants.find(p => p.userId === userId),
    tournament: updatedTournament!
  };
}

async function initializeUserStats(userId: string, displayName: string, logger?: any) {
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
    
    logger?.debug({
      action: 'user_stats_created',
      userId,
      displayName
    }, `Created user stats for ${userId}`);
  } else {
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalTournaments: existingStats.totalTournaments + 1,
        displayName // Update display name in case it changed
      }
    });
    
    logger?.debug({
      action: 'user_stats_updated',
      userId,
      displayName,
      totalTournaments: existingStats.totalTournaments + 1
    }, `Updated user stats for ${userId}`);
  }
}
