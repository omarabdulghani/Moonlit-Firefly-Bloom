# Moonlit Firefly Bloom

Moonlit Firefly Bloom is a cozy browser-first arcade game about guiding a tiny glowing firefly across a moonlit rooftop, collecting light, avoiding creeping shadows, and surviving deeper into the night.

The game should feel simple, magical, readable, and replayable: fly, gather light, stay glowing, trigger satisfying Bloom moments, survive a little longer, and instantly try again.

## Current Status

Local playable prototype.

Implemented:

- Responsive canvas game.
- Start, playing, paused, and game over states.
- Keyboard, mouse/pointer, and touch movement.
- Mobile virtual joystick for phone/narrow screens.
- Moonlight orbs with scoring, glow restore, lifetime, and respawn behavior.
- Shadow hazards that drain glow and trigger stronger danger feedback.
- Passive glow drain, low-glow warning audio, and local best score.
- Bloom Burst reward moments at high/full glow.
- Night Level escalation, moon phase cycle, and Moon Rain event.
- Moon Shield, Moon Dash, and Glow Surge/x2 powerups.
- Powerup sounds, shadow damage sound, Moon Rain ambience, and other core sound effects.
- Manually approved runtime audio using M4A primary and MP3 fallback files.
- Rooftop background assets, animated night birds, additional stars, and occasional shooting stars.
- Pause/resume flow through `Esc`, browser blur, tab switching, and page visibility changes.

Still not implemented:

- Accounts.
- Backend.
- Online leaderboard.
- Shops, upgrades, ads, monetization, or achievements.
- Settings/menu systems beyond the current start, pause, and game over overlays.

## How to Run Locally

The project uses Vite, TypeScript, HTML Canvas, and CSS.

```bash
npm install
npm run dev
```

Then open the local Vite URL in a browser.

To check a production-style build:

```bash
npm run build
npm run preview
```

## Core Controls

- Desktop keyboard: move with `WASD` or arrow keys.
- Desktop pointer: move the firefly with the mouse.
- Pause: press `Esc`, switch tabs, or leave the browser window.
- Resume: click or tap the resume prompt.
- Mobile: use the bottom-left virtual joystick on phone/narrow screens.
- Restart: click or tap the game over prompt.

Controls should be easy to understand without a tutorial.

## MVP Goal

Answer one question quickly:

> Is it fun to fly around, collect light, avoid shadows, trigger satisfying glow rewards, and instantly retry?

The local prototype now answers most of the technical MVP questions. The next main question is fun: whether private testers want another run after learning the core loop.

## Where We Stand

The project is currently ready for focused private playtesting. The latest work stabilized mobile audio playback, switched runtime audio to Omar-approved M4A/MP3 files, refined mobile controls with a virtual joystick, and kept the rooftop scene atmospheric without adding long-term systems.

Recommended next work:

- Private playtest the current loop.
- Tune powerup frequency and difficulty only after observing play.
- QA pause/resume, browser tab switching, mobile joystick feel, and audio behavior on real phones.
- Consider a simple settings/mute option later, but do not add it until the core feel is stable.

## Development Philosophy

Keep the first version small, playable, and easy to change. Prioritize movement feel, readable visuals, fast restart, and mobile-friendly input over progression systems or architecture. Do not hide weak core gameplay behind unlocks, shops, achievements, or extra content. Build the cozy arcade loop first.
