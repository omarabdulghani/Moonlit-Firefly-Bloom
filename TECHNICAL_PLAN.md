# TECHNICAL_PLAN.md

# Technical Plan

## Recommended Stack

- Vite.
- TypeScript.
- HTML Canvas.
- CSS.
- `localStorage` for best score.
- No backend for MVP.

## Proposed Folder Structure

```text
moonlit-firefly-bloom/
  index.html
  package.json
  src/
    main.ts
    styles.css
    game/
      Game.ts
      types.ts
      constants.ts
      input.ts
      storage.ts
      math.ts
      collision.ts
      render.ts
      entities/
        Firefly.ts
        MoonlightOrb.ts
        ShadowHazard.ts
        BloomTrail.ts
```

Keep this structure flexible. If the MVP is clearer with fewer files, use fewer files.

## Core Modules and Classes

- `Game`: owns game state, loop timing, update, render, restart, and high-level coordination.
- `Firefly`: player position, velocity, radius, glow, and movement update.
- `MoonlightOrb`: collectible position, radius, value, and restore amount.
- `ShadowHazard`: hazard position, radius or shape, damage behavior, and visual pulse.
- `BloomTrail`: bloom marks or low-resolution coverage data.
- `input`: keyboard, pointer, and touch state.
- `render`: canvas drawing helpers.
- `collision`: circle overlap and simple spatial checks.
- `storage`: best score read/write through `localStorage`.

Avoid turning these into a large engine. Add only what the MVP needs.

## Game States

- `ready`: initial screen or first-run prompt.
- `playing`: active gameplay.
- `gameOver`: final score, best score, and retry.

Optional later:

- `paused`, only if truly needed.

## Input Handling Plan

Desktop:

- Support `WASD` and arrow keys.
- Normalize diagonal movement.
- Consider pointer-follow movement only if it improves feel.

Mobile:

- Support touch and drag.
- The firefly should move toward the touch target or follow a virtual direction based on drag.
- Avoid tiny on-screen controls for the MVP.
- Prevent page scrolling while interacting with the canvas.

Shared:

- Store input in a simple state object.
- Let the game loop consume input every frame.
- Keep movement tunable through constants.

## Rendering Plan

- Use a single full-screen or fixed-aspect canvas fitted to the viewport.
- Draw background first.
- Draw bloom marks below entities.
- Draw moonlight orbs and shadows.
- Draw the firefly glow and body last.
- Draw UI overlays for score, glow meter, and game over.

Visual priorities:

- Readable contrast.
- Soft glow around the player.
- Clear shadow boundaries.
- Bloom marks visible but not cluttered.

## Collision Plan

- Use circle collision for MVP entities.
- Firefly vs moonlight orb: collect, add score, restore glow, respawn orb.
- Firefly vs shadow hazard: drain glow while overlapping.
- Firefly vs bloom cells or marks: score only when blooming new area.

Avoid complex polygon collision in the MVP.

## Scoring Plan

- Add points for each moonlight orb collected.
- Add small points for newly bloomed space.
- Track current score in memory.
- Track best score in `localStorage`.
- Keep numbers easy to read.

Example starting values:

- Moonlight orb: 100 points.
- New bloom mark or cell: 5 to 10 points.

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
- Keep bloom rendering simple.
- Limit the number of active orbs and shadows.
- Avoid expensive per-pixel effects in the first version.
- Cap or recycle bloom marks if needed.
- Profile only after basic playability exists.
