"""Semakan 2: bandingkan masa muncul kapsyen / callout / wipe dengan jeda audio dan masa sebutan.
Membaca src/data/words.json + src/timeline.ts (regex ringkas) dan mencetak sisihan dalam frame."""
import json, re
FPS = 30
words = json.load(open("src/data/words.json"))
pages = json.load(open("src/data/pages.json"))
src = open("src/timeline.ts").read()
PAUSES = [(1.97, 2.49), (5.13, 6.05), (8.99, 9.68), (15.32, 15.78), (18.10, 18.70), (29.96, 30.56), (31.06, 31.58),
          (34.38, 35.07), (42.44, 43.10), (48.37, 48.95), (55.26, 55.88), (62.18, 62.82), (71.61, 72.11), (74.58, 75.07),
          (84.19, 84.80), (88.97, 89.44), (93.79, 94.39), (94.999, 95.48)]

def spoken(phrase, after=0.0):
    toks = phrase.split()
    for i in range(len(words) - len(toks) + 1):
        if words[i]["s"] < after: continue
        if all(re.sub(r"[.,?!]", "", words[i + k]["t"]).lower() == toks[k].lower() for k in range(len(toks))):
            return words[i]["s"], words[i + len(toks) - 1]["e"]
    raise KeyError(phrase)

print("== 1. Kapsyen vs jeda audio (halaman mesti bermula pada akhir jeda, +/- 3 frame) ==")
bad = 0
for a, b in PAUSES:
    nxt = min((p for p in pages if p["s"] >= b - 0.2), key=lambda p: p["s"])
    prev = max((p for p in pages if p["e"] <= a + 0.2), key=lambda p: p["e"])
    d_in = round((nxt["s"] - b) * FPS, 1); d_out = round((prev["e"] - a) * FPS, 1)
    flag = "" if abs(d_in) <= 3 and abs(d_out) <= 3 else "  <-- SEMAK"
    bad += bool(flag)
    print(f"  jeda {a:6.2f}-{b:6.2f}: perkataan terakhir tamat {d_out:+5.1f}f | halaman seterusnya mula {d_in:+5.1f}f{flag}")
print("  luar toleransi:", bad)

print("== 2. Callout vs sebutan (cincin mesti muncul dalam +/- 3 frame dari mula sebutan) ==")
calls = re.findall(r"from:\s*([\d.]+),\s*to:\s*([\d.]+),\s*rect:\s*\[[^\]]+\],\s*label:\s*\"([^\"]+)\"", src)
after = 0
bad = 0
for fr, to, label in calls:
    fr, to = float(fr), float(to)
    s, e = spoken(label.replace("\\n", " "), after=fr - 2.5)
    d = round((fr - s) * FPS, 1)
    flag = "" if abs(d) <= 3 else "  <-- SEMAK"
    bad += bool(flag)
    print(f"  {label.replace(chr(92)+'n',' '):22s} disebut {s:6.2f}-{e:6.2f} | cincin {fr:6.2f}-{to:6.2f} | beza mula {d:+5.1f}f{flag}")
print("  luar toleransi:", bad)

print("== 3. Penanda (cincin tanpa pil) vs kata kunci ==")
MARKS = [(27.52, "penapis"), (50.26, "pagi"), (50.98, "tengah hari"), (51.76, "petang"), (57.32, "nombor telefon"),
         (58.24, "nama penuh"), (59.68, "wajib"), (60.54, "emel"), (64.82, "tarikh"), (65.53, "masa"),
         (66.31, "rawatan"), (66.96, "terapis"), (67.92, "jumlah harga"), (81.34, "Nombor rujukan")]
for fr, kw in MARKS:
    s, _ = spoken(kw, after=fr - 1.5)
    assert re.search(rf"from:\s*{fr},", src), fr
    print(f"  {kw:16s} disebut {s:6.2f} | cincin {fr:6.2f} | beza {round((fr - s) * FPS, 1):+5.1f}f")

print("== 4. Tajuk langkah & lencana rel vs 'Langkah ...' ==")
for at, kw in [(9.67, "Langkah satu"), (18.7, "Langkah dua"), (35.07, "Langkah tiga"), (43.1, "Langkah empat"),
               (55.88, "Langkah lima"), (62.81, "Langkah terakhir"), (75.07, "Siap")]:
    s, _ = spoken(kw)
    print(f"  {kw:17s} disebut {s:6.2f} | tajuk/lencana {at:6.2f} | beza {round((at - s) * FPS, 1):+5.1f}f")

print("== 5. Petal wipe (12 frame) mesti berada dalam jeda antara babak ==")
starts = [float(x) for x in re.findall(r"clip: [12],\s*start: ([\d.]+),", src)][1:]
starts.append(float(re.search(r"END_CARD\s*=\s*\{\s*start:\s*([\d.]+)", src).group(1)))
GAPS = [(8.97, 9.67), (18.09, 18.70), (34.39, 35.07), (42.45, 43.10), (55.27, 55.88), (62.19, 62.81), (74.58, 75.07),
        (84.20, 84.80), (93.80, 94.38)]
for st, (a, b) in zip(starts, GAPS):
    ok = a - 0.001 <= st and st + 12 / FPS <= b + 0.001
    print(f"  wipe {st:6.2f}-{st + 0.4:6.2f} | jeda {a:6.2f}-{b:6.2f} | {'dalam jeda' if ok else 'TERKELUAR'}")
