#!/usr/bin/env bash
# Fail akhir untuk TikTok/Reels daripada render Remotion:
#   - video: JPEG full-range bt601 (keluaran Remotion) -> H.264 High yuv420p bt709 limited-range, bertag
#   - audio: runut audio Remotion (voiceover + klik UI), AAC 192k stereo, ~-16 LUFS
# Guna: scripts/finalize.sh <master.mp4 daripada `remotion render`> <audio.wav daripada `remotion render --codec=wav`>
set -euo pipefail
cd "$(dirname "$0")/.."
MASTER=${1:-out/master_fullrange.mp4}
AUDIO=${2:-out/audio.wav}
OUT=out/tutorial_tempahan_seri_lestari.mp4
ffmpeg -y -v error -i "$MASTER" -i "$AUDIO" -map 0:v -map 1:a \
  -vf "scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -g 60 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 101.266667 "$OUT"
ffprobe -v error -show_entries stream=codec_name,pix_fmt,nb_frames,duration:format=duration -of default=nw=1 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
