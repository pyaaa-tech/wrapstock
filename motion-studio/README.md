# Piya's Motion Design Studio

One storyboard, two production outputs:

| Output | Engine | Command | Result |
| --- | --- | --- | --- |
| **MP4 video** | Remotion (frame-based) | `npm run render` | `out/seri-lestari-migrain.mp4` — 1080×1920, 30 fps, 70 s |
| **HTML motion site** | React + Vite + GSAP + CSS + SVG | `npm run web` / `npm run web:build` | `dist-web/` — standalone, responsive |

Both outputs render the **same scene components** from `src/core/`. Scenes never import Remotion or GSAP; they ask a small platform bridge for the current frame. Remotion supplies `useCurrentFrame()`, the website supplies a GSAP timeline playhead. Tokens, type, colour, assets and timing cannot drift apart because there is only one copy of them.

```
npm install
npm run studio      # Remotion Studio — scrub every scene
npm run render      # MP4
npm run web         # website, dev server
npm run web:build   # website, static build → dist-web/
npm run sfx         # regenerate the sound-design layer (python3 + numpy + ffmpeg)
```

> Sandboxed / offline machine? Point Remotion at an existing Chrome Headless Shell:
> `REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render`

---

## Project 01 — Seri Lestari Spa · “Denyut → Tenang”

**Content.** A 69-second Malay voice-over: migraine affects ~1.2 billion people; three habits that may help (consistent sleep, staying active, limiting caffeine), a caution on painkiller overuse, when to seek urgent care — then an invitation to rest at Seri Lestari Spa, Batu Pahat (Muslimah only).

**Audience.** Women in and around Batu Pahat, watching on a phone, sound on or off. Vertical 9:16.

**Concept — Throb → Calm.** The film behaves like the condition it describes. It opens tight, loud and pulsing; every habit loosens it; by the end the type is breathing. The single idea every decision is tested against: *does this frame feel more or less tense than the one before?*

### Typography

| Role | Face | Why |
| --- | --- | --- |
| Kinetic display | **Anybody** (variable, width 50–150) | The width axis *is* the pulse — letters physically swell and compress |
| The calm voice | **Instrument Serif** italic | Soft, human counter-voice; takes over as tension drops |
| Supporting sentences | **Bricolage Grotesque** | Readable at 58–84 px with some character |
| Data & labels | **Space Mono** | Indices, running head, footnotes |

### Colour

| Token | Hex | Job |
| --- | --- | --- |
| `ink` | `#1B0A0E` | Burgundy-black ground |
| `burgundy` / `wine` | `#5B1423` / `#7F2334` | Body colour on light grounds |
| `vermilion` | `#FF4A2B` | **Pain, risk, urgency only** — never decoration |
| `ivory` / `bone` | `#F3EADB` / `#E6DAC6` | Light ground, relief |
| `sage` / `sageDeep` | `#A9B69B` / `#55634C` | Calm, habit, breath |
| `gold` | `#C9A254` | Reserved for the brand |

### Storyboard (timed to the voice-over)

| # | Time | Line | Picture | Motion | Enters by |
| --- | --- | --- | --- | --- | --- |
| 01 | 0:00 | *Migrain buat kepala anda berdenyut?* | Portrait in an arch, MIGRAIN above | Width-axis throb + pulse rings on each stressed syllable; serif answer calms the frame | cut |
| 02 | 0:03 | *1.2 bilion orang…* | Counter, field of dots | Number compresses as it lands; lit dots flare outward | wipe with vermilion edge |
| 03 | 0:08 | *…ada 3 tabiat* | Footage inside a giant “3” | Iris out of one dot; text-masked video; tape strip; camera dive | iris |
| 04 | 0:13 | *Tidur secara konsisten* | Sleep footage + rhythm line | Smooth wave **morphs** into a jagged one on “terganggu” | wipe up |
| 05 | 0:19 | *Kekal aktif* | Yoga footage in an arch | Type inverts colour where it crosses footage; week + month trackers | wipe left |
| 06 | 0:27 | *Kawal kafein* | Cups | KAFEIN arrives too wide and is squeezed (“kawal”); excess cups tumble in | diagonal |
| 07 | 0:35 | *Elakkan ubat tahan sakit berlebihan* | Capsules | Stamp with overshoot + shake; strike-through | wipe up |
| 08 | 0:40 | *Tiba-tiba… paling teruk… segera* | Type only, full vermilion | Glitch, squash-and-stretch, quake, motion-blurred slam | slices → shutter |
| 09 | 0:47 | *Pendidikan sahaja* | Footnote | First stillness; a slow asterisk | wipe up |
| 10 | 0:50 | *Beri ruang… berehat* | Breathing shape | “RUANG” opens its own letter-spacing; parallax scroll | bloom (the only dissolve) |
| 11 | 0:57 | *Seri Lestari Spa, Batu Pahat* | Gold logo | Mask reveal, sheen, particle burst | iris |
| 12 | 1:02 | *Oh, lupa… Muslimah sahaja* | Playful P.S. | Wobbly spring, highlight wipe, typewriter aside | diagonal |
| 13 | 1:08 | — | End card | Held logo + CTA | iris |

**Sound design.** `tools/make_sfx.py` synthesises a quiet layer under the voice: heartbeat thumps on the hook, air on transitions, impacts on the slams, a warm pad and chime for the calm act. It is a separate track — `sfx: false` in the Remotion props, or the SFX toggle on the site, removes it.

---

## Structure

```
public/                 shared assets (audio, video, img, fonts) — used by both engines
src/core/               ← everything creative lives here, engine-agnostic
  tokens.ts             stage size, colour, fonts, safe area
  storyboard.ts         scene timings, VO cue helper, captions
  platform.tsx          the bridge: useFrame / Seq / Video / Img / asset
  fonts.ts              local font loading (no network at render time)
  motion/math.ts        easing, springs, interpolation, noise, beat envelope
  motion/text.tsx       Words · Letters · Stretch · Fit · Mask · Glitch · Typewriter
  motion/fx.tsx         Camera · Tilt3D · Parallax · Trail · Grain · Burst · PulseRings
                        morphPoints · Draw · GlitchBars · Enter (scene transitions)
  scenes/               one file per scene
  Film.tsx              the assembled film
src/remotion/           Remotion adapter + compositions (Film, plus every scene on its own)
src/web/                GSAP engine, web adapter, site shell + styles
tools/make_sfx.py       procedural sound design
```

### Motion library → where it is used

Staggered word reveal (`Words`, everywhere, cued per spoken word) · kinetic stretching (`Stretch`, `Fit`) · elastic letters / overshoot / anticipation (`Letters`, `spring`, `ease.back`, `ease.anticipate`) · 3D rotation (`Tilt3D`) · masked reveal (`Mask`, clip-path video in scene 03) · glitch displacement (`Glitch`, `GlitchBars`) · morphing shapes (`morphPoints`, breathing blob) · parallax (`Parallax`) · motion blur (`Trail`) · particle burst (`Burst`) · camera push/zoom (`Camera`) · beat-synchronised transitions (`beatEnvelope`, VO cues) · animated SVG (`Draw`, `PulseRings`, cups, capsules, cross).

### Starting the next project

1. Replace the assets in `public/` and rewrite `tokens.ts` (palette + fonts for the new art direction).
2. Transcribe the voice-over, put the word timings into `storyboard.ts`.
3. Write scenes in `src/core/scenes/` using the motion library; register them in `Film.tsx`.
4. `npm run studio` to art-direct, `npm run render` and `npm run web:build` to ship both outputs.

Rules that keep both outputs identical: animate only from `useFrame()`; no CSS transitions/animations, timers or `Math.random()` inside `src/core/`.
