import type { MovementInput, Vector2 } from '../game/types';

export class InputManager {
  private primaryPressed = false;
  private gameOverPressed = false;
  private pointerActive = false;
  private pointerTarget: Vector2 | null = null;
  // Touch targets sit slightly above the finger so the tiny firefly stays visible on phones.
  private readonly touchTargetYOffset = -44;
  private readonly pressedKeys = new Set<string>();

  constructor(private readonly target: HTMLElement) {
    target.addEventListener('pointerdown', this.handlePrimaryPress);
    target.addEventListener('pointermove', this.handlePointerMove);
    target.addEventListener('pointerup', this.handlePointerEnd);
    target.addEventListener('pointercancel', this.handlePointerEnd);
    target.addEventListener('lostpointercapture', this.handlePointerEnd);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  consumePrimaryPress(): boolean {
    const wasPressed = this.primaryPressed;
    this.primaryPressed = false;
    return wasPressed;
  }

  consumeGameOverPress(): boolean {
    const wasPressed = this.gameOverPressed;
    this.gameOverPressed = false;
    return wasPressed;
  }

  getMovementInput(): MovementInput {
    const direction = this.getKeyboardDirection();

    return {
      direction,
      pointerTarget: this.pointerTarget,
      pointerActive: this.pointerActive,
    };
  }

  clearPointer(): void {
    this.pointerActive = false;
    this.pointerTarget = null;
  }

  clearInput(): void {
    this.primaryPressed = false;
    this.gameOverPressed = false;
    this.pointerActive = false;
    this.pointerTarget = null;
    this.pressedKeys.clear();
  }

  private handlePrimaryPress = (event: PointerEvent) => {
    event.preventDefault();
    this.primaryPressed = true;
    this.pointerActive = true;
    this.pointerTarget = this.getPointerPosition(event);

    if (this.target.hasPointerCapture(event.pointerId) === false) {
      this.target.setPointerCapture(event.pointerId);
    }
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.pointerActive) {
      return;
    }

    event.preventDefault();
    this.pointerTarget = this.getPointerPosition(event);
  };

  private handlePointerEnd = () => {
    this.pointerActive = false;
    this.pointerTarget = null;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (event.key.toLowerCase() === 'g') {
      this.gameOverPressed = true;
    }

    if (this.isMovementKey(key)) {
      event.preventDefault();
      this.pressedKeys.add(key);
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (this.isMovementKey(key)) {
      event.preventDefault();
      this.pressedKeys.delete(key);
    }
  };

  private getKeyboardDirection(): Vector2 {
    let x = 0;
    let y = 0;

    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) {
      x -= 1;
    }

    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) {
      x += 1;
    }

    if (this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')) {
      y -= 1;
    }

    if (this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')) {
      y += 1;
    }

    const length = Math.hypot(x, y);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: x / length,
      y: y / length,
    };
  }

  private getPointerPosition(event: PointerEvent): Vector2 {
    const rect = this.target.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top + (event.pointerType === 'touch' ? this.touchTargetYOffset : 0);

    return {
      x: (Math.max(0, Math.min(width, localX)) / width) * this.target.clientWidth,
      y: (Math.max(0, Math.min(height, localY)) / height) * this.target.clientHeight,
    };
  }

  private isMovementKey(key: string): boolean {
    return (
      key === 'w' ||
      key === 'a' ||
      key === 's' ||
      key === 'd' ||
      key === 'arrowup' ||
      key === 'arrowleft' ||
      key === 'arrowdown' ||
      key === 'arrowright'
    );
  };
}
