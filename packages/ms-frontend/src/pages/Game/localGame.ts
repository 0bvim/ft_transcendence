import { PongGame, GameConfig, GameCallbacks, GameState, AIDifficulty } from '../../game/PongGame';
import {getCurrentUser} from "@/auth/auth.ts";

let game: PongGame | null = null;
const user = await getCurrentUser();
const usernameP1 = user?.username || 'PLAYER 1';
export function startLocalGame(container: HTMLElement, options: { isAI: boolean; difficulty?: AIDifficulty }) {
  cleanupLocalGame(); // Ensure any previous game is stopped

  const canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
  if (!canvasContainer) return;

  // Prepare config and callbacks for PongGame
  const player1Name = usernameP1;
  const player2Name = options.isAI ? 'COMPUTER' : 'PLAYER 2';
  const config: GameConfig = {
    player1Name,
    player2Name,
    player1IsAI: false,
    player2IsAI: options.isAI,
    aiDifficulty: (options.difficulty || 'MEDIUM').toUpperCase() as AIDifficulty,
    targetScore: 5,
  };

  const p1ScoreElement = container.querySelector('#player1Score') as HTMLElement;
  const p2ScoreElement = container.querySelector('#player2Score') as HTMLElement;
  const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;

  const callbacks: GameCallbacks = {
    onScoreUpdate: (p1, p2) => {
      if (p1ScoreElement) p1ScoreElement.textContent = p1.toString();
      if (p2ScoreElement) p2ScoreElement.textContent = p2.toString();
    },
    onGameStateChange: (state) => {
      if (state === GameState.Paused) {
        gameStatusElement.textContent = 'PAUSED';
        gameStatusElement.classList.remove('hidden');
      } else {
        gameStatusElement.classList.add('hidden');
      }
      if (state === GameState.Ready) {
        if (game) {
          game.startGame();
        } else {
          console.error("Game instance is null");
        }
      }
    },
    onGameEnd: (winner) => {
      gameStatusElement.textContent = `GAME OVER! ${winner} WINS!`;
      gameStatusElement.classList.remove('hidden');
    },
  };

  game = new PongGame(config, callbacks);
  game.init(canvasContainer);
  game.startGame(); // Start the game automatically upon initialization
}

export function cleanupLocalGame() {
  if (game) {
    if (typeof (game as any).destroy === 'function') {
      (game as any).destroy();
    } else if (typeof (game as any).cleanup === 'function') {
      (game as any).cleanup();
    }
    game = null;
  }
}
