import { tournamentApi, Tournament } from '../../api/tournament';
import { showNotification } from '../../components/notification';
import { startLocalGame } from './localGame';

// Auto-refresh interval for tournament updates
let tournamentRefreshInterval: NodeJS.Timeout | null = null;

// Tournament Section Management
export async function showTournamentSection(container: HTMLElement): Promise<void> {
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
  const gameSection = container.querySelector('#gameSection') as HTMLElement;

  if (gameModeSelection) gameModeSelection.classList.add('hidden');
  if (gameSection) gameSection.classList.add('hidden');
  if (tournamentSection) {
    tournamentSection.classList.remove('hidden');
    await loadTournaments(container);
    
    // Start auto-refresh for tournament updates
    startTournamentAutoRefresh(container);
  }
}

export function hideTournamentSection(container: HTMLElement): void {
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  if (tournamentSection) {
    tournamentSection.classList.add('hidden');
  }
  
  // Stop auto-refresh when hiding tournament section
  stopTournamentAutoRefresh();
}

export async function loadTournaments(container: HTMLElement): Promise<void> {
  try {
    const response = await tournamentApi.getTournaments();
    displayTournaments(container, response.tournaments);
  } catch (error) {
    console.error('Failed to load tournaments:', error);
    displayTournamentError(container, 'Failed to load tournaments. Please try again later.');
  }
}

function displayTournaments(container: HTMLElement, tournaments: Tournament[]): void {
  const list = container.querySelector('#tournamentList');
  if (!list) return;

  list.innerHTML = '';
  if (tournaments.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12">
        <div class="text-neon-cyan/50 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <p class="text-neon-cyan/80 font-mono text-lg">No tournaments available</p>
        <p class="text-neon-cyan/60 font-mono text-sm mt-2">Create one to get started!</p>
      </div>
    `;
    return;
  }

  // Get current user for creator check
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  tournaments.forEach(tournament => {
    const isCreator = currentUser.id === tournament.createdBy;
    const canJoin = tournament.status === 'WAITING' && !isCreator && 
                   !tournament.participants.some(p => p.userId === currentUser.id);
    const canStart = tournament.status === 'WAITING' && isCreator && 
                    tournament.currentPlayers === tournament.maxPlayers;
    
    const statusColor = tournament.status === 'WAITING' ? 'neon-cyan' : 
                       tournament.status === 'ACTIVE' ? 'neon-green' : 
                       tournament.status === 'COMPLETED' ? 'neon-pink' : 'gray-400';

    const tournamentCard = document.createElement('div');
    tournamentCard.className = `card p-6 hover:bg-gray-800/50 transition-all duration-300 border-l-4 border-${statusColor}`;
    
    tournamentCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h4 class="text-xl font-bold text-neon-pink font-retro">${tournament.name}</h4>
            ${isCreator ? '<span class="badge badge-success text-xs">CREATOR</span>' : ''}
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm font-mono mb-4">
            <div>
              <span class="text-neon-cyan/70">Status:</span>
              <span class="text-${statusColor} font-bold ml-2">${tournament.status}</span>
            </div>
            <div>
              <span class="text-neon-cyan/70">Players:</span>
              <span class="text-neon-cyan">${tournament.currentPlayers}/${tournament.maxPlayers}</span>
            </div>
          </div>

          <!-- Participants Preview -->
          <div class="mb-4">
            <p class="text-neon-cyan/70 text-xs font-mono mb-2">PARTICIPANTS:</p>
            <div class="flex flex-wrap gap-2">
              ${tournament.participants.slice(0, 4).map(p => `
                <span class="px-2 py-1 bg-gray-800/50 rounded text-xs font-mono ${p.participantType === 'AI' ? 'text-neon-pink/70' : 'text-neon-cyan'}">${p.displayName}</span>
              `).join('')}
              ${tournament.participants.length > 4 ? `<span class="px-2 py-1 bg-gray-800/50 rounded text-xs font-mono text-gray-400">+${tournament.participants.length - 4} more</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 ml-4">
          <button class="btn btn-sm btn-secondary view-details-btn" data-tournament-id="${tournament.id}">
            VIEW DETAILS
          </button>
          
          ${canJoin ? `
            <button class="btn btn-sm btn-primary join-tournament-btn" data-tournament-id="${tournament.id}">
              JOIN TOURNAMENT
            </button>
          ` : ''}
          
          ${canStart ? `
            <button class="btn btn-sm btn-success start-tournament-btn" data-tournament-id="${tournament.id}">
              START TOURNAMENT
            </button>
          ` : ''}
          
          ${tournament.status === 'WAITING' && tournament.currentPlayers < tournament.maxPlayers && !canJoin && !isCreator ? `
            <span class="text-xs text-gray-400 font-mono">Already joined</span>
          ` : ''}
        </div>
      </div>
    `;
    
    list.appendChild(tournamentCard);
  });
}

function displayTournamentError(container: HTMLElement, message: string): void {
  const list = container.querySelector('#tournamentList');
  if (list) {
    list.innerHTML = `<p class="text-red-500">${message}</p>`;
  }
}

export function setupTournamentEventListeners(container: HTMLElement): void {
  const createButton = container.querySelector('#createTournamentButton');
  createButton?.addEventListener('click', () => {
    window.history.pushState({}, '', '/tournament/create');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  const tournamentList = container.querySelector('#tournamentList');
  tournamentList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');
    if (!button) return;

    const tournamentId = button.dataset.tournamentId;
    if (!tournamentId) return;

    if (button.classList.contains('join-tournament-btn')) {
      joinTournament(container, tournamentId);
    } else if (button.classList.contains('view-details-btn')) {
      showTournamentDetails(container, tournamentId);
    } else if (button.classList.contains('start-tournament-btn')) {
      startTournament(container, tournamentId);
    }
  });
}

async function joinTournament(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    await tournamentApi.joinTournament(tournamentId);
    showNotification('Successfully joined tournament!', 'success');
    await loadTournaments(container);
  } catch (error) {
    console.error('Failed to join tournament:', error);
    showNotification('Failed to join tournament.', 'error');
  }
}

async function showTournamentDetails(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    const tournament = await tournamentApi.getTournament(tournamentId);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isCreator = currentUser.id === tournament.createdBy;
    const userParticipant = tournament.participants.find(p => p.userId === currentUser.id);
    
    const modalHTML = `
      <div id="tournamentDetailsModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="card p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-scale">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-3xl font-bold text-neon-green mb-2 font-retro">${tournament.name}</h3>
              <div class="flex items-center gap-4 text-sm font-mono">
                <span class="text-neon-cyan/70">Status:</span>
                <span class="text-neon-${tournament.status === 'WAITING' ? 'cyan' : tournament.status === 'ACTIVE' ? 'green' : 'pink'} font-bold">${tournament.status}</span>
                ${isCreator ? '<span class="badge badge-success ml-4">YOU ARE THE CREATOR</span>' : ''}
              </div>
            </div>
            <button id="closeModal" class="btn btn-ghost text-2xl">&times;</button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Tournament Info -->
            <div class="space-y-6">
              <div class="card p-4 bg-gray-800/30">
                <h4 class="text-lg font-bold text-neon-cyan mb-3 font-retro">TOURNAMENT INFO</h4>
                <div class="space-y-2 text-sm font-mono">
                  <div class="flex justify-between">
                    <span class="text-neon-cyan/70">Players:</span>
                    <span class="text-neon-cyan">${tournament.currentPlayers}/${tournament.maxPlayers}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neon-cyan/70">Created:</span>
                    <span class="text-neon-cyan">${new Date(tournament.createdAt).toLocaleDateString()}</span>
                  </div>
                  ${tournament.startedAt ? `
                    <div class="flex justify-between">
                      <span class="text-neon-cyan/70">Started:</span>
                      <span class="text-neon-green">${new Date(tournament.startedAt).toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${tournament.completedAt ? `
                    <div class="flex justify-between">
                      <span class="text-neon-cyan/70">Completed:</span>
                      <span class="text-neon-pink">${new Date(tournament.completedAt).toLocaleString()}</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Participants -->
              <div class="card p-4 bg-gray-800/30">
                <h4 class="text-lg font-bold text-neon-cyan mb-3 font-retro">PARTICIPANTS</h4>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  ${tournament.participants.map(participant => `
                    <div class="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                      <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full ${participant.status === 'ACTIVE' ? 'bg-neon-green' : participant.status === 'ELIMINATED' ? 'bg-red-500' : 'bg-neon-pink'}"></div>
                        <span class="font-mono ${participant.participantType === 'AI' ? 'text-neon-pink/70' : 'text-neon-cyan'}">${participant.displayName}</span>
                        ${participant.userId === currentUser.id ? '<span class="badge badge-primary text-xs ml-2">YOU</span>' : ''}
                      </div>
                      <div class="text-xs font-mono">
                        ${participant.participantType === 'AI' ? 'AI' : 'HUMAN'}
                        ${participant.finalPosition ? ` | #${participant.finalPosition}` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Matches/Bracket -->
            <div class="space-y-6">
              ${tournament.matches && tournament.matches.length > 0 ? `
                <div class="card p-4 bg-gray-800/30">
                  <h4 class="text-lg font-bold text-neon-cyan mb-3 font-retro">MATCHES</h4>
                  <div class="space-y-2 max-h-64 overflow-y-auto">
                    ${tournament.matches.map(match => `
                      <div class="p-3 bg-gray-700/30 rounded">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-xs font-mono text-neon-cyan/70">Round ${match.round} - Match ${match.matchNumber}</span>
                          <span class="text-xs font-mono text-${match.status === 'COMPLETED' ? 'neon-green' : match.status === 'IN_PROGRESS' ? 'neon-pink' : 'neon-cyan'}">${match.status}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="font-mono text-sm">${match.player1?.displayName || 'TBD'}</span>
                          <div class="text-center">
                            ${match.status === 'COMPLETED' ? `
                              <span class="font-mono text-neon-green">${match.player1Score || 0} - ${match.player2Score || 0}</span>
                            ` : '<span class="text-neon-cyan/50">vs</span>'}
                          </div>
                          <span class="font-mono text-sm">${match.player2?.displayName || 'TBD'}</span>
                        </div>
                        ${match.status === 'IN_PROGRESS' && (match.player1?.userId === currentUser.id || match.player2?.userId === currentUser.id) ? `
                          <button class="btn btn-sm btn-primary mt-2 w-full play-match-btn" data-match-id="${match.id}" data-tournament-id="${tournament.id}">
                            PLAY YOUR MATCH
                          </button>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div class="card p-4 bg-gray-800/30 text-center">
                  <h4 class="text-lg font-bold text-neon-cyan mb-3 font-retro">MATCHES</h4>
                  <p class="text-neon-cyan/70 font-mono">Tournament hasn't started yet</p>
                </div>
              `}

              <!-- Actions -->
              <div class="space-y-3">
                ${tournament.status === 'WAITING' && !userParticipant && !isCreator ? `
                  <button class="btn btn-primary w-full join-tournament-btn" data-tournament-id="${tournament.id}">
                    JOIN TOURNAMENT
                  </button>
                ` : ''}
                
                ${tournament.status === 'WAITING' && isCreator && tournament.currentPlayers === tournament.maxPlayers ? `
                  <button class="btn btn-success w-full start-tournament-btn" data-tournament-id="${tournament.id}">
                    START TOURNAMENT
                  </button>
                ` : ''}
                
                ${tournament.status === 'WAITING' && isCreator && tournament.currentPlayers < tournament.maxPlayers ? `
                  <div class="text-center p-4 bg-gray-800/30 rounded">
                    <p class="text-neon-cyan/70 font-mono text-sm">Waiting for more players...</p>
                    <p class="text-neon-cyan font-mono text-xs mt-1">${tournament.maxPlayers - tournament.currentPlayers} more needed</p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup modal event listeners
    const modal = document.getElementById('tournamentDetailsModal');
    const closeModal = () => {
      modal?.remove();
    };

    modal?.querySelector('#closeModal')?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Setup action buttons
    const joinButtons = modal?.querySelectorAll('.join-tournament-btn');
    joinButtons?.forEach(button => {
      button.addEventListener('click', async (e) => {
        const tournamentId = (e.currentTarget as HTMLElement).dataset.tournamentId;
        if (tournamentId) {
          await joinTournament(container, tournamentId);
          closeModal();
        }
      });
    });

    const startButtons = modal?.querySelectorAll('.start-tournament-btn');
    startButtons?.forEach(button => {
      button.addEventListener('click', async (e) => {
        const tournamentId = (e.currentTarget as HTMLElement).dataset.tournamentId;
        if (tournamentId) {
          await startTournament(container, tournamentId);
          closeModal();
        }
      });
    });

    const playMatchButtons = modal?.querySelectorAll('.play-match-btn');
    playMatchButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const matchId = (e.currentTarget as HTMLElement).dataset.matchId;
        const tourneyId = (e.currentTarget as HTMLElement).dataset.tournamentId;
        if (matchId && tourneyId) {
          closeModal();
          startLocalTournamentMatch(container, { matchId, tournamentId: tourneyId });
        }
      });
    });

  } catch (error) {
    console.error(`Failed to get tournament details for ${tournamentId}:`, error);
    showNotification('Failed to load tournament details.', 'error');
  }
}

async function startTournament(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    await tournamentApi.startTournament(tournamentId);
    showNotification('Tournament started successfully!', 'success');
    await loadTournaments(container);
  } catch (error) {
    console.error('Failed to start tournament:', error);
    showNotification('Failed to start tournament.', 'error');
  }
}

function startTournamentAutoRefresh(container: HTMLElement): void {
  // Clear any existing interval
  stopTournamentAutoRefresh();
  
  // Refresh tournaments every 10 seconds
  tournamentRefreshInterval = setInterval(async () => {
    try {
      await loadTournaments(container);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  }, 10000);
}

function stopTournamentAutoRefresh(): void {
  if (tournamentRefreshInterval) {
    clearInterval(tournamentRefreshInterval);
    tournamentRefreshInterval = null;
  }
}

async function startLocalTournamentMatch(container: HTMLElement, matchInfo: { matchId: string, tournamentId: string }): Promise<void> {
  try {
    console.log('[Tournament] Starting local tournament match:', matchInfo);
    
    // Get match details from the API
    const matchDetails = await tournamentApi.getMatchDetails(matchInfo.matchId);
    console.log('[Tournament] Match details:', matchDetails);
    
    if (!matchDetails.player1 || !matchDetails.player2) {
      showNotification('Match players not found', 'error');
      return;
    }

    // Hide tournament section and show game section
    const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
    const gameSection = container.querySelector('#gameSection') as HTMLElement;
    const gameTitle = container.querySelector('#gameTitle') as HTMLElement;
    const canvasContainer = container.querySelector('#canvasContainer') as HTMLElement;
    
    if (tournamentSection) tournamentSection.classList.add('hidden');
    if (gameSection) gameSection.classList.remove('hidden');
    if (gameTitle) gameTitle.textContent = `Tournament Match - Round ${matchDetails.round}`;

    // Set up player names in the UI
    const player1Name = container.querySelector('#player1Name') as HTMLElement;
    const player2Name = container.querySelector('#player2Name') as HTMLElement;
    
    if (player1Name) player1Name.textContent = matchDetails.player1.displayName;
    if (player2Name) player2Name.textContent = matchDetails.player2.displayName;

    // Start the local game
    const gameResult = await startLocalGame(canvasContainer, {
      player1Name: matchDetails.player1.displayName,
      player2Name: matchDetails.player2.displayName,
      isAI1: matchDetails.player1.participantType === 'AI',
      isAI2: matchDetails.player2.participantType === 'AI'
    });

    console.log('[Tournament] Game finished with result:', gameResult);

    // Submit match result to tournament API
    if (gameResult) {
      try {
        const winner = gameResult.winner === 'PLAYER_1' ? matchDetails.player1 : matchDetails.player2;
        
        const resultPayload = {
          winnerId: winner.userId || winner.id,
          scorePlayer1: gameResult.score.player1,
          scorePlayer2: gameResult.score.player2
        };

        await tournamentApi.submitMatchResult(matchInfo.matchId, resultPayload, matchDetails);
        showNotification(`Match completed! ${winner.displayName} wins!`, 'success');
        
        // Return to tournament view
        if (gameSection) gameSection.classList.add('hidden');
        if (tournamentSection) tournamentSection.classList.remove('hidden');
        
        // Refresh tournament data
        await loadTournaments(container);
        
      } catch (error) {
        console.error('Failed to submit match result:', error);
        showNotification('Failed to submit match result', 'error');
      }
    }

  } catch (error) {
    console.error('Failed to start tournament match:', error);
    showNotification('Failed to start tournament match', 'error');
  }
}
