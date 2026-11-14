"""Jejak kedudukan data peribadi (nama + telefon pelanggan, no. rujukan) dalam rakaman_2
melalui template matching berbilang skala. Output: scripts/privacy_boxes.json
(senarai kotak [x,y,w,h] bagi setiap frame 30 fps, koordinat sumber 384x848)."""
import sys, json, glob
import numpy as np, cv2

frames_dir = sys.argv[1]
out = sys.argv[2]
files = sorted(glob.glob(frames_dir + "/*.png"))

def load(i):
    return cv2.imread(files[i], cv2.IMREAD_GRAYSCALE)

# (nama, frame rujukan, kotak templat x0,y0,x1,y1, kotak redaksi x0,y0,x1,y1)
TPL = [
    ("review",  60,  (70, 369, 152, 406), (64, 364, 160, 410)),
    ("success", 660, (88, 517, 176, 556), (82, 512, 184, 560)),
    ("calendar", 840, (36, 564, 118, 586), (116, 560, 216, 590)),  # padan "Reference:", kabur nombor di kanan
]
SCALES = [1.0, 0.98, 0.96, 0.94, 0.92, 0.90, 0.88, 0.86, 1.02, 1.04]
THRESH = 0.55

tpls = []
for name, fi, (x0, y0, x1, y1), red in TPL:
    t = load(fi)[y0:y1, x0:x1]
    tpls.append((name, t, (x0, y0, x1, y1), red))

res = []
log = []
for i in range(len(files)):
    g = load(i)
    boxes = []
    best = {}
    for name, t, (x0, y0, x1, y1), (rx0, ry0, rx1, ry1) in tpls:
        found = None
        for s in SCALES:
            tt = t if s == 1.0 else cv2.resize(t, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
            m = cv2.matchTemplate(g, tt, cv2.TM_CCOEFF_NORMED)
            _, mx, _, loc = cv2.minMaxLoc(m)
            if found is None or mx > found[0]:
                found = (mx, loc, s)
            if s == 1.0 and mx > 0.9:
                break
        mx, (lx, ly), s = found
        best[name] = round(float(mx), 3)
        if mx >= THRESH:
            bx = lx + (rx0 - x0) * s
            by = ly + (ry0 - y0) * s
            bw = (rx1 - rx0) * s
            bh = (ry1 - ry0) * s
            boxes.append([int(bx) - 2, int(by) - 2, int(bw) + 4, int(bh) + 4, name, round(float(mx), 3), s])
    res.append(boxes)
    log.append(best)

json.dump({"boxes": res, "conf": log}, open(out, "w"))
# ringkasan
for name, *_ in TPL:
    c = np.array([l[name] for l in log])
    hit = c >= THRESH
    runs = []
    st = None
    for i, h in enumerate(hit):
        if h and st is None: st = i
        if not h and st is not None: runs.append((st, i - 1)); st = None
    if st is not None: runs.append((st, len(hit) - 1))
    print(name, "runs:", runs)
    amb = [(i, float(c[i])) for i in range(len(c)) if 0.35 <= c[i] < THRESH]
    print("  ambiguous(0.35-0.55):", len(amb), amb[:40])
