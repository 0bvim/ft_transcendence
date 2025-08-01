import { WebSocketGameClient, GameCallbacks as WSGameCallbacks } from '../../game/WebSocketGameClient';
import { WebSocketGameRenderer } from '../../game/WebSocketGameRenderer';

// Show multiplayer WebSocket game
export async function showMultiplayerGame(container: HTMLElement): Promise<void> {
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

  gameTitleElement.textContent = 'MULTIPLAYER MATCH';
  gameStatusElement.textContent = 'Connecting to game service...';
  gameStatusElement.classList.remove('hidden');

  const gameServiceUrl = `https://${window.location.hostname}:3002`;
  const renderer = new WebSocketGameRenderer(canvasContainer);
  
  const callbacks: WSGameCallbacks = {
    onConnected: (data) => {
      console.log('Connected to game service:', data);
      gameStatusElement.textContent = 'Waiting for opponent...';
    },
    
    onGameJoined: (data) => {
      console.log('Game joined:', data);
      gameStatusElement.textContent = 'Game starting...';
      
      if (data.opponent) {
        if (data.position === 'left') {
          p1NameElement.textContent = data.user?.username || 'YOU';
          p2NameElement.textContent = data.opponent.username || 'OPPONENT';
        } else {
          p1NameElement.textContent = data.opponent.username || 'OPPONENT';
          p2NameElement.textContent = data.user?.username || 'YOU';
        }
      }
    },
    
    onGameState: (gameState) => {
      renderer.updateGameState(gameState);
      
      const players = gameState.players;
      if (players.length >= 2) {
        const leftPlayer = players.find(p => p.position === 'left');
        const rightPlayer = players.find(p => p.position === 'right');
        
        if (leftPlayer && rightPlayer) {
          p1ScoreElement.textContent = (gameState.score[leftPlayer.id] || 0).toString();
          p2ScoreElement.textContent = (gameState.score[rightPlayer.id] || 0).toString();
        }
      }
      
      if (gameState.status === 'playing') {
        gameStatusElement.classList.add('hidden');
      }
    },
    
    onGameFinished: (data) => {
      gameStatusElement.textContent = `Game Over! ${data.winner ? 'Winner: ' + data.winner : 'Game finished'}`;
      gameStatusElement.classList.remove('hidden');
    },
    
    onPlayerLeft: (data) => {
      gameStatusElement.textContent = `Player ${data.username || data.playerId} left the game`;
      gameStatusElement.classList.remove('hidden');
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
  
  // Store client and renderer for cleanup
  (container as any).wsGameClient = client;
  (container as any).wsGameRenderer = renderer;
  
  // Setup keyboard controls
  const keyHandler = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        client.movePaddle('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
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

// Show local duel WebSocket game
export async function showLocalDuelGame(container: HTMLElement): Promise<void> {
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

  gameTitleElement.textContent = 'LOCAL DUEL';
  p1NameElement.textContent = 'PLAYER 1';
  p2NameElement.textContent = 'PLAYER 2';
  gameStatusElement.textContent = 'Connecting to local game...';
  gameStatusElement.classList.remove('hidden');

  const gameServiceUrl = `https://${window.location.hostname}:3002`;
  const renderer = new WebSocketGameRenderer(canvasContainer);
  
  const callbacks: WSGameCallbacks = {
    onConnected: (data) => {
      console.log('Connected to local game:', data);
      gameStatusElement.textContent = 'Ready for local duel! Use WASD and Arrow Keys';
    },
    
    onGameState: (gameState) => {
      renderer.updateGameState(gameState);
      
      const players = gameState.players;
      if (players.length >= 2) {
        const leftPlayer = players.find(p => p.position === 'left');
        const rightPlayer = players.find(p => p.position === 'right');
        
        if (leftPlayer && rightPlayer) {
          p1ScoreElement.textContent = (gameState.score[leftPlayer.id] || 0).toString();
          p2ScoreElement.textContent = (gameState.score[rightPlayer.id] || 0).toString();
        }
      }
      
      if (gameState.status === 'playing') {
        gameStatusElement.classList.add('hidden');
      }
    },
    
    onGameFinished: (data) => {
      gameStatusElement.textContent = `Game Over! ${data.winner ? 'Winner: ' + data.winner : 'Game finished'}`;
      gameStatusElement.classList.remove('hidden');
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
  
  // Store client and renderer for cleanup
  (container as any).wsGameClient = client;
  (container as any).wsGameRenderer = renderer;
  
  // Setup keyboard controls for both players
  const keyHandler = (event: KeyboardEvent) => {
    // Player 1 controls (WASD)
    switch (event.key) {
      case 'w':
      case 'W':
        client.movePaddle('up');
        break;
      case 's':
      case 'S':
        client.movePaddle('down');
        break;
      // Player 2 controls (Arrow keys) - would need separate connection
      case 'ArrowUp':
        // For local duel, we'd need to handle this differently
        // This is a simplified version
        client.movePaddle('up');
        break;
      case 'ArrowDown':
        client.movePaddle('down');
        break;
    }
  };
  
  document.addEventListener('keydown', keyHandler);
  (container as any).keyHandler = keyHandler;
  
  try {
    await client.connectLocal();
  } catch (error) {
    console.error('Failed to connect to local duel game:', error);
    gameStatusElement.textContent = 'Failed to connect to game service';
  }
}

// Cleanup WebSocket game resources
export function cleanupWebSocketGame(container: HTMLElement): void {
  const client = (container as any).wsGameClient as WebSocketGameClient;
  const renderer = (container as any).wsGameRenderer as WebSocketGameRenderer;
  const keyHandler = (container as any).keyHandler;
  
  if (client) {
    client.disconnect();
    delete (container as any).wsGameClient;
  }
  
  if (renderer) {
    renderer.destroy();
    delete (container as any).wsGameRenderer;
  }
  
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    delete (container as any).keyHandler;
  }
}
