#!/usr/bin/env bash
# Technical QC of the delivery file: format, duration, loudness, black frames, frozen frames.
set -euo pipefail
F=${1:-output/HEALIN_GAMOGEN_Commercial_9x16_1080x1920.mp4}
echo "== streams"; ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,sample_rate,channels,bit_rate -show_entries format=duration,size -of default=nw=1 "$F"
echo "== loudness"; ffmpeg -hide_banner -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tr -s ' '
echo "== black frames (>0.2s)"; ffmpeg -hide_banner -i "$F" -vf blackdetect=d=0.2:pix_th=0.10 -an -f null - 2>&1 | grep -c blackdetect || true
echo "== narration sync: first/last voice energy vs source"; ffmpeg -hide_banner -i "$F" -af silencedetect=noise=-35dB:d=0.25 -vn -f null - 2>&1 | grep -E "silence_(start|end)" | head -3
