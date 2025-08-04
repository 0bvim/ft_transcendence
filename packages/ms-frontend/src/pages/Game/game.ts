import { PongGame, GameConfig as PongGameConfig, GameCallbacks, GameState} from '../../game/PongGame';
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
  targetScore?: number;
  tournamentId?: string;
  matchId?: string;
  player1Name?: string;
  player2Name?: string;
  matchData?: any; // Add match data property
  onScoreUpdate?: (player1Score: number, player2Score: number) => void;
  onGameStateChange?: (state: GameState) => void;
  onGameEnd?: (winner: string, finalScore: { player1: number; player2: number }) => Promise<void>;
}

// Store game instances globally to manage them
let activeRenderer: any = null;
let activeGame: PongGame | null = null;

// Show the embedded game canvas and initialize game
export async function showMenuGame(container: HTMLElement, gameType: GameType): Promise<void> {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;

  if (gameModeSelection) gameModeSelection.classList.add('hidden');
  if (tournamentSection) tournamentSection.classList.add('hidden');
  if (gameSection) gameSection.classList.remove('hidden');

  let config: GameConfig;
  if (gameType === GameType.AI) {
    config = { type: GameType.AI,targetScore: 5 };
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
  // Cleanup any existing game instance before starting a new one
  cleanupGame(container);

  const canvasContainer = container; // The passed container IS the canvas container
  if (!canvasContainer) {
    console.error('An invalid container was provided to showGame');
    return;
  }

  // Set game title and behavior based on type
  try {
    const { user } = await authApi.getProfile();

    // Determine player names
    const player1Name = config.player1Name || user.username;
    const player2Name = config.player2Name || (config.type === GameType.AI ? 'COMPUTER' : 'PLAYER 2');

    // Determine if players are AI
    const player1IsAI = config.matchData?.player1?.participantType === 'AI';
    const player2IsAI = config.type === GameType.AI || config.matchData?.player2?.participantType === 'AI';

    const targetScore = config.targetScore || config.matchData?.tournament?.targetScore || 5;

    const gameConfig: PongGameConfig = {
      player1Name: player1Name,
      player2Name: player2Name,
      player1IsAI: player1IsAI,
      player2IsAI: player2IsAI,
      targetScore: targetScore,
    };

    // The callbacks are now directly passed from the config, making this function generic.
    const gameCallbacks: GameCallbacks = {
      onScoreUpdate: config.onScoreUpdate,
      onGameStateChange: config.onGameStateChange,
      onGameEnd: config.onGameEnd,
    };

    console.log('[showGame] PongGame config created:', gameConfig);

    const pongGame = new PongGame(gameConfig, gameCallbacks);
    activeGame = pongGame;
    (container as any).pongGame = pongGame; // For backward compatibility

    pongGame.init(canvasContainer);
    pongGame.startGame();

    console.log('[showGame] PongGame started successfully');

  } catch (error) {
    console.error('Failed to initialize game:', error);
    // Use callback to signal error state to the UI
    config.onGameStateChange?.(GameState.Error);
  }
}

// Clean up game resources
export function cleanupGame(container: HTMLElement): void {
  // Stop and cleanup local PongGame
  const pongGame = (container as any).pongGame as PongGame;
  if (pongGame && typeof pongGame.destroy === 'function') {
    pongGame.destroy();
  }

  // Cleanup renderer
  if (activeRenderer) {
    activeRenderer.destroy();
    activeRenderer = null;
  }

  // Remove keyboard listener
  const keydownHandler = (container as any).keydownHandler;
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    delete (container as any).keydownHandler;
  }

  activeGame = null;
  (container as any).pongGame = null;

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
