export interface GameCallbacks {
  onConnected?: (data: any) => void;
  onWaiting?: (message: string) => void;
  onGameJoined?: (data: any) => void;
  onOpponentMove?: (direction: string, position: string) => void;
  onPlayerLeft?: (data: any) => void;
  onError?: (error: string) => void;
  onDisconnected?: () => void;
}

export class WebSocketGameClient {
  private ws: WebSocket | null = null;
  private gameServiceUrl: string;
  private callbacks: GameCallbacks;
  private playerId: string | null = null;
  private gameId: string | null = null;
  private isHost: boolean = false;
  private playerPosition: 'left' | 'right' = 'left';
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(gameServiceUrl: string, callbacks: GameCallbacks) {
    this.gameServiceUrl = gameServiceUrl;
    this.callbacks = callbacks;
  }

  async connectAndJoinQueue(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to game service...');
        this.ws = new WebSocket(this.gameServiceUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          
          // Join queue when connected
          this.sendMessage({
            type: 'join_queue',
            username: username
          });
          
          resolve();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks.onError?.('Failed to connect to game service');
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.callbacks.onDisconnected?.();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        this.callbacks.onError?.('Failed to connect to game service');
        reject(error);
      }
    });
  }

  private handleMessage(message: any): void {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'connected':
        this.playerId = message.playerId;
        this.callbacks.onConnected?.(message);
        break;
        
      case 'waiting':
        this.callbacks.onWaiting?.(message.message);
        break;
        
      case 'game_joined':
        this.gameId = message.gameId;
        this.isHost = message.isHost;
        this.playerPosition = message.position;
        this.setupKeyboardControls();
        this.callbacks.onGameJoined?.(message);
        break;
        
      case 'opponent_move':
        this.callbacks.onOpponentMove?.(message.direction, message.position);
        break;
        
      case 'player_left':
        this.callbacks.onPlayerLeft?.(message);
        this.cleanupKeyboardControls();
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private setupKeyboardControls(): void {
    this.keyHandler = (event: KeyboardEvent) => {
      // Check if these are game control keys
      const gameKeys = ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'];
      
      if (gameKeys.includes(event.code)) {
        event.preventDefault(); // Prevent browser scrolling
        
        if (event.type === 'keydown') {
          let direction: string = '';
          
          switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
              direction = 'up';
              break;
            case 'KeyS':
            case 'ArrowDown':
              direction = 'down';
              break;
          }
          
          if (direction) {
            this.movePaddle(direction);
          }
        }
      }
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  private cleanupKeyboardControls(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  movePaddle(direction: 'up' | 'down'): void {
    this.sendMessage({
      type: 'paddle_move',
      direction: direction,
      position: this.playerPosition
    });
  }

  private sendMessage(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    this.cleanupKeyboardControls();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get currentPlayerId(): string | null {
    return this.playerId;
  }
  
  get currentGameId(): string | null {
    return this.gameId;
  }
  
  get currentPosition(): 'left' | 'right' {
    return this.playerPosition;
  }
  
  get isGameHost(): boolean {
    return this.isHost;
  }
}