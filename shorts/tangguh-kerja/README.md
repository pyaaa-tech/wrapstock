# Kenapa kita suka tangguh kerja? (YouTube Short)

44-second vertical short (1080x1920, 30 fps) starring **Si Otak**, an original pink-brain character.
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
