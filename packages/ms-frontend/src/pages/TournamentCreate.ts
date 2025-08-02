import { tournamentApi, type CreateTournamentRequest } from '../api/tournament.ts';

export default function TournamentCreate(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button id="backButton" class="btn btn-ghost text-gray-400 hover:text-white">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Tournaments
          </button>
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
            Create Tournament
          </h1>
        </div>
      </div>

      <!-- Tournament Creation Form -->
      <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <form id="tournament-form">
          <!-- Tournament Name -->
          <div class="mb-6">
            <label for="tournament-name" class="block text-sm font-medium text-gray-300 mb-2">
              Tournament Name
            </label>
            <input
              type="text"
              id="tournament-name"
              name="tournamentName"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tournament name"
            />
          </div>

          <!-- Tournament Description -->
          <div class="mb-6">
            <label for="tournament-description" class="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="tournament-description"
              name="tournamentDescription"
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your tournament..."
            ></textarea>
          </div>

          <!-- Max Players -->
          <div class="mb-6">
            <label for="max-players" class="block text-sm font-medium text-gray-300 mb-2">
              Maximum Players
            </label>
            <select
              id="max-players"
              name="maxPlayers"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="4">4 Players</option>
              <option value="6">6 Players</option>
              <option value="8">8 Players</option>
            </select>
          </div>

          <!-- Tournament Type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Tournament Type
            </label>
            <div class="bg-gray-700 border border-blue-500 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-white">Mixed Tournament</h3>
                  <p class="text-sm text-gray-400">AI auto-fills remaining slots. Humans can join and replace AI players.</p>
                </div>
                <div class="w-4 h-4 bg-blue-500 border-2 border-blue-500 rounded-full"></div>
              </div>
              <input type="hidden" name="tournamentType" value="mixed" />
            </div>
          </div>

          <!-- AI Difficulty (shown only for mixed tournaments) -->
          <div id="ai-difficulty-section" class="mb-6">
            <label for="ai-difficulty" class="block text-sm font-medium text-gray-300 mb-2">
              AI Difficulty
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="relative">
                <input
                  type="radio"
                  id="ai-easy"
                  name="aiDifficulty"
                  value="easy"
                  class="sr-only"
                />
                <label
                  for="ai-easy"
                  class="block bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-green-500 transition-colors duration-200 text-center"
                >
                  <div class="text-green-400 font-semibold">Easy</div>
                  <div class="text-xs text-gray-400">Beginner friendly</div>
                </label>
              </div>
              <div class="relative">
                <input
                  type="radio"
                  id="ai-medium"
                  name="aiDifficulty"
                  value="medium"
                  checked
                  class="sr-only"
                />
                <label
                  for="ai-medium"
                  class="block bg-gray-700 border border-yellow-500 rounded-lg p-3 cursor-pointer hover:border-yellow-500 transition-colors duration-200 text-center"
                >
                  <div class="text-yellow-400 font-semibold">Medium</div>
                  <div class="text-xs text-gray-400">Balanced challenge</div>
                </label>
              </div>
              <div class="relative">
                <input
                  type="radio"
                  id="ai-hard"
                  name="aiDifficulty"
                  value="hard"
                  class="sr-only"
                />
                <label
                  for="ai-hard"
                  class="block bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-red-500 transition-colors duration-200 text-center"
                >
                  <div class="text-red-400 font-semibold">Hard</div>
                  <div class="text-xs text-gray-400">Expert level</div>
                </label>
              </div>
            </div>
          </div>

          <!-- Auto-start Tournament -->
          <div class="mb-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                id="auto-start"
                name="autoStart"
                checked
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span class="text-sm font-medium text-gray-300">
                Auto-start when minimum players (4) join
              </span>
            </label>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              id="cancel-btn"
              class="order-2 sm:order-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="create-tournament-submit"
              class="order-1 sm:order-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>

      <!-- Tournament Preview -->
      <div class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-purple-400">Tournament Preview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Format:</span>
            <span class="ml-2 text-white">Single-elimination</span>
          </div>
          <div>
            <span class="text-gray-400">Bracket Size:</span>
            <span class="ml-2 text-white" id="bracket-size">4 players</span>
          </div>
          <div>
            <span class="text-gray-400">Total Matches:</span>
            <span class="ml-2 text-white" id="total-matches">3 matches</span>
          </div>
          <div>
            <span class="text-gray-400">Estimated Duration:</span>
            <span class="ml-2 text-white" id="estimated-duration">15-30 minutes</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners(container);

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const form = container.querySelector('#tournament-form') as HTMLFormElement;
  const backBtn = container.querySelector('#backButton');
  const cancelBtn = container.querySelector('#cancel-btn');
  const maxPlayersSelect = container.querySelector('#max-players') as HTMLSelectElement;
  const tournamentTypeInputs = container.querySelectorAll('input[name="tournamentType"]');
  const aiDifficultySection = container.querySelector('#ai-difficulty-section');

  // Back button
  backBtn?.addEventListener('click', () => {
    window.location.href = '/tournament';
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => {
    window.location.href = '/tournament';
  });

  // Form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form);
  });

  // Update preview when max players changes
  maxPlayersSelect?.addEventListener('change', updateTournamentPreview);

  // Show/hide AI difficulty based on tournament type
  tournamentTypeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (aiDifficultySection) {
        (aiDifficultySection as HTMLElement).style.display = target.value === 'mixed' ? 'block' : 'none';
      }
    });
  });

  // Update radio button styles
  setupRadioButtonStyles(container);

  // Initial preview update
  updateTournamentPreview();
}

function setupRadioButtonStyles(container: HTMLElement) {
  const radioGroups = ['tournamentType', 'aiDifficulty'];
  
  radioGroups.forEach(groupName => {
    const radioInputs = container.querySelectorAll(`input[name="${groupName}"]`);
    radioInputs.forEach(input => {
      input.addEventListener('change', () => {
        // Update all radio buttons in this group
        radioInputs.forEach(radio => {
          const label = container.querySelector(`label[for="${radio.id}"]`);
          const indicator = label?.querySelector('.w-4.h-4');
          
          if (radio === input && (radio as HTMLInputElement).checked) {
            // Selected state
            if (groupName === 'tournamentType') {
              // Tournament type has indicators
              label?.classList.add('border-blue-500');
              if (indicator) {
                indicator.classList.add('bg-blue-500', 'border-blue-500');
                indicator.classList.remove('border-gray-400');
              }
            } else if (groupName === 'aiDifficulty') {
              // AI difficulty uses border colors
              label?.classList.remove('border-gray-600');
              if (radio.id === 'ai-easy') {
                label?.classList.add('border-green-500', 'bg-green-500/10');
              } else if (radio.id === 'ai-medium') {
                label?.classList.add('border-yellow-500', 'bg-yellow-500/10');
              } else if (radio.id === 'ai-hard') {
                label?.classList.add('border-red-500', 'bg-red-500/10');
              }
            }
          } else {
            // Unselected state
            if (groupName === 'tournamentType') {
              // Tournament type has indicators
              label?.classList.remove('border-blue-500');
              if (indicator) {
                indicator.classList.remove('bg-blue-500', 'border-blue-500');
                indicator.classList.add('border-gray-400');
              }
            } else if (groupName === 'aiDifficulty') {
              // AI difficulty reset to default
              label?.classList.remove('border-green-500', 'bg-green-500/10', 'border-yellow-500', 'bg-yellow-500/10', 'border-red-500', 'bg-red-500/10');
              label?.classList.add('border-gray-600');
            }
          }
        });
      });
    });
  });
  
  // Initialize the default states on page load
  radioGroups.forEach(groupName => {
    const checkedInput = container.querySelector(`input[name="${groupName}"]:checked`) as HTMLInputElement;
    if (checkedInput) {
      checkedInput.dispatchEvent(new Event('change'));
    }
  });
}

function updateTournamentPreview() {
  const maxPlayersSelect = document.querySelector('#max-players') as HTMLSelectElement;
  const bracketSize = document.querySelector('#bracket-size');
  const totalMatches = document.querySelector('#total-matches');
  const estimatedDuration = document.querySelector('#estimated-duration');

  if (!maxPlayersSelect || !bracketSize || !totalMatches || !estimatedDuration) return;

  const players = parseInt(maxPlayersSelect.value);
  const matches = players - 1; // Single elimination: n-1 matches
  const duration = `${matches * 5}-${matches * 10} minutes`;

  bracketSize.textContent = `${players} players`;
  totalMatches.textContent = `${matches} matches`;
  estimatedDuration.textContent = duration;
}

async function handleFormSubmit(form: HTMLFormElement) {
  const formData = new FormData(form);
  const tournamentTypeValue = formData.get('tournamentType') as string;
  const aiDifficultyValue = formData.get('aiDifficulty') as string;
  
  const tournamentData: CreateTournamentRequest = {
    name: formData.get('tournamentName') as string,
    description: formData.get('tournamentDescription') as string || '',
    maxPlayers: parseInt(formData.get('maxPlayers') as string),
    tournamentType: 'MIXED', // Always MIXED since humans-only option was removed
    autoStart: formData.has('autoStart'),
    aiDifficulty: aiDifficultyValue ? aiDifficultyValue.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' : 'MEDIUM'
  };

  try {
    // Submit to tournament API
    const response = await tournamentApi.createTournament(tournamentData);
    
    // Show success message and redirect
    showSuccessMessage('Tournament created successfully!');
    
    setTimeout(() => {
      window.history.pushState({}, '', `/tournament/${response.id}`);
      window.dispatchEvent(new Event('popstate'));
    }, 2000);
    
  } catch (error) {
    showErrorMessage('Failed to create tournament. Please try again.');
  }
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

function showErrorMessage(message: string) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

function getCurrentUser(): string {
  // TODO: Get current user from authentication system
  return 'current_user';
}
