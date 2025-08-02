import p5 from 'p5';
import { Board } from './Board';

export class Paddle {
	readonly x: number;
	y: number;
	static readonly height: number = Board.height / 4;
	static readonly width: number = Board.width / 50;
	static readonly baseSpeed: number = Board.height / 120;
	goDown = false;
	goUp = false;
	private speed: number = 0;
	private score: number = 0;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y - Paddle.height / 2;
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
		if (this.y < 0) this.y = 0;
		if (this.y + Paddle.height > Board.height) this.y = Board.height - Paddle.height;
	}

	draw(p: p5) {
		p.fill(255);
		p.noStroke();
		p.rect(this.x, this.y, Paddle.width, Paddle.height);
	}

	// Score management
	incrementScore() {
		this.score++;
	}

	getScore(): number {
		return this.score;
	}

	resetScore() {
		this.score = 0;
	}

	// Getters for position and properties
	get posX(): number { return this.x; }
	get posY(): number { return this.y; }
	get width(): number { return Paddle.width; }
	get height(): number { return Paddle.height; }
	get currentSpeed(): number { return this.speed; }
}
