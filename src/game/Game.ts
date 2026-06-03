import type { AudioManager } from '../audio/AudioManager';
import type { DevScenario } from '../debug/DevScenario';
import { getDevScenarioLabel } from '../debug/DevScenario';
import type { InputManager } from '../input/InputManager';
import type { CanvasRenderer } from '../render/CanvasRenderer';
import type {
  GameState,
  HudMessageKind,
  MoonPhaseName,
  MoonRainMessage,
  MoonShieldPowerupSnapshot,
  MoonlightOrbSnapshot,
  PowerupSnapshot,
  PowerupType,
  RenderSnapshot,
  ShadowHazardSnapshot,
  ShadowVisualState,
} from './types';
import { Firefly } from './Firefly';
import {
  MoonlightOrb,
  type MoonlightOrbSpawnAvoidPoint,
  type MoonlightOrbSpawnOptions,
} from './MoonlightOrb';
import { MoonShieldPowerup, type MoonShieldSpawnAvoidPoint } from './MoonShieldPowerup';
import { Powerup, type PowerupSpawnAvoidPoint } from './Powerup';
import { ShadowHazard, type ShadowSpawnAvoidPoint } from './ShadowHazard';

type GameOptions = {
  devScenario?: DevScenario;
};

export class Game {
  private static readonly bestScoreStorageKey = 'moonlitFireflyBloom.bestScore';
  private static readonly bestNightStorageKey = 'moonlitFireflyBloom.bestNight';
  private static readonly runTitleTiers: readonly { minNight: number; titles: readonly string[] }[] = [
    {
      minNight: 21,
      titles: ['Eternal Lantern', 'Dreamlight Guardian', 'Last Little Light', 'Child of the Moon', 'Nightfall Spirit'],
    },
    {
      minNight: 13,
      titles: ['Deep Night Drifter', 'Starbound Firefly', 'Moon-Blessed', 'Shadow Dancer', 'Keeper of the Glow'],
    },
    {
      minNight: 8,
      titles: ['Silver Wing', 'Full Moon Friend', 'Moonlit Guardian', 'Glow Walker', 'Night Bloom'],
    },
    {
      minNight: 4,
      titles: ['Glow Keeper', 'Soft Wanderer', 'Moonlight Seeker', 'Quiet Drifter', 'Lantern Heart'],
    },
    {
      minNight: 1,
      titles: ['Little Spark', 'Tiny Lantern', 'First Glow', 'Moonlit Seed', 'New Firefly'],
    },
  ];
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
  private startRunAudioRequestId = 0;
  private elapsedTime = 0;
  private lastFrameTime = 0;
  private score = 0;
  private bestScore = this.loadBestScore();
  private bestNightLevel = this.loadBestNightLevel();
  private moonlightGathered = 0;
  private bloomBursts = 0;
  private fullMoonTrialsSurvived = 0;
  private nightLevel = 1;
  private highestNightLevel = 1;
  private isNewBestNight = false;
  private runTitle = '';
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
  private isFullMoonBlessingActive = false;
  private fullMoonBlessingElapsedTime = 0;
  private fullMoonBlessingVisualFadeOutTimer = 0;
  private fullMoonShadowVisualState: ShadowVisualState = 'normal';
  private fullMoonShadowTransitionTimer = 0;
  private pendingMoonRainPhaseChanges = 0;
  private isMoonRainActive = false;
  private moonRainTimer = 0;
  private moonRainVisualFadeOutTimer = 0;
  private moonRainMessageTimer = 0;
  private moonRainMessage: MoonRainMessage = null;
  private moonShieldTimer = 0;
  private moonShieldSpawnTimer = 0;
  private isMoonShieldGlowLocked = false;
  private moonDashTimer = 0;
  private powerupSpawnTimer = 0;
  private startGraceTimer = 0;
  private devFullMoonSequencePhaseTimer = 0;
  private devFullMoonSequencePhaseChangesRemaining = 0;
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
  // Short fair-start protection prevents immediate shadow drain while the player orients.
  private readonly startGraceSeconds = 1.8;
  // Phone screens have less escape space, so they use a calmer shadow profile.
  private readonly phoneBaseShadowCount = 2;
  private readonly phoneMaxShadowCount = 4;
  private readonly tabletBaseShadowCount = 3;
  private readonly tabletMaxShadowCount = 6;
  private readonly desktopBaseShadowCount = 4;
  private readonly desktopMaxShadowCount = 7;
  private readonly shadowSpeedIncreasePerNightLevel = 0.08;
  private readonly levelUpMessageDuration = 1.8;
  // Moon phases are visual only. This timer softens phase swaps as Night deepens.
  private readonly moonPhaseTransitionDurationSeconds = 1.6;
  // Later Full Moons grant protection for the whole Full Moon phase.
  private readonly fullMoonVisualFadeSeconds = 1.2;
  private readonly fullMoonBlessingMessageDurationSeconds = 5.2;
  private readonly fullMoonShadowTransitionSeconds = 0.95;
  private readonly moonRainDelayPhaseChangesAfterFullMoon = 2;
  // Moon Rain is an independent timed after-event: more orbs, slightly faster shadows.
  private readonly moonRainDurationSeconds = 22;
  private readonly moonRainExtraOrbCount = 3;
  private readonly moonRainShadowSpeedMultiplier = 1.18;
  // Moon Rain gameplay starts and ends on time; only the falling-light visual fades.
  private readonly moonRainFadeInSeconds = 1.2;
  private readonly moonRainFadeOutSeconds = 1.2;
  private readonly moonRainMessageDuration = 1.8;
  // URL-only dev shortcuts make long event sequences quick to test without changing normal runs.
  private readonly devFullMoonNightLevel = 9;
  private readonly devFullMoonSequenceFirstAdvanceSeconds = 5.8;
  private readonly devFullMoonSequenceNextAdvanceSeconds = 2.8;
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
  private readonly devScenario: DevScenario;

  constructor(
    private readonly renderer: CanvasRenderer,
    private readonly input: InputManager,
    private readonly audio: AudioManager,
    private readonly onStateChange: (state: GameState) => void = () => {},
    options: GameOptions = {},
  ) {
    this.devScenario = options.devScenario ?? 'none';
  }

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

  primeAudioFromUserGesture(source: string): void {
    if (this.state === 'start' || this.state === 'gameOver') {
      this.audio.playStartRunFromUserGesture(source);
      return;
    }

    this.audio.unlockFromUserGesture(source);
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
      this.updateFullMoonBlessing(safeDeltaTime);
      this.updateFullMoonShadowTransition(safeDeltaTime);
      this.fullMoonBlessingVisualFadeOutTimer = Math.max(
        0,
        this.fullMoonBlessingVisualFadeOutTimer - safeDeltaTime,
      );
      this.moonRainVisualFadeOutTimer = Math.max(0, this.moonRainVisualFadeOutTimer - safeDeltaTime);
      this.moonRainMessageTimer = Math.max(0, this.moonRainMessageTimer - safeDeltaTime);
      this.temporaryHudMessageTimer = Math.max(0, this.temporaryHudMessageTimer - safeDeltaTime);
      this.updateMoonRain(safeDeltaTime);
      this.updateDevScenario(safeDeltaTime);
      this.updateMoonShieldTimer(safeDeltaTime);
      this.moonDashTimer = Math.max(0, this.moonDashTimer - safeDeltaTime);
      this.startGraceTimer = Math.max(0, this.startGraceTimer - safeDeltaTime);
      this.syncResponsiveDensity();
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
      moonlightGathered: this.moonlightGathered,
      bloomBursts: this.bloomBursts,
      fullMoonTrialsSurvived: this.fullMoonTrialsSurvived,
      nightLevel: this.nightLevel,
      highestNightLevel: this.highestNightLevel,
      bestNightLevel: this.bestNightLevel,
      isNewBestNight: this.isNewBestNight,
      runTitle: this.runTitle,
      levelUpMessageProgress: this.levelUpMessageTimer / this.levelUpMessageDuration,
      previousMoonPhaseIndex: this.previousMoonPhaseIndex,
      moonPhaseIndex: this.currentMoonPhaseIndex,
      moonPhaseName: this.getMoonPhaseName(this.currentMoonPhaseIndex),
      moonPhaseTransitionProgress: this.getMoonPhaseTransitionProgress(),
      moonPhaseMessageProgress: this.levelUpMessageTimer / this.levelUpMessageDuration,
      isFullMoonBlessingActive: this.isFullMoonBlessingActive,
      fullMoonBlessingProgress: this.getFullMoonBlessingProgress(),
      fullMoonBlessingIntensity: this.getFullMoonBlessingIntensity(),
      isMoonRainActive: this.isMoonRainActive,
      moonRainProgress: this.getMoonRainProgress(),
      moonRainVisualIntensity: this.getMoonRainVisualIntensity(),
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
        this.state === 'start'
          ? null
          : this.scaleMoonShieldPowerupSnapshot(this.moonShieldPowerup.getSnapshot()),
      powerups: this.state === 'start'
        ? []
        : this.powerups
          .map((powerup) => powerup.getSnapshot())
          .filter((snapshot) => snapshot !== null)
          .map((snapshot) => this.scalePowerupSnapshot(snapshot)),
      virtualJoystick: this.input.getVirtualJoystickSnapshot(),
      firefly: this.state === 'start' ? null : this.firefly.getSnapshot(),
      moonlightOrbs:
        this.state === 'start'
          ? []
          : this.moonlightOrbs.map((orb) => this.scaleMoonlightOrbSnapshot(orb.getSnapshot())),
      shadowHazards:
        this.state === 'start'
          ? []
          : this.shadowHazards.map((hazard) => this.scaleShadowHazardSnapshot(
            hazard.getSnapshot(this.getFullMoonShadowVisibility(), this.fullMoonShadowVisualState),
          )),
      devScenarioLabel: this.getDevScenarioLabel(),
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
      this.startRunWithBestEffortAudio();
    }
  }

  private startRunWithBestEffortAudio(): void {
    if (this.state !== 'start' && this.state !== 'gameOver') {
      return;
    }

    const startSoundRequestedAt = performance.now();
    this.enterPlaying();
    const audioRequestId = ++this.startRunAudioRequestId;

    // Mobile browsers can delay or reject audio unlock. Gameplay starts immediately;
    // the start cue plays only if audio becomes available for this specific run.
    void this.audio.unlock()
      .then(() => {
        if (audioRequestId !== this.startRunAudioRequestId || this.state !== 'playing') {
          return;
        }

        this.audio.playStartRun(startSoundRequestedAt);
      })
      .catch(() => {
        console.warn('Start sound skipped because audio unlock was blocked.');
      });
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
    this.moonlightGathered = 0;
    this.bloomBursts = 0;
    this.fullMoonTrialsSurvived = 0;
    this.nightLevel = 1;
    this.highestNightLevel = 1;
    this.isNewBestNight = false;
    this.runTitle = '';
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
    this.isFullMoonBlessingActive = false;
    this.fullMoonBlessingElapsedTime = 0;
    this.fullMoonBlessingVisualFadeOutTimer = 0;
    this.fullMoonShadowVisualState = 'normal';
    this.fullMoonShadowTransitionTimer = 0;
    this.pendingMoonRainPhaseChanges = 0;
    this.isMoonRainActive = false;
    this.moonRainTimer = 0;
    this.moonRainVisualFadeOutTimer = 0;
    this.moonRainMessageTimer = 0;
    this.moonRainMessage = null;
    this.devFullMoonSequencePhaseTimer = 0;
    this.devFullMoonSequencePhaseChangesRemaining = 0;
    this.moonShieldTimer = 0;
    this.moonShieldSpawnTimer = this.moonShieldFirstSpawnDelaySeconds;
    this.isMoonShieldGlowLocked = false;
    this.moonShieldPowerup.despawn();
    this.moonDashTimer = 0;
    this.powerups.length = 0;
    this.startGraceTimer = this.startGraceSeconds;
    this.powerupSpawnTimer = this.getNextPowerupSpawnDelay();
    this.temporaryHudMessageTimer = 0;
    this.temporaryHudMessageText = '';
    this.isTouchingShadow = false;
    this.firefly.reset(this.renderer.getSize());
    this.applyDevScenarioBeforeSpawns();
    this.resetMoonlightOrbs();
    this.resetShadowHazards();
    this.applyDevScenarioAfterSpawns();
    this.input.clearInput();
    this.state = 'playing';
    this.onStateChange(this.state);
  }

  private applyDevScenarioBeforeSpawns(): void {
    if (!this.isDevScenario()) {
      return;
    }

    if (this.devScenario === 'fullMoon' || this.devScenario === 'fullMoonSequence') {
      this.nightLevel = this.devFullMoonNightLevel;
      this.highestNightLevel = this.devFullMoonNightLevel;
      this.previousMoonPhaseIndex = Game.moonPhases.length - 1;
      this.currentMoonPhaseIndex = this.getMoonPhaseIndexForNight(this.devFullMoonNightLevel);
      this.moonPhaseTransitionTimer = this.moonPhaseTransitionDurationSeconds;
      this.levelUpMessageTimer = this.levelUpMessageDuration;
      this.startFullMoonBlessing();

      if (this.devScenario === 'fullMoonSequence') {
        this.devFullMoonSequencePhaseTimer = this.devFullMoonSequenceFirstAdvanceSeconds;
        this.devFullMoonSequencePhaseChangesRemaining = this.moonRainDelayPhaseChangesAfterFullMoon;
      }
    }
  }

  private applyDevScenarioAfterSpawns(): void {
    if (this.devScenario === 'moonRain') {
      this.startMoonRain();
    }
  }

  private enterGameOver(): void {
    if (this.state === 'gameOver') {
      return;
    }

    this.runTitle = this.chooseRunTitle(this.highestNightLevel);
    this.isNewBestNight = this.updateBestNight();
    this.updateBestScore();
    this.audio.stopMoonRainAmbience();
    this.audio.stopLowGlowWarning();
    this.audio.playGameOver();
    this.state = 'gameOver';
    this.onStateChange(this.state);
  }

  private resetMoonlightOrbs(): void {
    this.moonlightOrbs.length = 0;
    this.addMoonlightOrbsUntil(this.getTargetMoonlightOrbCount());
  }

  private updateMoonlightOrbs(deltaTime: number): void {
    const bounds = this.renderer.getSize();
    const fireflyPosition = { x: this.firefly.x, y: this.firefly.y };

    for (const orb of this.moonlightOrbs) {
      orb.update(deltaTime);

      if (orb.isExpired()) {
        orb.respawn(bounds, fireflyPosition, this.getMoonlightOrbSpawnOptions());
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
      const avoidPoints = this.getShadowSpawnAvoidPoints(fireflyPosition);

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
        this.getMoonlightOrbSpawnOptions(),
      ));
    }
  }

  private trimMoonlightOrbsTo(targetCount: number): void {
    if (this.moonlightOrbs.length <= targetCount) {
      return;
    }

    this.moonlightOrbs.length = targetCount;
  }

  private syncResponsiveDensity(): void {
    this.trimMoonlightOrbsTo(this.getTargetMoonlightOrbCount());
    this.addMoonlightOrbsUntil(this.getTargetMoonlightOrbCount());
    this.trimShadowHazardsTo(this.getDesiredShadowCount());
    this.addShadowHazardsUntil(this.getDesiredShadowCount());
    this.trimSpecialPowerupsTo(this.getMaxActivePowerups());
  }

  private trimShadowHazardsTo(targetCount: number): void {
    if (this.shadowHazards.length <= targetCount) {
      return;
    }

    this.shadowHazards.length = targetCount;
  }

  private trimSpecialPowerupsTo(targetCount: number): void {
    if (this.powerups.length <= targetCount) {
      return;
    }

    this.powerups.length = targetCount;
  }

  private getMoonlightOrbCount(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return 4;
      case 'tablet':
        return 5;
      case 'desktop':
        return this.moonlightOrbCount;
    }
  }

  private getMoonRainExtraOrbCount(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
        return this.moonRainExtraOrbCount;
    }
  }

  private getBaseShadowCount(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return this.phoneBaseShadowCount;
      case 'tablet':
        return this.tabletBaseShadowCount;
      case 'desktop':
        return this.desktopBaseShadowCount;
    }
  }

  private getMaxShadowCount(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return this.phoneMaxShadowCount;
      case 'tablet':
        return this.tabletMaxShadowCount;
      case 'desktop':
        return this.desktopMaxShadowCount;
    }
  }

  private getMaxActivePowerups(): number {
    return this.getScreenProfile() === 'desktop' ? this.maxActivePowerups : 1;
  }

  private getPowerupSpawnDelayMultiplier(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return 1.35;
      case 'tablet':
        return 1.15;
      case 'desktop':
        return 1;
    }
  }

  private getObjectVisualScale(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return 0.8;
      case 'tablet':
        return 0.9;
      case 'desktop':
        return 1;
    }
  }

  private getShadowCollisionScale(): number {
    switch (this.getScreenProfile()) {
      case 'phone':
        return 0.86;
      case 'tablet':
        return 0.93;
      case 'desktop':
        return 1;
    }
  }

  private getScreenProfile(): 'phone' | 'tablet' | 'desktop' {
    const { width, height } = this.renderer.getSize();
    const shortSide = Math.min(width, height);

    // Canvas dimensions drive density, so browser chrome, orientation, and test viewports are handled consistently.
    if (width <= 600 || shortSide <= 500) {
      return 'phone';
    }

    if (width <= 900 || shortSide <= 700) {
      return 'tablet';
    }

    return 'desktop';
  }

  private scaleMoonlightOrbSnapshot(snapshot: MoonlightOrbSnapshot): MoonlightOrbSnapshot {
    return {
      ...snapshot,
      radius: snapshot.radius * this.getObjectVisualScale(),
    };
  }

  private scaleShadowHazardSnapshot(snapshot: ShadowHazardSnapshot): ShadowHazardSnapshot {
    return {
      ...snapshot,
      radius: snapshot.radius * this.getObjectVisualScale(),
    };
  }

  private scaleMoonShieldPowerupSnapshot(
    snapshot: MoonShieldPowerupSnapshot | null,
  ): MoonShieldPowerupSnapshot | null {
    if (!snapshot) {
      return null;
    }

    return {
      ...snapshot,
      radius: snapshot.radius * this.getObjectVisualScale(),
    };
  }

  private scalePowerupSnapshot(snapshot: PowerupSnapshot): PowerupSnapshot {
    return {
      ...snapshot,
      radius: snapshot.radius * this.getObjectVisualScale(),
    };
  }

  private getShadowSpawnAvoidPoints(fireflyPosition: { x: number; y: number }): ShadowSpawnAvoidPoint[] {
    return [
      {
        x: fireflyPosition.x,
        y: fireflyPosition.y,
        safeDistance: this.getStartShadowSafeRadius(),
      },
      ...this.moonlightOrbs.map((orb) => ({
        x: orb.x,
        y: orb.y,
        safeDistance: orb.radius + 68,
      })),
      ...this.shadowHazards.map((hazard) => ({
        x: hazard.x,
        y: hazard.y,
        safeDistance: hazard.radius + 92,
      })),
    ];
  }

  private getStartShadowSafeRadius(): number {
    const { width, height } = this.renderer.getSize();
    const shortSide = Math.min(width, height);

    switch (this.getScreenProfile()) {
      case 'phone':
        return this.clamp(shortSide * 0.42, 130, 180);
      case 'tablet':
        return this.clamp(shortSide * 0.36, 160, 210);
      case 'desktop':
        return this.clamp(shortSide * 0.32, 180, 240);
    }
  }

  private getMoonlightOrbSpawnOptions(): MoonlightOrbSpawnOptions {
    return {
      avoidPoints: this.getMoonlightOrbAvoidPoints(),
      minDistanceFromFirefly: this.getMinOrbDistanceFromFirefly(),
      maxPreferredDistanceFromFirefly: this.getMaxPreferredOrbDistanceFromFirefly(),
    };
  }

  private getMoonlightOrbAvoidPoints(): MoonlightOrbSpawnAvoidPoint[] {
    return [
      ...this.shadowHazards.map((hazard) => ({
        x: hazard.x,
        y: hazard.y,
        safeDistance: hazard.radius + 34,
      })),
      ...this.moonlightOrbs.map((orb) => ({
        x: orb.x,
        y: orb.y,
        safeDistance: orb.radius + 28,
      })),
      ...this.powerups.map((powerup) => ({
        x: powerup.x,
        y: powerup.y,
        safeDistance: powerup.radius + 40,
      })),
      ...(this.moonShieldPowerup.active
        ? [{
            x: this.moonShieldPowerup.x,
            y: this.moonShieldPowerup.y,
            safeDistance: this.moonShieldPowerup.radius + 44,
          }]
        : []),
    ];
  }

  private getMinOrbDistanceFromFirefly(): number {
    const { width, height } = this.renderer.getSize();
    const shortSide = Math.min(width, height);

    switch (this.getScreenProfile()) {
      case 'phone':
        return this.clamp(shortSide * 0.2, 76, 105);
      case 'tablet':
        return this.clamp(shortSide * 0.17, 90, 112);
      case 'desktop':
        return this.clamp(shortSide * 0.15, 104, 126);
    }
  }

  private getMaxPreferredOrbDistanceFromFirefly(): number {
    const { width, height } = this.renderer.getSize();
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);

    switch (this.getScreenProfile()) {
      case 'phone':
        return this.clamp(shortSide * 0.48, 150, 235);
      case 'tablet':
        return this.clamp(longSide * 0.32, 220, 330);
      case 'desktop':
        return this.clamp(longSide * 0.3, 280, 420);
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

  private updateMoonShieldTimer(deltaTime: number): void {
    if (this.moonShieldTimer <= 0) {
      this.isMoonShieldGlowLocked = false;
      return;
    }

    this.moonShieldTimer = Math.max(0, this.moonShieldTimer - deltaTime);

    if (this.moonShieldTimer <= 0) {
      this.isMoonShieldGlowLocked = false;
      return;
    }

    if (this.isMoonShieldGlowLocked) {
      this.glow = this.maxGlow;
    }
  }

  private updateSpecialPowerups(deltaTime: number): void {
    for (const powerup of this.powerups) {
      powerup.update(deltaTime);
    }

    this.removeInactivePowerups();

    if (this.powerups.length >= this.getMaxActivePowerups()) {
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
        this.moonlightGathered += 1;
        this.restoreGlow(this.orbGlowRestore);
        this.audio.playOrbCollect();

        if (this.canTriggerBloomBurst(glowBeforeCollection)) {
          this.triggerBloomBurst(fireflyPosition);
        }

        orb.respawn(bounds, fireflyPosition, this.getMoonlightOrbSpawnOptions());
      }
    }
  }

  private applyPassiveGlowDrain(deltaTime: number): void {
    if (this.isMoonShieldActive() || this.isFullMoonBlessingActive) {
      return;
    }

    this.glow = Math.max(0, this.glow - this.getPassiveGlowDrainPerSecond() * deltaTime);
  }

  private applyShadowDamage(deltaTime: number): boolean {
    let touchingShadow = false;
    const canTakeShadowDamage =
      !this.isMoonShieldActive() &&
      !this.areShadowsSuppressedByFullMoon() &&
      this.startGraceTimer <= 0;

    for (const hazard of this.shadowHazards) {
      const distance = Math.hypot(this.firefly.x - hazard.x, this.firefly.y - hazard.y);
      const shadowCollisionRadius = hazard.radius * this.getShadowCollisionScale();

      if (distance <= this.firefly.radius + shadowCollisionRadius) {
        touchingShadow = true;

        if (canTakeShadowDamage) {
          this.glow = Math.max(0, this.glow - hazard.damagePerSecond * deltaTime);
        }
      }
    }

    if (touchingShadow && canTakeShadowDamage) {
      this.shadowHitFlashTimer = this.shadowHitFlashDuration;
      this.audio.playShadowDamage();
    }

    return touchingShadow && canTakeShadowDamage;
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
    const wasGlowFull = this.glow >= this.maxGlow;
    this.moonShieldTimer = this.moonShieldDurationSeconds;
    this.isMoonShieldGlowLocked = wasGlowFull;
    this.restoreGlow(this.orbGlowRestore);
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
    if (!this.isFullMoonBlessingActive && !this.isMoonShieldGlowLocked) {
      this.glow = Math.max(0, this.glow - this.bloomBurstGlowCost);
    }
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

  private updateDevScenario(deltaTime: number): void {
    if (
      this.devScenario !== 'fullMoonSequence' ||
      this.devFullMoonSequencePhaseChangesRemaining <= 0
    ) {
      return;
    }

    this.devFullMoonSequencePhaseTimer = Math.max(
      0,
      this.devFullMoonSequencePhaseTimer - deltaTime,
    );

    if (this.devFullMoonSequencePhaseTimer > 0) {
      return;
    }

    this.nightLevel += 1;
    this.highestNightLevel = Math.max(this.highestNightLevel, this.nightLevel);
    this.updateMoonPhaseForNight(this.nightLevel);
    this.levelUpMessageTimer = this.levelUpMessageDuration;
    this.addShadowHazardsUntil(this.getDesiredShadowCount());

    this.devFullMoonSequencePhaseChangesRemaining -= 1;
    this.devFullMoonSequencePhaseTimer =
      this.devFullMoonSequencePhaseChangesRemaining > 0
        ? this.devFullMoonSequenceNextAdvanceSeconds
        : 0;
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
      this.getMaxShadowCount(),
      this.getBaseShadowCount() + Math.floor((this.nightLevel - 1) / 2),
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

    const previousMoonPhaseName = this.getMoonPhaseName(this.currentMoonPhaseIndex);
    this.previousMoonPhaseIndex = this.currentMoonPhaseIndex;
    this.currentMoonPhaseIndex = nextMoonPhaseIndex;
    this.moonPhaseTransitionTimer = this.moonPhaseTransitionDurationSeconds;

    const nextMoonPhaseName = this.getMoonPhaseName(nextMoonPhaseIndex);

    if (previousMoonPhaseName === 'Full Moon' && this.isFullMoonBlessingActive) {
      this.endFullMoonBlessing();
    }

    if (nextMoonPhaseName === 'Full Moon' && nightLevel > 1) {
      this.startFullMoonBlessing();
      this.audio.playMoonPhase(nextMoonPhaseName);
      return;
    }

    if (this.advancePendingMoonRainDelay()) {
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

  private startFullMoonBlessing(): void {
    if (this.isFullMoonBlessingActive) {
      return;
    }

    this.isFullMoonBlessingActive = true;
    this.fullMoonBlessingElapsedTime = 0;
    this.fullMoonBlessingVisualFadeOutTimer = 0;
    this.beginFullMoonShadowVanish();
    this.pendingMoonRainPhaseChanges = 0;
    this.glow = this.maxGlow;
    this.collectPulseTimer = this.collectPulseDuration;
    this.audio.stopLowGlowWarning();
  }

  private updateFullMoonBlessing(deltaTime: number): void {
    if (!this.isFullMoonBlessingActive) {
      return;
    }

    this.fullMoonBlessingElapsedTime += deltaTime;
    this.glow = this.maxGlow;
    this.lockMoonShieldGlowIfFull();
  }

  private endFullMoonBlessing(): void {
    if (!this.isFullMoonBlessingActive) {
      return;
    }

    this.isFullMoonBlessingActive = false;
    this.fullMoonBlessingVisualFadeOutTimer = this.fullMoonVisualFadeSeconds;
    this.beginFullMoonShadowReturn();
    this.pendingMoonRainPhaseChanges = this.moonRainDelayPhaseChangesAfterFullMoon;
  }

  private beginFullMoonShadowVanish(): void {
    this.fullMoonShadowVisualState = 'vanishing';
    this.fullMoonShadowTransitionTimer = 0;
  }

  private beginFullMoonShadowReturn(): void {
    if (this.fullMoonShadowVisualState === 'normal') {
      return;
    }

    this.fullMoonShadowVisualState = 'returning';
    this.fullMoonShadowTransitionTimer = 0;
  }

  private updateFullMoonShadowTransition(deltaTime: number): void {
    if (
      this.fullMoonShadowVisualState !== 'vanishing' &&
      this.fullMoonShadowVisualState !== 'returning'
    ) {
      return;
    }

    this.fullMoonShadowTransitionTimer = Math.min(
      this.fullMoonShadowTransitionSeconds,
      this.fullMoonShadowTransitionTimer + deltaTime,
    );

    if (this.fullMoonShadowTransitionTimer < this.fullMoonShadowTransitionSeconds) {
      return;
    }

    this.fullMoonShadowVisualState =
      this.fullMoonShadowVisualState === 'vanishing' ? 'hidden' : 'normal';
    this.fullMoonShadowTransitionTimer = 0;
  }

  private getFullMoonShadowVisibility(): number {
    switch (this.fullMoonShadowVisualState) {
      case 'normal':
        return 1;
      case 'hidden':
        return 0;
      case 'vanishing':
        return 1 - this.smoothStep(this.fullMoonShadowTransitionTimer / this.fullMoonShadowTransitionSeconds);
      case 'returning':
        return this.smoothStep(this.fullMoonShadowTransitionTimer / this.fullMoonShadowTransitionSeconds);
    }
  }

  private areShadowsSuppressedByFullMoon(): boolean {
    return this.isFullMoonBlessingActive || this.fullMoonShadowVisualState !== 'normal';
  }

  private advancePendingMoonRainDelay(): boolean {
    if (this.pendingMoonRainPhaseChanges <= 0 || this.isFullMoonBlessingActive) {
      return false;
    }

    this.pendingMoonRainPhaseChanges -= 1;

    if (this.pendingMoonRainPhaseChanges > 0) {
      return false;
    }

    this.startMoonRain();
    return true;
  }

  private getFullMoonBlessingProgress(): number {
    if (this.isFullMoonBlessingActive) {
      return Math.max(
        0,
        Math.min(1, this.fullMoonBlessingElapsedTime / this.fullMoonBlessingMessageDurationSeconds),
      );
    }

    return this.fullMoonBlessingVisualFadeOutTimer > 0 ? 1 : 0;
  }

  private getFullMoonBlessingIntensity(): number {
    if (this.isFullMoonBlessingActive) {
      return this.smoothStep(Math.max(0, Math.min(1, this.fullMoonBlessingElapsedTime / this.fullMoonVisualFadeSeconds)));
    }

    if (this.fullMoonBlessingVisualFadeOutTimer <= 0) {
      return 0;
    }

    return this.smoothStep(Math.max(0, Math.min(1, this.fullMoonBlessingVisualFadeOutTimer / this.fullMoonVisualFadeSeconds)));
  }

  private startMoonRain(): void {
    if (this.isMoonRainActive) {
      return;
    }

    this.isMoonRainActive = true;
    this.moonRainTimer = this.moonRainDurationSeconds;
    this.moonRainVisualFadeOutTimer = 0;
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
    this.moonRainVisualFadeOutTimer = this.moonRainFadeOutSeconds;
    this.moonRainMessage = 'end';
    this.moonRainMessageTimer = this.moonRainMessageDuration;
    this.trimMoonlightOrbsTo(this.getMoonlightOrbCount());
    this.audio.stopMoonRainAmbience();
    this.audio.playMoonRainEnd();
  }

  private getTargetMoonlightOrbCount(): number {
    return this.getMoonlightOrbCount() + (this.isMoonRainActive ? this.getMoonRainExtraOrbCount() : 0);
  }

  private getMoonRainProgress(): number {
    if (!this.isMoonRainActive) {
      return 0;
    }

    return Math.max(0, Math.min(1, this.moonRainTimer / this.moonRainDurationSeconds));
  }

  private getMoonRainVisualIntensity(): number {
    if (this.isMoonRainActive) {
      const eventElapsed = this.moonRainDurationSeconds - this.moonRainTimer;

      return this.smoothStep(Math.max(0, Math.min(1, eventElapsed / this.moonRainFadeInSeconds)));
    }

    if (this.moonRainVisualFadeOutTimer <= 0) {
      return 0;
    }

    return this.smoothStep(Math.max(0, Math.min(1, this.moonRainVisualFadeOutTimer / this.moonRainFadeOutSeconds)));
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
    this.lockMoonShieldGlowIfFull();
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

    return this.randomBetween(min, max) * this.getPowerupSpawnDelayMultiplier();
  }

  private isEarlyRun(): boolean {
    return this.nightLevel < this.earlyRunNightThreshold;
  }

  private getFireflySpeedMultiplier(): number {
    return this.moonDashTimer > 0 ? this.moonDashSpeedMultiplier : 1;
  }

  private restoreGlow(amount: number): void {
    this.glow = Math.min(this.maxGlow, this.glow + amount);
    this.lockMoonShieldGlowIfFull();
    this.collectPulseTimer = this.collectPulseDuration;

    if (this.glow / this.maxGlow > this.lowGlowWarningThreshold) {
      this.audio.stopLowGlowWarning();
    }
  }

  private lockMoonShieldGlowIfFull(): void {
    if (!this.isMoonShieldActive() || this.glow < this.maxGlow) {
      return;
    }

    this.glow = this.maxGlow;
    this.isMoonShieldGlowLocked = true;
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

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private smoothStep(progress: number): number {
    const clampedProgress = this.clamp(progress, 0, 1);

    return clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
  }

  private isDevScenario(): boolean {
    return this.devScenario !== 'none';
  }

  private getDevScenarioLabel(): string | null {
    return getDevScenarioLabel(this.devScenario);
  }

  private updateBestScore(): void {
    if (this.isDevScenario()) {
      return;
    }

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

  private updateBestNight(): boolean {
    if (this.isDevScenario()) {
      return false;
    }

    if (this.highestNightLevel <= this.bestNightLevel) {
      return false;
    }

    this.bestNightLevel = this.highestNightLevel;

    try {
      window.localStorage.setItem(Game.bestNightStorageKey, String(this.bestNightLevel));
    } catch {
      // Best Night is nice-to-have. Gameplay should continue if storage is unavailable.
    }

    return true;
  }

  private loadBestNightLevel(): number {
    try {
      const storedNight = window.localStorage.getItem(Game.bestNightStorageKey);

      if (!storedNight) {
        return 0;
      }

      const parsedNight = Number.parseInt(storedNight, 10);
      return Number.isFinite(parsedNight) && parsedNight > 0 ? parsedNight : 0;
    } catch {
      return 0;
    }
  }

  private chooseRunTitle(nightLevel: number): string {
    const tier = Game.runTitleTiers.find((candidate) => nightLevel >= candidate.minNight)
      ?? Game.runTitleTiers[Game.runTitleTiers.length - 1];
    const index = Math.floor(Math.random() * tier.titles.length);

    return tier.titles[index] ?? 'Little Spark';
  }
}
