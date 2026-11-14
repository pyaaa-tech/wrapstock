#!/usr/bin/env bash
# Voiceover -> ~-16 LUFS (gain tetap + limiter puncak sahaja; tempoh & kandungan tidak diubah).
# Bunyi tekan UI disintesis (klik lembut ~45 ms, puncak ~-30 dBFS).
set -euo pipefail
cd "$(dirname "$0")/.."
GAIN=${GAIN:-7.8}
ffmpeg -y -v error -i assets/voiceover.mp3 -af "volume=${GAIN}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled" -ar 48000 -ac 1 -c:a pcm_s16le public/voiceover.wav
ffmpeg -hide_banner -i public/voiceover.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" 
ffprobe -v error -show_entries format=duration -of csv=p=0 public/voiceover.wav
# klik: dua nada pendek mereput + sedikit hingar, puncak -30 dBFS
ffmpeg -y -v error -f lavfi -i "aevalsrc='0.0316*exp(-t*95)*(0.7*sin(2*PI*1750*t)+0.3*sin(2*PI*2900*t))+0.004*exp(-t*220)*(random(0)-0.5)':d=0.06:s=48000" -af "afade=t=in:d=0.002,afade=t=out:st=0.045:d=0.015" -c:a pcm_s16le public/tap.wav
ffmpeg -hide_banner -i public/tap.wav -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level" | head -1
