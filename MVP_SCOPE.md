# MVP_SCOPE.md

# MVP Scope

The MVP should prove the core arcade loop with the smallest complete playable version.

## Must-Have MVP Features

- Browser-playable game.
- Canvas-based playfield.
- Smooth firefly movement.
- Desktop keyboard movement.
- Mobile-friendly touch movement.
- Moonlight orbs that can be collected.
- Score from collecting moonlight.
- Flower or bloom marks left behind the firefly.
- Score or progress reward for blooming new space.
- Shadow hazards.
- Glow meter.
- Shadow contact drains glow.
- Moonlight restores glow.
- Game over when glow reaches zero.
- Final score display.
- Best score saved with `localStorage`.
- Instant retry.
- Responsive layout for desktop and mobile.

## Nice-to-Have Later Features

- Gentle sound effects.
- Ambient background audio.
- More flower visual variety.
- Simple cosmetic unlocks.
- A few alternate color palettes.
- Better start screen art.
- Subtle particle polish.
- Screen shake or pulse effects used sparingly.
- Accessibility options for reduced motion or high contrast.

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

## MVP Success Criteria

- A new player understands the objective within a few seconds.
- Movement feels pleasant enough to repeat.
- Collecting moonlight is satisfying.
- Blooming the garden is visually rewarding.
- Shadows create tension without feeling cruel.
- The glow meter is readable.
- Game over and retry are fast.
- Best score persists after refreshing the page.
- The game is playable on desktop and a mobile-sized viewport.
- The codebase remains small and understandable.

## Prototype Fun Tests

Use these questions during early playtests:

- Is flying around enjoyable before scoring is considered?
- Do moonlight orbs create good movement goals?
- Is it clear when the player is blooming new space?
- Can the player understand why they lost glow?
- Does shadow avoidance feel fair?
- Does the player want to retry immediately after losing?
- Is the score motivating without adding complexity?
- Does the game still feel cozy when the player is under pressure?
