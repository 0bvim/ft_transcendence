import { tournamentApi, Tournament } from '../api/tournament';

export default function TournamentDetail(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  // Get tournament ID from URL
  const tournamentId = window.location.pathname.split('/').pop();

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button id="back-btn" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600" id="tournament-name">
            Loading...
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="px-4 py-2 rounded-full text-sm font-medium" id="tournament-status">
            <!-- Status badge -->
          </span>
          <button id="join-tournament-btn" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hidden">
            Join Tournament
          </button>
        </div>
      </div>

      <!-- Tournament Info -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2">
          <!-- Tournament Bracket -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-2xl font-semibold mb-6 text-purple-400">Tournament Bracket</h2>
            <div id="tournament-bracket" class="min-h-96">
              <!-- Bracket will be rendered here -->
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <!-- Tournament Details -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-xl font-semibold mb-4 text-green-400">Tournament Details</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Format:</span>
                <span class="text-white">Single Elimination</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Players:</span>
                <span class="text-white" id="player-count">0/8</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Created by:</span>
                <span class="text-white" id="creator-name">Unknown</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Created:</span>
                <span class="text-white" id="created-date">Unknown</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Type:</span>
                <span class="text-white" id="tournament-type">Mixed</span>
              </div>
            </div>
          </div>

          <!-- Players List -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-xl font-semibold mb-4 text-blue-400">Players</h3>
            <div id="players-list" class="space-y-2">
              <!-- Players will be listed here -->
            </div>
          </div>

          <!-- Tournament Progress -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-xl font-semibold mb-4 text-yellow-400">Progress</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Matches Completed:</span>
                <span class="text-white" id="matches-completed">0/3</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" id="progress-bar" style="width: 0%"></div>
              </div>
              <div class="text-xs text-gray-400 text-center" id="progress-text">
                Waiting for tournament to start
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Match (if active) -->
      <div id="live-match-section" class="hidden">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 class="text-2xl font-semibold mb-4 text-red-400">🔴 Live Match</h2>
          <div class="text-center">
            <p class="text-lg mb-4" id="live-match-info">Player1 vs Player2</p>
            <button id="watch-match-btn" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Watch Live
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners and load tournament data
  setupEventListeners(container);
  loadTournamentData(tournamentId);

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const backBtn = container.querySelector('#back-btn');
  const joinBtn = container.querySelector('#join-tournament-btn');
  const watchBtn = container.querySelector('#watch-match-btn');

  backBtn?.addEventListener('click', () => {
    window.location.href = '/tournament';
  });

  joinBtn?.addEventListener('click', () => {
    handleJoinTournament();
  });

  watchBtn?.addEventListener('click', () => {
    // TODO: Navigate to game view
    console.log('Watching live match...');
  });
}

async function loadTournamentData(tournamentId: string | undefined) {
  if (!tournamentId) {
    showErrorMessage('Tournament ID not found');
    return;
  }

  try {
    // Show loading state
    showLoadingState();

    // Load tournament data from API
    const response = await tournamentApi.getTournament(tournamentId);
    const tournament = response.tournament;

    // Transform API data to match display format
    const transformedTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      maxPlayers: tournament.maxParticipants,
      currentPlayers: tournament.currentParticipants,
      status: tournament.status.toLowerCase(),
      createdBy: tournament.createdBy,
      createdAt: tournament.createdAt,
      type: tournament.participants.some(p => p.participantType === 'AI') ? 'mixed' : 'human',
      players: tournament.participants.map(p => ({
        id: p.id,
        name: p.displayName,
        type: p.participantType.toLowerCase(),
        status: p.eliminated ? 'eliminated' : 'active'
      })),
      matches: tournament.matches.map(m => ({
        id: m.id,
        player1: m.player1DisplayName,
        player2: m.player2DisplayName,
        winner: m.winnerId ? (m.winnerId === m.player1Id ? m.player1DisplayName : m.player2DisplayName) : null,
        round: m.round,
        status: m.status.toLowerCase(),
        player1Score: m.player1Score,
        player2Score: m.player2Score
      }))
    };

    // Hide loading state and display data
    hideLoadingState();
    displayTournamentData(transformedTournament);

  } catch (error) {
    console.error('Error loading tournament data:', error);
    hideLoadingState();
    showErrorMessage('Failed to load tournament data. Please try again.');
  }
}

function displayTournamentData(tournament: any) {
  // Update header
  document.getElementById('tournament-name')!.textContent = tournament.name;
  
  // Update status badge
  const statusBadge = document.getElementById('tournament-status')!;
  const statusColors: { [key: string]: string } = {
    waiting: 'bg-yellow-500',
    active: 'bg-green-500',
    completed: 'bg-gray-500'
  };
  statusBadge.className = `px-4 py-2 rounded-full text-sm font-medium ${statusColors[tournament.status] || 'bg-gray-500'} text-white`;
  statusBadge.textContent = tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1);

  // Update tournament details
  document.getElementById('player-count')!.textContent = `${tournament.currentPlayers}/${tournament.maxPlayers}`;
  document.getElementById('creator-name')!.textContent = tournament.createdBy;
  document.getElementById('created-date')!.textContent = new Date(tournament.createdAt).toLocaleDateString();
  document.getElementById('tournament-type')!.textContent = tournament.type === 'mixed' ? 'Mixed (Human + AI)' : 'Humans Only';

  // Show join button if tournament is waiting and not full
  const joinBtn = document.getElementById('join-tournament-btn');
  if (tournament.status === 'waiting' && tournament.currentPlayers < tournament.maxPlayers) {
    joinBtn?.classList.remove('hidden');
  }

  // Update progress
  const completedMatches = tournament.matches.filter((m: any) => m.status === 'completed').length;
  const totalMatches = tournament.matches.length;
  const progressPercent = (completedMatches / totalMatches) * 100;
  
  document.getElementById('matches-completed')!.textContent = `${completedMatches}/${totalMatches}`;
  document.getElementById('progress-bar')!.style.width = `${progressPercent}%`;
  
  const progressText = document.getElementById('progress-text')!;
  if (tournament.status === 'waiting') {
    progressText.textContent = 'Waiting for tournament to start';
  } else if (tournament.status === 'active') {
    progressText.textContent = `Round ${getCurrentRound(tournament.matches)} in progress`;
  } else {
    progressText.textContent = 'Tournament completed';
  }

  // Display players
  displayPlayers(tournament.players);

  // Display bracket
  displayTournamentBracket(tournament);

  // Show live match if any
  const liveMatch = tournament.matches.find((m: any) => m.status === 'active');
  if (liveMatch) {
    showLiveMatch(liveMatch);
  }
}

function displayPlayers(players: any[]) {
  const playersContainer = document.getElementById('players-list')!;
  playersContainer.innerHTML = '';

  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'flex items-center justify-between p-2 bg-gray-700 rounded';
    
    const playerIcon = player.type === 'ai' ? '🤖' : '👤';
    const statusColor = player.status === 'active' ? 'text-green-400' : 'text-gray-400';
    
    playerDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${playerIcon}</span>
        <span class="text-sm">${player.name}</span>
      </div>
      <span class="text-xs ${statusColor}">${player.status}</span>
    `;
    
    playersContainer.appendChild(playerDiv);
  });
}

function displayTournamentBracket(tournament: any) {
  const bracketContainer = document.getElementById('tournament-bracket')!;
  
  // Simple bracket visualization for single elimination
  const rounds = organizeBracketRounds(tournament.matches);
  
  bracketContainer.innerHTML = '';
  
  rounds.forEach((round, roundIndex) => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'mb-6';
    
    const roundTitle = document.createElement('h3');
    roundTitle.className = 'text-lg font-semibold mb-3 text-center';
    roundTitle.textContent = getRoundName(roundIndex + 1, rounds.length);
    roundDiv.appendChild(roundTitle);
    
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    
    round.forEach(match => {
      const matchDiv = createMatchCard(match);
      matchesContainer.appendChild(matchDiv);
    });
    
    roundDiv.appendChild(matchesContainer);
    bracketContainer.appendChild(roundDiv);
  });
}

function organizeBracketRounds(matches: any[]): any[][] {
  const rounds: any[][] = [];
  const maxRound = Math.max(...matches.map(m => m.round));
  
  for (let i = 1; i <= maxRound; i++) {
    const roundMatches = matches.filter(m => m.round === i);
    rounds.push(roundMatches);
  }
  
  return rounds;
}

function createMatchCard(match: any): HTMLElement {
  const matchDiv = document.createElement('div');
  const statusColors: { [key: string]: string } = {
    waiting: 'border-gray-600',
    active: 'border-yellow-500',
    completed: 'border-green-500'
  };
  
  matchDiv.className = `bg-gray-700 rounded-lg p-4 border-2 ${statusColors[match.status] || 'border-gray-600'} transition-all duration-200`;
  
  const player1Icon = match.player1?.includes('AI') ? '🤖' : '👤';
  const player2Icon = match.player2?.includes('AI') ? '🤖' : '👤';
  
  matchDiv.innerHTML = `
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 ${match.winner === match.player1 ? 'text-green-400 font-semibold' : 'text-white'}">
          <span>${player1Icon}</span>
          <span class="text-sm">${match.player1 || 'TBD'}</span>
        </div>
        ${match.status === 'completed' && match.winner === match.player1 ? '<span class="text-green-400">✓</span>' : ''}
      </div>
      <div class="text-center text-xs text-gray-400">VS</div>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 ${match.winner === match.player2 ? 'text-green-400 font-semibold' : 'text-white'}">
          <span>${player2Icon}</span>
          <span class="text-sm">${match.player2 || 'TBD'}</span>
        </div>
        ${match.status === 'completed' && match.winner === match.player2 ? '<span class="text-green-400">✓</span>' : ''}
      </div>
      <div class="text-center">
        <span class="text-xs px-2 py-1 rounded ${getMatchStatusStyle(match.status)}">
          ${match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </span>
      </div>
    </div>
  `;
  
  return matchDiv;
}

function getMatchStatusStyle(status: string): string {
  switch (status) {
    case 'waiting': return 'bg-gray-600 text-gray-300';
    case 'active': return 'bg-yellow-600 text-yellow-100';
    case 'completed': return 'bg-green-600 text-green-100';
    default: return 'bg-gray-600 text-gray-300';
  }
}

function getRoundName(roundNum: number, totalRounds: number): string {
  if (roundNum === totalRounds) return 'Final';
  if (roundNum === totalRounds - 1) return 'Semi-Final';
  if (roundNum === totalRounds - 2) return 'Quarter-Final';
  return `Round ${roundNum}`;
}

function getCurrentRound(matches: any[]): number {
  const activeMatch = matches.find(m => m.status === 'active');
  return activeMatch ? activeMatch.round : 1;
}

function showLiveMatch(match: any) {
  const liveMatchSection = document.getElementById('live-match-section')!;
  const liveMatchInfo = document.getElementById('live-match-info')!;
  
  liveMatchInfo.textContent = `${match.player1} vs ${match.player2}`;
  liveMatchSection.classList.remove('hidden');
}

async function handleJoinTournament() {
  const tournamentId = window.location.pathname.split('/').pop();
  
  if (!tournamentId) {
    showErrorMessage('Tournament ID not found');
    return;
  }

  try {
    await tournamentApi.joinTournament(tournamentId);
    showSuccessMessage('Successfully joined tournament!');
    
    // Reload tournament data to reflect changes
    setTimeout(() => {
      loadTournamentData(tournamentId);
    }, 1000);
  } catch (error) {
    console.error('Error joining tournament:', error);
    showErrorMessage('Failed to join tournament. Please try again.');
  }
}

function showLoadingState() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-state';
  loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loadingDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-white text-lg">Loading tournament data...</p>
    </div>
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoadingState() {
  const loadingDiv = document.getElementById('loading-state');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

function showErrorMessage(message: string) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccessMessage(message: string) {
  const successDiv = document.createElement('div');
  successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}
