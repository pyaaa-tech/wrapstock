# Seri Lestari Spa — Sains Di Sebalik Urutan Wajah

| File | Kandungan |
|---|---|
| `SeriLestari_SainsUrutanWajah_FINAL_1080x1920.mp4` | Video akhir: motion graphics, sari kata BM, muzik & SFX |
| `SeriLestari_TotokWajah_ENHANCED_ONLY_1080x1920.mp4` | Footage enhanced sahaja + suara diproses (tanpa grafik) |

## Spesifikasi
1080×1920 (9:16) · 30 fps · H.264 High (CRF 17) · yuv420p · BT.709 · AAC 48 kHz 256 kbps · 74.83 s · −14 LUFS integrated, peak −3 dBFS · faststart.

## Enhancement (FFmpeg)
- Horizontal flip untuk betulkan mirror kamera depan (banner kini boleh dibaca).
- Temporal denoise ringan (hqdn3d), upscale Lanczos dari 464×848 (bukan AI).
- Sharpening terkawal (CAS + unsharp ringan), tanpa halo.
- Colour grade: buang cast kekuningan, S-curve lembut, highlight bersih, saturasi +5%.
- Tiada stabilization (kamera tripod, drift < 0.05 px).
- Audio: declip, high-pass 80 Hz, FFT denoise, EQ (−2.5 dB @220 Hz, +2.2 dB @3.6 kHz), de-esser, compressor, loudnorm 2-pass; muzik di-duck dengan sidechain.
- Muzik & SFX disintesis sendiri (bebas hak cipta).

Motion graphics dibina dengan HyperFrames (HTML + GSAP), fon Anton + Poppins, palet #D92F78 / #FF806B / #47253F / #FFF3E8.
