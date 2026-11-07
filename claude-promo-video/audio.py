"""Synthesise the soundtrack (pad + impacts + whooshes + plucks), synced to scene.js timings.
Usage: python3 audio.py out/soundtrack.wav
"""
import sys, wave
import numpy as np
from scipy import signal

SR = 48000
DUR = 19.2
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)          # dry bus
RL = np.zeros(N); RR = np.zeros(N)        # reverb send


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(d, pts):
    """pts: list of (time, value) — piecewise linear envelope of length d seconds."""
    x = tt(d)
    a, b = zip(*pts)
    return np.interp(x, a, b)


def put(sig, start, pan=0.0, gain=1.0, send=0.0):
    i = int(round(start * SR))
    if i < 0:
        sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    s = sig[:n] * gain
    L[i:i + n] += s * l; R[i:i + n] += s * r
    RL[i:i + n] += s * l * send; RR[i:i + n] += s * r * send


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)


# ── instruments ────────────────────────────────────────────
def pad(notes, d, cutoff, att=0.6, rel=0.9, bright_sweep=None):
    x = tt(d)
    out = np.zeros_like(x)
    for m in notes:
        f = hz(m)
        for det in (-0.07, 0.0, 0.07):
            ph = rng.random() * 2 * np.pi
            out += signal.sawtooth(2 * np.pi * f * 2 ** (det / 12) * x + ph) * 0.33
        out += np.sin(2 * np.pi * f * x) * 0.5
    out /= max(1, len(notes))
    if bright_sweep:
        dark, bright = lp(out, bright_sweep[0]), lp(out, bright_sweep[1])
        k = np.clip(x / d, 0, 1) ** 1.6
        out = dark * (1 - k) + bright * k
    else:
        out = lp(out, cutoff)
    e = env(d, [(0, 0), (att, 1), (max(att, d - rel), 1), (d, 0)])
    # slow movement
    out *= e * (1 + 0.06 * np.sin(2 * np.pi * 0.35 * x))
    return out


def bell(m, d=3.0, bright=1.0):
    x = tt(d); f = hz(m); out = np.zeros_like(x)
    for ratio, amp, dec in [(1, 1, 1), (2.0, .38, .55), (3.01, .2, .42), (4.17, .13 * bright, .3), (5.43, .08 * bright, .22), (6.8, .05 * bright, .15)]:
        out += amp * np.sin(2 * np.pi * f * ratio * x) * np.exp(-x / (d * 0.32 * dec))
    out *= np.minimum(1, x / 0.004)
    return out


def pluck(m, d=1.4):
    x = tt(d); f = hz(m)
    out = (np.sin(2 * np.pi * f * x) + .45 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x / .12) + .2 * np.sin(2 * np.pi * 3 * f * x) * np.exp(-x / .07))
    out *= np.exp(-x / .38) * np.minimum(1, x / 0.002)
    click = hp(rng.standard_normal(len(x)), 4000) * np.exp(-x / .006) * .25
    return out + click


def boom(d=2.2, f0=58, f1=31, k=4.0):
    x = tt(d)
    f = f1 + (f0 - f1) * np.exp(-x * k)
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.sin(ph) * np.exp(-x / .75)
    out = np.tanh(out * 1.6) / np.tanh(1.6)
    click = lp(rng.standard_normal(len(x)), 1800) * np.exp(-x / .02) * .6
    return out + click


def kick(d=0.5):
    x = tt(d)
    f = 48 + 90 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / .16) * np.minimum(1, x / .002)


def hat(d=0.12):
    x = tt(d)
    return hp(rng.standard_normal(len(x)), 7000) * np.exp(-x / .03)


def whoosh(d, peak, f_lo=250, f_hi=7000, pan_from=-0.7, pan_to=0.7):
    """Filtered noise sweep; returns (left, right)."""
    n = int(d * SR)
    noise = rng.standard_normal(n)
    f, tseg, Z = signal.stft(noise, SR, nperseg=1024)
    tk = np.clip(tseg / d, 0, 1)
    p = peak / d
    up = np.clip(tk / p, 0, 1) ** 1.5
    down = np.clip((tk - p) / (1 - p), 0, 1) ** 0.7
    centre = np.where(tk < p, f_lo * (f_hi / f_lo) ** up, f_hi * (f_lo / f_hi) ** down)
    mask = np.exp(-((np.log(f[:, None] + 1) - np.log(centre[None, :])) ** 2) / (2 * 0.55 ** 2))
    _, y = signal.istft(Z * mask, SR, nperseg=1024)
    y = y[:n]
    x = np.arange(n) / SR
    a = np.where(x < peak, (x / peak) ** 2.2, np.exp(-(x - peak) / (0.18 * (d - peak) + 1e-3)))
    y = y / (np.abs(y).max() + 1e-9) * a
    pan = np.interp(x, [0, d], [pan_from, pan_to])
    return y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)


def put_stereo(lr, start, gain=1.0, send=0.0):
    l, r = lr
    i = int(start * SR); n = min(len(l), N - i)
    L[i:i + n] += l[:n] * gain; R[i:i + n] += r[:n] * gain
    RL[i:i + n] += l[:n] * gain * send; RR[i:i + n] += r[:n] * gain * send


def reverse_swell(notes, end, d=2.0):
    """Reverse reverb-like swell ending exactly at `end`."""
    s = sum(bell(m, 3.0) for m in notes)
    ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-tt(2.2) / .55)
    w = signal.fftconvolve(s, ir)[: int(d * SR)]
    w = w[::-1] / (np.abs(w).max() + 1e-9)
    w *= env(d, [(0, 0), (d * .7, .6), (d - .03, 1), (d, 0)])
    put(w, end - d, 0, .5, .2)


# ── arrangement (times match scene.js) ───────────────────────
D3, Fs3, A3, B2, G2, E3, A2, Cs4, E4, D4, Fs4, B3, G3 = 50, 54, 57, 47, 43, 52, 45, 61, 64, 62, 66, 59, 55

# pads
put(pad([D3, A3, E4, A2 + 12], 2.6, 0, att=1.6, rel=0.35, bright_sweep=(300, 1600)), 0.0, 0, .55, .5)
put(pad([D3 - 12, D3, Fs3, A3, Cs4, E4], 3.0, 2200, att=.05, rel=.8), 2.3, 0, .5, .5)
put(pad([B2, D3, Fs3, A3, Cs4], 3.2, 1900, att=.5, rel=.8), 4.9, 0, .5, .5)
put(pad([G2, B2, D3, Fs3, A3, B3], 3.2, 2100, att=.5, rel=.8), 7.8, 0, .5, .5)
put(pad([A2, D3, E3, A3, E4], 1.8, 0, att=.4, rel=.5, bright_sweep=(600, 3500)), 10.7, 0, .48, .5)
put(pad([G2, B2, D3, Fs3, A3, E4], 2.0, 2600, att=.05, rel=.7), 12.4, 0, .5, .5)
put(pad([E3 - 12, E3, G3, B3, D4, Fs4], 2.0, 2400, att=.5, rel=.7), 14.1, 0, .48, .5)
put(pad([A2, D3, E3, A3, B3, E4], 1.8, 0, att=.5, rel=.3, bright_sweep=(700, 4200)), 15.75, 0, .46, .5)
put(pad([D3 - 12, D3, Fs3, A3, Cs4, E4, A3 + 12], 2.0, 3000, att=.03, rel=1.4), 17.4, 0, .58, .6)

# intro: reverse swell into the logo impact
reverse_swell([D4 + 12, A3 + 12, Fs4 + 12], 2.3, 2.1)
put_stereo(whoosh(1.4, 1.36, 200, 3000, 0.4, -0.3), 0.95, .22, .3)

# impact 1 — logo forms
put(boom(), 2.3, 0, .9, .15)
for m, p in [(D4 + 12, -.3), (A3 + 12, .3), (Fs4 + 12, 0), (E4 + 24, .5)]:
    put(bell(m, 3.2), 2.3, p, .14, .7)

# shimmer sparkles as the wordmark appears
for k, m in enumerate([74, 78, 81, 86, 85, 81]):
    put(bell(m, 1.6, .7), 2.5 + k * 0.075, -0.6 + k * 0.24, .05, .8)

# fly-through 1
put_stereo(whoosh(1.3, 0.55, 180, 8000, -0.6, 0.6), 4.05, .55, .35)
put(boom(1.4, 70, 38, 6.0), 4.6, 0, .35, .2)

# pulse under the model cards (beat = 0.55 s, focus every 2 beats)
for k in range(11):
    tb = 5.2 + k * 0.55
    if tb > 10.8:
        break
    put(kick(), tb, 0, .42 if k % 2 else .55, .05)
    put(hat(), tb + 0.275, .25 if k % 2 else -.25, .07, .15)
# card focus plucks — ascending as capability rises
for k, m in enumerate([D4 + 12, Fs4 + 12, A3 + 24, D4 + 24]):
    f = 5.75 + k * 1.1
    put(pluck(m), f - 0.05, [-.45, -.15, .15, .45][k], .22, .55)
    put(bell(m + 12, 1.4, .5), f - 0.05, [-.45, -.15, .15, .45][k], .05, .8)
# overview shimmer
for k, m in enumerate([86, 90, 93, 98]):
    put(bell(m, 1.8, .6), 9.95 + k * 0.1, -0.5 + k * .33, .045, .8)

# fly-through 2 into Pro
put_stereo(whoosh(1.4, 0.75, 160, 9000, 0.6, -0.6), 10.85, .55, .35)
reverse_swell([A3 + 12, E4 + 12, B3 + 12], 12.45, 1.3)
put(boom(1.8, 62, 34), 12.45, 0, .55, .15)
for m, p in [(G3 + 12, -.3), (D4 + 12, .3), (B3 + 12, 0)]:
    put(bell(m, 2.6), 12.45, p, .1, .7)

# pill arrivals
for k, (tp, m) in enumerate(zip([12.75, 13.0, 13.25, 13.5], [D4 + 12, Fs4 + 12, A3 + 24, B3 + 24])):
    put(pluck(m, 1.2), tp + 0.08, [-.5, .5, -.4, .4][k], .16, .6)
for k in range(6):
    tb = 13.9 + k * 0.55
    put(kick(), tb, 0, .32, .05)
    put(hat(), tb + 0.275, .2 if k % 2 else -.2, .05, .15)

# outro riser + final hit
put_stereo(whoosh(1.6, 1.5, 200, 6000, -0.4, 0.4), 15.85, .3, .4)
reverse_swell([D4 + 12, A3 + 12, Fs4 + 12, D4 + 24], 17.4, 1.5)
put(boom(2.4, 60, 30, 3.5), 17.4, 0, .9, .2)
for m, p in [(D4, -.2), (A3 + 12, .2), (D4 + 12, -.4), (Fs4 + 12, .4), (A3 + 24, 0), (E4 + 24, .6)]:
    put(bell(m, 3.6), 17.4, p, .13, .75)
for k, m in enumerate([86, 90, 93, 97, 98]):
    put(bell(m, 2.2, .6), 17.6 + k * 0.09, -0.6 + k * .3, .04, .85)

# ── reverb, mix, master ─────────────────────────────────────
def ir(d=2.8, seed=1):
    r = np.random.default_rng(seed)
    x = tt(d)
    n = r.standard_normal(len(x)) * np.exp(-x / 0.62)
    n = lp(n, 7000)
    n[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return n / np.sqrt((n ** 2).sum())

wetL = signal.fftconvolve(RL, ir(seed=1))[:N]
wetR = signal.fftconvolve(RR, ir(seed=2))[:N]
outL = L + wetL * 0.9
outR = R + wetR * 0.9
outL, outR = hp(outL, 28), hp(outR, 28)

# gentle glue + limiter
peak = max(np.abs(outL).max(), np.abs(outR).max())
outL, outR = outL / peak * 1.3, outR / peak * 1.3
outL, outR = np.tanh(outL) / np.tanh(1.3), np.tanh(outR) / np.tanh(1.3)
x = np.arange(N) / SR
fade = np.clip(x / 0.05, 0, 1) * np.clip((DUR - x) / 0.65, 0, 1) ** 1.5
outL *= fade * 0.89; outR *= fade * 0.89

pcm = (np.stack([outL, outR], 1) * 32767).astype('<i2')
path = sys.argv[1] if len(sys.argv) > 1 else 'out/soundtrack.wav'
with wave.open(path, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', path, f'{DUR}s')
