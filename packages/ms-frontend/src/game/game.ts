import { GameState, PaddleState, BallState, GameConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PongGame {
  private gameState: GameState;
  private config: GameConfig;
  private updateInterval?: number;
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

    // In local modes, the game will be started explicitly
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

  startGameLoop(): void {
    this.gameState.status = 'playing';
    this.lastUpdateTime = Date.now();
    
    const gameLoop = () => {
      this.updateGame();
      this.updateInterval = requestAnimationFrame(gameLoop);
    };

    this.updateInterval = requestAnimationFrame(gameLoop);
  }

  pauseGame(): void {
    this.gameState.status = 'paused';
    if (this.updateInterval) {
      cancelAnimationFrame(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  stopGame(): void {
    this.gameState.status = 'finished';
    if (this.updateInterval) {
      cancelAnimationFrame(this.updateInterval);
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
        ball.vx = -ball.vx;
        
        const hitPosition = (ball.y - paddle.y) / paddle.height - 0.5;
        ball.vy += hitPosition * 2;
        
        const speedMultiplier = 1.05;
        ball.vx *= speedMultiplier;
        ball.vy *= speedMultiplier;
        
        const maxSpeed = this.config.ballSpeed * 2;
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed > maxSpeed) {
          ball.vx = (ball.vx / currentSpeed) * maxSpeed;
          ball.vy = (ball.vy / currentSpeed) * maxSpeed;
        }

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
    
    if (ball.x < 0 || ball.x > this.config.canvasWidth) {
      const scoringPlayer = ball.x < 0 ? 
        Array.from(this.gameState.players.values()).find(p => p.position === 'right') :
        Array.from(this.gameState.players.values()).find(p => p.position === 'left');

      if (scoringPlayer) {
        this.gameState.score[scoringPlayer.id]++;
        
        if (this.gameState.score[scoringPlayer.id] >= this.config.maxScore) {
          this.gameState.winner = scoringPlayer.id;
          this.stopGame();
          return;
        }
      }

      this.gameState.ball = this.createBall();
    }
  }

  setState(newState: GameState): void {
    this.gameState = newState;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  cleanup(): void {
    this.stopGame();
  }
}
