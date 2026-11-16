# Kenapa kita suka tangguh kerja? (YouTube Short)

45-second vertical short (1080x1920, 30 fps; 44 s programme + brand outro) starring **Si Otak**, an original pink-brain character.
Built with [Remotion](https://www.remotion.dev). The ElevenLabs voiceover in `public/audio/vo.mp3` is the master
timeline and is never trimmed.

## Render

```bash
npm i
npx remotion render TangguhKerja out/tangguh-kerja.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=192k
```

Preview in the Studio: `npx remotion studio`.

## How the sync works

1. `scripts/align.py` runs CTC forced alignment (MMS aligner from Hugging Face) of `data/transcript.txt`
   against the voiceover and writes `data/aligned.json` (word onsets, ~20 ms resolution).
2. `scripts/make_timing.py` turns that into `src/timing.ts`.
3. Every cut, slam, pop and caption reads its frame from a spoken word via `F("word")` (`src/lib/time.ts`),
   floored to the frame so visuals never trail the voice. Scene windows are in `src/cues.ts`.
4. `python3 scripts/cue_sheet.py` prints the cue sheet (event -> word -> onset -> frame).

If the voiceover changes: update `data/transcript.txt`, re-run `align.py` and `make_timing.py`, re-render.

## Soundtrack (music + SFX)

`scripts/make_audio.py` builds `public/audio/mix.wav` (what the composition plays): the untouched voiceover,
an original 120 BPM music bed (44 s = 22 bars, follows the scene arc, ducks ~9 dB under the voice) and
synthesised SFX (whooshes on whip-pans/zooms, pops on keywords and comment bubbles, impacts on slams, clock
ticks, alarm, sparkles, confetti, typing...). Everything is generated from scratch, so nothing needs licensing.
SFX use the same word onsets as the picture. Tails wrap around 44 s so the audio loops seamlessly.
The mix is mastered to -14 LUFS / -1 dBTP.

```bash
pip install numpy scipy pyloudnorm   # plus ffmpeg on PATH
python scripts/make_audio.py                  # synth music bed
python scripts/make_audio.py --music song.mp3 # or duck your own track under the voice instead
```

Stems are written to `out/stems/` (music.wav, sfx.wav) for re-mixing elsewhere.

## Brand outro

`src/scenes/Outro.tsx`: right after the last voice line, a whip-pan lands on the cream dot background at
44.0 s, the supplied Soyaa Soy PNG (`public/brand/soyaa-soy-logo.png`, used unmodified and drawn above the
paper/grain overlays) pops in with a spring (0.3 -> 1.08 -> 1.0, -9 deg -> 0), six flat #EF85A0 sparkles
twinkle around it, and it holds until the end (frame 1354), which hard-cuts back to frame 0.
The only outro sound is a soft bubble "blup" on the pop (`blup()` in `scripts/make_audio.py`); music and SFX
tails fade out within 0.12 s of the outro landing.

## Layout / safe zones

Keywords live in the top 35%, captions at ~62-70% height, and nothing important sits in the bottom 20% or the
right 12% (Shorts UI). Constants are in `src/theme.ts` (`SAFE`).

## Structure

- `src/Main.tsx` – scene table, transitions (whip-pan with directional motion blur, scale-through zoom, match and
  smash cuts), 6-frame screen shake, captions, paper/grain overlays, audio, seamless loop.
- `src/scenes/` – the seven scenes (3 and 5 have sub-beats for the extra voice lines).
- `src/components/SiOtak.tsx` – the character (expressions, noodle limbs, squash & stretch).
- `src/components/Kinetic.tsx` – letter-by-letter kinetic type (bounce / hop / slam).
- `src/components/Captions.tsx` – word-by-word captions with the active word in yellow at 110%.
