"""Place the synthesised SFX at the cue times exported from the animation timeline
(project/sfx_cues.json, written by scripts/check_page.cjs) -> audio/mix/sfx_track.wav"""
import json, os
import numpy as np
from scipy.io import wavfile
SR, DUR = 48000, 107.5
BASE = {"whoosh": 0.55, "whoosh_soft": 0.5, "pop": 0.45, "tick": 0.4, "chime": 0.45, "sparkle": 0.4, "impact": 0.7, "riser": 0.4}
cues = json.load(open("project/sfx_cues.json"))
out = np.zeros((int(DUR * SR), 2))
cache = {}
for c in cues:
    k = c["type"]
    if k not in cache:
        sr, x = wavfile.read(f"audio/sfx/{k}.wav"); assert sr == SR
        cache[k] = x.astype(np.float32) / 32768.0
    x = cache[k] * BASE[k] * c["gain"]
    a = int(c["t"] * SR)
    if a >= len(out): continue
    n = min(len(x), len(out) - a)
    out[a:a + n] += x[:n]
os.makedirs("audio/mix", exist_ok=True)
peak = np.abs(out).max()
if peak > 0.95: out *= 0.95 / peak
wavfile.write("audio/mix/sfx_track.wav", SR, (out * 32767).astype(np.int16))
print(f"{len(cues)} cues placed, peak {peak:.2f}")
