import { Config } from './Config';
import { AIDifficulty } from '../AI';
import { getRandomPlayerName } from './nameGenerator';
import json from '../../public/config.json';

export async function loadConfigFromJson(): Promise<Config> {
	let player1 = json.player1 || "";
	let player2 = json.player2 || "";

	if (!player1) player1 = await getRandomPlayerName();
	if (!player2) player2 = await getRandomPlayerName();
	while (player2 === player1) {
		player2 = await getRandomPlayerName();
	}

	// Parse AI difficulties with fallbacks
	const player1AIDifficulty: AIDifficulty = (json as any).player1AIDifficulty === 'EASY' || 
											   (json as any).player1AIDifficulty === 'MEDIUM' || 
											   (json as any).player1AIDifficulty === 'HARD' 
											   ? (json as any).player1AIDifficulty : 'MEDIUM';
											   
	const player2AIDifficulty: AIDifficulty = (json as any).player2AIDifficulty === 'EASY' || 
											   (json as any).player2AIDifficulty === 'MEDIUM' || 
											   (json as any).player2AIDifficulty === 'HARD' 
											   ? (json as any).player2AIDifficulty : 'MEDIUM';

	return new Config(
		player1,
		player2,
		json.player1IsAI ?? false,
		json.player2IsAI ?? false,
		json.aiUpdateInterval ?? 1000,
		player1AIDifficulty,
		player2AIDifficulty
	);
}
