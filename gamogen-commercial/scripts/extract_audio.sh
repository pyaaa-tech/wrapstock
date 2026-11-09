#!/usr/bin/env bash
# Extract the original voice-over from the supplied MP4 (lossless PCM) + a 16 kHz mono copy for transcription.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i audio/source/original_voiceover.mp4 -vn -c:a pcm_s16le audio/source/voiceover.wav
ffmpeg -v error -y -i audio/source/voiceover.wav -ac 1 -ar 16000 audio/source/voiceover_16k.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 audio/source/voiceover.wav
