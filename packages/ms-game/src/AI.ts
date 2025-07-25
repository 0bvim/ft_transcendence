import { Board, Side } from './Board'
import { Ball } from './Ball'
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

	constructor(ball: Ball, aiPlayer: Paddle, aiOpponent: Paddle, difficulty: AIDifficulty = 'MEDIUM') {
		this.aiPlayer = aiPlayer;
		this.aiOpponent = aiOpponent;
		this.difficulty = difficulty;
		
		// Set difficulty-based parameters
		switch (difficulty) {
			case 'EASY':
				this.tolerance = Board.height / 20; // Large tolerance, more room for error
				this.predictionAccuracy = 0.6; // 60% accuracy, lots of mistakes
				this.reactionDelay = 200; // 200ms delay between moves
				break;
			case 'MEDIUM':
				this.tolerance = Board.height / 35; // Medium tolerance
				this.predictionAccuracy = 0.8; // 80% accuracy, some mistakes
				this.reactionDelay = 100; // 100ms delay between moves
				break;
			case 'HARD':
				this.tolerance = Board.height / 50; // Very precise
				this.predictionAccuracy = 0.95; // 95% accuracy, nearly perfect
				this.reactionDelay = 50; // 50ms delay, very fast reactions
				break;
		}
		
		if (aiPlayer.x > aiOpponent.x) {
			this.aiSide = Side.Right;
			this.rightPaddleX = aiPlayer.x;
			this.leftPaddleX = aiOpponent.x + Paddle.width;
			this.aiX = aiPlayer.x;
			this.opponentX = aiOpponent.x + Paddle.width;
		} else {
			this.aiSide = Side.Left;
			this.rightPaddleX = aiOpponent.x;
			this.leftPaddleX = aiPlayer.x + Paddle.width;
			this.aiX = aiPlayer.x + Paddle.width;
			this.opponentX = aiOpponent.x;
		}
	}

	predict(ball: Ball) {
		if (ball.currentXSpeed === 0 && ball.currentYSpeed === 0) {
			this.aiTargetY = Board.height / 2;
			return;
		}

		let timeToReach: number;

		timeToReach = this.timeToReach(ball);

		if (timeToReach < 0) {
			this.aiTargetY = Board.height / 2;
			return;
		}

		let newBall: Ball = new Ball(ball);

		if (this.isBallMovingAway(newBall)) {
			const predictedY: number = this.predictBallComming(newBall, timeToReach);
			if (newBall.currentXSpeed < 0) {
				newBall.setBallPosition(this.leftPaddleX, predictedY - Ball.radius)
			} else {
				newBall.setBallPosition(this.rightPaddleX - 2 * Ball.radius, predictedY - Ball.radius)
			}
			newBall.invertXSpeed();
			newBall.accelerate();
			timeToReach = this.timeToReach(newBall);
		}
		
		let targetY = this.predictBallComming(newBall, timeToReach);
		
		// Add difficulty-based prediction errors
		if (Math.random() > this.predictionAccuracy) {
			// Add random error based on difficulty
			const maxError = this.difficulty === 'EASY' ? Board.height / 4 : 
							 this.difficulty === 'MEDIUM' ? Board.height / 8 : 
							 Board.height / 16;
			
			const error = (Math.random() - 0.5) * maxError;
			targetY += error;
			
			// For EASY difficulty, sometimes completely miss on purpose
			if (this.difficulty === 'EASY' && Math.random() < 0.1) {
				targetY = Math.random() * Board.height;
			}
		}
		
		// Clamp target to board bounds
		this.aiTargetY = Math.max(Paddle.height / 2, 
						 Math.min(Board.height - Paddle.height / 2, targetY));
	}

	timeToReach(ball: Ball): number {
		let targetX: number;
		let ballX: number;

		if (ball.currentXSpeed > 0) {
			targetX = this.rightPaddleX;
			ballX = ball.rightX;
		} else {
			targetX = this.leftPaddleX;
			ballX = ball.leftX;
		}

		const distance: number = targetX - ballX;

		return distance / ball.currentXSpeed;
	}

	isBallMovingAway(ball: Ball): boolean {
		if (this.aiSide === Side.Left && ball.currentXSpeed > 0) return true;
		if (this.aiSide === Side.Right && ball.currentXSpeed < 0) return true;
		return false;
	}

	predictBallComming(ball: Ball, timeToReach: number): number {
		let predictedY: number = ball.centerY + (ball.currentYSpeed * timeToReach);

		let bounces = 0;
		const maxBounces = 10;

		if (ball.currentYSpeed === 0) {
			return Math.max(Ball.radius, Math.min(Board.height - Ball.radius, predictedY));
		}

		while ((predictedY - Ball.radius < 0 || predictedY + Ball.radius > Board.height) && bounces < maxBounces) {
			if (predictedY - Ball.radius < 0) { // Hit top wall
				predictedY = -(predictedY - Ball.radius) + Ball.radius;
			}
			if (predictedY + Ball.radius > Board.height) { // Hit bottom wall
				predictedY = 2 * Board.height - predictedY;
			}
			bounces++;
		}

		// Final clamping to ensure the ball center is such that the ball is within bounds.
		// This is a safeguard, especially if timeToReach is very large or bounces calculation has issues.
		predictedY = Math.max(Ball.radius, predictedY);
		predictedY = Math.min(Board.height - Ball.radius, predictedY);

		return predictedY;
	}

	movePaddle() {
		// Implement reaction delay - AI doesn't move immediately
		const currentTime = Date.now();
		if (currentTime - this.lastMoveTime < this.reactionDelay) {
			return; // Still in delay period, don't move
		}
		
		const current_y: number = this.aiPlayer.y + (Paddle.height / 2);

		if (current_y < this.aiTargetY - this.tolerance) {
			this.aiPlayer.goDown = true;
			this.aiPlayer.goUp = false;
			this.lastMoveTime = currentTime;
		} else if (current_y > this.aiTargetY + this.tolerance) {
			this.aiPlayer.goUp = true;
			this.aiPlayer.goDown = false;
			this.lastMoveTime = currentTime;
		} else {
			this.aiPlayer.goDown = false;
			this.aiPlayer.goUp = false;
		}
		
		// For EASY difficulty, add some jittery movement
		if (this.difficulty === 'EASY' && Math.random() < 0.05) {
			// 5% chance to make a random movement
			const randomMove = Math.random();
			if (randomMove < 0.33) {
				this.aiPlayer.goUp = true;
				this.aiPlayer.goDown = false;
			} else if (randomMove < 0.66) {
				this.aiPlayer.goDown = true;
				this.aiPlayer.goUp = false;
			} else {
				this.aiPlayer.goUp = false;
				this.aiPlayer.goDown = false;
			}
		}
	}

}
