import { Board } from './Board'

export class Paddle {
	readonly x: number
	y: number
	static readonly height: number = Board.height / 4;
	static readonly width: number = Board.width / 50;
	static readonly baseSpeed: number = Board.height / 150;
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
			this.speed = 0;
		}
	}

	down() {
		if (this.y + Paddle.height < Board.height) {
			this.y += Paddle.baseSpeed;
			this.speed = Paddle.baseSpeed;
		} else {
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
	}

	scoreUp() {
		this.score++;
	}

	get currentScore(): number {
		return this.score;
	}

	get currentSpeed(): number {
		return this.speed;
	}

}
