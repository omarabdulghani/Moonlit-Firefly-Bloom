import type { MoonPhaseName } from '../game/types';

type SoundId =
  | 'bloomBurst'
  | 'gameOver'
  | 'glowSurgePowerup'
  | 'lowGlowWarning'
  | 'moonPhaseCrescent'
  | 'moonPhaseFull'
  | 'moonPhaseGibbous'
  | 'moonPhaseNew'
  | 'moonPhaseQuarter'
  | 'moonRainAmbience'
  | 'moonRainBegin'
  | 'moonRainEnd'
  | 'moonShield'
  | 'orbCollect'
  | 'shadowDamage'
  | 'speedPowerup'
  | 'startRun';

type SoundFormat = 'm4a' | 'mp3';

type SoundSource = {
  format: SoundFormat;
  path: string;
  mimeType: string;
};

type SoundConfig = {
  sources: readonly SoundSource[];
  volume: number;
  cooldownSeconds?: number;
  loop?: boolean;
  maxInstances?: number;
};

type PlayOptions = {
  maxDelayMs?: number;
  requestedAtMs?: number;
};

const runtimeSources = (fileName: string): readonly SoundSource[] => [
  {
    format: 'm4a',
    path: `/sounds/runtime/m4a/${fileName}.m4a`,
    mimeType: 'audio/mp4; codecs="mp4a.40.2"',
  },
  {
    format: 'mp3',
    path: `/sounds/runtime/mp3/${fileName}.mp3`,
    mimeType: 'audio/mpeg',
  },
];

const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
  bloomBurst: {
    sources: runtimeSources('bloom-burst'),
    volume: 0.58,
    maxInstances: 1,
  },
  gameOver: {
    sources: runtimeSources('game-over-glow-faded'),
    volume: 0.5,
    maxInstances: 1,
  },
  glowSurgePowerup: {
    sources: runtimeSources('x2-powerup'),
    volume: 0.48,
    maxInstances: 1,
  },
  lowGlowWarning: {
    sources: runtimeSources('low-glow-warning'),
    volume: 0.28,
    cooldownSeconds: 4.5,
    maxInstances: 1,
  },
  moonPhaseCrescent: {
    sources: runtimeSources('moon-phase-crescent'),
    volume: 0.28,
    maxInstances: 1,
  },
  moonPhaseFull: {
    sources: runtimeSources('moon-phase-full'),
    volume: 0.28,
    maxInstances: 1,
  },
  moonPhaseGibbous: {
    sources: runtimeSources('moon-phase-gibbous'),
    volume: 0.28,
    maxInstances: 1,
  },
  moonPhaseNew: {
    sources: runtimeSources('moon-phase-new'),
    volume: 0.28,
    maxInstances: 1,
  },
  moonPhaseQuarter: {
    sources: runtimeSources('moon-phase-quarter'),
    volume: 0.28,
    maxInstances: 1,
  },
  moonRainAmbience: {
    sources: runtimeSources('moon-rain-ambience-loop'),
    volume: 0.17,
    loop: true,
  },
  moonRainBegin: {
    sources: runtimeSources('moon-rain-begins'),
    volume: 0.55,
    maxInstances: 1,
  },
  moonRainEnd: {
    sources: runtimeSources('moon-rain-ends'),
    volume: 0.42,
    maxInstances: 1,
  },
  moonShield: {
    sources: runtimeSources('moon-shield'),
    volume: 0.48,
    maxInstances: 1,
  },
  orbCollect: {
    sources: runtimeSources('orb-collect'),
    volume: 0.28,
    cooldownSeconds: 0.04,
    maxInstances: 4,
  },
  shadowDamage: {
    sources: runtimeSources('shadow-damage'),
    volume: 0.38,
    cooldownSeconds: 0.85,
    maxInstances: 1,
  },
  speedPowerup: {
    sources: runtimeSources('speed-powerup'),
    volume: 0.5,
    maxInstances: 1,
  },
  startRun: {
    sources: runtimeSources('start-run'),
    volume: 0.48,
    cooldownSeconds: 1,
    maxInstances: 1,
  },
};

const SOUND_LOAD_ORDER: readonly SoundId[] = [
  'startRun',
  'orbCollect',
  'shadowDamage',
  'bloomBurst',
  'gameOver',
  'lowGlowWarning',
  'moonShield',
  'speedPowerup',
  'glowSurgePowerup',
  'moonRainBegin',
  'moonRainEnd',
  'moonPhaseFull',
  'moonPhaseGibbous',
  'moonPhaseQuarter',
  'moonPhaseCrescent',
  'moonPhaseNew',
  'moonRainAmbience',
];

const CRITICAL_SOUND_IDS: readonly SoundId[] = [
  'startRun',
  'orbCollect',
  'shadowDamage',
  'bloomBurst',
  'gameOver',
  'moonShield',
  'speedPowerup',
  'glowSurgePowerup',
];

type WebAudioConstructor = typeof AudioContext;

type ActivePlayback = {
  source: AudioBufferSourceNode;
  gain: GainNode;
};

export class AudioManager {
  // Kept as a simple code flag for now so a future mute toggle can wire into it.
  soundEnabled = true;

  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private readonly buffers = new Map<SoundId, AudioBuffer>();
  private readonly decodedSources = new Map<SoundId, SoundSource>();
  private readonly loadingSounds = new Map<SoundId, Promise<void>>();
  private readonly unavailableSounds = new Set<SoundId>();
  private readonly lastPlayedAt = new Map<SoundId, number>();
  private readonly activeOneShotSources = new Map<SoundId, Set<ActivePlayback>>();
  private readonly pendingPlays = new Set<SoundId>();
  private readonly requestedLoops = new Set<SoundId>();
  private readonly activeLoops = new Map<SoundId, ActivePlayback>();
  private unlockPromise: Promise<void> | null = null;
  private isUnlocked = false;
  private isPreloading = false;
  private mobileMixMultiplier = 1;
  private startRunElement: HTMLAudioElement | null = null;
  private startRunFallbackRuntimeSource: SoundSource | null = null;
  private readonly formatSupport = new Map<SoundFormat, boolean>();
  private readonly debugEnabled = new URLSearchParams(window.location.search).get('audioDebug') === '1';
  // Mobile browsers can leave audio resume pending; this keeps future taps retryable.
  private readonly unlockTimeoutMs = 1200;
  // Prevents an intro cue from arriving awkwardly late after play has already started.
  private readonly startRunMaxDelayMs = 900;
  private readonly powerupMaxDelayMs = 1200;

  constructor() {
    this.detectFormatSupport();
    this.prepareStartRunFallback();
    this.logDebug('audio debug enabled', { userAgent: navigator.userAgent });
  }

  setMobileMix(isMobileSized: boolean): void {
    this.mobileMixMultiplier = isMobileSized ? 0.82 : 1;

    if (this.masterGain) {
      this.masterGain.gain.value = this.mobileMixMultiplier;
    }
  }

  async unlock(): Promise<void> {
    if (!this.soundEnabled) {
      return;
    }

    if (this.isAudioContextReady()) {
      this.isUnlocked = true;
      return;
    }

    if (this.unlockPromise) {
      return this.unlockPromise;
    }

    const unlockAttempt = this.unlockAudioContext();
    this.unlockPromise = unlockAttempt;

    try {
      await Promise.race([unlockAttempt, this.waitForUnlockTimeout()]);
    } finally {
      if (this.unlockPromise === unlockAttempt) {
        this.unlockPromise = null;
      }
    }
  }

  unlockFromUserGesture(source = 'unknown'): void {
    this.logDebug('unlock requested from user gesture', {
      source,
      contextState: this.audioContext?.state ?? 'not-created',
    });

    void this.unlock().catch((error) => {
      this.logDebug('unlock failed from user gesture', {
        source,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  playStartRunFromUserGesture(source = 'unknown'): void {
    if (!this.soundEnabled) {
      this.logDebug('startRun skipped', { reason: 'sound disabled', source });
      return;
    }

    const requestedAtMs = performance.now();
    this.unlockFromUserGesture(source);

    if (this.isOnCooldown('startRun', requestedAtMs / 1000)) {
      this.logDebug('startRun skipped', { reason: 'recently requested', source });
      return;
    }

    const buffer = this.buffers.get('startRun');

    if (this.isUnlocked && this.audioContext?.state === 'running' && buffer) {
      this.play('startRun', { maxDelayMs: this.startRunMaxDelayMs, requestedAtMs });
      return;
    }

    if (this.playStartRunHtmlFallback(source, requestedAtMs)) {
      return;
    }

    this.playStartRun(requestedAtMs);
  }

  private async unlockAudioContext(): Promise<void> {
    const context = this.getOrCreateContext();

    if (!context) {
      this.logDebug('unlock skipped', { reason: 'AudioContext unavailable' });
      return;
    }

    try {
      if (context.state !== 'running' && context.state !== 'closed') {
        await context.resume();
      }

      this.isUnlocked = context.state === 'running';

      if (this.isUnlocked) {
        this.logDebug('unlock complete', { contextState: context.state });
        this.preloadSounds();
        return;
      }

      this.logDebug('unlock did not reach running state', { contextState: context.state });
    } catch (error) {
      this.logDebug('unlock failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Mobile browsers can reject audio start. Gameplay should continue silently.
    }
  }

  playStartRun(requestedAtMs = performance.now()): void {
    this.play('startRun', { maxDelayMs: this.startRunMaxDelayMs, requestedAtMs });
  }

  playOrbCollect(): void {
    this.play('orbCollect');
  }

  playShadowDamage(): void {
    this.play('shadowDamage');
  }

  playBloomBurst(): void {
    this.play('bloomBurst');
  }

  playLowGlowWarning(): void {
    this.play('lowGlowWarning');
  }

  stopLowGlowWarning(): void {
    this.stopOneShots('lowGlowWarning');
  }

  playGameOver(): void {
    this.play('gameOver');
  }

  playMoonPhase(phaseName: MoonPhaseName): void {
    switch (phaseName) {
      case 'Full Moon':
        this.play('moonPhaseFull');
        break;
      case 'Waxing Gibbous':
      case 'Waning Gibbous':
        this.play('moonPhaseGibbous');
        break;
      case 'First Quarter':
      case 'Last Quarter':
        this.play('moonPhaseQuarter');
        break;
      case 'Waxing Crescent':
      case 'Waning Crescent':
        this.play('moonPhaseCrescent');
        break;
      case 'New Moon':
        this.play('moonPhaseNew');
        break;
    }
  }

  playMoonRainBegin(): void {
    this.play('moonRainBegin');
  }

  startMoonRainAmbience(): void {
    this.startLoop('moonRainAmbience');
  }

  stopMoonRainAmbience(): void {
    this.stopLoop('moonRainAmbience');
  }

  playMoonRainEnd(): void {
    this.play('moonRainEnd');
  }

  playMoonShield(): void {
    this.play('moonShield', { maxDelayMs: this.powerupMaxDelayMs });
  }

  playSpeedPowerup(): void {
    this.play('speedPowerup', { maxDelayMs: this.powerupMaxDelayMs });
  }

  playGlowSurgePowerup(): void {
    this.play('glowSurgePowerup', { maxDelayMs: this.powerupMaxDelayMs });
  }

  private getOrCreateContext(): AudioContext | null {
    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextConstructor =
      globalThis.AudioContext ??
      (globalThis as unknown as { webkitAudioContext?: WebAudioConstructor }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    try {
      this.audioContext = new AudioContextConstructor();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.mobileMixMultiplier;
      this.masterGain.connect(this.audioContext.destination);
      this.audioContext.addEventListener('statechange', () => {
        this.logDebug('AudioContext state changed', { state: this.audioContext?.state });
      });
      return this.audioContext;
    } catch {
      return null;
    }
  }

  private preloadSounds(): void {
    if (this.isPreloading) {
      return;
    }

    this.isPreloading = true;
    void this.preloadSoundsSequentially();
  }

  private async preloadSoundsSequentially(): Promise<void> {
    await Promise.all(CRITICAL_SOUND_IDS.map((id) => this.loadSound(id)));

    for (const id of SOUND_LOAD_ORDER) {
      if (!this.isUnlocked) {
        return;
      }

      if (CRITICAL_SOUND_IDS.includes(id)) {
        continue;
      }

      await this.loadSound(id);
      await this.waitForNextPreloadStep();
    }
  }

  private waitForNextPreloadStep(): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, 16));
  }

  private waitForUnlockTimeout(): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, this.unlockTimeoutMs));
  }

  private detectFormatSupport(): void {
    try {
      const audio = new Audio();
      const m4aSupport =
        audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '' ||
        audio.canPlayType('audio/x-m4a') !== '' ||
        audio.canPlayType('audio/aac') !== '';
      const mp3Support = audio.canPlayType('audio/mpeg') !== '';

      this.formatSupport.set('m4a', m4aSupport);
      this.formatSupport.set('mp3', mp3Support);
      this.logDebug('audio format support detected', {
        m4a: m4aSupport,
        mp3: mp3Support,
      });
    } catch (error) {
      // If support probing itself fails, try both approved runtime formats and let decode decide.
      this.formatSupport.set('m4a', true);
      this.formatSupport.set('mp3', true);
      this.logDebug('audio format support probe failed; trying both runtime formats', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getPlayableSources(id: SoundId): readonly SoundSource[] {
    const supportedSources: SoundSource[] = [];
    const lastChanceSources: SoundSource[] = [];

    for (const source of SOUND_CONFIGS[id].sources) {
      const isSupported = this.formatSupport.get(source.format) ?? true;

      if (!isSupported) {
        this.logDebug('sound format skipped', {
          id,
          format: source.format,
          path: source.path,
          reason: 'canPlayType unsupported; keeping as decode fallback',
        });

        lastChanceSources.push(source);
        continue;
      }

      supportedSources.push(source);
    }

    const sources = [...supportedSources, ...lastChanceSources];

    if (sources.length === 0) {
      this.logDebug('sound skipped', {
        id,
        reason: 'no supported runtime formats',
      });
    }

    return sources;
  }

  private async loadSound(id: SoundId): Promise<void> {
    if (this.buffers.has(id) || this.unavailableSounds.has(id)) {
      return;
    }

    const existingLoad = this.loadingSounds.get(id);

    if (existingLoad) {
      return existingLoad;
    }

    const load = this.fetchAndDecodeSound(id);

    this.loadingSounds.set(id, load);
    await load;
  }

  private async fetchAndDecodeSound(id: SoundId): Promise<void> {
    const context = this.getOrCreateContext();

    if (!context) {
      this.unavailableSounds.add(id);
      return;
    }

    for (const source of this.getPlayableSources(id)) {
      try {
        this.logDebug('sound source selected', {
          id,
          format: source.format,
          path: source.path,
        });

        const response = await fetch(source.path);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        this.logDebug('sound fetch success', {
          id,
          format: source.format,
          path: source.path,
        });

        const soundData = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(soundData);

        this.buffers.set(id, buffer);
        this.decodedSources.set(id, source);
        this.loadingSounds.delete(id);
        this.logDebug('sound decoded', {
          id,
          format: source.format,
          path: source.path,
          duration: buffer.duration,
        });
        return;
      } catch (error) {
        this.logDebug('sound load path failed', {
          id,
          format: source.format,
          path: source.path,
          error: error instanceof Error ? error.message : String(error),
        });
        // Try the next approved runtime format. M4A is primary; MP3 is fallback.
      }
    }

    this.unavailableSounds.add(id);
    this.loadingSounds.delete(id);
    console.warn(`Sound could not be loaded: ${SOUND_CONFIGS[id].sources[0].path}`);
  }

  private play(id: SoundId, options: PlayOptions = {}): void {
    const requestedAtMs = options.requestedAtMs ?? performance.now();

    this.logDebug('sound requested', { id });

    if (!this.soundEnabled) {
      this.logDebug('sound skipped', { id, reason: 'sound disabled' });
      return;
    }

    if (this.unavailableSounds.has(id)) {
      this.logDebug('sound skipped', { id, reason: 'unavailable' });
      return;
    }

    const config = SOUND_CONFIGS[id];
    const now = performance.now() / 1000;

    if (this.isOnCooldown(id, now)) {
      this.logDebug('sound skipped', { id, reason: 'cooldown' });
      return;
    }

    if (options.maxDelayMs !== undefined && performance.now() - requestedAtMs > options.maxDelayMs) {
      this.logDebug('sound skipped', { id, reason: 'late start window expired' });
      return;
    }

    if (!this.isUnlocked) {
      this.queuePlayWhenReady(id, { ...options, requestedAtMs }, 'audio not unlocked');
      return;
    }

    if (!this.isAudioContextReady()) {
      this.queuePlayWhenReady(id, { ...options, requestedAtMs }, 'context not ready');
      return;
    }

    const buffer = this.buffers.get(id);

    if (!buffer) {
      this.queuePlayWhenReady(id, { ...options, requestedAtMs }, 'buffer not loaded');
      return;
    }

    this.playBuffer(id, buffer, config.volume);
  }

  private queuePlayWhenReady(id: SoundId, options: PlayOptions, reason: string): void {
    if (this.pendingPlays.has(id)) {
      this.logDebug('sound skipped', { id, reason: 'already pending load' });
      return;
    }

    const requestedAt = options.requestedAtMs ?? performance.now();
    this.pendingPlays.add(id);
    this.logDebug('sound waiting for ready state', {
      id,
      reason,
      contextState: this.audioContext?.state ?? 'missing',
    });

    void this.unlock().then(() => this.loadSound(id)).then(() => {
      this.pendingPlays.delete(id);

      if (!this.soundEnabled) {
        this.logDebug('pending sound skipped', { id, reason: 'sound disabled' });
        return;
      }

      if (!this.isAudioContextReady()) {
        this.logDebug('pending sound skipped', {
          id,
          reason: 'context suspended',
          contextState: this.audioContext?.state ?? 'missing',
        });
        return;
      }

      const buffer = this.buffers.get(id);

      if (!buffer) {
        this.logDebug('pending sound skipped', { id, reason: 'buffer unavailable' });
        return;
      }

      if (options.maxDelayMs !== undefined && performance.now() - requestedAt > options.maxDelayMs) {
        this.logDebug('pending sound skipped', { id, reason: 'late start window expired' });
        return;
      }

      this.playBuffer(id, buffer, SOUND_CONFIGS[id].volume);
    }).catch((error) => {
      this.pendingPlays.delete(id);
      this.logDebug('pending sound failed', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  private playBuffer(id: SoundId, buffer: AudioBuffer, volume: number, loop = false): ActivePlayback | null {
    const context = this.audioContext;
    const masterGain = this.masterGain;

    if (!context || !masterGain || context.state !== 'running') {
      this.logDebug('sound skipped', {
        id,
        reason: 'context not running',
        contextState: context?.state ?? 'missing',
      });
      return null;
    }

    if (!loop && !this.hasInstanceCapacity(id)) {
      this.logDebug('sound skipped', { id, reason: 'instance limit' });
      return null;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const playback = { source, gain };

    source.buffer = buffer;
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(masterGain);

    if (!loop) {
      this.trackOneShot(id, playback);
      this.lastPlayedAt.set(id, performance.now() / 1000);
    }

    try {
      source.start();
      this.logDebug('sound started', {
        id,
        mode: loop ? 'loop' : 'one-shot',
        source: this.decodedSources.get(id),
      });
      return playback;
    } catch (error) {
      if (!loop) {
        this.untrackOneShot(id, playback);
      }

      this.logDebug('sound failed to start', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private hasInstanceCapacity(id: SoundId): boolean {
    const maxInstances = SOUND_CONFIGS[id].maxInstances ?? 1;
    const activeSources = this.activeOneShotSources.get(id);

    return !activeSources || activeSources.size < maxInstances;
  }

  private trackOneShot(id: SoundId, playback: ActivePlayback): void {
    const activeSources = this.activeOneShotSources.get(id) ?? new Set<ActivePlayback>();

    activeSources.add(playback);
    this.activeOneShotSources.set(id, activeSources);
    playback.source.addEventListener('ended', () => {
      this.logDebug('sound ended', { id });
      this.untrackOneShot(id, playback);
    }, { once: true });
  }

  private untrackOneShot(id: SoundId, playback: ActivePlayback): void {
    const activeSources = this.activeOneShotSources.get(id);

    if (!activeSources) {
      return;
    }

    activeSources.delete(playback);
    this.disconnectPlayback(playback);

    if (activeSources.size === 0) {
      this.activeOneShotSources.delete(id);
    }
  }

  private stopOneShots(id: SoundId): void {
    this.pendingPlays.delete(id);
    const activeSources = this.activeOneShotSources.get(id);

    if (!activeSources) {
      return;
    }

    for (const playback of activeSources) {
      try {
        playback.source.stop();
      } catch {
        // Source may already be ending; clearing the set below keeps state tidy.
      }

      this.disconnectPlayback(playback);
    }

    activeSources.clear();
    this.activeOneShotSources.delete(id);
  }

  private startLoop(id: SoundId): void {
    if (!this.soundEnabled || this.activeLoops.has(id)) {
      return;
    }

    this.requestedLoops.add(id);

    if (!this.isUnlocked || !this.isAudioContextReady()) {
      this.logDebug('loop waiting for ready state', {
        id,
        contextState: this.audioContext?.state ?? 'missing',
      });
      void this.unlock().then(() => this.loadSound(id)).then(() => this.startLoadedLoop(id));
      return;
    }

    const buffer = this.buffers.get(id);

    if (!buffer) {
      void this.loadSound(id).then(() => this.startLoadedLoop(id));
      return;
    }

    this.startLoadedLoop(id);
  }

  private startLoadedLoop(id: SoundId): void {
    if (!this.requestedLoops.has(id) || this.activeLoops.has(id)) {
      return;
    }

    const buffer = this.buffers.get(id);

    if (!buffer) {
      return;
    }

    const playback = this.playBuffer(id, buffer, SOUND_CONFIGS[id].volume, true);

    if (playback) {
      this.activeLoops.set(id, playback);
    }
  }

  private stopLoop(id: SoundId): void {
    this.requestedLoops.delete(id);
    const playback = this.activeLoops.get(id);

    if (!playback) {
      return;
    }

    try {
      playback.source.stop();
    } catch {
      // The loop may have already stopped. Either way, remove our reference.
    }

    this.disconnectPlayback(playback);
    this.activeLoops.delete(id);
  }

  private isOnCooldown(id: SoundId, nowSeconds: number): boolean {
    const cooldownSeconds = SOUND_CONFIGS[id].cooldownSeconds;

    if (!cooldownSeconds) {
      return false;
    }

    const lastPlayedAt = this.lastPlayedAt.get(id) ?? Number.NEGATIVE_INFINITY;

    return nowSeconds - lastPlayedAt < cooldownSeconds;
  }

  private isAudioContextReady(): boolean {
    return this.audioContext?.state === 'running';
  }

  private prepareStartRunFallback(): void {
    const source = this.getPlayableSources('startRun')[0];

    if (!source) {
      this.startRunElement = null;
      this.logDebug('startRun HTMLAudio fallback unavailable', { reason: 'no supported format' });
      return;
    }

    try {
      this.startRunElement = new Audio(source.path);
      this.startRunFallbackRuntimeSource = source;
      this.startRunElement.preload = 'auto';
      this.startRunElement.volume = SOUND_CONFIGS.startRun.volume * this.mobileMixMultiplier;
      this.startRunElement.load();
      this.logDebug('startRun HTMLAudio fallback prepared', {
        format: source.format,
        path: source.path,
      });
    } catch (error) {
      this.startRunElement = null;
      this.startRunFallbackRuntimeSource = null;
      this.logDebug('startRun HTMLAudio fallback unavailable', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private playStartRunHtmlFallback(source: string, requestedAtMs: number): boolean {
    const element = this.startRunElement;

    if (!element) {
      this.logDebug('startRun HTMLAudio fallback skipped', { reason: 'missing element', source });
      return false;
    }

    try {
      element.pause();
      element.currentTime = 0;
      element.volume = SOUND_CONFIGS.startRun.volume * this.mobileMixMultiplier;
      this.lastPlayedAt.set('startRun', requestedAtMs / 1000);
      const playPromise = element.play() as Promise<void> | undefined;

      if (playPromise && typeof playPromise.then === 'function') {
        void playPromise
          .then(() => {
            this.logDebug('startRun played with HTMLAudio fallback', {
              source,
              runtimeSource: this.startRunFallbackRuntimeSource,
            });
          })
          .catch((error) => {
            this.lastPlayedAt.delete('startRun');
            this.logDebug('startRun HTMLAudio fallback failed', {
              source,
              error: error instanceof Error ? error.message : String(error),
            });
            this.playStartRun(requestedAtMs);
          });
      } else {
        this.logDebug('startRun HTMLAudio fallback started without a play promise', {
          source,
          runtimeSource: this.startRunFallbackRuntimeSource,
        });
      }

      return true;
    } catch (error) {
      this.lastPlayedAt.delete('startRun');
      this.logDebug('startRun HTMLAudio fallback threw', {
        source,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private disconnectPlayback(playback: ActivePlayback): void {
    try {
      playback.source.disconnect();
    } catch {
      // Already disconnected.
    }

    try {
      playback.gain.disconnect();
    } catch {
      // Already disconnected.
    }
  }

  private logDebug(message: string, details?: unknown): void {
    if (!this.debugEnabled) {
      return;
    }

    if (details === undefined) {
      console.debug(`[Audio] ${message}`);
      return;
    }

    console.debug(`[Audio] ${message}`, details);
  }
}
