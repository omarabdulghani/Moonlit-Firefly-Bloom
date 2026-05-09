import type { InputManager } from '../input/InputManager';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import type { GameState, RenderSnapshot } from './types';
import { Firefly } from './Firefly';
import { MoonlightOrb } from './MoonlightOrb';
import { MoonShieldPowerup, type MoonShieldSpawnAvoidPoint } from './MoonShieldPowerup';
import { ShadowHazard } from './ShadowHazard';

export class Game {
  private static readonly bestScoreStorageKey = 'moonlitFireflyBloom.bestScore';

  private state: GameState = 'start';
  private elapsedTime = 0;
  private lastFrameTime = 0;
  private score = 0;
  private bestScore = this.loadBestScore();
  private orbsCollected = 0;
  private bloomBursts = 0;
  private nightLevel = 1;
  private highestNightLevel = 1;
  private glow = 100;
  private collectPulseTimer = 0;
  private bloomBurstTimer = 0;
  private bloomBurstCooldownTimer = 0;
  private bloomBurstPosition = { x: 0, y: 0 };
  private shadowHitFlashTimer = 0;
  private levelUpMessageTimer = 0;
  private moonShieldTimer = 0;
  private moonShieldSpawnTimer = 0;
  private isTouchingShadow = false;
  // Glow is the player's health-like resource.
  private readonly maxGlow = 100;
  private readonly startingGlow = 100;
  // Night Level is in-run escalation only: every three Bloom Bursts deepens the night.
  // The level itself is intentionally uncapped; only shadow count is capped for readability.
  private readonly bloomBurstsPerNightLevel = 3;
  // Gentle idle pressure starts here, then rises slowly with Night Level.
  private readonly basePassiveGlowDrainPerSecond = 3;
  private readonly passiveDrainIncreasePerNightLevel = 0.5;
  // Moonlight orbs restore this much glow when collected.
  private readonly orbGlowRestore = 12;
  // Short positive feedback window after collecting a moonlight orb.
  private readonly collectPulseDuration = 0.28;
  // Bloom Burst is a brief reward for collecting light while already glowing brightly.
  private readonly bloomBurstGlowThreshold = 95;
  // Cooldown and glow cost make Bloom Burst feel earned instead of automatic.
  private readonly bloomBurstCooldownSeconds = 2.5;
  private readonly bloomBurstGlowCost = 25;
  private readonly bloomBurstBonusScore = 150;
  private readonly bloomBurstRadius = 160;
  private readonly bloomBurstDuration = 0.72;
  // Push strength is in pixels, with nearby shadows moved more than far shadows.
  private readonly bloomBurstPushStrength = 46;
  // A short warning flash makes shadow contact read as active glow drain.
  private readonly shadowHitFlashDuration = 0.32;
  // Keep early hazards small, then add one more shadow every two Night Levels.
  private readonly baseShadowCount = 4;
  private readonly maxShadowCount = 7;
  private readonly shadowSpeedIncreasePerNightLevel = 0.08;
  private readonly levelUpMessageDuration = 1.8;
  // Moon Shield is a rare temporary pickup, not permanent progression.
  private readonly moonShieldDurationSeconds = 5;
  private readonly moonShieldFirstSpawnDelaySeconds = 15;
  private readonly moonShieldMinRespawnSeconds = 25;
  private readonly moonShieldMaxRespawnSeconds = 40;
  private readonly moonShieldRadius = 15;
  private readonly moonShieldSpawnSafeDistanceFromFirefly = 145;
  private readonly moonShieldSpawnSafeDistanceFromShadows = 96;
  private readonly moonShieldSpawnSafeDistanceFromOrbs = 72;
  private readonly firefly = new Firefly();
  private readonly moonlightOrbs: MoonlightOrb[] = [];
  private readonly moonlightOrbCount = 6;
  private readonly shadowHazards: ShadowHazard[] = [];
  private readonly moonShieldPowerup = new MoonShieldPowerup(this.moonShieldRadius);

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
      this.bloomBurstTimer = Math.max(0, this.bloomBurstTimer - safeDeltaTime);
      this.bloomBurstCooldownTimer = Math.max(0, this.bloomBurstCooldownTimer - safeDeltaTime);
      this.shadowHitFlashTimer = Math.max(0, this.shadowHitFlashTimer - safeDeltaTime);
      this.levelUpMessageTimer = Math.max(0, this.levelUpMessageTimer - safeDeltaTime);
      this.moonShieldTimer = Math.max(0, this.moonShieldTimer - safeDeltaTime);
      this.firefly.update(safeDeltaTime, this.input.getMovementInput(), this.renderer.getSize());
      this.updateMoonlightOrbs(safeDeltaTime);
      this.updateShadowHazards(safeDeltaTime);
      this.updateMoonShieldPowerup(safeDeltaTime);
      this.collectTouchedOrbs();
      this.collectTouchedMoonShield();
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
      bloomBursts: this.bloomBursts,
      nightLevel: this.nightLevel,
      highestNightLevel: this.highestNightLevel,
      levelUpMessageProgress: this.levelUpMessageTimer / this.levelUpMessageDuration,
      glow: this.glow,
      maxGlow: this.maxGlow,
      collectPulse: this.collectPulseTimer / this.collectPulseDuration,
      shadowHitFlash: this.shadowHitFlashTimer / this.shadowHitFlashDuration,
      isTouchingShadow: this.isTouchingShadow && !this.isMoonShieldActive(),
      moonShieldRemaining: this.moonShieldTimer,
      moonShieldDuration: this.moonShieldDurationSeconds,
      bloomBurst: this.getBloomBurstSnapshot(),
      moonShieldPowerup:
        this.state === 'start' ? null : this.moonShieldPowerup.getSnapshot(),
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
    this.bloomBursts = 0;
    this.nightLevel = 1;
    this.highestNightLevel = 1;
    this.glow = this.startingGlow;
    this.collectPulseTimer = 0;
    this.bloomBurstTimer = 0;
    this.bloomBurstCooldownTimer = 0;
    this.bloomBurstPosition = { x: 0, y: 0 };
    this.shadowHitFlashTimer = 0;
    this.levelUpMessageTimer = 0;
    this.moonShieldTimer = 0;
    this.moonShieldSpawnTimer = this.moonShieldFirstSpawnDelaySeconds;
    this.moonShieldPowerup.despawn();
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
    this.shadowHazards.length = 0;
    this.addShadowHazardsUntil(this.getDesiredShadowCount());
  }

  private addShadowHazardsUntil(targetCount: number): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    while (this.shadowHazards.length < targetCount) {
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
    const speedMultiplier = this.getShadowSpeedMultiplier();

    for (const hazard of this.shadowHazards) {
      hazard.update(deltaTime, bounds, speedMultiplier);
    }
  }

  private updateMoonShieldPowerup(deltaTime: number): void {
    this.moonShieldPowerup.update(deltaTime);

    if (this.moonShieldPowerup.active || this.isMoonShieldActive()) {
      return;
    }

    this.moonShieldSpawnTimer = Math.max(0, this.moonShieldSpawnTimer - deltaTime);

    if (this.moonShieldSpawnTimer <= 0) {
      this.spawnMoonShieldPowerup();
    }
  }

  private collectTouchedOrbs(): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    for (const orb of this.moonlightOrbs) {
      const distance = Math.hypot(this.firefly.x - orb.x, this.firefly.y - orb.y);

      if (distance <= this.firefly.radius + orb.radius) {
        const glowBeforeCollection = this.glow;

        this.score += orb.value;
        this.orbsCollected += 1;
        this.glow = Math.min(this.maxGlow, glowBeforeCollection + this.orbGlowRestore);
        this.collectPulseTimer = this.collectPulseDuration;

        if (this.canTriggerBloomBurst(glowBeforeCollection)) {
          this.triggerBloomBurst(fireflyPosition);
        }

        orb.respawn(bounds, fireflyPosition);
      }
    }
  }

  private applyPassiveGlowDrain(deltaTime: number): void {
    this.glow = Math.max(0, this.glow - this.getPassiveGlowDrainPerSecond() * deltaTime);
  }

  private applyShadowDamage(deltaTime: number): boolean {
    let touchingShadow = false;

    for (const hazard of this.shadowHazards) {
      const distance = Math.hypot(this.firefly.x - hazard.x, this.firefly.y - hazard.y);

      if (distance <= this.firefly.radius + hazard.radius) {
        touchingShadow = true;

        if (!this.isMoonShieldActive()) {
          this.glow = Math.max(0, this.glow - hazard.damagePerSecond * deltaTime);
        }
      }
    }

    if (touchingShadow && !this.isMoonShieldActive()) {
      this.shadowHitFlashTimer = this.shadowHitFlashDuration;
    }

    return touchingShadow;
  }

  private collectTouchedMoonShield(): void {
    if (!this.moonShieldPowerup.active) {
      return;
    }

    const distance = Math.hypot(
      this.firefly.x - this.moonShieldPowerup.x,
      this.firefly.y - this.moonShieldPowerup.y,
    );

    if (distance > this.firefly.radius + this.moonShieldPowerup.radius) {
      return;
    }

    this.moonShieldPowerup.despawn();
    this.moonShieldTimer = this.moonShieldDurationSeconds;
    this.scheduleNextMoonShieldSpawn();
  }

  private triggerBloomBurst(origin: { x: number; y: number }): void {
    const bounds = this.renderer.getSize();

    this.score += this.bloomBurstBonusScore;
    this.bloomBursts += 1;
    this.updateNightLevelFromBloomBursts();
    this.bloomBurstTimer = this.bloomBurstDuration;
    this.bloomBurstCooldownTimer = this.bloomBurstCooldownSeconds;
    this.bloomBurstPosition = { ...origin };
    this.glow = Math.max(0, this.glow - this.bloomBurstGlowCost);

    for (const hazard of this.shadowHazards) {
      hazard.pushAwayFrom(
        origin,
        this.bloomBurstRadius,
        this.bloomBurstPushStrength,
        bounds,
      );
    }
  }

  private canTriggerBloomBurst(glowBeforeCollection: number): boolean {
    const hasEnoughGlow =
      glowBeforeCollection >= this.bloomBurstGlowThreshold ||
      this.glow >= this.maxGlow;

    return hasEnoughGlow && this.bloomBurstCooldownTimer <= 0;
  }

  private getBloomBurstSnapshot() {
    if (this.bloomBurstTimer <= 0) {
      return null;
    }

    return {
      x: this.bloomBurstPosition.x,
      y: this.bloomBurstPosition.y,
      progress: 1 - this.bloomBurstTimer / this.bloomBurstDuration,
      radius: this.bloomBurstRadius,
    };
  }

  private updateNightLevelFromBloomBursts(): void {
    const nextNightLevel = 1 + Math.floor(this.bloomBursts / this.bloomBurstsPerNightLevel);

    if (nextNightLevel <= this.nightLevel) {
      return;
    }

    this.nightLevel = nextNightLevel;
    this.highestNightLevel = Math.max(this.highestNightLevel, this.nightLevel);
    this.levelUpMessageTimer = this.levelUpMessageDuration;
    this.addShadowHazardsUntil(this.getDesiredShadowCount());
  }

  private getPassiveGlowDrainPerSecond(): number {
    return (
      this.basePassiveGlowDrainPerSecond +
      (this.nightLevel - 1) * this.passiveDrainIncreasePerNightLevel
    );
  }

  private getShadowSpeedMultiplier(): number {
    return 1 + (this.nightLevel - 1) * this.shadowSpeedIncreasePerNightLevel;
  }

  private getDesiredShadowCount(): number {
    return Math.min(
      this.maxShadowCount,
      this.baseShadowCount + Math.floor((this.nightLevel - 1) / 2),
    );
  }

  private spawnMoonShieldPowerup(): void {
    this.moonShieldPowerup.spawn(this.renderer.getSize(), this.getMoonShieldAvoidPoints());
  }

  private scheduleNextMoonShieldSpawn(): void {
    this.moonShieldSpawnTimer = this.randomBetween(
      this.moonShieldMinRespawnSeconds,
      this.moonShieldMaxRespawnSeconds,
    );
  }

  private getMoonShieldAvoidPoints(): MoonShieldSpawnAvoidPoint[] {
    return [
      {
        x: this.firefly.x,
        y: this.firefly.y,
        safeDistance: this.moonShieldSpawnSafeDistanceFromFirefly,
      },
      ...this.shadowHazards.map((hazard) => ({
        x: hazard.x,
        y: hazard.y,
        safeDistance: hazard.radius + this.moonShieldSpawnSafeDistanceFromShadows,
      })),
      ...this.moonlightOrbs.map((orb) => ({
        x: orb.x,
        y: orb.y,
        safeDistance: orb.radius + this.moonShieldSpawnSafeDistanceFromOrbs,
      })),
    ];
  }

  private isMoonShieldActive(): boolean {
    return this.moonShieldTimer > 0;
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
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
