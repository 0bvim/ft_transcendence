import { showGame, GameConfig, GameType, hideGame } from './game';

// Tournament API types
interface Tournament {
  id: string;
  hostId: string;
  size: number;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'setup' | 'in_progress' | 'completed';
  winnerId?: string;
  winnerName?: string;
  createdAt: string;
}

interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId?: string;
  alias: string;
  isAI: boolean;
  seed: number;
}

export interface BracketMatch {
  round: number;
  matchIndex: number;
  player1: TournamentParticipant | null;
  player2: TournamentParticipant | null;
  winner: TournamentParticipant | null;
  status: 'pending' | 'in_progress' | 'completed';
}

// Tournament API client
class TournamentAPI {
  private baseUrl = 'https://localhost:3003';

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    // Only add Content-Type for requests with body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Tournament API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createTournament(size: number, aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD', playerAliases: string[]): Promise<Tournament> {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify({ size, aiDifficulty, playerAliases }),
    });
  }

  async getTournament(id: string): Promise<Tournament> {
    return this.request(`/tournaments/${id}`);
  }

  async startTournament(id: string): Promise<Tournament> {
    return this.request(`/tournaments/${id}/start`, { 
      method: 'POST',
    });
  }

  async getBracket(tournamentId: string): Promise<{ participants: TournamentParticipant[], matches: BracketMatch[] }> {
    return this.request(`/tournaments/${tournamentId}/bracket`);
  }

  async getNextMatch(tournamentId: string): Promise<BracketMatch | null> {
    return this.request(`/tournaments/${tournamentId}/next-match`);
  }

  async completeMatch(tournamentId: string, matchId: string, winnerId: string): Promise<void> {
    return this.request(`/tournaments/${tournamentId}/matches/${matchId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ winnerId }),
    });
  }

  async simulateAIMatch(tournamentId: string, matchId: string): Promise<void> {
    return this.request(`/tournaments/${tournamentId}/matches/${matchId}/simulate`, { method: 'POST' });
  }
}

const tournamentAPI = new TournamentAPI();

// Current tournament state
let currentTournament: Tournament | null = null;
let currentBracket: { participants: TournamentParticipant[], matches: BracketMatch[] } | null = null;
let currentMatch: BracketMatch | null = null;

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function createTournament(size: number, aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD', humanPlayers: Array<{ alias: string }>): Promise<Tournament> {
  const playerAliases = humanPlayers.map(player => player.alias);
  return tournamentAPI.createTournament(size, aiDifficulty, playerAliases);
}

async function startTournament(tournamentId: string): Promise<Tournament> {
  return tournamentAPI.startTournament(tournamentId);
}

async function getTournament(tournamentId: string): Promise<Tournament> {
  return tournamentAPI.getTournament(tournamentId);
}

async function getBracket(tournamentId: string): Promise<{ participants: TournamentParticipant[], matches: BracketMatch[] }> {
  return tournamentAPI.getBracket(tournamentId);
}

async function getNextMatch(tournamentId: string): Promise<BracketMatch | null> {
  return tournamentAPI.getNextMatch(tournamentId);
}

async function completeMatch(tournamentId: string, matchId: string, winnerId: string): Promise<void> {
  return tournamentAPI.completeMatch(tournamentId, matchId, winnerId);
}

async function simulateAIMatch(tournamentId: string, matchId: string): Promise<void> {
  return tournamentAPI.simulateAIMatch(tournamentId, matchId);
}

async function startMatch(container: HTMLElement, match: BracketMatch): Promise<void> {
  if (!currentTournament || !currentBracket) return;
  
  console.log('Starting match:', match);
  
  currentMatch = match;
  match.status = 'in_progress';
  
  // Get participant details from match object (backend returns player1/player2 objects)
  const player1 = match.player1;
  const player2 = match.player2;
  
  if (!player1 || !player2) {
    console.error('Missing players for match:', { player1, player2 });
    return;
  }

  console.log('Players:', { player1: player1.alias, player2: player2.alias, player1IsAI: player1.isAI, player2IsAI: player2.isAI });

  // Create game config for tournament match
  const gameConfig: GameConfig = {
    type: GameType.Tournament,
    difficulty: currentTournament.aiDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
    tournamentId: currentTournament.id,
    matchId: `${match.round}-${match.matchIndex}`,
    player1Name: player1.alias,
    player2Name: player2.alias,
    targetScore: 5
  };

  console.log('Game config:', gameConfig);

  // Hide tournament section and show game UI BEFORE calling showGame
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  const gameUI = container.querySelector('#gameUI') as HTMLElement;
  
  if (tournamentSection) tournamentSection.classList.add('hidden');
  if (gameUI) gameUI.classList.remove('hidden');

  // Ensure game elements are visible by removing hidden class from gameStatus
  const gameStatus = container.querySelector('#gameStatus') as HTMLElement;
  if (gameStatus) gameStatus.classList.remove('hidden');

  console.log('UI elements should now be visible, calling showGame...');

  // Use existing game engine
  await showGame(container, gameConfig);
  
  console.log('Game should now be visible');
}

export function showTournamentSetup(container: HTMLElement): void {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;

  if (gameModeSelection) gameModeSelection.classList.add('hidden');
  if (gameSection) gameSection.classList.remove('hidden');

  gameSection.innerHTML = `
    <div class="max-w-4xl mx-auto" id="tournamentSection">
      <h2 class="text-3xl font-bold text-neon-green font-retro tracking-wider mb-8 text-center">TOURNAMENT SETUP</h2>
      
      <div id="tournamentSetupSteps" class="space-y-8">
        <!-- Step 1: Tournament Size -->
        <div id="step1" class="card p-6">
          <h3 class="text-xl font-bold text-neon-cyan mb-4 font-retro">STEP 1: TOURNAMENT SIZE</h3>
          <div class="flex justify-center space-x-4">
            <button id="size4" class="btn btn-primary px-8 py-4 text-lg">4 PLAYERS</button>
            <button id="size8" class="btn btn-primary px-8 py-4 text-lg">8 PLAYERS</button>
          </div>
        </div>

        <!-- Step 2: AI Difficulty (hidden initially) -->
        <div id="step2" class="card p-6 hidden">
          <h3 class="text-xl font-bold text-neon-cyan mb-4 font-retro">STEP 2: AI DIFFICULTY</h3>
          <div class="flex justify-center space-x-4">
            <button id="diffEasy" class="btn btn-success px-8 py-4 text-lg">EASY</button>
            <button id="diffMedium" class="btn btn-warning px-8 py-4 text-lg">MEDIUM</button>
            <button id="diffHard" class="btn btn-error px-8 py-4 text-lg">HARD</button>
          </div>
        </div>

        <!-- Step 3: Player Registration (hidden initially) -->
        <div id="step3" class="card p-6 hidden">
          <h3 class="text-xl font-bold text-neon-cyan mb-4 font-retro">STEP 3: PLAYER REGISTRATION</h3>
          <div id="playerInputs" class="space-y-4">
            <!-- Dynamic player inputs will be added here -->
          </div>
          <div class="flex justify-center mt-6">
            <button id="startTournament" class="btn btn-success px-8 py-4 text-lg">START TOURNAMENT</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Game elements required by showGame function - HIDDEN BY DEFAULT -->
    <div class="game-ui max-w-4xl mx-auto text-center hidden" id="gameUI">
      <h1 id="gameTitle" class="text-4xl font-bold text-neon-green font-retro tracking-wider mb-8">TOURNAMENT MATCH</h1>
      
      <div class="flex justify-between items-center mb-8">
        <div class="text-center">
          <div id="player1Name" class="text-xl font-bold text-neon-cyan mb-2">PLAYER 1</div>
          <div id="player1Score" class="text-6xl font-bold text-white">0</div>
        </div>
        
        <div class="text-center">
          <div id="player2Name" class="text-xl font-bold text-neon-pink mb-2">PLAYER 2</div>
          <div id="player2Score" class="text-6xl font-bold text-white">0</div>
        </div>
      </div>
      
      <div id="gameStatus" class="text-2xl font-bold text-neon-yellow mb-8 hidden">GAME STATUS</div>
      
      <div id="canvasContainer" class="flex justify-center mb-8">
        <!-- Game canvas will be inserted here -->
      </div>
    </div>
  `;
  setupTournamentEventListeners(container);
}

function setupTournamentEventListeners(container: HTMLElement): void {
  let selectedSize = 0;
  let selectedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';

  // Step 1: Tournament Size Selection
  const size4Button = container.querySelector('#size4');
  const size8Button = container.querySelector('#size8');
  const step2 = container.querySelector('#step2') as HTMLElement;

  size4Button?.addEventListener('click', () => {
    selectedSize = 4;
    updateSizeButtons(container, 4);
    step2.classList.remove('hidden');
  });

  size8Button?.addEventListener('click', () => {
    selectedSize = 8;
    updateSizeButtons(container, 8);
    step2.classList.remove('hidden');
  });

  // Step 2: AI Difficulty Selection
  const diffEasyButton = container.querySelector('#diffEasy');
  const diffMediumButton = container.querySelector('#diffMedium');
  const diffHardButton = container.querySelector('#diffHard');
  const step3 = container.querySelector('#step3') as HTMLElement;

  diffEasyButton?.addEventListener('click', () => {
    selectedDifficulty = 'EASY';
    updateDifficultyButtons(container, 'EASY');
    showPlayerInputs(container, selectedSize, 'EASY');
    step3.classList.remove('hidden');
  });

  diffMediumButton?.addEventListener('click', () => {
    selectedDifficulty = 'MEDIUM';
    updateDifficultyButtons(container, 'MEDIUM');
    showPlayerInputs(container, selectedSize, 'MEDIUM');
    step3.classList.remove('hidden');
  });

  diffHardButton?.addEventListener('click', () => {
    selectedDifficulty = 'HARD';
    updateDifficultyButtons(container, 'HARD');
    showPlayerInputs(container, selectedSize, 'HARD');
    step3.classList.remove('hidden');
  });

  // Step 3: Start Tournament
  const startButton = container.querySelector('#startTournament');
  startButton?.addEventListener('click', async () => {
    // Collect human players
    const humanPlayers: Array<{ alias: string }> = [
      { alias: 'You (Host)' } // Host is always first
    ];
    
    // Add additional human players
    for (let i = 2; i <= selectedSize; i++) {
      const aliasInput = container.querySelector(`#player${i}Alias`) as HTMLInputElement;
      const alias = aliasInput?.value.trim();
      if (alias) {
        humanPlayers.push({ alias });
      }
    }

    // Create tournament
    currentTournament = await createTournament(selectedSize, selectedDifficulty, humanPlayers);
    currentTournament = await startTournament(currentTournament.id);
    currentBracket = await getBracket(currentTournament.id);

    // Show tournament bracket
    showTournamentBracket(container, currentTournament, currentBracket);
  });
}

function updateSizeButtons(container: HTMLElement, selectedSize: number): void {
  const size4Button = container.querySelector('#size4');
  const size8Button = container.querySelector('#size8');

  size4Button?.classList.toggle('btn-active', selectedSize === 4);
  size8Button?.classList.toggle('btn-active', selectedSize === 8);
}

function updateDifficultyButtons(container: HTMLElement, selectedDifficulty: string): void {
  const buttons = ['diffEasy', 'diffMedium', 'diffHard'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  buttons.forEach((buttonId, index) => {
    const button = container.querySelector(`#${buttonId}`);
    button?.classList.toggle('btn-active', selectedDifficulty === difficulties[index]);
  });
}

function showPlayerInputs(container: HTMLElement, tournamentSize: number, difficulty: string): void {
  const playerInputsContainer = container.querySelector('#playerInputs') as HTMLElement;
  
  let html = `
    <div class="mb-4">
      <label class="block text-neon-cyan font-retro mb-2">HOST (YOU):</label>
      <input type="text" class="input input-bordered w-full" value="You (Host)" disabled>
    </div>
  `;

  // Add inputs for additional human players (max tournament size - 1)
  for (let i = 2; i <= tournamentSize; i++) {
    html += `
      <div class="mb-4">
        <label class="block text-neon-cyan font-retro mb-2">PLAYER ${i} (OPTIONAL):</label>
        <input type="text" id="player${i}Alias" class="input input-bordered w-full" placeholder="Enter alias or leave empty for AI">
      </div>
    `;
  }

  html += `
    <div class="text-sm text-neon-cyan/70 mt-4 font-mono">
      • Empty slots will be filled with AI players
      • AI difficulty: ${difficulty}
      • Controls: Player 1 (W/S), Player 2 (Arrow Up/Down)
    </div>
  `;

  playerInputsContainer.innerHTML = html;
}

function showTournamentBracket(container: HTMLElement, tournament: Tournament, bracket: { participants: TournamentParticipant[], matches: BracketMatch[] }): void {
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  const gameUI = container.querySelector('#gameUI') as HTMLElement;
  
  // Hide game UI and show tournament section
  if (gameUI) gameUI.classList.add('hidden');
  if (tournamentSection) tournamentSection.classList.remove('hidden');
  
  tournamentSection.innerHTML = `
    <h2 class="text-3xl font-bold text-neon-green font-retro tracking-wider mb-8 text-center">TOURNAMENT BRACKET</h2>
    
    <div class="card p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-neon-cyan font-retro">Tournament Status: ${tournament.status.toUpperCase()}</h3>
        <div class="flex space-x-4">
          <button id="nextMatch" class="btn btn-primary px-6 py-2">NEXT MATCH</button>
          <button id="backToMenu" class="btn btn-secondary px-6 py-2">BACK TO MENU</button>
        </div>
      </div>
      <div id="matchStatus" class="text-lg text-neon-yellow text-center">Click NEXT MATCH to continue</div>
    </div>

    <div class="card p-6">
      <h3 class="text-xl font-bold text-neon-cyan mb-6 font-retro text-center">BRACKET</h3>
      <div id="bracketDisplay" class="space-y-4">
        <!-- Bracket will be rendered here -->
      </div>
    </div>
  `;
  renderBracket(container, bracket);
  setupBracketEventListeners(container, tournament);
}

function renderBracket(container: HTMLElement, bracket: { participants: TournamentParticipant[], matches: BracketMatch[] }): void {
  const bracketDisplay = container.querySelector('#bracketDisplay') as HTMLElement;
  
  let html = '<div class="space-y-8">';
  
  bracket.matches.forEach((match, matchIndex) => {
    html += `
      <div class="match card p-4 text-center ${match.status === 'in_progress' ? 'border-neon-pink' : ''}">
        <div class="text-sm text-neon-cyan/70 mb-2">Match ${matchIndex + 1}</div>
        <div class="space-y-2">
          <div class="player ${match.winner?.id === match.player1?.id ? 'text-neon-green font-bold' : 'text-white'}">
            ${match.player1?.alias || 'TBD'}
          </div>
          <div class="text-neon-pink">VS</div>
          <div class="player ${match.winner?.id === match.player2?.id ? 'text-neon-green font-bold' : 'text-white'}">
            ${match.player2?.alias || 'TBD'}
          </div>
        </div>
        ${match.status === 'completed' ? `
          <div class="mt-2 text-xs text-neon-green">
            Winner: ${match.winner?.alias}
          </div>
        ` : match.status === 'in_progress' ? `
          <div class="mt-2 text-xs text-neon-pink animate-pulse">
            IN PROGRESS
          </div>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  bracketDisplay.innerHTML = html;
}

function setupBracketEventListeners(container: HTMLElement, tournament: Tournament): void {
  const nextMatchButton = container.querySelector('#nextMatch');
  const backToMenuButton = container.querySelector('#backToMenu');
  const matchStatus = container.querySelector('#matchStatus') as HTMLElement;

  nextMatchButton?.addEventListener('click', async () => {
    const nextMatch = await getNextMatch(tournament.id);
    if (nextMatch) {
      // Handle AI vs AI matches instantly
      if (nextMatch.player1 && nextMatch.player2 && nextMatch.player1.isAI === true && nextMatch.player2.isAI === true) {
        await simulateAIMatch(tournament.id, nextMatch.matchIndex.toString());
        currentBracket = await getBracket(tournament.id);
        showTournamentBracket(container, tournament, currentBracket);
        return;
      }

      // Start human match - show instructions
      matchStatus.textContent = 'Press SPACE to start the match';
      
      // Listen for spacebar to start match
      const handleSpacePress = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
          event.preventDefault();
          document.removeEventListener('keydown', handleSpacePress);
          startMatch(container, nextMatch);
        }
      };
      
      document.addEventListener('keydown', handleSpacePress);
    } else {
      matchStatus.textContent = 'Tournament completed!';
    }
  });

  backToMenuButton?.addEventListener('click', () => {
    cleanupTournament();
    const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
    const gameSection = container.querySelector('#gameSection') as HTMLElement;
    
    if (gameSection) gameSection.classList.add('hidden');
    if (gameModeSelection) gameModeSelection.classList.remove('hidden');
  });

  // Show status
  if (tournament.status === 'in_progress') {
    const nextMatch = getNextMatch(tournament.id);
    if (nextMatch) {
      if (nextMatch.player1 && nextMatch.player2 && nextMatch.player1.isAI === true && nextMatch.player2.isAI === true) {
        matchStatus.textContent = 'Click NEXT MATCH to simulate AI vs AI';
      } else {
        matchStatus.textContent = 'Click NEXT MATCH to continue';
      }
    }
  }
}

// Function to return to bracket view after match completion
function returnToBracket(container: HTMLElement): void {
  const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
  const gameUI = container.querySelector('#gameUI') as HTMLElement;
  
  // Hide game UI and show tournament section
  if (gameUI) gameUI.classList.add('hidden');
  if (tournamentSection) tournamentSection.classList.remove('hidden');
  
  // Refresh the bracket display
  if (currentTournament && currentBracket) {
    showTournamentBracket(container, currentTournament, currentBracket);
  }
}

export function cleanupTournament(): void {
  // Remove event listeners
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);

  // Cancel animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Clear game state
  currentTournament = null;
  currentBracket = null;
  currentMatch = null;
}

export { getTournament, getBracket, completeMatch, showTournamentBracket };
