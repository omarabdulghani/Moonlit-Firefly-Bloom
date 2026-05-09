import type { CanvasSize, ShadowHazardSnapshot, Vector2 } from './types';

export class ShadowHazard {
  // Shadow size range keeps hazards readable without filling the whole arena.
  private static readonly shadowMinRadius = 28;
  private static readonly shadowMaxRadius = 55;
  // Damage is glow lost per second while the firefly overlaps a shadow.
  private static readonly shadowDamagePerSecond = 25;
  // Drift speed range keeps shadows alive but slow enough to react to.
  private static readonly shadowMinDriftSpeed = 10;
  private static readonly shadowMaxDriftSpeed = 22;

  x = 0;
  y = 0;
  velocityX = 0;
  velocityY = 0;
  readonly radius: number;
  readonly damagePerSecond: number;

  constructor(bounds: CanvasSize, avoidPoints: Vector2[]) {
    this.radius = this.randomBetween(
      ShadowHazard.shadowMinRadius,
      ShadowHazard.shadowMaxRadius,
    );
    this.damagePerSecond = ShadowHazard.shadowDamagePerSecond;
    this.reset(bounds, avoidPoints);
  }

  update(deltaTime: number, bounds: CanvasSize, speedMultiplier: number): void {
    this.x += this.velocityX * speedMultiplier * deltaTime;
    this.y += this.velocityY * speedMultiplier * deltaTime;
    this.keepInside(bounds);
  }

  pushAwayFrom(origin: Vector2, burstRadius: number, pushStrength: number, bounds: CanvasSize): void {
    const dx = this.x - origin.x;
    const dy = this.y - origin.y;
    const distance = Math.hypot(dx, dy);

    if (distance > burstRadius) {
      return;
    }

    const directionX = distance === 0 ? 1 : dx / distance;
    const directionY = distance === 0 ? 0 : dy / distance;
    const influence = 1 - distance / burstRadius;
    const pushDistance = pushStrength * influence;

    this.x += directionX * pushDistance;
    this.y += directionY * pushDistance;
    this.velocityX += directionX * pushDistance * 0.45;
    this.velocityY += directionY * pushDistance * 0.45;
    this.limitBurstSpeed();
    this.keepInside(bounds);
  }

  getSnapshot(): ShadowHazardSnapshot {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  private reset(bounds: CanvasSize, avoidPoints: Vector2[]): void {
    const padding = this.radius + 24;
    const minX = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const minY = Math.min(Math.max(82, padding), bounds.height / 2);
    const maxY = Math.max(minY, bounds.height - padding - 38);

    for (let attempt = 0; attempt < 32; attempt += 1) {
      const candidate = {
        x: this.randomBetween(minX, maxX),
        y: this.randomBetween(minY, maxY),
      };

      if (this.isFarEnoughFromAvoidPoints(candidate, avoidPoints)) {
        this.x = candidate.x;
        this.y = candidate.y;
        this.setDriftVelocity();
        return;
      }
    }

    this.x = this.randomBetween(minX, maxX);
    this.y = this.randomBetween(minY, maxY);
    this.setDriftVelocity();
  }

  private keepInside(bounds: CanvasSize): void {
    const padding = this.radius + 12;
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const maxY = Math.max(minY, bounds.height - padding);

    if (this.x < minX) {
      this.x = minX;
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.x > maxX) {
      this.x = maxX;
      this.velocityX = -Math.abs(this.velocityX);
    }

    if (this.y < minY) {
      this.y = minY;
      this.velocityY = Math.abs(this.velocityY);
    } else if (this.y > maxY) {
      this.y = maxY;
      this.velocityY = -Math.abs(this.velocityY);
    }
  }

  private setDriftVelocity(): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = this.randomBetween(
      ShadowHazard.shadowMinDriftSpeed,
      ShadowHazard.shadowMaxDriftSpeed,
    );

    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
  }

  private limitBurstSpeed(): void {
    const maxBurstSpeed = 44;
    const speed = Math.hypot(this.velocityX, this.velocityY);

    if (speed <= maxBurstSpeed) {
      return;
    }

    this.velocityX = (this.velocityX / speed) * maxBurstSpeed;
    this.velocityY = (this.velocityY / speed) * maxBurstSpeed;
  }

  private isFarEnoughFromAvoidPoints(candidate: Vector2, avoidPoints: Vector2[]): boolean {
    return avoidPoints.every((point) => this.distanceBetween(candidate, point) > this.radius + 92);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private distanceBetween(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
