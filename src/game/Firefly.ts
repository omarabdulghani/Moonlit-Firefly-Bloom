import type { CanvasSize, FireflySnapshot, MovementInput } from './types';

export class Firefly {
  x = 0;
  y = 0;
  velocityX = 0;
  velocityY = 0;
  readonly radius = 9;
  readonly movementSpeed = 230;
  private readonly acceleration = 8.5;
  private readonly damping = 5.2;

  reset(bounds: CanvasSize): void {
    this.x = bounds.width / 2;
    this.y = bounds.height / 2;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  update(deltaTime: number, input: MovementInput, bounds: CanvasSize, speedMultiplier = 1): void {
    const targetVelocity = this.getTargetVelocity(input, speedMultiplier);
    const hasInput = targetVelocity.x !== 0 || targetVelocity.y !== 0;
    const response = hasInput ? this.acceleration : this.damping;
    const blend = 1 - Math.exp(-response * deltaTime);

    this.velocityX += (targetVelocity.x - this.velocityX) * blend;
    this.velocityY += (targetVelocity.y - this.velocityY) * blend;

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    this.keepInside(bounds);
  }

  getSnapshot(): FireflySnapshot {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  private getTargetVelocity(input: MovementInput, speedMultiplier: number) {
    const movementSpeed = this.movementSpeed * speedMultiplier;

    if (input.pointerActive && input.pointerTarget) {
      const dx = input.pointerTarget.x - this.x;
      const dy = input.pointerTarget.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 4) {
        return { x: 0, y: 0 };
      }

      const arriveSpeed = Math.min(movementSpeed, distance * 4 * speedMultiplier);
      return {
        x: (dx / distance) * arriveSpeed,
        y: (dy / distance) * arriveSpeed,
      };
    }

    return {
      x: input.direction.x * movementSpeed,
      y: input.direction.y * movementSpeed,
    };
  }

  private keepInside(bounds: CanvasSize): void {
    const padding = this.radius + 4;
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, bounds.width - padding);
    const maxY = Math.max(minY, bounds.height - padding);

    if (this.x < minX) {
      this.x = minX;
      this.velocityX = 0;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.velocityX = 0;
    }

    if (this.y < minY) {
      this.y = minY;
      this.velocityY = 0;
    } else if (this.y > maxY) {
      this.y = maxY;
      this.velocityY = 0;
    }
  }
}
