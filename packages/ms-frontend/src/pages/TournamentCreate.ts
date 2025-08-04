import { tournamentApi } from '../api/tournament';
import { showNotification } from '../components/notification';

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
      <div class="card p-8 max-w-3xl mx-auto animate-slide-up">
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

          <div id="player-aliases-container" class="mb-6">
            <!-- Player alias fields will be injected here -->
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button type="submit" class="btn btn-success btn-lg">CREATE & START</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupEventListeners(container);
  updatePlayerAliases(container, 4); // Default to 4 players

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
      updatePlayerAliases(container, count);

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

function updatePlayerAliases(container: HTMLElement, count: number) {
  const aliasesContainer = container.querySelector('#player-aliases-container');
  if (!aliasesContainer) return;

  let content = `<label class="block text-neon-cyan/80 mb-4 font-mono text-lg">Player Aliases</label>`;
  content += `<p class="text-xs text-neon-cyan/60 font-mono mb-4">Player 1 is you. Enter aliases for other players. Leave blank for an AI opponent.</p>`;
  content += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;

  for (let i = 1; i <= count; i++) {
    content += `
      <div class="form-control">
        <label class="label">
          <span class="label-text text-neon-cyan/80 font-mono">Player ${i}</span>
        </label>
        <input type="text" name="player${i}" class="input w-full" placeholder="Enter alias or leave for AI" ${i === 1 ? 'value="Player 1" disabled' : ''}>
      </div>
    `;
  }

  content += `</div>`;
  aliasesContainer.innerHTML = content;
}

async function handleFormSubmit(container: HTMLElement) {
  const form = container.querySelector('#createTournamentForm') as HTMLFormElement;
  const formData = new FormData(form);
  const name = formData.get('name') as string;
  const playerCount = container.querySelector('.player-count-btn.btn-primary')?.getAttribute('data-count') || '4';

  if (!name.trim()) {
    showNotification('Tournament name cannot be empty.', 'error');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // The backend expects a simplified structure, not a full participant list.
  // The use-case will create the tournament and add the creator as the first participant.
  const tournamentData = {
    name: name.trim(),
    maxPlayers: parseInt(playerCount, 10),
    userId: user.id,
    displayName: user.username || 'Player 1', // Fallback for display name
  };

  try {
    const newTournament = await tournamentApi.createTournament(tournamentData);
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
