"""Bina masa perkataan muktamad untuk kapsyen.
Sumber: whisper.cpp v1.7.4 (model medium, -l ms, --dtw medium) -> scripts/whisper_dtw.json
Pembetulan:
  1. Teks dibetulkan mengikut skrip (ejaan jenama + nama butang asal), masa dikekalkan.
  2. Hujung perkataan = t_dtw token huruf terakhir - 0.07 s (DTW lewat ~70 ms berbanding senyap sebenar).
  3. Sempadan yang jatuh berhampiran jeda sebenar (dikesan daripada tenaga audio) di-snap:
     perkataan sebelum tamat pada mula jeda, perkataan selepas bermula pada akhir jeda.
Output: src/data/words.json, src/data/pages.json, public/captions.json (format Caption Remotion)."""
import json, wave, re, sys
import numpy as np

FPS = 30
DUR = 101.25

# ---------- 1. token -> perkataan ----------
d = json.load(open("scripts/whisper_dtw.json"))
words = []
for seg in d["transcription"]:
    for t in seg["tokens"]:
        tx = t["text"]
        if tx.startswith("[_"):
            continue
        dtw = t.get("t_dtw", -1) / 100.0
        if tx.startswith(" ") or not words:
            words.append({"raw": tx.strip(), "toks": [(tx, dtw)]})
        else:
            words[-1]["raw"] += tx
            words[-1]["toks"].append((tx, dtw))
for w in words:
    alnum = [dt for tx, dt in w["toks"] if re.search(r"[A-Za-z0-9]", tx)]
    w["rawEnd"] = (alnum[-1] if alnum else w["toks"][-1][1])

# ---------- 2. teks dibetulkan + halaman kapsyen ----------
# "/" = baris baharu, "|" = halaman baharu, [..] = istilah butang (pil)
SCRIPT = """
Nak tempah rawatan / di Seri Lestari Spa? | Mudah saja. | Ikut enam langkah ini. |
Tekan [Book now] atau / [Book an Appointment]. |
Langkah satu, pilih / untuk berapa orang. | Untuk diri sendiri, / pilih [One Pax Only]. |
Untuk berkumpulan, / pilih [Multi Pax]. |
Langkah dua, / pilih rawatan. | Ada lebih / seratus pilihan | daripada facial, / bath therapy |
hingga rawatan / rambut dan kuku. | Guna penapis / di atas | untuk cari dengan / lebih cepat. |
Dah jumpa? | Pilih rawatan itu, | kemudian tekan / [Continue]. |
Langkah tiga, pilih / terapis pilihan anda. | Atau pilih [Any staff] | dan sistem / akan pilihkan |
yang paling / awal tersedia. |
Langkah empat, / pilih tarikh dan masa. | Kalau tarikh itu / tiada slot, | cuba tarikh lain. |
Masa dibahagikan / kepada pagi, | tengah hari / dan petang. | Pilih yang sesuai, |
kemudian tekan / [Continue]. |
Langkah lima, / isi nombor telefon | dan nama penuh. | Dua-dua wajib, | emel pula / pilihan saja. |
Langkah terakhir, | semak semula / tarikh, masa, | rawatan, terapis / dan jumlah harga. |
Nak tinggalkan / pesanan? | Tulis di / [Booking note]. | Semua betul? | Tekan [Confirm Booking]. |
Siap! | Tempahan anda / berjaya! | Tekan [Add to Calendar] | untuk simpan dalam / kalendar telefon. |
Nombor rujukan / tempahan pun ada | dalam nota / kalendar itu. |
Tak pasti / jalan ke spa? | Tekan [Location] | dan Google Maps / akan terbuka. |
Nak bertanya atau / ubah tempahan? | Tekan [Contact Outlet] | atau WhatsApp kami. |
Mudah kan? | Klik pautan / tempahan di bio | dan jumpa kami / di Seri Lestari Spa | Batu Pahat. | Jumpa nanti!
"""
flat = []   # (text, pill_id|None, page, line)
pages_struct = []
pill_id = 0
for pi, page in enumerate(SCRIPT.strip().split("|")):
    lines = []
    for li, line in enumerate(page.strip().split("/")):
        in_pill = False
        for tok in line.split():
            start_p = tok.startswith("[")
            if start_p:
                pill_id += 1
                in_pill = True
            text = tok.strip("[]").replace("]", "")
            text = re.sub(r"\]", "", text)
            # tanda baca selepas "]" (cth "Continue].") kekal pada perkataan
            clean = tok.replace("[", "").replace("]", "")
            flat.append({"t": clean, "pill": pill_id if in_pill else None, "page": pi, "line": li})
            if "]" in tok:
                in_pill = False
assert len(flat) == len(words), (len(flat), len(words))

# ---------- 3. jeda sebenar daripada tenaga ----------
w = wave.open("scripts/voiceover16k.wav")
sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
hop, win = int(sr * 0.005), int(sr * 0.02)
n = (len(x) - win) // hop
db = np.array([20 * np.log10(np.sqrt(np.mean(x[i * hop:i * hop + win] ** 2)) + 1e-9) for i in range(n)])
sil = db < -42
pauses = []
st = None
for i, s in enumerate(sil):
    if s and st is None:
        st = i
    if not s and st is not None:
        a, b = st * 0.005 + 0.01, i * 0.005 + 0.01
        if b - a >= 0.09:
            pauses.append((round(a, 3), round(b, 3)))
        st = None
# gabung jeda yang hanya dipisahkan < 40 ms
merged = []
for a, b in pauses:
    if merged and a - merged[-1][1] < 0.04:
        merged[-1] = (merged[-1][0], b)
    else:
        merged.append((a, b))
pauses = merged
speech_start = next(i for i, s in enumerate(sil) if not s) * 0.005
speech_end = (len(sil) - 1 - next(i for i, s in enumerate(sil[::-1]) if not s)) * 0.005 + 0.02

# ---------- 4. sempadan ----------
N = len(words)
ends = [w["rawEnd"] - 0.05 for w in words]
starts = [0.0] * N
snap = [None] * N
# setiap jeda (yang panjang dahulu) mengambil sempadan perkataan yang paling hampir
for ps, pe in sorted(pauses, key=lambda p: -(p[1] - p[0])):
    dur = pe - ps
    best = None
    for i in range(N - 1):
        if snap[i]:
            continue
        b = ends[i]
        dist = 0 if ps <= b <= pe else min(abs(b - ps), abs(b - pe))
        ok = (dur >= 0.15 and dist <= 0.18) or (dur >= 0.09 and dist <= 0.05)
        if ok and (best is None or dist < best[0]):
            best = (dist, i)
    if best:
        snap[best[1]] = (ps, pe)
starts[0] = round(speech_start, 3)
for i in range(N - 1):
    if snap[i]:
        ends[i] = snap[i][0]
        starts[i + 1] = snap[i][1]
    else:
        starts[i + 1] = ends[i]
ends[-1] = speech_end
# monotonic + tempoh minimum
for i in range(N):
    if ends[i] < starts[i] + 0.06:
        ends[i] = starts[i] + 0.06
        if i + 1 < N and starts[i + 1] < ends[i] and not snap[i]:
            starts[i + 1] = ends[i]

out_words = []
for i in range(N):
    f = flat[i]
    out_words.append({"i": i, "t": f["t"], "s": round(starts[i], 3), "e": round(ends[i], 3),
                      "pill": f["pill"], "page": f["page"], "line": f["line"]})
json.dump(out_words, open("src/data/words.json", "w"), ensure_ascii=False, indent=0)

pages = {}
for wd in out_words:
    p = pages.setdefault(wd["page"], {"words": [], "s": wd["s"]})
    p["words"].append(wd["i"])
    p["e"] = wd["e"]
page_list = [pages[k] for k in sorted(pages)]
json.dump(page_list, open("src/data/pages.json", "w"), indent=0)

caps = [{"text": (" " if i else "") + wd["t"], "startMs": int(round(wd["s"] * 1000)), "endMs": int(round(wd["e"] * 1000)),
         "timestampMs": int(round((wd["s"] + wd["e"]) * 500)), "confidence": None} for i, wd in enumerate(out_words)]
json.dump(caps, open("public/captions.json", "w"), ensure_ascii=False, indent=1)

# ---------- 5. laporan ----------
USER_PAUSES = [(1.97, 2.49), (5.13, 6.05), (8.99, 9.68), (15.32, 15.78), (18.10, 18.70), (29.96, 30.56), (31.06, 31.58),
               (34.38, 35.07), (42.44, 43.10), (48.37, 48.95), (55.26, 55.88), (62.18, 62.82), (71.61, 72.11), (74.58, 75.07),
               (84.19, 84.80), (88.97, 89.44), (93.79, 94.39), (94.999, 95.48)]
print("jeda dikesan:", len(pauses), "| sempadan di-snap:", sum(1 for s in snap if s))
print("semakan jeda pengguna (perkataan sebelum -> selepas):")
for a, b in USER_PAUSES:
    i = max(k for k in range(N) if out_words[k]["s"] < (a + b) / 2)
    wa, wb = out_words[i], out_words[min(i + 1, N - 1)]
    print(f"  {a:6.2f}-{b:6.2f}  '{wa['t']}' tamat {wa['e']:.2f} (d={wa['e']-a:+.2f}) | '{wb['t']}' mula {wb['s']:.2f} (d={wb['s']-b:+.2f})")
if "-v" in sys.argv:
    print(" ".join(f"{w['t']}@{w['s']:.2f}" for w in out_words))
print("halaman:", len(page_list), "| aksara terpanjang sebaris:",
      max(len(" ".join(out_words[i]["t"] for i in p["words"] if out_words[i]["line"] == l)) for p in page_list for l in (0, 1)))
