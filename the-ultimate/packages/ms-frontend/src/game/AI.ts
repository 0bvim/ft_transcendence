import { Board, Side } from './Board';
import { Ball } from './Ball';
import { Paddle } from './Paddle';

export class AI {
	protected aiTargetY: number = Board.height / 2;
	protected aiPlayer: Paddle;
	protected aiOpponent: Paddle;
	protected aiSide: Side;
	protected aiX: number;
	protected opponentX: number;
	protected rightPaddleX: number;
	protected leftPaddleX: number;
	
	// Difficulty settings to make AI easier
	private accuracy: number = 0.5; // 50% accuracy (reduced from 70%)
	private reactionDelay: number = 0; // Simulated reaction delay
	private lastPredictionTime: number = 0;
	private maxReactionTime: number = 400; // Increased from 200ms to 400ms (slower reactions)

	constructor(aiPlayer: Paddle, aiOpponent: Paddle) {
		this.aiPlayer = aiPlayer;
		this.aiOpponent = aiOpponent;
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
		
		// Add some randomness to make each AI instance slightly different
		this.accuracy = 0.4 + Math.random() * 0.2; // 40-60% accuracy (reduced from 60-80%)
		this.reactionDelay = Math.random() * this.maxReactionTime;
	}

	predict(ball: Ball) {
		const currentTime = Date.now();
		
		// Add reaction delay to make AI more human-like
		if (currentTime - this.lastPredictionTime < this.reactionDelay) {
			return; // Skip this prediction due to reaction delay
		}
		
		this.lastPredictionTime = currentTime;
		
		if (ball.currentXSpeed === 0 && ball.currentYSpeed === 0) {
			this.aiTargetY = Board.height / 2;
			return;
		}

		let timeToReach: number = this.timeToReach(ball);

		if (timeToReach < 0) {
			// When ball is moving away, position more defensively (center-ish)
			this.aiTargetY = Board.height / 2 + (Math.random() - 0.5) * Board.height * 0.3;
			return;
		}

		let newBall: Ball = new Ball(ball);

		// Simplified prediction - only predict one bounce to make it less perfect
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
		
		let predictedY = this.predictBallComming(newBall, timeToReach);
		
		// Add inaccuracy to make AI more beatable
		const errorRange = Board.height * (1 - this.accuracy) * 0.5;
		const error = (Math.random() - 0.5) * errorRange;
		predictedY += error;
		
		// Sometimes make completely wrong predictions (15% chance)
		if (Math.random() < 0.15) { // Increased from 5% to 15%
			predictedY = Math.random() * Board.height;
		}
		
		// Clamp to board boundaries
		this.aiTargetY = Math.max(Paddle.height / 2, Math.min(Board.height - Paddle.height / 2, predictedY));
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

		// Reduced bounce prediction - only 3 bounces max to make it less perfect
		let bounces = 0;
		const maxBounces = 3; // Reduced from 10 to make AI less accurate

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

		predictedY = Math.max(Ball.radius, predictedY);
		predictedY = Math.min(Board.height - Ball.radius, predictedY);

		return predictedY;
	}

	movePaddle() {
		const current_y: number = this.aiPlayer.y + (Paddle.height / 2);
		
		// Increased tolerance to make AI less precise
		const tolerance = Board.height / 15; // Increased from /25 to /15 (even less precise)
		
		// Add some random hesitation (25% chance to not move)
		if (Math.random() < 0.25) { // Increased from 10% to 25%
			this.aiPlayer.goDown = false;
			this.aiPlayer.goUp = false;
			return;
		}

		if (current_y < this.aiTargetY - tolerance) {
			this.aiPlayer.goDown = true;
			this.aiPlayer.goUp = false;
		} else if (current_y > this.aiTargetY + tolerance) {
			this.aiPlayer.goUp = true;
			this.aiPlayer.goDown = false;
		} else {
			this.aiPlayer.goDown = false;
			this.aiPlayer.goUp = false;
		}
	}
}
