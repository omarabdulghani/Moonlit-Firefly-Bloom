# TASKS.md

# Tasks

Small, checkable tasks for building the Moonlit Firefly Bloom MVP.

## Current Standing

- [x] Local browser prototype is playable.
- [x] Desktop keyboard, desktop mouse, mobile touch controls, and phone/narrow virtual joystick exist.
- [x] Core loop includes moonlight collection, shadow avoidance, glow management, powerups, Bloom Burst, Night progression, Moon Rain, sound, pause/resume, and local best score.
- [x] Current focus is core fun, readability, real-device QA, and private playtesting.
- [ ] Backend, accounts, online leaderboard, shops, ads, payments, achievements, permanent upgrades, PWA setup, and app packaging remain intentionally unbuilt.

## Next Recommended Work

- [ ] Private playtest the current build with a small tester group.
- [ ] Watch whether players understand glow, shadows, Bloom Burst, and powerups without explanation.
- [ ] Tune powerup frequency, shadow pressure, and glow pacing only after playtest observations.
- [ ] QA pause/resume, tab switching, cursor behavior, mobile joystick feel, and runtime audio on real devices.
- [ ] Consider a tiny mute/settings option later if sound feedback is stable and testers ask for it.

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

## Phase 7.8: Background Asset Opacity Tuning

- [x] Increase railing opacity slightly so it feels more physically present.
- [x] Increase plant silhouette opacity slightly so they feel less ghost-like.
- [x] Keep skyline opacity and background layout unchanged.
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

## Phase 9.1: HUD and Game Over UI Polish

- [x] Keep the start screen structure clear and unchanged.
- [x] Group gameplay HUD stats in a subtle translucent panel.
- [x] Keep HUD labels clear: Score, Time, Night, and Glow.
- [x] Make the glow meter feel warmer and more magical.
- [x] Keep Moon Shield status visible when active.
- [x] Rewrite game over language with a warmer run summary.
- [x] Group game over stats more cleanly.
- [x] Update retry copy to `Click / Tap to fly again`.
- [x] Preserve gameplay, tuning, assets, input, and restart behavior.

## Phase 10: Moon Phase Cycle

- [x] Add a repeating moon phase cycle derived from Night Level.
- [x] Track moon phase index and name in the render snapshot.
- [x] Render the code-drawn moon differently for each phase.
- [x] Keep New Moon subtle and Full Moon bright but readable.
- [x] Show the current moon phase name during Night-change feedback.
- [x] Keep HUD and game over stats uncluttered.
- [x] Preserve gameplay, tuning, scoring, powerups, input, and restart behavior.
- [x] Avoid Full Moon events, ads, monetization, new enemies, new powerups, sound, and menus.

## Phase 10.1: Moon Phase Polish

- [x] Rotate the moon phase cycle so Night 1 starts at Full Moon.
- [x] Keep the eight-phase cycle repeating infinitely.
- [x] Remove the hard circular moon outline.
- [x] Add a short eased crossfade between moon phase shapes.
- [x] Keep phase-change messages clean and uncluttered.
- [x] Preserve gameplay, tuning, scoring, powerups, input, HUD content, and restart behavior.
- [x] Avoid Full Moon events, ads, monetization, new enemies, new powerups, sound, and menus.

## Phase 10.2: Full Moon Trial - Moon Rain

- [x] Trigger Moon Rain only on later Full Moon phase changes.
- [x] Keep the Night 1 Full Moon calm and event-free.
- [x] Add a limited Moon Rain event timer.
- [x] Increase active moonlight orb count by three during Moon Rain.
- [x] Return orb count to normal when Moon Rain fades.
- [x] Slightly increase shadow speed during Moon Rain.
- [x] Show short Moon Rain start and end messages.
- [x] Track Full Moons survived during the current run.
- [x] Show Full Moons survived on the game over summary.
- [x] Preserve normal scoring, Bloom Burst, Moon Shield, Night Level, input, and restart behavior.
- [x] Avoid ads, upgrades, monetization, new enemy types, new powerups, sound, menus, and particle systems.

## Phase 10.3: Moon Rain Visual Effect

- [x] Render subtle falling moonlight only while Moon Rain is active.
- [x] Keep Moon Rain streaks behind gameplay objects and HUD.
- [x] Scale drop count for desktop and mobile canvas sizes.
- [x] Recycle lightweight code-drawn drops without adding a heavy particle system.
- [x] Stop the visual effect when Moon Rain ends.
- [x] Preserve Moon Rain duration, extra orb count, shadow speed behavior, scoring, sounds, powerups, HUD, controls, and background placement.
- [x] Avoid new mechanics, powerups, enemies, sounds, menus, upgrades, monetization, PWA, and app packaging.

## Phase 10.4: Moon Rain Visual Fade Polish

- [x] Add a short visual fade-in when Moon Rain begins.
- [x] Add a short visual fade-out after Moon Rain gameplay ends.
- [x] Keep fade-out visual-only so extra orbs and shadow speed end on the existing Moon Rain timer.
- [x] Keep the falling moonlight subtle and behind gameplay objects and HUD.
- [x] Preserve Moon Rain trigger timing, duration, sounds, extra orb behavior, shadow speed behavior, stats, scoring, powerups, controls, and UI.
- [x] Avoid new mechanics, powerups, enemies, sounds, menus, upgrades, monetization, PWA, and app packaging.

## Phase 10.5: Full Moon Blessing and Delayed Moon Rain

- [x] Add Full Moon Blessing as a short reward event on later Full Moons only.
- [x] Keep Night 1 Full Moon as a calm opening mood with no blessing or Moon Rain.
- [x] Fill glow to maximum when Full Moon Blessing starts.
- [x] Pause passive glow drain and shadow glow drain during Full Moon Blessing.
- [x] Add centered soft `Full Moon` blessing text.
- [x] Add a few pulsing special sky stars during Full Moon Blessing.
- [x] Blend the glow meter toward moon-white while the blessing is active.
- [x] Schedule Moon Rain after two later moon phase changes instead of starting it during Full Moon.
- [x] Keep Moon Rain independent once started and increase its duration slightly.
- [x] Make Moon Rain build and thin out by drop density, not only opacity.
- [x] Preserve Moon Rain sounds, scoring, powerups, controls, HUD layout, background assets, and reset flow.
- [x] Defer future ideas like lantern bugs, constellations, new rewards, and new challenge types.
- [x] Avoid new powerups, enemies, menus, shops, ads, monetization, PWA, Capacitor, and app packaging.

## Phase 10.6: Full Moon Blessing Duration and Moon Rain Density Correction

- [x] Tie Full Moon Blessing duration to the whole later Full Moon phase instead of a short timer.
- [x] Keep Night 1 Full Moon calm, with no Full Moon Blessing or Moon Rain.
- [x] Keep glow filled and protected for the entire later Full Moon phase.
- [x] Keep the glow meter moon-white for the full blessing, with Moon Shield blue as the next priority after blessing ends.
- [x] Show Full Moon reward text as a graceful start-of-phase animation.
- [x] Keep special Full Moon stars visible and pulsing for the whole blessing phase.
- [x] Add subtle decorative lantern-bug/firefly glows during Full Moon Blessing.
- [x] Fade Full Moon stars, lantern bugs, and meter styling in and out smoothly.
- [x] Keep Moon Rain delayed until the configured later phase changes and independent once started.
- [x] Make Moon Rain begin from sparse upper-sky drops and build by density.
- [x] Make Moon Rain end by thinning visible drops and stopping respawns during visual fade-out.
- [x] Preserve Moon Rain sounds, gameplay timing, scoring, powerups, controls, HUD layout, background assets, and reset flow.
- [x] Avoid new gameplay systems, powerups, enemies, menus, audio files, image assets, monetization, PWA, Capacitor, and app packaging.

## Phase 10.7: Full Moon Ambient Fireflies and Shield Glow-Lock Correction

- [x] Add small warm ambient fireflies during later Full Moon Blessing.
- [x] Keep ambient fireflies decorative, non-collectible, and smaller than gameplay collectibles.
- [x] Group ambient fireflies into loose slow-drifting clusters.
- [x] Fade ambient fireflies in and out with the Full Moon Blessing visuals.
- [x] Slow the lantern-bug/constellation drift and pulse animation for a calmer feel.
- [x] Add a Moon Shield max-glow lock that activates only once shielded glow reaches full.
- [x] Lock glow at max for the remaining shield duration if Moon Shield is collected while already full.
- [x] Keep score, collection, Bloom Burst, Night progression, sounds, and powerup effects working normally while shielded.
- [x] Clear the Moon Shield glow lock when the shield expires or a new run starts.
- [x] Preserve visual priority: Full Moon moon-white, then Moon Shield blue, then normal gold.
- [x] Avoid new gameplay systems, powerups, enemies, menus, audio files, image assets, monetization, PWA, Capacitor, and app packaging.

## Phase 10.8: Full Moon Event Art-Direction Cleanup

- [x] Shift Full Moon visual direction toward `Moon Blessing on the Balcony`.
- [x] Reduce sky clutter by removing visible constellation connecting lines.
- [x] Keep remaining lantern-bug sky detail faint, sparse, and secondary.
- [x] Move ambient Full Moon firefly clusters toward the left/right plant and balcony edge areas.
- [x] Keep ambient fireflies small, warm, non-collectible, and less prominent than gameplay objects.
- [x] Add a subtle silver-blue moonwash during Full Moon Blessing.
- [x] Stagger special star reveal so the sky responds gently instead of popping on at once.
- [x] Stagger plant-side firefly cluster reveal and settling for a softer awakening/ending feel.
- [x] Refine the `Full Moon` title into a smaller glow-gather/shimmer moment.
- [x] Preserve Full Moon Blessing timing, glow protection, Moon Rain delay, Moon Rain duration, audio, controls, scoring, and reset behavior.
- [x] Avoid new gameplay systems, powerups, enemies, menus, audio files, image assets, monetization, PWA, Capacitor, and app packaging.

## Phase 10.8.1: Full Moon Event Cleanup / Correction Pass

- [x] Remove the visible lower-screen rectangular moonwash block.
- [x] Keep any Full Moon atmosphere wash soft, edge-free, and non-boxy.
- [x] Replace the bad `Full Moon` pill/banner treatment with elegant text-only glow styling.
- [x] Rework ambient Full Moon fireflies into small plant-side balcony fireflies.
- [x] Make decorative fireflies warmer, glowier, and visibly animated with upward drift, wandering, and pulsing.
- [x] Keep decorative fireflies near side plants and balcony edges instead of filling the sky.
- [x] Preserve the cleaner reduced-sky-clutter direction from Phase 10.8.
- [x] Preserve gameplay timing, glow protection, Moon Rain delay, controls, scoring, audio mappings, and assets.
- [x] Avoid new gameplay systems, powerups, enemies, menus, audio files, image assets, monetization, PWA, Capacitor, and app packaging.

## Phase 10.8.2: Full Moon Decorative Fireflies Refinement

- [x] Move decorative Full Moon fireflies tighter into the side plant and lower balcony foreground zones.
- [x] Reduce remaining sky lantern glows so they do not read as the main firefly effect.
- [x] Rework firefly motion around stable anchors with smooth oval, figure-eight, and hovering sine motion.
- [x] Remove the old wrapping upward drift that could look jittery or fragmented.
- [x] Increase warm moon-gold firefly glow, halo, and tiny bright cores while keeping them smaller than collectibles.
- [x] Add a very subtle warm plant-side haze during Full Moon Blessing.
- [x] Keep mobile counts lower and the center play area readable.
- [x] Preserve gameplay, Full Moon timing, Moon Rain logic, HUD, audio, controls, scoring, assets, and reset behavior.
- [x] Avoid new gameplay systems, powerups, enemies, menus, audio files, image assets, monetization, PWA, Capacitor, and app packaging.

## Phase 10.8.3: Full Moon Shadow Disappearance Polish

- [x] Add a Full Moon shadow visual state for normal, vanishing, hidden, and returning.
- [x] Make shadows become harmless as soon as the Full Moon vanish begins.
- [x] Animate shadows inward with shrinking radius and fading opacity when Full Moon begins.
- [x] Keep shadows hidden for the duration of the later Full Moon Blessing.
- [x] Animate shadows back from a small dark seed when Full Moon ends.
- [x] Keep shadow damage disabled until the return transition finishes.
- [x] Preserve existing shadow entities instead of replacing them with unrelated spawns.
- [x] Preserve movement, scoring, powerups, moon phase timing, Moon Rain logic, HUD, audio, controls, and assets.
- [x] Avoid new gameplay systems, enemies, powerups, menus, sound changes, monetization, PWA, Capacitor, and app packaging.

## Visual Tuning: Larger Side Plants

- [x] Increase the left and right plant asset scale by 50% for the whole game.
- [x] Keep plants bottom-anchored as decorative background/foreground atmosphere.
- [x] Adjust Full Moon decorative firefly clusters to keep their relative placement around the enlarged plant zones.
- [x] Preserve gameplay, Full Moon logic, Moon Rain logic, HUD, audio, controls, scoring, and assets.

## Phase 11: Essential Sound Effects

- [x] Copy WAV files into a Vite public sound path with clean runtime names.
- [x] Add a small audio manager with per-sound volumes and cooldowns.
- [x] Unlock audio after player interaction without autoplaying before input.
- [x] Play start/retry, orb collect, shadow damage, Bloom Burst, low glow, and game over sounds.
- [x] Play moon phase sounds only on phase changes after the run starts.
- [x] Play Moon Rain begin/end sounds and loop quiet ambience while Moon Rain is active.
- [x] Play Moon Shield feedback on pickup/activation.
- [x] Handle missing or blocked audio without breaking gameplay.
- [x] Preserve gameplay, scoring, tuning, visuals, input, and restart behavior.
- [x] Avoid new menus, settings, mechanics, upgrades, achievements, monetization, PWA, Capacitor, and app-store files.

## Phase 12: Special Powerups and Early-Run Hook

- [x] Add Moon Dash as a temporary speed powerup.
- [x] Add Glow Surge as an instant glow refill powerup.
- [x] Give both powerups distinct code-drawn visuals and pulse/fade behavior.
- [x] Despawn ignored powerups after a short lifetime.
- [x] Limit active special powerups so the arena does not flood.
- [x] Spawn special powerups more generously before the first later Full Moon cycle.
- [x] Show a small Moon Dash HUD timer while the speed boost is active.
- [x] Clear active powerups, timers, and speed boost state on new run.
- [x] Preserve orb scoring, Bloom Burst, Moon Shield, Night Level, Moon Rain, best score, and mobile controls.
- [x] Avoid shops, currencies, permanent upgrades, achievements, new menus, new enemies, online features, monetization, and app packaging.

## Phase 12.1: Powerup Clarity and Sound Tuning

- [x] Change Moon Dash to a bright green/electric visual identity.
- [x] Replace the Moon Dash icon with a simple lightning bolt.
- [x] Increase Moon Dash speed multiplier so the boost feels clearly faster.
- [x] Keep Glow Surge yellow/gold but replace the plus mark with an `x2` icon.
- [x] Add separate runtime sound paths for Moon Dash and Glow Surge pickups.
- [x] Play the speed powerup sound for Moon Dash.
- [x] Play the x2 powerup sound for Glow Surge.
- [x] Keep Moon Shield using its existing shield sound.
- [x] Preserve existing spawn timing, lifetime, scoring, Moon Rain, Bloom Burst, Night Level, controls, and reset behavior.
- [x] Avoid new powerups, menus, upgrades, currencies, monetization, and app packaging.

## Phase 12.2: Powerup Feedback, Orb Lifecycle, and Visual Clarity

- [x] Add temporary gold HUD reward feedback when Glow Surge is collected.
- [x] Match temporary HUD status colors to Moon Shield, Moon Dash, and Glow Surge identities.
- [x] Make normal moonlight orbs expire after a longer lifetime than powerups and respawn elsewhere.
- [x] Add a subtle late-life fade/pulse cue for expiring moonlight orbs.
- [x] Let Glow Surge fill to max and trigger Bloom Burst when collected above half glow.
- [x] Let Moon Shield and Moon Dash restore the same glow amount as a normal moonlight orb.
- [x] Remove extra inner marks from the Moon Dash icon while keeping the green pulsing look.
- [x] Remove the inner disk from the Glow Surge icon and make `x2` larger and higher contrast.
- [x] Preserve spawn timing, powerup lifetime, Moon Rain, Bloom Burst, Night Level, scoring, controls, and reset flow.
- [x] Avoid new powerups, menus, upgrades, currencies, monetization, maps, enemies, and app packaging.

## Phase 12.3: Shield Icon Polish and x2 Text Cleanup

- [x] Refine Moon Shield into a clearer classic shield silhouette.
- [x] Keep Moon Shield code-drawn with its existing blue glow and pulse family.
- [x] Remove the stroke/outline from the Glow Surge `x2` text.
- [x] Keep `x2` large, clean, and readable.
- [x] Preserve all gameplay, powerup behavior, sounds, HUD logic, orb behavior, background, and controls.
- [x] Avoid new systems, menus, assets, sounds, upgrades, monetization, PWA, and app packaging.

## Phase 12.4: Desktop Cursor and Low-Glow Audio Cleanup

- [x] Hide the mouse cursor during active desktop play.
- [x] Reveal the cursor briefly when the player moves the mouse or clicks.
- [x] Keep touch/mobile behavior unaffected by cursor hiding.
- [x] Stop the low-glow heartbeat warning immediately when glow recovers above the warning threshold.
- [x] Stop the low-glow warning on pause, game over, and restart.
- [x] Preserve gameplay tuning, scoring, powerups, background, and mobile controls.

## Phase 12.4b: Shield-Linked Glow Meter Visual Feedback

- [x] Reuse the existing Moon Shield cyan/blue color identity for protected glow meter styling.
- [x] Blend the glow meter toward shield blue while Moon Shield is active.
- [x] Add a soft protective blue glow to the meter fill while shielded.
- [x] Smoothly ease the shield-blue meter state in and out with the shield timer.
- [x] Keep Full Moon Blessing moon-white styling higher priority than Moon Shield blue.
- [x] Preserve Moon Shield duration, protection logic, glow values, spawn timing, scoring, HUD layout, audio, and controls.
- [x] Avoid new mechanics, powerups, menus, sounds, assets, monetization, PWA, Capacitor, and app packaging.

## Phase 12.5: Shield Drain Protection and Shadow Hit Drama

- [x] Make Moon Shield pause passive glow drain while active.
- [x] Keep Moon Shield preventing shadow damage while active.
- [x] Add stronger shadow-contact visual feedback with a local danger halo, ring, and inward drain lines.
- [x] Keep the effect brief, readable, and not horror-themed.
- [x] Preserve shadow damage values, passive drain values, scoring, powerups, and core loop tuning.

## Phase 12.6: Glow Surge Reward Visual

- [x] Add a stronger visual reward when collecting Glow Surge/x2.
- [x] Render the x2 reward as a gold surge with readable light accents.
- [x] Layer the x2 surge cleanly with Bloom Burst when both trigger together.
- [x] Keep Glow Surge sound, glow behavior, Bloom Burst behavior, and scoring unchanged.
- [x] Avoid new systems, powerups, menus, particles-heavy effects, and monetization.

## Phase 12.7: Ambient Night Sky Polish

- [x] Add code-drawn ambient night birds in the background.
- [x] Give birds organic movement, small flap variation, and occasional silhouettes across the moon.
- [x] Add more stars and subtle twinkling.
- [x] Add rare shooting star/falling star effects.
- [x] Keep all sky atmosphere behind gameplay and low-distraction.
- [x] Preserve gameplay, input, scoring, powerups, sounds, HUD, and game over behavior.

## Phase 12.8: Pause and Resume Flow

- [x] Add a real `paused` game state.
- [x] Pause active runs when pressing `Esc`.
- [x] Pause active runs when the browser loses focus, the page hides, or the tab becomes hidden.
- [x] Freeze gameplay timers and glow drain while paused.
- [x] Stop low-glow warning and Moon Rain ambience while paused.
- [x] Resume by clicking or tapping the pause overlay.
- [x] Clear stale input on pause/resume so resuming does not instantly end the run.
- [x] Add a calm in-world pause overlay with a crescent icon and personal copy.
- [x] Fix pause overlay shape/padding so it fits the game aesthetic.
- [x] Preserve gameplay systems, powerups, sound mappings, scoring, and restart flow.

## Phase 12.9: Pause Overlay Spacing Polish

- [x] Rebalance the pause overlay vertical spacing.
- [x] Keep the crescent icon small, clean, and glow-free.
- [x] Add clearer breathing room between the helper text and Resume button.
- [x] Match the bottom padding under the helper text more closely to the top padding above the crescent.
- [x] Preserve pause/resume behavior, gameplay timers, audio behavior, controls, and all gameplay systems.

## Phase 13: Mobile Playability and Audio Stability

- [x] Replace clone-per-play audio with a Web Audio buffer path after player interaction.
- [x] Resume/unlock audio only after a user gesture and fail silently if playback is blocked.
- [x] Decode and reuse audio buffers instead of decoding sounds at pickup time.
- [x] Keep cooldowns and instance caps for frequent sounds.
- [x] Lower the mobile audio mix slightly for phone-sized screens.
- [x] Document that compressed mp3/m4a exports are recommended for production mobile audio.
- [x] Add a canvas-size responsive density profile for phone, tablet, and desktop.
- [x] Reduce normal moonlight orb count on phone-sized screens.
- [x] Reduce Moon Rain extra orb count on phone-sized screens.
- [x] Reduce base and maximum shadow counts on phone-sized screens.
- [x] Limit active special powerups on phone/tablet-sized screens.
- [x] Slightly reduce rendered orb, shadow, and powerup sizes on smaller screens.
- [x] Add a bottom-left virtual joystick for touch/narrow play.
- [x] Keep keyboard, mouse, direct pointer fallback, scoring, powerups, Moon Rain, and restart behavior intact.
- [x] Avoid settings screens, menus, ads, leaderboard, shop, monetization, PWA, Capacitor, and app-store packaging.

## Phase 13.1: Calm Start and Responsive Spawn Tuning

- [x] Add a short start grace period so shadows cannot drain glow immediately.
- [x] Increase the safe shadow spawn radius around the firefly at run start.
- [x] Reduce phone shadow density further while preserving desktop challenge.
- [x] Reduce phone object visual scale slightly for readability.
- [x] Make moonlight orb spawn distance responsive to screen size.
- [x] Prefer reachable orb positions without spawning directly on the firefly.
- [x] Avoid spawning moonlight orbs directly inside shadows where possible.
- [x] Keep powerup spawn avoidance and active-count limits intact for small screens.
- [x] Document the calming/wind-down positioning.
- [x] Document the moving rare reward powerup as a future idea only.
- [x] Avoid new mechanics, menus, shops, ads, leaderboard, monetization, PWA, Capacitor, and app-store packaging.

## Phase 13.2: Mobile Joystick Feel and Start Sound Fix

- [x] Add a mobile-only joystick speed multiplier for calmer phone movement.
- [x] Keep desktop keyboard, mouse, and pointer movement unchanged.
- [x] Preserve Moon Dash as a noticeably faster temporary speed boost.
- [x] Reuse the in-progress audio unlock promise so mobile start audio waits for the first tap unlock.
- [x] Play the start/retry sound after audio unlock completes.
- [x] Guard against double-starting or double-playing the start sound on rapid taps.
- [x] Preserve all scoring, spawning, powerups, HUD, background, and game over behavior.
- [x] Avoid new systems, menus, ads, leaderboard, monetization, PWA, Capacitor, and app-store packaging.

## Phase 14: Legal/IP Documentation Setup

- [x] Create a `legal/` folder for practical internal IP and release-readiness records.
- [x] Add `legal/README.md` with purpose, non-legal-advice note, and proof-keeping reminders.
- [x] Add `legal/AUDIO_ASSET_LOG.md` with Suno sound placeholder entries.
- [x] Add `legal/VISUAL_ASSET_LOG.md` with known background asset placeholder entries.
- [x] Add `legal/AI_TOOL_USAGE_LOG.md` for high-level AI-assisted code, audio, and visual asset usage.
- [x] Add `legal/THIRD_PARTY_LICENSES.md` for package license tracking.
- [x] Add `legal/APP_STORE_IP_CHECKLIST.md` for future commercial and app store readiness.
- [x] Avoid gameplay, asset, dependency, build, UI, audio behavior, and feature changes.

## Phase 15.1: Developer Event Test Shortcuts

- [x] Add hidden URL query parsing for developer-only event scenarios.
- [x] Support `?devFullMoon=1` to start a run at a later Full Moon Blessing test state.
- [x] Support `?devMoonRain=1` to start a run with Moon Rain active immediately.
- [x] Support `?devFullMoonSequence=1` to quickly test Full Moon Blessing into delayed Moon Rain.
- [x] Keep normal gameplay unchanged when no dev query parameter is present.
- [x] Skip local best score saving during developer scenario runs.
- [x] Add a tiny dev-only scenario label while a dev scenario is active.
- [x] Document the developer shortcuts in `docs/DEV_TESTING.md`.
- [x] Avoid player-facing menus, settings, cheats, monetization, leaderboard, PWA, Capacitor, new systems, new audio, and new assets.

## Project Hygiene

- [ ] Keep legal/IP logs updated whenever new AI-generated assets, sounds, dependencies, or marketing materials are added.

## Mobile Start-Screen Audio Unlock Bug Fix

- [x] Make start/retry state transitions happen immediately on tap or click.
- [x] Attempt audio unlock asynchronously so mobile audio cannot block gameplay.
- [x] Play the start/retry sound only if audio unlock succeeds for the current run.
- [x] Guard against delayed audio unlock causing stale or duplicate start sounds.
- [x] Confirm joystick handling remains limited to the playing state.
- [x] Preserve gameplay tuning, controls, audio mappings, HUD, background, dependencies, and build config.

## Phase 13.3: Mobile Audio Optimization

- [x] Confirm FFmpeg is available locally for audio conversion.
- [x] Create compressed AAC/M4A runtime files in `public/sounds/optimized/`.
- [x] Shorten the start-run cue from the long WAV master to a fast runtime cue.
- [x] Trim/compress one-shot sound effects for mobile-friendly playback.
- [x] Keep the Moon Rain ambience longer but compressed.
- [x] Update `AudioManager` to prefer optimized files and keep WAV fallbacks.
- [x] Prioritize loading start, orb, shadow, Bloom Burst, and game over sounds first.
- [x] Skip the start cue if it is not ready within a short late-play window.
- [x] Document source WAVs versus optimized runtime audio.
- [x] Preserve gameplay, UI, controls, monetization scope, app packaging scope, and original WAV assets.

## Phase 13.4: Mobile Audio Reliability Root-Cause Fix

- [x] Prime audio directly from pointer/touch/click user gestures.
- [x] Keep start/retry gameplay immediate and never blocked by audio unlock.
- [x] Add a start-run HTMLAudio fallback for the first mobile gesture cue.
- [x] Keep the start cue from double-playing or arriving several seconds late.
- [x] Prioritize loading powerup sounds with other high-value gameplay cues.
- [x] Change one-shot instance limiting to skip duplicate sounds instead of cutting off sounds already playing.
- [x] Keep fresh Web Audio source nodes for one-shot playback.
- [x] Add optional audio debug logging behind `?audioDebug=1`.
- [x] Preserve gameplay, UI, controls, sound mappings, app packaging scope, monetization scope, and existing assets.

## Phase 13.5: Use Manually Approved Runtime Audio Files Only

- [x] Copy Omar-approved M4A runtime files into `public/sounds/runtime/m4a/`.
- [x] Copy Omar-approved MP3 runtime fallback files into `public/sounds/runtime/mp3/`.
- [x] Use clean kebab-case runtime file names without editing audio content.
- [x] Remove the old Codex-generated `public/sounds/optimized/` folder.
- [x] Update `AudioManager` to use M4A primary and MP3 fallback runtime sources only.
- [x] Stop using WAV files for normal gameplay runtime playback.
- [x] Keep audio unlock, start sound, one-shot playback, cooldown, and debug logging reliability fixes intact.
- [x] Document that Codex should not auto-convert, trim, normalize, regenerate, or overwrite runtime audio unless explicitly requested.
- [x] Preserve gameplay, UI, visuals, controls, app packaging scope, monetization scope, and original source/master WAV assets.

## Phase 13.6: Runtime Audio Playback Regression Fix

- [x] Investigate why the start cue worked while normal Web Audio gameplay sounds could be skipped.
- [x] Queue gameplay sounds until the AudioContext is actually running instead of dropping them while unlock is still in progress.
- [x] Retry AudioContext resume when later mobile user gestures happen after the start tap.
- [x] Keep M4A primary while attempting MP3 fallback after fetch/decode failure.
- [x] Improve debug logging for source selection, fetch success, decode fallback, play, skip, and natural end events.
- [x] Reduce orb collect cooldown to a tiny same-frame guard.
- [x] Allow more simultaneous orb collect one-shots without cutting off existing sounds.
- [x] Let Moon Rain ambience wait for audio readiness without blocking one-shots.
- [x] Preserve start sound reliability, gameplay, UI, visuals, controls, app packaging scope, monetization scope, and approved audio files.
