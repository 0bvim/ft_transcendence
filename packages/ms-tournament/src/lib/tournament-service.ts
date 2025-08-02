import { prisma, Tournament, TournamentParticipant, CreateTournamentData, BracketMatch } from "./database";

export class TournamentService {
  
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    const tournament = await prisma.tournament.create({
      data: {
        hostUserId: data.hostUserId,
        size: data.size,
        aiDifficulty: data.aiDifficulty,
        status: "setup",
      },
      include: {
        participants: true,
      },
    });

    // Create participants
    const participants: Array<{ tournamentId: string; userId?: string; alias: string; isAI: boolean; position: number }> = [];
    
    // Add human players
    data.humanPlayers.forEach((player, index) => {
      participants.push({
        tournamentId: tournament.id,
        userId: player.userId,
        alias: player.alias,
        isAI: false,
        position: index,
      });
    });

    // Fill remaining slots with AI
    const aiSlotsNeeded = data.size - data.humanPlayers.length;
    for (let i = 0; i < aiSlotsNeeded; i++) {
      participants.push({
        tournamentId: tournament.id,
        alias: `AI Player ${i + 1}`,
        isAI: true,
        position: data.humanPlayers.length + i,
      });
    }

    // Shuffle participants for random seeding
    this.shuffleArray(participants);
    
    // Update positions after shuffle
    participants.forEach((participant, index) => {
      participant.position = index;
    });

    await prisma.tournamentParticipant.createMany({
      data: participants,
    });

    return this.getTournamentById(tournament.id);
  }

  async getTournamentById(id: string): Promise<Tournament> {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { position: 'asc' }
        },
      },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    return tournament;
  }

  async startTournament(id: string): Promise<Tournament> {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: { status: "in_progress" },
      include: {
        participants: {
          orderBy: { position: 'asc' }
        },
      },
    });

    return tournament;
  }

  async completeTournament(id: string, winnerId: string | null, winnerName: string): Promise<Tournament> {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        status: "completed",
        winnerId: winnerId || "AI",
        winnerName,
        completedAt: new Date(),
      },
      include: {
        participants: {
          orderBy: { position: 'asc' }
        },
      },
    });

    return tournament;
  }

  generateBracket(participants: TournamentParticipant[]): BracketMatch[][] {
    const size = participants.length;
    const rounds: BracketMatch[][] = [];
    
    // Calculate number of rounds
    const numRounds = Math.log2(size);
    
    // Generate first round matches
    const firstRound: BracketMatch[] = [];
    for (let i = 0; i < size; i += 2) {
      firstRound.push({
        round: 1,
        matchIndex: i / 2,
        player1: participants[i],
        player2: participants[i + 1],
        winner: null,
        status: 'pending'
      });
    }
    rounds.push(firstRound);
    
    // Generate subsequent rounds
    for (let round = 2; round <= numRounds; round++) {
      const roundMatches: BracketMatch[] = [];
      const prevRoundSize = rounds[round - 2].length;
      
      for (let i = 0; i < prevRoundSize; i += 2) {
        roundMatches.push({
          round,
          matchIndex: i / 2,
          player1: null, // Will be filled by winners from previous round
          player2: null,
          winner: null,
          status: 'pending'
        });
      }
      rounds.push(roundMatches);
    }
    
    return rounds;
  }

  async getUserTournaments(userId: string): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
      where: { hostUserId: userId },
      include: {
        participants: {
          orderBy: { position: 'asc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tournaments;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
      include: {
        participants: {
          orderBy: { position: 'asc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tournaments;
  }

  // Utility method to shuffle array for random seeding
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Simulate AI vs AI match with random outcome
  simulateAIMatch(): boolean {
    return Math.random() < 0.5; // 50/50 chance
  }
}
