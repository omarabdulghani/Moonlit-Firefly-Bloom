# TASKS.md

# Tasks

Small, checkable tasks for building the Moonlit Firefly Bloom MVP.

## Phase 0: Project Setup and Docs

- [x] Create `README.md`.
- [x] Create `AGENTS.md`.
- [x] Create `GAME_DESIGN.md`.
- [x] Create `MVP_SCOPE.md`.
- [x] Create `TECHNICAL_PLAN.md`.
- [x] Create `TASKS.md`.
- [x] Create `DECISIONS.md`.
- [x] Scaffold Vite + TypeScript project.
- [x] Add basic CSS reset and page layout.
- [x] Confirm `npm install` and `npm run dev` work.

## Phase 1: Basic Canvas and Game Loop

- [x] Add full-screen or viewport-fitted canvas.
- [x] Scale canvas for device pixel ratio.
- [x] Create `Game` loop with `requestAnimationFrame`.
- [x] Add delta time calculation.
- [x] Clear and redraw the canvas each frame.
- [x] Add temporary debug drawing to confirm rendering.

## Phase 2: Firefly Movement and Input

- [x] Add firefly position, radius, speed, and velocity.
- [x] Implement keyboard input with `WASD`.
- [x] Implement keyboard input with arrow keys.
- [x] Normalize diagonal movement.
- [x] Add touch or pointer movement.
- [x] Keep the firefly inside the playfield.
- [x] Tune acceleration, damping, or direct movement feel.

## Phase 3: Collectibles and Scoring

- [x] Add moonlight orb entity.
- [x] Spawn several moonlight orbs in the arena.
- [x] Detect firefly and orb collisions.
- [x] Remove or respawn collected orbs.
- [x] Add score for collected orbs.
- [x] Display current score.
- [x] Tune orb size, color, and collection value.

## Phase 4: Bloom Trail

- [x] Add bloom marks behind the firefly.
- [x] Avoid spawning too many bloom marks per second.
- [x] Score only newly bloomed space or newly placed marks.
- [x] Render blooms below the firefly and collectibles.
- [x] Tune bloom size and spacing.
- [x] Add simple flower visual variation.

Phase 4 was corrected by Phase 4.5. Persistent flower-style bloom marks are no longer active in gameplay.

## Phase 4.5: Fading Moonlight Trail Correction

- [x] Remove persistent flower-style bloom mark code.
- [x] Remove score rewards from trail placement.
- [x] Add fading moonlight trail segments behind the firefly.
- [x] Space trail segments by movement distance.
- [x] Fade and remove trail segments automatically.
- [x] Limit active trail segments for performance.
- [x] Render the trail below moonlight orbs and the firefly.
- [x] Clear the trail on run start or restart.

## Phase 4.6: Directional Firefly Streak Trail

- [x] Store movement direction on trail segments.
- [x] Scale streak length subtly by firefly speed.
- [x] Render trail segments as tapered directional streaks.
- [x] Keep the trail temporary, capped, and reset per run.
- [x] Preserve orb-only scoring.
- [x] Keep gameplay systems unchanged.

## Phase 4.7: Remove Trail for MVP Clarity

- [x] Remove current moonlight trail data and update logic.
- [x] Remove current moonlight trail rendering.
- [x] Delete unused trail file.
- [x] Keep the firefly readable with a clean warm glow.
- [x] Preserve orb-only scoring.
- [x] Preserve existing movement, orb, score, and debug game over behavior.

## Phase 5: Shadow Hazards and Glow Meter

- [x] Add shadow hazard entity.
- [x] Spawn a small number of hazards.
- [x] Detect firefly and shadow overlap.
- [x] Drain glow while overlapping shadows.
- [x] Add glow meter UI.
- [x] Restore glow when collecting moonlight.
- [x] Clamp glow between zero and maximum.
- [x] Tune hazard damage and glow restore values.
- [x] Trigger game over when glow reaches zero.

## Phase 5.1: Core Gameplay Feel Tuning

- [x] Add slow passive glow drain during play.
- [x] Make firefly aura subtly reflect current glow.
- [x] Add short firefly glow pulse on moonlight orb collection.
- [x] Add subtle firefly dim/flicker while touching shadows.
- [x] Make moonlight orbs visually smaller while keeping collision forgiving.
- [x] Refine shadow visuals without adding new enemy behavior.
- [x] Preserve existing score, controls, states, and reset behavior.

## Phase 6: Game Over and Restart

- [x] End the run when glow reaches zero.
- [x] Show game over overlay.
- [x] Show final score.
- [x] Save best score with `localStorage`.
- [x] Show best score.
- [x] Track moonlight orbs collected per run.
- [x] Show time survived.
- [x] Add retry button or tap-to-retry behavior.
- [x] Reset all run state on retry.

## Phase 7: Juice and Polish

- [x] Remove debug-feeling state text from the playing HUD.
- [x] Keep the playing HUD focused on score, time, and glow.
- [x] Clarify the start screen with the core objective and start prompt.
- [x] Add a subtle translucent panel behind the game over summary.
- [x] Improve game over spacing and score hierarchy.
- [x] Remove the debug shortcut note from player-facing UI.
- [x] Preserve gameplay tuning and avoid new systems.

## Phase 7.1: Background Cleanup

- [x] Remove ambiguous bottom placeholder rectangles.
- [x] Replace the bottom area with one simple grounded rooftop ledge.
- [x] Add only a faint anchored railing treatment for balcony readability.
- [x] Keep the background minimal and secondary to gameplay.
- [x] Preserve gameplay tuning, HUD behavior, and run flow.

## Phase 7.2: Core Fun Pass

- [x] Add stronger shadow-contact feedback with a brief dark vignette flash.
- [x] Make the firefly dim and flicker more clearly while touching shadows.
- [x] Trigger Bloom Burst when collecting moonlight at high or full glow.
- [x] Add a short Bloom Burst ring, glow pulse, and `Bloom!` text.
- [x] Award a small Bloom Burst bonus score.
- [x] Push nearby shadows away slightly during Bloom Burst.
- [x] Track Bloom Bursts per run and show the count on game over.
- [x] Preserve existing movement, glow drain, orb restore, hazard count, and core loop tuning.

## Phase 7.3: Night Level Escalation

- [x] Add in-run Night Level starting at 1.
- [x] Increase Night Level from Bloom Burst count.
- [x] Show current Night Level in the gameplay HUD.
- [x] Show a short level-up message when the night deepens.
- [x] Increase passive glow drain gently by Night Level.
- [x] Increase shadow drift speed gently by Night Level.
- [x] Add extra shadows at higher Night Levels, capped for readability.
- [x] Track and show highest Night Level reached on game over.
- [x] Preserve Bloom Burst scoring, orb scoring, movement, restart flow, and best score behavior.

## Phase 7.4: Infinite Night Pacing

- [x] Keep Night Level infinite with no fixed level cap.
- [x] Slow Night progression to three Bloom Bursts per Night Level.
- [x] Add a short Bloom Burst cooldown to prevent rapid repeats.
- [x] Make Bloom Burst spend glow after triggering.
- [x] Preserve Bloom Burst bonus score, visual pulse, text, and shadow push.
- [x] Keep gradual passive drain and shadow speed scaling by Night Level.
- [x] Keep shadow count capped for readability and performance.
- [x] Show deepest Night reached on game over.
- [x] Preserve movement, orb values, shadow damage, restart flow, best score, and mobile behavior.

## Phase 7.5: Moon Shield Powerup

- [x] Add one rare Moon Shield pickup entity.
- [x] Delay first Moon Shield spawn and respawn it only occasionally.
- [x] Spawn Moon Shield away from the firefly, shadows, and moonlight orbs.
- [x] Activate a temporary shield when collected.
- [x] Prevent shadow damage while Moon Shield is active.
- [x] Keep passive glow drain, orb collection, Bloom Burst, Night Level, and scoring unchanged.
- [x] Render a distinct cyan/silver Moon Shield pickup.
- [x] Render a protective aura around the firefly while shielded.
- [x] Show Moon Shield remaining time in the HUD while active.
- [x] Reset Moon Shield pickup, timer, and shield state on new run.

## Phase 7.6: Subtle Rooftop Background Atmosphere

- [x] Refine the code-drawn night sky gradient.
- [x] Keep the moon soft, pale, and low-distraction.
- [x] Add a low-contrast distant city skyline.
- [x] Add sparse, dim window lights for rooftop-city mood.
- [x] Clarify the balcony ledge and railing as background scenery.
- [x] Add subtle plant silhouettes anchored to the bottom corners.
- [x] Keep all background elements behind gameplay and low contrast.
- [x] Preserve gameplay, HUD, input, scoring, powerup, and restart behavior.

## Phase 7.7: Transparent Background Asset Layers

- [x] Copy transparent background PNGs into a Vite public asset path.
- [x] Use simple runtime paths for skyline, railing, and plant assets.
- [x] Replace the code-drawn skyline, railing, and plant silhouettes.
- [x] Keep the sky gradient and moon code-drawn.
- [x] Add sparse deterministic stars with canvas drawing.
- [x] Render skyline, railing, and plant assets behind gameplay.
- [x] Position background assets responsively for desktop and mobile.
- [x] Preserve gameplay, HUD, input, scoring, powerup, and restart behavior.

## Phase 8: Mobile Testing

- [x] Check canvas sizing against visible mobile viewport behavior.
- [x] Keep the canvas fixed to the visible viewport without page scrolling.
- [x] Add a small touch-only offset so the firefly stays visible under finger control.
- [x] Reduce HUD font and glow bar width on narrow screens.
- [x] Check that start screen text uses fitted canvas fonts.
- [x] Check that game over panel and text fit narrow/mobile screens.
- [x] Preserve gameplay tuning and avoid mobile-only gameplay systems.

## Phase 9: MVP Playtest Checklist

- [ ] Can a new player understand the goal quickly?
- [ ] Is movement fun on its own?
- [ ] Is collecting moonlight satisfying?
- [ ] Is blooming visible and rewarding?
- [ ] Are shadows readable and fair?
- [ ] Does glow loss feel clear?
- [ ] Does the player want to retry?
- [ ] Does best score persist after refresh?
- [ ] Is the MVP still small?
