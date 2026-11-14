"""Pra-proses rakaman skrin -> public/
  rec{1,2}.mp4 : crop kandungan (buang status bar 44 px atas + bar Safari 78 px bawah),
                 CFR 30 fps, skala 384x726 -> 896x1694 (7/3x, lanczos) + unsharp ringan.
  bg{1,2}.mp4  : salinan kecil diblur kuat untuk latar (ikut klip yang sama).
rakaman_2 diredaksi dahulu (pixelate + gaussian pada kotak dijejak) SEBELUM skala,
supaya data peribadi tidak pernah masuk ke public/.
Guna: python3 scripts/preprocess.py <dir frame PNG rakaman_2 @30fps> """
import json, subprocess, sys, glob
import numpy as np, cv2

CROP = "crop=384:726:0:44"
MAIN = f"{CROP},scale=896:1694:flags=lanczos,unsharp=5:5:0.55:5:5:0.0,format=yuv420p"
BG = f"{CROP},crop=384:682:0:22,scale=216:384:flags=bicubic,gblur=sigma=10,format=yuv420p"
ENC = ["-c:v", "libx264", "-preset", "slow", "-g", "12", "-bf", "0", "-movflags", "+faststart", "-an"]

def run(cmd, **kw):
    print(" ".join(cmd[:14]), "...")
    return subprocess.run(cmd, check=True, **kw)

# --- rakaman 1 (tiada data peribadi) ---
import os
if not os.path.exists("public/rec1.mp4") or "--all" in sys.argv:
  run(["ffmpeg", "-y", "-v", "error", "-i", "assets/rakaman_1.mp4", "-filter_complex",
     f"[0:v]fps=30,split[a][b];[a]{MAIN}[m];[b]{BG}[g]",
     "-map", "[m]", *ENC, "-crf", "15", "public/rec1.mp4",
     "-map", "[g]", *ENC, "-crf", "20", "public/bg1.mp4"])

# --- rakaman 2 (redaksi dahulu) ---
# Julat rakaman_2 (saat) yang benar-benar digunakan dalam video (+ margin). Frame di luar julat ini
# (animasi tukar-aplikasi, modal "Opening WhatsApp", dll.) dikaburkan SELURUHNYA sebagai langkah berjaga-jaga.
USED = [(1.0, 15.0), (17.6, 19.92), (25.7, 29.62), (34.3, 34.94), (36.5, 40.4), (51.3, 54.9)]
frames = sorted(glob.glob(sys.argv[1] + "/*.png"))
boxes = json.load(open("scripts/privacy_final.json"))
assert len(frames) == len(boxes), (len(frames), len(boxes))
p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", "384x848",
                      "-r", "30", "-i", "-", "-filter_complex",
                      f"[0:v]split[a][b];[a]{MAIN}[m];[b]{BG}[g]",
                      "-map", "[m]", *ENC, "-crf", "15", "public/rec2.mp4",
                      "-map", "[g]", *ENC, "-crf", "20", "public/bg2.mp4"], stdin=subprocess.PIPE)
for fi, (f, bs) in enumerate(zip(frames, boxes)):
    im = cv2.imread(f, cv2.IMREAD_COLOR)
    H, W = im.shape[:2]
    if not any(a <= fi / 30.0 <= b for a, b in USED):
        small = cv2.resize(im, (W // 12, H // 12), interpolation=cv2.INTER_AREA)
        im = cv2.GaussianBlur(cv2.resize(small, (W, H), interpolation=cv2.INTER_LINEAR), (0, 0), 9)
        p.stdin.write(im.tobytes())
        continue
    for x, y, w, h in bs:
        x0, y0 = max(0, x), max(0, y)
        x1, y1 = min(W, x + w), min(H, y + h)
        if x1 <= x0 or y1 <= y0:
            continue
        roi = im[y0:y1, x0:x1]
        small = cv2.resize(roi, (max(1, (x1 - x0) // 9), max(1, (y1 - y0) // 9)), interpolation=cv2.INTER_AREA)
        up = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_LINEAR)
        up = cv2.GaussianBlur(up, (0, 0), 5)
        im[y0:y1, x0:x1] = up
    p.stdin.write(im.tobytes())
p.stdin.close()
assert p.wait() == 0
print("ok")
