// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TournamentScoring
 * @dev Smart contract for immutable tournament score storage on Avalanche network
 * @notice This contract provides tamper-proof storage for tournament results and achievements
 */
contract TournamentScoring is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Tournament counter for unique IDs
    Counters.Counter private _tournamentIds;
    
    // Tournament structure
    struct Tournament {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 createdAt;
        uint256 completedAt;
        uint8 maxParticipants;
        uint8 currentParticipants;
        TournamentStatus status;
        string[] participantAddresses;
        mapping(string => ParticipantData) participants;
        uint256[] matchIds;
        bool isVerified;
    }
    
    // Participant data structure
    struct ParticipantData {
        string userId;
        string displayName;
        string participantType; // "HUMAN" or "AI"
        uint256 joinedAt;
        uint8 finalPosition;
        bool eliminated;
        uint256 totalScore;
        uint256 matchesWon;
        uint256 matchesLost;
    }
    
    // Match structure
    struct Match {
        uint256 id;
        uint256 tournamentId;
        uint8 round;
        string player1Id;
        string player2Id;
        string winnerId;
        uint256 player1Score;
        uint256 player2Score;
        uint256 completedAt;
        MatchStatus status;
        bytes32 resultHash; // Hash of match result for verification
    }
    
    // Achievement structure
    struct Achievement {
        uint256 tournamentId;
        string userId;
        string achievementType; // "WINNER", "RUNNER_UP", "SEMI_FINALIST", etc.
        uint256 timestamp;
        uint256 score;
        bytes32 proofHash;
    }
    
    // Enums
    enum TournamentStatus { WAITING, ACTIVE, COMPLETED, CANCELLED }
    enum MatchStatus { WAITING, ACTIVE, COMPLETED }
    
    // Storage mappings
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => Match) public matches;
    mapping(string => Achievement[]) public userAchievements;
    mapping(string => uint256[]) public userTournaments;
    mapping(bytes32 => bool) public verifiedResults;
    
    // Events
    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        address indexed creator,
        uint256 timestamp
    );
    
    event TournamentCompleted(
        uint256 indexed tournamentId,
        string winner,
        uint256 timestamp
    );
    
    event MatchCompleted(
        uint256 indexed matchId,
        uint256 indexed tournamentId,
        string indexed winnerId,
        uint256 player1Score,
        uint256 player2Score,
        uint256 timestamp
    );
    
    event AchievementRecorded(
        uint256 indexed tournamentId,
        string indexed userId,
        string achievementType,
        uint256 score,
        uint256 timestamp
    );
    
    event ResultVerified(
        uint256 indexed tournamentId,
        bytes32 indexed resultHash,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyTournamentCreator(uint256 tournamentId) {
        require(tournaments[tournamentId].creator == msg.sender, "Not tournament creator");
        _;
    }
    
    modifier tournamentExists(uint256 tournamentId) {
        require(tournamentId > 0 && tournamentId <= _tournamentIds.current(), "Tournament does not exist");
        _;
    }
    
    modifier matchExists(uint256 matchId) {
        require(matches[matchId].id > 0, "Match does not exist");
        _;
    }
    
    /**
     * @dev Create a new tournament on the blockchain
     * @param name Tournament name
     * @param description Tournament description
     * @param maxParticipants Maximum number of participants
     * @return tournamentId The unique tournament ID
     */
    function createTournament(
        string memory name,
        string memory description,
        uint8 maxParticipants
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Tournament name cannot be empty");
        require(maxParticipants >= 4 && maxParticipants <= 8, "Invalid participant count");
        
        _tournamentIds.increment();
        uint256 tournamentId = _tournamentIds.current();
        
        Tournament storage tournament = tournaments[tournamentId];
        tournament.id = tournamentId;
        tournament.name = name;
        tournament.description = description;
        tournament.creator = msg.sender;
        tournament.createdAt = block.timestamp;
        tournament.maxParticipants = maxParticipants;
        tournament.currentParticipants = 0;
        tournament.status = TournamentStatus.WAITING;
        tournament.isVerified = false;
        
        emit TournamentCreated(tournamentId, name, msg.sender, block.timestamp);
        
        return tournamentId;
    }
    
    /**
     * @dev Add a participant to a tournament
     * @param tournamentId Tournament ID
     * @param userId User ID from the application
     * @param displayName User's display name
     * @param participantType "HUMAN" or "AI"
     */
    function addParticipant(
        uint256 tournamentId,
        string memory userId,
        string memory displayName,
        string memory participantType
    ) external onlyTournamentCreator(tournamentId) {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.WAITING, "Tournament not accepting participants");
        require(tournament.currentParticipants < tournament.maxParticipants, "Tournament is full");
        require(bytes(tournament.participants[userId].userId).length == 0, "User already registered");
        
        tournament.participants[userId] = ParticipantData({
            userId: userId,
            displayName: displayName,
            participantType: participantType,
            joinedAt: block.timestamp,
            finalPosition: 0,
            eliminated: false,
            totalScore: 0,
            matchesWon: 0,
            matchesLost: 0
        });
        
        tournament.participantAddresses.push(userId);
        tournament.currentParticipants++;
        
        userTournaments[userId].push(tournamentId);
    }
    
    /**
     * @dev Start a tournament
     * @param tournamentId Tournament ID
     */
    function startTournament(uint256 tournamentId) 
        external 
        onlyTournamentCreator(tournamentId) 
        tournamentExists(tournamentId) 
    {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.WAITING, "Tournament already started");
        require(tournament.currentParticipants >= 4, "Not enough participants");
        
        tournament.status = TournamentStatus.ACTIVE;
    }
    
    /**
     * @dev Record a match result
     * @param tournamentId Tournament ID
     * @param round Match round number
     * @param player1Id Player 1 ID
     * @param player2Id Player 2 ID
     * @param winnerId Winner ID
     * @param player1Score Player 1 score
     * @param player2Score Player 2 score
     * @param resultHash Hash of the match result for verification
     */
    function recordMatchResult(
        uint256 tournamentId,
        uint8 round,
        string memory player1Id,
        string memory player2Id,
        string memory winnerId,
        uint256 player1Score,
        uint256 player2Score,
        bytes32 resultHash
    ) external onlyTournamentCreator(tournamentId) nonReentrant {
        require(tournaments[tournamentId].status == TournamentStatus.ACTIVE, "Tournament not active");
        require(
            keccak256(abi.encodePacked(winnerId)) == keccak256(abi.encodePacked(player1Id)) ||
            keccak256(abi.encodePacked(winnerId)) == keccak256(abi.encodePacked(player2Id)),
            "Invalid winner"
        );
        
        _tournamentIds.increment();
        uint256 matchId = _tournamentIds.current();
        
        matches[matchId] = Match({
            id: matchId,
            tournamentId: tournamentId,
            round: round,
            player1Id: player1Id,
            player2Id: player2Id,
            winnerId: winnerId,
            player1Score: player1Score,
            player2Score: player2Score,
            completedAt: block.timestamp,
            status: MatchStatus.COMPLETED,
            resultHash: resultHash
        });
        
        tournaments[tournamentId].matchIds.push(matchId);
        
        // Update participant stats
        Tournament storage tournament = tournaments[tournamentId];
        tournament.participants[winnerId].matchesWon++;
        tournament.participants[winnerId].totalScore += (keccak256(abi.encodePacked(winnerId)) == keccak256(abi.encodePacked(player1Id)) ? player1Score : player2Score);
        
        string memory loserId = (keccak256(abi.encodePacked(winnerId)) == keccak256(abi.encodePacked(player1Id))) ? player2Id : player1Id;
        
        tournament.participants[loserId].totalScore += (keccak256(abi.encodePacked(loserId)) == keccak256(abi.encodePacked(player1Id)) ? player1Score : player2Score);
        
        // Mark loser as eliminated in single-elimination
        tournament.participants[loserId].eliminated = true;
        
        // Mark result as verified
        verifiedResults[resultHash] = true;
        
        emit MatchCompleted(matchId, tournamentId, winnerId, player1Score, player2Score, block.timestamp);
        emit ResultVerified(tournamentId, resultHash, block.timestamp);
    }
    
    /**
     * @dev Complete a tournament and record final standings
     * @param tournamentId Tournament ID
     * @param winnerId Winner's user ID
     * @param finalPositions Array of user IDs in final position order
     */
    function completeTournament(
        uint256 tournamentId,
        string memory winnerId,
        string[] memory finalPositions
    ) external onlyTournamentCreator(tournamentId) {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.ACTIVE, "Tournament not active");
        require(finalPositions.length == tournament.currentParticipants, "Invalid position count");
        
        tournament.status = TournamentStatus.COMPLETED;
        tournament.completedAt = block.timestamp;
        tournament.isVerified = true;
        
        // Record final positions and achievements
        for (uint8 i = 0; i < finalPositions.length; i++) {
            string memory userId = finalPositions[i];
            tournament.participants[userId].finalPosition = i + 1;
            
            // Record achievements
            string memory achievementType = "";
            if (i == 0) achievementType = "WINNER";
            else if (i == 1) achievementType = "RUNNER_UP";
            else if (i <= 3) achievementType = "SEMI_FINALIST";
            else achievementType = "PARTICIPANT";
            
            Achievement memory achievement = Achievement({
                tournamentId: tournamentId,
                userId: userId,
                achievementType: achievementType,
                timestamp: block.timestamp,
                score: tournament.participants[userId].totalScore,
                proofHash: keccak256(abi.encodePacked(tournamentId, userId, achievementType, block.timestamp))
            });
            
            userAchievements[userId].push(achievement);
            
            emit AchievementRecorded(
                tournamentId,
                userId,
                achievementType,
                tournament.participants[userId].totalScore,
                block.timestamp
            );
        }
        
        emit TournamentCompleted(tournamentId, winnerId, block.timestamp);
    }
    
    /**
     * @dev Get tournament details
     * @param tournamentId Tournament ID
     * @return id Tournament ID
     * @return name Tournament name
     * @return description Tournament description
     * @return creator Tournament creator address
     * @return createdAt Tournament creation timestamp
     * @return completedAt Tournament completion timestamp
     * @return maxParticipants Maximum number of participants
     * @return currentParticipants Current number of participants
     * @return status Tournament status
     * @return isVerified Whether tournament is verified
     */
    function getTournament(uint256 tournamentId) 
        external 
        view 
        tournamentExists(tournamentId) 
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address creator,
            uint256 createdAt,
            uint256 completedAt,
            uint8 maxParticipants,
            uint8 currentParticipants,
            TournamentStatus status,
            bool isVerified
        ) 
    {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.id,
            tournament.name,
            tournament.description,
            tournament.creator,
            tournament.createdAt,
            tournament.completedAt,
            tournament.maxParticipants,
            tournament.currentParticipants,
            tournament.status,
            tournament.isVerified
        );
    }
    
    /**
     * @dev Get user's achievements
     * @param userId User ID
     * @return Array of user achievements
     */
    function getUserAchievements(string memory userId) 
        external 
        view 
        returns (Achievement[] memory) 
    {
        return userAchievements[userId];
    }
    
    /**
     * @dev Get user's tournament history
     * @param userId User ID
     * @return Array of tournament IDs
     */
    function getUserTournaments(string memory userId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTournaments[userId];
    }
    
    /**
     * @dev Verify a match result
     * @param resultHash Hash of the match result
     * @return Boolean indicating if result is verified
     */
    function verifyMatchResult(bytes32 resultHash) external view returns (bool) {
        return verifiedResults[resultHash];
    }
    
    /**
     * @dev Get current tournament count
     * @return Current number of tournaments
     */
    function getTournamentCount() external view returns (uint256) {
        return _tournamentIds.current();
    }
    
    /**
     * @dev Get match details
     * @param matchId Match ID
     * @return id Match ID
     * @return tournamentId Tournament ID
     * @return round Round number
     * @return player1Id Player 1 ID
     * @return player2Id Player 2 ID
     * @return winnerId Winner ID
     * @return player1Score Player 1 score
     * @return player2Score Player 2 score
     * @return completedAt Match completion timestamp
     * @return status Match status
     * @return resultHash Result hash
     */
    function getMatch(uint256 matchId) 
        external 
        view 
        matchExists(matchId) 
        returns (
            uint256 id,
            uint256 tournamentId,
            uint8 round,
            string memory player1Id,
            string memory player2Id,
            string memory winnerId,
            uint256 player1Score,
            uint256 player2Score,
            uint256 completedAt,
            MatchStatus status,
            bytes32 resultHash
        ) 
    {
        Match storage matchData = matches[matchId];
        return (
            matchData.id,
            matchData.tournamentId,
            matchData.round,
            matchData.player1Id,
            matchData.player2Id,
            matchData.winnerId,
            matchData.player1Score,
            matchData.player2Score,
            matchData.completedAt,
            matchData.status,
            matchData.resultHash
        );
    }
}
