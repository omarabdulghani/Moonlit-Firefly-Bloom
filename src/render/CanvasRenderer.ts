import type { CanvasSize, RenderSnapshot } from '../game/types';

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private size: CanvasSize = { width: 0, height: 0 };
  // Firefly aura tuning: glow level and collection pulses nudge the aura without becoming flashy.
  private readonly fireflyBaseAuraRadius = 4.4;
  private readonly fireflyAuraGlowFactor = 1.35;
  private readonly fireflyCollectPulseStrength = 0.42;
  private readonly fireflyShadowDimFactor = 0.68;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create a 2D canvas context.');
    }

    this.context = context;
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));
    const safeRatio = Math.max(1, devicePixelRatio);

    this.size = { width: safeWidth, height: safeHeight };
    this.canvas.width = Math.floor(safeWidth * safeRatio);
    this.canvas.height = Math.floor(safeHeight * safeRatio);
    this.canvas.style.width = `${safeWidth}px`;
    this.canvas.style.height = `${safeHeight}px`;
    this.context.setTransform(safeRatio, 0, 0, safeRatio, 0, 0);
  }

  getSize(): CanvasSize {
    return { ...this.size };
  }

  render(snapshot: RenderSnapshot): void {
    this.clear();
    this.drawMoonlitGarden();

    for (const hazard of snapshot.shadowHazards) {
      this.drawShadowHazard(hazard.x, hazard.y, hazard.radius);
    }

    for (const orb of snapshot.moonlightOrbs) {
      this.drawMoonlightOrb(orb.x, orb.y, orb.radius, orb.pulseScale);
    }

    if (snapshot.firefly) {
      this.drawFirefly(
        snapshot.firefly.x,
        snapshot.firefly.y,
        snapshot.firefly.radius,
        snapshot.elapsedTime,
        snapshot.glow,
        snapshot.maxGlow,
        snapshot.collectPulse,
        snapshot.isTouchingShadow,
      );
    }

    this.drawStateText(snapshot);
  }

  private clear(): void {
    this.context.clearRect(0, 0, this.size.width, this.size.height);
  }

  private drawMoonlitGarden(): void {
    const { width, height } = this.size;
    const ctx = this.context;

    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#071225');
    skyGradient.addColorStop(0.65, '#09101d');
    skyGradient.addColorStop(1, '#050712');

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const moonRadius = Math.max(34, Math.min(width, height) * 0.08);
    const moonX = width * 0.78;
    const moonY = height * 0.18;

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 2.6);
    moonGlow.addColorStop(0, 'rgba(246, 233, 177, 0.34)');
    moonGlow.addColorStop(0.48, 'rgba(187, 214, 255, 0.12)');
    moonGlow.addColorStop(1, 'rgba(187, 214, 255, 0)');

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5e9b8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    const ledgeHeight = Math.max(56, height * 0.13);
    const ledgeY = height - ledgeHeight;
    const ledgeGradient = ctx.createLinearGradient(0, ledgeY, 0, height);
    ledgeGradient.addColorStop(0, '#101523');
    ledgeGradient.addColorStop(1, '#070a13');

    ctx.fillStyle = ledgeGradient;
    ctx.fillRect(0, ledgeY, width, ledgeHeight);

    ctx.strokeStyle = 'rgba(116, 132, 176, 0.26)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ledgeY + 0.5);
    ctx.lineTo(width, ledgeY + 0.5);
    ctx.stroke();

    const railingY = ledgeY + Math.min(34, ledgeHeight * 0.42);

    ctx.strokeStyle = 'rgba(80, 96, 139, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, railingY);
    ctx.lineTo(width * 0.92, railingY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(80, 96, 139, 0.16)';
    ctx.lineWidth = 1;

    for (let index = 0; index < 6; index += 1) {
      const postX = width * (0.12 + index * 0.15);

      ctx.beginPath();
      ctx.moveTo(postX, railingY);
      ctx.lineTo(postX, height);
      ctx.stroke();
    }
  }

  private drawShadowHazard(x: number, y: number, radius: number): void {
    const ctx = this.context;

    const shadow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.08);
    shadow.addColorStop(0, 'rgba(1, 2, 8, 0.9)');
    shadow.addColorStop(0.5, 'rgba(15, 13, 31, 0.68)');
    shadow.addColorStop(0.82, 'rgba(36, 28, 62, 0.28)');
    shadow.addColorStop(1, 'rgba(36, 28, 62, 0)');

    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 1, 6, 0.28)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMoonlightOrb(x: number, y: number, radius: number, pulseScale: number): void {
    const ctx = this.context;
    const pulsedRadius = radius * pulseScale;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, pulsedRadius * 3.8);
    glow.addColorStop(0, 'rgba(225, 244, 255, 0.82)');
    glow.addColorStop(0.3, 'rgba(118, 194, 255, 0.3)');
    glow.addColorStop(1, 'rgba(118, 194, 255, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, pulsedRadius * 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dff7ff';
    ctx.beginPath();
    ctx.arc(x, y, pulsedRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - pulsedRadius * 0.24, y - pulsedRadius * 0.28, pulsedRadius * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFirefly(
    x: number,
    y: number,
    radius: number,
    elapsedTime: number,
    glow: number,
    maxGlow: number,
    collectPulse: number,
    isTouchingShadow: boolean,
  ): void {
    const ctx = this.context;
    const glowRatio = Math.max(0, Math.min(1, glow / maxGlow));
    const pulse = 1 + Math.sin(elapsedTime * 5.2) * 0.04;
    const collectBoost = 1 + collectPulse * this.fireflyCollectPulseStrength;
    const shadowFlicker = isTouchingShadow ? 0.94 + Math.sin(elapsedTime * 42) * 0.06 : 1;
    const shadowDim = isTouchingShadow ? this.fireflyShadowDimFactor * shadowFlicker : 1;
    const auraScale = this.fireflyBaseAuraRadius + glowRatio * this.fireflyAuraGlowFactor;
    const glowRadius = radius * auraScale * pulse * collectBoost;
    const auraAlpha = (0.2 + glowRatio * 0.16 + collectPulse * 0.16) * shadowDim;
    const bodyAlpha = (0.72 + glowRatio * 0.28) * shadowDim;

    const aura = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    aura.addColorStop(0, `rgba(255, 240, 164, ${Math.min(0.92, auraAlpha + 0.42)})`);
    aura.addColorStop(0.28, `rgba(255, 210, 91, ${auraAlpha})`);
    aura.addColorStop(1, 'rgba(255, 211, 104, 0)');

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 231, 155, ${bodyAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 247, 209, ${Math.min(1, bodyAlpha + 0.12)})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStateText(snapshot: RenderSnapshot): void {
    const { width, height } = this.size;
    const ctx = this.context;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f9edc5';

    if (snapshot.state === 'start') {
      this.drawTitle('Moonlit Firefly Bloom', centerX, centerY - 48);
      this.drawHint('Collect moonlight. Avoid shadows. Keep your glow alive.', centerX, centerY + 4);
      this.drawSubtitle('Click / Tap to Start', centerX, centerY + 52);
      return;
    }

    if (snapshot.state === 'gameOver') {
      this.drawGameOverSummary(snapshot, centerX, centerY);
      return;
    }

    this.drawHudText(`Score: ${snapshot.score}`, 24, 28, 'left');
    this.drawHudText(`Time: ${snapshot.elapsedTime.toFixed(1)}s`, 24, 58, 'left');
    this.drawGlowMeter(snapshot.glow, snapshot.maxGlow, 24, 88);
  }

  private drawGameOverSummary(snapshot: RenderSnapshot, x: number, centerY: number): void {
    const panelWidth = Math.max(1, Math.min(430, this.size.width - 32));
    const panelHeight = Math.max(236, Math.min(304, this.size.height - 32));

    this.drawSoftPanel(x, centerY, panelWidth, panelHeight);
    this.drawTitle('Glow Faded', x, centerY - 112);
    this.drawPrimaryStat(`Final Score: ${snapshot.score}`, x, centerY - 58);
    this.drawHint(`Best Score: ${snapshot.bestScore}`, x, centerY - 16);
    this.drawHint(`Time Survived: ${snapshot.elapsedTime.toFixed(1)}s`, x, centerY + 18);
    this.drawHint(`Moonlight Orbs Collected: ${snapshot.orbsCollected}`, x, centerY + 52);
    this.drawSubtitle('Click / Tap to Try Again', x, centerY + 106);
  }

  private drawSoftPanel(x: number, y: number, width: number, height: number): void {
    const ctx = this.context;
    const left = x - width / 2;
    const top = y - height / 2;
    const radius = Math.min(8, width / 2, height / 2);

    ctx.save();
    ctx.fillStyle = 'rgba(4, 7, 17, 0.62)';
    ctx.strokeStyle = 'rgba(249, 237, 197, 0.14)';
    ctx.lineWidth = 1;
    this.traceRoundedRect(left, top, width, height, radius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private traceRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    const ctx = this.context;
    const right = x + width;
    const bottom = y + height;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(right - radius, y);
    ctx.quadraticCurveTo(right, y, right, y + radius);
    ctx.lineTo(right, bottom - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    ctx.lineTo(x + radius, bottom);
    ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawGlowMeter(glow: number, maxGlow: number, x: number, y: number): void {
    const ctx = this.context;
    const isNarrow = this.size.width < 380;
    const width = isNarrow ? 108 : 132;
    const height = isNarrow ? 10 : 12;
    const labelGap = isNarrow ? 48 : 54;
    const fillRatio = Math.max(0, Math.min(1, glow / maxGlow));
    const fillWidth = width * fillRatio;
    const fillColor = fillRatio < 0.28 ? '#f0a06a' : '#f7d774';

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f9edc5';
    ctx.font = `500 ${isNarrow ? 14 : 16}px Inter, system-ui, sans-serif`;
    ctx.fillText('Glow', x, y);

    ctx.fillStyle = 'rgba(249, 237, 197, 0.16)';
    ctx.fillRect(x + labelGap, y - height / 2, width, height);

    ctx.fillStyle = fillColor;
    ctx.fillRect(x + labelGap, y - height / 2, fillWidth, height);

    ctx.strokeStyle = 'rgba(249, 237, 197, 0.42)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + labelGap, y - height / 2, width, height);

    ctx.textAlign = 'center';
  }

  private drawTitle(text: string, x: number, y: number): void {
    const ctx = this.context;
    this.setFittedFont('700', 36, 26, text);
    ctx.fillText(text, x, y);
  }

  private drawSubtitle(text: string, x: number, y: number): void {
    const ctx = this.context;
    this.setFittedFont('500', 20, 16, text);
    ctx.fillText(text, x, y);
  }

  private drawPrimaryStat(text: string, x: number, y: number): void {
    const ctx = this.context;
    ctx.fillStyle = '#fff2b8';
    this.setFittedFont('700', 24, 18, text);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private drawHint(text: string, x: number, y: number): void {
    const ctx = this.context;
    ctx.fillStyle = 'rgba(248, 240, 201, 0.72)';
    this.setFittedFont('400', 14, 12, text);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private setFittedFont(weight: string, baseSize: number, minSize: number, text: string): void {
    const ctx = this.context;
    const maxTextWidth = Math.max(140, this.size.width - 32);
    let fontSize = baseSize;

    ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;

    while (fontSize > minSize && ctx.measureText(text).width > maxTextWidth) {
      fontSize -= 1;
      ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
    }
  }

  private drawHudText(text: string, x: number, y: number, align: CanvasTextAlign): void {
    const ctx = this.context;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f9edc5';
    ctx.font = `500 ${this.size.width < 380 ? 14 : 16}px Inter, system-ui, sans-serif`;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'center';
  }
}
