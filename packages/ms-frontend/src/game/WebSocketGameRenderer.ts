import { GameState } from './WebSocketGameClient';

export class WebSocketGameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState | null = null;
  private animationId: number | null = null;

  constructor(canvasContainer: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.canvas.style.width = '100%';
    this.canvas.style.height = 'auto';
    this.canvas.style.border = '2px solid #00ffff';
    this.canvas.style.backgroundColor = '#000';
    
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    this.startRenderLoop();
  }

  updateGameState(gameState: GameState): void {
    this.gameState = gameState;
    
    // Update canvas size if needed
    if (gameState.config && 
        (this.canvas.width !== gameState.config.canvasWidth || 
         this.canvas.height !== gameState.config.canvasHeight)) {
      this.canvas.width = gameState.config.canvasWidth;
      this.canvas.height = gameState.config.canvasHeight;
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.gameState) {
      this.renderWaitingMessage();
      return;
    }

    // Draw center line
    this.drawCenterLine();

    // Draw paddles
    this.gameState.players.forEach(player => {
      this.drawPaddle(player);
    });

    // Draw ball
    if (this.gameState.ball) {
      this.drawBall(this.gameState.ball);
    }

    // Draw game status
    this.drawGameStatus();
  }

  private renderWaitingMessage(): void {
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Connecting to game...', this.canvas.width / 2, this.canvas.height / 2);
  }

  private drawCenterLine(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawPaddle(player: any): void {
    this.ctx.fillStyle = player.position === 'left' ? '#ff00ff' : '#00ffff';
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add glow effect
    this.ctx.shadowColor = player.position === 'left' ? '#ff00ff' : '#00ffff';
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    this.ctx.shadowBlur = 0;
  }

  private drawBall(ball: any): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private drawGameStatus(): void {
    if (!this.gameState) return;

    // Draw game status text
    let statusText = '';
    switch (this.gameState.status) {
      case 'waiting':
        statusText = 'Waiting for players...';
        break;
      case 'paused':
        statusText = 'Game Paused';
        break;
      case 'finished':
        statusText = `Game Over! ${this.gameState.winner ? 'Winner: ' + this.gameState.winner : ''}`;
        break;
    }

    if (statusText) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '20px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(statusText, this.canvas.width / 2, 50);
    }
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
