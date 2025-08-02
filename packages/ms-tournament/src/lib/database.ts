import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export type Tournament = {
  id: string;
  hostUserId: string;
  size: number;
  aiDifficulty: string;
  status: string;
  winnerId: string | null;
  winnerName: string | null;
  createdAt: Date;
  completedAt: Date | null;
  participants: TournamentParticipant[];
};

export type TournamentParticipant = {
  id: string;
  tournamentId: string;
  userId: string | null;
  alias: string;
  isAI: boolean;
  position: number;
};

export type CreateTournamentData = {
  hostUserId: string;
  size: number;
  aiDifficulty: string;
  humanPlayers: Array<{
    userId?: string;
    alias: string;
  }>;
};

export type BracketMatch = {
  round: number;
  matchIndex: number;
  player1: TournamentParticipant | null;
  player2: TournamentParticipant | null;
  winner: TournamentParticipant | null;
  status: 'pending' | 'ready' | 'completed';
};
