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

### Bloom Burst and Stronger Shadow Feedback

- Date: `2026-05-09`
- Decision: Add a brief Bloom Burst reward when collecting moonlight at high/full glow, plus stronger shadow-contact feedback through firefly dimming and a short dark vignette flash.
- Reason: The core loop needed a clearer negative moment for being drained and a small positive "yes" moment for collecting light while already glowing, without adding upgrades, combos, particles, sound, menus, or new enemies.
- Alternatives considered: Combo scoring, permanent upgrades, destroying shadows, sound feedback, particle bursts, leaving orb collection and shadow contact as flat visual events.

### In-Run Night Level Escalation

- Date: `2026-05-09`
- Decision: Add Night Level as an in-run escalation value driven by Bloom Burst count, with gentle passive drain, shadow speed, and shadow count scaling.
- Reason: Runs need a clearer sense of progress and danger without introducing permanent upgrades, currencies, maps, menus, or new enemy types.
- Alternatives considered: Permanent leveling, score multipliers, survival-time scoring, multiple levels, new hazards, leaving run difficulty flat.

### Infinite Night Pacing

- Date: `2026-05-09`
- Decision: Keep Night Level infinite, slow progression to three Bloom Bursts per Night, and make Bloom Burst use a short cooldown plus a glow cost.
- Reason: Reaching deeper Nights should feel earned, and Bloom Burst should create a charge-up and release rhythm rather than an automatic repeated bonus.
- Alternatives considered: Capping Night Level, keeping two Bloom Bursts per Night, removing Bloom Burst score, adding score multipliers, adding permanent progression.

### Moon Shield Temporary Powerup

- Date: `2026-05-09`
- Decision: Add one rare Moon Shield pickup that grants a short shield against shadow damage only.
- Reason: A temporary shield creates a lucky risk/reward moment and a brief safety window without adding an inventory, upgrade tree, shop, multiple powerups, or permanent progression.
- Alternatives considered: Multiple powerups, permanent shield upgrades, invincibility against all drain, speed boost, magnet pickup, leaving runs without rare pickup moments.

### Code-Drawn Rooftop Atmosphere

- Date: `2026-05-09`
- Decision: Add a low-contrast, code-drawn rooftop background with a night sky gradient, soft moon, distant skyline, balcony railing, and subtle plant silhouettes.
- Reason: The scene should feel more like a moonlit rooftop balcony while keeping the firefly, orbs, shadows, powerups, and HUD easy to read.
- Alternatives considered: Imported background art, detailed skyline assets, animated scenery, brighter window lights, leaving the background plain.

### Transparent Background Asset Layers

- Date: `2026-05-09`
- Decision: Use real transparent PNG layers for the skyline, railing, and plant silhouettes, while keeping the sky, stars, and moon code-drawn.
- Reason: Layered assets make the rooftop scene feel more intentional without replacing the whole background or making gameplay readability depend on one full-screen image.
- Alternatives considered: Keeping all background details code-drawn, importing one full background image, animating scenery, adding a larger asset pipeline.

### Background Asset Opacity Tuning

- Date: `2026-05-10`
- Decision: Increase the railing and plant silhouette opacity slightly while leaving skyline opacity and layout unchanged.
- Reason: The railing and plants should feel more physical and intentional, especially on mobile, without competing with gameplay elements.
- Alternatives considered: Brightening all background assets, changing layout, replacing assets, leaving the railing and plants very faint.

### HUD and Game Over UI Polish

- Date: `2026-05-10`
- Decision: Polish the HUD and game over screen with code-drawn panels, warmer copy, clearer stat hierarchy, and a more magical glow meter.
- Reason: The game should feel less prototype-like while preserving the existing gameplay loop, scoring, powerups, background assets, and restart flow.
- Alternatives considered: New UI image assets, a full menu redesign, additional stats, settings screens, leaving the HUD and game over screen plain.

### Moon Phase Cycle

- Date: `2026-05-10`
- Decision: Derive a repeating visual moon phase cycle from infinite Night Level, with phase names shown during Night-change feedback.
- Reason: Moon phases add atmospheric run identity and progression without changing gameplay or introducing Full Moon events yet.
- Alternatives considered: Fixed moon art, random moon phases, gameplay-affecting Full Moon challenges, permanent progression, adding moon phase HUD clutter.

### Moon Phase Polish

- Date: `2026-05-10`
- Decision: Start the moon cycle at Full Moon, remove the hard moon outline, and crossfade phase visuals over a short transition.
- Reason: The moon should feel softer, more natural, and more beautiful while remaining a visual progression layer only.
- Alternatives considered: Keeping New Moon as Night 1, instant phase swaps, hard phase outlines, adding Full Moon gameplay events.

### Full Moon Trial - Moon Rain

- Date: `2026-05-10`
- Decision: Trigger a short Moon Rain event on later Full Moons, adding extra moonlight orbs and slightly faster shadows for limited-time pressure.
- Reason: Later Full Moons should feel special and rewarding without adding ads, upgrades, new enemies, new powerups, score multipliers, or a separate game mode.
- Alternatives considered: Triggering Moon Rain on Night 1, adding Full Moon score multipliers, spawning extra shadows, creating a new orb type, leaving Full Moons visual-only.

### Moon Rain Falling Light Effect

- Date: `2026-05-14`
- Decision: Add a lightweight code-drawn falling moonlight effect that appears only while Moon Rain is active and renders behind gameplay objects.
- Reason: Moon Rain should feel like a visible special event without obscuring the firefly, orbs, shadows, powerups, or HUD, and without changing any gameplay values.
- Alternatives considered: Heavy particle systems, realistic water rain, foreground rain over gameplay, adding lightning/storm effects, leaving Moon Rain as a sound/gameplay-only event.

### Essential Sound Effects

- Date: `2026-05-13`
- Decision: Add lightweight sound feedback through a small audio manager with per-sound volume balancing, cooldowns for frequent cues, and browser audio unlock after player interaction.
- Reason: Audio should make collecting light, taking shadow damage, Bloom Bursts, Moon Rain, Moon Shield, run start, and game over feel more alive without changing gameplay or adding settings/menu scope.
- Alternatives considered: No sound, a larger audio engine, music systems, a settings menu, uncapped repeated sound playback.

### Moon Dash and Glow Surge Powerups

- Date: `2026-05-14`
- Decision: Add two temporary special pickups: Moon Dash for a short speed boost and Glow Surge for an instant 50-glow refill, with limited lifetimes and a more generous early-run spawn cadence before the first later Full Moon cycle.
- Reason: The run needed more immediately rewarding collectible moments without adding permanent upgrades, currencies, shops, achievements, menus, new enemies, or online systems.
- Alternatives considered: Permanent upgrades, combo multipliers, negative powerups, inventory systems, increasing normal orb rewards, leaving early runs dependent only on moonlight orbs and Moon Shield.

### Powerup Clarity and Separate Pickup Sounds

- Date: `2026-05-14`
- Decision: Make Moon Dash green/electric with a lightning icon and a stronger temporary speed multiplier, keep Glow Surge gold with an `x2` icon, and give each new powerup its own pickup sound.
- Reason: The new pickups should be recognizable at a glance and feel more satisfying without changing their spawn rules, adding new systems, or reusing the Moon Shield sound for unrelated effects.
- Alternatives considered: Keeping the cyan speed visual, keeping the plus icon, using the Moon Shield sound for all powerups, adding a settings menu, adding new powerup types.

### Powerup Feedback and Orb Lifecycle

- Date: `2026-05-14`
- Decision: Add color-matched HUD feedback for powerups, show a short Glow Surge reward message, let normal moonlight orbs expire and respawn, make Moon Shield and Moon Dash restore normal orb glow, and allow high-glow Glow Surge pickups to trigger Bloom Burst.
- Reason: Powerups and moonlight should feel clearer, more rewarding, and more alive without adding new pickup types, menus, upgrades, economies, enemies, maps, or monetization.
- Alternatives considered: Permanent HUD panels, new combo systems, new powerup types, stronger global rebalance, leaving normal orbs static forever, keeping shield/speed pickups as effect-only rewards.

### Shield Icon and x2 Text Polish

- Date: `2026-05-14`
- Decision: Refine the code-drawn Moon Shield pickup into a clearer classic shield silhouette and remove the stroke from the Glow Surge `x2` text.
- Reason: The shield should read as protective at small size, and the `x2` mark should feel cleaner without changing gameplay, sounds, HUD behavior, powerup effects, or adding new assets.
- Alternatives considered: Importing shield art, tracing the reference image, adding more icon details, keeping the abstract shield shape, keeping the heavier outlined `x2` text.

### Desktop Cursor Auto-Hide and Low-Glow Audio Stop

- Date: `2026-05-14`
- Decision: Hide the cursor during active mouse play, reveal it briefly on mouse movement/click, and stop the low-glow warning sound as soon as glow recovers.
- Reason: Mouse play should feel more immersive without trapping the player, and warning audio should match the current danger state instead of continuing after the player fixes the problem.
- Alternatives considered: Always hiding the cursor, always showing the cursor, leaving the heartbeat sound as a fire-and-forget cue, adding a settings menu.

### Moon Shield Also Stops Passive Glow Drain

- Date: `2026-05-14`
- Decision: Moon Shield now prevents passive glow drain while active in addition to blocking shadow damage.
- Reason: Shield should feel like a true protection moment, not only a shadow-contact modifier, while remaining temporary and run-only.
- Alternatives considered: Keeping passive drain during shield, increasing shield duration, adding a second shield meter, making shield restore glow.

### Stronger Shadow Drain Visual

- Date: `2026-05-14`
- Decision: Add a stronger local danger visual when touching shadows: a brief violet/red drain halo, ring, and inward streaks around the firefly.
- Reason: Shadow contact needed to feel immediately dangerous and readable without changing damage numbers or becoming visually harsh.
- Alternatives considered: More screen shake, louder audio, increased damage, full-screen flash only, adding new shadow behavior.

### Glow Surge Reward Layer

- Date: `2026-05-14`
- Decision: Add a dedicated gold x2 surge visual when collecting Glow Surge, designed to sit inside or alongside Bloom Burst when both happen together.
- Reason: The x2 pickup should feel like a big reward while keeping Bloom Burst readable and avoiding overlapping effects that feel messy.
- Alternatives considered: Reusing Bloom Burst only, adding particles, changing x2 scoring, adding a separate combo system.

### Ambient Sky Companions

- Date: `2026-05-14`
- Decision: Add subtle animated night birds, extra twinkling stars, and rare shooting stars as background atmosphere only.
- Reason: The rooftop should feel less empty and more alive while preserving gameplay readability and avoiding new mechanics.
- Alternatives considered: Static birds, image-based bird assets, foreground birds, interactive birds, adding weather systems.

### Pause and Resume as a First-Class State

- Date: `2026-05-14`
- Decision: Add a real paused state triggered by `Esc`, browser blur, tab hiding, and page hiding, with a calm resume overlay.
- Reason: Leaving the browser or pausing should not keep draining glow or accidentally end the run; the firefly should feel like it is waiting for the player.
- Alternatives considered: Visual-only pause overlay, no pause on blur, only keyboard pause, continuing timers while paused, full pause menu.

### Pause Overlay Spacing Polish

- Date: `2026-05-14`
- Decision: Rebalance the pause overlay spacing so the crescent, title, subtitle, Resume button, helper text, and panel padding feel tidy and intentional.
- Reason: The pause overlay should feel like part of the game aesthetic, not a temporary debug panel, while preserving the existing pause behavior.
- Alternatives considered: Larger redesign, adding decorative art, moving pause UI into DOM, leaving the cramped helper/button spacing unchanged.

### Mobile Playability and Audio Stability

- Date: `2026-05-15`
- Decision: Stabilize mobile audio with Web Audio buffers after user interaction, reduce object density and visual size on phone-sized canvases, and enable a bottom-left virtual joystick by default on touch/narrow play.
- Reason: iPhone playtests showed inconsistent audio, possible sound-related lag, cluttered small screens, and finger-drag controls covering the firefly. The mobile MVP needs fewer simultaneous objects and a control method that keeps the playfield visible.
- Alternatives considered: Keeping HTMLAudio clones, adding a settings menu, adding mobile difficulty options, using user-agent detection, keeping desktop density on phone, requiring direct drag controls, adding PWA/Capacitor packaging now.
- Note: The current WAV files still work, but production mobile builds should export compressed mp3 or m4a/aac versions to reduce download size and decode pressure.

### Calm Start and Responsive Spawn Tuning

- Date: `2026-05-15`
- Decision: Add a short fair-start grace period, expand shadow spawn safety around the firefly, reduce phone shadow density further, and make moonlight orb spawning prefer reachable positions that avoid shadows.
- Reason: The game should support a calming wind-down identity. New runs should never feel unfair, phone screens need more breathing room, and desktop orbs should not feel tedious because they spawn too far away.
- Alternatives considered: Tutorial mode, difficulty settings, removing shadows from the early game, leaving desktop-wide orb spawning untouched, implementing a moving rare reward powerup now.
- Note: A rare high-value moving reward powerup is documented as a future idea only and remains deferred.

### Mobile Joystick Feel and Start Sound Fix

- Date: `2026-05-15`
- Decision: Slow virtual joystick movement with a mobile-only multiplier and play the start/retry cue only after the audio unlock promise has resolved.
- Reason: Phone movement should feel calmer for the wind-down identity, and mobile browsers can drop the first sound if playback is requested before the audio context has fully resumed.
- Alternatives considered: Slowing all movement, weakening Moon Dash, adding a settings menu, ignoring the first-sound race, adding separate mobile-only start audio.

### Legal/IP Documentation Setup

- Date: `2026-05-15`
- Decision: Add internal legal/IP documentation logs for Suno audio, AI-assisted visual assets, AI-assisted code usage, third-party dependency licenses, and future app store review readiness.
- Reason: The project may eventually ship commercially, so code, audio, visuals, dependency licenses, and AI tool provenance need a clear place to be tracked before launch review.
- Alternatives considered: Keeping asset proof only in chat history, waiting until launch to create logs, adding legal conclusions to the docs, installing license audit tools now.

### Visual Asset Provenance Correction

- Date: `2026-05-15`
- Decision: Document current background visuals as ChatGPT/OpenAI-generated artwork, with Canva used only for background removal, editing, and transparent PNG export where applicable.
- Reason: Provenance records should distinguish the original generation source from later editing/export tools. Canva should only be listed as the original content source if Canva stock content, templates, photos, icons, fonts, or elements are used later.
- Alternatives considered: Leaving Canva listed ambiguously as a possible original source, removing Canva from the logs entirely, waiting until app-store preparation to correct asset provenance.

### Standing Legal/IP Log Workflow

- Date: `2026-05-15`
- Decision: Add a standing workflow rule that future asset, AI tool, dependency, marketing, video, app store, or monetization additions should update the relevant legal/IP logs in the same task.
- Reason: Legal/IP records are most useful when provenance, receipts, prompts, and license-review TODOs are captured at the moment new material enters the project.
- Alternatives considered: Updating logs only before launch, relying on memory or chat history, creating logs only for final shipped assets.

### Mobile Start Must Not Wait for Audio Unlock

- Date: `2026-05-15`
- Decision: Start and retry taps transition to gameplay immediately, while mobile audio unlock and the start sound run asynchronously as best-effort feedback.
- Reason: Mobile browsers can delay, reject, or hang audio unlock promises. Audio should never block core game state transitions or leave the player stuck on the start screen.
- Alternatives considered: Waiting for audio unlock before starting, adding a player-facing audio error, removing the start sound, or adding a settings/menu flow.

### Mobile Runtime Audio Optimization

- Date: `2026-05-15`
- Decision: Keep WAV files as source/master assets, add optimized AAC/M4A runtime derivatives, and have `AudioManager` prefer optimized files with WAV fallback.
- Reason: Large uncompressed WAV files caused mobile delay and decode reliability problems, especially for the first start sound on iPhone. Smaller runtime files reduce fetch/decode time while preserving the original masters.
- Alternatives considered: Keeping WAV-only playback, using OGG as the primary format, adding new audio dependencies, blocking gameplay until audio is ready, or removing sound from mobile.
- Note: Audio unlock remains best-effort and non-blocking. The start cue is skipped if it is not ready quickly enough to avoid a confusing delayed intro sound.

### Mobile Audio Gesture Reliability

- Date: `2026-05-16`
- Decision: Prime mobile audio directly inside pointer/touch/click user gestures, use a short start-run HTMLAudio fallback when Web Audio is not ready, and prevent duplicate one-shot sounds from cutting off sounds already playing.
- Reason: iPhone browsers can miss first sounds when unlock/playback is deferred to the game loop, and stopping an active one-shot to enforce an instance cap can make powerup sounds appear to start and then cut off. Start/retry audio is now best-effort, quick, and never blocks gameplay.
- Alternatives considered: Waiting for Web Audio buffers before starting, keeping all start audio in the requestAnimationFrame flow, globally increasing sound overlap, adding a settings menu, or removing mobile audio cues.
- Note: Optional audio diagnostics are available with `?audioDebug=1` for mobile Safari/Web Inspector testing.

### Manually Approved Runtime Audio

- Date: `2026-05-17`
- Decision: Use Omar-approved M4A/AAC runtime files as the primary browser audio format and Omar-approved MP3 files as fallback. WAV files remain source/master assets only, and the old Codex-generated optimized runtime files are no longer used.
- Reason: The approved runtime files preserve Omar's intended sound timing and avoid accidental truncation or normalization from automated conversion. Runtime audio should be explicit, reviewable, and portable across iPhone, Android, and desktop browsers.
- Alternatives considered: Continuing to use Codex-generated optimized files, falling back to WAV during gameplay, using OGG, or re-running FFmpeg automatically.
- Note: Codex should not auto-convert, trim, normalize, regenerate, or overwrite runtime audio unless explicitly requested.

### Runtime Audio Playback Regression Fix

- Date: `2026-05-17`
- Decision: Queue gameplay sound requests until Web Audio is genuinely running and decoded, keep MP3 fallback available after M4A fetch/decode failures, and loosen orb pickup rate limits for the manually approved runtime cues.
- Reason: After switching to manual M4A/MP3 files, the start sound could work through its gesture-safe fallback while normal gameplay sounds were dropped if the AudioContext was still suspended or loading. The approved orb cue is also longer than the previous generated cue, so the old cooldown and two-instance cap made normal sequential pickups feel silent.
- Alternatives considered: Using HTMLAudio for every sound, returning to WAV fallback, increasing all sound overlap globally, changing gameplay pickup timing, or editing the approved audio files.
- Note: Debug logs behind `?audioDebug=1` now make source selection, fallback, context state, play results, and skip reasons easier to inspect on iPhone.

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
