"""
Builds the final soundtrack: voiceover + original music bed + sound effects.

Everything here is synthesised from scratch (no samples), so there is nothing to license.
SFX are placed on the same frames as their visual events (same word onsets as src/cues.ts),
the music is 120 BPM (44.0 s = exactly 22 bars) and every tail past 44 s wraps to the start,
so the audio loops as seamlessly as the picture.

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
DUR = 44.0
N = int(SR * DUR)
FPS = 30
BPM = 120
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
    start = int(round(t0 * SR)) % N
    n = sig.shape[1]
    first = min(n, N - start)
    buf[:, start : start + first] += sig[:, :first]
    rest = sig[:, first:]
    while rest.shape[1] > 0:  # wrap tails to the start (seamless loop)
        k = min(rest.shape[1], N)
        buf[:, :k] += rest[:, :k]
        rest = rest[:, k:]


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


# ----------------------------------------------------------------------------- SFX timeline
def build_sfx():
    buf = np.zeros((2, N))
    P = lambda sig, fr, g, pan=0.0, offs=0.0: place(buf, sig, T(fr) + offs, g, pan)

    # whip-pans: whoosh centred on the whip's fastest frame (start - 4.5), panned with the motion
    for start, d in [(F("tibatiba"), 1), (F("tugasan"), -1), (F("masalahnya"), 1), (F("kau3"), -1), (1320, 1)]:
        w = whoosh(0.5, 0.58, 300, 3200, d)
        fade = np.clip((0.5 - ar(w.shape[1])) / 0.12, 0, 1)  # keep the tail off the first word
        place(buf, w * fade, T(start - 4.5) - 0.29, 0.4)
    # scale-through zooms: rising swoosh into the cut, soft thump on landing
    for start in [F("kajian"), F("kononnya"), F("tak2")]:
        z = zoom_whoosh(0.42)
        place(buf, z, T(start) - 0.40, 0.4)
        P(thump(80, 0.4), start, 0.35)
    # match cut
    P(swish(0.22), F("haa") - 2, 0.22, 0.3)
    # smash cut: impact + crash + laptop clack
    P(impact(1.3), F("cuba"), 0.38)
    P(crash(1.3), F("cuba"), 0.11, 0.2)
    P(clack(), F("cuba") + 1, 0.4, -0.4)

    # text slams (impact lands on the word onset; sample has 0.1 s lead)
    for k, wgt, g in [("deadline", 1.0, 0.3), ("esok", 1.2, 0.34), ("malas", 1.0, 0.3), ("hilang", 1.0, 0.28), ("susah", 1.4, 0.36), ("lima", 1.0, 0.28)]:
        place(buf, slam(wgt), T(F(k)) - 0.1, g)

    # keyword pops (one per word, pitch walks up within a scene)
    pops = [
        ("tibatiba", 560), ("mengemas", 620), ("jadi", 660), ("bukan", 560), ("sebab", 640),
        ("kajian", 540), ("psikologi", 620), ("tangguh", 560), ("kerja", 640),
        ("bosan", 520), ("menakutkan", 600), ("jadi2", 540), ("pilih", 620), ("lega", 700), ("sekejap", 820),
        ("tugasan2", 520), ("takkan", 600), ("sikitsikit", 640), ("kau3", 560), ("pun3", 660),
    ]
    for k, f0 in pops:
        P(pop(f0), F(k), 0.14, rng.uniform(-0.25, 0.25))

    # --- scene 1: ticking clock, hops, alarm
    for fr in range(-15, F("tibatiba") - 6, 15):
        loud = fr >= F("deadline")
        P(tick(3300 if (fr // 15) % 2 == 0 else 2500), fr, 0.32 if loud else 0.2, -0.45)
    P(boing(190), F("yoo"), 0.22)
    P(boing(220), F("yoo2"), 0.22)
    P(bell_ring(0.8), F("doww"), 0.14, -0.4)
    # --- scene 2
    P(chime((84, 88, 91)), F("rasa"), 0.16, 0.1)
    P(swish(0.2), F("mengemas") - 3, 0.3, 0.5)
    for fr in range(F("mengemas") + 6, F("haa") - 4, 10):
        P(swish(0.14), fr, 0.07, 0.35)
    P(chime((84, 88, 91, 96, 100), 0.035), F("best"), 0.22)
    P(boing(240), F("pulak"), 0.16)
    # --- scene 3a
    P(swish(0.25), F("haa"), 0.18, 0.6)  # duster tossed away
    P(zip_(0.22, 600, 5000), F("malas") + 4, 0.2)  # strike-through draws on
    # --- scene 3b
    P(ting(2350), F("kajian") + 5, 0.14, 0.2)  # glasses land
    P(poof(0.4), F("rasa2"), 0.25, 0.4)
    P(swish(0.18), F("sekarang") - 2, 0.22, 0.4)
    P(poof(0.35), F("sekarang") + 4, 0.3, 0.4)
    P(chime((79, 84)), F("sekarang") + 7, 0.1)
    # --- scene 3c
    P(thwap(), F("tugasan"), 0.32, -0.4)
    P(womp(0.55), F("jatuh"), 0.17, 0.4)
    P(impact(0.7), F("jatuh"), 0.2, 0.3)
    P(swish(0.2), F("jadi2") - 4, 0.16)
    P(zip_(0.45, 500, 4000), F("otak2"), 0.13)
    P(zip_(0.25, 900, 7000), F("pilih"), 0.18, 0.3)
    P(zip_(0.5, 500, 4000), F("lebih"), 0.13)
    P(fwump(), F("lega"), 0.42, 0.35)
    P(tick(2800), F("sekejap"), 0.2, 0.55)
    # --- scene 4
    P(rumble(0.75), F("masalahnya") - 2, 0.32, -0.5)
    for k, f0, g in [("tugasan2", 120, 0.2), ("hilang", 105, 0.18), ("lamalama", 95, 0.24), ("tekanan", 88, 0.25), ("semakin", 80, 0.26), ("besar", 70, 0.24)]:
        P(thump(f0), F(k), g, -0.35)
    P(pop(260, 0.14, 1.4), F("dia"), 0.2, -0.3)  # snowball opens its eyes
    P(pop(700), F("tekanan") - 2, 0.14, 0.6)  # meter pops in
    place(buf, riser(1.35), T(F("besar")) - 1.35, 0.17, 0.5)
    P(impact(1.2), F("besar"), 0.3)
    P(hiss(0.55), F("besar") + 2, 0.13, 0.6)
    # --- scene 5
    P(pop(480), F("kononnya"), 0.2)
    P(swish(0.3), F("lega2") - 3, 0.22, -0.6)
    P(thump(140, 0.25), F("lega2") + 6, 0.28, -0.4)
    place(buf, drop_whistle(0.22), T(F("susah")) - 0.22, 0.12, 0.5)
    P(boing(110, 0.4), F("susah") + 2, 0.18, 0.3)
    P(chime((88, 91, 96)), F("bila"), 0.12, 0.5)
    step_fr = F("rasa4")
    i = 0
    fr = step_fr
    while fr < F("cuba") - 2:
        P(plink(76 if i % 2 == 0 else 79), int(fr), 0.12, 0.3)
        fr += 5.7
        i += 1
    P(pop(900, 0.12, 1.5), F("lari"), 0.18, 0.4)
    # --- scene 5b
    for j in range(22):
        fr = F("sikitsikit") + j * 1.4 + rng.uniform(-0.3, 0.3)
        if fr >= F("tak2") - 4:
            break
        P(key_click(), fr, rng.uniform(0.05, 0.09), -0.4)
    P(zip_(0.25, 700, 5500), F("sikitsikit") + 6, 0.09)
    # --- scene 6
    P(pop(520), F("tak2") - 1, 0.2)
    for fr in range(F("lima") + 3, F("kau3") - 8, 3):
        P(tick(2900), fr, 0.1, -0.1)
    P(pop(420, 0.16, 0.6), F("minit"), 0.18, 0.4)  # shrink blips (pitch down)
    P(pop(360, 0.16, 0.6), F("pun2"), 0.18, 0.4)
    P(pop(900, 0.12, 1.6), F("jadilah"), 0.15, 0.4)
    P(party_popper(), F("jadilah"), 0.24, 0.3)
    P(boing(260), F("jadilah"), 0.1, -0.3)
    P(chime((84, 88, 91, 96, 100, 103), 0.03), F("jadilah") + 2, 0.12)
    # --- scene 7
    P(swish(0.2), F("kau3") + 1, 0.16)
    P(ting(2637), F("kan"), 0.2, 0.3)
    for k, f0, pn in [("dapat", 600, -0.5), ("catch", 720, 0.5), ("sila", 820, -0.5), ("komen", 960, 0.5)]:
        P(pop(f0), F(k), 0.19, pn)
    P(chime((91, 96)), F("komen") + 3, 0.1, -0.6)  # glint on the duster
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
CH = {
    "C": ([60, 64, 67], 36), "Am": ([57, 60, 64], 33), "F": ([57, 60, 65], 41), "G": ([55, 59, 62], 43),
    "Dm": ([57, 62, 65], 38), "E": ([56, 59, 64], 40), "Em": ([55, 59, 64], 40),
}
#        bar:  0    1     2    3    4    5     6    7    8     9    10   11    12   13    14   15   16   17   18   19    20   21
PROG = ["C", "Am", "F", "G", "C", "Am", "F", "G", "Am", "F", "G", "Am", "F", "Dm", "E", "F", "G", "G", "C", "Am", "F", "G"]
SECTION = {
    **{b: "intro" for b in (0, 1)}, 2: "groove", 3: "groove",
    **{b: "explain" for b in range(4, 11)},
    **{b: "tension" for b in range(11, 15)},
    15: "sparse", 16: "sparse", 17: "build",
    **{b: "full" for b in range(18, 22)},
}
STOP_AT = 29.3  # music hits on "besar" and stops until the zoom into scene 5 (30.0 s)
STOP_END = 30.0
SMASH_T = None  # filled in main


def build_music():
    mus = {k: np.zeros((2, N)) for k in ("drums", "bass", "chords", "keys")}

    def add(stem, sig, t, g, pan=0.0):
        if STOP_AT <= t < STOP_END:
            return
        place(mus[stem], sig, t, g, pan)

    K, S_, CL, HC, HO, SH = kick(), snare(), clap(), hat(), hat(True), shaker()
    for b in range(22):
        t0 = b * BAR
        sec = SECTION[b]
        chord, root = CH[PROG[b]]
        rootf = midi(root)
        # ---------------- drums
        for beat in range(4):
            tb = t0 + beat * BEAT
            if sec in ("intro", "groove", "full", "build"):
                if beat in (0, 2) or (sec == "full" and beat == 3 and b % 2 == 1):
                    add("drums", K, tb, 0.9)
                if beat in (1, 3):
                    add("drums", CL if sec != "build" else S_, tb, 0.42, 0.1)
            elif sec == "explain":
                if beat == 0:
                    add("drums", K, tb, 0.7)
                if beat == 2:
                    add("drums", K, tb, 0.45)
                if beat == 3:
                    add("drums", CL, tb, 0.24, 0.1)
            elif sec == "tension":
                add("drums", tom(110 if beat % 2 == 0 else 95), tb, 0.35, -0.2)
                if beat == 0:
                    add("drums", K, tb, 0.8)
            elif sec == "sparse":
                add("drums", woodblock(beat % 2 == 0), tb, 0.18, 0.3 if beat % 2 else -0.3)
                if beat == 0:
                    add("drums", K, tb, 0.55)
            # hats / shaker
            for e in range(2):
                te = tb + e * BEAT / 2
                if sec in ("intro", "groove", "full", "build"):
                    add("drums", HO if (e == 1 and beat == 3 and sec == "full") else HC, te, 0.16 if e else 0.1, 0.35)
                elif sec in ("explain",):
                    add("drums", SH, te, 0.07 if e else 0.05, 0.4)
                elif sec == "tension":
                    add("drums", HC, te, 0.07, 0.35)
        # build: snare roll into the downbeat after the smash cut
        if sec == "build":
            for i in range(8):
                add("drums", S_, t0 + 2 * BEAT + i * BEAT / 4, 0.05 + 0.018 * i, -0.1)
        # tension: snare roll crescendo into "besar"
        if b == 14:
            tt = t0
            i = 0
            while tt < STOP_AT - 0.02:
                add("drums", S_, tt, 0.08 + 0.3 * ((tt - t0) / (STOP_AT - t0)) ** 2, -0.1)
                tt += BEAT / 4 if tt < t0 + 0.8 else BEAT / 8
                i += 1
        # ---------------- bass (bouncy root / octave)
        if sec == "sparse":
            pattern = [(0, 0, 0.45), (2, 7, 0.45)]
        elif sec == "tension":
            pattern = [(i * 0.5, 0, 0.22) for i in range(8)]
        elif sec == "explain":
            pattern = [(0, 0, 0.7), (1.5, 0, 0.3), (2, 7, 0.45), (3, 12, 0.3), (3.5, 7, 0.3)]
        else:
            pattern = [(0, 0, 0.45), (1, 12, 0.3), (1.5, 0, 0.3), (2, 7, 0.45), (3, 12, 0.3), (3.5, 7, 0.3)]
        for pos, iv, dur in pattern:
            add("bass", bass_note(rootf * 2 ** (iv / 12), dur), t0 + pos * BEAT, 0.42)
        # ---------------- chords: off-beat plucks (skank)
        if sec != "tension":
            offs = [0.5, 1.5, 2.5, 3.5] if sec != "sparse" else [1.0, 3.0]
            for pos in offs:
                for j, m in enumerate(chord):
                    add("chords", pluck(midi(m), 0.32, 0.8, 0.12), t0 + pos * BEAT + j * 0.006, 0.12, -0.3 + 0.3 * j)
        else:
            for pos in [0, 0.75, 1.5, 2.5, 3.25]:
                for j, m in enumerate(chord):
                    add("chords", pluck(midi(m - 12), 0.25, 0.6, 0.08), t0 + pos * BEAT + j * 0.004, 0.13, -0.3 + 0.3 * j)
        # ---------------- keys: marimba arpeggio (lighter while explaining) / glock hook at the end
        arp = chord + [chord[0] + 12]
        steps = [0, 1, 2, 3, 2, 1, 2, 3] if sec != "tension" else [0, 2, 1, 2, 0, 2, 1, 2]
        if sec in ("intro", "groove", "full", "explain", "tension", "build"):
            for i, st in enumerate(steps):
                if sec == "explain" and i % 2 == 1:
                    continue
                m = arp[st] + (12 if sec in ("full", "intro") else 0)
                add("keys", marimba(midi(m)), t0 + i * BEAT / 2, 0.11 if sec != "explain" else 0.08, 0.25 * math.sin(i))
        if sec == "full":
            hook = [(0, chord[2] + 12), (1, chord[1] + 12), (1.5, chord[0] + 24), (3, chord[1] + 12)] if b % 2 == 0 else [(0, chord[0] + 12), (0.75, chord[1] + 12), (1.5, chord[2] + 12), (2.5, chord[0] + 24)]
            for pos, m in hook:
                add("keys", glock(midi(m)), t0 + pos * BEAT, 0.07, 0.3)

    # accents
    place(mus["drums"], crash(1.6), STOP_AT, 0.2)
    place(mus["drums"], K, STOP_AT, 1.0)
    place(mus["drums"], crash(1.6), 36.0, 0.12, 0.2)
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
        # wrap the tail for a seamless loop
        out[c] += y[:N]
        tail = y[N:]
        out[c, : len(tail)] += tail[:N]
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
    env = np.repeat(g, hop)[:N]
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
    global SMASH_T
    ap = argparse.ArgumentParser()
    ap.add_argument("--music", help="optional external music file to use instead of the synth bed")
    ap.add_argument("--target-lufs", type=float, default=-14.0)
    args = ap.parse_args()
    SMASH_T = T(F("cuba"))

    voice = load_audio(os.path.join(ROOT, "public/audio/vo.mp3"))[0]
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

    print("building sfx...", flush=True)
    sfx = build_sfx()
    sfx = reverb(sfx, 0.7, 0.1)

    if args.music:
        m = load_audio(args.music, 2)
        reps = int(np.ceil(N / m.shape[1])) + 1
        m = np.tile(m, reps)[:, :N]
        fade = int(0.5 * SR)
        m[:, -fade:] *= np.linspace(1, 0, fade)
        m[:, :fade] *= np.linspace(0, 1, fade)
        music = m
    else:
        print("building music...", flush=True)
        stems = build_music()
        music = stems["drums"] * 0.9 + stems["bass"] * 1.0 + stems["chords"] * 1.0 + stems["keys"] * 1.0
        music = reverb(music, 1.2, 0.16)
    # carve space for the voice, then duck under it
    music = np.vstack([peaking(music[c], 2600, -4.0, 0.8) for c in range(2)])
    meter = pyln.Meter(SR)
    m_l = meter.integrated_loudness(music.T)
    music *= 10 ** ((-21.5 - m_l) / 20)  # music bed level before ducking
    env = duck_envelope(voice)
    music *= 1 - 0.66 * env  # about -9 dB while she speaks

    s_l = meter.integrated_loudness(sfx.T) if np.abs(sfx).max() > 0 else -70
    print(f"music {m_l:.1f} LUFS raw, sfx {s_l:.1f} LUFS", flush=True)

    mix = np.vstack([voice, voice]) + music + sfx
    pre = meter.integrated_loudness(mix.T)
    mix *= 10 ** ((args.target_lufs - pre) / 20)
    mix = limiter(mix, -1.2)
    post = meter.integrated_loudness(mix.T)
    print(f"mix {pre:.1f} -> {post:.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS", flush=True)

    def write(path, x):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        pcm = (np.clip(x, -1, 1).T * 32767).astype("<i2").tobytes()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", path], input=pcm, check=True)

    write(os.path.join(ROOT, "public/audio/mix.wav"), mix)
    g = 10 ** ((args.target_lufs - pre) / 20)
    write(os.path.join(ROOT, "out/stems/music.wav"), music * g)
    write(os.path.join(ROOT, "out/stems/sfx.wav"), sfx * g)
    print("wrote public/audio/mix.wav and out/stems/", flush=True)


if __name__ == "__main__":
    main()
