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
      <div class="card p-8 max-w-2xl mx-auto animate-slide-up">
        <form id="createTournamentForm">
          <div class="mb-8">
            <label for="tournamentName" class="block text-neon-cyan/80 mb-3 font-mono text-lg">Tournament Name</label>
            <input type="text" id="tournamentName" name="name" class="input w-full text-lg text-black" required placeholder="Enter tournament name...">
          </div>

          <div class="mb-8">
            <label class="block text-neon-cyan/80 mb-3 font-mono text-lg">Number of Players</label>
            <div class="grid grid-cols-2 gap-4">
              <button type="button" id="players-4" class="btn btn-primary h-16 player-count-btn" data-count="4">
                <div class="text-center">
                  <div class="text-2xl font-bold">4</div>
                  <div class="text-sm opacity-80">Players</div>
                </div>
              </button>
              <button type="button" id="players-8" class="btn btn-ghost h-16 player-count-btn" data-count="8">
                <div class="text-center">
                  <div class="text-2xl font-bold">8</div>
                  <div class="text-sm opacity-80">Players</div>
                </div>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-3 text-center">
              Players can join the tournament after it's created
            </p>
          </div>

          <div class="flex justify-center mt-12">
            <button type="submit" class="btn btn-success btn-lg px-12 py-4 text-lg">
              <span class="mr-2">🏆</span>
              CREATE TOURNAMENT
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupEventListeners(container);
  initializePlayerCount(container, 4); // Default to 4 players

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton');
  backButton?.addEventListener('click', () => {
    // Navigate to tournament list instead of using history.back()
    window.location.href = '/game?view=tournaments';
  });

  const playerCountButtons = container.querySelectorAll('.player-count-btn');
  playerCountButtons.forEach(button => {
    button.addEventListener('click', () => {
      const count = parseInt((button as HTMLElement).dataset.count || '4', 10);
      initializePlayerCount(container, count);

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

  const form = container.querySelector('#createTournamentForm') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(container);
  });
}

function initializePlayerCount(container: HTMLElement, maxPlayers: number) {
  (container as any).maxPlayers = maxPlayers;
}

async function handleFormSubmit(container: HTMLElement) {
  console.log('[TournamentCreate] Form submission started');
  console.log('[TournamentCreate] Container:', container);
  
  const form = container.querySelector('#createTournamentForm') as HTMLFormElement;
  const formData = new FormData(form);
  const name = formData.get('name') as string;
  const maxPlayers = (container as any).maxPlayers || 4;

  console.log('[TournamentCreate] Form data extracted:', {
    name,
    maxPlayers,
  });

  if (!name.trim()) {
    showNotification('Tournament name cannot be empty.', 'error');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const tournamentData = {
    name: name.trim(),
    maxPlayers: maxPlayers,
    userId: user.id,
    displayName: user.username || 'Player 1',
  };

  console.log('[TournamentCreate] Creating tournament with data:', {
    name: tournamentData.name,
    maxPlayers: tournamentData.maxPlayers,
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
