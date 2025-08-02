import { Prisma, Tournament, TournamentParticipant, Match } from "@prisma/client";

export interface TournamentRepository {
  findById(id: string): Promise<Tournament | null>;
  findByIdWithParticipants(id: string): Promise<(Tournament & { participants: TournamentParticipant[] }) | null>;
  findByIdWithMatches(id: string): Promise<(Tournament & { matches: Match[] }) | null>;
  findByIdWithDetails(id: string): Promise<(Tournament & { 
    participants: TournamentParticipant[], 
    matches: Match[] 
  }) | null>;
  findMany(filters: {
    status?: string;
    userId?: string;
    page: number;
    limit: number;
  }): Promise<{ tournaments: Tournament[]; total: number }>;
  findByCreator(userId: string): Promise<Tournament[]>;
  create(data: Prisma.TournamentCreateInput): Promise<Tournament>;
  update(id: string, data: Prisma.TournamentUpdateInput): Promise<Tournament>;
  delete(id: string): Promise<Tournament>;
  countParticipants(id: string): Promise<number>;
}
