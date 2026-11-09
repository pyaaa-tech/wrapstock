"""Cut the real Gamogen product photo out of its white studio background.
No pixel of the product/label is altered: only an alpha channel is added.
Outputs (assets/product-images/):
  product_full.png - box + bottle together (exact photo pixels, transparent background)
  bottle.png       - bottle only. The bottle's right edge sits on white; its left edge overlaps
                     the box, so the left silhouette is mirrored from the right one (the bottle is
                     a symmetric, front-facing PET bottle).
"""
import numpy as np
from collections import deque
from PIL import Image, ImageFilter

SRC = "assets/product-images/gamogen_official.jpg"
img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(np.int16)
H, W, _ = a.shape
mn, mx = a.min(2), a.max(2)
# "background-like" pixel: very bright and nearly neutral
bgl = (mn >= 236) & ((mx - mn) <= 14)

# flood fill from the image border through background-like pixels
bg = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if bgl[y, x]: bg[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if bgl[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and bgl[ny, nx]:
            bg[ny, nx] = True; q.append((ny, nx))

fg = ~bg
# remove the "OFFICIAL STORE" store badge (top-left) - not part of the product
fg[:185, :] = False
# keep only the largest connected component (product), drop specks
lab = np.zeros((H, W), np.int32); cur = 0; sizes = {}
for y0 in range(H):
    for x0 in range(W):
        if fg[y0, x0] and lab[y0, x0] == 0:
            cur += 1; lab[y0, x0] = cur; q = deque([(y0, x0)]); n = 0
            while q:
                y, x = q.popleft(); n += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and lab[ny, nx] == 0:
                        lab[ny, nx] = cur; q.append((ny, nx))
            sizes[cur] = n
big = max(sizes, key=sizes.get)
fg = lab == big
# fill interior holes (bright highlights fully enclosed by the product)
inv = ~fg; hole = np.zeros((H, W), bool); q = deque()
for x in range(W):
    for y in (0, H - 1):
        if inv[y, x] and not hole[y, x]: hole[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if inv[y, x] and not hole[y, x]: hole[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and inv[ny, nx] and not hole[ny, nx]:
            hole[ny, nx] = True; q.append((ny, nx))
fg = ~hole

# soft anti-aliased edge: slight blur of the hard mask, then keep interior opaque
m = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
alpha = np.asarray(m).astype(np.float32)
alpha = np.clip((alpha - 40) * 255 / 175, 0, 255)
alpha[fg & (np.asarray(Image.fromarray((fg*255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))) > 0)] = 255

def save(mask_alpha, box, path, scale=2):
    rgba = np.dstack([np.asarray(img), mask_alpha.astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA").crop(box)
    # gentle Lanczos upscale for 1080x1920 output; label pixels are resampled only, never edited
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(path, optimize=True)
    print(path, out.size)

ys, xs = np.where(alpha > 0)
save(alpha, (xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5), "assets/product-images/product_full.png")

# ---- bottle only -------------------------------------------------------
# rows of the bottle: find right edge (bottle stands right of the box)
right = np.full(H, -1)
for y in range(H):
    idx = np.where(fg[y])[0]
    if len(idx): right[y] = idx.max()


AXIS = 618.5          # vertical symmetry axis of the bottle (measured from cap collar & body edges)
TOP, BOT = 246, 948   # bottle rows
rr = right.astype(np.float32).copy()
# median-smooth the right silhouette to avoid jaggies
sm = rr.copy()
for y in range(TOP, BOT):
    w = rr[max(TOP, y - 2):min(BOT, y + 3)]; w = w[w > 0]
    sm[y] = np.median(w) if len(w) else -1
bm = np.zeros((H, W), np.float32)
xs_ = np.arange(W, dtype=np.float32)
for y in range(TOP, BOT):
    if sm[y] <= AXIS: continue
    r = sm[y] + 0.5; l = 2 * AXIS - r + 3.0  # inset: avoid the dark box panel bleeding in
    # anti-aliased span [l, r]
    bm[y] = np.clip(xs_ - l + 0.5, 0, 1) * np.clip(r - xs_ + 0.5, 0, 1)
bm = np.minimum(bm * 255, alpha)            # respect the true photo edge on the right/bottom
bm_img = Image.fromarray(bm.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
bm = np.asarray(bm_img).astype(np.float32)
ys, xs = np.where(bm > 8)
save(bm, (xs.min() - 3, ys.min() - 3, xs.max() + 4, ys.max() + 4), "assets/product-images/bottle.png")
