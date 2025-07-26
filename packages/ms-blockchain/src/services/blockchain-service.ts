import { ethers } from "ethers";
import { TournamentScoring } from "../../typechain-types";
import TournamentScoringABI from "../abi/TournamentScoring.json";

export interface BlockchainTournament {
  id: number;
  name: string;
  description: string;
  creator: string;
  createdAt: number;
  completedAt: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "WAITING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
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
  status: "WAITING" | "ACTIVE" | "COMPLETED";
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

export class BlockchainService {
  private provider: ethers.Provider;
  private contract: TournamentScoring;
  private signer: ethers.Signer;
  private contractAddress: string;
  private logger: any;

  constructor(
    rpcUrl: string,
    contractAddress: string,
    privateKey?: string,
    logger?: any
  ) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.logger = logger || console; // fallback to console if no logger provided
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      throw new Error("Private key required for blockchain transactions");
    }
    
    this.contract = new ethers.Contract(
      contractAddress,
      TournamentScoringABI.abi,
      this.signer
    ) as any;
  }

  /**
   * Create a new tournament on the blockchain
   */
  async createTournament(
    name: string,
    description: string,
    maxParticipants: number
  ): Promise<{ tournamentId: number; transactionHash: string }> {
    try {
      this.logger.info('Creating tournament on blockchain', { 
        action: 'createTournament',
        name, 
        maxParticipants 
      });
      
      const tx = await this.contract.createTournament(
        name,
        description,
        maxParticipants
      );
      
      const receipt = await tx.wait();
      
      // Extract tournament ID from events
      const tournamentId = await this.contract.getTournamentCount();
      
      this.logger.info('Tournament created successfully', { 
        action: 'createTournament',
        tournamentId: Number(tournamentId),
        transactionHash: receipt?.hash || tx.hash
      });
      
      return {
        tournamentId: Number(tournamentId),
        transactionHash: receipt?.hash || tx.hash
      };
    } catch (error) {
      this.logger.error('Failed to create tournament on blockchain', { 
        action: 'createTournament',
        error: error instanceof Error ? error.message : error,
        name, 
        maxParticipants 
      });
      throw new Error(`Failed to create tournament on blockchain: ${error}`);
    }
  }

  /**
   * Add a participant to a tournament
   */
  async addParticipant(
    tournamentId: number,
    userId: string,
    displayName: string,
    participantType: "HUMAN" | "AI"
  ): Promise<string> {
    try {
      this.logger.info('Adding participant to tournament', { 
        action: 'addParticipant',
        tournamentId, 
        userId,
        displayName, 
        participantType 
      });
      
      const tx = await this.contract.addParticipant(
        tournamentId,
        userId,
        displayName,
        participantType
      );
      
      const receipt = await tx.wait();
      
      this.logger.info('Participant added successfully', { 
        action: 'addParticipant',
        tournamentId,
        userId,
        transactionHash: receipt?.hash || tx.hash
      });
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      this.logger.error('Failed to add participant to tournament', { 
        action: 'addParticipant',
        error: error instanceof Error ? error.message : error,
        tournamentId,
        userId
      });
      throw new Error(`Failed to add participant to blockchain: ${error}`);
    }
  }

  /**
   * Start a tournament on the blockchain
   */
  async startTournament(tournamentId: number): Promise<string> {
    try {
      this.logger.info('Starting tournament on blockchain', { 
        action: 'startTournament',
        tournamentId 
      });
      
      const tx = await this.contract.startTournament(tournamentId);
      const receipt = await tx.wait();
      
      this.logger.info('Tournament started successfully', { 
        action: 'startTournament',
        tournamentId,
        transactionHash: receipt?.hash || tx.hash
      });
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      this.logger.error('Failed to start tournament on blockchain', { 
        action: 'startTournament',
        error: error instanceof Error ? error.message : error,
        tournamentId
      });
      throw new Error(`Failed to start tournament on blockchain: ${error}`);
    }
  }

  /**
   * Record a match result on the blockchain
   */
  async recordMatchResult(
    tournamentId: number,
    round: number,
    player1Id: string,
    player2Id: string,
    winnerId: string,
    player1Score: number,
    player2Score: number
  ): Promise<string> {
    try {
      this.logger.info('Recording match result on blockchain', { 
        action: 'recordMatchResult',
        tournamentId, 
        round,
        player1Id, 
        player2Id, 
        winnerId,
        player1Score, 
        player2Score
      });
      
      // Generate result hash for verification
      const resultHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "uint8", "string", "string", "string", "uint256", "uint256", "uint256"],
          [tournamentId, round, player1Id, player2Id, winnerId, player1Score, player2Score, Date.now()]
        )
      );
      
      const tx = await this.contract.recordMatchResult(
        tournamentId,
        round,
        player1Id,
        player2Id,
        winnerId,
        player1Score,
        player2Score,
        resultHash
      );
      
      const receipt = await tx.wait();
      
      this.logger.info('Match result recorded successfully', { 
        action: 'recordMatchResult',
        tournamentId,
        round,
        winnerId,
        transactionHash: receipt?.hash || tx.hash,
        resultHash
      });
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      this.logger.error('Failed to record match result on blockchain', { 
        action: 'recordMatchResult',
        error: error instanceof Error ? error.message : error,
        tournamentId, 
        round,
        winnerId
      });
      throw new Error(`Failed to record match result on blockchain: ${error}`);
    }
  }

  /**
   * Complete a tournament on the blockchain
   */
  async completeTournament(
    tournamentId: number,
    winnerId: string,
    finalPositions: string[]
  ): Promise<string> {
    try {
      this.logger.info('Completing tournament on blockchain', { 
        action: 'completeTournament',
        tournamentId, 
        winnerId,
        participantCount: finalPositions.length
      });
      
      const tx = await this.contract.completeTournament(
        tournamentId,
        winnerId,
        finalPositions
      );
      
      const receipt = await tx.wait();
      
      this.logger.info('Tournament completed successfully', { 
        action: 'completeTournament',
        tournamentId,
        winnerId,
        transactionHash: receipt?.hash || tx.hash
      });
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      this.logger.error('Failed to complete tournament on blockchain', { 
        action: 'completeTournament',
        error: error instanceof Error ? error.message : error,
        tournamentId,
        winnerId
      });
      throw new Error(`Failed to complete tournament on blockchain: ${error}`);
    }
  }

  /**
   * Get tournament details from blockchain
   */
  async getTournament(tournamentId: number): Promise<BlockchainTournament> {
    try {
      const result = await this.contract.getTournament(tournamentId);
      
      return {
        id: Number(result.id),
        name: result.name,
        description: result.description,
        creator: result.creator,
        createdAt: Number(result.createdAt),
        completedAt: Number(result.completedAt),
        maxParticipants: Number(result.maxParticipants),
        currentParticipants: Number(result.currentParticipants),
        status: this.mapTournamentStatus(Number(result.status)),
        isVerified: result.isVerified
      };
    } catch (error) {
      this.logger.error('Failed to get tournament from blockchain', { 
        action: 'getTournament',
        error: error instanceof Error ? error.message : error,
        tournamentId
      });
      throw new Error(`Failed to get tournament from blockchain: ${error}`);
    }
  }

  /**
   * Get match details from blockchain
   */
  async getMatch(matchId: number): Promise<BlockchainMatch> {
    try {
      const result = await this.contract.getMatch(matchId);
      
      return {
        id: Number(result.id),
        tournamentId: Number(result.tournamentId),
        round: Number(result.round),
        player1Id: result.player1Id,
        player2Id: result.player2Id,
        winnerId: result.winnerId,
        player1Score: Number(result.player1Score),
        player2Score: Number(result.player2Score),
        completedAt: Number(result.completedAt),
        status: this.mapMatchStatus(Number(result.status)),
        resultHash: result.resultHash
      };
    } catch (error) {
      this.logger.error('Failed to get match from blockchain', { 
        action: 'getMatch',
        error: error instanceof Error ? error.message : error,
        matchId
      });
      throw new Error(`Failed to get match from blockchain: ${error}`);
    }
  }

  /**
   * Get user achievements from blockchain
   */
  async getUserAchievements(userId: string): Promise<BlockchainAchievement[]> {
    try {
      const results = await this.contract.getUserAchievements(userId);
      
      return results.map(achievement => ({
        tournamentId: Number(achievement.tournamentId),
        userId: achievement.userId,
        achievementType: achievement.achievementType,
        timestamp: Number(achievement.timestamp),
        score: Number(achievement.score),
        proofHash: achievement.proofHash
      }));
    } catch (error) {
      this.logger.error('Failed to get user achievements from blockchain', { 
        action: 'getUserAchievements',
        error: error instanceof Error ? error.message : error,
        userId
      });
      throw new Error(`Failed to get user achievements from blockchain: ${error}`);
    }
  }

  /**
   * Get user tournament history from blockchain
   */
  async getUserTournaments(userId: string): Promise<number[]> {
    try {
      const results = await this.contract.getUserTournaments(userId);
      return results.map(id => Number(id));
    } catch (error) {
      this.logger.error('Failed to get user tournaments from blockchain', { 
        action: 'getUserTournaments',
        error: error instanceof Error ? error.message : error,
        userId
      });
      throw new Error(`Failed to get user tournaments from blockchain: ${error}`);
    }
  }

  /**
   * Verify a match result on the blockchain
   */
  async verifyMatchResult(resultHash: string): Promise<boolean> {
    try {
      return await this.contract.verifyMatchResult(resultHash);
    } catch (error) {
      this.logger.error('Failed to verify match result on blockchain', { 
        action: 'verifyMatchResult',
        error: error instanceof Error ? error.message : error,
        resultHash
      });
      throw new Error(`Failed to verify match result on blockchain: ${error}`);
    }
  }

  /**
   * Get current tournament count
   */
  async getTournamentCount(): Promise<number> {
    try {
      const count = await this.contract.getTournamentCount();
      return Number(count);
    } catch (error) {
      this.logger.error('Failed to get tournament count from blockchain', { 
        action: 'getTournamentCount',
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to get tournament count from blockchain: ${error}`);
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      this.logger.error('Failed to get network info', { 
        action: 'getNetworkInfo',
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to get network info: ${error}`);
    }
  }

  /**
   * Check if contract is deployed and accessible
   */
  async isContractDeployed(): Promise<boolean> {
    try {
      const code = await this.provider.getCode(this.contractAddress);
      return code !== "0x";
    } catch (error) {
      this.logger.error('Failed to check contract deployment', { 
        action: 'isContractDeployed',
        error: error instanceof Error ? error.message : error,
        contractAddress: this.contractAddress
      });
      return false;
    }
  }

  private mapTournamentStatus(status: number): "WAITING" | "ACTIVE" | "COMPLETED" | "CANCELLED" {
    switch (status) {
      case 0: return "WAITING";
      case 1: return "ACTIVE";
      case 2: return "COMPLETED";
      case 3: return "CANCELLED";
      default: return "WAITING";
    }
  }

  private mapMatchStatus(status: number): "WAITING" | "ACTIVE" | "COMPLETED" {
    switch (status) {
      case 0: return "WAITING";
      case 1: return "ACTIVE";
      case 2: return "COMPLETED";
      default: return "WAITING";
    }
  }
}
