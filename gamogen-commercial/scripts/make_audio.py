"""
Original, procedurally synthesised audio for the HEALIN GAMOGEN commercial.
(No third-party music/samples are used, so everything is royalty-free.)

Outputs
  audio/music/bgm_spa_ambient.wav   - 107.5 s luxury ambient / spa underscore (48 kHz stereo)
  audio/sfx/*.wav                   - whoosh, whoosh_soft, pop, tick, chime, sparkle, impact, riser

Run:  python3 scripts/make_audio.py
"""
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 107.5
rng = np.random.default_rng(20251109)
os.makedirs("audio/music", exist_ok=True)
os.makedirs("audio/sfx", exist_ok=True)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False) ** 2,
                        np.linspace(1, s, d, endpoint=False),
                        np.full(sus, s),
                        np.linspace(s, 0, r) ** 1.5])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def lowpass(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "low")
    return signal.lfilter(b, a, x, axis=0)


def highpass(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x, axis=0)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x, axis=0)


def reverb_ir(rt=2.8, sr=SR, predelay=0.02, bright=6000):
    n = int(rt * 1.4 * sr)
    t = np.arange(n) / sr
    decay = np.exp(-6.9 * t / rt)
    ir = rng.standard_normal((n, 2)) * decay[:, None]
    ir = lowpass(ir, bright)
    ir = np.vstack([np.zeros((int(predelay * sr), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(0, keepdims=True))


def convolve_st(x, ir):
    out = np.zeros((len(x) + len(ir) - 1, 2))
    for c in range(2):
        out[:, c] = signal.fftconvolve(x[:, c], ir[:, c])
    return out[: len(x)]


def pan(mono, p):
    # p in [-1, 1]
    l = np.cos((p + 1) * np.pi / 4)
    r = np.sin((p + 1) * np.pi / 4)
    return np.stack([mono * l, mono * r], 1)


def automation(points, n):
    """piecewise-linear gain curve from [(time, gain), ...]"""
    t = np.arange(n) / SR
    ts, gs = zip(*points)
    return np.interp(t, ts, gs)


def save(path, x, peak=0.89):
    m = np.max(np.abs(x)) + 1e-9
    x = x / m * peak
    wavfile.write(path, SR, (x * 32767).astype(np.int16))
    print("wrote", path, f"{len(x)/SR:.2f}s")


# ---------------------------------------------------------------------------
# MUSIC
# ---------------------------------------------------------------------------
N = int(DUR * SR)
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
# Dmaj9 - Bm9 - Gmaj9 - A6sus2  (2 bars each)  -- warm, luxurious, unresolved-calm
CHORDS = [
    ("D", [50, 57, 61, 64, 66, 69], 38),
    ("Bm", [47, 54, 57, 61, 62, 66], 35),
    ("G", [43, 50, 54, 57, 59, 62], 31),
    ("A", [45, 52, 57, 59, 64, 66], 33),
]
CH_LEN = 2 * BAR
t_all = np.arange(N) / SR

pad = np.zeros((N, 2))
sub = np.zeros(N)
keys = np.zeros((N, 2))
shimmer = np.zeros((N, 2))
perc = np.zeros((N, 2))


def pad_voice(f, n, detune_cents=7):
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for ch, sign in ((0, -1), (1, 1)):
        acc = np.zeros(n)
        for k, cents in enumerate((-detune_cents, 0, detune_cents)):
            ff = f * 2 ** ((cents + sign * 2) / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            for h in range(1, 7):
                acc += np.sin(2 * np.pi * ff * h * t + ph * h) / (h ** 1.35)
        out[:, ch] = acc
    return out


# chord timeline; the last chord (from FINAL) is a held Dmaj9 resolution
FINAL = 101.6
starts = []
t0 = 0.0
i = 0
while t0 < FINAL - 0.5:
    starts.append((t0, min(t0 + CH_LEN, FINAL), CHORDS[i % 4]))
    t0 += CH_LEN
    i += 1
starts.append((FINAL, DUR, CHORDS[0]))

for (s, e, (name, notes, root)) in starts:
    a = int(s * SR)
    last = e >= DUR - 0.01
    rel = 3.5 if last else 1.4
    b = min(int((e + rel) * SR), N)
    n = b - a
    seg = np.zeros((n, 2))
    for nn in notes:
        seg += pad_voice(midi(nn), n) * (0.9 if nn < 55 else 0.6)
    en = env_adsr(n, 1.6 if not last else 0.25, 0.5, 0.85, rel)
    pad[a:b] += seg * en[:, None]
    # sub bass
    sn = np.sin(2 * np.pi * midi(root) * np.arange(n) / SR)
    sub[a:b] += sn * env_adsr(n, 0.8, 0.4, 0.8, rel)

    # e-piano / glass arpeggio on chord tones (deterministic pattern)
    arp_notes = [notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[5] + 12, notes[3] + 24, notes[4] + 12]
    pattern = [0, 1.5, 2.5, 4, 5.5, 6.5] if not last else [0, 0.5, 1.0, 1.5, 2.5]
    for j, beat in enumerate(pattern):
        ts = s + beat * BEAT
        if ts >= e and not last:
            continue
        f = midi(arp_notes[j % len(arp_notes)])
        L = int(2.2 * SR)
        k0 = int(ts * SR)
        if k0 + L > N:
            L = N - k0
        if L <= 0:
            continue
        tt = np.arange(L) / SR
        idx = 1.6 * np.exp(-tt * 4)
        tone = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * tt))
        glass = 0.25 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 6)
        amp = np.exp(-tt * 1.9) * (1 - np.exp(-tt * 400))
        keys[k0:k0 + L] += pan((tone + glass) * amp * 0.55, [-0.45, 0.35, -0.2, 0.5, 0.1, -0.35][j % 6])

    # shimmer: high chord tones with slow tremolo
    for nn in notes[3:]:
        f = midi(nn + 24)
        tr = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * np.arange(n) / SR + nn)
        sh = np.sin(2 * np.pi * f * np.arange(n) / SR) * tr * env_adsr(n, 2.0, 0.5, 0.7, rel)
        shimmer[a:b] += pan(sh * 0.12, 0.6 if nn % 2 else -0.6)

# pad tone shaping: slow-moving lowpass for "breathing" warmth
pad = lowpass(pad, 1500)
pad = highpass(pad, 90)

# soft percussion: shaker 8ths + very soft kick  (only in "uplifting" sections)
def add_perc(t_start, t_end, kick=True, level=1.0):
    t = t_start
    k = 0
    while t < t_end:
        a = int(t * SR)
        L = int(0.09 * SR)
        if a + L >= N:
            break
        nz = rng.standard_normal(L)
        nz = bandpass(nz, 5000, 11000)
        e = np.exp(-np.arange(L) / SR * 55) * (0.55 if k % 2 else 0.9)
        swing = 0.0
        perc[a:a + L] += pan(nz * e * 0.18 * level, 0.25 if k % 2 else -0.25)
        if kick and k % 4 == 0:
            L2 = int(0.4 * SR)
            tt = np.arange(L2) / SR
            f = 52 + 60 * np.exp(-tt * 30)
            ph = 2 * np.pi * np.cumsum(f) / SR
            perc[a:a + L2] += pan(np.sin(ph) * np.exp(-tt * 9) * 0.55 * level, 0)
        t += BEAT / 2
        k += 1


add_perc(11.2, 26.0, kick=False, level=0.7)
add_perc(81.6, 96.8, kick=True, level=1.0)

# arrangement / dynamics (gain automation per layer)
g_pad = automation([(0, 0), (1.2, 0.85), (11, 0.8), (26, 0.85), (39, 0.7), (54, 0.65), (65, 0.75),
                    (81, 0.8), (97, 0.95), (101.6, 1.0), (DUR - 1.8, 0.9), (DUR, 0)], N)
g_keys = automation([(0, 0), (2.0, 0.45), (11, 0.7), (26, 0.75), (33.5, 0.6), (39, 0.55), (54, 0.25),
                     (65, 0.5), (81, 0.8), (97, 0.8), (DUR - 1.5, 0.6), (DUR, 0)], N)
g_sub = automation([(0, 0), (3, 0.6), (54, 0.45), (65, 0.6), (101.6, 0.8), (DUR - 1.5, 0.5), (DUR, 0)], N)
g_sh = automation([(0, 0.0), (2, 0.8), (54, 0.5), (97, 1.0), (DUR, 0)], N)
g_perc = automation([(0, 1), (DUR - 2, 1), (DUR, 0)], N)

dry = pad * 0.30 * g_pad[:, None] + keys * 0.22 * g_keys[:, None] + \
    pan(sub, 0) * 0.35 * g_sub[:, None] + shimmer * 0.35 * g_sh[:, None] + perc * 0.6 * g_perc[:, None]
ir = reverb_ir(3.2)
wet = convolve_st(dry, ir)
mix = dry * 0.72 + wet * 0.55
mix = highpass(mix, 35)
# gentle glue: soft saturation
mix = np.tanh(mix * 1.4) / 1.4
save("audio/music/bgm_spa_ambient.wav", mix, peak=0.8)

# ---------------------------------------------------------------------------
# SFX
# ---------------------------------------------------------------------------
def sweep_noise(dur, f0, f1, f2, width=0.6, pan_from=-0.6, pan_to=0.6, attack=0.45):
    """noise with a time-varying band centre f0->f1->f2 (STFT-domain filter)"""
    n = int(dur * SR)
    nz = rng.standard_normal(n)
    f, tt, Z = signal.stft(nz, SR, nperseg=1024)
    prog = tt / tt[-1]
    centre = np.where(prog < attack, f0 * (f1 / f0) ** (prog / attack),
                      f1 * (f2 / f1) ** ((prog - attack) / (1 - attack)))
    logf = np.log(np.maximum(f, 20))[:, None]
    mask = np.exp(-((logf - np.log(centre)[None, :]) ** 2) / (2 * width ** 2))
    _, y = signal.istft(Z * mask, SR, nperseg=1024)
    y = y[:n]
    t = np.arange(n) / SR
    e = np.where(t / dur < attack, (t / dur / attack) ** 2, np.exp(-((t / dur - attack) / (1 - attack)) * 4.5))
    y = y * e
    p = np.linspace(pan_from, pan_to, n)
    return np.stack([y * np.cos((p + 1) * np.pi / 4), y * np.sin((p + 1) * np.pi / 4)], 1)


def with_verb(x, rt=1.6, wet=0.35):
    pad_ = np.vstack([x, np.zeros((int(rt * SR), 2))])
    return pad_ * (1 - wet) + convolve_st(pad_, reverb_ir(rt)) * wet


sfx = {}
sfx["whoosh"] = with_verb(sweep_noise(0.85, 250, 2600, 500), 1.2, 0.3)
sfx["whoosh_soft"] = with_verb(sweep_noise(1.1, 180, 1200, 300, width=0.5), 1.5, 0.35)

# pop: soft bubbly pluck
L = int(0.25 * SR); t = np.arange(L) / SR
f = 520 + 520 * np.exp(-t * 45)
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) * (1 - np.exp(-t * 2000))
sfx["pop"] = with_verb(pan(pop, 0), 0.8, 0.25)

# tick: tiny precise UI click (scientific scenes)
L = int(0.08 * SR); t = np.arange(L) / SR
tick = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) + 0.4 * bandpass(rng.standard_normal(L), 3000, 9000) * np.exp(-t * 200)
sfx["tick"] = with_verb(pan(tick, 0), 0.6, 0.2)

# chime: bell partials
def bell(f0, dur=3.0):
    L = int(dur * SR); t = np.arange(L) / SR
    y = np.zeros(L)
    for ratio, amp, dec in ((1, 1, 1.4), (2.0, 0.5, 2.0), (2.76, 0.35, 2.8), (5.4, 0.18, 4.5), (8.93, 0.08, 7)):
        y += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t * dec)
    return y * (1 - np.exp(-t * 3000))


ch = pan(bell(midi(81)), -0.15) + 0.6 * pan(np.pad(bell(midi(88)), (int(0.09 * SR), 0))[: int(3.0 * SR)], 0.25)
sfx["chime"] = with_verb(ch, 2.2, 0.4)

# sparkle: cluster of tiny high pings
L = int(1.4 * SR); sp = np.zeros((L, 2))
for k in range(14):
    st = int(rng.uniform(0, 0.75) * SR)
    ff = rng.uniform(2600, 6200)
    ln = int(0.35 * SR); tt = np.arange(ln) / SR
    ping = np.sin(2 * np.pi * ff * tt) * np.exp(-tt * rng.uniform(12, 22)) * rng.uniform(0.3, 1)
    sp[st:st + ln] += pan(ping, rng.uniform(-0.8, 0.8))
sfx["sparkle"] = with_verb(sp, 1.6, 0.4)

# impact: soft cinematic low hit
L = int(2.2 * SR); t = np.arange(L) / SR
f = 38 + 50 * np.exp(-t * 7)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
thump = lowpass(rng.standard_normal(L), 400) * np.exp(-t * 14) * 0.6
sfx["impact"] = with_verb(pan(boom + thump, 0), 2.5, 0.35)

# riser: rising airy shimmer (before big reveals)
L = int(1.6 * SR); t = np.arange(L) / SR
ris = sweep_noise(1.6, 400, 6000, 7000, width=0.45, pan_from=-0.3, pan_to=0.3, attack=0.92)
ff = 600 * 2 ** (t / 1.6 * 2)
tone = np.sin(2 * np.pi * np.cumsum(ff) / SR) * (t / 1.6) ** 2 * 0.25
sfx["riser"] = with_verb(ris + pan(tone, 0), 1.5, 0.35)

for k, v in sfx.items():
    save(f"audio/sfx/{k}.wav", v, peak=0.8)
