# Audio Asset Log

Use this file to track Suno-generated sounds and related proof for Moonlit Firefly Bloom.

Keep Suno receipts/subscription proof, original WAV exports, prompt text, and generation links or IDs if available. Avoid naming or marketing any sound as inspired by a copyrighted franchise, famous song, film, game, brand, or character.

| Asset file name | In-game use | Tool/source | Subscription/plan at generation | Date generated | Prompt used | Original download kept? yes/no | Commercial-use proof saved? yes/no | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bloom Burst.wav | Bloom Burst reward cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Crescent Event Begins.wav | Crescent moon phase cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Full Moon Event Begins.wav | Full Moon phase cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Game over _ Glow Faded.wav | Game over / Glow Faded cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Gibbous Event Begins.wav | Gibbous moon phase cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Glow reaches low _ warning state.wav | Low glow warning cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Moonlight Orb Collect.wav | Moonlight orb collection cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| New Moon Event Begins.wav | New Moon phase cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Quarter Moon Event Begins.wav | Quarter moon phase cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Start run.wav | Start and retry cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Touch shadow _ take shadow damage.wav | Shadow damage cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Touch shadow _ take shadow damage2.wav | Shadow damage cue, observed source file in `sounds/` | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. Confirm whether this replaces the non-`2` filename. |
| Moon Rain Begins Event.wav | Moon Rain start cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Moon Rain ambience loop.wav | Moon Rain ambience loop | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Moon Rain ends.wav | Moon Rain end cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| Moon Shield appears.wav | Moon Shield pickup cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| x2 powerup sound.wav | Glow Surge / x2 powerup cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |
| speed powerup.wav | Moon Dash speed powerup cue | Suno AI | Suno Pro, confirm exact account/date | TODO | TODO | TODO | TODO | Generated for Moonlit Firefly Bloom as an original game sound effect. |

## Runtime Copies

The game keeps WAV files as source/master assets only. Normal gameplay runtime audio should use Omar-approved compressed derivatives:

- Primary runtime format: `public/sounds/runtime/m4a/`
- Fallback runtime format: `public/sounds/runtime/mp3/`

The previous Codex-generated `public/sounds/optimized/` folder is no longer used.

## Approved Runtime Derivatives

Original WAV exports are source/master assets. Manually approved `.m4a` and `.mp3` files are runtime derivatives copied from Omar's approved `sounds/M4A/` and `sounds/MP3/` folders. Keep both the original WAV source files and approved runtime derivatives for release records.

| Runtime file | Source/master WAV | In-game use | Notes |
| --- | --- | --- | --- |
| public/sounds/runtime/m4a/start-run.m4a and public/sounds/runtime/mp3/start-run.mp3 | Start run.wav | Start and retry cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/orb-collect.m4a and public/sounds/runtime/mp3/orb-collect.mp3 | Moonlight Orb Collect.wav | Moonlight orb collection cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/shadow-damage.m4a and public/sounds/runtime/mp3/shadow-damage.mp3 | Touch shadow _ take shadow damage2.wav | Shadow damage cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/bloom-burst.m4a and public/sounds/runtime/mp3/bloom-burst.mp3 | Bloom Burst.wav | Bloom Burst reward cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/low-glow-warning.m4a and public/sounds/runtime/mp3/low-glow-warning.mp3 | Glow reaches low _ warning state.wav | Low glow warning cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/game-over-glow-faded.m4a and public/sounds/runtime/mp3/game-over-glow-faded.mp3 | Game over _ Glow Faded.wav | Game over / Glow Faded cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-rain-begins.m4a and public/sounds/runtime/mp3/moon-rain-begins.mp3 | Moon Rain Begins Event.wav | Moon Rain start cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-rain-ambience-loop.m4a and public/sounds/runtime/mp3/moon-rain-ambience-loop.mp3 | Moon Rain ambience loop.wav | Moon Rain ambience loop | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-rain-ends.m4a and public/sounds/runtime/mp3/moon-rain-ends.mp3 | Moon Rain ends.wav | Moon Rain end cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-shield.m4a and public/sounds/runtime/mp3/moon-shield.mp3 | Moon Shield appears.wav | Moon Shield pickup cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/speed-powerup.m4a and public/sounds/runtime/mp3/speed-powerup.mp3 | speed powerup.wav | Moon Dash speed powerup cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/x2-powerup.m4a and public/sounds/runtime/mp3/x2-powerup.mp3 | x2 powerup sound.wav | Glow Surge / x2 powerup cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-phase-full.m4a and public/sounds/runtime/mp3/moon-phase-full.mp3 | Full Moon Event Begins.wav | Full Moon phase cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-phase-gibbous.m4a and public/sounds/runtime/mp3/moon-phase-gibbous.mp3 | Gibbous Event Begins.wav | Gibbous moon phase cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-phase-quarter.m4a and public/sounds/runtime/mp3/moon-phase-quarter.mp3 | Quarter Moon Event Begins.wav | Quarter moon phase cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-phase-crescent.m4a and public/sounds/runtime/mp3/moon-phase-crescent.mp3 | Crescent Event Begins.wav | Crescent moon phase cue | Omar-approved runtime derivative. |
| public/sounds/runtime/m4a/moon-phase-new.m4a and public/sounds/runtime/mp3/moon-phase-new.mp3 | New Moon Event Begins.wav | New Moon phase cue | Omar-approved runtime derivative. |
