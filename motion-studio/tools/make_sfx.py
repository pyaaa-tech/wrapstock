"""
Procedural sound design for "Denyut → Tenang".
Writes public/audio/sfx.mp3 — a quiet layer that sits UNDER the voice-over:
heartbeat thumps in the hook, air on every transition, impacts on the slams,
and a warm pad + chime for the calm act. Deterministic (fixed seed).

    python3 tools/make_sfx.py
"""
import os
import subprocess
import wave
import numpy as np

SR = 44100
DUR = 70.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
mix = np.zeros((N, 2), dtype=np.float64)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i : i + len(sig), 0] += sig * gain * l
    mix[i : i + len(sig), 1] += sig * gain * r


def tt(d):
    return np.arange(int(d * SR)) / SR


def thump(f0=62, f1=38, d=0.34, decay=0.07):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / decay) * np.minimum(1, t / 0.004)


def lowpass(x, cutoff):
    # one-pole, time-varying cutoff (array or scalar)
    a = 1 - np.exp(-2 * np.pi * np.broadcast_to(cutoff, x.shape) / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def whoosh(d=0.5, lo=300, hi=3200):
    t = tt(d)
    env = np.sin(np.pi * t / d) ** 2.2
    sweep = lo + (hi - lo) * (t / d) ** 1.5
    n = rng.normal(0, 1, len(t))
    y = lowpass(n, sweep) - lowpass(n, sweep * 0.25)
    return y * env


def blip(f=660, d=0.09):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.022) * np.minimum(1, t / 0.002)


def chime(freqs, d=2.4, decay=0.7):
    t = tt(d)
    y = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / (decay / (1 + k * 0.5))) / (1 + k) for k, f in enumerate(freqs))
    return y * np.minimum(1, t / 0.003)


def crackle(d=0.3):
    t = tt(d)
    n = rng.normal(0, 1, len(t))
    hold = np.repeat(n[::28], 28)[: len(t)]  # sample-and-hold = digital grit
    gate = (np.sin(2 * np.pi * 31 * t) > -0.2).astype(float)
    return hold * gate * np.exp(-t / 0.12)


def heartbeat(t, gain):
    add(thump(), t, gain)
    add(thump(54, 36, 0.3, 0.06), t + 0.13, gain * 0.55)


# ── Act I · Denyut ─────────────────────────────────────────
for t in (0.0, 0.64, 1.18):
    heartbeat(t, 0.5)
for t in (2.3, 3.05):
    heartbeat(t, 0.16)
add(thump(70, 40, 0.4, 0.09), 5.7, 0.34)  # BILION
for k in range(9):  # dots ripple out
    add(blip(520 + k * 45, 0.06), 6.42 + k * 0.07, 0.035, pan=(k - 4) / 5)

# ── transitions (air) ─────────────────────────────────────
for t, g in ((3.5, 0.11), (8.62, 0.12), (13.6, 0.13), (19.56, 0.12), (27.28, 0.12), (35.78, 0.13), (45.0 - 0.1, 0.12), (56.9, 0.1), (62.18, 0.1), (68.2, 0.09)):
    add(whoosh(), t, g)

# ── Act II · Tabiat ───────────────────────────────────────
add(thump(64, 40, 0.4, 0.09), 10.5, 0.36)  # the "3"
add(crackle(0.34), 17.24, 0.05)  # sleep breaks up
for t in (22.6, 22.7, 22.8):
    add(blip(620), t, 0.07)
for t in (23.3, 23.43):
    add(blip(780), t, 0.07)
for t in (31.56, 31.78):
    add(blip(520, 0.12), t, 0.09)
for k, t in enumerate((33.1, 33.4, 33.7)):
    add(thump(120, 70, 0.2, 0.04), t + 0.1, 0.16, pan=0.3 + k * 0.2)
add(thump(72, 38, 0.45, 0.1), 37.6, 0.42)  # ELAKKAN stamp

# ── Act III · Amaran ──────────────────────────────────────
add(crackle(0.3), 40.74, 0.06)
add(crackle(0.45), 42.5, 0.08)
add(thump(66, 36, 0.5, 0.11), 43.7, 0.36)  # PALING
add(thump(60, 32, 0.6, 0.14), 44.04, 0.55)  # TERUK
add(thump(58, 30, 0.7, 0.16), 47.04, 0.6)  # SEGERA

# ── Act IV · Tenang ───────────────────────────────────────
t = tt(DUR - 50.9)
pad = np.zeros_like(t)
for k, f in enumerate((110.0, 220.0, 277.18, 329.63, 440.0)):
    trem = 1 + 0.18 * np.sin(2 * np.pi * (0.11 + k * 0.03) * t + k)
    pad += np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) * trem / (1 + k * 0.6)
env = np.minimum(1, t / 3.0) * np.minimum(1, (t[-1] - t) / 1.6)
add(pad * env, 50.9, 0.035)
add(chime((880, 1318.5, 1760, 2637)), 57.46, 0.07)  # logo
add(chime((1318.5, 1760)), 58.96, 0.035)  # PM kami
add(blip(880, 0.1), 65.04, 0.05)  # Muslimah
add(chime((880, 1108.7, 1318.5)), 68.5, 0.05)  # end card

peak = np.abs(mix).max()
print(f"peak {20 * np.log10(peak):.1f} dBFS, rms {20 * np.log10(np.sqrt((mix ** 2).mean())):.1f} dBFS")
out = np.clip(mix, -1, 1)
with wave.open("public/audio/sfx.tmp.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/audio/sfx.tmp.wav", "-c:a", "libmp3lame", "-b:a", "160k", "public/audio/sfx.mp3"], check=True)
os.remove("public/audio/sfx.tmp.wav")
print("wrote public/audio/sfx.mp3")
