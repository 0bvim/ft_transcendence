import { tournamentApi } from '../api/tournament.js';
import { authApi } from '../api/auth.js';

/**
 * Local-versus game mode for two human players on the same keyboard
 * Player 1: W/S keys
 * Player 2: Arrow Up/Down keys
 */
export class LocalVersusGame {
  private player1Keys = { up: false, down: false };
  private player2Keys = { up: false, down: false };
  private controlsOverlay: HTMLElement | null = null;
  private gameLoop: number | null = null;
  
  // Game objects
  private paddle1 = { x: 10, y: 150, width: 10, height: 100, speed: 5 };
  private paddle2 = { x: 780, y: 150, width: 10, height: 100, speed: 5 };
  private ball = { x: 400, y: 200, speedX: 3, speedY: 2, size: 10 };
  private scores = { player1: 0, player2: 0 };
  private gameActive = false;

  private canvas: HTMLCanvasElement;
  private matchData: any;
  private onGameEnd?: (winner: string, scores: any) => void;
  private onStatusChange?: (status: string) => void;

  constructor(canvas: HTMLCanvasElement, matchData: any) {
    this.canvas = canvas;
    this.matchData = matchData;
    this.setupLocalVersusControls();
    this.showControlsOverlay();
  }

  private setupLocalVersusControls() {
    // Add local-versus keyboard handlers
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW':
        this.player1Keys.up = true;
        event.preventDefault();
        break;
      case 'KeyS':
        this.player1Keys.down = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.player2Keys.up = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.player2Keys.down = true;
        event.preventDefault();
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW':
        this.player1Keys.up = false;
        event.preventDefault();
        break;
      case 'KeyS':
        this.player1Keys.down = false;
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.player2Keys.up = false;
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.player2Keys.down = false;
        event.preventDefault();
        break;
    }
  }

  private updateGame() {
    if (!this.gameActive) return;
    
    // Update paddles
    if (this.player1Keys.up && this.paddle1.y > 0) {
      this.paddle1.y -= this.paddle1.speed;
    }
    if (this.player1Keys.down && this.paddle1.y < 300) {
      this.paddle1.y += this.paddle1.speed;
    }

    if (this.player2Keys.up && this.paddle2.y > 0) {
      this.paddle2.y -= this.paddle2.speed;
    }
    if (this.player2Keys.down && this.paddle2.y < 300) {
      this.paddle2.y += this.paddle2.speed;
    }
    
    // Update ball
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;
    
    // Ball collision with top/bottom walls
    if (this.ball.y <= 0 || this.ball.y >= 390) {
      this.ball.speedY = -this.ball.speedY;
    }
    
    // Ball collision with paddles
    if (this.ball.x <= 20 && this.ball.y >= this.paddle1.y && this.ball.y <= this.paddle1.y + 100) {
      this.ball.speedX = -this.ball.speedX;
    }
    if (this.ball.x >= 770 && this.ball.y >= this.paddle2.y && this.ball.y <= this.paddle2.y + 100) {
      this.ball.speedX = -this.ball.speedX;
    }
    
    // Score
    if (this.ball.x < 0) {
      this.scores.player2++;
      this.resetBall();
    }
    if (this.ball.x > 800) {
      this.scores.player1++;
      this.resetBall();
    }
    
    // Check win condition
    if (this.scores.player1 >= 5 || this.scores.player2 >= 5) {
      this.endGame();
    }
  }
  
  private resetBall() {
    this.ball.x = 400;
    this.ball.y = 200;
    this.ball.speedX = -this.ball.speedX;
  }
  
  private async endGame() {
    this.gameActive = false;
    
    // Determine winner and submit result
    const player1Won = this.scores.player1 >= 5;
    const winnerId = player1Won ? this.matchData.player1?.id : this.matchData.player2?.id;
    const winnerName = player1Won ? 
      (this.matchData.player1?.displayName || 'Player 1') : 
      (this.matchData.player2?.displayName || 'Player 2');
    
    // Submit match result to backend
    try {
      await tournamentApi.submitMatchResult(this.matchData.matchId, {
        winnerId,
        player1Score: this.scores.player1,
        player2Score: this.scores.player2
      });
      
      if (this.onGameEnd) {
        this.onGameEnd(winnerName, this.scores);
      }
    } catch (error) {
      console.error('Failed to submit match result:', error);
      if (this.onGameEnd) {
        this.onGameEnd(`${winnerName} (Result not saved)`, this.scores);
      }
    }
  }
  
  setOnGameEnd(callback: (winner: string, scores: any) => void): void {
    this.onGameEnd = callback;
  }

  setOnStatusChange(callback: (status: string) => void): void {
    this.onStatusChange = callback;
  }
  
  private render() {
    const ctx = this.canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 800, 400);
    
    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 400);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
    ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
    
    // Draw ball
    ctx.fillRect(this.ball.x - 5, this.ball.y - 5, this.ball.size, this.ball.size);
    
    // Draw scores
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.scores.player1.toString(), 200, 60);
    ctx.fillText(this.scores.player2.toString(), 600, 60);
  }
  
  private gameLoopFunction = () => {
    this.updateGame();
    this.render();
    this.gameLoop = requestAnimationFrame(this.gameLoopFunction);
  };
  
  private startGame() {
    this.gameActive = true;
    this.gameLoop = requestAnimationFrame(this.gameLoopFunction);
  }

  private showControlsOverlay() {
    this.controlsOverlay = document.createElement('div');
    this.controlsOverlay.className = 'controls-overlay';
    this.controlsOverlay.innerHTML = `
      <div class="controls-content">
        <h2>Local Versus Mode</h2>
        <div class="controls-info">
          <div class="player-controls">
            <h3>Player 1</h3>
            <p><kbd>W</kbd> - Move Up</p>
            <p><kbd>S</kbd> - Move Down</p>
          </div>
          <div class="player-controls">
            <h3>Player 2</h3>
            <p><kbd>↑</kbd> - Move Up</p>
            <p><kbd>↓</kbd> - Move Down</p>
          </div>
        </div>
        <p class="countdown">Game starts in <span id="countdown">3</span>...</p>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .controls-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        color: white;
        font-family: 'Orbitron', monospace;
      }
      .controls-content {
        text-align: center;
        max-width: 600px;
        padding: 2rem;
      }
      .controls-content h2 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #00ff88;
      }
      .controls-info {
        display: flex;
        justify-content: space-around;
        margin: 2rem 0;
      }
      .player-controls h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #88ccff;
      }
      .player-controls p {
        margin: 0.5rem 0;
        font-size: 1.2rem;
      }
      .player-controls kbd {
        background: #333;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: bold;
        color: #00ff88;
      }
      .countdown {
        font-size: 1.5rem;
        margin-top: 2rem;
        color: #ffaa00;
      }
      #countdown {
        font-weight: bold;
        font-size: 2rem;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.controlsOverlay);

    // Start countdown
    this.startCountdown();
  }

  private startCountdown() {
    let count = 3;
    const countdownElement = document.getElementById('countdown');
    
    const countdown = setInterval(() => {
      count--;
      if (countdownElement) {
        countdownElement.textContent = count.toString();
      }
      
      if (count <= 0) {
        clearInterval(countdown);
        this.hideControlsOverlay();
        this.startGame();
      }
    }, 1000);
  }

  private hideControlsOverlay() {
    if (this.controlsOverlay) {
      this.controlsOverlay.remove();
      this.controlsOverlay = null;
    }
  }

  public destroy() {
    // Stop game loop
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    
    // Clean up event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // Hide overlay if still visible
    this.hideControlsOverlay();
    
    // No WebSocket to disconnect in local mode
  }
}
