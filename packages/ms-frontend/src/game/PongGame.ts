import p5 from 'p5';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Board, Side } from './Board';
import { AI, AIDifficulty } from './AI';
export type { AIDifficulty };

export enum GameState {
  Loading,
  Ready,
  Playing,
  Paused,
  GameOver
}

export interface GameConfig {
  player1Name: string;
  player2Name: string;
  player1IsAI: boolean;
  player2IsAI: boolean;
  aiDifficulty: AIDifficulty;
  targetScore: number;
}

export interface GameCallbacks {
  onScoreUpdate: (player1Score: number, player2Score: number) => void;
  onGameStateChange: (state: GameState) => void;
  onGameEnd: (winner: string, finalScore: { player1: number; player2: number }) => void;
}

export class PongGame {
  private p5Instance: p5 | null = null;
  private ball: Ball | null = null;
  private player1: Paddle | null = null;
  private player2: Paddle | null = null;
  private ai1: AI | null = null;
  private ai2: AI | null = null;
  
  private gameState: GameState = GameState.Loading;
  private config: GameConfig;
  private callbacks: GameCallbacks;
  
  private keys: { [key:string]: boolean } = {};
  private scaleFactor = 1;

  // Time-based speed increase
  private lastSpeedIncreaseTime = 0;
  private readonly speedIncreaseInterval = 5000; // 5 seconds
  private readonly speedIncreaseFactor = 1.15; // 15% increase
  private readonly maxBallSpeed = Ball.startSpeed * 3;

  
  constructor(config: GameConfig, callbacks: GameCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  // Initialize the p5.js instance and attach to canvas container
  init(canvasContainer: HTMLElement): void {
    const sketch = (p: p5) => {
      p.setup = () => this.setup(p, canvasContainer);
      p.draw = () => this.draw(p);
      p.keyPressed = () => this.keyPressed(p);
      p.keyReleased = () => this.keyReleased(p);
      p.windowResized = () => this.handleResize(p, canvasContainer);
    };

    this.p5Instance = new p5(sketch, canvasContainer);
  }

  private setup(p: p5, container: HTMLElement): void {
    this.handleResize(p, container);
    p.noSmooth();

    // Initialize game objects
    this.initializeGameObjects();

    // Set initial state
    this.gameState = GameState.Ready;
    this.callbacks.onGameStateChange(this.gameState);

    // Setup keyboard event listeners
    this.setupKeyboardEvents();
  }

  private initializeGameObjects(): void {
    // Create paddles
    this.player1 = new Paddle(Board.backBorder, Board.height / 2);
    this.player2 = new Paddle(
      Board.width - Board.backBorder - Paddle.width,
      Board.height / 2
    );
    
    // Create ball
    this.ball = new Ball();
    this.ball.resetToCenter();
    
    // Create AI instances if needed
    if (this.config.player1IsAI && this.player1 && this.ball) {
      this.ai1 = new AI(this.ball, this.player1, this.player2!, this.config.aiDifficulty);
    }
    if (this.config.player2IsAI && this.player2 && this.ball) {
      this.ai2 = new AI(this.ball, this.player2, this.player1!, this.config.aiDifficulty);
    }
  }

  private draw(p: p5): void {
    if (!this.ball || !this.player1 || !this.player2) return;

    // Scale the canvas to fit the container
    p.scale(this.scaleFactor);
    p.background(0);

    // Draw game elements
    this.drawBackground(p);
    this.drawGameObjects(p);
    this.drawUI();

    // Update game logic
    if (this.gameState === GameState.Playing) {
      this.updateGame(p);
    }
  }

  private drawBackground(p: p5): void {
    // Draw center line
    p.stroke(100);
    p.strokeWeight(2);
    for (let i = 0; i < Board.height; i += 20) {
      p.line(Board.width / 2, i, Board.width / 2, i + 10);
    }
  }

  private drawGameObjects(p: p5): void {
    if (!this.ball || !this.player1 || !this.player2) return;
    
    // Draw paddles
    this.player1.draw(p);
    this.player2.draw(p);
    
    // Draw ball
    this.ball.draw(p);
  }

  private drawUI(): void {
    // All UI elements are now handled by the HTML overlay.
    // This function is kept to avoid breaking the rendering loop.
  }

  private updateGame(p: p5): void {
    if (!this.ball || !this.player1 || !this.player2) return;

    const currentTime = p.millis();

    // Increase ball speed over time
    if (currentTime - this.lastSpeedIncreaseTime > this.speedIncreaseInterval) {
      this.ball.increaseSpeed(this.speedIncreaseFactor, this.maxBallSpeed);
      this.lastSpeedIncreaseTime = currentTime;
    }
    
    // Update AI
    if (this.ai1) {
      this.ai1.update(this.ball, currentTime);
    }
    if (this.ai2) {
      this.ai2.update(this.ball, currentTime);
    }
    
    // Handle player input
    this.handlePlayerInput();
    
    // Update paddles
    this.player1.update();
    this.player2.update();
    
    // Update ball
    this.ball.update();
    
    // Check paddle collisions
    this.checkPaddleCollisions();
    
    // Check for scoring
    this.checkScoring();
  }

  private handlePlayerInput(): void {
    if (!this.player1 || !this.player2) return;

    const isLocalDuel = !this.config.player1IsAI && !this.config.player2IsAI;

    if (isLocalDuel) {
      // Player 1 controls: W/S
      this.player1.goUp = !!this.keys['KeyW'];
      this.player1.goDown = !!this.keys['KeyS'];

      // Player 2 controls: Arrow keys
      this.player2.goUp = !!this.keys['ArrowUp'];
      this.player2.goDown = !!this.keys['ArrowDown'];
    } else {
      // For AI games, the single human player can use either set of keys
      if (!this.config.player1IsAI) {
        this.player1.goUp = !!this.keys['KeyW'] || !!this.keys['ArrowUp'];
        this.player1.goDown = !!this.keys['KeyS'] || !!this.keys['ArrowDown'];
      }
      // Player 2 is an AI, so no input is handled here
    }
  }

  private checkPaddleCollisions(): void {
    if (!this.ball || !this.player1 || !this.player2) return;
    
    // Check collision with player 1 paddle
    if (this.ball.collidesWith(this.player1.posX, this.player1.posY, this.player1.width, this.player1.height)) {
      this.ball.handlePaddleCollision(this.player1.posX, this.player1.posY, this.player1.height);
    }
    
    // Check collision with player 2 paddle
    if (this.ball.collidesWith(this.player2.posX, this.player2.posY, this.player2.width, this.player2.height)) {
      this.ball.handlePaddleCollision(this.player2.posX, this.player2.posY, this.player2.height);
    }
  }

  private checkScoring(): void {
    if (!this.ball || !this.player1 || !this.player2) return;
    
    const outOfBounds = this.ball.isOutOfBounds();
    
    if (outOfBounds !== null) {
      // Score point
      if (outOfBounds === Side.Left) {
        this.player2.incrementScore();
      } else {
        this.player1.incrementScore();
      }
      
      // Update score display
      this.callbacks.onScoreUpdate(this.player1.getScore(), this.player2.getScore());
      
      // Check for game end
      if (this.player1.getScore() >= this.config.targetScore || this.player2.getScore() >= this.config.targetScore) {
        this.gameState = GameState.GameOver;
        this.callbacks.onGameStateChange(this.gameState);
        
        const winner = this.player1.getScore() >= this.config.targetScore ? this.config.player1Name : this.config.player2Name;
        this.callbacks.onGameEnd(winner, {
          player1: this.player1.getScore(),
          player2: this.player2.getScore()
        });
      } else {
        // Reset ball for next point
        this.ball.reset(outOfBounds === Side.Left ? Side.Right : Side.Left);
      }
    }
  }

  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  private keyPressed(p: p5): boolean {
    if (!p.keyCode) return false;
    
    // Space bar - start/pause game
    if (p.key === ' ') {
      if (this.gameState === GameState.Ready) {
        this.startGame();
      } else if (this.gameState === GameState.Playing) {
        this.pauseGame();
      } else if (this.gameState === GameState.Paused) {
        this.resumeGame();
      }
      return false; // Prevent default
    }
    
    // R key - restart game
    if (p.key === 'r' || p.key === 'R') {
      if (this.gameState === GameState.GameOver) {
        this.restartGame();
      }
      return false;
    }
    
    return true;
  }

  private keyReleased(_p: p5): boolean {
    return true;
  }

  // Public game control methods
  startGame(): void {
    if (this.gameState === GameState.Ready && this.ball) {
      this.ball.reset(Side.Left);
      this.gameState = GameState.Playing;
      this.callbacks.onGameStateChange(this.gameState);
      this.lastSpeedIncreaseTime = this.p5Instance?.millis() || 0;
    }
  }

  pauseGame(): void {
    if (this.gameState === GameState.Playing) {
      this.gameState = GameState.Paused;
      this.callbacks.onGameStateChange(this.gameState);
    }
  }

  resumeGame(): void {
    if (this.gameState === GameState.Paused) {
      this.gameState = GameState.Playing;
      this.callbacks.onGameStateChange(this.gameState);
    }
  }

  restartGame(): void {
    // Reset scores
    this.player1?.resetScore();
    this.player2?.resetScore();
    
    // Reset ball
    this.ball?.resetToCenter();
    
    // Reset AI
    if (this.ai1) {
      this.ai1.setDifficulty(this.config.aiDifficulty);
      this.ai1.reset();
    }
    if (this.ai2) {
      this.ai2.setDifficulty(this.config.aiDifficulty);
      this.ai2.reset();
    }
    
    // Reset state
    this.gameState = GameState.Ready;
    this.callbacks.onGameStateChange(this.gameState);
    this.callbacks.onScoreUpdate(0, 0);
  }

  // Cleanup method
  destroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    
    // Clear keyboard event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys[event.code] = true;
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys[event.code] = false;
  };

  // Getters
  getCurrentState(): GameState {
    return this.gameState;
  }

  getConfig(): GameConfig {
    return this.config;
  }

  private handleResize(p: p5, container: HTMLElement): void {
    const containerWidth = container.clientWidth;
    const aspectRatio = Board.width / Board.height;
    const newHeight = containerWidth / aspectRatio;

    p.resizeCanvas(containerWidth, newHeight);
    this.scaleFactor = containerWidth / Board.width;
  }
}
