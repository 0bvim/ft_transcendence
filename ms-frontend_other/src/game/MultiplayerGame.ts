import { authApi } from '../api/auth';

interface GameState {
  ball: {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
  };
  player1: { y: number; score: number };
  player2: { y: number; score: number };
  gameStatus: 'waiting' | 'ready' | 'playing' | 'paused' | 'finished';
  winner?: string;
}

interface Player {
  id: string;
  name: string;
}

export class MultiplayerGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ws: WebSocket | null = null;
  private gameState: GameState | null = null;
  private isPlayer1: boolean = false;
  private currentUser: any = null;
  private matchId: string;
  private onGameEnd?: (winner: string, scores: any) => void;
  private onStatusChange?: (status: string) => void;

  // Game constants
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 400;
  private readonly PADDLE_WIDTH = 10;
  private readonly PADDLE_HEIGHT = 100;
  private readonly BALL_SIZE = 10;

  // Input handling
  private keys: { [key: string]: boolean } = {};
  private lastPaddleY = 150;

  constructor(canvas: HTMLCanvasElement, matchId: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.matchId = matchId;
    
    // Set canvas size
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    
    this.setupInputHandlers();
  }

  async connect(): Promise<void> {
    try {
      // Get current user info for authentication
      const profileResponse = await authApi.getProfile();
      this.currentUser = profileResponse.user;
      
      // Create WebSocket connection with authentication headers
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:3002/ws/match/${this.matchId}`;
      
      this.ws = new WebSocket(wsUrl);
      
      // Add authentication headers (WebSocket doesn't support custom headers directly)
      // We'll send auth info in the first message instead
      
      this.ws.onopen = () => {
        console.log('Connected to multiplayer match');
        this.onStatusChange?.('Connected to match...');
        
        // Send authentication info
        this.sendMessage({
          type: 'authenticate',
          userId: this.currentUser.id,
          displayName: this.currentUser.displayName,
          token: localStorage.getItem('accessToken')
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.onStatusChange?.('Connection lost');
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onStatusChange?.('Connection error');
      };
      
    } catch (error) {
      console.error('Failed to connect to multiplayer match:', error);
      this.onStatusChange?.('Failed to connect');
    }
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'match_ready':
        this.onStatusChange?.('Match ready! Press SPACE when ready to play');
        this.isPlayer1 = data.players.player1.id === this.currentUser.id;
        this.drawWaitingScreen(data.players);
        break;
        
      case 'game_start':
        this.gameState = data.gameState;
        this.onStatusChange?.('Game started! Use W/S or Arrow keys to move');
        this.startGameLoop();
        break;
        
      case 'game_state':
        this.gameState = data.gameState;
        break;
        
      case 'game_end':
        this.onStatusChange?.(`Game finished! Winner: ${data.winner}`);
        this.onGameEnd?.(data.winner, data.finalScore);
        break;
        
      case 'player_disconnected':
        this.onStatusChange?.('Opponent disconnected');
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private setupInputHandlers(): void {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Ready up with space
      if (e.key === ' ' && this.gameState?.gameStatus === 'ready') {
        this.sendMessage({ type: 'ready' });
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private startGameLoop(): void {
    const gameLoop = () => {
      if (this.gameState?.gameStatus === 'playing') {
        this.handleInput();
        this.render();
        requestAnimationFrame(gameLoop);
      }
    };
    gameLoop();
  }

  private handleInput(): void {
    if (!this.gameState) return;

    let paddleY = this.isPlayer1 ? this.gameState.player1.y : this.gameState.player2.y;
    const paddleSpeed = 5;

    // Handle paddle movement
    if (this.keys['w'] || this.keys['arrowup']) {
      paddleY = Math.max(0, paddleY - paddleSpeed);
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      paddleY = Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, paddleY + paddleSpeed);
    }

    // Send input if paddle moved
    if (paddleY !== this.lastPaddleY) {
      this.lastPaddleY = paddleY;
      this.sendMessage({
        type: 'player_input',
        paddleY: paddleY
      });
    }
  }

  private render(): void {
    if (!this.gameState) return;

    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Draw center line
    this.ctx.strokeStyle = '#fff';
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.CANVAS_WIDTH / 2, 0);
    this.ctx.lineTo(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
    this.ctx.fillStyle = '#fff';
    
    // Player 1 paddle (left)
    this.ctx.fillRect(10, this.gameState.player1.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    
    // Player 2 paddle (right)
    this.ctx.fillRect(
      this.CANVAS_WIDTH - 20, 
      this.gameState.player2.y, 
      this.PADDLE_WIDTH, 
      this.PADDLE_HEIGHT
    );

    // Draw ball
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(
      this.gameState.ball.x - this.BALL_SIZE / 2,
      this.gameState.ball.y - this.BALL_SIZE / 2,
      this.BALL_SIZE,
      this.BALL_SIZE
    );

    // Draw scores
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      this.gameState.player1.score.toString(),
      this.CANVAS_WIDTH / 4,
      60
    );
    this.ctx.fillText(
      this.gameState.player2.score.toString(),
      (3 * this.CANVAS_WIDTH) / 4,
      60
    );

    // Highlight current player's paddle
    if (this.isPlayer1) {
      this.ctx.strokeStyle = '#0f0';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(8, this.gameState.player1.y - 2, this.PADDLE_WIDTH + 4, this.PADDLE_HEIGHT + 4);
    } else {
      this.ctx.strokeStyle = '#0f0';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        this.CANVAS_WIDTH - 22, 
        this.gameState.player2.y - 2, 
        this.PADDLE_WIDTH + 4, 
        this.PADDLE_HEIGHT + 4
      );
    }
  }

  private drawWaitingScreen(players: { player1: Player; player2: Player }): void {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Draw waiting message
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    
    this.ctx.fillText('MULTIPLAYER MATCH', this.CANVAS_WIDTH / 2, 100);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText(
      `${players.player1.name} vs ${players.player2.name}`,
      this.CANVAS_WIDTH / 2,
      140
    );
    
    this.ctx.fillText(
      'Press SPACE when ready to play',
      this.CANVAS_WIDTH / 2,
      200
    );
    
    this.ctx.fillText(
      'Controls: W/S or Arrow Keys',
      this.CANVAS_WIDTH / 2,
      240
    );

    // Highlight current player
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillText(
      `You are: ${this.isPlayer1 ? players.player1.name : players.player2.name}`,
      this.CANVAS_WIDTH / 2,
      280
    );
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  setOnGameEnd(callback: (winner: string, scores: any) => void): void {
    this.onGameEnd = callback;
  }

  setOnStatusChange(callback: (status: string) => void): void {
    this.onStatusChange = callback;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
