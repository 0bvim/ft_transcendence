import { WebSocket } from 'ws';

export interface PlayerConnection {
  id: string;
  socket: WebSocket;
  gameId?: string;
  userId?: string; // From JWT token
  username?: string; // From JWT token
  isAuthenticated: boolean;
  disconnectTimer?: NodeJS.Timeout;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  playerId?: string;
}

export interface GameState {
  id: string;
  players: Map<string, PaddleState>;
  ball: BallState;
  score: { [playerId: string]: number };
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  winner?: string;
  createdAt: Date;
  lastUpdate: Date;
}

export interface PaddleState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  position: 'left' | 'right';
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  paddleSpeed: number;
  ballRadius: number;
  ballSpeed: number;
  maxScore: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface JWTPayload {
  sub: string; // user id
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export interface GameMode {
  type: 'multiplayer' | 'local' | 'tournament';
  requiresAuth: boolean;
  maxPlayers: number;
}
