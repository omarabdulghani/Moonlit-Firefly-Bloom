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
const game = new Game(renderer, input, audio);

const unlockAudio = () => {
  void audio.unlock();
};

window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('touchstart', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio);

const getViewportSize = () => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
});

const resize = () => {
  const viewport = getViewportSize();
  renderer.resize(viewport.width, viewport.height, window.devicePixelRatio || 1);
};

window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
window.visualViewport?.addEventListener('scroll', resize);
resize();
game.start();
