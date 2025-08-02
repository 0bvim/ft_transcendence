export class Board {
	static readonly width: number = 700;
	static readonly height: number = 300;
	static readonly backBorder: number = this.width / 50;
	static readonly diag: number = Math.sqrt(this.width ** 2 + this.height ** 2);
}

export enum Side {
	Left,
	Right
}
