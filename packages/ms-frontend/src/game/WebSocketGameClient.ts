export interface GameState {
  id: string;
  players: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    position: 'left' | 'right';
  }>;
  ball: {
    x: number;
    y: number;
    radius: number;
  };
  score: { [playerId: string]: number };
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  winner?: string;
  config: {
    canvasWidth: number;
    canvasHeight: number;
  };
}

export interface GameCallbacks {
  onConnected?: (data: any) => void;
  onGameJoined?: (data: any) => void;
  onGameState?: (gameState: GameState) => void;
  onGameFinished?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onError?: (error: string) => void;
  onDisconnected?: () => void;
}

export class WebSocketGameClient {
  private ws: WebSocket | null = null;
  private callbacks: GameCallbacks;
  private gameServiceUrl: string;
  private playerId: string | null = null;
  private gameId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(gameServiceUrl: string, callbacks: GameCallbacks) {
    this.gameServiceUrl = gameServiceUrl;
    this.callbacks = callbacks;
  }

  async connectMultiplayer(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.callbacks.onError?.('Authentication token not found');
      return;
    }

    const wsUrl = `${this.gameServiceUrl}/ws/multiplayer?token=${encodeURIComponent(token)}`;
    await this.connect(wsUrl);
  }

  async connectLocal(): Promise<void> {
    const wsUrl = `${this.gameServiceUrl}/ws/local`;
    await this.connect(wsUrl);
  }

  async connectTournament(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.callbacks.onError?.('Authentication token not found');
      return;
    }

    const wsUrl = `${this.gameServiceUrl}/ws/tournament?token=${encodeURIComponent(token)}`;
    await this.connect(wsUrl);
  }

  private async connect(wsUrl: string): Promise<void> {
    try {
      const websocketUrl = wsUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      
      this.ws = new WebSocket(websocketUrl);

      this.ws.onopen = () => {
        console.log('Connected to game service');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.callbacks.onDisconnected?.();
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(wsUrl);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.callbacks.onError?.('Connection error');
      };

    } catch (error) {
      console.error('Failed to connect to game service:', error);
      this.callbacks.onError?.('Failed to connect to game service');
    }
  }

  private attemptReconnect(wsUrl: string): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(wsUrl);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'connected':
        this.playerId = message.data.playerId;
        this.callbacks.onConnected?.(message.data);
        break;

      case 'gameJoined':
      case 'localGameJoined':
      case 'tournamentGameJoined':
        this.gameId = message.data.gameId;
        this.callbacks.onGameJoined?.(message.data);
        break;

      case 'gameState':
        this.callbacks.onGameState?.(message.data);
        break;

      case 'gameFinished':
        this.callbacks.onGameFinished?.(message.data);
        break;

      case 'playerLeft':
        this.callbacks.onPlayerLeft?.(message.data);
        break;

      case 'playerDisconnected':
        this.callbacks.onError?.(`Player ${message.data.playerId} disconnected`);
        break;

      case 'pong':
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  movePaddle(direction: 'up' | 'down'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'move',
        data: { direction }
      }));
    }
  }

  createLocalGame(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'createLocalGame'
      }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.playerId = null;
    this.gameId = null;
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get currentPlayerId(): string | null {
    return this.playerId;
  }

  get currentGameId(): string | null {
    return this.gameId;
  }
}
