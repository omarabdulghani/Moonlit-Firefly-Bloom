# MVP_SCOPE.md

# MVP Scope

The MVP should prove the core arcade loop with the smallest complete playable version.

## Current MVP Features

- Browser-playable game.
- Canvas-based playfield.
- Smooth firefly movement.
- Desktop keyboard movement.
- Desktop mouse/pointer movement.
- Mobile-friendly touch movement.
- Moonlight orbs that can be collected.
- Score from collecting moonlight.
- Moonlight orbs expire and respawn to keep the playfield alive.
- Shadow hazards.
- Glow meter.
- Shadow contact drains glow.
- Moonlight restores glow.
- Passive glow drain.
- Stronger visual danger feedback on shadow contact.
- Low-glow heartbeat warning audio.
- Game over when glow reaches zero.
- Final score display.
- Best score saved with `localStorage`.
- Instant retry.
- Responsive layout for desktop and mobile.
- Bloom Burst reward at high/full glow.
- Night Level escalation.
- Moon phase cycle.
- Moon Rain event with visible falling moonlight.
- Moon Shield, Moon Dash, and Glow Surge/x2 powerups.
- Basic sound effects.
- Pause/resume through `Esc`, tab switching, browser blur, and page visibility changes.
- Atmospheric rooftop background with skyline, railing, plants, birds, stars, and shooting stars.

## Current Scope Notes

- Persistent flower/bloom trail scoring was removed for MVP clarity.
- Powerups are temporary run-only pickups, not upgrades.
- The game currently stores only local best score.
- The prototype is still primarily a core-fun test, not a full release.

## Nice-to-Have Later Features

- A simple sound/mute setting.
- Accessibility options for reduced motion or high contrast.
- Better start screen presentation.
- More refined bird/star/background tuning after playtests.
- More readable tutorial/onboarding only if testers are confused.
- Private tester feedback guide or release notes.
- Small art polish pass after the core loop is proven.

## Explicitly Out of Scope

- Multiplayer.
- Accounts.
- Online leaderboard.
- Monetization.
- Shop.
- Multiple levels.
- Procedural biomes.
- Complex upgrades.
- Story mode.
- Achievements.
- Daily quests.
- Many enemy types.
- Complex particle systems.
- Complex asset pipelines.
- Save files beyond local best score.
- Server-side features.
- Currency, skins, unlocks, ads, payments, or permanent progression.
- PWA setup, Capacitor, native mobile packaging, or app-store files.

## MVP Success Criteria

- A new player understands the objective within a few seconds.
- Movement feels pleasant enough to repeat.
- Collecting moonlight is satisfying.
- Bloom Burst and powerup moments feel rewarding.
- Shadows create tension without feeling cruel.
- The glow meter is readable.
- Game over and retry are fast.
- Best score persists after refreshing the page.
- The game is playable on desktop and a mobile-sized viewport.
- The codebase remains small and understandable.
- Pause/resume behaves safely and does not drain glow while paused.

## Prototype Fun Tests

Use these questions during early playtests:

- Is flying around enjoyable before scoring is considered?
- Do moonlight orbs create good movement goals?
- Are Bloom Burst and powerup rewards easy to understand?
- Can the player understand why they lost glow?
- Does shadow avoidance feel fair?
- Does the player want to retry immediately after losing?
- Is the score motivating without adding complexity?
- Does the game still feel cozy when the player is under pressure?
- Do birds, stars, Moon Rain, and other atmosphere help without distracting?
