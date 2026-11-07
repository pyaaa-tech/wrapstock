# Video promo Claude (3D, ~19 saat)

Video pendek bergaya sinematik 3D (landskap 1920×1080 dan potret 1080×1920): logo spark Claude, keluarga model Claude
(Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.1) dan kelebihan pelan Claude Pro.

**Fail siap:**

| Fail | Keterangan |
|---|---|
| `claude-promo.mp4` | Video + muzik/kesan bunyi (H.264, 60fps, AAC) |
| `claude-promo-tanpa-audio.mp4` | Video sahaja, untuk letak muzik sendiri |
| `claude-promo-potret.mp4` | Versi potret 9:16 (1080×1920) untuk TikTok / Reels / Shorts, dengan audio |
| `claude-promo-potret-tanpa-audio.mp4` | Versi potret, video sahaja |

## Papan cerita

| Masa | Babak |
|---|---|
| 0.0 – 4.2 s | Sinar-sinar 3D terbang & bercantum jadi logo spark → kilauan cahaya → "Claude" |
| 4.2 – 5.2 s | Kamera menembusi logo (warp / hyperspace) |
| 5.2 – 11.0 s | 4 kad kaca 3D: Haiku → Sonnet → Opus → Fable, setiap satu disorot dengan warna sendiri, bar kelajuan/kecerdasan |
| 11.0 – 12.3 s | Kad terbelah, kamera meluncur ke babak seterusnya |
| 12.3 – 16.0 s | "Claude Pro": spark dengan gelang orbit emas + 4 kelebihan muncul dari spark |
| 16.0 – 19.2 s | Semua kembali ke spark, putaran penuh, "Claude · Fikir lebih dalam. Cipta lebih hebat." |

Dalam versi potret, kad model disusun dalam grid 2×2 (kamera melawat setiap kad mengikut corak Z)
dan kelebihan Claude Pro disusun menegak di bawah logo.

## Ubah teks

Semua teks ada dalam `content.js` (nama model, tagline, kelebihan Pro). Ubah dan render semula.

> Semak senarai kelebihan Claude Pro di <https://claude.com/pricing> sebelum terbit;
> ciri pelan boleh berubah.

## Render semula

Perlu Node 18+, Chromium Playwright, ffmpeg, Python 3 + numpy + scipy.

```bash
npm install
node render.mjs --stills 3.4,6,14          # pratonton (out/stills/*.jpg)
node render.mjs --fps 60 --workers 3       # video → out/video_silent.mp4
node render.mjs --portrait --fps 60 --workers 3   # potret → out/video_silent_portrait.mp4
python3 audio.py out/soundtrack.wav        # muzik & kesan bunyi
ffmpeg -i out/video_silent.mp4 -i out/soundtrack.wav -c:v copy -c:a aac -b:a 256k -shortest claude-promo.mp4
```

Teknik: Three.js (MeshPhysicalMaterial, peta persekitaran studio berwarna, bloom, aberasi kromatik,
grain filem), dirender bingkai demi bingkai secara deterministik dalam Chromium tanpa kepala.
