import './styles.css';
import { AudioManager } from './audio/AudioManager';
import { Game } from './game/Game';
import { InputManager } from './input/InputManager';
import { CanvasRenderer } from './render/CanvasRenderer';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Game canvas was not found.');
}

const input = new InputManager(canvas);
const renderer = new CanvasRenderer(canvas);
const audio = new AudioManager();
const cursorRevealDurationMs = 1200;
let isPlaying = false;
let cursorRevealTimer: number | undefined;

const hideGameplayCursor = () => {
  window.clearTimeout(cursorRevealTimer);
  cursorRevealTimer = undefined;
  document.body.classList.remove('game-cursor-visible');
};

const revealGameplayCursor = () => {
  if (!isPlaying) {
    return;
  }

  document.body.classList.add('game-cursor-visible');
  window.clearTimeout(cursorRevealTimer);
  cursorRevealTimer = window.setTimeout(hideGameplayCursor, cursorRevealDurationMs);
};

const game = new Game(renderer, input, audio, (state) => {
  isPlaying = state === 'playing';
  input.setGameState(state);
  document.body.classList.toggle('game-is-playing', isPlaying);
  hideGameplayCursor();
});

const primePointerAudio = (event: Event) => {
  game.primeAudioFromUserGesture(event.type);
};

const unlockAudio = (source: string) => {
  audio.unlockFromUserGesture(source);
};

const pauseGame = () => {
  game.pause();
};

window.addEventListener('pointerdown', primePointerAudio, { passive: true, capture: true });
window.addEventListener('touchstart', primePointerAudio, { passive: true, capture: true });
window.addEventListener('click', primePointerAudio, { passive: true, capture: true });
window.addEventListener('keydown', (event) => {
  unlockAudio(event.type);

  if (event.key === 'Escape') {
    event.preventDefault();
    pauseGame();
  }
});
window.addEventListener('blur', pauseGame);
window.addEventListener('pagehide', pauseGame);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    pauseGame();
  }
});
canvas.addEventListener('pointermove', revealGameplayCursor, { passive: true });
canvas.addEventListener('pointerdown', revealGameplayCursor, { passive: true });

const getViewportSize = () => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
});

const resize = () => {
  const viewport = getViewportSize();
  renderer.resize(viewport.width, viewport.height, window.devicePixelRatio || 1);
  audio.setMobileMix(viewport.width <= 600 || Math.min(viewport.width, viewport.height) <= 500);
};

window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
window.visualViewport?.addEventListener('scroll', resize);
resize();
game.start();
