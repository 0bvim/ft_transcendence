const playerNamesCsvUrl = new URL('../../public/player_names.csv?url', import.meta.url).href;

// Access game logger from global scope
declare const gameLogger: any;

export async function getRandomPlayerName(): Promise<string> {
	try {
		const response = await fetch(playerNamesCsvUrl); // Use the imported URL
		if (!response.ok) {
			const errorText = await response.text();
			if (typeof gameLogger !== 'undefined') {
				gameLogger.error('Failed to fetch player names CSV', {
					action: 'fetchPlayerNames',
					status: response.status,
					statusText: response.statusText,
					responseContent: errorText
				});
			}
			return "Error Player";
		}
		const csvText = await response.text();

		const lines = csvText.trim().split('\n').slice(1);
		const adjectives: string[] = [];
		const substantives: string[] = [];

		for (const line of lines) {
			const parts = line.split(',');
			if (parts.length >= 2) {
				const adj = parts[0].trim();
				const sub = parts[1].trim();
				if (adj && sub) {
					adjectives.push(adj);
					substantives.push(sub);
				}
			}
		}

		if (adjectives.length === 0 || substantives.length === 0) {
			if (typeof gameLogger !== 'undefined') {
				gameLogger.error('Empty name arrays after CSV parsing', {
					action: 'parsePlayerNames',
					adjectivesCount: adjectives.length,
					substantivesCount: substantives.length,
					csvUrl: playerNamesCsvUrl
				});
			}
			return "Default Player";
		}

		const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
		const sub = substantives[Math.floor(Math.random() * substantives.length)];

		return `${adj} ${sub}`;

	} catch (e: unknown) {
		if (typeof gameLogger !== 'undefined') {
			if (e instanceof Error) {
				gameLogger.error('Failed to fetch or parse player names', {
					action: 'getRandomPlayerName',
					error: e.message,
					csvUrl: playerNamesCsvUrl
				});
			} else {
				gameLogger.error('Unknown error occurred in player name generation', {
					action: 'getRandomPlayerName',
					error: e,
					csvUrl: playerNamesCsvUrl
				});
			}
		}
		return "Fallback Player";
	}
}
