#!/usr/bin/env bash
# Final audio mix with FFmpeg:
#   original Malay voice-over (untouched content, never cut or sped up) as the lead,
#   ambient music bed side-chain ducked under the voice, subtle SFX, then two-pass loudness
#   normalisation to -14 LUFS / -1.5 dBTP (social delivery spec).
set -euo pipefail
cd "$(dirname "$0")/.."
DUR=107.5
VO=audio/source/voiceover.wav          # extracted from the supplied MP4 (scripts/extract_audio.sh)
MUSIC=audio/music/bgm_spa_ambient.wav
SFX=audio/mix/sfx_track.wav
PRE=audio/mix/premix.wav
OUT=audio/mix/final_mix.wav

FILTER="[0:a]aresample=48000,apad=whole_dur=${DUR},asplit=2[v][vsc];
[1:a]aresample=48000,highpass=f=80,equalizer=f=2500:t=q:w=1.2:g=-3,volume=0.55[m];
[m][vsc]sidechaincompress=threshold=0.025:ratio=5:attack=60:release=700:knee=4[md];
[2:a]aresample=48000,volume=0.55[s];
[v][md][s]amix=inputs=3:normalize=0:duration=first,atrim=0:${DUR}[out]"

ffmpeg -v error -y -i "$VO" -i "$MUSIC" -i "$SFX" -filter_complex "$FILTER" -map "[out]" -ar 48000 -ac 2 "$PRE"

# two-pass loudnorm
J=$(ffmpeg -hide_banner -i "$PRE" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$PRE" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 "$OUT"
echo "mixed -> $OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:|LRA:)" | tr -s ' '
