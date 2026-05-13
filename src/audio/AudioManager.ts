import type { MoonPhaseName } from '../game/types';

type SoundId =
  | 'bloomBurst'
  | 'gameOver'
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
  | 'startRun';

type SoundConfig = {
  path: string;
  volume: number;
  cooldownSeconds?: number;
  loop?: boolean;
};

const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
  bloomBurst: {
    path: '/sounds/bloom-burst.wav',
    volume: 0.65,
  },
  gameOver: {
    path: '/sounds/game-over-glow-faded.wav',
    volume: 0.6,
  },
  lowGlowWarning: {
    path: '/sounds/low-glow-warning.wav',
    volume: 0.35,
    cooldownSeconds: 4,
  },
  moonPhaseCrescent: {
    path: '/sounds/moon-phase-crescent.wav',
    volume: 0.35,
  },
  moonPhaseFull: {
    path: '/sounds/moon-phase-full.wav',
    volume: 0.35,
  },
  moonPhaseGibbous: {
    path: '/sounds/moon-phase-gibbous.wav',
    volume: 0.35,
  },
  moonPhaseNew: {
    path: '/sounds/moon-phase-new.wav',
    volume: 0.35,
  },
  moonPhaseQuarter: {
    path: '/sounds/moon-phase-quarter.wav',
    volume: 0.35,
  },
  moonRainAmbience: {
    path: '/sounds/moon-rain-ambience-loop.wav',
    volume: 0.22,
    loop: true,
  },
  moonRainBegin: {
    path: '/sounds/moon-rain-begins.wav',
    volume: 0.65,
  },
  moonRainEnd: {
    path: '/sounds/moon-rain-ends.wav',
    volume: 0.5,
  },
  moonShield: {
    path: '/sounds/moon-shield-appears.wav',
    volume: 0.55,
  },
  orbCollect: {
    path: '/sounds/orb-collect.wav',
    volume: 0.35,
    cooldownSeconds: 0.06,
  },
  shadowDamage: {
    path: '/sounds/shadow-damage.wav',
    volume: 0.45,
    cooldownSeconds: 0.75,
  },
  startRun: {
    path: '/sounds/start-run.wav',
    volume: 0.55,
  },
};

export class AudioManager {
  // Kept as a simple code flag for now so a future mute toggle can wire into it.
  soundEnabled = true;

  private readonly sounds = new Map<SoundId, HTMLAudioElement>();
  private readonly unavailableSounds = new Set<SoundId>();
  private readonly lastPlayedAt = new Map<SoundId, number>();
  private isUnlocked = false;

  constructor() {
    for (const [id, config] of Object.entries(SOUND_CONFIGS) as [SoundId, SoundConfig][]) {
      this.sounds.set(id, this.createAudioElement(id, config));
    }
  }

  async unlock(): Promise<void> {
    if (this.isUnlocked) {
      return;
    }

    this.isUnlocked = true;

    for (const sound of this.sounds.values()) {
      sound.load();
    }

    const primer = this.sounds.get('startRun');

    if (!primer || this.unavailableSounds.has('startRun')) {
      return;
    }

    const wasMuted = primer.muted;

    try {
      primer.muted = true;
      primer.currentTime = 0;
      await primer.play();
      primer.pause();
      primer.currentTime = 0;
    } catch {
      // Some browsers still reject the primer play. Later event sounds can fail silently too.
    } finally {
      primer.muted = wasMuted;
    }
  }

  playStartRun(): void {
    this.play('startRun');
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
    this.play('moonShield');
  }

  private createAudioElement(id: SoundId, config: SoundConfig): HTMLAudioElement {
    const audio = new Audio(config.path);

    audio.preload = 'auto';
    audio.volume = config.volume;
    audio.loop = Boolean(config.loop);
    audio.addEventListener('error', () => {
      if (this.unavailableSounds.has(id)) {
        return;
      }

      this.unavailableSounds.add(id);
      console.warn(`Sound could not be loaded: ${config.path}`);
    });

    return audio;
  }

  private play(id: SoundId): void {
    if (!this.soundEnabled || !this.isUnlocked || this.unavailableSounds.has(id)) {
      return;
    }

    const config = SOUND_CONFIGS[id];
    const now = performance.now() / 1000;
    const lastPlayedAt = this.lastPlayedAt.get(id) ?? Number.NEGATIVE_INFINITY;

    if (config.cooldownSeconds && now - lastPlayedAt < config.cooldownSeconds) {
      return;
    }

    const source = this.sounds.get(id);

    if (!source) {
      return;
    }

    this.lastPlayedAt.set(id, now);

    const sound = source.cloneNode(true) as HTMLAudioElement;
    sound.loop = false;
    sound.volume = config.volume;
    sound.play().catch(() => {
      // Audio feedback should never interrupt gameplay if the browser blocks playback.
    });
  }

  private startLoop(id: SoundId): void {
    if (!this.soundEnabled || !this.isUnlocked || this.unavailableSounds.has(id)) {
      return;
    }

    const config = SOUND_CONFIGS[id];
    const sound = this.sounds.get(id);

    if (!sound) {
      return;
    }

    sound.loop = true;
    sound.volume = config.volume;
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Looped ambience is optional feedback; gameplay continues if playback is blocked.
    });
  }

  private stopLoop(id: SoundId): void {
    const sound = this.sounds.get(id);

    if (!sound) {
      return;
    }

    sound.pause();
    sound.currentTime = 0;
  }
}
