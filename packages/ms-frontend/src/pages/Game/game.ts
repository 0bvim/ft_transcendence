import { PongGame, GameConfig as PongGameConfig, GameCallbacks, GameState, AIDifficulty } from '../../game/PongGame';
import { authApi } from '../../api/auth';
import { WebSocketGameClient, GameCallbacks as WSGameCallbacks } from '../../game/WebSocketGameClient';
import { WebSocketGameRenderer } from '../../game/WebSocketGameRenderer';
import { tournamentApi } from '../../api/tournament';

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

// Store game instances globally to manage them
let activeGame: PongGame | WebSocketGameClient | null = null;
let activeRenderer: WebSocketGameRenderer | null = null;

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

  // Cleanup any existing game instance before starting a new one
  cleanupGame(container);

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

  // Set game title and behavior based on type
  try {
    const { user } = await authApi.getProfile();
    const player1Name = user.username;

    // Default to local game settings
    p1NameElement.textContent = player1Name;
    p2NameElement.textContent = 'PLAYER 2';

    if (config.type === GameType.AI || config.type === GameType.Local) {
      // LOCAL GAME LOGIC (AI or Human vs Human)
      gameTitleElement.textContent = config.type === GameType.AI ? 'AGAINST THE MACHINE' : 'LOCAL DUEL';
      p2NameElement.textContent = config.type === GameType.AI ? 'COMPUTER' : (config.player2Name || 'PLAYER 2');

      const gameConfig: PongGameConfig = {
        player1Name: player1Name,
        player2Name: p2NameElement.textContent,
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
        onGameEnd: (winner, finalScore) => {
          gameStatusElement.textContent = `GAME OVER! ${winner} WINS!`;
          gameStatusElement.classList.remove('hidden');
        },
      };

      const pongGame = new PongGame(gameConfig, gameCallbacks);
      activeGame = pongGame;
      (container as any).pongGame = pongGame; // For backward compatibility if needed

      pongGame.init(canvasContainer);
      pongGame.startGame();

    } else if (config.type === GameType.Multiplayer || config.type === GameType.Tournament) {
      // MULTIPLAYER / TOURNAMENT LOGIC
      gameTitleElement.textContent = config.type === GameType.Tournament ? 'TOURNAMENT MATCH' : 'MULTIPLAYER MATCH';
      
      const hostname = window.location.hostname;
      const gameServiceUrl = `https://${hostname}:3002`; // Game service runs on port 3002

      const renderer = new WebSocketGameRenderer(canvasContainer);
      activeRenderer = renderer;

      const wsCallbacks: WSGameCallbacks = {
        onConnected: () => {
          gameStatusElement.textContent = 'Connected! Waiting for match...';
          gameStatusElement.classList.remove('hidden');
        },
        onGameJoined: (data) => {
          p1NameElement.textContent = data.player1.name;
          p2NameElement.textContent = data.player2.name;
        },
        onGameState: (gameState) => {
          renderer.updateGameState(gameState);
          p1ScoreElement.textContent = (gameState.score[gameState.players[0].id] || 0).toString();
          p2ScoreElement.textContent = (gameState.score[gameState.players[1].id] || 0).toString();
        },
        onGameFinished: async (data) => {
          gameStatusElement.textContent = `GAME OVER! Winner: ${data.winnerName}`;
          gameStatusElement.classList.remove('hidden');
          // If it's a tournament match, submit the result
          if (config.type === GameType.Tournament && config.matchId) {
            try {
              await tournamentApi.submitMatchResult(config.matchId, data.result, data.matchData);
              showNotification('Match result submitted successfully!', 'success');
            } catch (error) { 
              showNotification('Failed to submit match result.', 'error');
              console.error('Failed to submit match result:', error);
            }
          }
        },
        onError: (error) => {
          gameStatusElement.textContent = `Error: ${error}`;
          gameStatusElement.classList.remove('hidden');
          console.error('WebSocket Error:', error);
        },
        onDisconnected: () => {
          gameStatusElement.textContent = 'Disconnected from server.';
          gameStatusElement.classList.remove('hidden');
        },
      };

      const client = new WebSocketGameClient(gameServiceUrl, wsCallbacks);
      activeGame = client;

      if (config.type === GameType.Tournament) {
        await client.connectTournament(config.matchId!);
      } else {
        await client.connectMultiplayer();
      }

      // Handle keyboard input for paddle movement
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'w' || e.key === 'ArrowUp') {
          client.movePaddle('up');
        } else if (e.key === 's' || e.key === 'ArrowDown') {
          client.movePaddle('down');
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      // Store the handler to remove it later
      (container as any).keydownHandler = handleKeyDown;
    }

  } catch (error) {
    console.error('Failed to initialize game:', error);
    gameStatusElement.textContent = 'Failed to initialize game.';
    gameStatusElement.classList.remove('hidden');
  }
}

// Clean up game resources
export function cleanupGame(container: HTMLElement): void {
  // Stop and cleanup local PongGame
  const pongGame = (container as any).pongGame as PongGame;
  if (pongGame && typeof pongGame.destroy === 'function') {
    pongGame.destroy();
  }

  // Disconnect WebSocket client
  if (activeGame instanceof WebSocketGameClient) {
    activeGame.disconnect();
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
