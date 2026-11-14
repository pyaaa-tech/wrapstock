"""Sahkan redaksi: padankan templat teks peribadi ASAL terhadap video yang sudah diredaksi.
Jika redaksi berkesan, keyakinan padanan mesti rendah pada SEMUA frame.
Guna: python3 scripts/verify_privacy.py <dir frame asal 384x848> <dir frame redaksi 384x726>"""
import sys, glob
import numpy as np, cv2
raw = sorted(glob.glob(sys.argv[1] + "/*.png")); red = sorted(glob.glob(sys.argv[2] + "/*.png"))
g = lambda f: cv2.imread(f, cv2.IMREAD_GRAYSCALE)
# templat teks sahaja (koordinat asal): nama, telefon (kad Review), nama, telefon (skrin berjaya), no. rujukan
TPL = {"review-nama": (60, (72, 371, 108, 387)), "review-telefon": (60, (72, 390, 150, 404)),
       "berjaya-nama": (660, (90, 520, 124, 536)), "berjaya-telefon": (90 and 660, (90, 540, 174, 553)),
       "rujukan": (840, (120, 566, 212, 584))}
tp = {k: g(raw[fi])[y0:y1, x0:x1] for k, (fi, (x0, y0, x1, y1)) in TPL.items()}
# kawalan: templat yang sama terhadap frame ASAL (mesti tinggi)
for k, (fi, _) in TPL.items():
    m = cv2.matchTemplate(g(raw[fi]), tp[k], cv2.TM_CCOEFF_NORMED).max()
    print(f"kawalan asal {k}: {m:.2f}")
worst = {k: (0, -1) for k in tp}
for i, f in enumerate(red):
    im = g(f)
    for k, t in tp.items():
        m = float(cv2.matchTemplate(im, t, cv2.TM_CCOEFF_NORMED).max())
        if m > worst[k][0]: worst[k] = (m, i)
for k, (m, i) in worst.items():
    print(f"redaksi   {k}: keyakinan maksimum {m:.2f} pada frame {i} ({i/30:.2f}s)")
