import { tournamentApi } from '../api/tournament';
import { authApi } from '../api/auth';
import { showNotification } from '../components/notification';

interface SelectedPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isCreator?: boolean;
}

export default function TournamentCreate(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

  container.innerHTML = `
    <!-- Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 synthwave-grid opacity-15"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.12) 0%, transparent 70%);"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="horizon-line"></div>
      <div class="scan-line"></div>
    </div>

    <div class="relative z-10 container-fluid py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12 animate-fade-in">
        <div class="flex items-center space-x-6">
          <button id="backButton" class="btn btn-ghost group">
            <svg class="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            BACK
          </button>
          <h1 class="text-5xl font-bold text-gradient font-retro tracking-wider">
            <span class="text-neon-pink">CREATE</span> 
            <span class="text-neon-cyan">TOURNAMENT</span>
          </h1>
        </div>
      </div>

      <!-- Form -->
      <div class="card p-8 max-w-4xl mx-auto animate-slide-up">
        <form id="createTournamentForm">
          <div class="mb-6">
            <label for="tournamentName" class="block text-neon-cyan/80 mb-2 font-mono text-lg">Tournament Name</label>
            <input type="text" id="tournamentName" name="name" class="input w-full text-lg" required placeholder="Enter tournament name...">
          </div>

          <div class="mb-6">
            <label class="block text-neon-cyan/80 mb-2 font-mono text-lg">Number of Players</label>
            <div class="flex space-x-4">
              <button type="button" id="players-4" class="btn btn-primary w-full player-count-btn" data-count="4">4 Players</button>
              <button type="button" id="players-8" class="btn btn-ghost w-full player-count-btn" data-count="8">8 Players</button>
            </div>
          </div>

          <!-- Player Management Section -->
          <div class="mb-6">
            <label class="block text-neon-cyan/80 mb-4 font-mono text-lg">Tournament Players</label>
            <p class="text-xs text-neon-cyan/60 font-mono mb-4">
              You are the tournament host. Add registered players or leave slots empty for AI opponents.
              <br><strong>Note:</strong> All matches will be played on your machine. Other players must come to your location to play.
            </p>
            
            <!-- Player Search -->
            <div class="mb-4">
              <div class="flex space-x-2">
                <input type="text" id="playerSearch" class="input flex-1" placeholder="Search for registered players by username...">
                <button type="button" id="searchPlayerBtn" class="btn btn-secondary">Search</button>
              </div>
              <div id="searchResults" class="mt-2 hidden"></div>
            </div>

            <!-- Selected Players List -->
            <div id="selectedPlayersList" class="space-y-2">
              <!-- Players will be populated here -->
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button type="submit" class="btn btn-success btn-lg">CREATE TOURNAMENT</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupEventListeners(container);
  initializePlayerList(container, 4); // Default to 4 players

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton');
  backButton?.addEventListener('click', () => {
    window.history.back();
  });

  const playerCountButtons = container.querySelectorAll('.player-count-btn');
  playerCountButtons.forEach(button => {
    button.addEventListener('click', () => {
      const count = parseInt((button as HTMLElement).dataset.count || '4', 10);
      initializePlayerList(container, count);

      // Update button styles
      playerCountButtons.forEach(btn => {
        if (btn === button) {
          btn.classList.add('btn-primary');
          btn.classList.remove('btn-ghost');
        } else {
          btn.classList.add('btn-ghost');
          btn.classList.remove('btn-primary');
        }
      });
    });
  });

  // Player search functionality
  const searchInput = container.querySelector('#playerSearch') as HTMLInputElement;
  const searchBtn = container.querySelector('#searchPlayerBtn');
  
  const performSearch = async () => {
    const username = searchInput.value.trim();
    if (!username) return;

    try {
      const result = await authApi.searchUsers(username);
      displaySearchResults(container, result);
    } catch (error) {
      console.error('Search error:', error);
      showNotification('Error searching for users', 'error');
    }
  };

  searchBtn?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  const form = container.querySelector('#createTournamentForm') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(container);
  });
}

function initializePlayerList(container: HTMLElement, maxPlayers: number) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const selectedPlayersList = container.querySelector('#selectedPlayersList');
  if (!selectedPlayersList) return;

  // Initialize with creator as first player
  const players: SelectedPlayer[] = [{
    id: user.id,
    username: user.username || 'Player 1',
    displayName: user.displayName || user.username || 'Player 1',
    avatarUrl: user.avatarUrl,
    isCreator: true
  }];

  // Store max players and current list
  (container as any).maxPlayers = maxPlayers;
  (container as any).selectedPlayers = players;

  updatePlayersList(container);
}

function displaySearchResults(container: HTMLElement, result: any) {
  const searchResults = container.querySelector('#searchResults');
  if (!searchResults) return;

  if (!result.success || !result.user) {
    searchResults.innerHTML = `
      <div class="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
        User not found. Make sure the username is correct.
      </div>
    `;
    searchResults.classList.remove('hidden');
    return;
  }

  const user = result.user;
  const selectedPlayers = (container as any).selectedPlayers || [];
  const isAlreadySelected = selectedPlayers.some((p: SelectedPlayer) => p.id === user.id);

  searchResults.innerHTML = `
    <div class="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          ${user.avatarUrl ? 
            `<img src="${user.avatarUrl}" alt="${user.displayName}" class="w-8 h-8 rounded-full">` :
            `<div class="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink font-bold">${user.displayName[0].toUpperCase()}</div>`
          }
          <div>
            <div class="text-white font-semibold">${user.displayName}</div>
            <div class="text-neon-cyan/60 text-sm">@${user.username}</div>
          </div>
        </div>
        ${isAlreadySelected ? 
          `<span class="text-neon-cyan/60 text-sm">Already added</span>` :
          `<button type="button" class="btn btn-sm btn-primary" onclick="addPlayerToTournament('${user.id}', '${user.username}', '${user.displayName}', '${user.avatarUrl || ''}')">Add Player</button>`
        }
      </div>
    </div>
  `;
  searchResults.classList.remove('hidden');

  // Clear search input
  const searchInput = container.querySelector('#playerSearch') as HTMLInputElement;
  if (searchInput) searchInput.value = '';
}

// Global function to add player (called from button onclick)
(window as any).addPlayerToTournament = function(id: string, username: string, displayName: string, avatarUrl: string) {
  console.log('[TournamentCreate] Adding player to tournament:', { id, username, displayName, avatarUrl });
  
  const container = document.querySelector('.min-h-screen') as HTMLElement;
  if (!container) return;

  const selectedPlayers = (container as any).selectedPlayers || [];
  const maxPlayers = (container as any).maxPlayers || 4;

  console.log('[TournamentCreate] Current state:', {
    currentPlayersCount: selectedPlayers.length,
    maxPlayers,
    selectedPlayers: selectedPlayers.map((p: SelectedPlayer) => ({ id: p.id, displayName: p.displayName }))
  });

  if (selectedPlayers.length >= maxPlayers) {
    showNotification('Tournament is full', 'error');
    return;
  }

  if (selectedPlayers.some((p: SelectedPlayer) => p.id === id)) {
    showNotification('Player already added', 'error');
    return;
  }

  selectedPlayers.push({
    id,
    username,
    displayName,
    avatarUrl: avatarUrl || undefined
  });

  (container as any).selectedPlayers = selectedPlayers;
  console.log('[TournamentCreate] Player added successfully. New list:', selectedPlayers.map((p: SelectedPlayer) => ({ id: p.id, displayName: p.displayName })));
  
  updatePlayersList(container);

  // Hide search results
  const searchResults = container.querySelector('#searchResults');
  if (searchResults) searchResults.classList.add('hidden');

  showNotification(`${displayName} added to tournament`, 'success');
};

function updatePlayersList(container: HTMLElement) {
  const selectedPlayersList = container.querySelector('#selectedPlayersList');
  if (!selectedPlayersList) return;

  const selectedPlayers = (container as any).selectedPlayers || [];
  const maxPlayers = (container as any).maxPlayers || 4;

  let html = '';

  // Show selected players
  selectedPlayers.forEach((player: SelectedPlayer, index: number) => {
    html += `
      <div class="flex items-center justify-between p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded">
        <div class="flex items-center space-x-3">
          <span class="text-neon-cyan font-mono text-sm">Player ${index + 1}</span>
          ${player.avatarUrl ? 
            `<img src="${player.avatarUrl}" alt="${player.displayName}" class="w-8 h-8 rounded-full">` :
            `<div class="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink font-bold">${player.displayName[0].toUpperCase()}</div>`
          }
          <div>
            <div class="text-white font-semibold">${player.displayName}</div>
            <div class="text-neon-cyan/60 text-sm">@${player.username} ${player.isCreator ? '(Host)' : ''}</div>
          </div>
        </div>
        ${!player.isCreator ? 
          `<button type="button" class="btn btn-sm btn-ghost text-red-400 hover:text-red-300" onclick="removePlayerFromTournament('${player.id}')">Remove</button>` :
          `<span class="text-neon-cyan/60 text-sm">Tournament Host</span>`
        }
      </div>
    `;
  });

  // Show empty slots
  for (let i = selectedPlayers.length; i < maxPlayers; i++) {
    html += `
      <div class="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600/30 rounded">
        <div class="flex items-center space-x-3">
          <span class="text-gray-400 font-mono text-sm">Player ${i + 1}</span>
          <div class="text-gray-400">Empty slot (will be filled with AI)</div>
        </div>
      </div>
    `;
  }

  selectedPlayersList.innerHTML = html;
}

// Global function to remove player
(window as any).removePlayerFromTournament = function(playerId: string) {
  const container = document.querySelector('.min-h-screen') as HTMLElement;
  if (!container) return;

  const selectedPlayers = (container as any).selectedPlayers || [];
  const updatedPlayers = selectedPlayers.filter((p: SelectedPlayer) => p.id !== playerId);
  
  (container as any).selectedPlayers = updatedPlayers;
  updatePlayersList(container);
  
  showNotification('Player removed from tournament', 'success');
};

async function handleFormSubmit(container: HTMLElement) {
  console.log('[TournamentCreate] Form submission started');
  console.log('[TournamentCreate] Container:', container);
  
  const form = container.querySelector('#createTournamentForm') as HTMLFormElement;
  const formData = new FormData(form);
  const name = formData.get('name') as string;
  const selectedPlayers = (container as any).selectedPlayers || [];
  const maxPlayers = (container as any).maxPlayers || 4;

  console.log('[TournamentCreate] Form data extracted:', {
    name,
    selectedPlayersFromContainer: selectedPlayers,
    maxPlayers,
    containerHasSelectedPlayers: !!(container as any).selectedPlayers,
    selectedPlayersLength: selectedPlayers.length
  });

  if (!name.trim()) {
    showNotification('Tournament name cannot be empty.', 'error');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Build player list
  const players = [];
  
  console.log('[TournamentCreate] Building player list from selectedPlayers:', selectedPlayers);
  
  // Add selected players
  selectedPlayers.forEach((player: SelectedPlayer, index: number) => {
    console.log(`[TournamentCreate] Processing player ${index}:`, player);
    players.push({
      displayName: player.displayName,
      userId: player.id,
      participantType: 'HUMAN'
    });
  });

  console.log('[TournamentCreate] Players after adding selected players:', players);

  // Fill remaining slots with AI
  for (let i = players.length; i < maxPlayers; i++) {
    players.push({
      displayName: `AI Player ${i}`,
      userId: null,
      participantType: 'AI'
    });
  }

  console.log('[TournamentCreate] Final players list:', players);

  const tournamentData = {
    name: name.trim(),
    maxPlayers: maxPlayers,
    userId: user.id,
    displayName: user.username || 'Player 1',
    players: players
  };

  console.log('[TournamentCreate] Creating tournament with data:', {
    name: tournamentData.name,
    maxPlayers: tournamentData.maxPlayers,
    totalPlayers: players.length,
    humanPlayers: players.filter(p => p.participantType === 'HUMAN').length,
    aiPlayers: players.filter(p => p.participantType === 'AI').length,
    players: players.map(p => ({
      displayName: p.displayName,
      participantType: p.participantType,
      hasUserId: !!p.userId
    }))
  });

  try {
    const newTournament = await tournamentApi.createTournament(tournamentData);
    console.log('[TournamentCreate] Tournament created successfully:', newTournament);
    showNotification(`Tournament '${newTournament.name}' created successfully!`, 'success');
    
    // Navigate to the new tournament's detail page
    setTimeout(() => {
      window.location.href = `/tournament/${newTournament.id}`;
    }, 1500);

  } catch (error) {
    console.error('Failed to create tournament:', error);
    showNotification('Failed to create tournament. Please check the details and try again.', 'error');
  }
}
