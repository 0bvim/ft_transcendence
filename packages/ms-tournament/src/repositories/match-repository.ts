import { Prisma, Match } from "@prisma/client";

export interface MatchRepository {
  findById(id: string): Promise<Match | null>;
  findByTournamentId(tournamentId: string): Promise<Match[]>;
  findByRound(tournamentId: string, round: number): Promise<Match[]>;
  findActiveMatch(tournamentId: string): Promise<Match | null>;
  findByParticipant(participantId: string): Promise<Match[]>;
  create(data: Prisma.MatchCreateInput): Promise<Match>;
  update(id: string, data: Prisma.MatchUpdateInput): Promise<Match>;
  delete(id: string): Promise<Match>;
  setResult(id: string, winnerId: string, player1Score: number, player2Score: number): Promise<Match>;
  setInProgress(id: string): Promise<Match>;
  complete(id: string): Promise<Match>;
}
