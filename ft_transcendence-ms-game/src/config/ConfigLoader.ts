import { Config } from './Config';
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

	return new Config(
		player1,
		player2,
		json.player1IsAI ?? false,
		json.player2IsAI ?? false,
		json.aiUpdateInterval ?? 1000
	);
}
