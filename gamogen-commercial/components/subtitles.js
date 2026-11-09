/* =========================================================================
   Malay subtitles — timed to the ORIGINAL voice-over (word timestamps from
   faster-whisper, corrected spelling). Separate layer from headline system.
   ========================================================================= */
(function () {
  // [start, end, text]  — times in seconds (see project/transcript.json)
  const SUBS = [
    [0.05, 3.40, "Hai everyone! Hari ini kita bercakap tentang"],
    [3.40, 6.35, "<b>Gamogen</b> daripada House of Healin —"],
    [6.35, 9.05, "suplemen berasaskan gamat yang dirumus"],
    [9.05, 11.10, "untuk menyokong kesihatan harian anda."],
    [11.55, 13.65, "<b>Gamogen</b> menggabungkan ekstrak gamat"],
    [13.65, 16.85, "<i>Stichopus horrens</i>, yang dikenali sebagai <b>Gamodulin®</b>,"],
    [16.85, 19.50, "bersama omega-3 dan omega-6"],
    [19.50, 21.50, "daripada minyak flaxseed,"],
    [21.50, 24.20, "vitamin E, vitamin B, chlorella"],
    [24.20, 25.95, "serta beta-karotena."],
    [26.25, 29.60, "Formula ini dipasarkan sebagai sokongan untuk"],
    [29.60, 31.65, "tenaga harian, keseimbangan nutrisi,"],
    [31.65, 33.35, "dan kesejahteraan umum."],
    [33.50, 36.20, "Ekstrak gamat juga telah lama menjadi"],
    [36.20, 38.70, "sebahagian daripada tradisi kesihatan di Asia Tenggara."],
    [39.20, 42.20, "Dari segi penyelidikan, kajian oleh penyelidik"],
    [42.20, 44.75, "Universiti Sains Malaysia pada 2025"],
    [44.75, 47.90, "mendapati ekstrak <i>Stichopus horrens</i> menunjukkan"],
    [47.90, 50.45, "trend penurunan paras glukosa darah"],
    [50.45, 52.60, "dan peningkatan toleransi senaman"],
    [52.60, 54.15, "dalam model kajian haiwan."],
    [54.15, 57.95, "Namun, kajian ini adalah kajian awal pada haiwan."],
    [58.20, 60.85, "Bagi manusia, <b>Gamogen</b> perlu dilihat sebagai"],
    [60.85, 62.20, "suplemen sokongan,"],
    [62.20, 64.65, "bukan pengganti ubat atau rawatan doktor."],
    [65.30, 67.70, "<b>Gamogen</b> sesuai bagi orang dewasa"],
    [67.70, 69.95, "yang ingin menambah sokongan nutrisi harian."],
    [70.25, 72.25, "Bagi individu yang mengambil ubat,"],
    [72.25, 75.90, "mengandung, menyusu, atau mempunyai keadaan kesihatan khusus,"],
    [75.90, 78.55, "berbincanglah dengan doktor atau farmasis"],
    [78.55, 81.00, "sebelum memulakan sebarang suplemen."],
    [81.65, 84.30, "Kesihatan bermula dengan pilihan harian:"],
    [84.30, 87.55, "pemakanan seimbang, rehat mencukupi, aktiviti fizikal,"],
    [87.55, 89.60, "dan sokongan nutrisi yang sesuai."],
    [89.95, 92.25, "Jika anda ingin mencuba <b>Gamogen</b>,"],
    [92.25, 94.70, "dapatkan nasihat profesional dan gunakannya"],
    [94.70, 96.85, "sebagai sebahagian daripada gaya hidup sihat."],
    [97.05, 99.25, "<b>Gamogen</b> House of Healin —"],
    [99.25, 101.70, "sokongan untuk kesejahteraan harian anda."],
  ];

  function build(layer, tl) {
    SUBS.forEach(([s, e, txt], i) => {
      const d = document.createElement("div");
      d.className = "sub";
      d.innerHTML = `<span>${txt}</span>`;
      layer.appendChild(d);
      // continuous cues (gap < 0.1s) swap instantly; otherwise a short fade
      const prev = SUBS[i - 1], next = SUBS[i + 1];
      const fin = prev && s - prev[1] < 0.1 ? 0.08 : 0.18;
      const fout = next && next[0] - e < 0.1 ? 0.06 : 0.22;
      tl.fromTo(d, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: fin, ease: "power2.out", immediateRender: true }, s);
      tl.to(d, { autoAlpha: 0, duration: fout, ease: "power1.in" }, e - fout * 0.5);
    });
  }

  window.SUBS = { data: SUBS, build };
})();
