import { GameState, PaddleState, BallState, GameConfig, WebSocketMessage } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class PongGame {
  private gameState: GameState;
  private config: GameConfig;
  private updateInterval?: NodeJS.Timeout;
  private lastUpdateTime: number = 0;

  constructor(gameId?: string) {
    this.config = {
      canvasWidth: 800,
      canvasHeight: 400,
      paddleWidth: 15,
      paddleHeight: 80,
      paddleSpeed: 5,
      ballRadius: 8,
      ballSpeed: 4,
      maxScore: 5
    };

    this.gameState = {
      id: gameId || uuidv4(),
      players: new Map(),
      ball: this.createBall(),
      score: {},
      status: 'waiting',
      createdAt: new Date(),
      lastUpdate: new Date()
    };
  }

  private createBall(): BallState {
    return {
      x: this.config.canvasWidth / 2,
      y: this.config.canvasHeight / 2,
      vx: Math.random() > 0.5 ? this.config.ballSpeed : -this.config.ballSpeed,
      vy: (Math.random() - 0.5) * this.config.ballSpeed,
      radius: this.config.ballRadius,
      speed: this.config.ballSpeed
    };
  }

  private createPaddle(playerId: string, position: 'left' | 'right'): PaddleState {
    const x = position === 'left' ? 20 : this.config.canvasWidth - 20 - this.config.paddleWidth;
    
    return {
      id: playerId,
      x,
      y: this.config.canvasHeight / 2 - this.config.paddleHeight / 2,
      width: this.config.paddleWidth,
      height: this.config.paddleHeight,
      speed: this.config.paddleSpeed,
      position
    };
  }

  addPlayer(playerId: string): boolean {
    if (this.gameState.players.size >= 2) {
      return false; // Game is full
    }

    const position = this.gameState.players.size === 0 ? 'left' : 'right';
    const paddle = this.createPaddle(playerId, position);
    
    this.gameState.players.set(playerId, paddle);
    this.gameState.score[playerId] = 0;

    // Start the game if we have 2 players
    if (this.gameState.players.size === 2) {
      this.startGame();
    }

    return true;
  }

  removePlayer(playerId: string): void {
    this.gameState.players.delete(playerId);
    delete this.gameState.score[playerId];

    if (this.gameState.players.size < 2 && this.gameState.status === 'playing') {
      this.pauseGame();
    }

    if (this.gameState.players.size === 0) {
      this.stopGame();
    }
  }

  movePaddle(playerId: string, direction: 'up' | 'down'): void {
    const paddle = this.gameState.players.get(playerId);
    if (!paddle || this.gameState.status !== 'playing') return;

    const moveDistance = direction === 'up' ? -paddle.speed : paddle.speed;
    const newY = paddle.y + moveDistance;

    // Keep paddle within bounds
    paddle.y = Math.max(0, Math.min(newY, this.config.canvasHeight - paddle.height));
  }

  private startGame(): void {
    this.gameState.status = 'playing';
    this.lastUpdateTime = Date.now();
    
    this.updateInterval = setInterval(() => {
      this.updateGame();
    }, 1000 / 60); // 60 FPS
  }

  private pauseGame(): void {
    this.gameState.status = 'paused';
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  private stopGame(): void {
    this.gameState.status = 'finished';
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  private updateGame(): void {
    if (this.gameState.status !== 'playing') return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;

    this.updateBall(deltaTime);
    this.checkCollisions();
    this.checkScore();
    
    this.gameState.lastUpdate = new Date();
  }

  private updateBall(deltaTime: number): void {
    const ball = this.gameState.ball;
    
    ball.x += ball.vx * deltaTime * 60; // Normalize for 60 FPS
    ball.y += ball.vy * deltaTime * 60;

    // Bounce off top and bottom walls
    if (ball.y <= ball.radius || ball.y >= this.config.canvasHeight - ball.radius) {
      ball.vy = -ball.vy;
      ball.y = Math.max(ball.radius, Math.min(ball.y, this.config.canvasHeight - ball.radius));
    }
  }

  private checkCollisions(): void {
    const ball = this.gameState.ball;

    for (const paddle of this.gameState.players.values()) {
      if (this.ballPaddleCollision(ball, paddle)) {
        // Reverse ball direction
        ball.vx = -ball.vx;
        
        // Add some variation based on where the ball hits the paddle
        const hitPosition = (ball.y - paddle.y) / paddle.height - 0.5;
        ball.vy += hitPosition * 2;
        
        // Increase speed slightly
        const speedMultiplier = 1.05;
        ball.vx *= speedMultiplier;
        ball.vy *= speedMultiplier;
        
        // Keep ball speed within reasonable limits
        const maxSpeed = this.config.ballSpeed * 2;
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed > maxSpeed) {
          ball.vx = (ball.vx / currentSpeed) * maxSpeed;
          ball.vy = (ball.vy / currentSpeed) * maxSpeed;
        }

        // Move ball away from paddle to prevent multiple collisions
        if (paddle.position === 'left') {
          ball.x = paddle.x + paddle.width + ball.radius;
        } else {
          ball.x = paddle.x - ball.radius;
        }
        
        break;
      }
    }
  }

  private ballPaddleCollision(ball: BallState, paddle: PaddleState): boolean {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
  }

  private checkScore(): void {
    const ball = this.gameState.ball;
    
    // Check if ball went off the left or right edge
    if (ball.x < 0 || ball.x > this.config.canvasWidth) {
      // Determine who scored
      const scoringPlayer = ball.x < 0 ? 
        Array.from(this.gameState.players.values()).find(p => p.position === 'right') :
        Array.from(this.gameState.players.values()).find(p => p.position === 'left');

      if (scoringPlayer) {
        this.gameState.score[scoringPlayer.id]++;
        
        // Check for winner
        if (this.gameState.score[scoringPlayer.id] >= this.config.maxScore) {
          this.gameState.winner = scoringPlayer.id;
          this.stopGame();
          return;
        }
      }

      // Reset ball
      this.gameState.ball = this.createBall();
    }
  }

  resumeGame(): void {
    if (this.gameState.status === 'paused' && this.gameState.players.size === 2) {
      this.startGame();
    }
  }

  getGameState(): GameState {
    return {
      ...this.gameState,
      players: new Map(this.gameState.players) // Create a copy
    };
  }

  getSerializableGameState(): any {
    return {
      id: this.id,
      status: this.status,
      players: Array.from(this.gameState.players.values()),
      ball: this.gameState.ball,
      score: this.gameState.score,
      winner: this.gameState.winner
    };
  }

  get playerCount(): number {
    return this.gameState.players.size;
  }

  get id(): string {
    return this.gameState.id;
  }

  get status(): string {
    return this.gameState.status;
  }

  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }
}
