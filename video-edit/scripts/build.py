"""Build a PREVIEW edit: cuts + hflip + punch-ins + ASS captions/graphics + synth SFX.

Usage: python3 -I build.py <workdir> <outfile> [W H]
"""
import json, sys, os, subprocess, wave
import numpy as np

WORK = sys.argv[1]
OUT = sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (540, 960)
PREVIEW = "preview" in os.path.basename(OUT)
FPS = 30
SR = 48000
S = W / 540.0  # graphics scale factor (ASS authored at 540x960)

def fr(t):  # snap to frame grid so A/V never drifts across cuts
    return round(t * FPS) / FPS

# ---------------- EDL (source clip, in, out, zoom spec) ----------------
# zoom: number = static punch-in, (a, b) = slow push from a to b
EDL = [
    ("c2", 1.03, 6.29, (1.00, 1.10)),  # HOOK: "cleanser ni sesuai untuk semua jenis kulit ... bebas paraben"
    ("c1", 0.95, 4.02, 1.15),          # "Nak tahu tak apa yang ada dalam pencuci muka korang"
    ("c1", 4.31, 5.64, 1.28),          # "tu penting?"  (0.3s pause removed, punch for emphasis)
    ("c1", 6.46, 12.90, 1.00),         # "So dalam Healing facial cleansing gel ni ... Decyl Glucoside"
    ("c1", 13.40, 21.52, 1.12),        # "iaitu pembersih lembut ... vitamin B5"
    ("c1", 21.96, 23.73, 1.00),        # "Ini membantu kulit kekal lembab"
    ("c1", 24.20, 25.92, 1.14),        # "dan alga ekstrak sekali"   (breath pause removed)
    ("c2", 6.48, 16.05, 1.10),         # "Cara guna pun senang je ... sampai kering"
    ("c2", 17.02, 24.53, 1.00),        # "Saiz 50ml ... Hillwell Pharmaceutical"
    ("c2", 25.05, 29.74, 1.12),        # "Kami dari Seri Lestari ... Batu Pahat"
    ("c2", 30.06, 34.90, 1.00),        # "Kalau korang nak order ... seluruh Malaysia"
    ("c2", 35.26, 37.25, (1.00, 1.12)),# CTA "Terus PM kami, okey?"
]
EDL = [(c, fr(a), fr(b), z) for c, a, b, z in EDL]
segs, t = [], 0.0
for c, a, b, z in EDL:
    segs.append(dict(clip=c, a=a, b=b, z=z, o=t))
    t += b - a
TOTAL = t

def out_t(clip, ts):
    for s in segs:
        if s["clip"] == clip and s["a"] - 0.06 <= ts <= s["b"] + 0.06:
            return s["o"] + min(max(ts, s["a"]), s["b"]) - s["a"]
    return None

def seg_end_out(clip, ts):
    for s in segs:
        if s["clip"] == clip and s["a"] - 0.06 <= ts <= s["b"] + 0.06:
            return s["o"] + s["b"] - s["a"]
    return None

# ---------------- words -> output timeline ----------------
FIX = {"healing": "Healing", "cocal": "Cocoyl", "isothionate": "Isethionate",
       "desiglucoside": "Decyl Glucoside", "sodium": "Sodium", "glycerin": "Glycerin", "panthenol": "Panthenol",
       "topuk": "tepuk", "-topuk": "-tepuk", "topuk-tepuk": "tepuk-tepuk", "pengedasa": "pengedar", "seri": "Seri",
       "ok?": "okey?", "alga": "alga", "50ml": "50ml"}
HILITE = {"semua", "kulit", "paraben", "penting?", "Cocoyl", "Isethionate", "Decyl Glucoside", "kelapa",
          "tumbuhan.", "Glycerin", "Panthenol", "B5.", "lembab", "alga", "ekstrak", "senang",
          "berbuih,", "kering", "50ml", "padu", "Malaysia", "Healing", "Batu", "Pahat", "order",
          "PM", "Seri", "Lestari,", "Lembut", "lembut"}

words = []
for clip in ("c1", "c2"):
    d = json.load(open(os.path.join(WORK, clip + ".json")))
    ws = [dict(w=w["w"].strip(), s=w["s"], e=w["e"]) for sg in d["segments"] for w in sg["words"]]
    # merge "para"+"bank" -> paraben
    m = []
    for w in ws:
        if m and m[-1]["w"].lower() == "para" and w["w"].lower().startswith("bank"):
            m[-1]["w"] = "paraben"; m[-1]["e"] = w["e"]; continue
        if m and w["w"].startswith("-"):  # reduplication: mana -mana -> mana-mana
            m[-1]["w"] = m[-1]["w"] + {"-topuk": "-tepuk"}.get(w["w"], w["w"]); m[-1]["e"] = w["e"]; continue
        m.append(w)
    for w in m:
        best = None
        for s in segs:
            if s["clip"] != clip: continue
            ov = min(w["e"], s["b"]) - max(w["s"], s["a"])
            if ov > 0.1 and (best is None or ov > best[0]): best = (ov, s)
        if not best: continue
        s = best[1]
        a, b = max(w["s"], s["a"]), min(w["e"], s["b"])
        txt = FIX.get(w["w"].lower(), FIX.get(w["w"], w["w"]))
        words.append(dict(w=txt, s=s["o"] + a - s["a"], e=s["o"] + b - s["a"], seg=id(s)))
words.sort(key=lambda w: w["s"])
# "Cara" starts softly at 6.48; whisper put it earlier — clamp handled. Tidy first-word starts:
for i in range(1, len(words)):
    if words[i]["s"] < words[i-1]["e"]: words[i]["s"] = words[i-1]["e"]

# ---------------- ASS ----------------
def ts(x):
    x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def c(hexrgb, a=0):
    r, g, b = hexrgb[0:2], hexrgb[2:4], hexrgb[4:6]
    return f"&H{a:02X}{b}{g}{r}".upper()

WHITE, YEL, TEAL, NAVY, BLUE, PINK = "FFFFFF", "FFE14D", "14B8A6", "0B2545", "2563EB", "E11D48"
def sz(v): return int(round(v * S))

hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter Black,{sz(40)},{c(WHITE)},{c(WHITE)},{c('000000')},{c('000000',0x60)},0,0,0,0,100,100,0,0,1,{sz(4.5)},{sz(2)},2,{sz(30)},{sz(30)},{sz(205)},1
Style: Pill,Inter ExtraBold,{sz(30)},{c(WHITE)},{c(WHITE)},{c(TEAL)},{c('000000',0x80)},0,0,0,0,100,100,0,0,3,{sz(11)},0,8,0,0,0,1
Style: Head,Inter Black,{sz(24)},{c(NAVY)},{c(NAVY)},{c(YEL)},{c('000000',0x80)},0,0,0,0,100,100,2,0,3,{sz(8)},0,8,0,0,0,1
Style: Card,Inter Black,{sz(34)},{c(NAVY)},{c(NAVY)},{c(WHITE)},{c('000000',0x80)},0,0,0,0,100,100,0,0,3,{sz(13)},0,8,0,0,0,1
Style: Sub,Inter ExtraBold,{sz(26)},{c(WHITE)},{c(WHITE)},{c(BLUE)},{c('000000',0x80)},0,0,0,0,100,100,0,0,3,{sz(9)},0,8,0,0,0,1
Style: Badge,Inter Black,{sz(74)},{c(WHITE)},{c(WHITE)},{c(BLUE)},{c('000000',0x80)},0,0,0,0,100,100,0,0,3,{sz(16)},0,8,0,0,0,1
Style: CTA,Inter Black,{sz(46)},{c(WHITE)},{c(WHITE)},{c(PINK)},{c('000000',0x80)},0,0,0,0,100,100,0,0,3,{sz(16)},0,5,0,0,0,1
Style: Mark,Inter Black,{sz(20)},{c(WHITE,0x30)},{c(WHITE)},{c('000000',0x90)},{c('000000',0xFF)},0,0,0,0,100,100,3,0,1,{sz(2)},0,9,{sz(16)},{sz(16)},{sz(16)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
def add(st, en, style, text, layer=1):
    if st is None or en is None or en <= st: return
    ev.append(f"Dialogue: {layer},{ts(st)},{ts(en)},{style},,0,0,0,,{text}")

POP = r"\fscx40\fscy40\t(0,110,\fscx112\fscy112)\t(110,200,\fscx100\fscy100)"
def pop(x, y, extra=""): return "{" + rf"\an8\pos({sz(x)},{sz(y)})" + POP + r"\fad(0,140)" + extra + "}"
def slide(x, y, extra=""):
    return "{" + rf"\an8\move({sz(x-160)},{sz(y)},{sz(x)},{sz(y)},0,180)\fad(120,140)" + extra + "}"
CHK = r"{\fnDejaVu Sans\c" + c(YEL) + r"}✓{\fnInter ExtraBold\c" + c(WHITE) + r"} "

# --- captions: chunks of <=3 words, active word yellow + slight pop ---
SENT_START = {"Produk", "Kami", "Kalau", "Terus", "Ini", "Lepas", "So", "Cara", "Saiz", "Nak"}
chunks, cur = [], []
for w in words:
    brk = cur and (len(cur) >= 3 or cur[-1]["seg"] != w["seg"] or cur[-1]["w"][-1:] in ",.?"
                   or w["s"] - cur[-1]["e"] > 0.35 or w["w"] in SENT_START or sum(len(x["w"]) + 1 for x in cur) + len(w["w"]) > 20)
    if brk: chunks.append(cur); cur = []
    cur.append(w)
if cur: chunks.append(cur)
for i, ch in enumerate(chunks):
    end = ch[-1]["e"]
    if i + 1 < len(chunks) and chunks[i+1][0]["s"] - end < 0.4: end = chunks[i+1][0]["s"]
    for j, w in enumerate(ch):
        st = ch[0]["s"] if j == 0 else w["s"]
        en = ch[j+1]["s"] if j + 1 < len(ch) else end
        parts = []
        for k, x in enumerate(ch):
            word = x["w"].rstrip(",.") if x["w"] not in ("penting?", "okey?") else x["w"]
            if k == j:
                col = YEL
                parts.append("{" + rf"\c{c(col)}\fscx108\fscy108" + "}" + word + "{" + rf"\c{c(WHITE)}\fscx100\fscy100" + "}")
            else:
                parts.append(word)
        intro = r"{\fad(60,0)}" if j == 0 else ""
        add(st, en, "Cap", intro + " ".join(parts), layer=5)

# --- motion graphics (anchored to source timestamps) ---
def G(clip, t0, t1, style, text, layer=2):
    a = out_t(clip, t0)
    b = out_t(clip, t1) if t1 is not None else None
    if b is None: b = seg_end_out(clip, t0)
    add(a, b, style, text, layer)
    return a

sfx = []  # (time, kind, gain)
X = 270
# HOOK
add(0.0, out_t("c2", 6.29), "Card", pop(X, 70) + "Facial Cleansing Gel", layer=2)
a = G("c2", 2.66, 6.29, "Pill", pop(X, 140) + CHK + "SEMUA JENIS KULIT"); sfx += [(a, "ding", 0.3)]
a = G("c2", 4.94, 6.29, "Pill", pop(X, 206) + CHK + "BEBAS PARABEN"); sfx += [(a, "ding", 0.3)]
sfx += [(0.0, "impact", 0.55)]
# question punch
a = out_t("c1", 4.31); sfx += [(a, "pop", 0.45)]
add(a, a + 1.25, "Badge", pop(X, 110) + "?", layer=2)
# INGREDIENTS
hd = out_t("c1", 8.96); he = out_t("c1", 25.92)
add(hd, he, "Head", "{" + rf"\an8\pos({sz(X)},{sz(78)})\fad(150,150)" + "}BAHAN UTAMA", layer=2)
sfx += [(hd, "whoosh", 0.35)]
cards = [
    ("c1", 10.18, 11.96, "Sodium Cocoyl Isethionate", None),
    ("c1", 11.96, 13.62, "Decyl Glucoside", None),
    ("c1", 13.64, 17.10, "Pembersih lembut", "dari kelapa & tumbuhan"),
    ("c1", 17.86, 19.18, "Glycerin", None),
    ("c1", 19.18, 21.52, "Panthenol", "Vitamin B5"),
    ("c1", 22.04, 23.73, "Kulit kekal lembab", None),
    ("c1", 24.30, 25.92, "Alga Ekstrak", None),
]
for clip, t0, t1, title, sub in cards:
    a = out_t(clip, t0); b = out_t(clip, t1) or seg_end_out(clip, t0)
    add(a, b, "Card", slide(X, 122) + title, layer=3)
    if sub: add(a + 0.15, b, "Sub", slide(X, 182) + sub, layer=3)
    sfx += [(a, "whoosh", 0.30)]
# HOW TO USE
hd = out_t("c2", 6.48); he = out_t("c2", 16.05)
add(hd, he, "Head", "{" + rf"\an8\pos({sz(X)},{sz(78)})\fad(150,150)" + "}CARA GUNA", layer=2)
sfx += [(hd, "whoosh", 0.35)]
steps = [(8.18, 9.38, "Pagi & malam", None), (9.38, 10.40, "1  Ambil sedikit", None),
         (10.40, 11.56, "2  Gosok sampai berbuih", None), (11.56, 13.02, "3  Urut lembut", None),
         (13.02, 14.20, "4  Bilas dengan air", None), (14.20, 16.05, "5  Tepuk sampai kering", None)]
for t0, t1, title, sub in steps:
    a = out_t("c2", t0); b = out_t("c2", t1)
    add(a, b, "Card", pop(X, 122) + title, layer=3)
    sfx += [(a, "tick", 0.5)]
# SIZE / MADE IN MY
a = G("c2", 17.10, 19.02, "Badge", pop(X, 96) + "50ml"); sfx += [(a, "pop", 0.5)]
G("c2", 17.40, 19.02, "Sub", pop(X, 214) + "Padu & travel-friendly")
a = G("c2", 19.02, 20.38, "Card", slide(X, 122) + "Senang bawa ke mana-mana"); sfx += [(a, "whoosh", 0.3)]
a = G("c2", 20.38, 22.46, "Pill", pop(X, 122, rf"\3c{c(PINK)}") + "BUATAN MALAYSIA"); sfx += [(a, "ding", 0.35)]
G("c2", 22.46, 24.53, "Sub", slide(X, 100) + "Diedarkan oleh")
a = G("c2", 22.56, 24.53, "Card", slide(X, 150) + "Hillwell Pharmaceutical"); sfx += [(a, "whoosh", 0.25)]
# SHOP
a = G("c2", 25.05, 29.74, "Card", slide(X, 112) + "Seri Lestari"); sfx += [(a, "whoosh", 0.3)]
G("c2", 25.30, 29.74, "Sub", slide(X, 176) + "Pengedar House of Healing")
G("c2", 28.40, 29.74, "Pill", pop(X, 236) + "Batu Pahat"); sfx += [(out_t("c2", 28.40), "pop", 0.35)]
# ORDER
a = G("c2", 31.14, 34.90, "Pill", pop(X, 112) + "Datang terus ke kedai"); sfx += [(a, "pop", 0.4)]
a = G("c2", 33.16, 34.90, "Pill", pop(X, 176, rf"\3c{c(BLUE)}") + "Pos seluruh Malaysia"); sfx += [(a, "pop", 0.4)]
# CTA
a = out_t("c2", 35.26)
pulse = r"\t(350,650,\fscx108\fscy108)\t(650,950,\fscx100\fscy100)\t(950,1250,\fscx108\fscy108)"
add(a, TOTAL, "CTA", "{" + rf"\an5\pos({sz(X)},{sz(150)})" + POP + pulse + "}PM KAMI SEKARANG!", layer=4)
sfx += [(a, "whoosh", 0.4), (a + 0.05, "ding", 0.35)]
# transitions: soft whoosh on clip-to-clip story jumps
for s in segs[1:]:
    pass
if PREVIEW:
    add(0, TOTAL, "Mark", "PREVIEW", layer=9)

with open(os.path.join(WORK, "captions.ass"), "w") as f:
    f.write(hdr + "\n".join(ev) + "\n")

# ---------------- SFX synthesis ----------------
rng = np.random.default_rng(7)
def env(n, att, dec):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / dec)
def onepole_lp(x, coef):
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += coef[i] * (x[i] - acc); y[i] = acc
    return y
def make(kind):
    if kind == "pop":
        n = int(0.12 * SR); t = np.arange(n) / SR
        f = 900 * np.exp(-t * 28) + 220
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.035)
    if kind == "tick":
        n = int(0.05 * SR); t = np.arange(n) / SR
        return (np.sin(2*np.pi*2400*t) * 0.6 + rng.standard_normal(n) * 0.25) * env(n, 0.0005, 0.008)
    if kind == "ding":
        n = int(0.9 * SR); t = np.arange(n) / SR
        x = sum(a * np.sin(2*np.pi*f*t) for f, a in ((1568, 1), (3136, .35), (4704, .12)))
        return x * env(n, 0.002, 0.22) * 0.6
    if kind == "whoosh":
        n = int(0.42 * SR); t = np.arange(n) / SR
        shape = np.sin(np.pi * t / t[-1]) ** 2
        coef = 0.02 + 0.25 * shape
        x = onepole_lp(rng.standard_normal(n), coef)
        x = x - onepole_lp(x, np.full(n, 0.02))  # crude highpass
        return x * shape / (np.abs(x).max() + 1e-9)
    if kind == "impact":
        n = int(0.7 * SR); t = np.arange(n) / SR
        f = 110 * np.exp(-t * 6) + 42
        boom = np.sin(2*np.pi*np.cumsum(f)/SR) * env(n, 0.003, 0.18)
        hit = onepole_lp(rng.standard_normal(n), np.full(n, 0.15)) * env(n, 0.001, 0.03) * 2
        return (boom + hit) * 0.8
    raise ValueError(kind)
bank = {k: make(k) for k in ("pop", "tick", "ding", "whoosh", "impact")}
for k in bank: bank[k] = bank[k] / (np.abs(bank[k]).max() + 1e-9)
track = np.zeros(int((TOTAL + 1.5) * SR))
for tt, kind, g in sfx:
    if tt is None: continue
    s = bank[kind]; i = int(max(0, tt - (0.12 if kind == "whoosh" else 0)) * SR)
    track[i:i+len(s)] += s[:len(track)-i] * g * 0.38
track = np.clip(track, -1, 1)[: int(TOTAL * SR)]
with wave.open(os.path.join(WORK, "sfx.wav"), "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((track * 32767).astype(np.int16).tobytes())

# ---------------- ffmpeg: per-segment render, then concat + overlay ----------------
json.dump(dict(segments=segs, total=TOTAL, sfx=[(round(a, 2), k, g) for a, k, g in sfx if a is not None]),
          open(os.path.join(WORK, "edl_out.json"), "w"), indent=1)
print(f"total {TOTAL:.2f}s, {len(segs)} segments, {len(sfx)} sfx, {len(ev)} ass events", flush=True)
segdir = os.path.join(WORK, f"segs_{W}"); os.makedirs(segdir, exist_ok=True)
lst = []
for i, s in enumerate(segs):
    dur = s["b"] - s["a"]
    z = s["z"]
    vf = "hflip"
    if isinstance(z, tuple):
        z0, z1 = z
        nfr = max(1, int(round(dur * FPS)))
        vf += (f",scale={W*2}:{H*2},zoompan=z='{z0}+({z1}-{z0})*on/{nfr}':d=1:"
               f"x='iw/2-(iw/zoom/2)':y='(ih*0.34)-(ih*0.34/zoom)':s={W}x{H}:fps={FPS}")
    else:
        if z != 1.0:
            cw, ch = int(720 / z) // 2 * 2, int(1280 / z) // 2 * 2
            cx, cy = (720 - cw) // 2, int(1280 * 0.34 * (1 - 1 / z))
            vf += f",crop={cw}:{ch}:{cx}:{cy}"
        vf += f",scale={W}:{H}:flags=lanczos"
    vf += f",fps={FPS},setsar=1"
    nfr = int(round(dur * FPS)); dur = nfr / FPS
    af = (f"aresample={SR},apad=whole_dur={dur:.4f},atrim=0:{dur:.4f},"
          f"afade=t=in:d=0.012,afade=t=out:st={dur-0.015:.4f}:d=0.015")
    o = os.path.join(segdir, f"s{i:02d}.mkv")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s['a']:.4f}", "-i", os.path.join(WORK, s["clip"] + ".mov"),
                    "-t", f"{dur + 0.2:.4f}", "-frames:v", str(nfr), "-vf", vf, "-af", af, "-c:v", "libx264", "-preset", "veryfast", "-crf", "12",
                    "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-ac", "1", "-threads", "2", o], check=True)
    lst.append(f"file '{o}'")
open(os.path.join(segdir, "list.txt"), "w").write("\n".join(lst) + "\n")
ass_path = os.path.join(WORK, "captions.ass").replace(":", r"\:")
n = len(segs)
afs = []
for k, sg in enumerate(segs):
    d = sg["b"] - sg["a"]; src = n if sg["clip"] == "c1" else n + 1
    afs.append(f"[{src}:a]atrim=start={sg['a']:.5f}:end={sg['b']:.5f},asetpts=PTS-STARTPTS,aresample={SR},"
               f"apad=whole_dur={d:.5f},atrim=0:{d:.5f},afade=t=in:d=0.012,afade=t=out:st={d-0.015:.5f}:d=0.015[a{k}]")
fc = ("".join(f"[{k}:v]" for k in range(n)) + f"concat=n={n}:v=1:a=0,setpts=N/({FPS}*TB)[vc];"
      + ";".join(afs) + ";" + "".join(f"[a{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1[ac];"
      f"[vc]ass='{ass_path}'[vo];"
      "[ac]highpass=f=80,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
      "loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000[voice];"
      f"[voice][{n+2}:a]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[ao]")
ins = []
for k in range(n): ins += ["-i", os.path.join(segdir, f"s{k:02d}.mkv")]
ins += ["-i", os.path.join(WORK, "c1.mov"), "-i", os.path.join(WORK, "c2.mov")]
cmd = ["ffmpeg", "-v", "error", "-y", *ins,
       "-i", os.path.join(WORK, "sfx.wav"), "-filter_complex", fc, "-map", "[vo]", "-map", "[ao]", "-r", str(FPS),
       "-c:v", "libx264", "-preset", "medium" if not PREVIEW else "veryfast", "-crf", "18" if not PREVIEW else "24",
       "-pix_fmt", "yuv420p", "-threads", "3", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", OUT]
subprocess.run(cmd, check=True)
print("wrote", OUT)
