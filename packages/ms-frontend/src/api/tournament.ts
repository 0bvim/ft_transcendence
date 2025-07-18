interface Tournament {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  autoStart: boolean;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  currentParticipants: number;
  progress: number;
  participants: TournamentParticipant[];
  matches: Match[];
}

interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId?: string;
  displayName: string;
  participantType: 'HUMAN' | 'AI';
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  eliminated: boolean;
  position?: number;
  joinedAt: string;
}

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id: string;
  player2Id: string;
  player1DisplayName: string;
  player2DisplayName: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalTournaments: number;
  winRate: number;
  averagePosition: number;
  recentTournaments: {
    id: string;
    name: string;
    position: number;
    completedAt: string;
  }[];
}

interface CreateTournamentRequest {
  name: string;
  description: string;
  maxParticipants: number;
  autoStart: boolean;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface SubmitMatchResultRequest {
  player1Score: number;
  player2Score: number;
  winnerId: string;
}

class TournamentApi {
  private baseUrl = '/api/tournament';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTournaments(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{
    tournaments: Tournament[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/tournaments${query ? `?${query}` : ''}`;
    
    return this.request<{
      tournaments: Tournament[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
  }

  async getTournament(id: string): Promise<{ tournament: Tournament }> {
    return this.request<{ tournament: Tournament }>(`/tournaments/${id}`);
  }

  async createTournament(data: CreateTournamentRequest): Promise<{ tournament: Tournament }> {
    return this.request<{ tournament: Tournament }>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinTournament(id: string): Promise<{ tournament: Tournament }> {
    return this.request<{ tournament: Tournament }>(`/tournaments/${id}/join`, {
      method: 'POST',
    });
  }

  async startTournament(id: string): Promise<{ tournament: Tournament }> {
    return this.request<{ tournament: Tournament }>(`/tournaments/${id}/start`, {
      method: 'POST',
    });
  }

  async submitMatchResult(
    matchId: string,
    data: SubmitMatchResultRequest
  ): Promise<{ match: Match; tournament: Tournament }> {
    return this.request<{ match: Match; tournament: Tournament }>(`/matches/${matchId}/result`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(userId: string): Promise<{ stats: UserStats }> {
    return this.request<{ stats: UserStats }>(`/users/${userId}/stats`);
  }
}

export const tournamentApi = new TournamentApi();
export type { Tournament, TournamentParticipant, Match, UserStats, CreateTournamentRequest, SubmitMatchResultRequest };
