import type { CanvasSize, MoonlightOrbSnapshot, Vector2 } from './types';

export class MoonlightOrb {
  x = 0;
  y = 0;
  // Collision stays forgiving while the rendered orb is kept smaller.
  readonly radius = 13;
  private readonly visualRadius = 9;
  readonly value = 100;
  private pulseTime = Math.random() * Math.PI * 2;

  constructor(bounds: CanvasSize, avoidPoint: Vector2) {
    this.respawn(bounds, avoidPoint);
  }

  update(deltaTime: number): void {
    this.pulseTime += deltaTime;
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
        return;
      }
    }

    this.x = this.randomBetween(minX, maxX);
    this.y = this.randomBetween(minY, maxY);
  }

  getSnapshot(): MoonlightOrbSnapshot {
    return {
      x: this.x,
      y: this.y,
      radius: this.visualRadius,
      pulseScale: 1 + Math.sin(this.pulseTime * 3) * 0.08,
    };
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private distanceBetween(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
