# Seri Lestari Spa — "Kenapa Spa?" (9:16 kinetic typography)

A 43-second vertical promo (1080 × 1920, 30 fps, H.264 + AAC) for TikTok, Instagram Reels and
Facebook Reels, built with [HyperFrames](https://hyperframes.heygen.com): HTML + GSAP compositions
rendered frame by frame to MP4, so every render is identical.

**Final video:** `renders/seri-lestari-spa-kenapa-spa.mp4`

## Project layout

```
index.html                  root composition: 11 scene hosts + HUD overlay + 3 audio stems
compositions/
  s01-hook.html             Hai, saya Aisyah dari Seri Lestari Spa.
  s02-question.html         Urut tu sebenarnya … Tapi kenapa … ke spa?
  s03-reveal.html           Sebab bukan urutan je yang awak dapat.
  s04-selesa.html           Pertama, tempat yang selesa.
  s05-suasana.html          Bilik yang tenang … nak pejam mata.
  s06-privasi.html          Kedua, privasi.
  s07-masa.html             Masa tu masa awak sendiri, tak ada yang mengganggu.
  s08-pengalaman.html       Ketiga, pengalaman.
  s09-perjalanan.html       Dari awak masuk sampai siap … dilayan dengan baik.
  s10-singgah.html          Jadi kalau minggu ni awak penat, singgahlah!
  s11-dm.html               DM kami untuk pertanyaan atau tempahan.
  hud.html                  editorial header (brand label, 3 benefit dots, progress line) + paper grain
assets/
  kit.js                    tiny shared helpers (split text into letters, prep SVG strokes)
  fonts/                    Archivo (variable), Instrument Serif, Caveat — all SIL OFL (licences included)
  vendor/                   GSAP 3.15.1 + MotionPathPlugin (local, so renders never hit the network)
  audio/narration.mp3       the supplied ElevenLabs narration (untouched)
  audio/voice.wav           narration, offset 0.2 s, levelled + peak-limited
  audio/music.wav           ORIGINAL lo-fi bed synthesised by scripts/build_audio.py, ducked under voice
  audio/sfx.wav             placed sound effects
  audio/sfx/                source SFX (Pixabay Content License — see CREDITS.md)
scripts/
  build_audio.py            builds voice/music/sfx stems (music synthesis, ducking, gain staging)
  sfx_cues.json             every sound effect, its time and the on-screen action it belongs to
SPEC.md                     the creative brief as numbers (palette, type, motion, shot list)
REVIEW.md                   what was checked, what was measured, known compromises
```

Each scene is its own sub-composition with its own paused GSAP timeline. Inside each scene file,
`N(t)` converts a **narration timestamp** to scene time, so every word is keyed to where it is spoken
in `narration.mp3`, which makes retiming easy.

## Re-render the video

Requirements: Node.js ≥ 22, FFmpeg, Python 3 with `numpy scipy soundfile` (only for rebuilding audio).

```bash
npm install
```

```bash
npm run audio      # optional: rebuild assets/audio/{voice,music,sfx}.wav
```

```bash
npm run check      # lint + runtime + layout + contrast checks
```

```bash
npm run render     # → renders/seri-lestari-spa-kenapa-spa.mp4
```

Live preview / editing in the browser Studio:

```bash
npx hyperframes preview
```

## Common edits

- **Text:** edit the words in the scene's HTML (e.g. `compositions/s04-selesa.html`). Letter-split text
  is marked `data-split` and is split automatically at load.
- **Timing:** each tween's position is `N(<narration seconds>)` or `T(<film seconds>)`.
- **Colours:** the palette is CSS variables at the top of `index.html` (`--cream`, `--wine`, `--sage`…).
- **Music:** to use a licensed track instead of the synthesised bed, replace `assets/audio/music.wav`
  (keep it 43 s, ducked, around −31 LUFS), or point the `<audio id="music">` element at your file and
  lower its `data-volume` until it sits under the voice (about 0.14).
- **Sound effects:** edit `scripts/sfx_cues.json`, then `npm run audio`.

## Licensing of assets

- Narration: supplied by the client (ElevenLabs export).
- Music: composed procedurally in `scripts/build_audio.py` for this project, with no samples or
  third-party music.
- SFX: from the HyperFrames skill bundle, sourced from Pixabay under the Pixabay Content License
  (commercial use, no attribution required): `assets/audio/sfx/CREDITS.md`.
- Fonts: Archivo, Instrument Serif, Caveat — SIL Open Font License 1.1 (`assets/fonts/LICENSE-*.txt`).
- GSAP: free standard licence (GreenSock "no-charge" licence since 3.13).
