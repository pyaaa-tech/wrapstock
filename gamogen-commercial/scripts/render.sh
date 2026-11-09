#!/usr/bin/env bash
# Full production pipeline: assets -> audio -> HyperFrames render -> FFmpeg mix & master -> QC.
# Usage: ./scripts/render.sh            (full)
#        SKIP_VIDEO=1 ./scripts/render.sh   (re-mix audio onto an existing silent render)
set -euo pipefail
cd "$(dirname "$0")/.."
DUR=107.5
[ -f audio/source/voiceover.wav ] || ./scripts/extract_audio.sh
[ -f assets/product-images/bottle.png ] || python3 scripts/cutout_product.py
[ -f assets/product-images/healin_logo_circle.png ] || python3 scripts/cutout_logo.py
[ -f audio/music/bgm_spa_ambient.wav ] || python3 scripts/make_audio.py

# 1. export SFX cue sheet from the animation timeline, place SFX
node scripts/check_page.cjs
python3 scripts/build_sfx_track.py

# 2. render the HyperFrames composition (silent, 1080x1920 @ 30 fps)
if [ -z "${SKIP_VIDEO:-}" ]; then
  npx hyperframes lint .
  npx hyperframes render -q delivery -w 4 -o output/_video_silent.mp4
fi

# 3. mix narration + music + SFX
./scripts/mix_audio.sh

# 4. master: H.264 High / yuv420p / 30 fps + AAC 48 kHz, faststart for social upload
./scripts/master.sh
