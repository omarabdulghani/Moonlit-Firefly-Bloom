import type { CanvasSize, MoonShieldPowerupSnapshot, Vector2 } from './types';

export type MoonShieldSpawnAvoidPoint = Vector2 & {
  safeDistance: number;
};

export class MoonShieldPowerup {
  x = 0;
  y = 0;
  active = false;
  private pulseTime = Math.random() * Math.PI * 2;

  constructor(readonly radius: number) {}

  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    this.pulseTime += deltaTime;
  }

  spawn(bounds: CanvasSize, avoidPoints: MoonShieldSpawnAvoidPoint[]): void {
    const padding = this.radius + 34;
    const minX = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const minY = Math.min(Math.max(78, padding), bounds.height / 2);
    const maxY = Math.max(minY, bounds.height - padding - 44);

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = {
        x: this.randomBetween(minX, maxX),
        y: this.randomBetween(minY, maxY),
      };

      if (this.isSafeSpawn(candidate, avoidPoints)) {
        this.placeAt(candidate);
        return;
      }
    }

    this.placeAt({
      x: this.randomBetween(minX, maxX),
      y: this.randomBetween(minY, maxY),
    });
  }

  despawn(): void {
    this.active = false;
  }

  getSnapshot(): MoonShieldPowerupSnapshot | null {
    if (!this.active) {
      return null;
    }

    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
      pulseScale: 1 + Math.sin(this.pulseTime * 3.6) * 0.08,
    };
  }

  private placeAt(position: Vector2): void {
    this.x = position.x;
    this.y = position.y;
    this.active = true;
    this.pulseTime = Math.random() * Math.PI * 2;
  }

  private isSafeSpawn(candidate: Vector2, avoidPoints: MoonShieldSpawnAvoidPoint[]): boolean {
    return avoidPoints.every((point) => this.distanceBetween(candidate, point) > point.safeDistance);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private distanceBetween(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
