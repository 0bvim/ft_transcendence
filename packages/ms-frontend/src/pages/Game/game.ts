import { PongGame, GameConfig as PongGameConfig, GameCallbacks, GameState, AIDifficulty } from '../../game/PongGame';
import { authApi } from '../../api/auth';

// Game types for embedded game functionality
export enum GameType {
  AI = 'ai',
  Local = 'local',
  Tournament = 'tournament',
  Multiplayer = 'multiplayer',
}

export interface GameConfig {
  type: GameType;
  difficulty?: 'easy' | 'medium' | 'hard';
  targetScore?: number;
  tournamentId?: string;
  matchId?: string;
  player1Name?: string;
  player2Name?: string;
}

// Show the embedded game canvas and initialize game
export async function showMenuGame(container: HTMLElement, gameType: GameType, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<void> {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;

  if (gameModeSelection) gameModeSelection.classList.add('hidden');
  if (tournamentSection) tournamentSection.classList.add('hidden');
  if (gameSection) gameSection.classList.remove('hidden');

  let config: GameConfig;
  if (gameType === GameType.AI) {
    config = { type: GameType.AI, difficulty: difficulty, targetScore: 5 };
  } else {
    config = { type: GameType.Local, targetScore: 5 };
  }

  await showGame(container, config);
}

// Hide the embedded game canvas
export function hideGame(container: HTMLElement): void {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;

  if (gameSection) gameSection.classList.add('hidden');
  if (gameModeSelection) gameModeSelection.classList.remove('hidden');

  cleanupGame(container);
}

// Initialize the embedded game with real p5.js PongGame and player name
export async function showGame(container: HTMLElement, config: GameConfig): Promise<void> {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;

  if (gameModeSelection) gameModeSelection.classList.add('hidden');
  if (tournamentSection) tournamentSection.classList.add('hidden');
  if (gameSection) gameSection.classList.remove('hidden');

  const canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
  const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;
  const gameTitleElement = container.querySelector('#gameTitle') as HTMLElement;
  const p1NameElement = container.querySelector('#player1Name') as HTMLElement;
  const p2NameElement = container.querySelector('#player2Name') as HTMLElement;
  const p1ScoreElement = container.querySelector('#player1Score') as HTMLElement;
  const p2ScoreElement = container.querySelector('#player2Score') as HTMLElement;

  if (!canvasContainer || !gameStatusElement || !gameTitleElement || !p1NameElement || !p2NameElement || !p1ScoreElement || !p2ScoreElement) {
    console.error('Required game elements not found in the DOM');
    return;
  }

  // Set game title
  switch (config.type) {
    case GameType.AI:
      gameTitleElement.textContent = 'AGAINST THE MACHINE';
      break;
    case GameType.Local:
      gameTitleElement.textContent = 'LOCAL DUEL';
      break;
    case GameType.Tournament:
      gameTitleElement.textContent = 'TOURNAMENT MATCH';
      break;
    case GameType.Multiplayer:
      gameTitleElement.textContent = 'MULTIPLAYER MATCH';
      break;
  }

  try {
    const { user } = await authApi.getProfile();
    const player1Name = user.username;

    const player2Name = config.type === GameType.AI ? 'COMPUTER' : (config.player2Name || 'PLAYER 2');
    p1NameElement.textContent = player1Name;
    p2NameElement.textContent = player2Name;

    const gameConfig: PongGameConfig = {
      player1Name: player1Name,
      player2Name: player2Name,
      player1IsAI: false,
      player2IsAI: config.type === GameType.AI,
      aiDifficulty: config.difficulty?.toUpperCase() as AIDifficulty || 'MEDIUM',
      targetScore: config.targetScore || 5,
    };

    const gameCallbacks: GameCallbacks = {
      onScoreUpdate: (player1Score, player2Score) => {
        if (p1ScoreElement) p1ScoreElement.textContent = player1Score.toString();
        if (p2ScoreElement) p2ScoreElement.textContent = player2Score.toString();
      },
      onGameStateChange: (state) => {
        switch (state) {
          case GameState.Paused:
            gameStatusElement.textContent = 'PAUSED';
            gameStatusElement.classList.remove('hidden');
            break;
          case GameState.GameOver:
            // This is handled by onGameEnd
            break;
          default:
            gameStatusElement.classList.add('hidden');
            break;
        }
      },
      onGameEnd: (winner, _finalScore) => {
        gameStatusElement.textContent = `GAME OVER! ${winner} WINS! Press R to Restart`;
        gameStatusElement.classList.remove('hidden');
      },
    };

    const pongGame = new PongGame(gameConfig, gameCallbacks);
    (container as any).pongGame = pongGame;

    pongGame.init(canvasContainer);
    pongGame.startGame();

  } catch (error) {
    console.error('Failed to initialize game:', error);
    // Handle error, maybe show a notification
  }
}

// Clean up game resources
export function cleanupGame(container: HTMLElement): void {
  const pongGame = (container as any).pongGame as PongGame;
  if (pongGame) {
    pongGame.destroy();
    delete (container as any).pongGame;
  }

  // Clear canvas
  const canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
  if (canvasContainer) {
    canvasContainer.innerHTML = ''; // Clear the container
  }

  // Reset UI elements
  const p1ScoreElement = container.querySelector('#player1Score') as HTMLElement;
  const p2ScoreElement = container.querySelector('#player2Score') as HTMLElement;
  const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;
  const gameTitleElement = container.querySelector('#gameTitle') as HTMLElement;

  if (p1ScoreElement) p1ScoreElement.textContent = '0';
  if (p2ScoreElement) p2ScoreElement.textContent = '0';
  if (gameStatusElement) {
    gameStatusElement.textContent = '';
    gameStatusElement.classList.add('hidden');
  }
  if (gameTitleElement) gameTitleElement.textContent = 'PONG';
}
