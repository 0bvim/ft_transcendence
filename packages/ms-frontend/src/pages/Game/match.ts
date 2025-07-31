import { showGame, GameType } from './game';

export function startMultiplayerMatch(container: HTMLElement, config: { matchId: string, tournamentId: string }) {
    // This will be expanded later to fetch match details
    showGame(container, {
        type: GameType.Multiplayer,
        matchId: config.matchId,
        tournamentId: config.tournamentId
    });
}