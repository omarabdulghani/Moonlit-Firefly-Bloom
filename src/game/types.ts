export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export type CanvasSize = {
  width: number;
  height: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

export type MovementInput = {
  direction: Vector2;
  pointerTarget: Vector2 | null;
  pointerActive: boolean;
};

export type FireflySnapshot = {
  x: number;
  y: number;
  radius: number;
};

export type MoonlightOrbSnapshot = {
  x: number;
  y: number;
  radius: number;
  pulseScale: number;
  fadeAlpha: number;
};

export type ShadowHazardSnapshot = {
  x: number;
  y: number;
  radius: number;
};

export type BloomBurstSnapshot = {
  x: number;
  y: number;
  progress: number;
  radius: number;
};

export type GlowSurgeRewardSnapshot = {
  x: number;
  y: number;
  progress: number;
  feedsBloom: boolean;
};

export type MoonShieldPowerupSnapshot = {
  x: number;
  y: number;
  radius: number;
  pulseScale: number;
};

export type PowerupType = 'moonDash' | 'glowSurge';

export type PowerupSnapshot = {
  type: PowerupType;
  x: number;
  y: number;
  radius: number;
  pulseScale: number;
  fadeAlpha: number;
};

export type MoonRainMessage = 'start' | 'end' | null;

export type HudMessageKind = 'moonShield' | 'moonDash' | 'glowSurge';

export type TemporaryHudMessageSnapshot = {
  text: string;
  kind: HudMessageKind;
  progress: number;
};

export type RenderSnapshot = {
  state: GameState;
  elapsedTime: number;
  score: number;
  bestScore: number;
  orbsCollected: number;
  bloomBursts: number;
  fullMoonTrialsSurvived: number;
  nightLevel: number;
  highestNightLevel: number;
  levelUpMessageProgress: number;
  previousMoonPhaseIndex: number;
  moonPhaseIndex: number;
  moonPhaseName: MoonPhaseName;
  moonPhaseTransitionProgress: number;
  moonPhaseMessageProgress: number;
  isMoonRainActive: boolean;
  moonRainProgress: number;
  moonRainMessage: MoonRainMessage;
  moonRainMessageProgress: number;
  glow: number;
  maxGlow: number;
  collectPulse: number;
  shadowHitFlash: number;
  isTouchingShadow: boolean;
  moonShieldRemaining: number;
  moonShieldDuration: number;
  moonDashRemaining: number;
  moonDashDuration: number;
  temporaryHudMessage: TemporaryHudMessageSnapshot | null;
  bloomBurst: BloomBurstSnapshot | null;
  glowSurgeReward: GlowSurgeRewardSnapshot | null;
  moonShieldPowerup: MoonShieldPowerupSnapshot | null;
  powerups: PowerupSnapshot[];
  firefly: FireflySnapshot | null;
  moonlightOrbs: MoonlightOrbSnapshot[];
  shadowHazards: ShadowHazardSnapshot[];
};
