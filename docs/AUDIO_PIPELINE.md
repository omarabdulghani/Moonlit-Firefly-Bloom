# Audio Pipeline

Moonlit Firefly Bloom keeps original WAV files as source/master assets and uses manually approved compressed runtime files for browser playback.

## Source Masters

Source/master audio lives in:

- `sounds/`
- `public/sounds/`

These WAV files should be kept as originals for editing, audit, and legal/IP records. Do not delete them when creating runtime exports.

## Runtime Audio

Runtime audio lives in:

- `public/sounds/runtime/m4a/`
- `public/sounds/runtime/mp3/`

The game tries manually approved `.m4a` / AAC files first because they work well on iOS/Safari. If the browser does not support or cannot decode M4A, the game tries the manually approved `.mp3` fallback.

WAV files are source/master assets only and should not be used for normal gameplay runtime playback.

Do not use OGG as the only runtime format because iOS support can be inconsistent.

## Mobile Rationale

Mobile browsers, especially Safari on iPhone, require audio to unlock after user interaction. Web Audio also needs to fetch and decode sounds before playback.

Large WAV files can cause:

- delayed first sound playback
- missed start sounds after refresh
- decoding spikes on phone
- inconsistent local-network testing results

Compressed runtime audio keeps startup and frequent sound effects responsive.

Codex should not auto-convert, trim, normalize, regenerate, or overwrite runtime audio unless Omar explicitly asks for that work. Current runtime files were manually converted and approved by Omar.

## Mobile Safari Troubleshooting

For reliable iPhone playback:

- Prime audio directly inside a real user gesture such as `pointerdown`, `touchstart`, or `click`.
- Keep gameplay transitions independent from audio unlock so blocked audio cannot stop the run.
- The start sound may use a gesture-safe `HTMLAudioElement` fallback so the first tap can make an immediate sound.
- Normal gameplay sounds use Web Audio buffers so one-shot cues can layer cleanly over Moon Rain ambience.
- If the AudioContext is still resuming or a sound is still decoding, gameplay sound requests should wait briefly for readiness instead of being dropped.
- Use a fresh `AudioBufferSourceNode` for every Web Audio one-shot.
- Let one-shot sounds finish naturally; when an instance cap is reached, skip the extra duplicate instead of stopping the sound already playing.
- Keep important pickup sounds in the high-priority preload group so powerup cues are decoded before they are likely to be collected.
- M4A is the primary runtime format, but MP3 fallback must still be attempted after M4A fetch or decode failure.
- Repeated short sounds need tiny cooldowns to prevent same-frame spam, not aggressive suppression that hides normal sequential pickups.
- Use `?audioDebug=1` to log unlock attempts, decode results, play/skip reasons, and source-ended events during mobile Safari debugging.

## Target Durations

One-shot sounds should stay short:

- Start run: about 0.6 to 1.2 seconds
- Orb collect: about 0.2 to 0.6 seconds
- Shadow damage: about 0.3 to 0.8 seconds
- Bloom Burst: about 0.4 to 1.0 seconds
- Low glow warning: about 0.4 to 1.0 seconds
- Game over: about 0.8 to 1.5 seconds
- Powerups: about 0.3 to 0.8 seconds
- Moon phase cues: about 0.4 to 1.0 seconds
- Moon Rain begin/end: about 0.5 to 1.2 seconds

Moon Rain ambience can remain longer, but it should still be compressed.

## Current Runtime Exports

The current runtime files are manual approved derivatives copied from:

- `sounds/M4A/`
- `sounds/MP3/`

They are exposed to the browser at:

- `public/sounds/runtime/m4a/`
- `public/sounds/runtime/mp3/`

The previous auto-generated `public/sounds/optimized/` folder is no longer used.

## Future Export Notes

When adding or replacing sounds:

- Keep the original WAV export.
- Use Omar-approved compressed runtime `.m4a` and `.mp3` files.
- Prefer `.m4a` / AAC for iOS-first web playback.
- Do not auto-trim, auto-convert, normalize, regenerate, or overwrite runtime audio unless explicitly requested.
- Update `legal/AUDIO_ASSET_LOG.md`.
- Update `src/audio/AudioManager.ts` with M4A primary and MP3 fallback runtime paths.
