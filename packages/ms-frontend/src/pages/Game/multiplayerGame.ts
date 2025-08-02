import { WebSocketGameClient, GameCallbacks as WSGameCallbacks } from '../../game/WebSocketGameClient';
import { PongGame } from '../../game/game';
import { GameState } from '../../game/types';

let game: PongGame | null = null;
let animationFrameId: number | null = null;

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

function renderLoop(container: HTMLElement) {
  if (!game) return;

  const canvas = container.querySelector('canvas');
  const gameState = game.getGameState();

  if (canvas) {
    renderGame(canvas, gameState);
  }
  animationFrameId = requestAnimationFrame(() => renderLoop(container));
}

// Show multiplayer WebSocket game
export async function showMultiplayerGame(container: HTMLElement): Promise<void> {
  cleanupWebSocketGame(container); // Clean up any existing game

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

  // --- Unify canvas sizing with local game ---
  canvasContainer.innerHTML = '';
  const canvas = document.createElement('canvas');
  // Responsive: fill container
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // Set base size (should match Board.ts or be dynamic)
  canvas.width = 800;
  canvas.height = 600;
  canvasContainer.appendChild(canvas);

  game = new PongGame();

  gameTitleElement.textContent = 'MULTIPLAYER MATCH';
  gameStatusElement.textContent = 'Connecting to game service...';
  gameStatusElement.classList.remove('hidden');

  // Reset overlays to default style (unified with local)
  p1NameElement.className = 'text-xl font-bold text-white font-retro tracking-wider truncate max-w-xs';
  p2NameElement.className = 'text-xl font-bold text-white font-retro tracking-wider truncate max-w-xs';
  p1ScoreElement.className = 'text-4xl font-bold text-white font-mono tracking-widest mt-2';
  p2ScoreElement.className = 'text-4xl font-bold text-white font-mono tracking-widest mt-2';

  // Helper to truncate long names for visual consistency
  function truncateName(name: string, maxLength = 12) {
    return name.length > maxLength ? name.slice(0, maxLength - 1) + '…' : name;
  }

  const gameServiceUrl = `wss://${window.location.hostname}:3002`;

  const callbacks: WSGameCallbacks = {
    onConnected: (data) => {
      console.log('Connected to game service:', data);
      gameStatusElement.textContent = 'Waiting for opponent...';
    },

    onGameJoined: (data) => {
      console.log('Game joined:', data);
      gameStatusElement.textContent = 'Game starting...';

      // --- Unify name setting logic ---
      if (data.opponent) {
        if (data.position === 'left') {
          p1NameElement.textContent = truncateName(data.user?.username || 'YOU');
          p2NameElement.textContent = truncateName(data.opponent.username || 'OPPONENT');
        } else {
          p1NameElement.textContent = truncateName(data.opponent.username || 'OPPONENT');
          p2NameElement.textContent = truncateName(data.user?.username || 'YOU');
        }
      } else {
        // fallback
        p1NameElement.textContent = 'PLAYER 1';
        p2NameElement.textContent = 'PLAYER 2';
      }
      renderLoop(container); // Start rendering
    },

    onGameState: (serverState) => {
      if (!game) return;
      game.setState(serverState);
      const localState = game.getGameState();

      const p1 = Array.from(localState.players.values()).find(p => p.position === 'left');
      const p2 = Array.from(localState.players.values()).find(p => p.position === 'right');

      if (p1) p1ScoreElement.textContent = (localState.score[p1.id] || 0).toString();
      if (p2) p2ScoreElement.textContent = (localState.score[p2.id] || 0).toString();

      if (localState.status === 'playing') {
        gameStatusElement.classList.add('hidden');
      }
    },

    onGameFinished: (data) => {
      const localState = game?.getGameState();
      const winnerId = data.winner || localState?.winner;
      let winnerName = 'Someone';
      if (winnerId && localState) {
        const winnerPlayer = localState.players.get(winnerId);
        const p1 = Array.from(localState.players.values()).find(p => p.position === 'left');
        if (winnerPlayer && p1) {
          winnerName = winnerPlayer.id === p1.id ? p1NameElement.textContent || 'Player 1' : p2NameElement.textContent || 'Player 2';
        }
      }
      gameStatusElement.textContent = `Game Over! Winner: ${winnerName}`;
      gameStatusElement.classList.remove('hidden');
      stopMultiplayerGame(container);
    },

    onPlayerLeft: (data) => {
      gameStatusElement.textContent = `Player ${data.username || data.playerId} left the game`;
      gameStatusElement.classList.remove('hidden');
      stopMultiplayerGame(container);
    },

    onError: (error) => {
      gameStatusElement.textContent = `Error: ${error}`;
      gameStatusElement.classList.remove('hidden');
    },

    onDisconnected: () => {
      gameStatusElement.textContent = 'Disconnected from game service';
      gameStatusElement.classList.remove('hidden');
    }
  };

  const client = new WebSocketGameClient(gameServiceUrl, callbacks);

  // Store client for cleanup
  (container as any).wsGameClient = client;

  // Setup keyboard controls
  const keyHandler = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        client.movePaddle('up');
        break;
      case 'KeyS':
      case 'ArrowDown':
        client.movePaddle('down');
        break;
    }
  };

  document.addEventListener('keydown', keyHandler);
  (container as any).keyHandler = keyHandler;

  try {
    await client.connectMultiplayer();
  } catch (error) {
    console.error('Failed to connect to multiplayer game:', error);
    gameStatusElement.textContent = 'Failed to connect to game service';
  }
}

function stopMultiplayerGame(container: HTMLElement) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const client = (container as any).wsGameClient as WebSocketGameClient;
  if (client) {
    client.disconnect();
  }
}

// Cleanup WebSocket game resources
export function cleanupWebSocketGame(container: HTMLElement): void {
  stopMultiplayerGame(container);

  const client = (container as any).wsGameClient as WebSocketGameClient;
  const keyHandler = (container as any).keyHandler;

  if (client) {
    delete (container as any).wsGameClient;
  }

  if (game) {
    game.cleanup();
    game = null;
  }

  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    delete (container as any).keyHandler;
  }
}
