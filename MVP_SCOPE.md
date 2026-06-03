# MVP_SCOPE.md

# MVP Scope

The MVP should prove the core arcade loop with the smallest complete playable version.

## Current MVP Features

- Browser-playable game.
- Canvas-based playfield.
- Smooth firefly movement.
- Desktop keyboard movement.
- Desktop mouse/pointer movement.
- Mobile-friendly touch movement with a default virtual joystick on phone/narrow screens.
- Moonlight orbs that can be collected.
- Internal/legacy score from collecting moonlight.
- Moonlight gathered as the clearer player-facing collection stat.
- Moonlight orbs expire and respawn to keep the playfield alive.
- Shadow hazards.
- Glow meter.
- Shadow contact drains glow.
- Moonlight restores glow.
- Passive glow drain.
- Stronger visual danger feedback on shadow contact.
- Low-glow heartbeat warning audio.
- Game over when glow reaches zero.
- Game-over summary focused on Night reached, poetic title, Moonlight gathered, Time glowing, earned Full Moon milestones, and Best Night.
- Best Night saved with `localStorage`.
- Instant retry.
- Responsive layout for desktop and mobile.
- Bloom Burst reward at high/full glow.
- Night Level escalation.
- Moon phase cycle.
- Full Moon Blessing on later Full Moons with glow protection, moon-white meter styling, plant-side decorative fireflies, and temporary shadow disappearance.
- Delayed Moon Rain event with visible falling moonlight that builds and thins by drop density.
- Moon Shield, Moon Dash, and Glow Surge/x2 powerups.
- Basic sound effects using manually approved M4A runtime files with MP3 fallback.
- Pause/resume through `Esc`, tab switching, browser blur, and page visibility changes.
- Atmospheric rooftop background with skyline, railing, enlarged side plants, birds, stars, and shooting stars.
- Hidden URL-based developer test scenarios for Full Moon and Moon Rain QA.

## Current Scope Notes

- Persistent flower/bloom trail scoring was removed for MVP clarity.
- Powerups are temporary run-only pickups, not upgrades.
- The game currently stores simple local records such as best score internally and player-facing Best Night.
- Developer scenario runs do not update local records such as best score or Best Night.
- WAV audio files are source/master assets only; normal runtime playback uses approved M4A/MP3 files.
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
- Save files beyond simple local records.
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
- Best Night persists after refreshing the page.
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
- Does Night reached feel more rewarding than a raw score number?
- Does the poetic title make game over feel warm and personal?
- Does the game still feel cozy when the player is under pressure?
- Do birds, stars, Moon Rain, and other atmosphere help without distracting?
- Does Full Moon Blessing feel rewarding, clean, and readable when shadows vanish?
