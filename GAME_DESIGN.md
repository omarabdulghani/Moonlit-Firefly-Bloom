# GAME_DESIGN.md

# Moonlit Firefly Bloom Game Design

## Core Fantasy

The player is a tiny glowing firefly drifting through a dark rooftop garden under moonlight. Every movement brings a little life back to the space: moonlight refills the firefly's glow, flowers bloom in its wake, and shadows threaten to dim the magic.

## First 10 Seconds

- The player appears as a small warm glow in a dark garden arena.
- A few moonlight orbs shimmer nearby.
- One or two shadow hazards are visible but not overwhelming.
- The player moves, immediately sees the firefly respond, and leaves small flowers or bloom marks behind.
- Collecting an orb gives a clear visual pulse and score feedback.

## First 60 Seconds

- The player learns the main loop by doing: move, collect, avoid, bloom.
- The glow meter slowly becomes meaningful as shadow contact drains it.
- Moonlight orbs encourage movement around the arena.
- Bloom coverage grows visibly, making each run feel like it leaves a beautiful trace.
- Hazards should feel avoidable, not random or punishing.

## 3-Minute Gameplay Loop

1. Start or retry instantly.
2. Fly through the garden collecting moonlight.
3. Avoid shadows while trying to bloom more of the arena.
4. Use moonlight pickups to restore glow and extend the run.
5. Chase a better score and more satisfying bloom coverage.
6. Lose when glow reaches zero.
7. See final score and best score.
8. Retry immediately.

## Player Actions

- Move the firefly.
- Collect moonlight orbs.
- Steer away from shadow hazards.
- Bloom the garden by moving through unbloomed space.
- Restart after game over.

The MVP should not require shooting, menus, inventory, upgrades, or complex decisions.

## Scoring

MVP scoring should be simple and readable:

- Moonlight collected adds points.
- Blooming new garden space adds points.
- Surviving longer may add a small score bonus if it does not distract from collection and blooming.

The score should reward active, graceful movement rather than waiting.

## Lose Condition

The firefly has a glow meter. Touching shadows drains glow. Collecting moonlight restores glow. The run ends when glow reaches zero.

Glow meter damage is preferred over instant death because it supports the cozy tone, gives the player room to recover, and makes mistakes feel tense without feeling harsh.

## Replayability

Replayability comes from:

- Better movement mastery.
- Higher scores.
- More bloom coverage.
- Cleaner shadow avoidance.
- Fast restarts.
- A saved local best score.

Progression systems are intentionally out of scope for the MVP.

## Visual Style

- Dark rooftop garden or moonlit balcony setting.
- Deep night background with readable play space.
- Warm firefly glow as the player focus.
- Cool moonlight orbs.
- Soft flower blooms along the path.
- Shadow hazards should be dark, legible, and visually distinct from the background.
- UI should be minimal and calm.

The visuals should be atmospheric but never obscure gameplay readability.

## Sound and Feedback Direction

Sound can be added after the core loop works. Direction:

- Gentle collection chime for moonlight.
- Soft bloom sparkle or petal sound.
- Low, quiet warning sound for shadow contact.
- Calm game over sound.
- Subtle ambient night loop if time allows.

Visual feedback should come first because the MVP must work even muted.

## Risks

- Movement may feel too floaty or too stiff.
- Bloom trail rendering could become noisy or expensive.
- Shadows could feel unfair on small screens.
- The arena could feel empty without enough visual feedback.
- The game could become overbuilt before the core loop is fun.
- Mobile controls could lag behind desktop unless tested early.
