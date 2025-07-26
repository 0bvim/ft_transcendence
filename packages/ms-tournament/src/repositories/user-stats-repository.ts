import { Prisma, UserStats } from "@prisma/client";

export interface UserStatsRepository {
  findById(id: string): Promise<UserStats | null>;
  findByUserId(userId: string): Promise<UserStats | null>;
  create(data: Prisma.UserStatsCreateInput): Promise<UserStats>;
  update(id: string, data: Prisma.UserStatsUpdateInput): Promise<UserStats>;
  updateByUserId(userId: string, data: Prisma.UserStatsUpdateInput): Promise<UserStats>;
  delete(id: string): Promise<UserStats>;
  
  // Stats update methods
  recordTournamentParticipation(userId: string, displayName: string): Promise<UserStats>;
  recordWin(userId: string): Promise<UserStats>;
  recordLoss(userId: string): Promise<UserStats>;
  recordTournamentWin(userId: string): Promise<UserStats>;
  recordTournamentPlacement(userId: string, position: number): Promise<UserStats>;
  
  // Leaderboard methods
  getTopPlayers(limit: number): Promise<UserStats[]>;
  getTopTournamentWinners(limit: number): Promise<UserStats[]>;
}
