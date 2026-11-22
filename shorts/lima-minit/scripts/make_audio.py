"""
Builds the final soundtrack: voiceover + original music bed + sound effects.

Everything here is synthesised from scratch (no samples), so there is nothing to license.
SFX are placed on the same frames as their visual events (same word onsets as src/cues.ts),
the 100 BPM music bed follows the story (cut by the alarm, muffled while groggy, bright at sunrise),
and music / SFX tails fade out as the brand outro lands; the outro's only sound is the bubble "blup".

Usage:
  python scripts/make_audio.py                 # writes public/audio/mix.wav (+ stems in out/)
  python scripts/make_audio.py --music my.mp3  # use your own music track instead of the synth bed

Requires numpy, scipy, pyloudnorm and ffmpeg on PATH.
"""
import argparse, json, math, os, re, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
SR = 48000
DUR = 1326 / 30  # main programme (voice + music + SFX); everything before the outro (44.2 s)
N = int(SR * DUR)
FPS = 30
OUTRO_LAND = 1326  # frame the brand outro lands and the logo pops (44.2 s)
TOTAL_FRAMES = 1360  # must match DURATION in src/theme.ts (44.2 s + outro)
NT = int(round(SR * TOTAL_FRAMES / FPS))
OUTRO_FADE = 0.12  # music / SFX tails fade out over this long once the outro lands
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(20131)

# ----------------------------------------------------------------------------- cues
words = json.load(open(os.path.join(ROOT, "data/aligned.json")))
_seen, KEY = {}, {}
for w in words:
    b = re.sub(r"[^a-z]", "", w["w"].lower())
    _seen[b] = _seen.get(b, 0) + 1
    KEY[b if _seen[b] == 1 else f"{b}{_seen[b]}"] = w


def F(k):  # onset frame, same rule as src/lib/time.ts
    return math.floor(KEY[k]["s"] * FPS)


def T(frame):
    return frame / FPS


# ----------------------------------------------------------------------------- dsp helpers
def ar(n):
    return np.arange(n) / SR


def sos(kind, f, order=2):
    return butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return sosfilt(sos(kind, f, order), x)


def noise(n):
    return rng.standard_normal(n)


def env_exp(n, decay, attack=0.002):
    t = ar(n)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def pan_gains(p):
    p = np.clip(p, -1, 1)
    return np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)


def place(buf, sig, t0, gain=1.0, pan=0.0):
    """Add a mono (or stereo) signal at time t0 (s). Wraps past the end for a seamless loop."""
    if sig.ndim == 1:
        l, r = pan_gains(pan)
        sig = np.vstack([sig * l, sig * r])
    sig = sig * gain
    start = int(round(t0 * SR))
    if start < 0:  # pre-roll cues (e.g. the clock tick at -0.5 s) keep their place at the end of the programme
        start += N
    end = min(buf.shape[1], start + sig.shape[1])
    if end > start:
        buf[:, start:end] += sig[:, : end - start]


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ----------------------------------------------------------------------------- SFX synthesis
BANDS = np.geomspace(150, 12000, 26)
_band_sos = [butter(2, [fc / 1.18, min(fc * 1.18, SR / 2 - 100)], btype="band", fs=SR, output="sos") for fc in BANDS]


def swept_noise(dur, fc_curve, width=0.35, amp_curve=None):
    """Noise through a moving resonance (fc_curve: array of centre freqs per sample)."""
    n = int(dur * SR)
    x = noise(n)
    out = np.zeros(n)
    lf = np.log(fc_curve)
    for fc, s in zip(BANDS, _band_sos):
        g = np.exp(-(((np.log(fc) - lf) / width) ** 2))
        if g.max() < 1e-3:
            continue
        out += sosfilt(s, x) * g
    if amp_curve is not None:
        out *= amp_curve
    return out / (np.abs(out).max() + 1e-9)


def whoosh(dur=0.5, peak=0.58, f_lo=300, f_hi=3200, direction=1):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    bell = np.where(u < peak, (u / peak) ** 2.2, ((1 - u) / (1 - peak)) ** 1.6)
    fc = f_lo * (f_hi / f_lo) ** bell
    body = swept_noise(dur, fc, 0.45, bell)
    sub = np.sin(2 * np.pi * np.cumsum(70 + 90 * bell) / SR) * bell * 0.35
    sig = body + sub
    p = direction * np.linspace(0.85, -0.85, n)  # direction 1: right -> left
    l, r = pan_gains(p)
    return np.vstack([sig * l, sig * r])


def zoom_whoosh(dur=0.42):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    amp = u ** 2.6 * (1 - np.clip((u - 0.92) / 0.08, 0, 1))
    fc = 250 * (5200 / 250) ** (u ** 1.4)
    sig = swept_noise(dur, fc, 0.4, amp)
    tone = np.sin(2 * np.pi * np.cumsum(120 * (8 ** u)) / SR) * amp * 0.25
    return sig + tone


def pop(f0=520, dur=0.11, up=1.9):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 + (up - 1) * (1 - np.exp(-t / 0.018)))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.035, 0.001)
    click = filt(noise(n), "high", 2500) * env_exp(n, 0.003, 0.0005) * 0.25
    return s + click


def boing(f0=180, dur=0.32):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 + 1.6 * (1 - np.exp(-t / 0.05))) * (1 + 0.06 * np.sin(2 * np.pi * 22 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.11, 0.002)


def impact(weight=1.0, dur=0.6):
    n = int(dur * SR)
    t = ar(n)
    f = 45 + 130 * np.exp(-t / (0.04 * weight))
    kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.16 * weight, 0.001)
    thud = filt(noise(n), "low", 900) * env_exp(n, 0.05, 0.001) * 0.7
    crack = filt(noise(n), "high", 3000) * env_exp(n, 0.012, 0.0005) * 0.22
    pre = np.zeros(n)
    return soft_clip(kick * 1.2 + thud + crack + pre, 1.5)


def slam(weight=1.0):
    """Short swish into an impact; the impact lands 0.1 s into the sample."""
    lead = int(0.1 * SR)
    sw = whoosh(0.16, 0.95, 600, 4500, 0).mean(axis=0)[:lead] * 0.35
    im = impact(weight)
    out = np.zeros(lead + len(im))
    out[: len(sw)] += sw
    out[lead:] += im
    return out


def crash(dur=1.3):
    n = int(dur * SR)
    x = filt(noise(n), "high", 3500) * env_exp(n, 0.45, 0.001)
    t = ar(n)
    metal = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(3150, 0.2), (4870, 0.15), (6310, 0.1)]) * env_exp(n, 0.3)
    return x + metal


def tick(f0=3200, dur=0.03):
    n = int(dur * SR)
    t = ar(n)
    return (np.sin(2 * np.pi * f0 * t) * 0.6 + filt(noise(n), "band", [f0 * 0.7, f0 * 1.4]) * 0.6) * env_exp(n, 0.006, 0.0005)


def bell_ring(dur=0.8):
    n = int(dur * SR)
    t = ar(n)
    trem = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * t))
    tone = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1870, 1), (2630, 0.6), (4120, 0.3)])
    return tone * trem * env_exp(n, 0.35, 0.003) * (1 - t / dur)


def chime(notes=(84, 88, 91, 96), gap=0.045, dur=0.9):
    out = np.zeros(int((dur + gap * len(notes)) * SR))
    for i, m in enumerate(notes):
        n = int(dur * SR)
        t = ar(n)
        f = midi(m)
        s = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.1)) * env_exp(n, 0.28, 0.001)
        st = int(i * gap * SR)
        out[st : st + n] += s
    return out / len(notes) * 1.6


def ting(f0=2093, dur=0.6):
    n = int(dur * SR)
    t = ar(n)
    return (np.sin(2 * np.pi * f0 * t) + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / 0.08)) * env_exp(n, 0.22, 0.001)


def womp(dur=0.55):
    n = int(dur * SR)
    t = ar(n)
    f = 420 * (110 / 420) ** (t / dur) * (1 + 0.03 * np.sin(2 * np.pi * 7 * t))
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    return filt(saw, "low", 1400) * np.clip(t / 0.01, 0, 1) * (1 - t / dur) ** 0.6


def zip_(dur=0.18, f_lo=800, f_hi=6000):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    return swept_noise(dur, f_lo * (f_hi / f_lo) ** u, 0.3, np.sin(np.pi * u) ** 0.8)


def swish(dur=0.2):
    return whoosh(dur, 0.45, 900, 6000, 0).mean(axis=0)


def poof(dur=0.35):
    n = int(dur * SR)
    return filt(noise(n), "low", 1600) * env_exp(n, 0.09, 0.015)


def thwap(dur=0.12):
    n = int(dur * SR)
    return filt(noise(n), "band", [400, 3500]) * env_exp(n, 0.025, 0.0008) + impact(0.5, dur) * 0.4


def fwump(dur=0.4):
    n = int(dur * SR)
    t = ar(n)
    return filt(noise(n), "low", 500) * env_exp(n, 0.08, 0.01) + np.sin(2 * np.pi * 70 * t) * env_exp(n, 0.1, 0.005) * 0.6


def thump(f0=95, dur=0.35):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 + 0.8 * np.exp(-t / 0.03))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.1, 0.002)


def rumble(dur=0.7):
    n = int(dur * SR)
    t = ar(n)
    return filt(noise(n), "low", 260) * np.sin(np.pi * t / dur) * (1 + 0.4 * np.sin(2 * np.pi * 11 * t))


def riser(dur=1.4):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    fc = 300 * (6000 / 300) ** u
    nz = swept_noise(dur, fc, 0.5, u ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(110 * 4 ** u) / SR) * u ** 2 * 0.4
    return nz + tone


def hiss(dur=0.5):
    n = int(dur * SR)
    return filt(noise(n), "high", 4000) * env_exp(n, 0.15, 0.02)


def drop_whistle(dur=0.22):
    n = int(dur * SR)
    t = ar(n)
    f = 2400 * (700 / 2400) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(t / 0.02, 0, 1) * 0.6


def plink(m=72, dur=0.25):
    n = int(dur * SR)
    t = ar(n)
    f = midi(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * env_exp(n, 0.05, 0.001)


def key_click():
    n = int(0.025 * SR)
    return filt(noise(n), "band", [1500, 6000]) * env_exp(n, 0.004, 0.0004)


def party_popper(dur=0.9):
    n = int(dur * SR)
    out = impact(0.3, dur) * 0.4 + filt(noise(n), "high", 1500) * env_exp(n, 0.02, 0.0005)
    for _ in range(40):
        st = int(rng.uniform(0.03, 0.75) * SR)
        c = key_click() * rng.uniform(0.15, 0.5) * (1 - st / n)
        out[st : st + len(c)] += c[: n - st]
    return out


def clack():
    n = int(0.09 * SR)
    t = ar(n)
    return filt(noise(n), "band", [700, 4000]) * env_exp(n, 0.01, 0.0005) + np.sin(2 * np.pi * 320 * t) * env_exp(n, 0.02) * 0.5


BLUP_PEAK_DB = -7.0


def blup():
    """Soft water-bubble: sine-like tone gliding ~260 -> 880 Hz in ~0.1 s, fast decay (~0.3 s total),
    then a tiny softer second blip ~0.12 s after the first."""

    def bubble(f0, f1, glide, dur, decay):
        n = int(dur * SR)
        t = ar(n)
        f = f0 * (f1 / f0) ** np.clip(t / glide, 0, 1)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + 0.1 * np.sin(2 * ph)
        env = np.clip(t / 0.004, 0, 1) * np.exp(-np.maximum(0, t - 0.06) / decay) * np.clip((dur - t) / 0.02, 0, 1)
        return s * env

    first = bubble(260, 880, 0.10, 0.30, 0.055)
    second = bubble(430, 1150, 0.05, 0.14, 0.03) * 0.42
    out = np.zeros(int(0.42 * SR))
    out[: len(first)] += first
    st = int(0.12 * SR)
    out[st : st + len(second)] += second
    return out


# ----------------------------------------------------------------------------- SFX timeline
def alarm_ring(dur):
    """Sustained 'ring-ring' alarm (bursts with small gaps so the voice stays clear)."""
    n = int(dur * SR)
    t = ar(n)
    tone = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1870, 1), (2630, 0.55), (4120, 0.25)])
    trem = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 19 * t))
    burst = ((t % 0.42) < 0.3).astype(float)
    burst = np.convolve(burst, np.ones(240) / 240, mode="same")
    return tone * trem * burst * np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.02, 0, 1)


def buzz(dur=0.35):
    """Failed power-on 'bzzt'."""
    n = int(dur * SR)
    t = ar(n)
    sq = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 220.7 * t)) * 0.3
    gate = (np.sin(2 * np.pi * 14 * t) > -0.2).astype(float)
    return filt(sq * gate, "low", 2400) * env_exp(n, 0.2, 0.004)


def power_up(dur=0.8):
    n = int(dur * SR)
    t = ar(n)
    f = 220 * (4 ** (t / dur))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * (t / dur) ** 1.5 * 0.7


def build_sfx(outro_whoosh=True):
    buf = np.zeros((2, NT))
    P = lambda sig, fr, g, pan=0.0, offs=0.0: place(buf, sig, T(fr) + offs, g, pan)

    # whip-pans: whoosh centred on the whip's fastest frame (start - 4.5), panned with the motion.
    for start, d in [(F("sebenarnya"), -1), (F("lagi3"), 1), (F("mungkin"), -1), (F("lepas2"), 1), (F("dapat"), -1)]:
        w = whoosh(0.5, 0.58, 300, 3200, d)
        fade = np.clip((0.5 - ar(w.shape[1])) / 0.12, 0, 1)
        place(buf, w * fade, T(start - 4.5) - 0.29, 0.38)
    # whip into the brand outro: same whoosh as the first video (its tail is faded as the outro lands).
    # Generated without advancing the shared RNG, so every other sound stays byte-identical.
    if outro_whoosh:
        st = rng.bit_generator.state
        w = whoosh(0.5, 0.58, 300, 3200, 1)
        rng.bit_generator.state = st
        fade = np.clip((0.5 - ar(w.shape[1])) / 0.12, 0, 1)
        place(buf, w * fade, T(OUTRO_LAND - 4.5) - 0.29, 0.4)
    # scale-through zooms
    for start in [F("menariknya"), F("tapi")]:
        place(buf, zoom_whoosh(0.42), T(start) - 0.40, 0.36)
        P(thump(80, 0.4), start, 0.3)
    # match cut
    P(swish(0.22), F("orang") - 2, 0.2, 0.2)

    # keyword pops (one per word)
    pops = [
        ("lima", 560), ("lagi", 620), ("bunyi", 640), ("otak", 520), ("belum", 580), ("betulbetul", 640),
        ("inertia", 620), ("mamai", 560), ("lagi3", 520), ("mamai2", 540), ("hilang", 620), ("kajian", 560),
        ("snooze", 600), ("tak", 560), ("merosakkan", 660), ("kurang", 540), ("terbangun2", 620), ("dari", 560),
        ("nyenyak2", 660), ("kajian2", 540), ("je2", 600), ("buka", 560), ("cahaya", 640), ("dapat", 600), ("sila", 680),
    ]
    whisper = (F("sebenarnya"), F("orang"))
    for k, f0 in pops:
        g = 0.06 if whisper[0] <= F(k) < whisper[1] else 0.13  # softer under the whispered line
        P(pop(f0), F(k), g, rng.uniform(-0.25, 0.25))

    # --- scene 1: dream bubble + gift
    P(pop(420, 0.14, 1.5), F("lima") + 1, 0.12, 0.4)
    place(buf, slam(0.6), T(F("hadiah")) - 0.1, 0.18)
    P(chime((84, 88, 91, 96), 0.04), F("hadiah") + 1, 0.16, 0.4)
    # --- scene 2: alarm (smash cut), snooze slap
    place(buf, slam(1.0), T(F("alarm")) - 0.1, 0.28)
    ring = alarm_ring(T(F("cakap")) - T(F("alarm")))
    P(ring, F("alarm"), 0.042, 0.45)
    P(impact(0.8), F("cakap"), 0.3, 0.4)
    P(clack(), F("cakap"), 0.45, 0.45)
    place(buf, slam(1.1), T(F("cakap")) - 0.1, 0.16)
    P(pop(380, 0.16, 1.3), F("lima2"), 0.12, -0.4)  # sleepy speech bubble
    # --- scene 3: whisper, failing power button (kept quiet)
    P(pop(480), F("otak") - 2, 0.05, -0.3)
    P(buzz(0.4), F("on"), 0.14, 0.3)
    # --- scene 3b: sleep inertia
    place(buf, slam(1.0), T(F("sleep")) - 0.1, 0.24)
    P(chime((91, 95, 98, 103), 0.06, 1.2), F("orang") + 4, 0.08, 0.2)
    P(womp(0.6), F("mamai"), 0.12, 0.0)
    P(poof(0.5), F("mamai") - 2, 0.16)
    # --- scene 4: chart, alarm in deep sleep, 30-minute dial
    P(zip_(1.1, 400, 2500), F("lagi3"), 0.06)
    place(buf, slam(0.9), T(F("teruk")) - 0.1, 0.22)
    P(alarm_ring(0.55), F("terbangun"), 0.08, -0.2)
    P(impact(0.8), F("terbangun"), 0.26)
    P(pop(900, 0.12, 1.5), F("terbangun") + 2, 0.14)
    P(thump(110, 0.3), F("nyenyak"), 0.2, -0.3)
    P(swish(0.25), F("mamai2") - 4, 0.16, -0.6)
    for fr in range(F("hilang"), F("lama") + 10, 4):
        P(tick(2900 if (fr // 4) % 2 else 2300), fr, 0.07, -0.3)
    P(poof(0.6), F("dalam"), 0.1, 0.4)
    place(buf, slam(0.7), T(F("setengah")) - 0.1, 0.18)
    P(pop(820, 0.12, 1.5), F("kadangkadang") + 6, 0.12, 0.2)
    # --- scene 5: excited study
    P(boing(220), F("menariknya"), 0.16)
    P(chime((84, 88, 91, 96, 100), 0.035), F("menariknya") + 2, 0.12, -0.3)
    P(pop(420, 0.16, 0.6), F("kecil"), 0.14, 0.4)  # clipboard shrinks
    P(pop(700), F("sweden"), 0.14, 0.4)
    P(thump(140, 0.25), F("sweden") + 3, 0.16, 0.4)
    P(swish(0.22), F("snooze") - 4, 0.14)
    P(clack(), F("sekejap") + 2, 0.4, 0.4)
    P(zip_(0.3, 700, 5000), F("merosakkan"), 0.12, 0.3)
    P(ting(2350), F("merosakkan") + 8, 0.16, 0.3)
    # --- scene 5b: snooze chart
    P(zip_(0.5, 500, 3500), F("kurang") - 4, 0.07)
    P(alarm_ring(0.35), F("terbangun2"), 0.05, 0.5)
    P(zip_(0.15, 900, 6000), F("nyenyak2"), 0.12, -0.3)
    P(zip_(0.15, 900, 6000), F("nyenyak2") + 3, 0.12, -0.2)
    # --- scene 6: tiny study, stamp
    for i in range(3):
        P(pop(900 + 150 * i, 0.08, 1.4), F("tapi") + 5 * i, 0.07, -0.2)
    P(pop(500), F("kajian2"), 0.12, 0.4)
    P(pop(420, 0.16, 0.55), F("kecil2"), 0.15, 0.4)
    place(buf, swish(0.16), T(F("muktamad")) - 0.12, 0.18)
    P(impact(1.2), F("muktamad"), 0.32)
    P(thwap(), F("muktamad"), 0.3)
    # --- scene 7: curtains, sunrise, brain powers on
    P(swish(0.2), F("buka") - 2, 0.14, -0.3)
    w = whoosh(0.55, 0.45, 400, 4500, 1)
    place(buf, np.vstack([w.mean(axis=0) * 0.8, w.mean(axis=0) * 0.8]), T(F("langsir")) - 0.18, 0.34)
    place(buf, slam(0.6), T(F("langsir")) - 0.1, 0.12)
    place(buf, riser(1.0) * np.linspace(1, 0.4, int(1.0 * SR)), T(F("langsir")), 0.06, 0.3)
    P(chime((77, 81, 84, 89, 93, 96), 0.07, 1.4), F("langsir") + 3, 0.14, 0.3)
    P(pop(520), F("bantu") - 2, 0.1, 0.2)
    place(buf, power_up(0.8), T(F("sedar")) - 0.8, 0.1, 0.2)
    P(ting(2637), F("sedar"), 0.2, 0.3)
    P(chime((84, 88, 91, 96, 100, 103), 0.03), F("sedar") + 1, 0.12, 0.3)
    P(boing(240), F("sedar"), 0.12, -0.3)
    # --- scene 8: comments
    for k, f0, pn in [("dapat", 600, -0.5), ("catch", 720, 0.5), ("sila", 820, -0.5), ("komen", 960, 0.5)]:
        P(pop(f0), F(k), 0.18, pn)
    P(boing(230), F("sila"), 0.1)
    return buf


# ----------------------------------------------------------------------------- music (original)
def pluck(f, dur, bright=1.0, decay=0.35):
    n = int(dur * SR)
    t = ar(n)
    s = np.zeros(n)
    for k in range(1, 9):
        a = (1 / k ** 1.3) * (bright if k > 2 else 1)
        s += a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1 / decay) * (1 + 0.55 * (k - 1)))
    return s * np.clip(t / 0.003, 0, 1)


def marimba(f, dur=0.5):
    n = int(dur * SR)
    t = ar(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
    s += 0.08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.015)
    return s * np.clip(t / 0.002, 0, 1)


def glock(f, dur=1.2):
    n = int(dur * SR)
    t = ar(n)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.5), (2.76, 0.4, 0.15), (5.4, 0.2, 0.06)])
    return s * np.clip(t / 0.001, 0, 1)


def bass_note(f, dur):
    n = int(dur * SR)
    t = ar(n)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.clip(t / 0.006, 0, 1) * np.exp(-t / 0.32) * np.clip((dur - t) / 0.02, 0, 1)
    return soft_clip(s * e, 1.4)


def kick():
    n = int(0.35 * SR)
    t = ar(n)
    f = 48 + 110 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.13, 0.001)


def snare():
    n = int(0.22 * SR)
    t = ar(n)
    return filt(noise(n), "band", [1200, 7000]) * env_exp(n, 0.06, 0.001) * 0.8 + np.sin(2 * np.pi * 190 * t) * env_exp(n, 0.04) * 0.5


def clap():
    n = int(0.25 * SR)
    x = filt(noise(n), "band", [900, 3500])
    e = np.zeros(n)
    for d in (0, 0.009, 0.018):
        st = int(d * SR)
        e[st:] += np.exp(-ar(n - st) / 0.006)
    e += np.exp(-ar(n) / 0.07) * 0.5
    return x * e * 0.7


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return filt(noise(n), "high", 7500) * env_exp(n, 0.09 if open_ else 0.018, 0.0005)


def shaker():
    n = int(0.08 * SR)
    t = ar(n)
    return filt(noise(n), "band", [5000, 11000]) * np.sin(np.pi * t / 0.08) ** 2


def woodblock(hi=True):
    n = int(0.08 * SR)
    t = ar(n)
    f = 1050 if hi else 780
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.3 * t)) * env_exp(n, 0.02, 0.0005)


def tom(f0=140):
    n = int(0.35 * SR)
    t = ar(n)
    f = f0 * (1 + 0.5 * np.exp(-t / 0.05))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.16, 0.001)


# chords as MIDI notes; bass root
def pad(freqs, dur, vib=0.0, bright=1600):
    n = int(dur * SR)
    t = ar(n)
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.0045):
            ff = f * (1 + det) * (1 + vib * np.sin(2 * np.pi * 4.2 * t + f))
            ph = np.cumsum(ff) / SR
            s += 2 * (ph % 1) - 1
    s = filt(s, "low", bright)
    env = np.clip(t / 0.35, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return s * env / (3 * len(freqs))


# F major, warm and sleepy. Chords as MIDI notes + bass root.
CH = {
    "F": ([57, 60, 65], 41), "Dm": ([57, 62, 65], 38), "Bb": ([58, 62, 65], 46), "C": ([55, 60, 64], 36),
}
PROG = ["F", "Dm", "Bb", "C"]


def section_at(t):
    """Music follows the story (times are voice onsets, seconds)."""
    w = lambda k: KEY[k]["s"]
    if t < w("alarm"):
        return "dream"
    if t < w("lima2"):
        return None  # alarm scene: music cut
    if t < w("sebenarnya"):
        return "dream"
    if t < w("orang"):
        return "groggy"
    if t < w("lagi3"):
        return "woozy"
    if t < w("menariknya"):
        return "calm"
    if t < w("tapi"):
        return "upbeat"
    if t < w("muktamad"):
        return "thoughtful"
    if t < w("lepas2"):
        return None  # stamp: stop
    if t < w("langsir"):
        return "build"
    return "sunny"


def build_music():
    mus = {k: np.zeros((2, NT)) for k in ("drums", "bass", "chords", "keys")}
    end = DUR

    def add(stem, sig, t, g, pan=0.0):
        if t >= end:
            return
        place(mus[stem], sig, t, g, pan)

    K, S_, CL, HC, SH = kick(), snare(), clap(), hat(), shaker()
    nbeats = int(np.ceil(end / BEAT)) + 1
    for i in range(nbeats):
        tb = i * BEAT
        sec = section_at(tb)
        bar, beat = divmod(i, 4)
        chord, root = CH[PROG[bar % 4]]
        rootf = midi(root)
        if sec is None:
            continue
        if sec in ("dream",):
            soft = 0.5 if tb >= KEY["alarm"]["s"] else 1.0  # dozing back off under "Lima minit je lagi"
            if beat == 0:
                add("chords", pad([midi(m) for m in chord], BAR + 0.3, 0.0, 1300), tb, 0.5 * soft, 0.0)
            for e in range(2):  # music-box 8ths
                m = (chord + [chord[0] + 12])[(i * 2 + e) % 4] + 24
                add("keys", glock(midi(m), 0.9), tb + e * BEAT / 2, 0.05 * soft, 0.3 * math.sin(i + e))
        elif sec == "groggy":
            if beat == 0:
                add("drums", K, tb, 0.5)
                add("bass", bass_note(rootf, BAR * 0.9), tb, 0.3)
                add("chords", pad([midi(m) for m in chord], BAR + 0.3, 0.0, 700), tb, 0.45)
            if beat in (1, 3):
                for j, m in enumerate(chord):
                    add("chords", pluck(midi(m - 12), 0.2, 0.3, 0.06), tb + j * 0.006, 0.07, -0.2 + 0.2 * j)
        elif sec == "woozy":
            if beat == 0:
                add("chords", pad([midi(m) for m in chord], BAR + 0.4, 0.012, 1500), tb, 0.6)
                add("bass", bass_note(rootf, 0.9), tb, 0.3)
            if beat == 2:
                add("drums", K, tb, 0.35)
            add("keys", glock(midi(chord[beat % 3] + 24) * (1 + 0.012 * math.sin(i)), 0.8), tb, 0.04, 0.4 * math.sin(i))
        elif sec == "calm":
            if beat == 0:
                add("drums", K, tb, 0.6)
            if beat == 2:
                add("drums", CL, tb, 0.2, 0.1)
            for e in range(2):
                add("drums", SH, tb + e * BEAT / 2, 0.05 if e else 0.035, 0.4)
            for pos, iv, dur in [(0, 0, 0.8), (2, 7, 0.5), (3, 12, 0.3)]:
                if beat == pos:
                    add("bass", bass_note(rootf * 2 ** (iv / 12), dur), tb, 0.36)
            if beat in (1, 3):
                for j, m in enumerate(chord):
                    add("chords", pluck(midi(m), 0.3, 0.7, 0.1), tb + BEAT / 2 + j * 0.006, 0.09, -0.3 + 0.3 * j)
            if beat in (0, 2):
                add("keys", marimba(midi(chord[(i // 2) % 3] + 12)), tb, 0.07, 0.3)
        elif sec in ("upbeat", "sunny", "build"):
            full = sec != "build"
            if beat in (0, 2) and full:
                add("drums", K, tb, 0.85)
            if beat in (1, 3) and full:
                add("drums", CL, tb, 0.36, 0.1)
            for e in range(2):
                add("drums", HC, tb + e * BEAT / 2, 0.14 if e else 0.09, 0.35)
            for pos, iv, dur in [(0, 0, 0.4), (1, 12, 0.25), (1.5, 0, 0.25), (2, 7, 0.4), (3, 12, 0.25), (3.5, 7, 0.25)]:
                if int(pos) == beat:
                    add("bass", bass_note(rootf * 2 ** (iv / 12), dur), tb + (pos - beat) * BEAT, 0.4)
            for j, m in enumerate(chord):
                add("chords", pluck(midi(m), 0.3, 0.8, 0.11), tb + BEAT / 2 + j * 0.006, 0.11, -0.3 + 0.3 * j)
            arp = chord + [chord[0] + 12]
            for e in range(2):
                m = arp[(beat * 2 + e) % 4] + (12 if sec == "sunny" else 0)
                add("keys", marimba(midi(m)), tb + e * BEAT / 2, 0.09, 0.25 * math.sin(i + e))
            if sec == "sunny" and beat in (0, 2):
                add("keys", glock(midi(chord[(i // 2) % 3] + 24)), tb, 0.06, 0.3)
            if sec == "build":
                for r in range(4):
                    add("drums", S_, tb + r * BEAT / 4, 0.04 + 0.05 * ((tb - KEY["lepas2"]["s"]) / 1.3), -0.1)
        elif sec == "thoughtful":
            add("drums", woodblock(beat % 2 == 0), tb, 0.14, 0.3 if beat % 2 else -0.3)
            if beat == 0:
                add("bass", bass_note(rootf, 1.0), tb, 0.34)
                for j, m in enumerate(chord):
                    add("chords", pluck(midi(m), 0.5, 0.5, 0.2), tb + j * 0.02, 0.09, -0.3 + 0.3 * j)

    # accents
    place(mus["drums"], crash(1.6), KEY["langsir"]["s"], 0.16, 0.2)
    place(mus["drums"], K, KEY["langsir"]["s"], 0.9)
    place(mus["drums"], crash(1.2), KEY["menariknya"]["s"], 0.08, -0.2)
    return mus


def reverb(x, decay=1.1, wet=0.18):
    n = int(decay * 1.6 * SR)
    t = ar(n)
    ir = np.vstack([noise(n), noise(n)]) * np.exp(-t / (decay / 6.9))
    ir[:, : int(0.012 * SR)] = 0
    ir = np.vstack([filt(ir[0], "low", 6000), filt(ir[1], "low", 6000)])
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    out = np.zeros_like(x)
    for c in range(2):
        y = fftconvolve(x[c], ir[c])
        out[c] += y[: x.shape[1]]
    return x * (1 - wet) + out * wet


def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
    from scipy.signal import lfilter
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def load_audio(path, ch=1):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return x.reshape(-1, ch).T


def duck_envelope(voice):
    hop = int(0.01 * SR)
    frames = len(voice) // hop + 1
    pad = np.pad(voice, (0, frames * hop - len(voice)))
    rms = np.sqrt((pad.reshape(frames, hop) ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    act = np.clip((db + 46) / 14, 0, 1)
    g = np.zeros(frames)
    cur = 0.0
    for i, a in enumerate(act):  # attack 30 ms, release 350 ms
        k = 1 - np.exp(-1 / (3 if a > cur else 35))
        cur += (a - cur) * k
        g[i] = cur
    env = np.repeat(g, hop)[: len(voice)]
    return env


def limiter(x, ceiling_db=-1.0, look=0.005, release=0.08):
    ceil = 10 ** (ceiling_db / 20)
    peak = np.abs(x).max(axis=0)
    need = np.minimum(1.0, ceil / np.maximum(peak, 1e-9))
    la = int(look * SR)
    # look-ahead: minimum over the next `la` samples
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * la + 1, mode="wrap")
    g = np.roll(g, 0)
    out_g = np.empty_like(g)
    cur = 1.0
    rel = 1 - np.exp(-1 / (release * SR))
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else cur + (g[i] - cur) * rel
        out_g[i] = cur
    return x * out_g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--music", help="optional external music file to use instead of the synth bed")
    ap.add_argument("--target-lufs", type=float, default=-14.0)
    args = ap.parse_args()

    voice = load_audio(os.path.join(ROOT, "public/audio/vo.mp3"))[0]
    voice = np.pad(voice, (0, max(0, NT - len(voice))))[:NT]

    print("building sfx...", flush=True)
    # The programme level is measured without the outro whoosh, so adding it changes nothing else.
    st0 = rng.bit_generator.state
    sfx_ref = reverb(build_sfx(outro_whoosh=False), 0.7, 0.1)
    rng.bit_generator.state = st0
    sfx = reverb(build_sfx(outro_whoosh=True), 0.7, 0.1)

    if args.music:
        m = load_audio(args.music, 2)
        reps = int(np.ceil(NT / m.shape[1])) + 1
        m = np.tile(m, reps)[:, :NT]
        fade = int(0.5 * SR)
        m[:, -fade:] *= np.linspace(1, 0, fade)
        m[:, :fade] *= np.linspace(0, 1, fade)
        music = m
    else:
        print("building music...", flush=True)
        stems = build_music()
        music = stems["drums"] * 0.9 + stems["bass"] * 1.0 + stems["chords"] * 1.0 + stems["keys"] * 1.0
        music = reverb(music, 1.2, 0.16)
        # story stops: the alarm cuts the lullaby dead, the stamp cuts the thoughtful bed
        tt = ar(NT)
        gate = np.ones(NT)
        for k0, k1 in [("alarm", "lima2"), ("muktamad", "lepas2")]:
            t0, t1 = KEY[k0]["s"], KEY[k1]["s"]
            g = np.clip(np.maximum((t0 - tt) / 0.015, (tt - t1) / 0.05), 0, 1)
            gate = np.minimum(gate, g)
        music *= gate
    # carve space for the voice, then duck under it
    music = np.vstack([peaking(music[c], 2600, -4.0, 0.8) for c in range(2)])
    meter = pyln.Meter(SR)
    m_l = meter.integrated_loudness(music.T)
    music *= 10 ** ((-21.5 - m_l) / 20)  # music bed level before ducking
    env = duck_envelope(voice)
    music *= 1 - 0.66 * env  # about -9 dB while she speaks
    # the whispered line is much quieter than the rest of the voice: pull the bed further down there
    tt = ar(NT)
    w0, w1 = KEY["sebenarnya"]["s"], KEY["orang"]["s"]
    dip = 1 - 0.65 * np.clip(np.minimum((tt - (w0 - 0.4)) / 0.4, ((w1 - 0.1) - tt) / 0.3), 0, 1)
    music *= dip

    s_l = meter.integrated_loudness(sfx.T) if np.abs(sfx).max() > 0 else -70
    print(f"music {m_l:.1f} LUFS raw, sfx {s_l:.1f} LUFS", flush=True)

    # brand outro: no music or SFX on it, tails fade out right after it lands
    t_out = T(OUTRO_LAND)
    fade = np.clip(1 - (ar(NT) - t_out) / OUTRO_FADE, 0, 1)
    music *= fade
    sfx *= fade
    sfx_ref *= fade

    mix = np.vstack([voice, voice]) + music + sfx
    ref = np.vstack([voice, voice]) + music + sfx_ref
    pre = meter.integrated_loudness(ref[:, :N].T)  # level the main programme exactly as before (without the outro whoosh)
    gain = 10 ** ((args.target_lufs - pre) / 20)
    mix *= gain
    # the outro's only sound: one soft bubble "blup" exactly on the logo pop (dry, moderate level)
    b = blup()
    b *= 10 ** (BLUP_PEAK_DB / 20) / np.abs(b).max()
    place(mix, b, t_out, 1.0, 0.0)
    mix = limiter(mix, -1.2)
    vm = pyln.Meter(SR, block_size=0.4)
    st = int(t_out * SR)
    print(f"blup peak {BLUP_PEAK_DB} dBFS; momentary loudness blup {vm.integrated_loudness(mix[:, st : st + int(0.4 * SR)].T):.1f} LUFS "
          f"vs loudest voice word {max(vm.integrated_loudness(mix[:, int(w['s'] * SR) : int(w['s'] * SR) + int(0.4 * SR)].T) for w in words):.1f} LUFS", flush=True)
    post = meter.integrated_loudness(mix.T)
    print(f"mix {pre:.1f} -> {post:.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS", flush=True)

    def write(path, x):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        pcm = (np.clip(x, -1, 1).T * 32767).astype("<i2").tobytes()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", path], input=pcm, check=True)

    write(os.path.join(ROOT, "public/audio/mix.wav"), mix)
    write(os.path.join(ROOT, "out/stems/music.wav"), music * gain)
    write(os.path.join(ROOT, "out/stems/sfx.wav"), sfx * gain)
    print("wrote public/audio/mix.wav and out/stems/", flush=True)


if __name__ == "__main__":
    main()
