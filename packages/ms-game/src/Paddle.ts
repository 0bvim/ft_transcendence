import { Board } from './Board'

export class Paddle {
	readonly x: number
	y: number
	static readonly height: number = Board.height / 4;
	static readonly width: number = Board.width / 50;
	static readonly baseSpeed: number = Board.height / 120; // Slightly faster for better responsiveness
	goDown = false;
	goUp = false;
	private speed: number = 0;
	private score: number = 0;

	constructor(x: number, y: number) {
		this.x = x
		this.y = y - Paddle.height / 2
	}

	up() {
		if (this.y > 0) {
			this.y -= Paddle.baseSpeed;
			this.speed = -Paddle.baseSpeed;
		} else {
			// Clamp to boundary
			this.y = 0;
			this.speed = 0;
		}
	}

	down() {
		if (this.y + Paddle.height < Board.height) {
			this.y += Paddle.baseSpeed;
			this.speed = Paddle.baseSpeed;
		} else {
			// Clamp to boundary
			this.y = Board.height - Paddle.height;
			this.speed = 0;
		}
	}

	update() {
		if (this.goUp) {
			this.up();
		} else if (this.goDown) {
			this.down();
		} else {
			this.speed = 0;
		}
		
		// Ensure paddle stays within bounds (safety check)
		this.y = Math.max(0, Math.min(Board.height - Paddle.height, this.y));
	}

	scoreUp() {
		this.score++;
	}

	reset() {
		this.score = 0;
	}

	get currentScore(): number {
		return this.score;
	}

	get currentSpeed(): number {
		return this.speed;
	}
}
