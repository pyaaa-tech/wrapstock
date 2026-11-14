"""Semakan privasi pada OUTPUT AKHIR: skrin telefon setiap frame babak B8–B10 (rakaman 2) dipotong
daripada mp4 akhir, dikecilkan ke skala sumber, dan dipadankan dengan templat teks peribadi ASAL
pada skala 1.0 (biasa) dan 1.3 (punch-in). Keyakinan tinggi (> 0.8) = teks kelihatan.
Guna: python3 scripts/verify_privacy_final.py <dir frame asal rakaman_2> <dir frame skrin akhir>"""
import sys, glob, os
import numpy as np, cv2
raw = sorted(glob.glob(sys.argv[1] + "/*.png")); fin = sorted(glob.glob(sys.argv[2] + "/*.png"))
g = lambda f: cv2.imread(f, cv2.IMREAD_GRAYSCALE)
TPL = {"review-nama": (60, (72, 371, 108, 387)), "review-telefon": (60, (72, 390, 150, 404)),
       "berjaya-nama": (660, (90, 520, 124, 536)), "berjaya-telefon": (660, (90, 540, 174, 553)),
       "rujukan": (840, (120, 566, 212, 584))}
tp = {}
for k, (fi, (x0, y0, x1, y1)) in TPL.items():
    t = g(raw[fi])[y0:y1, x0:x1]
    tp[k] = [t, cv2.resize(t, None, fx=1.3, fy=1.3, interpolation=cv2.INTER_CUBIC)]
# kawalan positif: templat bukan-peribadi ("Tue, Nov 17") mesti DIJUMPAI dalam output akhir
ctl = g(raw[660])[453:468, 90:150]
worst = {k: (0.0, "") for k in tp}; ctl_best = 0.0
for f in fin:
    im = g(f)
    ctl_best = max(ctl_best, float(cv2.matchTemplate(im, ctl, cv2.TM_CCOEFF_NORMED).max()))
    for k, ts in tp.items():
        for t in ts:
            m = float(cv2.matchTemplate(im, t, cv2.TM_CCOEFF_NORMED).max())
            if m > worst[k][0]: worst[k] = (m, os.path.basename(f))
print(f"kawalan positif ('Tue, Nov 17' tidak dikaburkan): {ctl_best:.2f}  (mesti tinggi)")
for k, (m, f) in worst.items():
    print(f"{k:16s}: keyakinan maksimum {m:.2f} pada frame {f[:-4]} ({int(f[:-4])/30:.2f}s)  {'OK' if m < 0.75 else 'SEMAK!'}")
