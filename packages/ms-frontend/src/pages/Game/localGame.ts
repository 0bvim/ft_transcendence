import { PongGame } from '../../game/game';
import { AIOpponent, AIDifficulty } from '../../game/AIOpponent';
import { GameState } from '../../game/types';

let game: PongGame | null = null;
let aiOpponent: AIOpponent | null = null;
let animationFrameId: number | null = null;

const keysPressed: { [key: string]: boolean } = {};

function handleKeyDown(event: KeyboardEvent) {
  keysPressed[event.code] = true;
}

function handleKeyUp(event: KeyboardEvent) {
  keysPressed[event.code] = false;
}

function renderGame(canvas: HTMLCanvasElement, gameState: GameState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw center line
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = 'white';
  gameState.players.forEach(paddle => {
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  });

  // Draw ball
  ctx.beginPath();
  ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop(container: HTMLElement) {
  if (!game) return;

  // Handle Player 1 input (always W/S)
  if (keysPressed['KeyW']) game.movePaddle('player1', 'up');
  if (keysPressed['KeyS']) game.movePaddle('player1', 'down');

  // Handle Player 2 / AI input
  if (aiOpponent) {
    const move = aiOpponent.update(game.getGameState());
    if (move) {
      game.movePaddle('player2', move);
    }
  } else {
    // Local duel Player 2 input (Arrow Keys)
    if (keysPressed['ArrowUp']) game.movePaddle('player2', 'up');
    if (keysPressed['ArrowDown']) game.movePaddle('player2', 'down');
  }

  const canvas = container.querySelector('canvas');
  const gameState = game.getGameState();

  if (canvas) {
    renderGame(canvas, gameState);
  }

  // Update UI
  const p1ScoreElement = container.querySelector('#player1Score') as HTMLElement;
  const p2ScoreElement = container.querySelector('#player2Score') as HTMLElement;
  const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;

  const p1Score = gameState.score['player1'] || 0;
  const p2Score = gameState.score['player2'] || 0;

  if (p1ScoreElement) p1ScoreElement.textContent = p1Score.toString();
  if (p2ScoreElement) p2ScoreElement.textContent = p2Score.toString();

  if (gameState.status === 'finished') {
    const winnerName = gameState.winner === 'player1' ? 'Player 1' : 'Player 2';
    gameStatusElement.textContent = `GAME OVER! ${winnerName} WINS!`;
    gameStatusElement.classList.remove('hidden');
    stopLocalGame();
  } else {
    animationFrameId = requestAnimationFrame(() => gameLoop(container));
  }
}

export function startLocalGame(container: HTMLElement, options: { isAI: boolean; difficulty?: AIDifficulty }) {
  cleanupLocalGame(); // Ensure any previous game is stopped

  const canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
  if (!canvasContainer) return;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  canvasContainer.innerHTML = '';
  canvasContainer.appendChild(canvas);

  game = new PongGame();
  game.addPlayer('player1');
  game.addPlayer('player2');

  if (options.isAI) {
    aiOpponent = new AIOpponent('player2', (game as any).config, options.difficulty);
  }

  // Setup event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Start game loops
  game.startGameLoop();
  gameLoop(container);
}

export function cleanupLocalGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (game) {
    game.cleanup();
    game = null;
  }
  aiOpponent = null;
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
}
