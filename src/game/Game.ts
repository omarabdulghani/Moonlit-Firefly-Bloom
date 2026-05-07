import type { InputManager } from '../input/InputManager';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import type { GameState, RenderSnapshot } from './types';
import { Firefly } from './Firefly';
import { MoonlightOrb } from './MoonlightOrb';
import { ShadowHazard } from './ShadowHazard';

export class Game {
  private static readonly bestScoreStorageKey = 'moonlitFireflyBloom.bestScore';

  private state: GameState = 'start';
  private elapsedTime = 0;
  private lastFrameTime = 0;
  private score = 0;
  private bestScore = this.loadBestScore();
  private orbsCollected = 0;
  private glow = 100;
  private collectPulseTimer = 0;
  private isTouchingShadow = false;
  // Glow is the player's health-like resource.
  private readonly maxGlow = 100;
  private readonly startingGlow = 100;
  // Gentle idle pressure so collecting light matters even before touching shadows.
  private readonly passiveGlowDrainPerSecond = 3;
  // Moonlight orbs restore this much glow when collected.
  private readonly orbGlowRestore = 12;
  // Short positive feedback window after collecting a moonlight orb.
  private readonly collectPulseDuration = 0.28;
  // Keep the first hazard pass small and readable.
  private readonly shadowCount = 4;
  private readonly firefly = new Firefly();
  private readonly moonlightOrbs: MoonlightOrb[] = [];
  private readonly moonlightOrbCount = 6;
  private readonly shadowHazards: ShadowHazard[] = [];

  constructor(
    private readonly renderer: CanvasRenderer,
    private readonly input: InputManager,
  ) {}

  start(): void {
    requestAnimationFrame(this.tick);
  }

  private tick = (timestamp: number): void => {
    const deltaTime = this.lastFrameTime === 0 ? 0 : (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.tick);
  };

  private update(deltaTime: number): void {
    const safeDeltaTime = Math.min(deltaTime, 0.05);

    if (this.input.consumePrimaryPress()) {
      this.handlePrimaryPress();
    }

    if (this.state === 'playing') {
      this.elapsedTime += safeDeltaTime;
      this.collectPulseTimer = Math.max(0, this.collectPulseTimer - safeDeltaTime);
      this.firefly.update(safeDeltaTime, this.input.getMovementInput(), this.renderer.getSize());
      this.updateMoonlightOrbs(safeDeltaTime);
      this.updateShadowHazards(safeDeltaTime);
      this.collectTouchedOrbs();
      this.applyPassiveGlowDrain(safeDeltaTime);
      this.isTouchingShadow = this.applyShadowDamage(safeDeltaTime);

      if (this.input.consumeGameOverPress()) {
        this.enterGameOver();
      }

      if (this.glow <= 0) {
        this.enterGameOver();
      }
    }
  }

  private render(): void {
    const snapshot: RenderSnapshot = {
      state: this.state,
      elapsedTime: this.elapsedTime,
      score: this.score,
      bestScore: this.bestScore,
      orbsCollected: this.orbsCollected,
      glow: this.glow,
      maxGlow: this.maxGlow,
      collectPulse: this.collectPulseTimer / this.collectPulseDuration,
      isTouchingShadow: this.isTouchingShadow,
      firefly: this.state === 'start' ? null : this.firefly.getSnapshot(),
      moonlightOrbs:
        this.state === 'start' ? [] : this.moonlightOrbs.map((orb) => orb.getSnapshot()),
      shadowHazards:
        this.state === 'start' ? [] : this.shadowHazards.map((hazard) => hazard.getSnapshot()),
    };

    this.renderer.render(snapshot);
  }

  private handlePrimaryPress(): void {
    if (this.state === 'start' || this.state === 'gameOver') {
      this.enterPlaying();
    }
  }

  private enterPlaying(): void {
    this.elapsedTime = 0;
    this.score = 0;
    this.orbsCollected = 0;
    this.glow = this.startingGlow;
    this.collectPulseTimer = 0;
    this.isTouchingShadow = false;
    this.firefly.reset(this.renderer.getSize());
    this.resetMoonlightOrbs();
    this.resetShadowHazards();
    this.input.clearPointer();
    this.state = 'playing';
  }

  private enterGameOver(): void {
    if (this.state === 'gameOver') {
      return;
    }

    this.updateBestScore();
    this.state = 'gameOver';
  }

  private resetMoonlightOrbs(): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    this.moonlightOrbs.length = 0;

    for (let index = 0; index < this.moonlightOrbCount; index += 1) {
      this.moonlightOrbs.push(new MoonlightOrb(bounds, fireflyPosition));
    }
  }

  private updateMoonlightOrbs(deltaTime: number): void {
    for (const orb of this.moonlightOrbs) {
      orb.update(deltaTime);
    }
  }

  private resetShadowHazards(): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    this.shadowHazards.length = 0;

    for (let index = 0; index < this.shadowCount; index += 1) {
      const avoidPoints = [
        fireflyPosition,
        ...this.moonlightOrbs.map((orb) => ({ x: orb.x, y: orb.y })),
        ...this.shadowHazards.map((hazard) => ({ x: hazard.x, y: hazard.y })),
      ];

      this.shadowHazards.push(new ShadowHazard(bounds, avoidPoints));
    }
  }

  private updateShadowHazards(deltaTime: number): void {
    const bounds = this.renderer.getSize();

    for (const hazard of this.shadowHazards) {
      hazard.update(deltaTime, bounds);
    }
  }

  private collectTouchedOrbs(): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    for (const orb of this.moonlightOrbs) {
      const distance = Math.hypot(this.firefly.x - orb.x, this.firefly.y - orb.y);

      if (distance <= this.firefly.radius + orb.radius) {
        this.score += orb.value;
        this.orbsCollected += 1;
        this.glow = Math.min(this.maxGlow, this.glow + this.orbGlowRestore);
        this.collectPulseTimer = this.collectPulseDuration;
        orb.respawn(bounds, fireflyPosition);
      }
    }
  }

  private applyPassiveGlowDrain(deltaTime: number): void {
    this.glow = Math.max(0, this.glow - this.passiveGlowDrainPerSecond * deltaTime);
  }

  private applyShadowDamage(deltaTime: number): boolean {
    let touchingShadow = false;

    for (const hazard of this.shadowHazards) {
      const distance = Math.hypot(this.firefly.x - hazard.x, this.firefly.y - hazard.y);

      if (distance <= this.firefly.radius + hazard.radius) {
        touchingShadow = true;
        this.glow = Math.max(0, this.glow - hazard.damagePerSecond * deltaTime);
      }
    }

    return touchingShadow;
  }

  private updateBestScore(): void {
    if (this.score <= this.bestScore) {
      return;
    }

    this.bestScore = this.score;

    try {
      window.localStorage.setItem(Game.bestScoreStorageKey, String(this.bestScore));
    } catch {
      // Best score is nice-to-have. Gameplay should continue if storage is unavailable.
    }
  }

  private loadBestScore(): number {
    try {
      const storedScore = window.localStorage.getItem(Game.bestScoreStorageKey);

      if (!storedScore) {
        return 0;
      }

      const parsedScore = Number.parseInt(storedScore, 10);
      return Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : 0;
    } catch {
      return 0;
    }
  }
}
