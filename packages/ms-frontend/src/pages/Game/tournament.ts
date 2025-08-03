import { tournamentApi, Tournament } from '../../api/tournament';
import { showNotification } from '../../components/notification';
import { startMultiplayerMatch } from './match';

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
  }
}

export function hideTournamentSection(container: HTMLElement): void {
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  if (tournamentSection) {
    tournamentSection.classList.add('hidden');
  }
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
    list.innerHTML = '<p class="text-neon-cyan/80 font-mono">No tournaments available. Why not create one?</p>';
    return;
  }

  tournaments.forEach(tournament => {
    const tournamentCard = document.createElement('div');
    tournamentCard.className = 'card p-4 flex justify-between items-center hover:bg-gray-800/50 transition-colors duration-300';
    tournamentCard.innerHTML = `
      <div>
        <h4 class="text-lg font-bold text-neon-pink font-retro">${tournament.name}</h4>
        <p class="text-sm text-neon-cyan/80 font-mono">Status: ${tournament.status} | Participants: ${tournament.participants.length}</p>
      </div>
      <div>
        <button class="btn btn-sm btn-secondary view-details-btn" data-tournament-id="${tournament.id}">DETAILS</button>
        ${tournament.status === 'WAITING' ? `<button class="btn btn-sm btn-primary ml-2 join-tournament-btn" data-tournament-id="${tournament.id}">JOIN</button>` : ''}
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
    const modalHTML = `
      <div id="tournamentDetailsModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="card p-8 rounded-lg shadow-lg w-full max-w-2xl animate-fade-in-scale">
          <h3 class="text-2xl font-bold text-neon-green mb-4 font-retro">${tournament.name}</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono">Status: ${tournament.status}</p>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h4 class="text-lg font-bold text-neon-pink mb-2 font-retro">PARTICIPANTS</h4>
              <ul class="font-mono text-neon-cyan/80 space-y-1">
                ${tournament.participants.map(p => `<li>${p.displayName}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-bold text-neon-pink mb-2 font-retro">MATCHES</h4>
              <ul class="font-mono text-neon-cyan/80 space-y-2">
                ${tournament.matches.map(m => `
                  <li class="flex justify-between items-center">
                    <span>${m.player1 ? m.player1.displayName : '...'} vs ${m.player2 ? m.player2.displayName : '...'}</span>
                    <span>${m.status}</span>
                    ${m.status === 'WAITING' && m.player2 ? `<button class="btn btn-xs btn-primary play-match-btn" data-match-id="${m.id}" data-tournament-id="${tournament.id}">PLAY</button>` : ''}
                  </li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="flex justify-end mt-8">
            <button type="button" id="closeTournamentDetails" class="btn btn-ghost">CLOSE</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', modalHTML);

    const modal = container.querySelector('#tournamentDetailsModal');
    const closeButton = container.querySelector('#closeTournamentDetails');
    const playMatchButtons = container.querySelectorAll('.play-match-btn');

    const closeModal = () => modal?.remove();

    closeButton?.addEventListener('click', closeModal);
    playMatchButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const matchId = (e.currentTarget as HTMLElement).dataset.matchId;
        const tourneyId = (e.currentTarget as HTMLElement).dataset.tournamentId;
        if (matchId && tourneyId) {
          closeModal();
          startMultiplayerMatch(container, { matchId, tournamentId: tourneyId });
        }
      });
    });

  } catch (error) {
    console.error(`Failed to get tournament details for ${tournamentId}:`, error);
    showNotification('Failed to load tournament details.', 'error');
  }
}
