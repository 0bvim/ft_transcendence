export interface NetworkInfo {
  chainId: number;
  name: string;
}

export interface BlockchainTournament {
  id: number;
  name: string;
  description: string;
  creator: string;
  createdAt: number;
  completedAt: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  isVerified: boolean;
}

export interface BlockchainMatch {
  id: number;
  tournamentId: number;
  round: number;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
  completedAt: number;
  status: string;
  resultHash: string;
}

export interface BlockchainAchievement {
  tournamentId: number;
  userId: string;
  achievementType: string;
  timestamp: number;
  score: number;
  proofHash: string;
}

export interface BlockchainStats {
  tournamentCount: number;
  network: NetworkInfo;
  contractAddress: string;
}

export interface CreateTournamentRequest {
  name: string;
  description: string;
  maxParticipants: number;
}

export interface AddParticipantRequest {
  userId: string;
  displayName: string;
  participantType: 'HUMAN' | 'AI';
}

export interface RecordMatchResultRequest {
  tournamentId: number;
  round: number;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
}

export interface CompleteTournamentRequest {
  tournamentId: number;
  winnerId: string;
  finalPositions: string[];
}

class BlockchainApi {
  private baseUrl: string;

  constructor() {
    // Use blockchain service URL directly
    const hostname = window.location.hostname;
    this.baseUrl = `http://${hostname}:3004`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken'); // Fixed token key
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}/api/blockchain${endpoint}`, config); // Fixed API path
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data; // Handle both formats
  }

  // Tournament operations
  async createTournament(request: CreateTournamentRequest): Promise<{
    tournamentId: number;
    transactionHash: string;
  }> {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async addParticipant(
    tournamentId: number,
    request: AddParticipantRequest
  ): Promise<{ transactionHash: string }> {
    return this.request(`/tournaments/${tournamentId}/participants`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async startTournament(tournamentId: number): Promise<{ transactionHash: string }> {
    return this.request(`/tournaments/${tournamentId}/start`, {
      method: 'POST',
    });
  }

  async recordMatchResult(request: RecordMatchResultRequest): Promise<{
    transactionHash: string;
  }> {
    return this.request('/tournaments/matches', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async completeTournament(request: CompleteTournamentRequest): Promise<{
    transactionHash: string;
  }> {
    return this.request('/tournaments/complete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Data retrieval
  async getTournament(tournamentId: number): Promise<{
    tournament: BlockchainTournament;
  }> {
    return this.request(`/tournaments/${tournamentId}`);
  }

  async getMatch(matchId: number): Promise<{
    match: BlockchainMatch;
  }> {
    return this.request(`/matches/${matchId}`);
  }

  async getUserAchievements(userId: string): Promise<{
    achievements: BlockchainAchievement[];
  }> {
    return this.request(`/users/${userId}/achievements`);
  }

  async getUserTournaments(userId: string): Promise<{
    tournaments: number[];
  }> {
    return this.request(`/users/${userId}/tournaments`);
  }

  // Verification
  async verifyMatchResult(resultHash: string): Promise<{
    isVerified: boolean;
    resultHash: string;
  }> {
    return this.request(`/verify/${resultHash}`);
  }

  // Network and stats
  async getNetworkInfo(): Promise<{
    network: NetworkInfo;
    contractAddress: string;
    isDeployed: boolean;
  }> {
    return this.request('/network');
  }

  async getStats(): Promise<BlockchainStats> {
    return this.request('/stats');
  }

  // Health check
  async healthCheck(): Promise<{
    contractDeployed: boolean;
    network: NetworkInfo;
    timestamp: string;
  }> {
    return this.request('/health');
  }
}

export const blockchainApi = new BlockchainApi();
