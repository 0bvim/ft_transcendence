import { GameState, PaddleState, BallState, GameConfig } from './types';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export class AIOpponent {
  private aiPlayerId: string;
  private difficulty: AIDifficulty;
  private config: GameConfig;

  // Difficulty-based parameters
  private tolerance: number = 0;
  private predictionAccuracy: number = 0.5;
  private reactionDelay: number = 500; // ms
  private lastMoveTime: number = 0;

  constructor(aiPlayerId: string, config: GameConfig, difficulty: AIDifficulty = 'MEDIUM') {
    this.aiPlayerId = aiPlayerId;
    this.config = config;
    this.difficulty = difficulty;
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
    switch (difficulty) {
      case 'EASY':
        this.tolerance = this.config.canvasHeight / 10;
        this.predictionAccuracy = 0.3; // Less accurate
        this.reactionDelay = 400;
        break;
      case 'MEDIUM':
        this.tolerance = this.config.canvasHeight / 20;
        this.predictionAccuracy = 0.6;
        this.reactionDelay = 250;
        break;
      case 'HARD':
        this.tolerance = this.config.canvasHeight / 30;
        this.predictionAccuracy = 0.85; // More accurate
        this.reactionDelay = 100;
        break;
    }
  }

  private predictBallY(gameState: GameState): number {
    const { ball, players } = gameState;
    const aiPaddle = players.get(this.aiPlayerId);

    if (!aiPaddle) return this.config.canvasHeight / 2;

    // If ball is moving away, don't move
    if ((aiPaddle.position === 'left' && ball.vx > 0) || (aiPaddle.position === 'right' && ball.vx < 0)) {
        return aiPaddle.y + aiPaddle.height / 2;
    }

    const distanceToPaddle = Math.abs(ball.x - aiPaddle.x);
    const timeToReach = distanceToPaddle / Math.abs(ball.vx);
    let predictedY = ball.y + ball.vy * timeToReach;

    // Account for wall bounces
    if (predictedY < 0) {
      predictedY = -predictedY;
    } else if (predictedY > this.config.canvasHeight) {
      predictedY = 2 * this.config.canvasHeight - predictedY;
    }

    return predictedY;
  }

  update(gameState: GameState): 'up' | 'down' | null {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.reactionDelay) {
      return null; // Waiting for reaction time
    }

    const aiPaddle = gameState.players.get(this.aiPlayerId);
    if (!aiPaddle) return null;

    const predictedY = this.predictBallY(gameState);

    // Add randomness based on prediction accuracy
    const randomError = (Math.random() - 0.5) * (1 - this.predictionAccuracy) * this.config.canvasHeight;
    const targetY = predictedY + randomError;

    const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
    const distanceToTarget = targetY - paddleCenter;

    if (Math.abs(distanceToTarget) > this.tolerance) {
      this.lastMoveTime = currentTime;
      return distanceToTarget > 0 ? 'down' : 'up';
    }

    return null;
  }
}
