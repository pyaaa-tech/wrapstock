# sheet.py <dir> <out_prefix> <per_sheet> <scale> [frames...]
import sys, glob, os
from PIL import Image, ImageDraw
d, outp, per, sc = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
files = sorted(glob.glob(d + "/element-*.jpeg"))
if len(sys.argv) > 5:
    want = set(int(x) for x in sys.argv[5:])
    files = [f for f in files if int(os.path.basename(f)[8:-5]) in want]
for k in range(0, len(files), per):
    ims = []
    for f in files[k:k + per]:
        im = Image.open(f)
        im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
        n = int(os.path.basename(f)[8:-5])
        ImageDraw.Draw(im).text((6, 4), f"f{n} {n/30:.2f}s", fill=(255, 255, 0))
        ims.append(im)
    sheet = Image.new("RGB", (sum(i.width for i in ims), ims[0].height))
    x = 0
    for i in ims:
        sheet.paste(i, (x, 0)); x += i.width
    sheet.save(f"{outp}_{k//per:02d}.jpg", quality=85)
print("ok")
