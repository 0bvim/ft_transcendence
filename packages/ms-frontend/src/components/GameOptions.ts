export function renderGameOptions(): string {
  return `
    <div id="gameModeSelection" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
      <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
        <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">PLAY VS AI</h3>
        <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Challenge our AI opponent.</p>
        <button id="playAiButton" class="btn btn-primary w-full">START_AI_GAME</button>
        <div id="difficulty-selection" class="flex justify-center space-x-2 my-2">
          <button id="difficulty-easy" class="btn btn-sm btn-success">Easy</button>
          <button id="difficulty-medium" class="btn btn-sm btn-warning">Medium</button>
          <button id="difficulty-hard" class="btn btn-sm btn-error">Hard</button>
        </div>
      </div>
      <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
        <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">LOCAL DUEL</h3>
        <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Play with a friend on the same screen.</p>
        <button id="localGameButton" class="btn btn-primary w-full">START_LOCAL_GAME</button>
      </div>
      <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
        <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">MULTIPLAYER</h3>
        <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Play against other players online.</p>
        <button id="multiplayerButton" class="btn btn-primary w-full">FIND_MATCH</button>
      </div>
      <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
        <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">TOURNAMENTS</h3>
        <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Compete and climb the leaderboard.</p>
        <button id="tournamentButton" class="btn btn-primary w-full">VIEW_TOURNAMENTS</button>
      </div>
    </div>
  `;
}

export function setupGameOptionsEventListeners(container: HTMLElement): void {
  const playAiButton = container.querySelector('#playAiButton');
  const localGameButton = container.querySelector('#localGameButton');
  const multiplayerButton = container.querySelector('#multiplayerButton');
  const tournamentButton = container.querySelector('#tournamentButton');
  const difficultyEasy = container.querySelector('#difficulty-easy');
  const difficultyMedium = container.querySelector('#difficulty-medium');
  const difficultyHard = container.querySelector('#difficulty-hard');

  let selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

  const updateButtonStyles = () => {
    difficultyEasy?.classList.toggle('btn-success', selectedDifficulty === 'easy');
    difficultyEasy?.classList.toggle('opacity-50', selectedDifficulty !== 'easy');
    difficultyMedium?.classList.toggle('btn-warning', selectedDifficulty === 'medium');
    difficultyMedium?.classList.toggle('opacity-50', selectedDifficulty !== 'medium');
    difficultyHard?.classList.toggle('btn-error', selectedDifficulty === 'hard');
    difficultyHard?.classList.toggle('opacity-50', selectedDifficulty !== 'hard');
  };

  difficultyEasy?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedDifficulty = 'easy';
    updateButtonStyles();
  });

  difficultyMedium?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedDifficulty = 'medium';
    updateButtonStyles();
  });

  difficultyHard?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedDifficulty = 'hard';
    updateButtonStyles();
  });

  playAiButton?.addEventListener('click', () => {
    window.location.href = `/game?mode=ai&difficulty=${selectedDifficulty}`;
  });

  localGameButton?.addEventListener('click', () => {
    window.location.href = '/game?mode=local';
  });

  multiplayerButton?.addEventListener('click', () => {
    window.location.href = '/game?mode=multiplayer';
  });

  tournamentButton?.addEventListener('click', () => {
    window.location.href = '/game?view=tournaments';
  });

  // Set initial styles
  updateButtonStyles();
}
