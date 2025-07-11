export class Config {
	player1: string;
	player2: string;
	player1IsAI: boolean;
	player2IsAI: boolean;
	aiUpdateInterval: number = 1000;

	constructor(
		player1: string,
		player2: string,
		player1IsAI: boolean,
		player2IsAI: boolean,
		aiUpdateInterval: number
	) {
		this.player1 = player1;
		this.player2 = player2;
		this.player1IsAI = player1IsAI;
		this.player2IsAI = player2IsAI;
		this.aiUpdateInterval = aiUpdateInterval;
	}
}
