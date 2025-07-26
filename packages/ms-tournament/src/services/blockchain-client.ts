import { env } from '../env';

export interface BlockchainTournament {
  tournamentId: number;
  transactionHash: string;
}

export interface BlockchainResult {
  transactionHash: string;
}

export interface CreateTournamentBlockchainRequest {
  name: string;
  description: string;
  maxParticipants: number;
}

export interface AddParticipantBlockchainRequest {
  userId: string;
  displayName: string;
  participantType: 'HUMAN' | 'AI';
}

export interface RecordMatchResultBlockchainRequest {
  tournamentId: number;
  round: number;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
}

export interface CompleteTournamentBlockchainRequest {
  tournamentId: number;
  winnerId: string;
  finalPositions: string[];
}

class BlockchainClient {
  private blockchainServiceUrl: string;

  constructor() {
    this.blockchainServiceUrl = env.BLOCKCHAIN_SERVICE_URL;
  }

  private log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    const logData = {
      service: 'tournament-blockchain-client',
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
    
    if (level === 'error') {
      process.stderr.write(JSON.stringify(logData) + '\n');
    } else {
      process.stdout.write(JSON.stringify(logData) + '\n');
    }
  }

  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<T | null> {
    try {
      const url = `${this.blockchainServiceUrl}/api/blockchain${endpoint}`;
      
      this.log('info', `Making blockchain request: ${method} ${url}`, { body });
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        this.log('error', `Blockchain request failed: ${response.status}`, {
          url,
          status: response.status,
          error: errorText
        });
        return null; // Non-blocking failure
      }
      
      const result = await response.json();
      this.log('info', 'Blockchain request successful', { url, result });
      
      return result.data || result;
      
    } catch (error) {
      this.log('error', 'Blockchain request error', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : error
      });
      return null; // Non-blocking failure
    }
  }

  async createTournament(data: CreateTournamentBlockchainRequest): Promise<BlockchainTournament | null> {
    this.log('info', 'Creating tournament on blockchain', {
      name: data.name,
      maxParticipants: data.maxParticipants
    });

    const result = await this.makeRequest<BlockchainTournament>('/tournaments', 'POST', data);
    
    if (result) {
      this.log('info', 'Tournament created on blockchain successfully', result);
    } else {
      this.log('warn', 'Failed to create tournament on blockchain - continuing with database-only mode');
    }
    
    return result;
  }

  async addParticipant(
    blockchainTournamentId: number,
    data: AddParticipantBlockchainRequest
  ): Promise<BlockchainResult | null> {
    this.log('info', 'Adding participant to blockchain tournament', {
      tournamentId: blockchainTournamentId,
      userId: data.userId,
      displayName: data.displayName
    });

    const result = await this.makeRequest<BlockchainResult>(
      `/tournaments/${blockchainTournamentId}/participants`, 
      'POST', 
      data
    );
    
    if (result) {
      this.log('info', 'Participant added to blockchain successfully', result);
    } else {
      this.log('warn', 'Failed to add participant to blockchain - continuing with database-only mode');
    }
    
    return result;
  }

  async startTournament(blockchainTournamentId: number): Promise<BlockchainResult | null> {
    this.log('info', 'Starting tournament on blockchain', {
      tournamentId: blockchainTournamentId
    });

    const result = await this.makeRequest<BlockchainResult>(
      `/tournaments/${blockchainTournamentId}/start`, 
      'POST'
    );
    
    if (result) {
      this.log('info', 'Tournament started on blockchain successfully', result);
    } else {
      this.log('warn', 'Failed to start tournament on blockchain - continuing with database-only mode');
    }
    
    return result;
  }

  async recordMatchResult(data: RecordMatchResultBlockchainRequest): Promise<BlockchainResult | null> {
    this.log('info', 'Recording match result on blockchain', {
      tournamentId: data.tournamentId,
      round: data.round,
      winnerId: data.winnerId
    });

    const result = await this.makeRequest<BlockchainResult>('/tournaments/matches', 'POST', data);
    
    if (result) {
      this.log('info', 'Match result recorded on blockchain successfully', result);
    } else {
      this.log('warn', 'Failed to record match result on blockchain - continuing with database-only mode');
    }
    
    return result;
  }

  async completeTournament(data: CompleteTournamentBlockchainRequest): Promise<BlockchainResult | null> {
    this.log('info', 'Completing tournament on blockchain', {
      tournamentId: data.tournamentId,
      winnerId: data.winnerId,
      participantCount: data.finalPositions.length
    });

    const result = await this.makeRequest<BlockchainResult>('/tournaments/complete', 'POST', data);
    
    if (result) {
      this.log('info', 'Tournament completed on blockchain successfully', result);
    } else {
      this.log('warn', 'Failed to complete tournament on blockchain - continuing with database-only mode');
    }
    
    return result;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.makeRequest('/health', 'GET');
      return result !== null;
    } catch (error) {
      this.log('error', 'Blockchain health check failed', error);
      return false;
    }
  }
}

export const blockchainClient = new BlockchainClient(); 