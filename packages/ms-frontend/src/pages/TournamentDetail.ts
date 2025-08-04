import { tournamentApi, Tournament } from '../api/tournament.ts';
import { authApi } from '../api/auth.ts';
// Import the unified game system instead of direct PongGame
import { showGame, GameType } from './Game/game.ts';
import { GameState } from '../game/PongGame.ts';
import { showNotification } from '../components/notification.ts';

export default function TournamentDetail(): HTMLElement {
  const container = document.createElement('div');
  // Use a more specific class for the tournament detail page
  container.className = 'tournament-detail-page min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8';

  // Get tournament ID from URL
  const tournamentId = window.location.pathname.split('/').pop();

  // NEW: Modern, sidebar-based layout inspired by the screenshot
  container.innerHTML = `
    <div id="tournament-container" class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500" id="tournament-name">
            Loading...
          </h1>
          <span class="px-3 py-1 rounded-full text-sm font-semibold" id="tournament-status">
            <!-- Status badge -->
          </span>
        </div>
        <div class="flex items-center space-x-4">
            <span id="player-count" class="text-sm text-gray-300 font-medium">Players: 0/0</span>
            <button id="start-tournament-btn" class="btn btn-primary btn-sm hidden">START TOURNAMENT</button>
            <button id="exit-tournament-btn" class="btn btn-outline btn-sm border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                EXIT TOURNAMENT
            </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- CURRENT MATCH -->
          <div class="card bg-gray-800/50 border border-gray-700 p-4">
            <h2 class="text-lg font-semibold text-purple-400 mb-3">CURRENT MATCH</h2>
            <div id="current-match-info" class="space-y-2 text-sm">
              <p>No active match.</p>
            </div>
          </div>

          <!-- PROGRESS -->
          <div class="card bg-gray-800/50 border border-gray-700 p-4">
            <h2 class="text-lg font-semibold text-purple-400 mb-3">PROGRESS</h2>
            <div id="tournament-progress-info" class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Matches Completed:</span>
                    <span id="completed-matches">0</span>
                </div>
                <div class="flex justify-between">
                    <span>Matches Remaining:</span>
                    <span id="remaining-matches">0</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                    <div id="progress-bar" class="bg-green-500 h-2.5 rounded-full" style="width: 0%"></div>
                </div>
            </div>
          </div>

          <!-- UPCOMING -->
          <div class="card bg-gray-800/50 border border-gray-700 p-4">
            <h2 class="text-lg font-semibold text-purple-400 mb-3">UPCOMING</h2>
            <div id="upcoming-matches-list" class="space-y-3">
              <p class="text-sm text-gray-400">No upcoming matches.</p>
            </div>
          </div>
        </div>

        <!-- Game Area -->
        <div class="lg:col-span-2 bg-black rounded-lg border-2 border-purple-500/50 flex items-center justify-center min-h-[60vh] p-4" id="game-viewport">
            <div id="game-placeholder" class="text-center">
                <h3 class="text-2xl font-bold text-gray-400">Waiting for match...</h3>
                <p class="text-gray-500 mt-2">The game will appear here when a match starts.</p>
                <button id="play-next-match-btn" class="btn btn-primary mt-6 hidden">PLAY MY MATCH</button>
            </div>
            <div id="canvasContainer" class="w-full h-full relative hidden"></div>
        </div>

      </div>
    </div>
  `;

  // Re-wire event listeners to the new elements
  setupEventListeners(container, tournamentId);
  if (tournamentId) {
    console.log(`[TournamentDetail] Page loaded for tournamentId: ${tournamentId}`);
    loadTournamentData(container, tournamentId);
  } else {
    console.error('[TournamentDetail] No tournamentId found in URL.');
  }

  return container;
}

function setupEventListeners(container: HTMLElement, tournamentId: string | undefined) {
  const exitBtn = container.querySelector('#exit-tournament-btn');
  exitBtn?.addEventListener('click', () => {
    window.location.href = '/tournament'; // Or a more graceful exit
  });

  const startBtn = container.querySelector('#start-tournament-btn');
  startBtn?.addEventListener('click', async () => {
    if (!tournamentId) return;
    try {
      await tournamentApi.startTournament(tournamentId);
      showNotification('Tournament started!', 'success');
      // Reload data to reflect the new state
      loadTournamentData(container, tournamentId);
    } catch (error) {
      console.error('Failed to start tournament:', error);
      showNotification('Failed to start tournament.', 'error');
    }
  });

  const playNextMatchBtn = container.querySelector('#play-next-match-btn');
  playNextMatchBtn?.addEventListener('click', async () => {
      if (!tournamentId) return;
      const tournament = await tournamentApi.getTournament(tournamentId);
      const nextMatch = findNextPlayableMatch(tournament);
      if (nextMatch) {
          startTournamentMatch(container, tournament, nextMatch);
      }
  });
}

// MODIFIED: Pass container to functions to scope DOM queries
async function loadTournamentData(container: HTMLElement, tournamentId: string) {
  if (!tournamentId) {
    showNotification('Tournament ID not found', 'error');
    return;
  }

  console.log('[TournamentDetail] Starting to load tournament data...');
  try {
    const tournament = await tournamentApi.getTournament(tournamentId);
    console.log('[TournamentDetail] API response received:', tournament);

    if (!tournament) throw new Error('Tournament not found in API response');
    
    // NEW: Centralized function to update the entire UI
    console.log('[TournamentDetail] Updating UI with tournament data.');
    updateTournamentUI(container, tournament);

  } catch (error) {
    console.error('[TournamentDetail] Failed to load or process tournament data:', error);
    showNotification('Failed to load tournament data. Please try again.', 'error');
  }
}

// NEW: A single function to update all parts of the UI from tournament data
function updateTournamentUI(container: HTMLElement, tournament: any) {
    console.log('[TournamentDetail] updateTournamentUI called with:', tournament);
    updateHeader(container, tournament);
    updateCurrentMatch(container, tournament);
    updateProgress(container, tournament);
    updateUpcomingMatches(container, tournament);
    updateGameView(container, tournament);
}

// NEW: Function to update header elements
function updateHeader(container: HTMLElement, tournament: any) {
    console.log('[TournamentDetail] Updating header...');
    const nameEl = container.querySelector('#tournament-name') as HTMLElement;
    const statusEl = container.querySelector('#tournament-status') as HTMLElement;
    const playersEl = container.querySelector('#player-count') as HTMLElement;
    const startBtn = container.querySelector('#start-tournament-btn') as HTMLElement;

    if (nameEl) nameEl.textContent = tournament.name;
    if (statusEl) {
        statusEl.textContent = tournament.status;
        statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tournament.status)}`;
    }
    if (playersEl) playersEl.textContent = `Players: ${tournament.currentPlayers}/${tournament.maxPlayers}`;

    // Logic to show/hide the start button
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCreator = user.id === tournament.createdBy;
    const isFull = tournament.currentPlayers === tournament.maxPlayers;
    const isWaiting = tournament.status === 'WAITING';

    if (startBtn && isCreator && isFull && isWaiting) {
      startBtn.classList.remove('hidden');
    } else if (startBtn) {
      startBtn.classList.add('hidden');
    }
}

// NEW: Function to update the 'Current Match' panel
function updateCurrentMatch(container: HTMLElement, tournament: any) {
    console.log('[TournamentDetail] Updating current match...');
    
    // Add null check to prevent crashes
    if (!tournament || !tournament.matches) {
        console.log('[TournamentDetail] Tournament data not available, skipping current match update');
        return;
    }
    
    const currentMatchInfo = container.querySelector('#current-match-info') as HTMLElement;
    const inProgressMatch = tournament.matches.find((m: any) => m.status === 'IN_PROGRESS');

    if (inProgressMatch) {
        const player1Type = inProgressMatch.player1?.participantType || 'UNKNOWN';
        const player2Type = inProgressMatch.player2?.participantType || 'UNKNOWN';
        const isAIvsAI = player1Type === 'AI' && player2Type === 'AI';
        const hasHuman = player1Type === 'HUMAN' || player2Type === 'HUMAN';
        
        currentMatchInfo.innerHTML = `
            <div class="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-neon-cyan font-mono">Round ${inProgressMatch.round} - Match ${inProgressMatch.matchNumber}</span>
                    <span id="match-status-text" class="font-bold ${isAIvsAI ? 'text-yellow-400' : 'text-green-400'}">
                        ${isAIvsAI ? 'AI SIMULATION' : 'IN PROGRESS'}
                    </span>
                </div>
                
                <div class="grid grid-cols-3 items-center gap-4 mb-3">
                    <div class="text-center">
                        <div class="text-lg font-semibold text-white">${inProgressMatch.player1?.displayName || 'TBD'}</div>
                        <div class="text-sm ${player1Type === 'HUMAN' ? 'text-neon-pink' : 'text-neon-cyan'} font-mono">
                            ${player1Type === 'HUMAN' ? '👤 HUMAN' : '🤖 AI'}
                        </div>
                        ${player1Type === 'HUMAN' && hasHuman ? '<div class="text-xs text-neon-pink/80 font-mono">W/S Keys</div>' : ''}
                    </div>
                    
                    <div class="text-center">
                        <div class="text-3xl font-mono font-bold text-white">
                            <span id="match-score-display">${inProgressMatch.player1Score || 0} - ${inProgressMatch.player2Score || 0}</span>
                        </div>
                        <div class="text-sm text-gray-400">VS</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-lg font-semibold text-white">${inProgressMatch.player2?.displayName || 'TBD'}</div>
                        <div class="text-sm ${player2Type === 'HUMAN' ? 'text-neon-pink' : 'text-neon-cyan'} font-mono">
                            ${player2Type === 'HUMAN' ? '👤 HUMAN' : '🤖 AI'}
                        </div>
                        ${player2Type === 'HUMAN' && hasHuman ? '<div class="text-xs text-neon-pink/80 font-mono">↑↓ Arrows</div>' : ''}
                    </div>
                </div>
                
                ${hasHuman && !isAIvsAI ? `
                    <div class="text-center text-xs text-neon-cyan/60 font-mono border-t border-neon-cyan/20 pt-2">
                        🎮 Local Multiplayer: Players use the same keyboard
                    </div>
                ` : ''}
                
                ${isAIvsAI ? `
                    <div class="text-center text-xs text-yellow-400/80 font-mono border-t border-yellow-400/20 pt-2">
                        ⚡ AI vs AI match - Auto-resolving...
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        currentMatchInfo.innerHTML = `
            <div class="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4 mb-4">
                <p class="text-sm text-gray-400 text-center">No active match.</p>
            </div>
        `;
    }
}

// MODIFIED: `updateProgress` now targets the new sidebar elements
function updateProgress(container: HTMLElement, tournament: any) {
  console.log('[TournamentDetail] Updating progress...');
  const completedMatches = tournament.matches.filter((m: any) => m.status === 'COMPLETED').length;
  const totalMatches = tournament.matches.length;
  const remainingMatches = totalMatches - completedMatches;
  const progressPercent = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
  
  const completedEl = container.querySelector('#completed-matches') as HTMLElement;
  const remainingEl = container.querySelector('#remaining-matches') as HTMLElement;
  const progressBarEl = container.querySelector('#progress-bar') as HTMLElement;

  if (completedEl) completedEl.textContent = completedMatches.toString();
  if (remainingEl) remainingEl.textContent = remainingMatches.toString();
  if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;
}

// NEW: Function to update the 'Upcoming' matches list
function updateUpcomingMatches(container: HTMLElement, tournament: any) {
    console.log('[TournamentDetail] Updating upcoming matches...');
    const upcomingList = container.querySelector('#upcoming-matches-list') as HTMLElement;
    const waitingMatches = tournament.matches.filter((m: any) => m.status === 'WAITING').slice(0, 5); // Show next 5

    if (waitingMatches.length > 0) {
        upcomingList.innerHTML = waitingMatches.map((match: any) => `
            <div class="text-sm p-2 bg-gray-700/50 rounded-md">
                <div class="flex justify-between">
                    <span>${match.player1?.displayName || 'TBD'} vs ${match.player2?.displayName || 'TBD'}</span>
                    <span class="text-yellow-400">WAITING</span>
                </div>
                <div class="text-xs text-gray-400">Round ${match.round} - Match ${match.matchNumber}</div>
            </div>
        `).join('');
    } else {
        upcomingList.innerHTML = '<p class="text-sm text-gray-400">No upcoming matches.</p>';
    }
}

// NEW: Function to control the main game view area
function updateGameView(container: HTMLElement, tournament: any) {
    console.log('[TournamentDetail] Updating game view...');
    const gamePlaceholder = container.querySelector('#game-placeholder') as HTMLElement;
    const gameCanvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
    const playNextMatchBtn = container.querySelector('#play-next-match-btn') as HTMLElement;

    const inProgressMatch = tournament.matches.find((m: any) => m.status === 'IN_PROGRESS');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Handle tournament completion first
    if (tournament.status === 'COMPLETED') {
        console.log('[TournamentDetail] Tournament is COMPLETED.');
        gamePlaceholder.classList.remove('hidden');
        gameCanvasContainer.classList.add('hidden');
        gameCanvasContainer.innerHTML = ''; // Ensure canvas is clean

        const winner = tournament.participants.find((p: any) => p.status === 'WINNER');
        gamePlaceholder.innerHTML = `
            <h3 class="text-2xl font-bold text-green-400">Tournament Finished!</h3>
            <p class="text-gray-400 mt-2">Winner: <span class="font-bold text-white">${winner?.displayName}</span></p>
            <button id="create-new-tournament-btn" class="btn btn-primary mt-6">CREATE NEW TOURNAMENT</button>
        `;
        
        const createNewBtn = gamePlaceholder.querySelector('#create-new-tournament-btn');
        createNewBtn?.addEventListener('click', () => {
            window.location.href = '/tournament/create';
        });
        return; // Stop further processing
    }

    if (inProgressMatch) {
        // A match is live, show the game canvas and hide the placeholder
        gamePlaceholder.classList.add('hidden');
        gameCanvasContainer.classList.remove('hidden');
        // Check if the current user is part of this match and if the game isn't already running
        const isUserInMatch = (inProgressMatch.player1?.userId === user.id || inProgressMatch.player1?.id === user.id) ||
                             (inProgressMatch.player2?.userId === user.id || inProgressMatch.player2?.id === user.id);
        const isCanvasEmpty = gameCanvasContainer.innerHTML.trim() === '';

        // Check if this is an AI vs AI match (regardless of user participation)
        const isAIvsAI = inProgressMatch.player1?.participantType === 'AI' && 
                         inProgressMatch.player2?.participantType === 'AI';

        // Check if this match has at least one human player
        const hasHumanPlayer = inProgressMatch.player1?.participantType === 'HUMAN' || 
                              inProgressMatch.player2?.participantType === 'HUMAN';

        console.log('[TournamentDetail] Match analysis:', {
            matchId: inProgressMatch.id,
            player1Type: inProgressMatch.player1?.participantType,
            player2Type: inProgressMatch.player2?.participantType,
            isUserInMatch,
            isAIvsAI,
            hasHumanPlayer,
            isCanvasEmpty
        });

        if (hasHumanPlayer && isCanvasEmpty) {
            console.log('[TournamentDetail] Human match detected - showing waiting screen.');
            showHumanMatchWaitingScreen(container, tournament, inProgressMatch);
        } else if (isAIvsAI) {
            console.log('[TournamentDetail] Auto-starting AI vs AI match for resolution.');
            simulateAIvsAIMatch(container, tournament, inProgressMatch);
        } else {
            console.log('[TournamentDetail] No action taken for IN_PROGRESS match:', {
                reason: hasHumanPlayer ? 'Canvas not empty' : (isAIvsAI ? 'AI vs AI but canvas not empty' : 'Unknown state')
            });
        }
    } else {
        // No live match, show placeholder
        gamePlaceholder.classList.remove('hidden');
        gameCanvasContainer.classList.add('hidden');
        gameCanvasContainer.innerHTML = ''; // Clear canvas when not in use

        const nextPlayableMatch = findNextPlayableMatch(tournament);
        if (nextPlayableMatch) {
            playNextMatchBtn.classList.remove('hidden');
        } else {
            playNextMatchBtn.classList.add('hidden');
            // You could add logic here to show if the tournament is over
            if (tournament.status === 'COMPLETED') {
                (gamePlaceholder.querySelector('h3') as HTMLElement).textContent = 'Tournament Finished!';
                (gamePlaceholder.querySelector('p') as HTMLElement).textContent = `Winner: ${tournament.participants.find((p:any) => p.status === 'WINNER')?.displayName}`;
            }
        }
    }
}

// NEW: Helper to find the user's next playable match
function findNextPlayableMatch(tournament: any): any | null {
    console.log('[TournamentDetail] Finding next playable match...');
    
    // Find any WAITING match that has at least one human player
    const match = tournament.matches.find((m: any) => {
        const hasHumanPlayer = m.player1?.participantType === 'HUMAN' || m.player2?.participantType === 'HUMAN';
        return m.status === 'WAITING' && hasHumanPlayer;
    });
    
    console.log('[TournamentDetail] Found next match:', match);
    return match;
}

// NEW: Function to handle starting a match
async function startTournamentMatch(container: HTMLElement, tournament: any, selectedMatch: any) {
    console.log('[TournamentDetail] Starting match:', selectedMatch.id);
    const gameCanvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
    const gamePlaceholder = container.querySelector('#game-placeholder') as HTMLElement;

    try {
        // Show loading state in game viewport
        gamePlaceholder.classList.add('hidden');
        gameCanvasContainer.classList.remove('hidden');
        gameCanvasContainer.innerHTML = `<div class="text-white">LOADING MATCH...</div>`;

        // The backend auto-sets the match to IN_PROGRESS on this call
        const matchDetails = await tournamentApi.getMatchDetails(selectedMatch.id);
        console.log('[TournamentDetail] getMatchDetails response:', matchDetails);

        // Handle different response formats - the API might return data directly or wrapped
        const matchData = matchDetails.data || matchDetails;
        console.log('[TournamentDetail] Using matchData:', matchData);

        if (!matchData || (!matchData.id && !matchData.matchId)) {
            throw new Error('Invalid match details response - no match ID found');
        }

        // Use matchId from API response or fallback to id
        const actualMatchId = matchData.matchId || matchData.id;
        console.log('[TournamentDetail] Using match ID:', actualMatchId);

        // Get match participant details to set up the game
        const matchInfo = tournament.matches.find((m: any) => m.id === actualMatchId);
        if (!matchInfo) {
            throw new Error('Match not found in tournament data');
        }

        // Get user info for player names
        const { user } = await authApi.getProfile();
        const isPlayer1 = matchInfo.player1?.userId === user.id || matchInfo.player1?.id === user.id;
        const isPlayer2 = matchInfo.player2?.userId === user.id || matchInfo.player2?.id === user.id;

        // Set up player names and AI configuration
        const player1Name = matchInfo.player1?.displayName || 'Player 1';
        const player2Name = matchInfo.player2?.displayName || 'Player 2';
        const player1IsAI = matchInfo.player1?.participantType === 'AI';
        const player2IsAI = matchInfo.player2?.participantType === 'AI';

        console.log('[TournamentDetail] Setting up match:', {
            player1Name, player2Name, player1IsAI, player2IsAI, isPlayer1, isPlayer2
        });

        // Check if this is an AI vs AI match - these should be auto-resolved by backend
        if (player1IsAI && player2IsAI) {
            console.log('[TournamentDetail] AI vs AI match detected - should be auto-resolved by backend');
            gameCanvasContainer.innerHTML = `
                <div class="flex items-center justify-center h-full text-white">
                    <div class="text-center">
                        <div class="text-xl mb-4">🤖 AI vs AI Match</div>
                        <div class="text-lg mb-2">${matchInfo.player1?.displayName} vs ${matchInfo.player2?.displayName}</div>
                        <div class="text-sm opacity-75 mb-4">Simulating match...</div>
                        <div class="animate-pulse">
                            <div class="w-8 h-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Simulate AI vs AI match after a short delay
            simulateAIvsAIMatch(container, tournament, matchInfo);
            
            return;
        }

        // For human vs AI or human vs human matches, use the unified showGame function
        console.log('[TournamentDetail] Starting playable match (involves human players)');
        
        // A flag to prevent multiple submissions
        let resultSubmitted = false;

        // Create the callback with the necessary data in its closure
        const onGameEnd = async (finalState: GameState) => {
            console.log('[TournamentDetail] Game ended. Final state:', finalState);
            try {
                // For human matches, the result object contains the score and winner string
                const resultPayload = {
                    winner: finalState.score.player1 > finalState.score.player2 ? 'PLAYER_1' : 'PLAYER_2',
                    score: finalState.score
                };

                await tournamentApi.submitMatchResult(
                    actualMatchId, 
                    resultPayload, // The game result 
                    matchInfo      // The original match data for context
                );
                showNotification('Match result submitted!', 'success');

                // NEW: Immediately clear canvas and show loading message
                gameCanvasContainer.innerHTML = `
                    <div class="flex items-center justify-center h-full text-white">
                        <div class="text-center">
                            <div class="text-xl mb-4">🏆 Match Complete!</div>
                            <div class="text-lg mb-2">Winner: ${resultPayload.winner}</div>
                            <div class="text-lg mb-4">Score: ${resultPayload.score.player1} - ${resultPayload.score.player2}</div>
                            <div class="text-sm opacity-75">Processing next round...</div>
                            <div class="animate-pulse">
                                <div class="w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        </div>
                    </div>
                `;

                // Add a longer delay to ensure backend processing completes
                setTimeout(async () => {
                    await loadTournamentData(container, tournament.id);
                }, 1000);

            } catch (error) {
                resultSubmitted = false; // Allow retry
                console.error('[TournamentDetail] Failed to submit match result:', error);
                showNotification(`Error submitting result: ${error.message}`, 'error');
            }
        };

        // Define the game configuration
        const gameConfig: GameConfig = {
            type: GameType.Tournament,
            player1Name,
            player2Name,
            player1IsAI, // Explicitly pass AI configuration
            player2IsAI, // Explicitly pass AI configuration
            matchData: matchData, // Pass full match data
            targetScore: tournament.targetScore || 5,
            tournamentId: tournament.id,
            matchId: actualMatchId,

            // Implement callbacks to control the TournamentDetail UI
            onScoreUpdate: (player1Score: number, player2Score: number) => {
                const scoreEl = container.querySelector('#match-score-display');
                if (scoreEl) {
                    scoreEl.textContent = `${player1Score} - ${player2Score}`;
                }
            },
            onGameStateChange: (state: GameState) => {
                const statusEl = container.querySelector('#match-status-text');
                if (statusEl) {
                    // Convert GameState enum to string
                    const stateString = GameState[state] || 'UNKNOWN';
                    statusEl.textContent = stateString.toUpperCase();
                }
                if (state === GameState.Error) {
                    showNotification('Failed to start the game.', 'error');
                    gameCanvasContainer.innerHTML = `<div class="text-red-500">Error starting game.</div>`;
                }
            },
            onGameEnd: onGameEnd,
        };

        // Finally, call the unified showGame function
        await showGame(gameCanvasContainer, gameConfig);

    } catch (error) {
        console.error('[TournamentDetail] Critical error in startTournamentMatch:', error);
        showNotification('Could not start the match. Please refresh.', 'error');
        gamePlaceholder.classList.remove('hidden');
        gameCanvasContainer.classList.add('hidden');
    }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'bg-green-500/20 text-green-300 border border-green-500';
    case 'WAITING':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500';
    case 'COMPLETED':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500';
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500';
  }
}

// NEW: Function to simulate an AI vs AI match
async function simulateAIvsAIMatch(container: HTMLElement, tournament: any, matchInfo: any) {
    console.log('[TournamentDetail] Simulating AI vs AI match:', matchInfo.id);
    const gameCanvasContainer = container.querySelector('#canvasContainer') as HTMLElement;

    // Instantly simulate the match and get the result
    const result = await simulateMatch(matchInfo);
    console.log('[TournamentDetail] AI vs AI match result:', result);

    // Show brief result message
    gameCanvasContainer.innerHTML = `
        <div class="flex items-center justify-center h-full text-white">
            <div class="text-center">
                <div class="text-xl mb-4">🤖 AI vs AI Match Complete</div>
                <div class="text-lg mb-2">${matchInfo.player1?.displayName} vs ${matchInfo.player2?.displayName}</div>
                <div class="text-lg mb-4">Winner: ${result.winner}</div>
                <div class="text-lg mb-4">Score: ${result.scorePlayer1} - ${result.scorePlayer2}</div>
                <div class="text-sm opacity-75">Processing next round...</div>
            </div>
        </div>
    `;
    
    // Submit the result to the backend immediately
    try {
        await tournamentApi.submitMatchResult(
            matchInfo.id, 
            result
        );

        showNotification('AI vs AI match completed!', 'success');
        
        // Refresh tournament data immediately
        await loadTournamentData(container, tournament.id);

    } catch (error) {
        console.error('[TournamentDetail] Failed to submit AI vs AI match result:', error);
        showNotification(`Error submitting AI vs AI match result: ${error.message}`, 'error');
    }
}

// NEW: Function to simulate a match between two AI players
async function simulateMatch(matchInfo: any): Promise<{ winnerId: string; scorePlayer1: number; scorePlayer2: number }> {
    console.log('[TournamentDetail] Simulating match:', matchInfo.id);
    // Simulate the match here...
    // For demonstration purposes, just return a random result
    let scorePlayer1 = Math.floor(Math.random() * 6);
    let scorePlayer2 = Math.floor(Math.random() * 6);

    // Ensure one player wins and meets target score
    if (scorePlayer1 === scorePlayer2) {
        scorePlayer1 = 5; // Force a winner
        scorePlayer2 = Math.floor(Math.random() * 5);
    } else {
        if (Math.max(scorePlayer1, scorePlayer2) < 5) {
            if (scorePlayer1 > scorePlayer2) scorePlayer1 = 5;
            else scorePlayer2 = 5;
        }
    }

    const winnerIsPlayer1 = scorePlayer1 > scorePlayer2;
    const winnerId = winnerIsPlayer1 ? (matchInfo.player1?.id || matchInfo.player1Id) : (matchInfo.player2?.id || matchInfo.player2Id);

    const result = {
        winnerId,
        scorePlayer1,
        scorePlayer2,
    };

    console.log('[TournamentDetail] AI vs AI match result:', result);
    return result;
}

// NEW: Function to show a waiting screen for human matches
function showHumanMatchWaitingScreen(container: HTMLElement, tournament: any, matchInfo: any) {
    console.log('[TournamentDetail] Showing waiting screen for human match:', matchInfo.id);
    const gameCanvasContainer = container.querySelector('#canvasContainer') as HTMLElement;

    const player1Type = matchInfo.player1?.participantType || 'UNKNOWN';
    const player2Type = matchInfo.player2?.participantType || 'UNKNOWN';

    gameCanvasContainer.innerHTML = `
        <div class="flex items-center justify-center h-full text-white bg-gradient-to-br from-neon-cyan/5 to-neon-pink/5">
            <div class="text-center max-w-md mx-auto p-8 bg-gray-900/80 rounded-lg border border-neon-cyan/30">
                <div class="text-3xl mb-6">👥 Human Match Ready</div>
                
                <div class="mb-6">
                    <div class="text-xl font-semibold mb-2">Round ${matchInfo.round} - Match ${matchInfo.matchNumber}</div>
                    <div class="text-lg text-neon-cyan">Local Multiplayer Match</div>
                </div>
                
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div class="text-center p-4 bg-neon-pink/10 rounded-lg border border-neon-pink/30">
                        <div class="text-lg font-semibold text-white mb-2">${matchInfo.player1?.displayName}</div>
                        <div class="text-sm ${player1Type === 'HUMAN' ? 'text-neon-pink' : 'text-neon-cyan'} font-mono mb-2">
                            ${player1Type === 'HUMAN' ? '👤 HUMAN' : '🤖 AI'}
                        </div>
                        <div class="text-xs text-neon-pink/80 font-mono">
                            ${player1Type === 'HUMAN' ? 'W/S Keys' : 'Auto-controlled'}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">Left Side</div>
                    </div>
                    
                    <div class="text-center p-4 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
                        <div class="text-lg font-semibold text-white mb-2">${matchInfo.player2?.displayName}</div>
                        <div class="text-sm ${player2Type === 'HUMAN' ? 'text-neon-pink' : 'text-neon-cyan'} font-mono mb-2">
                            ${player2Type === 'HUMAN' ? '👤 HUMAN' : '🤖 AI'}
                        </div>
                        <div class="text-xs text-neon-cyan/80 font-mono">
                            ${player2Type === 'HUMAN' ? '↑↓ Arrow Keys' : 'Auto-controlled'}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">Right Side</div>
                    </div>
                </div>
                
                <div class="text-sm text-gray-300 mb-6">
                    ${player1Type === 'HUMAN' && player2Type === 'HUMAN' 
                        ? '🎮 Both players should be at the host\'s keyboard' 
                        : '🎮 Human player should be at the host\'s keyboard'
                    }
                </div>
                
                <button id="start-match-btn" class="btn btn-primary bg-neon-cyan text-black hover:bg-neon-cyan/80 px-8 py-3 rounded-lg font-semibold transition-all">
                    START MATCH
                </button>
            </div>
        </div>
    `;

    const startMatchBtn = gameCanvasContainer.querySelector('#start-match-btn');
    startMatchBtn?.addEventListener('click', async () => {
        await startTournamentMatch(container, tournament, matchInfo);
    });
}
