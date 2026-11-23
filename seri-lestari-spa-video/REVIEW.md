# REVIEW — Seri Lestari Spa · "Kenapa Spa?"

Final file: `renders/seri-lestari-spa-kenapa-spa.mp4`. It is H.264 High 1080×1920, 30 fps,
1290 frames, 43.0 s, with AAC 48 kHz stereo audio and is 18.1 MB.

## Creative calls

- **One medium: editorial print on cream paper.** The video uses flat ink, wine and sage plates,
  7% static paper grain, and custom outline doodles with no gradients, glow or stock art. Every icon
  (bed, towel, dropper bottle, door, alarm clock, message bubble…) was drawn as SVG for this video.
- **Type system.** Archivo Variable 900 carries hooks and punchlines, Instrument Serif roman and
  italic carries the soft and premium words, condensed Archivo carries the labels, and Caveat
  appears once, for "kan?".
- **Every transition has an on-screen cause.**
  - A wine band wipes over the cut after the hook.
  - Words collide into a point and the wine bursts out of it ("Tapi").
  - The wine page retracts upward.
  - The pillow chip blooms into the next scene.
  - The eyelids close on "nak pejam mata".
  - An iris opens through the door.
  - A sage page slides in.
  - The camera pans along a dotted path into the journey.
  - Wine bars whip across for the energy shift.
- **Calm vs. punch.** The atmosphere scene uses 0.9–1.4 s floats, while the punchlines (SPA?, JE,
  SINGGAHLAH!) use 0.3–0.5 s springs.
- **Script fidelity.** The narration is untouched. On-screen text uses only the script's words, plus
  the brief's own "KATIL & TUALA" and "DIMANJAKAN", the day initials I S R K J S A, and the
  numerals 01/02/03. There are no invented phone numbers, handles, links, addresses or claims.

## What was measured

- `hyperframes check`: **0 errors**. Lint shows 0 errors and 0 warnings.
- `snapshot --review` produced the scene-beat sheets, 20 cut strips and phone-width (360 px) sheets.
  All of them were viewed.
- Fixes made after review:
  - "sebenarnya" collided with "TU…".
  - "DM KAMI" had lost its word space.
  - A stray hyphen peeked in at 27.7 s.
  - DIMANJAKAN touched its icon.
  - The MATA weight swap looked doubled.
  - Frame 0 was too sparse; it now reads "HAI!".
  - The scent lines crossed the header.
- Final MP4:
  - It decodes fully with no errors (`ffmpeg -f null`).
  - **0 black segments** (`blackdetect`).
  - Loudness is **−15.2 LUFS** integrated, with a −2.0 dBTP peak and no clipping.
  - Envelope cross-correlation puts the narration **200 ms** into the film, exactly the designed
    offset. Every animation is keyed to the narration's measured phrase and pause timings.
- The music bed sits about 16 dB under the voice and ducks a further 7 dB while Aisyah speaks.

## What nobody checked

- **The sound was measured, not heard.** Levels, sync and the placement of each effect are
  verified by numbers only. Nobody has listened to the music's character.
- **Word timing within phrases** was estimated by syllable count. Phrase boundaries come from
  silence detection; the transcription models are on HuggingFace, which was not reachable here.
  The big hits (SPA?, selesa, privasi, pengalaman, penat, singgahlah, DM) sit on measured
  phrase starts.
- Malay spelling was checked against the script by eye. A native speaker should still watch it once.

## Music licensing

The HeyGen music catalogue needs a sign-in, so the bed was **synthesised in code**
(`scripts/build_audio.py`): EP chords, bass, swung lo-fi drums, a marimba motif and one riser.
No samples or third-party music were used, so it is clean to publish. It is a functional bed
rather than a produced track. Swapping in a licensed track is a one-file change (see README).
The SFX are Pixabay Content License files bundled with HyperFrames.

## Warnings kept on purpose

- **`outside_safe_zone` (33).**
  - Key words use a 116 px left margin. That is inside the 80% title-safe box, but TikTok's
    profile asks for 120 px.
  - A few large words extend to about x = 900 below y = 840, where TikTok's checker allows 780.
  - In the actual apps, the right action rail starts around x ≈ 960 and the caption band around
    y ≈ 1500, so nothing readable sits under platform UI.
  - Shrinking every hero word to fit the strictest profile would have flattened the typography
    the brief asked for.
- **`content_overlap` / `text_occluded` (info).** These come from deliberate layering: the JE
  sticker, the pink "?" behind SPA, and letters mid-spring.

## Weakest shot and next steps

- **Weakest:** the 10.3 s beat, where "sebab" stands alone for 0.3 s while the page retracts. It
  is a breath before BUKAN, but it is the plainest frame.
- With more time, I would:
  - Swap in a produced licensed music track.
  - Get word-level timestamps from a real transcription pass to tighten per-word hits.
  - Make a 1:1 or 4:5 cut-down for feed placements.
