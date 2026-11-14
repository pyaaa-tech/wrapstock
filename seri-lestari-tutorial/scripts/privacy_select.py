"""Pilih kotak redaksi muktamad daripada hasil track_privacy.py.
Peraturan: review/success -> ambil yang paling yakin jika >= 0.70; calendar >= 0.85.
Kemudian dilasi masa: frame tanpa pengesanan dalam +/- HOLD frame daripada frame yang
dikesan mewarisi kotak jiran terdekat (dibesarkan), untuk menutup peralihan/fade."""
import json, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
N = len(d["boxes"])
HOLD = 10
sel = []
for i in range(N):
    cand = {b[4]: b for b in d["boxes"][i]}
    keep = []
    rs = [cand[k] for k in ("review", "success") if k in cand and cand[k][5] >= 0.70]
    if rs:
        b = max(rs, key=lambda b: b[5])
        keep.append(b[:4])
    if "calendar" in cand and cand["calendar"][5] >= 0.85:
        x, y, w, h = cand["calendar"][:4]
        keep.append([x, y + 6, w, h - 6])  # jangan sentuh baris "Staff:" di atasnya
    sel.append(keep)

final = []
for i in range(N):
    boxes = [list(b) for b in sel[i]]
    if not boxes:
        for dlt in range(1, HOLD + 1):
            got = []
            for j in (i - dlt, i + dlt):
                if 0 <= j < N and sel[j]:
                    for x, y, w, h in sel[j]:
                        got.append([x - 14, y - 14, w + 28, h + 28])
            if got:
                boxes = got
                break
    final.append(boxes)
json.dump(final, open(out, "w"))
runs = []; st = None
for i, b in enumerate(final):
    if b and st is None: st = i
    if not b and st is not None: runs.append((st, i - 1)); st = None
if st is not None: runs.append((st, N - 1))
print("frames with redaction:", runs)
