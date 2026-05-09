export type GameState = 'start' | 'playing' | 'gameOver';

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

export type MoonShieldPowerupSnapshot = {
  x: number;
  y: number;
  radius: number;
  pulseScale: number;
};

export type RenderSnapshot = {
  state: GameState;
  elapsedTime: number;
  score: number;
  bestScore: number;
  orbsCollected: number;
  bloomBursts: number;
  nightLevel: number;
  highestNightLevel: number;
  levelUpMessageProgress: number;
  glow: number;
  maxGlow: number;
  collectPulse: number;
  shadowHitFlash: number;
  isTouchingShadow: boolean;
  moonShieldRemaining: number;
  moonShieldDuration: number;
  bloomBurst: BloomBurstSnapshot | null;
  moonShieldPowerup: MoonShieldPowerupSnapshot | null;
  firefly: FireflySnapshot | null;
  moonlightOrbs: MoonlightOrbSnapshot[];
  shadowHazards: ShadowHazardSnapshot[];
};
