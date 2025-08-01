import { Board, Side } from './Board';
import { Ball } from './Ball';
import { Paddle } from './Paddle';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export class AI {
	protected aiTargetY: number = Board.height / 2;
	protected aiPlayer: Paddle;
	protected aiOpponent: Paddle;
	protected aiSide: Side;
	protected aiX: number;
	protected opponentX: number;
	protected rightPaddleX: number;
	protected leftPaddleX: number;
	
	// Difficulty-based parameters
	protected difficulty: AIDifficulty;
	protected tolerance: number;
	protected predictionAccuracy: number;
	protected reactionDelay: number;
	protected lastMoveTime: number = 0;

	constructor(_ball: Ball, aiPlayer: Paddle, aiOpponent: Paddle, difficulty: AIDifficulty = 'MEDIUM') {
		this.aiPlayer = aiPlayer;
		this.aiOpponent = aiOpponent;
		this.difficulty = difficulty;
		
		// Set difficulty-based parameters
		switch (difficulty) {
			case 'EASY':
				this.tolerance = Board.height / 10; // Large tolerance, more room for error
				this.predictionAccuracy = 0.2; // 20% accuracy, lots of mistakes
				this.reactionDelay = 800; // 500ms delay between moves
				break;
			case 'MEDIUM':
				this.tolerance = Board.height / 25; // Medium tolerance
				this.predictionAccuracy = 0.5; // 50% accuracy, some mistakes
				this.reactionDelay = 500; // 500ms delay between moves
				break;
			case 'HARD':
				this.tolerance = Board.height / 30; // Very precise
				this.predictionAccuracy = 0.7; // 70% accuracy, nearly perfect
				this.reactionDelay = 250; // 250ms delay, very fast reactions
				break;
		}
		
		if (aiPlayer.x > aiOpponent.x) {
			this.aiSide = Side.Right;
			this.rightPaddleX = aiPlayer.x;
			this.leftPaddleX = aiOpponent.x;
		} else {
			this.aiSide = Side.Left;
			this.leftPaddleX = aiPlayer.x;
			this.rightPaddleX = aiOpponent.x;
		}
		
		this.aiX = aiPlayer.x;
		this.opponentX = aiOpponent.x;
	}

	update(ball: Ball, currentTime: number) {
		// Check if enough time has passed since last move (reaction delay)
		if (currentTime - this.lastMoveTime < this.reactionDelay) {
			return;
		}

		// Predict where the ball will be when it reaches the AI paddle
		const predictedY = this.predictBallPosition(ball);
		
		// Add some randomness based on difficulty
		const randomError = (Math.random() - 0.5) * (1 - this.predictionAccuracy) * Board.height / 4;
		this.aiTargetY = predictedY + randomError;
		
		// Ensure target is within bounds
		this.aiTargetY = Math.max(Paddle.height / 2, Math.min(Board.height - Paddle.height / 2, this.aiTargetY));
		
		// Calculate paddle center
		const paddleCenter = this.aiPlayer.y + Paddle.height / 2;
		const distanceToTarget = this.aiTargetY - paddleCenter;
		
		// Only move if outside tolerance
		if (Math.abs(distanceToTarget) > this.tolerance) {
			// Reset movement flags
			this.aiPlayer.goUp = false;
			this.aiPlayer.goDown = false;
			
			if (distanceToTarget > 0) {
				this.aiPlayer.goDown = true;
			} else {
				this.aiPlayer.goUp = true;
			}
			
			this.lastMoveTime = currentTime;
		} else {
			// Stop moving if within tolerance
			this.aiPlayer.goUp = false;
			this.aiPlayer.goDown = false;
		}
	}

	protected predictBallPosition(ball: Ball): number {
		// Simple prediction: where will the ball be when it reaches the AI paddle?
		const ballX = ball.posX;
		const ballY = ball.posY;
		const ballSpeedX = ball.speedX;
		const ballSpeedY = ball.speedY;
		
		// If ball is moving away from AI, return current ball position
		if ((this.aiSide === Side.Left && ballSpeedX > 0) || 
			(this.aiSide === Side.Right && ballSpeedX < 0)) {
			return ballY + Ball.radius;
		}
		
		// Calculate time for ball to reach AI paddle
		const distanceToAI = Math.abs(ballX - this.aiX);
		const timeToReach = distanceToAI / Math.abs(ballSpeedX);
		
		// Predict Y position
		let predictedY = ballY + (ballSpeedY * timeToReach);
		
		// Account for bounces off top/bottom walls
		while (predictedY < 0 || predictedY > Board.height) {
			if (predictedY < 0) {
				predictedY = -predictedY;
			} else if (predictedY > Board.height) {
				predictedY = 2 * Board.height - predictedY;
			}
		}
		
		return predictedY;
	}

	// Reset AI state
	reset() {
		this.aiTargetY = Board.height / 2;
		this.lastMoveTime = 0;
		this.aiPlayer.goUp = false;
		this.aiPlayer.goDown = false;
	}

	// Get current difficulty
	getDifficulty(): AIDifficulty {
		return this.difficulty;
	}

	// Set new difficulty
	setDifficulty(difficulty: AIDifficulty) {
		this.difficulty = difficulty;
		
		// Update parameters based on new difficulty
		switch (difficulty) {
			case 'EASY':
				this.tolerance = Board.height / 10;
				this.predictionAccuracy = 0.2;
				this.reactionDelay = 800;
				break;
			case 'MEDIUM':
				this.tolerance = Board.height / 25;
				this.predictionAccuracy = 0.5;
				this.reactionDelay = 500;
				break;
			case 'HARD':
				this.tolerance = Board.height / 30;
				this.predictionAccuracy = 0.7;
				this.reactionDelay = 250;
				break;
		}
	}
}
