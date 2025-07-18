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

  constructor(
    rpcUrl: string,
    contractAddress: string,
    privateKey?: string
  ) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      throw new Error("Private key required for blockchain transactions");
    }
    
    this.contract = new ethers.Contract(
      contractAddress,
      TournamentScoringABI,
      this.signer
    ) as TournamentScoring;
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
      console.log(`Creating tournament on blockchain: ${name}`);
      
      const tx = await this.contract.createTournament(
        name,
        description,
        maxParticipants
      );
      
      const receipt = await tx.wait();
      
      // Extract tournament ID from events
      const tournamentId = await this.contract.getTournamentCount();
      
      console.log(`Tournament created with ID: ${tournamentId}`);
      
      return {
        tournamentId: Number(tournamentId),
        transactionHash: receipt?.hash || tx.hash
      };
    } catch (error) {
      console.error("Error creating tournament on blockchain:", error);
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
      console.log(`Adding participant to tournament ${tournamentId}: ${displayName}`);
      
      const tx = await this.contract.addParticipant(
        tournamentId,
        userId,
        displayName,
        participantType
      );
      
      const receipt = await tx.wait();
      
      console.log(`Participant added successfully`);
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error("Error adding participant to blockchain:", error);
      throw new Error(`Failed to add participant to blockchain: ${error}`);
    }
  }

  /**
   * Start a tournament on the blockchain
   */
  async startTournament(tournamentId: number): Promise<string> {
    try {
      console.log(`Starting tournament ${tournamentId} on blockchain`);
      
      const tx = await this.contract.startTournament(tournamentId);
      const receipt = await tx.wait();
      
      console.log(`Tournament started successfully`);
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error("Error starting tournament on blockchain:", error);
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
      console.log(`Recording match result for tournament ${tournamentId}`);
      
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
      
      console.log(`Match result recorded successfully`);
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error("Error recording match result on blockchain:", error);
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
      console.log(`Completing tournament ${tournamentId} on blockchain`);
      
      const tx = await this.contract.completeTournament(
        tournamentId,
        winnerId,
        finalPositions
      );
      
      const receipt = await tx.wait();
      
      console.log(`Tournament completed successfully`);
      
      return receipt?.hash || tx.hash;
    } catch (error) {
      console.error("Error completing tournament on blockchain:", error);
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
        maxParticipants: result.maxParticipants,
        currentParticipants: result.currentParticipants,
        status: this.mapTournamentStatus(result.status),
        isVerified: result.isVerified
      };
    } catch (error) {
      console.error("Error getting tournament from blockchain:", error);
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
        round: result.round,
        player1Id: result.player1Id,
        player2Id: result.player2Id,
        winnerId: result.winnerId,
        player1Score: Number(result.player1Score),
        player2Score: Number(result.player2Score),
        completedAt: Number(result.completedAt),
        status: this.mapMatchStatus(result.status),
        resultHash: result.resultHash
      };
    } catch (error) {
      console.error("Error getting match from blockchain:", error);
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
      console.error("Error getting user achievements from blockchain:", error);
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
      console.error("Error getting user tournaments from blockchain:", error);
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
      console.error("Error verifying match result on blockchain:", error);
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
      console.error("Error getting tournament count from blockchain:", error);
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
      console.error("Error getting network info:", error);
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
      console.error("Error checking contract deployment:", error);
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
