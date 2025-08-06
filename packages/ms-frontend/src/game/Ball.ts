import p5 from 'p5';
import { Board } from "./Board";
import { Side } from "./Board";

export class Ball {
static readonly radius: number = Math.min(Board.width, Board.height) / 50;
	static readonly startSpeed: number = Board.diag / 250;
	static readonly accelerationAmort: number = 80;
	static readonly acceleration: number = 1.4;
	static readonly drag: number = 1.0;
	protected		x: number = Board.width / 2 - Ball.radius;
	protected		y: number = Board.height / 2 - Ball.radius;
	protected		nBounces: number = 0;
	protected		ySpeed: number = 0;
	protected		xSpeed: number = 0;

	constructor();
	constructor(other: Ball);
	constructor(other?: Ball) {
		if (other) {
			this.x = other.x;
			this.y = other.y;
			this.xSpeed = other.xSpeed;
			this.ySpeed = other.ySpeed;
		}
	}

	draw(p: p5) {
		p.stroke(255);
		p.fill(255);
		p.square(this.x, this.y, 2 * Ball.radius);
	}

	reset(side: Side) {
		this.x = Board.width / 2 - Ball.radius;
		this.y = Board.height / 2 - Ball.radius;
		this.xSpeed = Ball.randomBetween(0.5 * Ball.startSpeed, 0.8 * Ball.startSpeed);
		this.ySpeed = Math.sqrt(Ball.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side === Side.Right ? 1 : -1;
		this.ySpeed *= Math.random() < 0.5 ? -1 : 1;
		this.nBounces = 0;
	}

	update() {
		if (this.xSpeed === 0 && this.ySpeed === 0) {
			this.reset(Side.Left);
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	static randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	accelerate() {
		++this.nBounces;
		const acceleration: number = 1 + Ball.acceleration / Math.sqrt(Ball.accelerationAmort * this.nBounces);
		this.xSpeed *= acceleration
		this.ySpeed *= acceleration;
	}

	invertXSpeed() {
		this.xSpeed *= -1;
	}

	invertYSpeed() {
		this.ySpeed *= -1;
	}

	collisionFromBottomToTop(y_level: number): boolean {
		if (this.ySpeed < 0 && this.y <= y_level) {
			this.y = y_level;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromTopToBottom(y_level: number): boolean {
		if (this.ySpeed > 0 && this.y +  2 * Ball.radius >= y_level) {
			this.y = y_level - 2 * Ball.radius;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromRightToLeft(x_level: number): boolean {
		if (this.xSpeed < 0 && this.x <= x_level) {
			this.x = x_level;
			this.invertXSpeed();
			this.accelerate();
			return true;
		}
		return false;
	}

	collisionFromLeftToRight(x_level: number): boolean {
		if (this.xSpeed > 0 && this.x + 2 * Ball.radius >= x_level) {
			this.x = x_level - 2 * Ball.radius;
			this.invertXSpeed();
			this.accelerate();
			return true;
		}
		return false;
	}

	isInFrontOf(lower_y: number, higher_y: number): boolean {
		return this.bottonY >= higher_y && this.topY <= lower_y;
	}

	ballPaddleHit(paddleSpeed: number) {
		this.ySpeed += paddleSpeed * Ball.drag;

		const maxYSpeed = Math.abs(this.xSpeed);
		this.ySpeed = Math.max(-maxYSpeed, Math.min(maxYSpeed, this.ySpeed));
	}

	get currentX(): number {
		return this.x;
	}

	get currentY(): number {
		return this.y;
	}

	get currentXSpeed(): number {
		return this.xSpeed;
	}

	get currentYSpeed(): number {
		return this.ySpeed;
	}

	get centerX(): number {
		return this.x + Ball.radius;
	}

	get centerY(): number {
		return this.y + Ball.radius;
	}

	get topY(): number {
		return this.y;
	}

	get rightX(): number {
		return this.x + 2 * Ball.radius;
	}

	get bottonY(): number {
		return this.y + 2 * Ball.radius;
	}

	get leftX(): number {
		return this.x;
	}

	setBallPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	setBallSpeed(xSpeed: number, ySpeed: number) {
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
	}
}
