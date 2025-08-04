import { showGame, GameType } from './game';
import { tournamentApi } from '../../api/tournament';
import { showNotification } from '../../components/notification';

export async function startMultiplayerMatch(container: HTMLElement, config: { matchId: string, tournamentId: string }) {
    try {
        console.log(`[match.ts] Attempting to start match ${config.matchId} for tournament ${config.tournamentId}`);
        
        // Fetch match details from the backend.
        // The backend is designed to set the match status to IN_PROGRESS upon this request.
        const matchDetails = await tournamentApi.getMatchDetails(config.matchId);

        if (matchDetails && (matchDetails.success || matchDetails.data)) {
            console.log('[match.ts] Successfully fetched match details, proceeding to show game.', matchDetails.data);
            // Now that the backend has confirmed the match is ready, show the game UI.
            showGame(container, {
                type: GameType.Multiplayer,
                matchId: config.matchId,
                tournamentId: config.tournamentId,
                matchData: matchDetails.data // Pass match data to the game component
            });
        } else {
            throw new Error('Invalid match details received from server.');
        }
    } catch (error) {
        console.error('Failed to start multiplayer match:', error);
        showNotification('Error starting match. Please try again.', 'error');
        // Optionally, redirect back to the tournament details page or show an error message.
    }
}