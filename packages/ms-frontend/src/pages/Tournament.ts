import { tournamentApi, type Tournament as TournamentType } from '../api/tournament';

export default function Tournament(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Tournament Hub
        </h1>
        <button id="create-tournament-btn" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
          Create Tournament
        </button>
      </div>

      <!-- Tournament Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      <!-- Tournament List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
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
            <p>Results stored on blockchain</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners(container);

  // Load tournaments on page load
  loadTournaments();

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const createTournamentBtn = container.querySelector('#create-tournament-btn');
  
  createTournamentBtn?.addEventListener('click', () => {
    // Navigate to tournament creation page
    window.history.pushState({}, '', '/tournament/create');
    window.dispatchEvent(new Event('popstate'));
  });
}

function loadTournaments() {
  // TODO: Load tournaments from backend
  // For now, create mock data
  const mockTournaments = [
    {
      id: 1,
      name: 'Spring Championship',
      players: 6,
      maxPlayers: 8,
      status: 'waiting',
      createdBy: 'player1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'AI Challenge',
      players: 4,
      maxPlayers: 4,
      status: 'active',
      createdBy: 'player2',
      createdAt: new Date().toISOString(),
    },
  ];

  displayTournaments(mockTournaments);
}

function displayTournaments(tournaments: any[]) {
  const availableTournamentsContainer = document.getElementById('available-tournaments');
  const userTournamentsContainer = document.getElementById('user-tournaments');
  
  if (!availableTournamentsContainer || !userTournamentsContainer) return;

  // Clear existing content
  availableTournamentsContainer.innerHTML = '';
  userTournamentsContainer.innerHTML = '';

  // Update counts
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const waitingTournaments = tournaments.filter(t => t.status === 'waiting').length;
  const userTournaments = tournaments.filter(t => t.createdBy === getCurrentUser()).length;

  document.getElementById('active-tournaments-count')!.textContent = activeTournaments.toString();
  document.getElementById('waiting-tournaments-count')!.textContent = waitingTournaments.toString();
  document.getElementById('user-tournaments-count')!.textContent = userTournaments.toString();

  // Display tournaments
  tournaments.forEach(tournament => {
    const tournamentCard = createTournamentCard(tournament);
    
    if (tournament.createdBy === getCurrentUser()) {
      userTournamentsContainer.appendChild(tournamentCard);
    } else {
      availableTournamentsContainer.appendChild(tournamentCard);
    }
  });
}

function createTournamentCard(tournament: any): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all duration-300 cursor-pointer';
  
  const statusColor = tournament.status === 'active' ? 'text-green-400' : 
                     tournament.status === 'waiting' ? 'text-yellow-400' : 'text-gray-400';
  
  const statusText = tournament.status === 'active' ? 'Active' : 
                    tournament.status === 'waiting' ? 'Waiting for Players' : 'Completed';

  card.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">${tournament.name}</h3>
      <span class="text-sm ${statusColor} font-medium">${statusText}</span>
    </div>
    <div class="flex items-center justify-between text-sm text-gray-300">
      <span>Players: ${tournament.players}/${tournament.maxPlayers}</span>
      <span>Created by: ${tournament.createdBy}</span>
    </div>
    <div class="mt-3 flex space-x-2">
      ${tournament.status === 'waiting' ? `
        <button class="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition-colors duration-200">
          Join Tournament
        </button>
      ` : ''}
      <button class="bg-gray-600 hover:bg-gray-500 text-white text-sm py-1 px-3 rounded transition-colors duration-200">
        View Details
      </button>
    </div>
  `;

  // Add click handlers
  card.addEventListener('click', () => {
    // Navigate to tournament details
    window.history.pushState({}, '', `/tournament/${tournament.id}`);
    window.dispatchEvent(new Event('popstate'));
  });

  return card;
}

function getCurrentUser(): string {
  // TODO: Get current user from authentication system
  return 'current_user';
}
