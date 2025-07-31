import p5 from 'p5';
import { Board } from "./Board";
import { Side } from "./Board";

export class Ball {
	static readonly radius: number = Math.min(Board.width, Board.height) / 50;
	static readonly startSpeed: number = Board.diag / 142;
	static readonly accelerationAmort: number = 100;
	static readonly acceleration: number = 1.2;
	static readonly drag: number = 1.0;
	protected		x: number = 0;
	protected		y: number = 0;
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

	reset(side: Side) {
		this.x = Board.width / 2 - Ball.radius;
		this.y = Board.height / 2 - Ball.radius;
		this.xSpeed = Ball.randomBetween(0.5 * Ball.startSpeed, 0.8 * Ball.startSpeed);
		this.ySpeed = Math.sqrt(Ball.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side === Side.Right ? 1 : -1;
		this.ySpeed *= Math.random() > 0.5 ? -1 : 1;
		this.nBounces = 0;
	}

	resetToCenter() {
		this.x = Board.width / 2 - Ball.radius;
		this.y = Board.height / 2 - Ball.radius;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.nBounces = 0;
	}

	update() {
		if (this.xSpeed === 0 && this.ySpeed === 0) {
			this.reset(Side.Left);
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;

		// Top and bottom wall collision
		if (this.y <= 0 || this.y + Ball.radius * 2 >= Board.height) {
			this.ySpeed *= -1;
			this.y = this.y <= 0 ? 0 : Board.height - Ball.radius * 2;
		}
	}

	draw(p: p5) {
		p.fill(255);
		p.noStroke();
		p.ellipse(this.x + Ball.radius, this.y + Ball.radius, Ball.radius * 2);
	}

	// Collision detection with paddle
	collidesWith(paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number): boolean {
		return (
			this.x < paddleX + paddleWidth &&
			this.x + Ball.radius * 2 > paddleX &&
			this.y < paddleY + paddleHeight &&
			this.y + Ball.radius * 2 > paddleY
		);
	}

	// Handle paddle collision
	handlePaddleCollision(_paddleX: number, paddleY: number, paddleHeight: number) {
		// Reverse horizontal direction
		this.xSpeed *= -1;
		
		// Calculate relative position on paddle (0 to 1)
		const relativeIntersectY = (this.y + Ball.radius - paddleY) / paddleHeight;
		
		// Adjust vertical speed based on where ball hit paddle
		const normalizedRelativeIntersection = relativeIntersectY - 0.5; // -0.5 to 0.5
		const maxBounceAngle = Math.PI / 4; // 45 degrees
		const bounceAngle = normalizedRelativeIntersection * maxBounceAngle;
		
		// Apply new speeds
		const speed = Math.sqrt(this.xSpeed ** 2 + this.ySpeed ** 2);
		this.xSpeed = speed * Math.cos(bounceAngle) * Math.sign(this.xSpeed);
		this.ySpeed = speed * Math.sin(bounceAngle);
		
		// Increase speed slightly with each bounce
		this.nBounces++;
		if (this.nBounces % Ball.accelerationAmort === 0) {
			this.xSpeed *= Ball.acceleration;
			this.ySpeed *= Ball.acceleration;
		}
	}

	increaseSpeed(factor: number, maxSpeed: number) {
		const currentSpeed = Math.sqrt(this.xSpeed ** 2 + this.ySpeed ** 2);
		if (currentSpeed * factor < maxSpeed) {
			this.xSpeed *= factor;
			this.ySpeed *= factor;
		}
	}

	// Check if ball is out of bounds (scored)
	isOutOfBounds(): Side | null {
		if (this.x + Ball.radius * 2 < 0) {
			return Side.Left;
		}
		if (this.x > Board.width) {
			return Side.Right;
		}
		return null;
	}

	// Utility methods
	static randomBetween(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	// Getters
	get posX(): number { return this.x; }
	get posY(): number { return this.y; }
	get speedX(): number { return this.xSpeed; }
	get speedY(): number { return this.ySpeed; }
	get bounces(): number { return this.nBounces; }
}
