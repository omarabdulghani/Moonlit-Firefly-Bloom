# GAME_DESIGN.md

# Moonlit Firefly Bloom Game Design

## Core Fantasy

The player is a tiny glowing firefly drifting across a dark rooftop under the moon. Moonlight keeps the firefly alive, shadows try to drain its glow, and rare powerups create small magical turns in the run.

The mood should be cozy, lonely in a comforting way, and slightly tense when the glow gets low.

## Positioning

Moonlit Firefly Bloom is a soothing, cozy, calming arcade game for winding down. It should feel gentle enough to play before bed while still offering a light moonlit challenge, fast retries, and small magical reward moments.

## First 10 Seconds

- The player appears as a small warm glow in a dark garden arena.
- A few moonlight orbs shimmer nearby.
- One or two shadow hazards are visible but not overwhelming.
- The player moves, immediately sees the firefly respond, and understands that light is fuel.
- Collecting an orb gives sound, score, glow restore, and a clear visual response.
- Shadows look dangerous, and touching them creates immediate visual drain feedback.

## First 60 Seconds

- The player learns the main loop by doing: move, collect, avoid, bloom.
- The glow meter slowly becomes meaningful as shadow contact drains it.
- Moonlight orbs encourage movement around the arena.
- Bloom Burst teaches the player that staying bright can create a rewarding moment.
- Moon Shield, Moon Dash, and Glow Surge/x2 add occasional pickup excitement.
- Hazards should feel avoidable, dangerous, and recoverable rather than random or punishing.

## 3-Minute Gameplay Loop

1. Start or retry instantly.
2. Fly through the garden collecting moonlight.
3. Avoid shadows while managing the glow meter.
4. Use moonlight and powerups to recover, move faster, or trigger Bloom Burst.
5. Survive deeper Night Levels, later Full Moon Blessings, and delayed Moon Rain moments.
6. Lose when glow reaches zero.
7. See the deepest Night reached, a poetic run title, Moonlight gathered, Time glowing, Best Night, and earned milestone stats such as Full Moons witnessed.
8. Retry immediately.

## Player Actions

- Move the firefly.
- Use desktop keyboard/mouse controls or the mobile virtual joystick.
- Collect moonlight orbs.
- Steer away from shadow hazards.
- Collect special powerups when they appear.
- Use Bloom Burst windows to push shadows away and score bonus points.
- Pause/resume naturally when leaving the browser or pressing `Esc`.
- Restart after game over.

The MVP should not require shooting, menus, inventory, upgrades, or complex decisions.

## Run Rewards

The player-facing reward system should feel cozy, personal, and easy to understand:

- Main reward: deepest Night reached.
- Emotional reward: a poetic title earned at game over.
- Secondary stat: Moonlight gathered, counted from normal moonlight orb pickups.
- Optional stat: Time glowing, shown only at game over.
- Earned milestone stats: show cozy event milestones such as Full Moons witnessed only when the run actually reached them.
- Local record: Best Night.

Raw score still exists internally as legacy/simple scoring behavior, but it should not be the main player-facing reward. Live gameplay should not feel like chasing a large arcade number or watching a stopwatch.

## Lose Condition

The firefly has a glow meter. Touching shadows drains glow. Collecting moonlight restores glow. The run ends when glow reaches zero.

Glow meter damage is preferred over instant death because it supports the cozy tone, gives the player room to recover, and makes mistakes feel tense without feeling harsh.

The low-glow heartbeat warning should stop immediately once the player restores enough glow.

## Current Powerups

- Moon Shield: temporary protection from shadow damage and passive glow drain.
- Moon Dash: temporary speed boost with a green electric identity.
- Glow Surge/x2: gold pickup that restores a large amount of glow and can trigger Bloom Burst when collected with enough existing glow.

Powerups are temporary run-only pickups. They are not upgrades, inventory items, shop items, or permanent progression.

## Special Events

- Night Level rises through Bloom Burst progress and gradually increases pressure.
- The moon phase changes with Night Level.
- Later Full Moons trigger Full Moon Blessing, a protected magical state that fills and preserves glow.
- During Full Moon Blessing, shadows visually vanish and remain harmless until they softly reform after the blessing ends.
- Full Moon Blessing uses moon-white glow meter styling, subtle moonwash, special stars, and plant-side decorative fireflies to make the balcony feel alive.
- Moon Rain is a delayed after-event following later Full Moons, not the same moment as Full Moon Blessing.
- Moon Rain temporarily adds more moonlight orbs, slightly increases shadow pressure, plays ambience, and shows falling moonlight that builds and thins by drop density.

These systems should make runs feel alive without becoming a separate mode.

## Future Ideas

- A rare high-value reward powerup that moves away from the firefly and is harder to catch.

This moving reward powerup is only a future idea. It should not be implemented until the core mobile and desktop play feel calm, fair, and readable.

## Replayability

Replayability comes from:

- Better movement mastery.
- Deeper Night reached.
- Cozy run titles that make the end of a run feel personal.
- Cleaner shadow avoidance.
- Fast restarts.
- Better powerup decisions.
- Reaching deeper Nights and surviving Full Moon events.
- A saved local Best Night.

Progression systems are intentionally out of scope for the MVP.

## Visual Style

- Dark rooftop garden or moonlit balcony setting.
- Deep night background with readable play space.
- Warm firefly glow as the player focus.
- Cool moonlight orbs.
- Shadow hazards should be dark, legible, and visually distinct from the background.
- Powerups should be visually distinct: shield blue, dash green, x2 gold.
- Enlarged side plants should make the balcony garden feel cozy without blocking gameplay.
- Ambient birds, stars, Full Moon fireflies, and shooting stars should support the mood without distracting from gameplay.
- Full Moon decorative fireflies should stay near the side plant/foreground zones and feel like environmental life, not collectibles.
- UI should be minimal and calm.

The visuals should be atmospheric but never obscure gameplay readability.

## Sound and Feedback Direction

Current sound direction:

- Gentle collection chime for moonlight.
- Distinct pickup sounds for Moon Shield, Moon Dash, and Glow Surge.
- Bloom Burst reward sound.
- Shadow damage sound.
- Low-glow heartbeat warning that stops when glow recovers.
- Moon Rain begin/end sounds and quiet ambience during the event.
- Calm game over sound.

Runtime sound files are Omar-approved M4A/MP3 derivatives. WAV files are source/master references only.

Visual feedback should come first because the MVP must work even muted.

## Pause and Resume

The game pauses when:

- The player presses `Esc`.
- The browser loses focus.
- The tab becomes hidden.
- The page is being hidden by the browser.

Resume should feel gentle and personal: the firefly is waiting, the night is holding still, and gameplay timers should not continue draining glow while paused.

## Risks

- Movement may feel too floaty or too stiff.
- Shadows could feel unfair on small screens.
- The arena could feel too busy if ambient birds, stars, Full Moon fireflies, Moon Rain, and reward effects become too visible.
- The game could become overbuilt before the core loop is fun.
- Mobile controls could lag behind desktop unless tested early.
- Powerups could become too generous before the base loop proves itself.
