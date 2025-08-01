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
