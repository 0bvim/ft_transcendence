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
		this.aiTargetY = this.predictBallComming(newBall, timeToReach);

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

		predictedY = Math.max(Ball.radius, predictedY);
		predictedY = Math.min(Board.height - Ball.radius, predictedY);

		return predictedY;
	}

	movePaddle() {
		const current_y: number = this.aiPlayer.y + (Paddle.height / 2);
		const tolerance = Board.height / 50;

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
