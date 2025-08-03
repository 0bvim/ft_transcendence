const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Queue of waiting players
let waitingPlayer = null;

// Map of active games
const activeGames = new Map();
let gameIdCounter = 1;

wss.on('connection', (ws) => {
  console.log('New client connected');
  let playerId = null;
  let gameId = null;
  let username = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'join_queue':
          handleJoinQueue(ws, data);
          break;
        case 'paddle_move':
          handlePaddleMove(ws, data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handlePlayerDisconnect(ws);
  });

  function handleJoinQueue(ws, data) {
    username = data.username || 'Anonymous';
    playerId = generateId();

    console.log(`Player ${username} (${playerId}) joined queue`);

    // Send connected confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      playerId: playerId,
      username: username
    }));

    // If no one is waiting, become the waiting player
    if (!waitingPlayer) {
      waitingPlayer = { ws, playerId, username };
      console.log(`${username} is waiting for an opponent...`);

      // Tell the client they're waiting
      ws.send(JSON.stringify({
        type: 'waiting',
        message: 'Waiting for an opponent...'
      }));
    } else {
      // Match with the waiting player
      gameId = `game_${gameIdCounter++}`;
      const host = waitingPlayer;
      const client = { ws, playerId, username };

      console.log(`Matching ${host.username} with ${username}`);

      // Create a new game room
      const gameRoom = {
        id: gameId,
        host: host,
        client: client,
        startTime: Date.now()
      };

      activeGames.set(gameId, gameRoom);

      // Notify both players about the match
      host.ws.send(JSON.stringify({
        type: 'game_joined',
        gameId: gameId,
        user: { playerId: host.playerId, username: host.username },
        opponent: { playerId: client.playerId, username: client.username },
        position: 'left',
        isHost: true
      }));

      client.ws.send(JSON.stringify({
        type: 'game_joined',
        gameId: gameId,
        user: { playerId: client.playerId, username: client.username },
        opponent: { playerId: host.playerId, username: host.username },
        position: 'right',
        isHost: false
      }));

      // Reset waiting player
      waitingPlayer = null;
    }
  }

  function handlePaddleMove(ws, data) {
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    // Determine opponent and relay the movement
    let opponent;
    if (game.host.playerId === playerId) {
      opponent = game.client;
    } else if (game.client.playerId === playerId) {
      opponent = game.host;
    } else {
      return;
    }

    opponent.ws.send(JSON.stringify({
      type: 'opponent_move',
      direction: data.direction,
      position: data.position
    }));
  }

  function handlePlayerDisconnect() {
    // If this was the waiting player, clear the waiting queue
    if (waitingPlayer && waitingPlayer.playerId === playerId) {
      waitingPlayer = null;
      return;
    }

    // Notify opponent if player was in a game
    for (const [id, game] of activeGames.entries()) {
      let opponent = null;

      if (game.host.playerId === playerId) {
        opponent = game.client;
      } else if (game.client.playerId === playerId) {
        opponent = game.host;
      } else {
        continue;
      }

      opponent.ws.send(JSON.stringify({
        type: 'player_left',
        username: username,
        message: `${username} has disconnected. You win!`
      }));

      activeGames.delete(id);
      break;
    }
  }
});

// Add HTTP health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Helper to generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Start the server
const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
