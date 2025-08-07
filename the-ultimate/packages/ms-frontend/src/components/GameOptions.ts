export function renderGameOptions(): string {
  return `
    <div id="gameModeSelection" class="flex justify-center mb-8 animate-slide-up">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">PLAY VS AI</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Challenge our AI opponent.<br>&nbsp;</p>
          <button id="playAiButton" class="btn btn-primary w-full">START_AI_GAME</button>
        </div>
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">LOCAL DUEL</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Play with a friend on the same screen.</p>
          <button id="localGameButton" class="btn btn-primary w-full">START_LOCAL_GAME</button>
        </div>
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">TOURNAMENTS</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Compete and climb the leaderboard.</p>
          <button id="tournamentButton" class="btn btn-primary w-full">VIEW_TOURNAMENTS</button>
        </div>
      </div>
    </div>
  `;
}

export function setupGameOptionsEventListeners(container: HTMLElement): void {
  const playAiButton = container.querySelector('#playAiButton');
  const localGameButton = container.querySelector('#localGameButton');
  const tournamentButton = container.querySelector('#tournamentButton');



  playAiButton?.addEventListener('click', () => {
    window.location.href = `/game?mode=ai`;
  });

  localGameButton?.addEventListener('click', () => {
    window.location.href = '/game?mode=local';
  });

  tournamentButton?.addEventListener('click', () => {
    window.location.href = '/game?view=tournaments';
  });
}
