"""Circular crop of the supplied Healin logo (removes its white square background only)."""
from PIL import Image, ImageDraw, ImageFilter
im = Image.open("assets/product-images/healin_logo.png").convert("RGBA")
cx0, cy0, cx1, cy1 = 96, 96, 351, 351
S = 4
m = Image.new("L", (im.width * S, im.height * S), 0)
ImageDraw.Draw(m).ellipse([cx0 * S + 2, cy0 * S + 2, cx1 * S - 2, cy1 * S - 2], fill=255)
m = m.resize(im.size, Image.LANCZOS)
im.putalpha(m)
im = im.crop((cx0 - 1, cy0 - 1, cx1 + 1, cy1 + 1))
im.save("assets/product-images/healin_logo_circle.png")
print(im.size)
