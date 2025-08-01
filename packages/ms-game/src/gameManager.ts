import { PongGame } from './game.js';
import { PlayerConnection, WebSocketMessage, AuthUser, GameMode } from './types.js';
import { AuthService } from './auth.js';
import { env } from './env.js';
import { v4 as uuidv4 } from 'uuid';

export class GameManager {
  private games: Map<string, PongGame> = new Map();
  private players: Map<string, PlayerConnection> = new Map();
  private waitingPlayers: Set<string> = new Set();
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async addPlayer(socket: any, request: any, gameMode: GameMode = { type: 'multiplayer', requiresAuth: true, maxPlayers: 2 }): Promise<{ success: boolean; playerId?: string; error?: string }> {
    const playerId = uuidv4();
    
    let isAuthenticated = false;
    let user: AuthUser | undefined;

    // Check authentication if required
    if (gameMode.requiresAuth) {
      const authResult = await this.authService.authenticateConnection(request);
      isAuthenticated = authResult.isAuthenticated;
      user = authResult.user;

      if (!isAuthenticated) {
        return { success: false, error: 'Authentication required' };
      }
    } else {
      // This case is for non-authed modes, which are now frontend only.
      // We can keep a simplified version for potential future use or testing.
      isAuthenticated = true;
      user = {
        id: playerId,
        username: `Guest_${playerId.substring(0, 8)}`,
        email: 'guest@game.com'
      };
    }

    const player: PlayerConnection = {
      id: playerId,
      socket,
      userId: user?.id,
      username: user?.username,
      isAuthenticated
    };

    this.players.set(playerId, player);

    // Handle different game modes
    switch (gameMode.type) {
      case 'multiplayer':
        this.waitingPlayers.add(playerId);
        this.sendToPlayer(playerId, {
          type: 'connected',
          data: { playerId, gameMode: 'multiplayer', user }
        });
        this.matchPlayers();
        break;
      
      case 'tournament':
        // Tournament logic would be handled here
        this.sendToPlayer(playerId, {
          type: 'connected',
          data: { playerId, gameMode: 'tournament', user }
        });
        break;
    }

    console.log(`Player ${playerId} (${user?.username}) connected - Mode: ${gameMode.type}`);
    return { success: true, playerId };
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
    }

    this.waitingPlayers.delete(playerId);

    if (player.gameId) {
      const game = this.games.get(player.gameId);
      if (game) {
        game.removePlayer(playerId);
        
        this.broadcastToGame(player.gameId, {
          type: 'playerLeft',
          data: { playerId, username: player.username }
        }, playerId);

        if (game.playerCount === 0) {
          game.cleanup();
          this.games.delete(player.gameId);
        }
      }
    }

    this.players.delete(playerId);
    console.log(`Player ${playerId} (${player.username}) disconnected`);
  }

  private matchPlayers(): void {
    const waitingPlayerIds = Array.from(this.waitingPlayers);
    
    if (waitingPlayerIds.length >= 2) {
      const gameId = uuidv4();
      const game = new PongGame(gameId);
      
      const player1Id = waitingPlayerIds[0];
      const player2Id = waitingPlayerIds[1];
      
      const player1 = this.players.get(player1Id);
      const player2 = this.players.get(player2Id);

      if (player1 && player2) {
        game.addPlayer(player1Id);
        game.addPlayer(player2Id);

        player1.gameId = gameId;
        player2.gameId = gameId;

        this.waitingPlayers.delete(player1Id);
        this.waitingPlayers.delete(player2Id);

        this.games.set(gameId, game);

        this.sendToPlayer(player1Id, {
          type: 'gameJoined',
          data: { 
            gameId, 
            position: 'left',
            opponent: { id: player2Id, username: player2.username }
          }
        });

        this.sendToPlayer(player2Id, {
          type: 'gameJoined',
          data: { 
            gameId, 
            position: 'right',
            opponent: { id: player1Id, username: player1.username }
          }
        });

        this.startGameUpdates(gameId);
        
        console.log(`Game ${gameId} started between ${player1.username} and ${player2.username}`);
      }
    }
  }

  handlePlayerMessage(playerId: string, message: WebSocketMessage): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (message.type) {
      case 'move':
        if (player.gameId) {
          const game = this.games.get(player.gameId);
          if (game && message.data?.direction) {
            game.movePaddle(playerId, message.data.direction);
          }
        }
        break;
      case 'ping':
        this.sendToPlayer(playerId, { type: 'pong' });
        break;
    }
  }

  private startGameUpdates(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const updateInterval = setInterval(() => {
      const gameExists = this.games.has(gameId);
      if (!gameExists || game.playerCount < 2) {
        clearInterval(updateInterval);
        return;
      }

      const gameState = game.getSerializableGameState();
      this.broadcastToGame(gameId, { type: 'gameState', data: gameState });

      if (game.status === 'finished') {
        clearInterval(updateInterval);
        this.broadcastToGame(gameId, {
          type: 'gameFinished',
          data: { winner: gameState.winner, finalScore: gameState.score }
        });
      }
    }, 1000 / 60);
  }

  private sendToPlayer(playerId: string, message: WebSocketMessage): void {
    const player = this.players.get(playerId);
    if (player && player.socket.readyState === 1) {
      try {
        player.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to player ${playerId}:`, error);
        this.removePlayer(playerId);
      }
    }
  }

  private broadcastToGame(gameId: string, message: WebSocketMessage, excludePlayerId?: string): void {
    for (const [playerId, player] of this.players.entries()) {
      if (player.gameId === gameId && playerId !== excludePlayerId) {
        this.sendToPlayer(playerId, message);
      }
    }
  }

  getWaitingPlayersCount(): number {
    return this.waitingPlayers.size;
  }

  getActiveGamesCount(): number {
    return this.games.size;
  }
}
