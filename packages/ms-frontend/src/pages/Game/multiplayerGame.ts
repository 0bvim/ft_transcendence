import { PongGame, GameState, GameConfig } from '../../game/PongGame';
import { WebSocketGameClient } from '../../game/WebSocketGameClient';

let wsClient: WebSocketGameClient | null = null;
let game: PongGame | null = null;

export function cleanupMultiplayerGame(): void {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }

  if (game) {
    game.destroy();
    game = null;
  }
}

export async function findMultiplayerMatch(container: HTMLElement, username: string): Promise<void> {
  console.log('Finding multiplayer match for:', username);
  cleanupMultiplayerGame();

  const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;
  if (gameStatusElement) {
    gameStatusElement.textContent = 'Connecting to game service...';
    gameStatusElement.classList.remove('hidden');
    gameStatusElement.style.display = 'block';
  }

  const gameServiceUrl = process.env.GAME_SERVER_URL || `ws://${window.location.hostname}:3002`;
  console.log('Connecting to:', gameServiceUrl);

  wsClient = new WebSocketGameClient(gameServiceUrl, {
    onConnected: () => {
      console.log('Connected to game service');
    },

    onWaiting: (message) => {
      console.log('Waiting message:', message);
      if (gameStatusElement) {
        gameStatusElement.textContent = message;
      }
    },

    onGameJoined: (data) => {
      console.log('Game joined:', data);
      if (gameStatusElement) {
        gameStatusElement.style.display = 'none';
      }

      startMultiplayerGame(container, {
        username: data.user.username,
        opponent: data.opponent.username,
        position: data.position,
        isHost: data.isHost
      });
    },

    onOpponentMove: (direction, position) => {
      if (!game) return;

      const player1 = game['player1'];
      const player2 = game['player2'];

      if (!player1 || !player2) return;

      // Determine which paddle to move based on opponent position
      const paddle = position === 'left' ? player1 : player2;

      if (direction === 'up') {
        paddle.goUp = true;
        paddle.goDown = false;
      } else if (direction === 'down') {
        paddle.goDown = true;
        paddle.goUp = false;
      } else {
        paddle.goUp = false;
        paddle.goDown = false;
      }
    },

    onPlayerLeft: (data) => {
      console.log('Player left:', data);
      if (gameStatusElement) {
        gameStatusElement.textContent = data.message;
        gameStatusElement.style.display = 'block';
      }

      // End the game if it's still running
      if (game && game.getCurrentState() === GameState.Playing) {
        const winner = username;
        const player1Score = game['player1']?.getScore() || 0;
        const player2Score = game['player2']?.getScore() || 0;

        game['callbacks'].onGameEnd(winner, {
          player1: player1Score,
          player2: player2Score
        });
      }
    },

    onError: (error) => {
      console.error('Game service error:', error);
      if (gameStatusElement) {
        gameStatusElement.textContent = `Error: ${error}`;
        gameStatusElement.style.display = 'block';
      }
    },

    onDisconnected: () => {
      console.log('Disconnected from game service');
      if (gameStatusElement && !game) {
        gameStatusElement.textContent = 'Disconnected from game service';
        gameStatusElement.style.display = 'block';
      }
    }
  });

  try {
    await wsClient.connectAndJoinQueue(username);
  } catch (error) {
    console.error('Failed to connect to multiplayer game:', error);
    if (gameStatusElement) {
      gameStatusElement.textContent = 'Failed to connect to game service';
      gameStatusElement.style.display = 'block';
    }
    throw error;
  }
}

function startMultiplayerGame(container: HTMLElement, options: {
  username: string;
  opponent: string;
  position: 'left' | 'right';
  isHost: boolean;
}): void {
  console.log('Starting multiplayer game with options:', options);

  // Create canvas container if it doesn't exist
  let canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
  if (!canvasContainer) {
    canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvasContainer';
    container.appendChild(canvasContainer);
  }

  // Create score display if it doesn't exist
  let scoreDisplay = container.querySelector('#scoreDisplay') as HTMLElement;
  if (!scoreDisplay) {
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.classList.add('score-display');
    container.insertBefore(scoreDisplay, canvasContainer);
  }

  // Configure the game
  const gameConfig: GameConfig = {
    player1Name: options.position === 'left' ? options.username : options.opponent,
    player2Name: options.position === 'left' ? options.opponent : options.username,
    player1IsAI: false,
    player2IsAI: false,
    targetScore: 5
  };

  // Create game instance
  game = new PongGame(gameConfig, {
    onScoreUpdate: (player1Score, player2Score) => {
      if (scoreDisplay) {
        scoreDisplay.textContent = `${gameConfig.player1Name} ${player1Score} - ${player2Score} ${gameConfig.player2Name}`;
      }
    },

    onGameStateChange: (state) => {
      console.log('Game state changed:', state);

      // Show appropriate messages based on game state
      const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;
      if (gameStatusElement) {
        if (state === GameState.Ready) {
          gameStatusElement.textContent = 'Press SPACE to start';
          gameStatusElement.style.display = 'block';
        } else if (state === GameState.GameOver) {
          gameStatusElement.textContent = 'Game Over! Press R to restart';
          gameStatusElement.style.display = 'block';
        } else {
          gameStatusElement.style.display = 'none';
        }
      }
    },

    onGameEnd: (winner, finalScore) => {
      console.log('Game ended. Winner:', winner, 'Score:', finalScore);

      // Show game over message
      const gameStatusElement = container.querySelector('#gameStatus') as HTMLElement;
      if (gameStatusElement) {
        gameStatusElement.textContent = `Game Over! ${winner} wins!`;
        gameStatusElement.style.display = 'block';
      }
    }
  });

  // Initialize the game
  game.init(canvasContainer);

  // Override the handlePlayerInput method to work with multiplayer
  if (game) {
    const originalHandlePlayerInput = game['handlePlayerInput'];

    // Create a new function that only controls the local player's paddle
    game['handlePlayerInput'] = function (): void {
      if (!this.player1 || !this.player2) return;

      // Determine which paddle the local player controls
      const localPaddle = options.position === 'left' ? this.player1 : this.player2;

      // Set paddle movement based on keys
      localPaddle.goUp = !!this.keys['KeyW'] || !!this.keys['ArrowUp'];
      localPaddle.goDown = !!this.keys['KeyS'] || !!this.keys['ArrowDown'];

      // Send paddle movements to the server
      if (wsClient) {
        if (localPaddle.goUp) {
          wsClient.movePaddle('up');
        } else if (localPaddle.goDown) {
          wsClient.movePaddle('down');
        }
      }
    };
  }

  // If this client is the host, start the game after a brief delay
  if (options.isHost) {
    setTimeout(() => {
      game?.startGame();
    }, 1000);
  }
}
