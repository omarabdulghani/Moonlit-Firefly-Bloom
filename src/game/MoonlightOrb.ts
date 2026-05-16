import type { CanvasSize, MoonlightOrbSnapshot, Vector2 } from './types';

export type MoonlightOrbSpawnAvoidPoint = Vector2 & {
  safeDistance: number;
};

export type MoonlightOrbSpawnOptions = {
  avoidPoints: MoonlightOrbSpawnAvoidPoint[];
  minDistanceFromFirefly: number;
  maxPreferredDistanceFromFirefly: number;
};

export class MoonlightOrb {
  x = 0;
  y = 0;
  // Collision stays forgiving while the rendered orb is kept smaller.
  readonly radius = 13;
  private readonly visualRadius = 9;
  readonly value = 100;
  private age = 0;
  private pulseTime = Math.random() * Math.PI * 2;

  constructor(
    bounds: CanvasSize,
    fireflyPosition: Vector2,
    private readonly lifetimeSeconds: number,
    spawnOptions: MoonlightOrbSpawnOptions,
  ) {
    this.respawn(bounds, fireflyPosition, spawnOptions);
  }

  update(deltaTime: number): void {
    this.age += deltaTime;
    this.pulseTime += deltaTime;
  }

  isExpired(): boolean {
    return this.age >= this.lifetimeSeconds;
  }

  respawn(bounds: CanvasSize, fireflyPosition: Vector2, spawnOptions: MoonlightOrbSpawnOptions): void {
    const padding = this.radius + 28;
    const minX = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const minY = Math.min(Math.max(72, padding), bounds.height / 2);
    const maxY = Math.max(minY, bounds.height - padding - 42);

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const candidate = this.getRandomCandidate(minX, maxX, minY, maxY);

      if (this.isSafeCandidate(candidate, fireflyPosition, spawnOptions, true)) {
        this.placeAt(candidate);
        return;
      }
    }

    for (let attempt = 0; attempt < 28; attempt += 1) {
      const candidate = this.getRandomCandidate(minX, maxX, minY, maxY);

      if (this.isSafeCandidate(candidate, fireflyPosition, spawnOptions, false)) {
        this.placeAt(candidate);
        return;
      }
    }

    this.placeAt(this.getRandomCandidate(minX, maxX, minY, maxY));
  }

  private getRandomCandidate(minX: number, maxX: number, minY: number, maxY: number): Vector2 {
    return {
      x: this.randomBetween(minX, maxX),
      y: this.randomBetween(minY, maxY),
    };
  }

  private isSafeCandidate(
    candidate: Vector2,
    fireflyPosition: Vector2,
    spawnOptions: MoonlightOrbSpawnOptions,
    respectPreferredMaxDistance: boolean,
  ): boolean {
    const fireflyDistance = this.distanceBetween(candidate, fireflyPosition);

    if (fireflyDistance < spawnOptions.minDistanceFromFirefly) {
      return false;
    }

    if (
      respectPreferredMaxDistance &&
      fireflyDistance > spawnOptions.maxPreferredDistanceFromFirefly
    ) {
      return false;
    }

    return spawnOptions.avoidPoints.every(
      (point) => this.distanceBetween(candidate, point) > point.safeDistance,
    );
  }

  private placeAt(position: Vector2): void {
    this.x = position.x;
    this.y = position.y;
    this.resetLifetime();
  }

  getSnapshot(): MoonlightOrbSnapshot {
    const remainingSeconds = Math.max(0, this.lifetimeSeconds - this.age);
    const endingSoonRatio = remainingSeconds < 3 ? 1 - remainingSeconds / 3 : 0;

    return {
      x: this.x,
      y: this.y,
      radius: this.visualRadius,
      pulseScale: 1 + Math.sin(this.pulseTime * (3 + endingSoonRatio * 2.2)) * (0.08 + endingSoonRatio * 0.04),
      fadeAlpha: remainingSeconds < 3 ? 0.58 + (remainingSeconds / 3) * 0.42 : 1,
    };
  }

  private resetLifetime(): void {
    this.age = 0;
    this.pulseTime = Math.random() * Math.PI * 2;
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private distanceBetween(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
