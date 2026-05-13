import type { CanvasSize, PowerupSnapshot, PowerupType, Vector2 } from './types';

export type PowerupSpawnAvoidPoint = Vector2 & {
  safeDistance: number;
};

export class Powerup {
  x = 0;
  y = 0;
  age = 0;
  active = false;
  private pulseTime = Math.random() * Math.PI * 2;

  constructor(
    readonly type: PowerupType,
    readonly radius: number,
    private readonly lifetimeSeconds: number,
  ) {}

  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    this.age += deltaTime;
    this.pulseTime += deltaTime;

    if (this.age >= this.lifetimeSeconds) {
      this.despawn();
    }
  }

  spawn(bounds: CanvasSize, avoidPoints: PowerupSpawnAvoidPoint[]): void {
    const padding = this.radius + 36;
    const minX = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const minY = Math.min(Math.max(78, padding), bounds.height / 2);
    const maxY = Math.max(minY, bounds.height - padding - 44);

    for (let attempt = 0; attempt < 36; attempt += 1) {
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
    this.age = 0;
  }

  getSnapshot(): PowerupSnapshot | null {
    if (!this.active) {
      return null;
    }

    const remainingSeconds = Math.max(0, this.lifetimeSeconds - this.age);
    const fadeAlpha = remainingSeconds < 2 ? 0.42 + (remainingSeconds / 2) * 0.58 : 1;

    return {
      type: this.type,
      x: this.x,
      y: this.y,
      radius: this.radius,
      pulseScale: 1 + Math.sin(this.pulseTime * 4) * 0.08,
      fadeAlpha,
    };
  }

  private placeAt(position: Vector2): void {
    this.x = position.x;
    this.y = position.y;
    this.age = 0;
    this.active = true;
    this.pulseTime = Math.random() * Math.PI * 2;
  }

  private isSafeSpawn(candidate: Vector2, avoidPoints: PowerupSpawnAvoidPoint[]): boolean {
    return avoidPoints.every((point) => this.distanceBetween(candidate, point) > point.safeDistance);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private distanceBetween(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
