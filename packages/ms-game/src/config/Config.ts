import { AIDifficulty } from '../AI';

export class Config {
	player1: string;
	player2: string;
	player1IsAI: boolean;
	player2IsAI: boolean;
	player1AIDifficulty: AIDifficulty;
	player2AIDifficulty: AIDifficulty;
	aiUpdateInterval: number = 1000;

	constructor(
		player1: string,
		player2: string,
		player1IsAI: boolean,
		player2IsAI: boolean,
		aiUpdateInterval: number,
		player1AIDifficulty: AIDifficulty = 'MEDIUM',
		player2AIDifficulty: AIDifficulty = 'MEDIUM'
	) {
		this.player1 = player1;
		this.player2 = player2;
		this.player1IsAI = player1IsAI;
		this.player2IsAI = player2IsAI;
		this.player1AIDifficulty = player1AIDifficulty;
		this.player2AIDifficulty = player2AIDifficulty;
		this.aiUpdateInterval = aiUpdateInterval;
	}
}
