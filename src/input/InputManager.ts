import type { GameState, MovementInput, Vector2, VirtualJoystickSnapshot } from '../game/types';

export class InputManager {
  private primaryPressed = false;
  private gameOverPressed = false;
  private pointerActive = false;
  private pointerTarget: Vector2 | null = null;
  private gameState: GameState = 'start';
  private joystickActive = false;
  private joystickPointerId: number | null = null;
  private joystickDirection: Vector2 = { x: 0, y: 0 };
  private joystickKnobOffset: Vector2 = { x: 0, y: 0 };
  // Joystick input is intentionally calmer than desktop controls for relaxed phone play.
  private readonly mobileJoystickSpeedMultiplier = 0.75;
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
    const keyboardDirection = this.getKeyboardDirection();
    const direction = this.joystickActive ? this.joystickDirection : keyboardDirection;

    return {
      direction,
      pointerTarget: this.joystickActive ? null : this.pointerTarget,
      pointerActive: this.joystickActive ? false : this.pointerActive,
    };
  }

  getVirtualJoystickSnapshot(): VirtualJoystickSnapshot | null {
    if (!this.shouldUseVirtualJoystick() || this.gameState !== 'playing') {
      return null;
    }

    const layout = this.getJoystickLayout();

    return {
      visible: true,
      active: this.joystickActive,
      baseX: layout.baseX,
      baseY: layout.baseY,
      baseRadius: layout.baseRadius,
      knobX: layout.baseX + this.joystickKnobOffset.x,
      knobY: layout.baseY + this.joystickKnobOffset.y,
      knobRadius: layout.knobRadius,
    };
  }

  setGameState(state: GameState): void {
    this.gameState = state;

    if (state !== 'playing') {
      this.resetJoystick();
    }
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
    this.resetJoystick();
    this.pressedKeys.clear();
  }

  private handlePrimaryPress = (event: PointerEvent) => {
    event.preventDefault();

    if (this.shouldStartJoystick(event)) {
      this.startJoystick(event);
      return;
    }

    this.primaryPressed = true;
    this.pointerActive = true;
    this.pointerTarget = this.getPointerPosition(event);

    if (this.target.hasPointerCapture(event.pointerId) === false) {
      this.target.setPointerCapture(event.pointerId);
    }
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (this.joystickActive && event.pointerId === this.joystickPointerId) {
      event.preventDefault();
      this.updateJoystick(event);
      return;
    }

    if (!this.pointerActive) {
      return;
    }

    event.preventDefault();
    this.pointerTarget = this.getPointerPosition(event);
  };

  private handlePointerEnd = (event: PointerEvent) => {
    if (this.joystickActive && event.pointerId === this.joystickPointerId) {
      this.resetJoystick();
      return;
    }

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

  private shouldStartJoystick(event: PointerEvent): boolean {
    return (
      this.gameState === 'playing' &&
      event.pointerType !== 'mouse' &&
      this.shouldUseVirtualJoystick() &&
      this.isInsideJoystickTouchZone(event)
    );
  }

  private startJoystick(event: PointerEvent): void {
    this.primaryPressed = false;
    this.pointerActive = false;
    this.pointerTarget = null;
    this.joystickActive = true;
    this.joystickPointerId = event.pointerId;
    this.updateJoystick(event);

    if (this.target.hasPointerCapture(event.pointerId) === false) {
      this.target.setPointerCapture(event.pointerId);
    }
  }

  private updateJoystick(event: PointerEvent): void {
    const rect = this.target.getBoundingClientRect();
    const layout = this.getJoystickLayout();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const dx = localX - layout.baseX;
    const dy = localY - layout.baseY;
    const distance = Math.hypot(dx, dy);
    const maxKnobDistance = layout.baseRadius * 0.68;
    const clampedDistance = Math.min(distance, maxKnobDistance);
    const normalizedStrength = maxKnobDistance === 0 ? 0 : clampedDistance / maxKnobDistance;
    const directionX = distance === 0 ? 0 : dx / distance;
    const directionY = distance === 0 ? 0 : dy / distance;

    this.joystickKnobOffset = {
      x: directionX * clampedDistance,
      y: directionY * clampedDistance,
    };
    this.joystickDirection = {
      x: directionX * normalizedStrength * this.mobileJoystickSpeedMultiplier,
      y: directionY * normalizedStrength * this.mobileJoystickSpeedMultiplier,
    };
  }

  private resetJoystick(): void {
    this.joystickActive = false;
    this.joystickPointerId = null;
    this.joystickDirection = { x: 0, y: 0 };
    this.joystickKnobOffset = { x: 0, y: 0 };
  }

  private isInsideJoystickTouchZone(event: PointerEvent): boolean {
    const rect = this.target.getBoundingClientRect();
    const layout = this.getJoystickLayout();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const distanceFromBase = Math.hypot(localX - layout.baseX, localY - layout.baseY);

    return (
      distanceFromBase <= layout.baseRadius * 2.1 ||
      (localX <= rect.width * 0.48 && localY >= rect.height * 0.42)
    );
  }

  private getJoystickLayout() {
    const width = Math.max(1, this.target.clientWidth);
    const height = Math.max(1, this.target.clientHeight);
    const shortSide = Math.min(width, height);
    const baseRadius = Math.max(42, Math.min(58, shortSide * 0.12));

    return {
      baseX: baseRadius + Math.max(18, width * 0.035),
      baseY: height - baseRadius - Math.max(18, height * 0.045),
      baseRadius,
      knobRadius: baseRadius * 0.38,
    };
  }

  private shouldUseVirtualJoystick(): boolean {
    const width = Math.max(1, this.target.clientWidth);
    const height = Math.max(1, this.target.clientHeight);
    const shortSide = Math.min(width, height);

    // Canvas dimensions drive this profile so it works for mobile browsers and narrow test viewports.
    return width <= 600 || shortSide <= 500;
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
