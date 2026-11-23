#!/usr/bin/env python3
"""
Seri Lestari Spa — audio build.

Produces three stems that index.html places as separate <audio> clips:
  assets/audio/voice.wav   narration, offset by NARRATION_OFFSET, peak-safe
  assets/audio/music.wav   ORIGINAL lo-fi bed synthesised here (no third-party
                           music, so no licensing unknowns), ducked under the voice
  assets/audio/sfx.wav     Pixabay-licensed SFX (assets/audio/sfx/CREDITS.md)
                           placed from scripts/sfx_cues.json

Run:  python3 scripts/build_audio.py
Requires: numpy, scipy, soundfile, ffmpeg on PATH.
"""
import json, subprocess, os, io
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, "assets", "audio", *p)
SR = 44100
FILM = 43.0                 # film length (s) — matches index.html data-duration
NARRATION_OFFSET = 0.20     # narration starts 0.2 s into the film
FPS = 30
N = int(FILM * SR)
rng = np.random.default_rng(7)   # seeded: identical output every build


def load(path):
    """Decode any file to float32 stereo @ SR via ffmpeg."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le",
                          "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, t, gain=1.0, pan=0.0):
    """Add mono/stereo sig into stereo buf at time t (s)."""
    i = int(round(t * SR))
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i] * gain


# ───────────────────────── MUSIC ─────────────────────────
BPM = 96
BEAT = 60 / BPM            # 0.625 s
BAR = BEAT * 4             # 2.5 s  → bar 14 starts at 35.0 s = CTA scene
SWING = 0.06 * BEAT

# Fmaj9 → Em9 → Dm9 → Cmaj9, warm descending loop (one chord per bar)
CHORDS = [
    [53, 57, 60, 64, 67],
    [52, 55, 59, 62, 66],
    [50, 53, 57, 60, 64],
    [48, 52, 55, 59, 62],
]
BASS = [41, 40, 38, 36]


def ep_note(f, dur, vel=1.0):
    """Electric-piano-ish tone: FM bell attack over a soft sine body."""
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    idx = 1.4 * np.exp(-t * 5.0) + 0.15
    mod = np.sin(2 * np.pi * f * t) * idx
    body = np.sin(2 * np.pi * f * t + mod)
    body += 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    env = np.minimum(1, t / 0.006) * (0.65 * np.exp(-t * 1.1) + 0.35 * np.exp(-t * 0.35))
    rel = np.clip(1 - (t - dur) / 0.35, 0, 1)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 4.6 * t)
    return body * env * rel * trem * vel


def marimba(f, vel=1.0):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 7)
    s += 0.35 * np.sin(2 * np.pi * 3.98 * f * t) * np.exp(-t * 24)
    s += 0.08 * np.sin(2 * np.pi * 9.1 * f * t) * np.exp(-t * 60)
    return s * np.minimum(1, t / 0.002) * vel


def kick(vel=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s += 0.35 * np.sin(2 * ph) * np.exp(-t * 14)        # 2nd harmonic: audible on phones
    s += 0.25 * rng.standard_normal(n) * np.exp(-t * 300)
    return np.tanh(s * 1.4) * vel


def snare(vel=1.0):
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 6500) * np.exp(-t * 16)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 26)
    return (nz * 0.9 + body * 0.5) * vel


def hat(vel=1.0, open_=False):
    n = int((0.35 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    nz = hp(rng.standard_normal(n), 7000, 4)
    return nz * np.exp(-t * (9 if open_ else 55)) * vel


def build_music():
    ep = np.zeros((N, 2)); bass = np.zeros((N, 2)); drums = np.zeros((N, 2))
    mel = np.zeros((N, 2)); pad = np.zeros((N, 2))
    bars = int(np.ceil(FILM / BAR))
    for b in range(bars):
        t0 = b * BAR
        ch = CHORDS[b % 4]
        last = b >= 16                       # bar 16 (40 s): final ringing chord
        if last:
            ch = CHORDS[0] + [72]
        # EP comping: long chord on 1, short push on the "and" of 2
        hits = [(0.0, BEAT * 1.4, 1.0)] if last else [(0.0, BEAT * 1.3, 1.0), (1.5 * BEAT, BEAT * 0.9, 0.7)]
        for (o, d, v) in hits:
            for k, m in enumerate(ch):
                vel = v * (0.85 + 0.15 * rng.random()) * 0.22
                place(ep, ep_note(midi(m), d if not last else 2.6, vel), t0 + o + k * 0.012,
                      pan=(k / (len(ch) - 1) - 0.5) * 0.6)
        # soft pad an octave up, very quiet, for air
        n = int(BAR * SR); t = np.arange(n) / SR
        p = sum(np.sin(2 * np.pi * midi(m + 12) * t + k) for k, m in enumerate(ch[1:4]))
        penv = np.minimum(1, t / 0.6) * np.minimum(1, (BAR - t) / 0.6)
        place(pad, p * penv * 0.025, t0)
        if last:
            place(bass, ep_note(midi(BASS[0]), 2.2, 0.55), t0)
            place(drums, kick(0.8), t0)
            break
        # bass: root on 1, fifth on the "and" of 2, root on 3+
        r = BASS[b % 4]
        for (o, m, d) in [(0, r, 1.2), (1.5, r + 7, 0.45), (2.5, r, 1.0)]:
            nn = int((d * BEAT + 0.2) * SR); tt = np.arange(nn) / SR
            f = midi(m)
            s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
            s *= np.minimum(1, tt / 0.01) * np.exp(-tt * 1.6) * np.clip((d * BEAT + 0.2 - tt) / 0.08, 0, 1)
            place(bass, np.tanh(s * 1.2) * 0.32, t0 + o * BEAT)
        # drums (lo-fi, swung 8ths)
        cta = b >= 14
        for o in (0.0, 1.5, 2.5):
            place(drums, kick(0.9 if o == 0 else 0.6), t0 + o * BEAT)
        for o in (1.0, 3.0):
            place(drums, snare(0.32 if not cta else 0.42), t0 + o * BEAT + 0.008)
        for e in range(8):
            o = e * 0.5 * BEAT + (SWING if e % 2 else 0)
            v = (0.10 if e % 2 == 0 else 0.065)
            place(drums, hat(v, open_=(cta and e % 2 == 1)), t0 + o, pan=0.25)
        # playful marimba motif: the hook (bars 0-1), a lift (8-9) and the CTA (14-15)
        motif = [(0, 81), (0.5, 84), (0.75, 81), (1.0, 79), (1.5, 77), (2.5, 74), (2.75, 77), (3.25, 79)]
        motif2 = [(0, 84), (0.5, 81), (1.0, 79), (1.75, 81), (2.0, 84), (2.5, 86), (3.0, 84)]
        if b in (0, 8, 14):
            for (o, m) in motif:
                place(mel, marimba(midi(m), 0.12), t0 + o * BEAT, pan=-0.2)
        if b in (1, 9, 15):
            for (o, m) in motif2:
                place(mel, marimba(midi(m), 0.11), t0 + o * BEAT, pan=0.2)
    # riser into the CTA (bar 14 @ 35.0 s): filtered noise swell, once in the film
    rn = int(1.6 * SR); rt = np.arange(rn) / SR
    riser = bp(rng.standard_normal(rn), 1500, 9000) * (rt / 1.6) ** 2.5 * 0.10
    place(drums, riser, 35.0 - 1.6)

    # bus processing: EP + marimba + pad through a small room
    ir_n = int(1.9 * SR); it = np.arange(ir_n) / SR
    ir = rng.standard_normal((ir_n, 2)) * np.exp(-it * 3.2)[:, None]
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    wet_src = ep + mel * 1.2 + pad + drums * 0.15
    wet = np.stack([fftconvolve(wet_src[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
    mix = ep + mel + pad + bass + drums + wet * 0.55
    mix = lp(mix, 9500)                 # lo-fi warmth
    mix = hp(mix, 35)
    # end fade under the end card
    t = np.arange(N) / SR
    mix *= np.clip((FILM - t) / 2.2, 0, 1)[:, None]
    mix = np.tanh(mix * 1.1)
    mix /= np.max(np.abs(mix)) + 1e-9
    return mix * 0.7


# ───────────────────────── VOICE + DUCK ─────────────────────────
def build_voice():
    v = load(A("narration.mp3"))
    out = np.zeros((N, 2))
    place(out, v, NARRATION_OFFSET)
    return out


def duck_curve(voice, depth_db=-7.0):
    """Sidechain-style gain curve for the music, keyed by the narration."""
    mono = np.abs(voice).mean(axis=1)
    win = int(0.03 * SR)
    env = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode="same"))
    on = (env > 0.01).astype(float)
    # attack 60 ms, release 450 ms (one-pole), computed on a 100 Hz grid then upsampled
    step = SR // 100
    g = on[::step]
    sm = np.zeros_like(g); a_up, a_dn = np.exp(-1 / 6), np.exp(-1 / 45)
    for i in range(1, len(g)):
        a = a_up if g[i] > sm[i - 1] else a_dn
        sm[i] = a * sm[i - 1] + (1 - a) * g[i]
    sm = np.repeat(sm, step)[:N]
    sm = np.pad(sm, (0, N - len(sm)), mode="edge")
    return 10 ** (depth_db * sm / 20)


# ───────────────────────── SFX ─────────────────────────
SFX_PEAK = {"pop": 0.120, "sparkle": 0.027, "whoosh": 0.162, "click": 0.073}


def build_sfx():
    cues = json.load(open(os.path.join(ROOT, "scripts", "sfx_cues.json")))["cues"]
    src = {k: load(A("sfx", f"{k}.mp3")) for k in SFX_PEAK}
    out = np.zeros((N, 2))
    for c in cues:
        s = src[c["sfx"]]
        rate = c.get("rate", 1.0)      # varied takes: resample to change pitch a touch
        if rate != 1.0:
            idx = np.arange(0, len(s) - 1, rate)
            s = np.stack([np.interp(idx, np.arange(len(s)), s[:, ch]) for ch in range(2)], axis=1)
        # the hit peaks one frame after its picture (light before sound)
        t = c["t"] + 1 / FPS - SFX_PEAK[c["sfx"]] / rate
        place(out, s, t, gain=c.get("gain", 0.5))
    return out


def lufs(x):
    buf = io.BytesIO(); sf.write(buf, x.astype(np.float32), SR, format="WAV"); buf.seek(0)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "pipe:0", "-af", "ebur128=peak=true",
                        "-f", "null", "-"], input=buf.read(), capture_output=True)
    txt = r.stderr.decode()
    i = txt.rfind("I:")
    return float(txt[i + 2:].split("LUFS")[0])


def ffilter(x, af):
    """Run a stereo float buffer through an ffmpeg audio filter."""
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "pipe:0",
                        "-af", af, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    y = np.frombuffer(r, dtype=np.float32).reshape(-1, 2).copy()
    out = np.zeros_like(x); out[: min(len(x), len(y))] = y[: len(x)]
    return out


def write(name, x):
    sf.write(A(name), x.astype(np.float32), SR, subtype="PCM_24")


if __name__ == "__main__":
    voice = build_voice()
    music = build_music() * duck_curve(voice)[:, None]
    sfx = build_sfx()

    # Gain staging: voice ≈ -15 LUFS (peak-limited at -3 dBFS), music bed ~16 dB under it,
    # SFX as accents a few dB over the bed.
    gv = 10 ** ((-14.6 - lufs(voice)) / 20)
    voice = ffilter(voice * gv, "alimiter=limit=0.70:attack=4:release=80:level=disabled")
    gm = 10 ** ((-31.0 - lufs(music)) / 20)
    music = music * gm
    full = voice + music + sfx
    pk = np.max(np.abs(full))
    if pk > 0.89:                       # keep true peak ≤ about -1.5 dBTP
        s = 0.89 / pk
        voice, music, sfx, full = voice * s, music * s, sfx * s, full * s
    write("voice.wav", voice); write("music.wav", music); write("sfx.wav", sfx)
    write("reference_mix.wav", full)
    print(f"voice {lufs(voice):.1f} LUFS | music {lufs(music):.1f} | sfx {lufs(sfx):.1f} | "
          f"mix {lufs(full):.1f} LUFS, sample peak {20*np.log10(np.max(np.abs(full))):.1f} dBFS")
