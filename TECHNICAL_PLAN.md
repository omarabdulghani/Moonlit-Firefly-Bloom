# TECHNICAL_PLAN.md

# Technical Plan

## Recommended Stack

- Vite.
- TypeScript.
- HTML Canvas.
- CSS.
- `localStorage` for best score.
- No backend for MVP.

## Current Folder Structure

```text
moonlit-firefly-bloom/
  index.html
  package.json
  public/
    assets/
      background/
    sounds/
  src/
    main.ts
    styles.css
    audio/
      AudioManager.ts
    game/
      Game.ts
      types.ts
      Firefly.ts
      MoonlightOrb.ts
      MoonShieldPowerup.ts
      Powerup.ts
      ShadowHazard.ts
    input/
      InputManager.ts
    render/
      CanvasRenderer.ts
```

Keep the structure flexible. Avoid adding an engine layer unless the current files become genuinely hard to work with.

## Core Modules and Classes

- `main.ts`: owns browser setup, canvas sizing, cursor visibility, pause triggers, and the animation frame loop.
- `Game`: owns game state, update logic, run reset, score, powerups, Moon Rain, pause/resume, and render snapshots.
- `Firefly`: player position, velocity, radius, glow, and movement update.
- `MoonlightOrb`: collectible position, radius, value, and restore amount.
- `ShadowHazard`: hazard position, radius or shape, damage behavior, and visual pulse.
- `MoonShieldPowerup`: rare shield pickup.
- `Powerup`: shared special pickup model for Moon Dash and Glow Surge/x2.
- `InputManager`: keyboard, pointer, and touch state.
- `CanvasRenderer`: all canvas drawing, background assets, ambient birds/stars, gameplay objects, HUD, start, pause, and game over overlays.
- `AudioManager`: browser-safe audio loading, unlock, one-shot sounds, looping Moon Rain ambience, and stoppable warning sounds.
- `Game` local storage helpers: best score read/write through `localStorage`.

Avoid turning these into a large engine. Add only what the MVP needs.

## Game States

- `ready`: initial screen or first-run prompt.
- `playing`: active gameplay.
- `paused`: gameplay timers are frozen until the player resumes.
- `gameOver`: final score, best score, and retry.

## Input Handling Plan

Desktop:

- Support `WASD` and arrow keys.
- Normalize diagonal movement.
- Support pointer/mouse movement.
- Hide the cursor during active mouse play, then reveal it briefly when the player moves or clicks.
- Pressing `Esc` pauses the run.

Mobile:

- Support touch and drag.
- The firefly should move toward the touch target or follow a virtual direction based on drag.
- Avoid tiny on-screen controls for the MVP.
- Prevent page scrolling while interacting with the canvas.

Shared:

- Store input in a simple state object.
- Let the game loop consume input every frame.
- Keep movement tunable through constants.
- Clear input when pausing to avoid stale movement or queued clicks.
- Browser blur, page hide, and tab visibility changes pause the game while a run is active.

## Rendering Plan

- Use a single full-screen or fixed-aspect canvas fitted to the viewport.
- Draw background first.
- Draw Moon Rain falling light behind gameplay objects.
- Draw shadows, moonlight orbs, powerups, and the firefly.
- Draw the firefly glow and body last.
- Draw UI overlays for score, glow meter, start, pause, and game over.

Visual priorities:

- Readable contrast.
- Soft glow around the player.
- Clear shadow boundaries.
- Reward effects visible but not cluttered.
- Background atmosphere behind gameplay.

## Collision Plan

- Use circle collision for MVP entities.
- Firefly vs moonlight orb: collect, add score, restore glow, respawn orb.
- Firefly vs shadow hazard: drain glow while overlapping.
- Firefly vs powerup: apply the temporary/instant powerup effect, play feedback, and remove the pickup.

Avoid complex polygon collision in the MVP.

## Scoring Plan

- Add points for each moonlight orb collected.
- Add a small bonus for Bloom Burst.
- Track current score in memory.
- Track best score in `localStorage`.
- Keep numbers easy to read.

Example starting values:

- Moonlight orb: 100 points.
- Bloom Burst: 150 points.

Tune after playtesting.

## localStorage Plan

- Store only best score in MVP.
- Use a single key such as `moonlitFireflyBloom.bestScore`.
- Handle missing, invalid, or blocked storage gracefully.
- Do not require accounts or network access.

## Mobile Responsiveness Plan

- Canvas should resize with the viewport.
- Use device pixel ratio scaling for crisp rendering.
- Keep UI large enough for mobile.
- Keep the playfield safe from browser chrome and touch edge conflicts.
- Test portrait and landscape layouts.
- Prefer simple responsive CSS over layout frameworks.

## Audio Plan

- Keep sound optional by browser behavior: unlock after user interaction.
- Use public runtime paths under `/sounds/`.
- Use cooldowns for repeated sounds such as shadow damage.
- Stop low-glow warning immediately when glow recovers, the run ends, or the game pauses.
- Stop Moon Rain ambience when Moon Rain ends, the run pauses, or the run ends.
- Do not add sound settings until the core loop is stable enough to justify the extra UI.

## Pause/Resume Plan

- Treat pause as a real game state, not a visual-only overlay.
- While paused, do not advance gameplay timers, passive drain, shadow damage, powerup timers, Moon Rain timers, orb lifetimes, or audio warnings.
- Resume on click/tap from the pause overlay.
- Use a calm, in-world pause overlay so it feels like the firefly is waiting instead of the game breaking.

## Future Mobile Packaging Note

- The current priority is a browser-first MVP.
- Keep the game mobile-aware and touch-friendly.
- Future iOS/Android packaging may happen later through a web-to-native wrapper such as Capacitor.
- Do not implement native mobile packaging, PWA setup, app icons, manifests, splash screens, or store files until explicitly requested.
- Avoid unnecessary dependencies and browser assumptions that would make future mobile packaging difficult.
- Keep core game logic separate from browser-specific UI where reasonable.
- Keep the canvas responsive and touch controls supported.

## Performance Considerations

- Use `requestAnimationFrame`.
- Use delta time for frame-rate-independent movement.
- Keep reward effects and Moon Rain rendering lightweight.
- Limit the number of active orbs and shadows.
- Avoid expensive per-pixel effects in the first version.
- Recycle simple visual effects where possible.
- Profile only after basic playability exists.
