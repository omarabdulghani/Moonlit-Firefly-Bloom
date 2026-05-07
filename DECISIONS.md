# DECISIONS.md

# Decision Log

Use this file for important project decisions. Add a new entry when a choice affects scope, architecture, gameplay direction, controls, persistence, or visual identity.

## Template

- Date: `YYYY-MM-DD`
- Decision:
- Reason:
- Alternatives considered:

## Initial Decisions

### Minimal Vite Shell for Phase 1

- Date: `2026-05-07`
- Decision: Start with a small Vite + TypeScript shell using a dedicated `Game`, `CanvasRenderer`, and `InputManager`.
- Reason: This gives the project a clear place for the loop, rendering, and state input without adding gameplay systems before they are needed.
- Alternatives considered: Put all code in `main.ts`, scaffold a larger engine-style folder structure, add a rendering or game framework.

### Shared Movement Input Snapshot

- Date: `2026-05-07`
- Decision: Represent movement as a simple input snapshot with normalized keyboard direction and optional pointer target.
- Reason: This keeps desktop and mobile controls in one readable path while preserving the smooth, floaty firefly movement feel.
- Alternatives considered: Separate desktop and mobile movement systems, on-screen virtual joystick, mouse-follow-only control.

### In-Memory Phase 3 Score

- Date: `2026-05-07`
- Decision: Track only the current run score in memory while moonlight orbs respawn after collection.
- Reason: Phase 3 should test whether collecting glowing targets feels good without adding persistence, final score flow, or broader progression yet.
- Alternatives considered: Best score in `localStorage`, final score screen changes, collectible streaks, combo scoring.

### Distance-Spaced Bloom Marks

- Date: `2026-05-07`
- Decision: Create capped, distance-spaced bloom marks that add a small score reward when placed.
- Reason: This makes movement visibly beautify the garden without spawning marks every frame or introducing a heavier bloom coverage system too early.
- Alternatives considered: Time-only spawning, particle trail, canvas pixel coverage, grid-based bloom coverage.

### Fading Moonlight Trail Replaces Bloom Marks

- Date: `2026-05-07`
- Decision: Replace persistent flower-style bloom marks with short-lived fading moonlight trail segments, and remove trail-based score rewards.
- Reason: The flower marks made the screen too cluttered and felt less like a firefly painting the dark with moonlight. Current score should stay tied only to moonlight orb collection.
- Alternatives considered: Keeping capped flower marks, reducing bloom score only, making flowers fade slowly, grid-based bloom coverage.

### Directional Streak Trail

- Date: `2026-05-07`
- Decision: Render moonlight trail segments as short tapered streaks aligned to firefly movement, with length scaling slightly by speed.
- Reason: Directional streaks better match the firefly/comet fantasy than fading circles while preserving the temporary, capped trail system.
- Alternatives considered: Keeping circular fades, drawing one continuous line behind the firefly, adding a particle system, using image assets.

### Continuous Ribbon Trail

- Date: `2026-05-07`
- Decision: Replace discrete streak segments with a fading history of firefly positions rendered as a thin glowing ribbon path.
- Reason: A connected ribbon reads more like graceful long-exposure firefly light and less like separate stamped trail pieces.
- Alternatives considered: Keeping directional streaks, drawing thicker comet dashes, using particles, adding image-based trail assets.

### Trail Removed for MVP Clarity

- Date: `2026-05-07`
- Decision: Remove the firefly trail entirely for now and rely on a clean warm firefly glow.
- Reason: The trail iterations were distracting from readability and the core fun test. The MVP should first prove movement, orb collection, future shadow avoidance, and retry.
- Alternatives considered: Keeping the ribbon trail, returning to directional streaks, adding smaller trail particles, delaying the decision until after hazards.

### Glow Meter and Simple Shadow Hazards

- Date: `2026-05-07`
- Decision: Add one drifting circular shadow hazard type, with four active shadows draining a 0-100 glow meter while moonlight orbs restore 12 glow.
- Reason: This introduces gentle survival tension without adding enemies, complex behaviors, or extra scoring systems.
- Alternatives considered: Instant death on shadow touch, stationary-only hazards, multiple enemy types, time-based glow drain.

### Passive Glow Drain and Feedback Tuning

- Date: `2026-05-07`
- Decision: Add a slow passive glow drain, smaller moonlight orb visuals, glow-reactive firefly aura, and subtle collection/shadow-contact feedback.
- Reason: These changes make the existing loop clearer and more active without adding new systems, scoring rules, or progression.
- Alternatives considered: Keeping pressure only from shadows, larger collectible visuals, particle-based feedback, stronger warning effects.

### Local Best Score and Run Summary

- Date: `2026-05-07`
- Decision: Add a simple game over summary with final score, local best score, time survived, and moonlight orbs collected.
- Reason: The end of a run should clearly explain what happened and encourage an immediate retry without adding accounts, online leaderboards, upgrades, or extra menus.
- Alternatives considered: No best score, online leaderboard, detailed stats screen, achievements, progression rewards.

### Tiny Presentation Polish

- Date: `2026-05-07`
- Decision: Clean up debug-feeling UI text, clarify the start prompt, and add a subtle translucent panel behind the game over summary.
- Reason: The MVP should feel more intentional and readable without changing gameplay tuning or adding menus, sound, particles, progression, or other systems.
- Alternatives considered: Full menu screens, larger HUD redesign, additional visual effects, leaving the UI in a debug-like state.

### Simplified Rooftop Background

- Date: `2026-05-07`
- Decision: Remove the ambiguous bottom placeholder rectangles and use one grounded rooftop ledge with a faint anchored railing.
- Reason: The background should read as intentional balcony atmosphere across screen sizes without competing with the firefly, orbs, shadows, or HUD.
- Alternatives considered: Keeping the old block shapes, adding more city silhouettes, building a more detailed rooftop scene, removing the bottom structure entirely.

### Mobile Viewport and Touch QA Fixes

- Date: `2026-05-07`
- Decision: Size the canvas to the visible viewport, prevent mobile overscroll, slightly compact the narrow HUD, and offset touch targets above the finger.
- Reason: The MVP should remain playable and readable on phone-sized screens without adding virtual buttons, menus, new controls, or gameplay changes.
- Alternatives considered: Virtual joystick UI, mobile-only movement tuning, leaving touch directly under the finger, relying only on `100vh`.

### Browser-First

- Date: `YYYY-MM-DD`
- Decision: Build Moonlit Firefly Bloom as a browser-first game.
- Reason: The game should be easy to run, share, iterate on, and test across desktop and mobile without installers.
- Alternatives considered: Native desktop build, mobile app build, game engine export.

### TypeScript + Canvas

- Date: `YYYY-MM-DD`
- Decision: Use TypeScript with HTML Canvas for the MVP.
- Reason: Canvas is enough for a small 2D arcade game, TypeScript improves maintainability, and the stack stays lightweight for a solo developer.
- Alternatives considered: Plain JavaScript, React-heavy DOM rendering, Phaser, PixiJS, Unity, Godot.

### localStorage Only

- Date: `YYYY-MM-DD`
- Decision: Store only local best score with `localStorage`.
- Reason: The MVP does not need accounts, servers, or online persistence. Local best score supports replayability without adding infrastructure.
- Alternatives considered: Backend database, browser IndexedDB, cloud saves, online leaderboard.

### No Multiplayer in MVP

- Date: `YYYY-MM-DD`
- Decision: Multiplayer is out of scope for the MVP.
- Reason: The prototype should test the core solo loop before adding networking, matchmaking, synchronization, or social features.
- Alternatives considered: Local co-op, ghost runs, online multiplayer, shared garden.

### Glow Meter Instead of Instant Death

- Date: `YYYY-MM-DD`
- Decision: Use a glow meter that drains from shadow contact instead of instant death.
- Reason: A meter is more forgiving, fits the cozy tone, and creates recovery moments through moonlight collection.
- Alternatives considered: One-hit death, multiple hearts, time limit, shield charges.

### Single Arena MVP

- Date: `YYYY-MM-DD`
- Decision: Build one arena for the first playable version.
- Reason: A single arena keeps scope contained and makes tuning movement, hazards, bloom coverage, and scoring easier.
- Alternatives considered: Multiple levels, scrolling world, procedural map, biome progression.

### Cozy Arcade Direction

- Date: `YYYY-MM-DD`
- Decision: Aim for cozy arcade play: simple rules, gentle atmosphere, fast retries, and score chasing.
- Reason: This direction supports replayability while keeping the project small and approachable.
- Alternatives considered: Narrative adventure, idle progression game, puzzle game, roguelite upgrade game.
