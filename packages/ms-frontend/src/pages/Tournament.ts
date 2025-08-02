import { tournamentApi, type Tournament as TournamentType } from '../api/tournament.ts';

export default function Tournament(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button id="backButton" class="btn btn-ghost text-gray-400 hover:text-white">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Tournament Hub
          </h1>
        </div>
        <button id="create-tournament-btn" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
          Create Tournament
        </button>
      </div>

      <!-- Loading State -->
      <div id="loading-state" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <p class="mt-4 text-gray-400">Loading tournaments...</p>
      </div>

      <!-- Tournament Stats -->
      <div id="tournament-stats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-2 text-blue-400">Active Tournaments</h3>
          <p class="text-3xl font-bold" id="active-tournaments-count">0</p>
        </div>
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-2 text-green-400">Waiting for Players</h3>
          <p class="text-3xl font-bold" id="waiting-tournaments-count">0</p>
        </div>
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold mb-2 text-purple-400">Your Tournaments</h3>
          <p class="text-3xl font-bold" id="user-tournaments-count">0</p>
        </div>
      </div>

      <!-- Error State -->
      <div id="error-state" class="hidden text-center py-12">
        <div class="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold mb-2">Error Loading Tournaments</h3>
        <p class="text-gray-400 mb-4" id="error-message">Failed to load tournaments</p>
        <button id="retry-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Retry
        </button>
      </div>

      <!-- Tournament List -->
      <div id="tournament-content" class="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
        <!-- Available Tournaments -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-2xl font-semibold mb-4 text-green-400">Available Tournaments</h2>
          <div id="available-tournaments" class="space-y-4">
            <!-- Tournament cards will be populated here -->
          </div>
        </div>

        <!-- Your Tournaments -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-2xl font-semibold mb-4 text-purple-400">Your Tournaments</h2>
          <div id="user-tournaments" class="space-y-4">
            <!-- User's tournament cards will be populated here -->
          </div>
        </div>
      </div>

      <!-- Tournament Rules -->
      <div id="tournament-rules" class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700 hidden">
        <h2 class="text-2xl font-semibold mb-4 text-yellow-400">Tournament Rules</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h3 class="font-semibold mb-2">Format</h3>
            <p>Single-elimination bracket</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Players</h3>
            <p>4-8 players per tournament</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">AI Opponents</h3>
            <p>AI can participate alongside humans</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Scoring</h3>
            <p>Match results are final</p>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEventListeners(container);
  loadTournaments(container);
  
  return container;
}

async function loadTournaments(container: HTMLElement) {
  const loadingState = container.querySelector('#loading-state') as HTMLElement;
  const errorState = container.querySelector('#error-state') as HTMLElement;
  const tournamentStats = container.querySelector('#tournament-stats') as HTMLElement;
  const tournamentContent = container.querySelector('#tournament-content') as HTMLElement;
  const tournamentRules = container.querySelector('#tournament-rules') as HTMLElement;

  try {
    // Show loading state
    showElement(loadingState);
    hideElement(errorState);
    hideElement(tournamentStats);
    hideElement(tournamentContent);
    hideElement(tournamentRules);

    console.log('Loading tournaments...');

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Load tournaments with timeout
      const response = await Promise.race([
        tournamentApi.getTournaments({ limit: 50 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout - please check your connection')), 10000)
        )
      ]) as any;
      
      clearTimeout(timeoutId);
      console.log('Tournament API response:', response);
      
      // Ensure we have a valid tournaments array
      const tournaments = Array.isArray(response.tournaments) ? response.tournaments : 
                         Array.isArray(response.data) ? response.data : 
                         Array.isArray(response) ? response : [];
      console.log('Processed tournaments:', tournaments);

      // Get current user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user:', user);
      
      // Categorize tournaments with safety checks
      const availableTournaments = tournaments.filter(t => 
        t && t.status === 'WAITING' && t.createdBy !== user.id
      );
      const userTournaments = tournaments.filter(t => 
        t && t.createdBy === user.id
      );
      const activeTournaments = tournaments.filter(t => 
        t && t.status === 'ACTIVE'
      );
      const waitingTournaments = tournaments.filter(t => 
        t && t.status === 'WAITING'
      );

      console.log('Categorized tournaments:', {
        available: availableTournaments.length,
        user: userTournaments.length,
        active: activeTournaments.length,
        waiting: waitingTournaments.length
      });

      // Update stats
      updateStats(container, {
        active: activeTournaments.length,
        waiting: waitingTournaments.length,
        user: userTournaments.length
      });

      // Render tournaments
      renderTournamentsList(container, availableTournaments, userTournaments);

      // Show content
      hideElement(loadingState);
      showElement(tournamentStats);
      showElement(tournamentContent);
      showElement(tournamentRules);

    } catch (apiError) {
      clearTimeout(timeoutId);
      throw apiError;
    }

  } catch (error) {
    console.error('Error loading tournaments:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error
    });
    
    // Show error state
    hideElement(loadingState);
    showElement(errorState);
    hideElement(tournamentStats);
    hideElement(tournamentContent);
    hideElement(tournamentRules);

    const errorMessage = container.querySelector('#error-message') as HTMLElement;
    if (errorMessage) {
      const errorText = error instanceof Error ? error.message : 'An unexpected error occurred';
      errorMessage.textContent = errorText;
      console.log('Error message set to:', errorText);
    }
  }
}

function updateStats(container: HTMLElement, stats: {active: number, waiting: number, user: number}) {
  const activeCount = container.querySelector('#active-tournaments-count') as HTMLElement;
  const waitingCount = container.querySelector('#waiting-tournaments-count') as HTMLElement;
  const userCount = container.querySelector('#user-tournaments-count') as HTMLElement;

  activeCount.textContent = stats.active.toString();
  waitingCount.textContent = stats.waiting.toString();
  userCount.textContent = stats.user.toString();
}

function renderTournamentsList(container: HTMLElement, availableTournaments: TournamentType[], userTournaments: TournamentType[]) {
  const availableContainer = container.querySelector('#available-tournaments') as HTMLElement;
  const userContainer = container.querySelector('#user-tournaments') as HTMLElement;

  // Render available tournaments
  if (availableTournaments.length === 0) {
    availableContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>No tournaments available to join</p>
        <p class="text-sm mt-2">Create one to get started!</p>
      </div>
    `;
  } else {
    availableContainer.innerHTML = availableTournaments
      .map(tournament => renderTournamentCard(tournament, 'join'))
      .join('');
  }

  // Render user tournaments
  if (userTournaments.length === 0) {
    userContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>You haven't created any tournaments yet</p>
        <p class="text-sm mt-2">Click "Create Tournament" to start one!</p>
      </div>
    `;
  } else {
    userContainer.innerHTML = userTournaments
      .map(tournament => renderTournamentCard(tournament, 'manage'))
      .join('');
  }

  // Add event listeners for tournament cards
  setupTournamentCardListeners(container);
}

function renderTournamentCard(tournament: TournamentType, type: 'join' | 'manage'): string {
  const statusColor = {
    'WAITING': 'text-yellow-400',
    'ACTIVE': 'text-green-400', 
    'COMPLETED': 'text-blue-400',
    'CANCELLED': 'text-red-400'
  }[tournament.status] || 'text-gray-400';

  return `
    <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 tournament-card" data-tournament-id="${tournament.id}" data-action="${type}">
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-semibold truncate">${tournament.name}</h3>
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-600 ${statusColor}">
          ${tournament.status}
        </span>
      </div>
      
      <p class="text-gray-300 text-sm mb-3 line-clamp-2">${tournament.description || 'No description'}</p>
      
             <div class="flex justify-between items-center text-sm text-gray-400 mb-3">
         <span>Players: ${tournament.currentPlayers || 0}/${tournament.maxPlayers}</span>
         <span>Type: ${tournament.tournamentType || 'MIXED'}</span>
       </div>
      
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          Created ${new Date(tournament.createdAt).toLocaleDateString()}
        </div>
        <button class="tournament-action-btn px-3 py-1 rounded text-sm font-medium transition-colors ${
          type === 'join' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }">
          ${type === 'join' ? 'Join' : 'View'}
        </button>
      </div>
    </div>
  `;
}

function setupTournamentCardListeners(container: HTMLElement) {
  const tournamentCards = container.querySelectorAll('.tournament-card');
  
  tournamentCards.forEach(card => {
    const actionBtn = card.querySelector('.tournament-action-btn') as HTMLButtonElement;
    const tournamentId = card.getAttribute('data-tournament-id');
    const action = card.getAttribute('data-action');
    
    actionBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      if (!tournamentId) return;
      
      if (action === 'join') {
        await handleJoinTournament(tournamentId, actionBtn);
      } else {
        // Navigate to tournament detail
        window.location.href = `/tournament/${tournamentId}`;
      }
    });

    // Make entire card clickable for navigation
    card.addEventListener('click', () => {
      if (tournamentId) {
        window.location.href = `/tournament/${tournamentId}`;
      }
    });
  });
}

async function handleJoinTournament(tournamentId: string, button: HTMLButtonElement) {
  const originalText = button.textContent;
  
  try {
    // Show loading state
    button.disabled = true;
    button.textContent = 'Joining...';
    button.classList.add('opacity-75');
    
    // Join tournament
    await tournamentApi.joinTournament(tournamentId);
    
    // Success feedback
    button.textContent = 'Joined!';
    button.classList.remove('bg-green-600', 'hover:bg-green-700');
    button.classList.add('bg-blue-600');
    
    // Refresh page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('Error joining tournament:', error);
    
    // Show error feedback
    button.textContent = 'Error';
    button.classList.remove('bg-green-600', 'hover:bg-green-700');
    button.classList.add('bg-red-600');
    
    // Reset after delay
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
      button.classList.remove('opacity-75', 'bg-red-600');
      button.classList.add('bg-green-600', 'hover:bg-green-700');
    }, 2000);
    
    // Show error message to user
    alert(error instanceof Error ? error.message : 'Failed to join tournament');
  }
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton') as HTMLButtonElement;
  const createTournamentBtn = container.querySelector('#create-tournament-btn') as HTMLButtonElement;
  const retryBtn = container.querySelector('#retry-btn') as HTMLButtonElement;

  // Back to dashboard
  backButton.addEventListener('click', () => {
    window.location.href = '/dashboard';
  });

  // Create tournament
  createTournamentBtn.addEventListener('click', () => {
    window.location.href = '/tournament/create';
  });

  // Retry loading
  retryBtn.addEventListener('click', () => {
    loadTournaments(container);
  });
}

// Utility functions
function showElement(element: HTMLElement) {
  element.classList.remove('hidden');
}

function hideElement(element: HTMLElement) {
  element.classList.add('hidden');
}
