interface Tournament {
  id: string;
  name: string;
  description: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  participants: TournamentParticipant[];
  matches: Match[];
  // Computed fields from backend
  progress?: number;
  currentParticipants?: number;
  progressPercentage?: number;
  activeMatches?: number;
  completedMatches?: number;
  waitingMatches?: number;
  currentRound?: number;
}

interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId?: string;
  displayName: string;
  participantType: 'HUMAN' | 'AI';
  status: 'ACTIVE' | 'ELIMINATED' | 'WINNER';
  eliminated: boolean;
  eliminatedAt?: string;
  finalPosition?: number;
  createdAt: string;
}

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields with participant info
  player1?: {
    id: string;
    displayName: string;
    participantType: 'HUMAN' | 'AI';
  };
  player2?: {
    id: string;
    displayName: string;
    participantType: 'HUMAN' | 'AI';
  };
  winner?: {
    id: string;
    displayName: string;
    participantType: 'HUMAN' | 'AI';
  };
}

interface UserStats {
  userId: string;
  displayName: string;
  totalTournaments: number;
  wins: number;
  losses: number;
  tournamentsWon: number;
  tournamentsSecond: number;
  tournamentsThird: number;
  winRate?: number;
  averagePosition?: number;
  recentTournaments?: {
    id: string;
    name: string;
    finalPosition?: number;
    completedAt: string;
  }[];
}

interface CreateTournamentRequest {
  name: string;
  description?: string;
  maxPlayers: number;
  tournamentType: 'HUMANS_ONLY' | 'MIXED';
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  autoStart: boolean;
}

interface SubmitMatchResultRequest {
  player1Score: number;
  player2Score: number;
  winnerId: string;
}

class TournamentApi {
  private baseUrl: string;

  constructor() {
    // Use tournament service URL - in containers, use service name
    // In development, services are accessible via localhost with HTTPS
    const hostname = window.location.hostname;
    
    // For containerized deployment, tournament service is accessible via HTTPS on port 3003
    this.baseUrl = `https://${hostname}:3003`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken'); // Fixed token key
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Only add if token exists
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Backend returns {success, data, message} - extract the data
    return result.data || result;
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
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/tournaments${query ? `?${query}` : ''}`;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('accessToken') && { 
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Backend returns: { success: true, data: tournaments[], pagination: {...} }
    // So result.data IS the tournaments array, not result.data.tournaments
    return {
      tournaments: result.data || [], // Ensure we always return an array
      pagination: result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    };
  }

  async getTournament(id: string): Promise<Tournament> {
    const response = await this.request<Tournament>(`/tournaments/${id}`);
    return response;
  }

  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    // Add current user ID and displayName from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const requestData = {
      ...data,
      userId: user.id || 'anonymous', // Tournament service needs userId
      displayName: user.displayName || user.username || 'Anonymous' // Tournament service needs displayName
    };
    
    const response = await this.request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async joinTournament(id: string): Promise<{ participant: TournamentParticipant, tournament: Tournament }> {
    // Get user info for join request
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const requestData = {
      userId: user.id || 'anonymous',
      displayName: user.displayName || user.username || 'Anonymous'
    };
    
    const response = await this.request<{ participant: TournamentParticipant, tournament: Tournament }>(`/tournaments/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async startTournament(id: string): Promise<Tournament> {
    // Tournament service needs userId to authorize start
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const requestData = {
      userId: user.id || 'anonymous'
    };
    
    const response = await this.request<Tournament>(`/tournaments/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async submitMatchResult(
    matchId: string,
    result: any, // Contains winnerId, scorePlayer1, scorePlayer2 for AI matches
    matchData: any // Contains player1, player2 for human matches
  ): Promise<{ match: Match; tournament: Tournament }> {
    let winnerId: string;
    let scorePlayer1: number;
    let scorePlayer2: number;

    // Check if the result is from an AI simulation or a human match
    if (result.winnerId) {
      // AI vs AI match: winnerId and scores are provided directly
      winnerId = result.winnerId;
      scorePlayer1 = result.scorePlayer1;
      scorePlayer2 = result.scorePlayer2;
    } else {
      // Human match: determine winnerId from 'PLAYER_1' or 'PLAYER_2'
      winnerId = result.winner === 'PLAYER_1' 
        ? (matchData.player1?.id || matchData.player1Id) 
        : (matchData.player2?.id || matchData.player2Id);
      scorePlayer1 = result.score.player1;
      scorePlayer2 = result.score.player2;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const requestData = {
      winnerId,
      scorePlayer1,
      scorePlayer2,
      userId: user.id, // The user submitting the result
    };

    console.log('Submitting match result payload:', requestData);

    const response = await this.request<{ match: Match; tournament: Tournament }>(`/matches/${matchId}/result`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.request<UserStats>(`/api/users/${userId}/stats`);
  }

  async getMatchDetails(matchId: string): Promise<{ success: boolean; data: any }> {
    return this.request<{ success: boolean; data: any }>(`/matches/${matchId}`);
  }
}

export const tournamentApi = new TournamentApi();
export type { Tournament, TournamentParticipant, Match, UserStats, CreateTournamentRequest, SubmitMatchResultRequest };
