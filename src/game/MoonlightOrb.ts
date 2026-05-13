import type { CanvasSize, MoonlightOrbSnapshot, Vector2 } from './types';

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
    avoidPoint: Vector2,
    private readonly lifetimeSeconds: number,
  ) {
    this.respawn(bounds, avoidPoint);
  }

  update(deltaTime: number): void {
    this.age += deltaTime;
    this.pulseTime += deltaTime;
  }

  isExpired(): boolean {
    return this.age >= this.lifetimeSeconds;
  }

  respawn(bounds: CanvasSize, avoidPoint: Vector2): void {
    const padding = this.radius + 28;
    const minX = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const minY = Math.min(Math.max(72, padding), bounds.height / 2);
    const maxY = Math.max(minY, bounds.height - padding - 42);

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const candidate = {
        x: this.randomBetween(minX, maxX),
        y: this.randomBetween(minY, maxY),
      };

      if (this.distanceBetween(candidate, avoidPoint) > 120) {
        this.x = candidate.x;
        this.y = candidate.y;
        this.resetLifetime();
        return;
      }
    }

    this.x = this.randomBetween(minX, maxX);
    this.y = this.randomBetween(minY, maxY);
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
