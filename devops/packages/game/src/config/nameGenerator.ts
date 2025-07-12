const playerNamesCsvUrl = new URL('../../public/player_names.csv?url', import.meta.url).href;

export async function getRandomPlayerName(): Promise<string> {
	try {
		const response = await fetch(playerNamesCsvUrl); // Use the imported URL
		if (!response.ok) {
			console.error(`Failed to fetch player_names.csv: ${response.status} ${response.statusText}`);
			const errorText = await response.text();
			console.error("Response content on error:", errorText);
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
			console.error("Adjectives or substantives array is empty after parsing CSV. Check CSV content and path.");
			return "Default Player";
		}

		const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
		const sub = substantives[Math.floor(Math.random() * substantives.length)];

		return `${adj} ${sub}`;

	} catch (e: unknown) {
		if (e instanceof Error) {
			console.error('Failed to fetch or parse player names:', e.message);
		} else {
			console.error('An unknown error occurred:', e);
		}
		return "Fallback Player";
	}
}
