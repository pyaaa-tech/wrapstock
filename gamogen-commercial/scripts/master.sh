#!/usr/bin/env bash
# Mux the silent HyperFrames render with the final mix and encode the delivery MP4.
set -euo pipefail
cd "$(dirname "$0")/.."
DUR=107.5
OUT=output/HEALIN_GAMOGEN_Commercial_9x16_1080x1920.mp4
ffmpeg -v error -y -i output/_video_silent.mp4 -i audio/mix/final_mix.wav \
  -map 0:v:0 -map 1:a:0 -t $DUR \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -g 60 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -metadata title="HEALIN GAMOGEN — Sokongan untuk kesejahteraan harian anda" "$OUT"
echo "delivered -> $OUT"
./scripts/qc.sh "$OUT"
