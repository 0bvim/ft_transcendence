import { Prisma, TournamentParticipant } from "@prisma/client";

export interface TournamentParticipantRepository {
  findById(id: string): Promise<TournamentParticipant | null>;
  findByTournamentId(tournamentId: string): Promise<TournamentParticipant[]>;
  findByUserId(userId: string): Promise<TournamentParticipant[]>;
  findByTournamentAndUser(tournamentId: string, userId: string): Promise<TournamentParticipant | null>;
  create(data: Prisma.TournamentParticipantCreateInput): Promise<TournamentParticipant>;
  update(id: string, data: Prisma.TournamentParticipantUpdateInput): Promise<TournamentParticipant>;
  delete(id: string): Promise<TournamentParticipant>;
  countByTournament(tournamentId: string): Promise<number>;
  eliminate(id: string): Promise<TournamentParticipant>;
  setFinalPosition(id: string, position: number): Promise<TournamentParticipant>;
}
