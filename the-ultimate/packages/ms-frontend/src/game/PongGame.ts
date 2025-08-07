import p5 from 'p5';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Board, Side } from './Board';
import { AI} from './AI';

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
  targetScore: number;
}

export interface GameCallbacks {
  onScoreUpdate: (player1Score: number, player2Score: number) => void;
  onGameStateChange: (state: GameState) => void;
  onGameEnd: (finalState: { 
    winner: string; 
    score: { player1: number; player2: number; };
  }) => void;
}

export class PongGame {
  private p5Instance: p5 | null = null;
  private ball: Ball | null = null;
  private player1: Paddle | null = null;
  private player2: Paddle | null = null;
  private ai1: AI | null = null;
  private ai2: AI | null = null;
  private aiUpdateTimer: number = 0;
  private aiViewBoardInterval: number;

  private gameState: GameState = GameState.Loading;
  private config: GameConfig;
  private callbacks: GameCallbacks;

  private keys: { [key: string]: boolean } = {};
  private scaleFactor = 1;

  constructor(config: GameConfig, callbacks: GameCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.aiViewBoardInterval = 1000; // AI refreshes view exactly once per second as required
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
    p.frameRate(144);

    // Initialize game objects
    this.initializeGameObjects();

    // Set initial state
    this.gameState = GameState.Ready;
    this.callbacks.onGameStateChange(this.gameState);

    // Setup keyboard event listeners
    this.setupKeyboardEvents();
  }

  private initializeGameObjects(): void {
    // Player 1 (left) - Synthwave magenta/purple color to match control instructions
    this.player1 = new Paddle(Board.backBorder, Board.height / 2, '#ff00ff');
    // Player 2 (right) - Cyan color to match control instructions  
    this.player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, Board.height / 2, '#00FFFF');

    this.ball = new Ball();

    // Create AI instances if needed
    if (this.config.player1IsAI && this.player1 && this.ball) {
      this.ai1 = new AI(this.player1, this.player2);
    }
    if (this.config.player2IsAI && this.player2 && this.ball) {
      this.ai2 = new AI(this.player2, this.player1);
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
    this.ball.draw(p);
    this.player1.draw(p);
    this.player2.draw(p);
  }

  private updateGame(p: p5): void {
    if (!this.ball || !this.player1 || !this.player2) return;

    const currentTime = p.millis();

    // Update AI
    if (currentTime - this.aiUpdateTimer >= this.aiViewBoardInterval) {
      if (this.ai1) {
        this.ai1.predict(this.ball);
      }
      if (this.ai2) {
        this.ai2.predict(this.ball);
      }
      this.aiUpdateTimer = currentTime;
    }

    if (this.ai1) {
      this.ai1.movePaddle();
    }
    if (this.ai2) {
      this.ai2.movePaddle();
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

    // Player 1 (left side) always uses W/S keys
    if (!this.config.player1IsAI) {
      this.player1.goUp = !!this.keys['KeyW'];
      this.player1.goDown = !!this.keys['KeyS'];
    }

    // Player 2 (right side) uses I/K keys
    if (!this.config.player2IsAI) {
      this.player2.goUp = !!this.keys['KeyI'];
      this.player2.goDown = !!this.keys['KeyK'];
    }
  }

  private checkPaddleCollisions(): void {
    if (!this.ball || !this.player1 || !this.player2) return;
    this.ball.collisionFromBottomToTop(0);
    this.ball.collisionFromTopToBottom(Board.height);
    if (this.ball.isInFrontOf(this.player1.y + Paddle.height, this.player1.y) &&
      this.ball.collisionFromRightToLeft(this.player1.x + Paddle.width)) {
      this.ball.ballPaddleHit(this.player1.currentSpeed);
      return;
    }
    if (this.ball.isInFrontOf(this.player2.y + Paddle.height, this.player2.y) &&
      this.ball.collisionFromLeftToRight(this.player2.x)) {
      this.ball.ballPaddleHit(this.player2.currentSpeed)
      return;
    }
  }

  private checkScoring(): void {
    if (!this.ball || !this.player1 || !this.player2) return;

    if (this.ball.currentX <= 0) {
      this.ball.reset(Side.Left);
      this.player2.incrementScore();
    } else if (this.ball.currentX + 2 * Ball.radius >= Board.width) {
      this.ball.reset(Side.Right);
      this.player1.incrementScore();
    }

    // Update score display
    this.callbacks.onScoreUpdate(this.player1.getScore(), this.player2.getScore());

    // Check for game end
    if (this.player1.getScore() >= this.config.targetScore || this.player2.getScore() >= this.config.targetScore) {
      this.gameState = GameState.GameOver;
      this.callbacks.onGameStateChange(this.gameState);

      const winner = this.player1.getScore() >= this.config.targetScore ? this.config.player1Name : this.config.player2Name;
      const finalState = {
        winner: winner,
        score: {
          player1: this.player1.getScore(),
          player2: this.player2.getScore()
        }
      };
      this.callbacks.onGameEnd(finalState);
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
    if (this.ball) {
      this.ball.reset(Side.Left);
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
    const containerHeight = container.clientHeight;
    const aspectRatio = Board.width / Board.height;
    
    // Calculate optimal canvas size based on container with tournament-style constraints
    let canvasWidth = Math.min(containerWidth * 0.95, containerWidth - 48); // Account for p-6 padding (24px each side)
    let canvasHeight = canvasWidth / aspectRatio;
    
    // Tournament viewport uses min-h-[60vh] max-h-[80vh], so respect those bounds
    const maxHeight = containerHeight * 0.9; // Leave some margin within the viewport
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }
    
    // Set minimum size appropriate for tournament-style viewport
    const minWidth = Math.max(600, containerWidth * 0.7); // Tournament needs good visibility
    const minHeight = minWidth / aspectRatio;
    
    if (canvasWidth < minWidth) {
      canvasWidth = minWidth;
      canvasHeight = minHeight;
    }

    // Ensure canvas doesn't exceed container bounds (important for tournament viewport)
    if (canvasWidth > containerWidth - 48) { // Account for padding
      canvasWidth = containerWidth - 48;
      canvasHeight = canvasWidth / aspectRatio;
    }

    p.resizeCanvas(canvasWidth, canvasHeight);
    this.scaleFactor = canvasWidth / Board.width;
    
    // Adjust viewport to fit canvas
    this.adjustViewport(container, canvasWidth, canvasHeight);
  }
  
  private adjustViewport(container: HTMLElement, canvasWidth: number, canvasHeight: number): void {
    // Find the game viewport container (tournament-style)
    const viewport = container.closest('#game-viewport') || 
                    document.querySelector('#game-viewport');
    
    if (viewport) {
      // Tournament-style viewport already has proper min-h-[60vh] max-h-[80vh] constraints
      // Just ensure the canvas container is properly positioned
      const canvasContainer = container as HTMLElement;
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.top = '0';
      canvasContainer.style.left = '0';
      canvasContainer.style.width = '100%';
      canvasContainer.style.height = '100%';
      canvasContainer.style.display = 'flex';
      canvasContainer.style.justifyContent = 'center';
      canvasContainer.style.alignItems = 'center';
    }
  }
}
