import type { CanvasSize, RenderSnapshot } from '../game/types';

type BackgroundAssetName = 'skyline' | 'railing' | 'plantLeft' | 'plantRight';

interface BackgroundAsset {
  image: HTMLImageElement;
  isLoaded: boolean;
}

interface BackgroundStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  glint?: boolean;
}

interface SourceCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BACKGROUND_ASSET_PATHS: Record<BackgroundAssetName, string> = {
  skyline: '/assets/background/skyline.png',
  railing: '/assets/background/railing.png',
  plantLeft: '/assets/background/plant-left.png',
  plantRight: '/assets/background/plant-right.png',
};

const BACKGROUND_STARS: readonly BackgroundStar[] = [
  { x: 0.07, y: 0.16, radius: 0.7, alpha: 0.28 },
  { x: 0.16, y: 0.09, radius: 0.9, alpha: 0.42, glint: true },
  { x: 0.29, y: 0.15, radius: 0.6, alpha: 0.24 },
  { x: 0.42, y: 0.07, radius: 0.8, alpha: 0.35 },
  { x: 0.56, y: 0.23, radius: 0.55, alpha: 0.2 },
  { x: 0.66, y: 0.11, radius: 0.65, alpha: 0.3 },
  { x: 0.83, y: 0.08, radius: 0.8, alpha: 0.36, glint: true },
  { x: 0.93, y: 0.18, radius: 0.55, alpha: 0.24 },
  { x: 0.11, y: 0.3, radius: 0.55, alpha: 0.22 },
  { x: 0.24, y: 0.34, radius: 0.6, alpha: 0.2 },
  { x: 0.74, y: 0.31, radius: 0.65, alpha: 0.25 },
  { x: 0.9, y: 0.38, radius: 0.55, alpha: 0.2 },
];

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private size: CanvasSize = { width: 0, height: 0 };
  private readonly backgroundAssets: Record<BackgroundAssetName, BackgroundAsset>;
  // Firefly aura tuning: glow level and collection pulses nudge the aura without becoming flashy.
  private readonly fireflyBaseAuraRadius = 4.4;
  private readonly fireflyAuraGlowFactor = 1.35;
  private readonly fireflyCollectPulseStrength = 0.42;
  private readonly fireflyShadowDimFactor = 0.54;
  // Brief edge flash that makes shadow contact read as active glow drain.
  private readonly shadowHitFlashAlpha = 0.34;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create a 2D canvas context.');
    }

    this.context = context;
    this.backgroundAssets = this.loadBackgroundAssets();
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
    this.drawMoonlitGarden(
      snapshot.previousMoonPhaseIndex,
      snapshot.moonPhaseIndex,
      snapshot.moonPhaseTransitionProgress,
    );

    for (const hazard of snapshot.shadowHazards) {
      this.drawShadowHazard(hazard.x, hazard.y, hazard.radius);
    }

    if (snapshot.bloomBurst) {
      this.drawBloomBurstRing(
        snapshot.bloomBurst.x,
        snapshot.bloomBurst.y,
        snapshot.bloomBurst.progress,
        snapshot.bloomBurst.radius,
      );
    }

    if (snapshot.moonShieldPowerup) {
      this.drawMoonShieldPowerup(
        snapshot.moonShieldPowerup.x,
        snapshot.moonShieldPowerup.y,
        snapshot.moonShieldPowerup.radius,
        snapshot.moonShieldPowerup.pulseScale,
      );
    }

    for (const orb of snapshot.moonlightOrbs) {
      this.drawMoonlightOrb(
        orb.x,
        orb.y,
        orb.radius,
        orb.pulseScale,
        snapshot.isMoonRainActive,
      );
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
        snapshot.shadowHitFlash,
        snapshot.moonShieldRemaining,
        snapshot.moonShieldDuration,
      );
    }

    if (snapshot.bloomBurst) {
      this.drawBloomBurstLabel(
        snapshot.bloomBurst.x,
        snapshot.bloomBurst.y,
        snapshot.bloomBurst.progress,
      );
    }

    this.drawShadowHitVignette(snapshot.shadowHitFlash);
    this.drawStateText(snapshot);
  }

  private clear(): void {
    this.context.clearRect(0, 0, this.size.width, this.size.height);
  }

  private loadBackgroundAssets(): Record<BackgroundAssetName, BackgroundAsset> {
    return {
      skyline: this.createBackgroundAsset(BACKGROUND_ASSET_PATHS.skyline),
      railing: this.createBackgroundAsset(BACKGROUND_ASSET_PATHS.railing),
      plantLeft: this.createBackgroundAsset(BACKGROUND_ASSET_PATHS.plantLeft),
      plantRight: this.createBackgroundAsset(BACKGROUND_ASSET_PATHS.plantRight),
    };
  }

  private createBackgroundAsset(source: string): BackgroundAsset {
    const asset: BackgroundAsset = {
      image: new Image(),
      isLoaded: false,
    };

    asset.image.onload = () => {
      asset.isLoaded = true;
    };

    asset.image.onerror = () => {
      asset.isLoaded = false;
    };

    asset.image.src = source;

    return asset;
  }

  private drawMoonlitGarden(
    previousMoonPhaseIndex: number,
    moonPhaseIndex: number,
    moonPhaseTransitionProgress: number,
  ): void {
    const { width, height } = this.size;

    this.drawSkyBackground(width, height);
    this.drawStars(width, height);
    this.drawMoon(width, height, previousMoonPhaseIndex, moonPhaseIndex, moonPhaseTransitionProgress);
    this.drawSkylineAsset(width, height);
    this.drawRailingAsset(width, height);
    this.drawPlantAssets(width, height);
  }

  private drawSkyBackground(width: number, height: number): void {
    const ctx = this.context;

    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#040917');
    skyGradient.addColorStop(0.52, '#0a1428');
    skyGradient.addColorStop(0.76, '#111c33');
    skyGradient.addColorStop(1, '#050812');

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const horizonGlow = ctx.createLinearGradient(0, height * 0.46, 0, height);
    horizonGlow.addColorStop(0, 'rgba(93, 124, 176, 0)');
    horizonGlow.addColorStop(0.58, 'rgba(93, 124, 176, 0.08)');
    horizonGlow.addColorStop(1, 'rgba(93, 124, 176, 0)');

    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, height * 0.46, width, height * 0.46);
  }

  private drawMoon(
    width: number,
    height: number,
    previousMoonPhaseIndex: number,
    moonPhaseIndex: number,
    moonPhaseTransitionProgress: number,
  ): void {
    const ctx = this.context;
    const moonRadius = Math.max(32, Math.min(width, height) * 0.075);
    const moonX = width * 0.78;
    const moonY = height * 0.18;
    const easedProgress = this.easeMoonPhaseTransition(moonPhaseTransitionProgress);
    const previousIllumination = this.getMoonPhaseIllumination(previousMoonPhaseIndex);
    const currentIllumination = this.getMoonPhaseIllumination(moonPhaseIndex);
    const illumination = previousIllumination + (currentIllumination - previousIllumination) * easedProgress;

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3.1);
    moonGlow.addColorStop(0, `rgba(248, 232, 173, ${0.1 + illumination * 0.24})`);
    moonGlow.addColorStop(0.42, `rgba(185, 211, 255, ${0.06 + illumination * 0.08})`);
    moonGlow.addColorStop(1, 'rgba(187, 214, 255, 0)');

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 3.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(12, 19, 37, 0.78)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    if (previousMoonPhaseIndex !== moonPhaseIndex && easedProgress < 1) {
      this.drawMoonPhase(moonX, moonY, moonRadius, previousMoonPhaseIndex, 1 - easedProgress);
      this.drawMoonPhase(moonX, moonY, moonRadius, moonPhaseIndex, easedProgress);
      return;
    }

    this.drawMoonPhase(moonX, moonY, moonRadius, moonPhaseIndex, 1);
  }

  private getMoonPhaseIllumination(moonPhaseIndex: number): number {
    const phaseIllumination = [1, 0.78, 0.5, 0.28, 0.08, 0.28, 0.5, 0.78];

    return phaseIllumination[moonPhaseIndex] ?? 1;
  }

  private drawMoonPhase(
    x: number,
    y: number,
    radius: number,
    moonPhaseIndex: number,
    alpha: number,
  ): void {
    const ctx = this.context;
    const moonBody = ctx.createRadialGradient(
      x - radius * 0.28,
      y - radius * 0.3,
      radius * 0.1,
      x,
      y,
      radius,
    );
    moonBody.addColorStop(0, '#fff4bf');
    moonBody.addColorStop(1, '#ead99d');

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    if (moonPhaseIndex === 4) {
      const newMoonGlow = ctx.createRadialGradient(x, y, radius * 0.45, x, y, radius);
      newMoonGlow.addColorStop(0, 'rgba(255, 239, 176, 0)');
      newMoonGlow.addColorStop(0.86, 'rgba(255, 239, 176, 0.04)');
      newMoonGlow.addColorStop(1, 'rgba(255, 239, 176, 0.18)');

      ctx.fillStyle = newMoonGlow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
      return;
    }

    ctx.fillStyle = moonBody;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (moonPhaseIndex === 2) {
      this.drawMoonDarkHalf(x, y - radius, radius, radius * 2);
    } else if (moonPhaseIndex === 6) {
      this.drawMoonDarkHalf(x - radius, y - radius, radius, radius * 2);
    } else if (moonPhaseIndex !== 0) {
      const maskOffset = this.getMoonPhaseMaskOffset(radius, moonPhaseIndex);
      const darkMask = ctx.createRadialGradient(x + maskOffset, y, radius * 0.08, x + maskOffset, y, radius);
      darkMask.addColorStop(0, 'rgba(9, 16, 32, 0.98)');
      darkMask.addColorStop(1, 'rgba(9, 16, 32, 0.9)');

      ctx.fillStyle = darkMask;
      ctx.beginPath();
      ctx.arc(x + maskOffset, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawMoonDarkHalf(x: number, y: number, width: number, height: number): void {
    const ctx = this.context;

    ctx.fillStyle = 'rgba(9, 16, 32, 0.95)';
    ctx.fillRect(x, y, width, height);
  }

  private getMoonPhaseMaskOffset(radius: number, moonPhaseIndex: number): number {
    switch (moonPhaseIndex) {
      case 1:
        return radius * 1.18;
      case 3:
        return radius * 0.48;
      case 5:
        return -radius * 0.48;
      case 7:
        return -radius * 1.18;
      default:
        return 0;
    }
  }

  private easeMoonPhaseTransition(progress: number): number {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
  }

  private drawStars(width: number, height: number): void {
    const ctx = this.context;

    ctx.save();
    ctx.fillStyle = '#fff4c8';
    ctx.strokeStyle = '#fff4c8';
    ctx.lineWidth = 1;

    for (const star of BACKGROUND_STARS) {
      const x = star.x * width;
      const y = star.y * height;
      const radius = Math.max(0.45, star.radius * Math.min(1.15, width / 840));

      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (star.glint && width > 520) {
        const glintSize = radius * 3.2;

        ctx.globalAlpha = star.alpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(x - glintSize, y);
        ctx.lineTo(x + glintSize, y);
        ctx.moveTo(x, y - glintSize);
        ctx.lineTo(x, y + glintSize);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawSkylineAsset(width: number, height: number): void {
    const asset = this.backgroundAssets.skyline;

    if (!asset.isLoaded) {
      return;
    }

    const ctx = this.context;
    const image = asset.image;
    // Scale by width, but keep the layer tall enough on portrait screens that the city still reads.
    const scale = Math.max(width / image.width, (height * 0.5) / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = (width - drawWidth) / 2;
    const drawY = height - drawHeight;

    ctx.save();
    ctx.globalAlpha = width < 520 ? 0.48 : 0.62;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  private drawRailingAsset(width: number, height: number): void {
    const asset = this.backgroundAssets.railing;

    if (!asset.isLoaded) {
      return;
    }

    const ctx = this.context;
    const image = asset.image;
    // The transparent source has the railing in the lower portion, so align its visible bottom to the canvas.
    const visibleBottomRatio = 720 / 821;
    const scale = Math.max(width / image.width, (height * 0.38) / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = (width - drawWidth) / 2;
    const drawY = height - drawHeight * visibleBottomRatio + Math.min(8, height * 0.012);

    ctx.save();
    ctx.globalAlpha = width < 520 ? 0.94 : 1;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  private drawPlantAssets(width: number, height: number): void {
    const leftAsset = this.backgroundAssets.plantLeft;
    const rightAsset = this.backgroundAssets.plantRight;

    if (!leftAsset.isLoaded && !rightAsset.isLoaded) {
      return;
    }

    const plantHeight = Math.max(
      110,
      Math.min(height * (width < 520 ? 0.22 : 0.31), width * 0.34),
    );

    if (leftAsset.isLoaded) {
      this.drawCroppedBackgroundAsset(
        leftAsset,
        { x: 0, y: 260, width: 700, height: 826 },
        -plantHeight * 0.23,
        height - plantHeight,
        plantHeight,
        width < 520 ? 0.78 : 0.86,
      );
    }

    if (rightAsset.isLoaded) {
      const rightCrop: SourceCrop = { x: 748, y: 210, width: 700, height: 876 };
      const rightWidth = plantHeight * (rightCrop.width / rightCrop.height);

      this.drawCroppedBackgroundAsset(
        rightAsset,
        rightCrop,
        width - rightWidth + plantHeight * 0.24,
        height - plantHeight,
        plantHeight,
        width < 520 ? 0.78 : 0.86,
      );
    }
  }

  private drawCroppedBackgroundAsset(
    asset: BackgroundAsset,
    crop: SourceCrop,
    x: number,
    y: number,
    targetHeight: number,
    alpha: number,
  ): void {
    const ctx = this.context;
    const targetWidth = targetHeight * (crop.width / crop.height);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      asset.image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      x,
      y,
      targetWidth,
      targetHeight,
    );
    ctx.restore();
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

  private drawMoonlightOrb(
    x: number,
    y: number,
    radius: number,
    pulseScale: number,
    isMoonRainActive: boolean,
  ): void {
    const ctx = this.context;
    const pulsedRadius = radius * pulseScale;
    const glowRadius = pulsedRadius * (isMoonRainActive ? 4.4 : 3.8);

    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    glow.addColorStop(0, isMoonRainActive ? 'rgba(248, 246, 226, 0.9)' : 'rgba(225, 244, 255, 0.82)');
    glow.addColorStop(0.3, isMoonRainActive ? 'rgba(183, 217, 255, 0.36)' : 'rgba(118, 194, 255, 0.3)');
    glow.addColorStop(1, 'rgba(118, 194, 255, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isMoonRainActive ? '#f8fbff' : '#dff7ff';
    ctx.beginPath();
    ctx.arc(x, y, pulsedRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - pulsedRadius * 0.24, y - pulsedRadius * 0.28, pulsedRadius * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMoonShieldPowerup(x: number, y: number, radius: number, pulseScale: number): void {
    const ctx = this.context;
    const pulsedRadius = radius * pulseScale;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, pulsedRadius * 3.6);
    glow.addColorStop(0, 'rgba(220, 255, 255, 0.84)');
    glow.addColorStop(0.35, 'rgba(115, 225, 238, 0.34)');
    glow.addColorStop(1, 'rgba(115, 225, 238, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, pulsedRadius * 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(226, 255, 255, 0.92)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, pulsedRadius * 1.24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(191, 250, 255, 0.72)';
    ctx.beginPath();
    ctx.moveTo(x, y - pulsedRadius * 0.8);
    ctx.quadraticCurveTo(x + pulsedRadius * 0.68, y - pulsedRadius * 0.4, x + pulsedRadius * 0.5, y + pulsedRadius * 0.34);
    ctx.quadraticCurveTo(x + pulsedRadius * 0.24, y + pulsedRadius * 0.88, x, y + pulsedRadius);
    ctx.quadraticCurveTo(x - pulsedRadius * 0.24, y + pulsedRadius * 0.88, x - pulsedRadius * 0.5, y + pulsedRadius * 0.34);
    ctx.quadraticCurveTo(x - pulsedRadius * 0.68, y - pulsedRadius * 0.4, x, y - pulsedRadius * 0.8);
    ctx.fill();
  }

  private drawBloomBurstRing(x: number, y: number, progress: number, radius: number): void {
    const ctx = this.context;
    const easedProgress = 1 - (1 - progress) * (1 - progress);
    const alpha = 1 - progress;
    const ringRadius = 20 + radius * easedProgress;
    const glowRadius = ringRadius + 18;

    const glow = ctx.createRadialGradient(x, y, Math.max(1, ringRadius * 0.2), x, y, glowRadius);
    glow.addColorStop(0, 'rgba(255, 232, 156, 0)');
    glow.addColorStop(0.76, `rgba(255, 222, 122, ${0.12 * alpha})`);
    glow.addColorStop(1, 'rgba(255, 222, 122, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 239, 176, ${0.5 * alpha})`;
    ctx.lineWidth = Math.max(2, 9 * alpha);
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 232, ${0.34 * alpha})`;
    ctx.lineWidth = Math.max(1, 3 * alpha);
    ctx.beginPath();
    ctx.arc(x, y, ringRadius * 0.74, 0, Math.PI * 2);
    ctx.stroke();
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
    shadowHitFlash: number,
    moonShieldRemaining: number,
    moonShieldDuration: number,
  ): void {
    const ctx = this.context;
    const glowRatio = Math.max(0, Math.min(1, glow / maxGlow));
    const pulse = 1 + Math.sin(elapsedTime * 5.2) * 0.04;
    const collectBoost = 1 + collectPulse * this.fireflyCollectPulseStrength;
    const shadowFlicker = isTouchingShadow ? 0.82 + Math.sin(elapsedTime * 44) * 0.13 : 1;
    const recentHitDim = 1 - shadowHitFlash * 0.12;
    const shadowDim = isTouchingShadow
      ? this.fireflyShadowDimFactor * shadowFlicker
      : recentHitDim;
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

    if (moonShieldRemaining > 0) {
      this.drawMoonShieldAura(x, y, radius, elapsedTime, moonShieldRemaining, moonShieldDuration);
    }

    ctx.fillStyle = `rgba(255, 231, 155, ${bodyAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 247, 209, ${Math.min(1, bodyAlpha + 0.12)})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMoonShieldAura(
    x: number,
    y: number,
    fireflyRadius: number,
    elapsedTime: number,
    remaining: number,
    duration: number,
  ): void {
    const ctx = this.context;
    const remainingRatio = Math.max(0, Math.min(1, remaining / duration));
    const pulse = 1 + Math.sin(elapsedTime * 5.8) * 0.04;
    const radius = fireflyRadius * (3.1 + remainingRatio * 0.45) * pulse;
    const alpha = 0.18 + remainingRatio * 0.18;

    const aura = ctx.createRadialGradient(x, y, fireflyRadius * 1.2, x, y, radius);
    aura.addColorStop(0, `rgba(197, 255, 255, ${alpha * 0.34})`);
    aura.addColorStop(0.66, `rgba(104, 225, 238, ${alpha})`);
    aura.addColorStop(1, 'rgba(104, 225, 238, 0)');

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(220, 255, 255, ${0.44 + remainingRatio * 0.24})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, fireflyRadius * 2.35 * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawBloomBurstLabel(x: number, y: number, progress: number): void {
    const ctx = this.context;
    const alpha = Math.max(0, 1 - progress);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255, 241, 180, ${0.86 * alpha})`;
    ctx.font = '700 18px Inter, system-ui, sans-serif';
    ctx.fillText('Bloom!', x, y - 34 - progress * 22);
    ctx.restore();
  }

  private drawShadowHitVignette(intensity: number): void {
    if (intensity <= 0) {
      return;
    }

    const { width, height } = this.size;
    const ctx = this.context;
    const radius = Math.max(width, height) * 0.74;
    const vignette = ctx.createRadialGradient(width / 2, height / 2, radius * 0.35, width / 2, height / 2, radius);

    vignette.addColorStop(0, 'rgba(64, 0, 38, 0)');
    vignette.addColorStop(0.68, `rgba(55, 11, 50, ${0.08 * intensity})`);
    vignette.addColorStop(1, `rgba(99, 23, 57, ${this.shadowHitFlashAlpha * intensity})`);

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
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

    this.drawPlayingHud(snapshot);
    this.drawLevelUpMessage(
      snapshot.nightLevel,
      snapshot.moonPhaseName,
      snapshot.moonPhaseMessageProgress,
      centerX,
      height,
    );
    this.drawMoonRainMessage(
      snapshot.moonRainMessage,
      snapshot.moonRainMessageProgress,
      centerX,
      height,
    );
  }

  private drawPlayingHud(snapshot: RenderSnapshot): void {
    const ctx = this.context;
    const isNarrow = this.size.width < 420;
    const left = isNarrow ? 12 : 18;
    const top = isNarrow ? 12 : 16;
    const width = Math.min(isNarrow ? 214 : 226, this.size.width - left * 2);
    const hasShield = snapshot.moonShieldRemaining > 0;
    const rowGap = isNarrow ? 24 : 26;
    const panelHeight = hasShield ? (isNarrow ? 158 : 170) : (isNarrow ? 134 : 144);
    const paddingX = isNarrow ? 14 : 16;
    const firstRowY = top + (isNarrow ? 24 : 26);

    const panelGradient = ctx.createLinearGradient(0, top, 0, top + panelHeight);
    panelGradient.addColorStop(0, 'rgba(5, 9, 20, 0.78)');
    panelGradient.addColorStop(1, 'rgba(4, 7, 16, 0.58)');

    this.drawPanelRect(
      left,
      top,
      width,
      panelHeight,
      8,
      panelGradient,
      'rgba(255, 236, 174, 0.16)',
      10,
    );

    const contentLeft = left + paddingX;
    const contentWidth = width - paddingX * 2;

    this.drawHudMetric('Score', snapshot.score.toString(), contentLeft, firstRowY, contentWidth);
    this.drawHudMetric('Time', `${snapshot.elapsedTime.toFixed(1)}s`, contentLeft, firstRowY + rowGap, contentWidth);
    this.drawHudMetric('Night', snapshot.nightLevel.toString(), contentLeft, firstRowY + rowGap * 2, contentWidth);
    this.drawGlowMeter(snapshot.glow, snapshot.maxGlow, contentLeft, firstRowY + rowGap * 3 + 2, contentWidth);

    if (hasShield) {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(205, 255, 255, 0.86)';
      ctx.font = `600 ${isNarrow ? 12 : 13}px Inter, system-ui, sans-serif`;
      ctx.fillText(`Moon Shield: ${snapshot.moonShieldRemaining.toFixed(1)}s`, contentLeft, firstRowY + rowGap * 4 + 8);
      ctx.restore();
    }
  }

  private drawHudMetric(label: string, value: string, x: number, y: number, width: number): void {
    const ctx = this.context;
    const isNarrow = this.size.width < 420;

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(248, 240, 201, 0.72)';
    ctx.font = `500 ${isNarrow ? 13 : 14}px Inter, system-ui, sans-serif`;
    ctx.fillText(label, x, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff0b8';
    ctx.font = `700 ${isNarrow ? 14 : 15}px Inter, system-ui, sans-serif`;
    ctx.fillText(value, x + width, y);
    ctx.restore();
  }

  private drawLevelUpMessage(
    nightLevel: number,
    moonPhaseName: string,
    progress: number,
    x: number,
    height: number,
  ): void {
    if (progress <= 0) {
      return;
    }

    const ctx = this.context;
    const alpha = Math.min(1, progress);
    const rise = (1 - progress) * 12;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255, 238, 174, ${0.9 * alpha})`;
    this.setFittedFont('700', 22, 16, `Night ${nightLevel}`);
    ctx.fillText(`Night ${nightLevel}`, x, height * 0.24 - rise);
    ctx.fillStyle = `rgba(248, 240, 201, ${0.68 * alpha})`;
    this.setFittedFont('500', 15, 12, moonPhaseName);
    ctx.fillText(moonPhaseName, x, height * 0.24 + 24 - rise);
    ctx.restore();
  }

  private drawMoonRainMessage(
    message: string | null,
    progress: number,
    x: number,
    height: number,
  ): void {
    if (!message || progress <= 0) {
      return;
    }

    const ctx = this.context;
    const alpha = Math.min(1, progress);
    const rise = (1 - progress) * 10;
    const title = message === 'start' ? 'Full Moon Trial' : 'Moon Rain fades';
    const subtitle = message === 'start' ? 'Moon Rain begins' : 'The moonlight settles';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255, 242, 190, ${0.9 * alpha})`;
    this.setFittedFont('700', 20, 15, title);
    ctx.fillText(title, x, height * 0.34 - rise);
    ctx.fillStyle = `rgba(210, 235, 255, ${0.72 * alpha})`;
    this.setFittedFont('500', 14, 12, subtitle);
    ctx.fillText(subtitle, x, height * 0.34 + 22 - rise);
    ctx.restore();
  }

  private drawGameOverSummary(snapshot: RenderSnapshot, x: number, centerY: number): void {
    const panelWidth = Math.max(1, Math.min(480, this.size.width - 28));
    const panelHeight = Math.max(292, Math.min(this.size.height - 28, this.size.height < 520 ? 320 : 390));
    const top = centerY - panelHeight / 2;
    const bottom = top + panelHeight;
    const compact = panelHeight < 350;
    const paddingX = this.size.width < 420 ? 24 : 34;
    const contentWidth = panelWidth - paddingX * 2;
    const titleY = top + (compact ? 36 : 46);
    const summaryY = titleY + (compact ? 30 : 38);
    const scoreY = summaryY + (compact ? 42 : 50);
    const statsTop = scoreY + (compact ? 38 : 52);
    const statRowGap = compact ? 46 : 56;
    const columnOffset = panelWidth * 0.23;
    const columnWidth = Math.max(100, (contentWidth - 18) / 2);
    const fullMoonStatY = bottom - (compact ? 58 : 70);

    this.drawSoftPanel(x, centerY, panelWidth, panelHeight);
    this.drawTitle('Glow Faded', x, titleY, contentWidth);
    this.drawHint(`You kept the light alive for ${snapshot.elapsedTime.toFixed(1)}s.`, x, summaryY, contentWidth);
    this.drawPrimaryStat(`Score: ${snapshot.score}`, x, scoreY, contentWidth);

    this.drawGameOverStat('Best', snapshot.bestScore.toString(), x - columnOffset, statsTop, columnWidth);
    this.drawGameOverStat('Deepest Night', snapshot.highestNightLevel.toString(), x + columnOffset, statsTop, columnWidth);
    this.drawGameOverStat('Moonlight Orbs', snapshot.orbsCollected.toString(), x - columnOffset, statsTop + statRowGap, columnWidth);
    this.drawGameOverStat('Blooms', snapshot.bloomBursts.toString(), x + columnOffset, statsTop + statRowGap, columnWidth);
    this.drawHint(`Full Moons Survived: ${snapshot.fullMoonTrialsSurvived}`, x, fullMoonStatY, contentWidth);

    this.drawSubtitle('Click / Tap to fly again', x, bottom - (compact ? 28 : 36), contentWidth);
  }

  private drawSoftPanel(x: number, y: number, width: number, height: number): void {
    const ctx = this.context;
    const left = x - width / 2;
    const top = y - height / 2;
    const radius = Math.min(8, width / 2, height / 2);
    const panelGradient = ctx.createLinearGradient(0, top, 0, top + height);
    panelGradient.addColorStop(0, 'rgba(4, 7, 17, 0.82)');
    panelGradient.addColorStop(1, 'rgba(6, 11, 24, 0.68)');

    this.drawPanelRect(
      left,
      top,
      width,
      height,
      radius,
      panelGradient,
      'rgba(249, 237, 197, 0.16)',
      16,
    );
  }

  private drawPanelRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    strokeStyle: string,
    shadowBlur: number,
  ): void {
    const ctx = this.context;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 222, 148, 0.08)';
    ctx.shadowBlur = shadowBlur;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;
    this.traceRoundedRect(x, y, width, height, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
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

  private drawGlowMeter(glow: number, maxGlow: number, x: number, y: number, width: number): void {
    const ctx = this.context;
    const isNarrow = this.size.width < 420;
    const height = isNarrow ? 10 : 12;
    const labelGap = isNarrow ? 48 : 54;
    const barWidth = Math.max(80, width - labelGap);
    const barLeft = x + labelGap;
    const barTop = y - height / 2;
    const radius = height / 2;
    const fillRatio = Math.max(0, Math.min(1, glow / maxGlow));
    const fillWidth = barWidth * fillRatio;
    const isLowGlow = fillRatio < 0.28;
    const fillGradient = ctx.createLinearGradient(barLeft, 0, barLeft + barWidth, 0);
    fillGradient.addColorStop(0, isLowGlow ? '#df836a' : '#ffe49a');
    fillGradient.addColorStop(1, isLowGlow ? '#f2b46f' : '#f4c95d');

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(248, 240, 201, 0.72)';
    ctx.font = `500 ${isNarrow ? 13 : 14}px Inter, system-ui, sans-serif`;
    ctx.fillText('Glow', x, y);

    ctx.fillStyle = 'rgba(249, 237, 197, 0.12)';
    this.traceRoundedRect(barLeft, barTop, barWidth, height, radius);
    ctx.fill();

    if (fillWidth > 0.5) {
      ctx.save();
      ctx.shadowColor = isLowGlow ? 'rgba(240, 132, 94, 0.24)' : `rgba(255, 220, 112, ${0.22 + fillRatio * 0.18})`;
      ctx.shadowBlur = isLowGlow ? 5 : 9;
      ctx.fillStyle = fillGradient;
      this.traceRoundedRect(barLeft, barTop, fillWidth, height, Math.min(radius, fillWidth / 2));
      ctx.fill();
      ctx.restore();
    }

    ctx.strokeStyle = fillRatio > 0.92 ? 'rgba(255, 238, 166, 0.58)' : 'rgba(249, 237, 197, 0.34)';
    ctx.lineWidth = 1;
    this.traceRoundedRect(barLeft, barTop, barWidth, height, radius);
    ctx.stroke();
    ctx.restore();
  }

  private drawTitle(text: string, x: number, y: number, maxWidth = this.size.width - 32): void {
    const ctx = this.context;
    ctx.fillStyle = '#fff0b8';
    this.setFittedFont('700', 36, 26, text, maxWidth);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private drawSubtitle(text: string, x: number, y: number, maxWidth = this.size.width - 32): void {
    const ctx = this.context;
    ctx.fillStyle = '#fff0b8';
    this.setFittedFont('600', 20, 16, text, maxWidth);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private drawPrimaryStat(text: string, x: number, y: number, maxWidth = this.size.width - 32): void {
    const ctx = this.context;
    ctx.fillStyle = '#fff2b8';
    this.setFittedFont('700', 28, 20, text, maxWidth);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private drawHint(text: string, x: number, y: number, maxWidth = this.size.width - 32): void {
    const ctx = this.context;
    ctx.fillStyle = 'rgba(248, 240, 201, 0.72)';
    this.setFittedFont('400', 14, 12, text, maxWidth);
    ctx.fillText(text, x, y);
    ctx.fillStyle = '#f9edc5';
  }

  private drawGameOverStat(label: string, value: string, x: number, y: number, maxWidth: number): void {
    const ctx = this.context;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(248, 240, 201, 0.62)';
    this.setFittedFont('500', 12, 10, label, maxWidth);
    ctx.fillText(label, x, y);

    ctx.fillStyle = '#fff0b8';
    this.setFittedFont('700', 18, 15, value, maxWidth);
    ctx.fillText(value, x, y + 20);
    ctx.restore();
  }

  private setFittedFont(weight: string, baseSize: number, minSize: number, text: string, maxWidth = this.size.width - 32): void {
    const ctx = this.context;
    const maxTextWidth = Math.max(80, maxWidth);
    let fontSize = baseSize;

    ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;

    while (fontSize > minSize && ctx.measureText(text).width > maxTextWidth) {
      fontSize -= 1;
      ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
    }
  }
}
