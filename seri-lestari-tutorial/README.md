# Tutorial tempahan — Seri Lestari Spa, Batu Pahat

Video menegak 9:16 (1080×1920, 30 fps, 3038 frame = 101.25 s) untuk TikTok / Reels, dibina dengan
[Remotion](https://www.remotion.dev). **Audio ialah tuan**: voiceover dimainkan 1:1 dari frame 0 dan
semua visual di-*time-remap* mengikutnya.

## Struktur

| Laluan | Kandungan |
| --- | --- |
| `assets/` | Sumber asal (tidak di-commit): `voiceover.mp3`, `rakaman_1.mp4`, `rakaman_2.mp4` |
| `scripts/preprocess.py` | Crop + redaksi privasi + skala naik rakaman → `public/rec*.mp4`, `public/bg*.mp4` |
| `scripts/track_privacy.py`, `privacy_select.py`, `verify_privacy.py` | Jejak, pilih dan sahkan kotak blur data peribadi |
| `scripts/transcribe.mjs`, `build_captions.py` | Whisper (ms) → masa perkataan → `src/data/*.json`, `public/captions.json` |
| `scripts/build_audio.sh` | Voiceover → −16 LUFS, bunyi tekan UI sintesis |
| `scripts/check_sync.py` | Laporan sisihan kapsyen / callout / wipe berbanding audio |
| `src/timeline.ts` | Satu sumber kebenaran: babak, time-remap, kamera, callout, sentuhan |
| `src/components/` | Latar, bingkai telefon, rel langkah, callout, kapsyen, kad penutup |

## Jana semula

```bash
npm i
# 1. letak voiceover.mp3, rakaman_1.mp4, rakaman_2.mp4 dalam assets/
# 2. frame rakaman_2 untuk penjejakan privasi
mkdir -p /tmp/r2 && ffmpeg -i assets/rakaman_2.mp4 -vf fps=30 -start_number 0 /tmp/r2/%05d.png
python3 scripts/track_privacy.py /tmp/r2 scripts/privacy_boxes.json
python3 scripts/privacy_select.py scripts/privacy_boxes.json scripts/privacy_final.json
python3 scripts/preprocess.py /tmp/r2 --all
# 3. audio + kapsyen
./scripts/build_audio.sh
node scripts/transcribe.mjs            # whisper.cpp (pilihan; whisper_dtw.json sudah disertakan)
python3 scripts/build_captions.py
# 4. semak + render
python3 scripts/check_sync.py
npx remotion render TutorialTempahan out/master_fullrange.mp4 --codec=h264 --crf=16
npx remotion render TutorialTempahan out/audio.wav --codec=wav
./scripts/finalize.sh                  # -> out/tutorial_tempahan_seri_lestari.mp4 (bt709, AAC, -16 LUFS)
npx remotion still TutorialTempahan out/tutorial_tempahan_seri_lestari_poster.png --frame=56
# 5. semak privasi pada output akhir
ffmpeg -ss 62.3 -t 32.2 -i out/tutorial_tempahan_seri_lestari.mp4 \
  -vf "crop=632:1195:300:112,scale=384:726:flags=area" -start_number 1869 /tmp/fin/%05d.png
python3 scripts/verify_privacy_final.py /tmp/r2 /tmp/fin
```

## Privasi

`rakaman_2.mp4` mengandungi nama pelanggan, nombor telefon dan nombor rujukan tempahan.
Redaksi (pixelate + gaussian, dijejak setiap frame melalui template matching) dibakar ke dalam
`public/rec2.mp4` **sebelum** skala naik, jadi data itu tidak pernah sampai ke Remotion.
Frame di luar julat yang digunakan dalam video dikaburkan seluruhnya.
