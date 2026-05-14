import type { AudioManager } from '../audio/AudioManager';
import type { InputManager } from '../input/InputManager';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import type { GameState, HudMessageKind, MoonPhaseName, MoonRainMessage, PowerupType, RenderSnapshot } from './types';
import { Firefly } from './Firefly';
import { MoonlightOrb } from './MoonlightOrb';
import { MoonShieldPowerup, type MoonShieldSpawnAvoidPoint } from './MoonShieldPowerup';
import { Powerup, type PowerupSpawnAvoidPoint } from './Powerup';
import { ShadowHazard } from './ShadowHazard';

export class Game {
  private static readonly bestScoreStorageKey = 'moonlitFireflyBloom.bestScore';
  private static readonly moonPhases: readonly MoonPhaseName[] = [
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
  ];

  private state: GameState = 'start';
  private elapsedTime = 0;
  private lastFrameTime = 0;
  private score = 0;
  private bestScore = this.loadBestScore();
  private orbsCollected = 0;
  private bloomBursts = 0;
  private fullMoonTrialsSurvived = 0;
  private nightLevel = 1;
  private highestNightLevel = 1;
  private glow = 100;
  private collectPulseTimer = 0;
  private bloomBurstTimer = 0;
  private bloomBurstCooldownTimer = 0;
  private bloomBurstPosition = { x: 0, y: 0 };
  private glowSurgeRewardTimer = 0;
  private glowSurgeRewardPosition = { x: 0, y: 0 };
  private glowSurgeRewardFeedsBloom = false;
  private shadowHitFlashTimer = 0;
  private levelUpMessageTimer = 0;
  private previousMoonPhaseIndex = 0;
  private currentMoonPhaseIndex = 0;
  private moonPhaseTransitionTimer = 0;
  private isMoonRainActive = false;
  private moonRainTimer = 0;
  private moonRainMessageTimer = 0;
  private moonRainMessage: MoonRainMessage = null;
  private moonShieldTimer = 0;
  private moonShieldSpawnTimer = 0;
  private moonDashTimer = 0;
  private powerupSpawnTimer = 0;
  private temporaryHudMessageTimer = 0;
  private temporaryHudMessageText = '';
  private temporaryHudMessageKind: HudMessageKind = 'glowSurge';
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
  // Normal moonlight stays longer than special powerups, then cycles to keep the arena alive.
  private readonly moonlightOrbLifetimeSeconds = 16;
  // Low-glow warning repeats through the audio cooldown while glow stays under this ratio.
  private readonly lowGlowWarningThreshold = 0.25;
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
  // Moon phases are visual only. This timer softens phase swaps as Night deepens.
  private readonly moonPhaseTransitionDurationSeconds = 1.6;
  // Later Full Moons trigger this short event: more orbs, slightly faster shadows.
  private readonly moonRainDurationSeconds = 18;
  private readonly moonRainExtraOrbCount = 3;
  private readonly moonRainShadowSpeedMultiplier = 1.18;
  private readonly moonRainMessageDuration = 1.8;
  private readonly temporaryHudMessageDuration = 1.6;
  // Moon Shield is a rare temporary pickup, not permanent progression.
  private readonly moonShieldDurationSeconds = 5;
  private readonly moonShieldFirstSpawnDelaySeconds = 15;
  private readonly moonShieldMinRespawnSeconds = 25;
  private readonly moonShieldMaxRespawnSeconds = 40;
  private readonly moonShieldRadius = 15;
  private readonly moonShieldSpawnSafeDistanceFromFirefly = 145;
  private readonly moonShieldSpawnSafeDistanceFromShadows = 96;
  private readonly moonShieldSpawnSafeDistanceFromOrbs = 72;
  // Moon Dash and Glow Surge are temporary run-only pickups, biased to appear earlier.
  private readonly moonDashDurationSeconds = 5;
  private readonly moonDashSpeedMultiplier = 1.85;
  private readonly glowSurgeRestoreAmount = 50;
  private readonly glowSurgeHalfThreshold = 0.5;
  private readonly glowSurgeRewardDuration = 0.68;
  private readonly powerupRadius = 14;
  private readonly powerupLifetimeSeconds = 9;
  private readonly maxActivePowerups = 2;
  private readonly earlyRunNightThreshold = 9;
  private readonly earlyRunPowerupSpawnIntervalMin = 5;
  private readonly earlyRunPowerupSpawnIntervalMax = 8;
  private readonly normalPowerupSpawnIntervalMin = 12;
  private readonly normalPowerupSpawnIntervalMax = 18;
  private readonly earlyRunGlowSurgeSpawnBias = 0.58;
  private readonly normalGlowSurgeSpawnBias = 0.44;
  private readonly powerupSpawnSafeDistanceFromFirefly = 130;
  private readonly powerupSpawnSafeDistanceFromShadows = 92;
  private readonly powerupSpawnSafeDistanceFromOrbs = 58;
  private readonly powerupSpawnSafeDistanceFromPowerups = 70;
  private readonly firefly = new Firefly();
  private readonly moonlightOrbs: MoonlightOrb[] = [];
  private readonly moonlightOrbCount = 6;
  private readonly shadowHazards: ShadowHazard[] = [];
  private readonly moonShieldPowerup = new MoonShieldPowerup(this.moonShieldRadius);
  private readonly powerups: Powerup[] = [];

  constructor(
    private readonly renderer: CanvasRenderer,
    private readonly input: InputManager,
    private readonly audio: AudioManager,
    private readonly onStateChange: (state: GameState) => void = () => {},
  ) {}

  start(): void {
    this.onStateChange(this.state);
    requestAnimationFrame(this.tick);
  }

  pause(): void {
    if (this.state !== 'playing') {
      return;
    }

    this.state = 'paused';
    this.isTouchingShadow = false;
    this.input.clearInput();
    this.audio.stopMoonRainAmbience();
    this.audio.stopLowGlowWarning();
    this.onStateChange(this.state);
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
      this.glowSurgeRewardTimer = Math.max(0, this.glowSurgeRewardTimer - safeDeltaTime);
      this.shadowHitFlashTimer = Math.max(0, this.shadowHitFlashTimer - safeDeltaTime);
      this.levelUpMessageTimer = Math.max(0, this.levelUpMessageTimer - safeDeltaTime);
      this.moonPhaseTransitionTimer = Math.max(0, this.moonPhaseTransitionTimer - safeDeltaTime);
      this.moonRainMessageTimer = Math.max(0, this.moonRainMessageTimer - safeDeltaTime);
      this.temporaryHudMessageTimer = Math.max(0, this.temporaryHudMessageTimer - safeDeltaTime);
      this.updateMoonRain(safeDeltaTime);
      this.moonShieldTimer = Math.max(0, this.moonShieldTimer - safeDeltaTime);
      this.moonDashTimer = Math.max(0, this.moonDashTimer - safeDeltaTime);
      this.firefly.update(
        safeDeltaTime,
        this.input.getMovementInput(),
        this.renderer.getSize(),
        this.getFireflySpeedMultiplier(),
      );
      this.updateMoonlightOrbs(safeDeltaTime);
      this.updateShadowHazards(safeDeltaTime);
      this.updateMoonShieldPowerup(safeDeltaTime);
      this.updateSpecialPowerups(safeDeltaTime);
      this.collectTouchedOrbs();
      this.collectTouchedMoonShield();
      this.collectTouchedSpecialPowerups();
      this.applyPassiveGlowDrain(safeDeltaTime);
      this.isTouchingShadow = this.applyShadowDamage(safeDeltaTime);
      this.updateLowGlowWarning();

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
      fullMoonTrialsSurvived: this.fullMoonTrialsSurvived,
      nightLevel: this.nightLevel,
      highestNightLevel: this.highestNightLevel,
      levelUpMessageProgress: this.levelUpMessageTimer / this.levelUpMessageDuration,
      previousMoonPhaseIndex: this.previousMoonPhaseIndex,
      moonPhaseIndex: this.currentMoonPhaseIndex,
      moonPhaseName: this.getMoonPhaseName(this.currentMoonPhaseIndex),
      moonPhaseTransitionProgress: this.getMoonPhaseTransitionProgress(),
      moonPhaseMessageProgress: this.levelUpMessageTimer / this.levelUpMessageDuration,
      isMoonRainActive: this.isMoonRainActive,
      moonRainProgress: this.getMoonRainProgress(),
      moonRainMessage: this.moonRainMessageTimer > 0 ? this.moonRainMessage : null,
      moonRainMessageProgress: this.moonRainMessageTimer / this.moonRainMessageDuration,
      glow: this.glow,
      maxGlow: this.maxGlow,
      collectPulse: this.collectPulseTimer / this.collectPulseDuration,
      shadowHitFlash: this.shadowHitFlashTimer / this.shadowHitFlashDuration,
      isTouchingShadow: this.isTouchingShadow && !this.isMoonShieldActive(),
      moonShieldRemaining: this.moonShieldTimer,
      moonShieldDuration: this.moonShieldDurationSeconds,
      moonDashRemaining: this.moonDashTimer,
      moonDashDuration: this.moonDashDurationSeconds,
      temporaryHudMessage: this.getTemporaryHudMessageSnapshot(),
      bloomBurst: this.getBloomBurstSnapshot(),
      glowSurgeReward: this.getGlowSurgeRewardSnapshot(),
      moonShieldPowerup:
        this.state === 'start' ? null : this.moonShieldPowerup.getSnapshot(),
      powerups: this.state === 'start'
        ? []
        : this.powerups
          .map((powerup) => powerup.getSnapshot())
          .filter((snapshot) => snapshot !== null),
      firefly: this.state === 'start' ? null : this.firefly.getSnapshot(),
      moonlightOrbs:
        this.state === 'start' ? [] : this.moonlightOrbs.map((orb) => orb.getSnapshot()),
      shadowHazards:
        this.state === 'start' ? [] : this.shadowHazards.map((hazard) => hazard.getSnapshot()),
    };

    this.renderer.render(snapshot);
  }

  private handlePrimaryPress(): void {
    if (this.state === 'paused') {
      void this.audio.unlock();
      this.resumePlaying();
      return;
    }

    if (this.state === 'start' || this.state === 'gameOver') {
      void this.audio.unlock();
      this.enterPlaying();
    }
  }

  private resumePlaying(): void {
    if (this.state !== 'paused') {
      return;
    }

    this.input.clearInput();
    this.state = 'playing';
    this.onStateChange(this.state);

    if (this.isMoonRainActive) {
      this.audio.startMoonRainAmbience();
    }
  }

  private enterPlaying(): void {
    this.audio.stopMoonRainAmbience();
    this.audio.stopLowGlowWarning();
    this.elapsedTime = 0;
    this.score = 0;
    this.orbsCollected = 0;
    this.bloomBursts = 0;
    this.fullMoonTrialsSurvived = 0;
    this.nightLevel = 1;
    this.highestNightLevel = 1;
    this.glow = this.startingGlow;
    this.collectPulseTimer = 0;
    this.bloomBurstTimer = 0;
    this.bloomBurstCooldownTimer = 0;
    this.bloomBurstPosition = { x: 0, y: 0 };
    this.glowSurgeRewardTimer = 0;
    this.glowSurgeRewardPosition = { x: 0, y: 0 };
    this.glowSurgeRewardFeedsBloom = false;
    this.shadowHitFlashTimer = 0;
    this.levelUpMessageTimer = 0;
    this.previousMoonPhaseIndex = this.getMoonPhaseIndexForNight(1);
    this.currentMoonPhaseIndex = this.previousMoonPhaseIndex;
    this.moonPhaseTransitionTimer = 0;
    this.isMoonRainActive = false;
    this.moonRainTimer = 0;
    this.moonRainMessageTimer = 0;
    this.moonRainMessage = null;
    this.moonShieldTimer = 0;
    this.moonShieldSpawnTimer = this.moonShieldFirstSpawnDelaySeconds;
    this.moonShieldPowerup.despawn();
    this.moonDashTimer = 0;
    this.powerups.length = 0;
    this.powerupSpawnTimer = this.getNextPowerupSpawnDelay();
    this.temporaryHudMessageTimer = 0;
    this.temporaryHudMessageText = '';
    this.isTouchingShadow = false;
    this.firefly.reset(this.renderer.getSize());
    this.resetMoonlightOrbs();
    this.resetShadowHazards();
    this.input.clearInput();
    this.state = 'playing';
    this.onStateChange(this.state);
    this.audio.playStartRun();
  }

  private enterGameOver(): void {
    if (this.state === 'gameOver') {
      return;
    }

    this.updateBestScore();
    this.audio.stopMoonRainAmbience();
    this.audio.stopLowGlowWarning();
    this.audio.playGameOver();
    this.state = 'gameOver';
    this.onStateChange(this.state);
  }

  private resetMoonlightOrbs(): void {
    this.moonlightOrbs.length = 0;
    this.addMoonlightOrbsUntil(this.moonlightOrbCount);
  }

  private updateMoonlightOrbs(deltaTime: number): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    for (const orb of this.moonlightOrbs) {
      orb.update(deltaTime);

      if (orb.isExpired()) {
        orb.respawn(bounds, fireflyPosition);
      }
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

  private addMoonlightOrbsUntil(targetCount: number): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    while (this.moonlightOrbs.length < targetCount) {
      this.moonlightOrbs.push(new MoonlightOrb(
        bounds,
        fireflyPosition,
        this.moonlightOrbLifetimeSeconds,
      ));
    }
  }

  private trimMoonlightOrbsTo(targetCount: number): void {
    if (this.moonlightOrbs.length <= targetCount) {
      return;
    }

    this.moonlightOrbs.length = targetCount;
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

  private updateSpecialPowerups(deltaTime: number): void {
    for (const powerup of this.powerups) {
      powerup.update(deltaTime);
    }

    this.removeInactivePowerups();

    if (this.powerups.length >= this.maxActivePowerups) {
      return;
    }

    this.powerupSpawnTimer = Math.max(0, this.powerupSpawnTimer - deltaTime);

    if (this.powerupSpawnTimer <= 0) {
      this.spawnSpecialPowerup();
      this.powerupSpawnTimer = this.getNextPowerupSpawnDelay();
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
        this.restoreGlow(this.orbGlowRestore);
        this.audio.playOrbCollect();

        if (this.canTriggerBloomBurst(glowBeforeCollection)) {
          this.triggerBloomBurst(fireflyPosition);
        }

        orb.respawn(bounds, fireflyPosition);
      }
    }
  }

  private applyPassiveGlowDrain(deltaTime: number): void {
    if (this.isMoonShieldActive()) {
      return;
    }

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
      this.audio.playShadowDamage();
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
    this.restoreGlow(this.orbGlowRestore);
    this.moonShieldTimer = this.moonShieldDurationSeconds;
    this.scheduleNextMoonShieldSpawn();
    this.audio.playMoonShield();
  }

  private collectTouchedSpecialPowerups(): void {
    for (const powerup of this.powerups) {
      if (!powerup.active) {
        continue;
      }

      const distance = Math.hypot(this.firefly.x - powerup.x, this.firefly.y - powerup.y);

      if (distance > this.firefly.radius + powerup.radius) {
        continue;
      }

      this.applySpecialPowerup(powerup.type);
      powerup.despawn();
      this.playSpecialPowerupSound(powerup.type);
    }

    this.removeInactivePowerups();
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
    this.audio.playBloomBurst();

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

  private updateLowGlowWarning(): void {
    if (this.glow <= 0 || this.glow / this.maxGlow > this.lowGlowWarningThreshold) {
      this.audio.stopLowGlowWarning();
      return;
    }

    this.audio.playLowGlowWarning();
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
    this.updateMoonPhaseForNight(this.nightLevel);
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
    const nightSpeedMultiplier = 1 + (this.nightLevel - 1) * this.shadowSpeedIncreasePerNightLevel;

    return this.isMoonRainActive
      ? nightSpeedMultiplier * this.moonRainShadowSpeedMultiplier
      : nightSpeedMultiplier;
  }

  private getDesiredShadowCount(): number {
    return Math.min(
      this.maxShadowCount,
      this.baseShadowCount + Math.floor((this.nightLevel - 1) / 2),
    );
  }

  private getMoonPhaseIndexForNight(nightLevel = this.nightLevel): number {
    return (nightLevel - 1) % Game.moonPhases.length;
  }

  private getMoonPhaseName(moonPhaseIndex: number): MoonPhaseName {
    return Game.moonPhases[moonPhaseIndex] ?? 'Full Moon';
  }

  private updateMoonPhaseForNight(nightLevel: number): void {
    const nextMoonPhaseIndex = this.getMoonPhaseIndexForNight(nightLevel);

    if (nextMoonPhaseIndex === this.currentMoonPhaseIndex) {
      return;
    }

    this.previousMoonPhaseIndex = this.currentMoonPhaseIndex;
    this.currentMoonPhaseIndex = nextMoonPhaseIndex;
    this.moonPhaseTransitionTimer = this.moonPhaseTransitionDurationSeconds;

    const nextMoonPhaseName = this.getMoonPhaseName(nextMoonPhaseIndex);

    if (nextMoonPhaseName === 'Full Moon' && nightLevel > 1) {
      this.startMoonRain();
      return;
    }

    this.audio.playMoonPhase(nextMoonPhaseName);
  }

  private getMoonPhaseTransitionProgress(): number {
    if (this.moonPhaseTransitionTimer <= 0) {
      return 1;
    }

    return 1 - this.moonPhaseTransitionTimer / this.moonPhaseTransitionDurationSeconds;
  }

  private startMoonRain(): void {
    if (this.isMoonRainActive) {
      return;
    }

    this.isMoonRainActive = true;
    this.moonRainTimer = this.moonRainDurationSeconds;
    this.moonRainMessage = 'start';
    this.moonRainMessageTimer = this.moonRainMessageDuration;
    this.addMoonlightOrbsUntil(this.getTargetMoonlightOrbCount());
    this.audio.playMoonRainBegin();
    this.audio.startMoonRainAmbience();
  }

  private updateMoonRain(deltaTime: number): void {
    if (!this.isMoonRainActive) {
      return;
    }

    this.moonRainTimer = Math.max(0, this.moonRainTimer - deltaTime);

    if (this.moonRainTimer > 0) {
      return;
    }

    this.isMoonRainActive = false;
    this.fullMoonTrialsSurvived += 1;
    this.moonRainMessage = 'end';
    this.moonRainMessageTimer = this.moonRainMessageDuration;
    this.trimMoonlightOrbsTo(this.moonlightOrbCount);
    this.audio.stopMoonRainAmbience();
    this.audio.playMoonRainEnd();
  }

  private getTargetMoonlightOrbCount(): number {
    return this.moonlightOrbCount + (this.isMoonRainActive ? this.moonRainExtraOrbCount : 0);
  }

  private getMoonRainProgress(): number {
    if (!this.isMoonRainActive) {
      return 0;
    }

    return Math.max(0, Math.min(1, this.moonRainTimer / this.moonRainDurationSeconds));
  }

  private spawnMoonShieldPowerup(): void {
    this.moonShieldPowerup.spawn(this.renderer.getSize(), this.getMoonShieldAvoidPoints());
  }

  private spawnSpecialPowerup(): void {
    const powerup = new Powerup(
      this.choosePowerupType(),
      this.powerupRadius,
      this.powerupLifetimeSeconds,
    );

    powerup.spawn(this.renderer.getSize(), this.getPowerupAvoidPoints());
    this.powerups.push(powerup);
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

  private getPowerupAvoidPoints(): PowerupSpawnAvoidPoint[] {
    return [
      {
        x: this.firefly.x,
        y: this.firefly.y,
        safeDistance: this.powerupSpawnSafeDistanceFromFirefly,
      },
      ...this.shadowHazards.map((hazard) => ({
        x: hazard.x,
        y: hazard.y,
        safeDistance: hazard.radius + this.powerupSpawnSafeDistanceFromShadows,
      })),
      ...this.moonlightOrbs.map((orb) => ({
        x: orb.x,
        y: orb.y,
        safeDistance: orb.radius + this.powerupSpawnSafeDistanceFromOrbs,
      })),
      ...this.powerups.map((powerup) => ({
        x: powerup.x,
        y: powerup.y,
        safeDistance: powerup.radius + this.powerupSpawnSafeDistanceFromPowerups,
      })),
      ...(this.moonShieldPowerup.active
        ? [{
            x: this.moonShieldPowerup.x,
            y: this.moonShieldPowerup.y,
            safeDistance: this.moonShieldPowerup.radius + this.powerupSpawnSafeDistanceFromPowerups,
          }]
        : []),
    ];
  }

  private applySpecialPowerup(type: PowerupType): void {
    if (type === 'moonDash') {
      this.restoreGlow(this.orbGlowRestore);
      this.moonDashTimer = this.moonDashDurationSeconds;
      return;
    }

    const glowBeforeCollection = this.glow;
    const shouldOverflow = glowBeforeCollection / this.maxGlow > this.glowSurgeHalfThreshold;

    this.glow = shouldOverflow
      ? this.maxGlow
      : Math.min(this.maxGlow, this.glow + this.glowSurgeRestoreAmount);
    this.collectPulseTimer = this.collectPulseDuration;
    this.showTemporaryHudMessage('Glow x2', 'glowSurge');
    const willTriggerBloom = shouldOverflow && this.canTriggerBloomBurst(glowBeforeCollection);

    this.triggerGlowSurgeReward(willTriggerBloom);

    if (willTriggerBloom) {
      this.triggerBloomBurst({ x: this.firefly.x, y: this.firefly.y });
    }
  }

  private playSpecialPowerupSound(type: PowerupType): void {
    if (type === 'moonDash') {
      this.audio.playSpeedPowerup();
      return;
    }

    this.audio.playGlowSurgePowerup();
  }

  private removeInactivePowerups(): void {
    for (let index = this.powerups.length - 1; index >= 0; index -= 1) {
      if (!this.powerups[index].active) {
        this.powerups.splice(index, 1);
      }
    }
  }

  private choosePowerupType(): PowerupType {
    const glowSurgeChance = this.isEarlyRun()
      ? this.earlyRunGlowSurgeSpawnBias
      : this.normalGlowSurgeSpawnBias;

    if (this.glow / this.maxGlow < 0.45) {
      return 'glowSurge';
    }

    return Math.random() < glowSurgeChance ? 'glowSurge' : 'moonDash';
  }

  private getNextPowerupSpawnDelay(): number {
    const min = this.isEarlyRun()
      ? this.earlyRunPowerupSpawnIntervalMin
      : this.normalPowerupSpawnIntervalMin;
    const max = this.isEarlyRun()
      ? this.earlyRunPowerupSpawnIntervalMax
      : this.normalPowerupSpawnIntervalMax;

    return this.randomBetween(min, max);
  }

  private isEarlyRun(): boolean {
    return this.nightLevel < this.earlyRunNightThreshold;
  }

  private getFireflySpeedMultiplier(): number {
    return this.moonDashTimer > 0 ? this.moonDashSpeedMultiplier : 1;
  }

  private restoreGlow(amount: number): void {
    this.glow = Math.min(this.maxGlow, this.glow + amount);
    this.collectPulseTimer = this.collectPulseDuration;

    if (this.glow / this.maxGlow > this.lowGlowWarningThreshold) {
      this.audio.stopLowGlowWarning();
    }
  }

  private showTemporaryHudMessage(text: string, kind: HudMessageKind): void {
    this.temporaryHudMessageText = text;
    this.temporaryHudMessageKind = kind;
    this.temporaryHudMessageTimer = this.temporaryHudMessageDuration;
  }

  private triggerGlowSurgeReward(feedsBloom: boolean): void {
    this.glowSurgeRewardTimer = this.glowSurgeRewardDuration;
    this.glowSurgeRewardPosition = { x: this.firefly.x, y: this.firefly.y };
    this.glowSurgeRewardFeedsBloom = feedsBloom;
  }

  private getTemporaryHudMessageSnapshot() {
    if (this.temporaryHudMessageTimer <= 0) {
      return null;
    }

    return {
      text: this.temporaryHudMessageText,
      kind: this.temporaryHudMessageKind,
      progress: this.temporaryHudMessageTimer / this.temporaryHudMessageDuration,
    };
  }

  private getGlowSurgeRewardSnapshot() {
    if (this.glowSurgeRewardTimer <= 0) {
      return null;
    }

    return {
      x: this.glowSurgeRewardPosition.x,
      y: this.glowSurgeRewardPosition.y,
      progress: 1 - this.glowSurgeRewardTimer / this.glowSurgeRewardDuration,
      feedsBloom: this.glowSurgeRewardFeedsBloom,
    };
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
