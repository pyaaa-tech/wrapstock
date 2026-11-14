import { Easing, interpolate, spring } from "remotion";
import { FPS, K, f } from "./geometry";
import { WIPE_FRAMES } from "./petal";

/**
 * SEMUA masa di bawah dalam saat.
 *   c = masa komposisi (ikut voiceover, tuan), s = masa sumber dalam rakaman.
 * Koordinat callout/sentuhan dalam px sumber selepas crop (384 x 726).
 * Masa sebutan diambil daripada src/data/words.json (Whisper DTW + jeda sebenar).
 */

export type Seg = {
  c0: number;
  c1: number;
  s0: number;
  s1: number;
  /** speed ramp (eased) + motion trail */
  ramp?: boolean;
  /** label kelajuan, cth "5×" */
  label?: string;
};

export type Scene = {
  id: string;
  clip: 1 | 2;
  /** masa komposisi wipe-masuk bermula */
  start: number;
  /** titik asal petal wipe (titik tekan terakhir babak sebelumnya), px sumber */
  origin: [number, number];
  segs: Seg[];
};

export const SCENES: Scene[] = [
  {
    // B1 0–8.97: halaman utama -> tatal -> About ("Book now" / "Book an Appointment")
    id: "B1-utama",
    clip: 1,
    start: 0,
    origin: [192, 363],
    segs: [
      { c0: 0, c1: 2.4, s0: 0.4, s1: 2.8 },
      { c0: 2.4, c1: 5.5, s0: 2.8, s1: 10.7, ramp: true },
      { c0: 5.5, c1: 8.95, s0: 10.7, s1: 13.5 },
      { c0: 8.95, c1: 9.5, s0: 13.5, s1: 13.9 },
    ],
  },
  {
    // B2 9.67–12.22 + B3 12.64–18.09: skrin Option (rakaman berterusan, tiada wipe di antara)
    id: "B2-B3-option",
    clip: 1,
    start: 9.03,
    origin: [123, 408],
    segs: [
      { c0: 9.03, c1: 18.17, s0: 14.95, s1: 22.8 },
      { c0: 18.17, c1: 18.65, s0: 22.8, s1: 23.17 },
    ],
  },
  {
    // B4 18.70–34.39: Service
    id: "B4-service",
    clip: 1,
    start: 18.2,
    origin: [192, 291],
    segs: [
      { c0: 18.2, c1: 23.75, s0: 23.2, s1: 26.5 }, // senarai "All" (facial)
      { c0: 23.75, c1: 25.15, s0: 26.5, s1: 31.0, ramp: true, label: "3×" }, // bath therapy
      { c0: 25.15, c1: 26.15, s0: 40.4, s1: 43.6, ramp: true, label: "3×" }, // rambut
      { c0: 26.15, c1: 27.2, s0: 47.9, s1: 51.2, ramp: true, label: "3×" }, // kuku
      { c0: 27.2, c1: 29.95, s0: 31.0, s1: 36.0 }, // penapis kategori (punch-in)
      { c0: 29.95, c1: 31.6, s0: 57.4, s1: 59.5 }, // kembali ke "All"
      { c0: 31.6, c1: 32.0, s0: 59.5, s1: 60.2 }, // tekan FACIAL GLOW @ s 60.2
      { c0: 32.0, c1: 34.2, s0: 60.2, s1: 62.1 },
      { c0: 34.2, c1: 34.95, s0: 63.65, s1: 64.2 }, // tekan Continue @ s 63.85
    ],
  },
  {
    // B5 35.07–42.45: Staff
    id: "B5-staff",
    clip: 1,
    start: 34.5,
    origin: [193, 682],
    segs: [
      { c0: 34.5, c1: 36.3, s0: 64.45, s1: 65.9 },
      { c0: 36.3, c1: 37.1, s0: 67.9, s1: 68.67 }, // tekan NADIA @ s 68.67
      { c0: 37.1, c1: 38.0, s0: 68.67, s1: 69.5 },
      { c0: 38.0, c1: 42.5, s0: 69.5, s1: 70.02 },
      { c0: 42.5, c1: 43.05, s0: 70.02, s1: 70.42 }, // tekan Continue @ s 70.07
    ],
  },
  {
    // B6 43.10–55.27: Time
    id: "B6-time",
    clip: 1,
    start: 42.6,
    origin: [193, 657],
    segs: [
      { c0: 42.6, c1: 45.9, s0: 70.6, s1: 72.6 },
      { c0: 45.9, c1: 47.7, s0: 79.5, s1: 89.3, ramp: true, label: "5×" }, // tarikh tiada slot
      { c0: 47.7, c1: 48.9, s0: 89.3, s1: 92.3 }, // 18 -> 17, slot muncul
      { c0: 48.9, c1: 51.3, s0: 92.3, s1: 95.1 }, // pagi / tengah hari (punch-in)
      { c0: 51.3, c1: 51.75, s0: 95.1, s1: 95.85 }, // tatal ke EVENING
      { c0: 51.75, c1: 53.1, s0: 95.85, s1: 98.2 }, // tekan 1:00 PM @ s 98.2
      { c0: 53.1, c1: 55.3, s0: 98.2, s1: 99.15 },
      { c0: 55.3, c1: 55.85, s0: 99.15, s1: 99.68 }, // tekan Continue @ s 99.17
    ],
  },
  {
    // B7 55.88–62.19: Details
    id: "B7-details",
    clip: 1,
    start: 55.4,
    origin: [193, 670],
    segs: [
      { c0: 55.4, c1: 59.15, s0: 100.0, s1: 101.45 },
      { c0: 59.15, c1: 62.8, s0: 105.97, s1: 106.55 }, // ralat "Mobile number is required."
    ],
  },
  {
    // B8 62.81–74.58: Review (rakaman 2, data peribadi sudah diredaksi)
    id: "B8-review",
    clip: 2,
    start: 62.3,
    origin: [183, 541],
    segs: [
      { c0: 62.3, c1: 68.9, s0: 1.1, s1: 3.65 },
      { c0: 68.9, c1: 69.9, s0: 3.65, s1: 5.2 },
      { c0: 69.9, c1: 70.75, s0: 5.2, s1: 5.6 }, // tekan Booking note @ s 5.6
      { c0: 70.75, c1: 72.25, s0: 5.6, s1: 14.75, ramp: true, label: "6×" }, // menaip nota
      { c0: 72.25, c1: 74.55, s0: 17.7, s1: 19.4 },
      { c0: 74.55, c1: 75.1, s0: 19.4, s1: 19.9 }, // tekan Confirm Booking @ s 19.4
    ],
  },
  {
    // B9 75.07–84.20: berjaya + Add to Calendar
    id: "B9-berjaya",
    clip: 2,
    start: 74.63,
    origin: [193, 679],
    segs: [
      { c0: 74.63, c1: 79.15, s0: 25.85, s1: 26.62 },
      { c0: 79.15, c1: 79.65, s0: 26.62, s1: 27.2 }, // tekan Add to Calendar @ s 26.62
      { c0: 79.65, c1: 84.8, s0: 27.2, s1: 29.6 },
    ],
  },
  {
    // B10 84.80–93.80: Location (Google Maps dipendekkan) + Contact Outlet
    id: "B10-lokasi",
    clip: 2,
    start: 84.3,
    origin: [352, 28],
    segs: [
      { c0: 84.3, c1: 87.3, s0: 34.42, s1: 34.9 },
      // tekan Location @ c 87.28. Animasi tukar-aplikasi (s 34.95–36.5 & 50.8–51.3) SENGAJA dibuang:
      // kad pelanggan bergerak semasa animasi itu, jadi frame tersebut dikaburkan penuh dalam pra-proses.
      { c0: 87.3, c1: 87.5, s0: 34.9, s1: 34.93 },
      { c0: 87.5, c1: 89.25, s0: 37.0, s1: 40.3 }, // Google Maps (~1.9x)
      { c0: 89.25, c1: 92.65, s0: 51.4, s1: 53.08 },
      { c0: 92.65, c1: 94.4, s0: 53.08, s1: 54.7 }, // tekan Contact Outlet @ s 53.08
    ],
  },
];

/** B11: kad penutup (wipe-masuk dari butang Contact Outlet). */
export const END_CARD = {
  start: 93.87,
  origin: [273, 658] as [number, number],
};

const RAMP_A = 0.6; // 0 = linear, 1 = smoothstep penuh

export const segAt = (scene: Scene, c: number): Seg => {
  const { segs } = scene;
  for (const g of segs) if (c >= g.c0 && c < g.c1) return g;
  return c < segs[0].c0 ? segs[0] : segs[segs.length - 1];
};

/** masa komposisi -> masa sumber (time remap; suara tidak pernah disentuh) */
export const srcTime = (scene: Scene, c: number): number => {
  const g = segAt(scene, c);
  if (c <= g.c0) return g.s0;
  if (c >= g.c1) return g.s1 + (c - g.c1); // 1x selepas segmen terakhir
  const u = (c - g.c0) / (g.c1 - g.c0);
  const e = g.ramp ? (1 - RAMP_A) * u + RAMP_A * (u * u * (3 - 2 * u)) : u;
  return g.s0 + (g.s1 - g.s0) * e;
};

export const sceneIndexAt = (frame: number): number => {
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++)
    if (frame >= f(SCENES[i].start)) idx = i;
  return idx;
};

/** kemajuan wipe-masuk babak i pada frame (0..1; >=1 = selesai) */
export const wipeProgress = (startSec: number, frame: number) =>
  (frame - f(startSec)) / WIPE_FRAMES;

// ---------------------------------------------------------------- kamera
export type Punch = {
  tIn: number;
  tOut: number;
  outDur: number;
  win: [number, number];
};
/** Punch-in 1.0 -> 1.3 pada EMPAT tempat sahaja. win = bucu kiri-atas tetingkap (px sumber) pada zum penuh. */
export const PUNCHES: Punch[] = [
  { tIn: 27.3, tOut: 29.7, outDur: 1.0, win: [0, 70] }, // B4 penapis kategori
  { tIn: 48.95, tOut: 52.25, outDur: 1.0, win: [0, 167] }, // B6 slot masa
  { tIn: 57.1, tOut: 61.3, outDur: 1.0, win: [8, 150] }, // B7 medan Details
  { tIn: 78.24, tOut: 79.2, outDur: 1.1, win: [44, 167] }, // B9 butang Add to Calendar
];

export type Cam = { z: number; tx: number; ty: number };
export const cameraAt = (frame: number): Cam => {
  for (const p of PUNCHES) {
    const a = f(p.tIn);
    const b = f(p.tOut);
    const end = b + Math.round(p.outDur * FPS);
    if (frame < a || frame > end) continue;
    const pin = spring({
      frame: frame - a,
      fps: FPS,
      config: { damping: 200 },
      durationInFrames: 12,
    });
    const pout = interpolate(frame, [b, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.45, 0, 0.2, 1),
    });
    const prog = pin * (1 - pout);
    const z = 1 + 0.3 * prog;
    return { z, tx: -prog * p.win[0] * K * z, ty: -prog * p.win[1] * K * z };
  }
  return { z: 1, tx: 0, ty: 0 };
};

/** px sumber -> px skrin telefon (selepas kamera) */
export const toScreen = (cam: Cam, x: number, y: number): [number, number] => [
  x * K * cam.z + cam.tx,
  y * K * cam.z + cam.ty,
];

// ---------------------------------------------------------------- callout
export type Callout = {
  from: number;
  to: number;
  /** x0, y0, x1, y1 px sumber */
  rect: [number, number, number, number];
  /** teks butang asal -> pil maroon di margin kiri + garisan pemimpin */
  label?: string;
  /** tag kecil (terjemahan) di sebelah kanan cincin */
  tag?: string;
  /** y pil dalam kanvas (lalai: tengah sasaran) */
  pillY?: number;
  /** jejari bucu sasaran, px sumber */
  r?: number;
  /** garisan pemimpin masuk dari bawah sasaran (elak melintasi butang jiran) */
  fromBelow?: boolean;
  /** tag diletak di atas-kanan cincin (dalam skrin) dan bukan di sebelah kanan */
  tagAbove?: boolean;
};

export const CALLOUTS: Callout[] = [
  // --- sasaran sentuhan (pil + garisan pemimpin) ---
  { from: 6.36, to: 7.22, rect: [14, 692, 372, 724], label: "Book now", r: 22 },
  {
    from: 7.66,
    to: 8.97,
    rect: [22, 388, 224, 428],
    label: "Book an\nAppointment",
    r: 20,
  },
  {
    from: 14.22,
    to: 15.5,
    rect: [16, 192, 372, 390],
    label: "One Pax Only",
    r: 12,
  },
  {
    from: 17.2,
    to: 18.15,
    rect: [16, 408, 372, 606],
    label: "Multi Pax",
    r: 12,
  },
  {
    from: 33.66,
    to: 34.45,
    rect: [30, 660, 356, 704],
    label: "Continue",
    r: 12,
  },
  {
    from: 38.96,
    to: 40.7,
    rect: [16, 192, 186, 318],
    label: "Any staff",
    r: 12,
    pillY: 640,
  },
  {
    from: 54.56,
    to: 55.35,
    rect: [30, 646, 356, 694],
    label: "Continue",
    r: 12,
  },
  {
    from: 73.46,
    to: 74.6,
    rect: [34, 656, 352, 702],
    label: "Confirm Booking",
    r: 12,
  },
  {
    from: 78.24,
    to: 79.08,
    rect: [34, 564, 351, 604],
    label: "Add to Calendar",
    r: 10,
  },
  {
    from: 86.52,
    to: 87.32,
    rect: [34, 640, 188, 676],
    label: "Location",
    r: 10,
  },
  {
    from: 91.76,
    to: 92.68,
    rect: [196, 640, 351, 676],
    label: "Contact Outlet",
    r: 10,
    fromBelow: true,
  },
  // --- penanda (cincin sahaja) ---
  { from: 27.52, to: 29.9, rect: [10, 190, 374, 234], r: 20 }, // penapis kategori
  { from: 50.26, to: 51.3, rect: [26, 265, 86, 285], tag: "pagi", r: 6 },
  {
    from: 50.98,
    to: 51.3,
    rect: [26, 487, 104, 507],
    tag: "tengah hari",
    r: 6,
  },
  { from: 51.76, to: 52.5, rect: [26, 546, 94, 566], tag: "petang", r: 6 },
  { from: 57.32, to: 59.1, rect: [36, 228, 348, 284], r: 12 }, // nombor telefon
  { from: 58.24, to: 59.1, rect: [36, 346, 348, 400], r: 12 }, // nama penuh
  { from: 59.68, to: 60.45, rect: [12, 257, 168, 276], r: 6 }, // "wajib" -> mesej ralat
  {
    from: 60.54,
    to: 62.2,
    rect: [14, 420, 352, 474],
    tag: "pilihan",
    tagAbove: true,
    r: 12,
  }, // emel
  { from: 64.82, to: 68.85, rect: [50, 270, 208, 291], r: 6 }, // tarikh
  { from: 65.53, to: 68.85, rect: [52, 290, 172, 307], r: 6 }, // masa
  { from: 66.31, to: 68.85, rect: [40, 402, 202, 423], r: 6 }, // rawatan
  { from: 66.96, to: 68.85, rect: [40, 482, 98, 501], r: 6 }, // terapis
  { from: 67.92, to: 68.85, rect: [272, 610, 358, 644], r: 8 }, // jumlah harga
  { from: 70.42, to: 70.75, rect: [34, 480, 350, 566], r: 10 }, // Booking note
  { from: 81.34, to: 84.25, rect: [30, 522, 222, 548], r: 6 }, // nombor rujukan (dikaburkan)
];

// ---------------------------------------------------------------- sentuhan (riak + bunyi klik)
export const TAPS: { c: number; at: [number, number] }[] = [
  { c: 8.9, at: [123, 408] }, // Book an Appointment
  { c: 18.17, at: [192, 291] }, // One Pax Only
  { c: 23.76, at: [118, 212] }, // cip BATH THERAPHY
  { c: 31.98, at: [150, 278] }, // FACIAL GLOW (BASIC)
  { c: 34.38, at: [193, 682] }, // Continue
  { c: 37.08, at: [284, 255] }, // NADIA
  { c: 42.55, at: [193, 657] }, // Continue
  { c: 47.73, at: [268, 190] }, // tarikh 18
  { c: 48.41, at: [192, 213] }, // tarikh 17
  { c: 53.08, at: [192, 276] }, // 1:00 PM
  { c: 55.31, at: [193, 670] }, // Continue
  { c: 70.72, at: [192, 523] }, // Booking note
  { c: 74.53, at: [193, 679] }, // Confirm Booking
  { c: 79.13, at: [192, 584] }, // Add to Calendar
  { c: 84.25, at: [352, 28] }, // tanda semak helaian kalendar
  { c: 87.28, at: [111, 658] }, // Location
  { c: 92.63, at: [273, 658] }, // Contact Outlet
];

// ---------------------------------------------------------------- rel langkah & tajuk
export const STEPS = [
  { at: 9.67, name: "Pilihan" },
  { at: 18.7, name: "Rawatan" },
  { at: 35.07, name: "Terapis" },
  { at: 43.1, name: "Masa" },
  { at: 55.88, name: "Butiran" },
  { at: 62.81, name: "Semakan" },
];
export const RAIL_IN = 4.19; // "enam langkah"
export const ALL_DONE = 75.07; // "Siap!"

export const TITLES = [
  {
    from: -0.5,
    to: 3.5,
    text: "Cara tempah",
  } /* bermula sebelum frame 0 supaya frame pertama sudah bertajuk */,
  { from: 9.67, to: 12.1, text: "Langkah 1" },
  { from: 18.7, to: 21.0, text: "Langkah 2" },
  { from: 35.07, to: 37.6, text: "Langkah 3" },
  { from: 43.1, to: 45.6, text: "Langkah 4" },
  { from: 55.88, to: 58.3, text: "Langkah 5" },
  { from: 62.81, to: 65.3, text: "Langkah 6" },
  { from: 75.07, to: 77.5, text: "Siap!" },
];
