/**
 * Bentuk kelopak teratai buatan sendiri. Satu kelopak = dua lengkung Bezier kubik
 * (hujung tirus, perut penuh), menghala ke atas dari (0,0) ke (0,-1).
 * Roset = 8 kelopak luar + 8 kelopak dalam (berselang 22.5°) -> siluet teratai dari atas.
 */
type Pt = [number, number];
const UNIT: Pt[] = [
  [0, 0],
  [0.3, -0.16],
  [0.46, -0.6],
  [0, -1],
  [-0.46, -0.6],
  [-0.3, -0.16],
];

const tf = (
  p: Pt,
  cx: number,
  cy: number,
  len: number,
  rot: number,
  widthK: number,
): string => {
  const x = p[0] * len * widthK;
  const y = p[1] * len;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return `${(cx + x * c - y * s).toFixed(2)} ${(cy + x * s + y * c).toFixed(2)}`;
};

export const petalPath = (
  cx: number,
  cy: number,
  len: number,
  rotDeg: number,
  widthK = 1,
): string => {
  const r = (rotDeg * Math.PI) / 180;
  const q = UNIT.map((p) => tf(p, cx, cy, len, r, widthK));
  return `M ${q[0]} C ${q[1]} ${q[2]} ${q[3]} C ${q[4]} ${q[5]} ${q[0]} Z`;
};

/** Roset teratai penuh; jejari pepejal (tanpa celah) ~0.5 R. */
export const lotusRosette = (
  cx: number,
  cy: number,
  R: number,
  rotDeg: number,
): string => {
  const parts: string[] = [];
  for (let i = 0; i < 8; i++)
    parts.push(petalPath(cx, cy, R, rotDeg + i * 45, 1));
  for (let i = 0; i < 8; i++)
    parts.push(petalPath(cx, cy, R * 0.7, rotDeg + 22.5 + i * 45, 1.15));
  return parts.join(" ");
};

export const WIPE_FRAMES = 12;

/** Kemajuan wipe 0..1 -> jejari roset. Mula sebagai kuntum kecil, kemudian mekar pantas. */
export const wipeRadius = (p: number, farthest: number) => {
  const eased = Math.pow(Math.min(1, Math.max(0, p)), 1.7);
  return Math.max(0.002, eased) * (farthest / 0.5);
};

/**
 * Geometri wipe dikongsi oleh skrin telefon, latar dan kad penutup supaya ketiga-tiganya
 * membentuk SATU kuntum teratai yang sama (tepi kelopak bersambung merentasi bezel).
 * cx, cy = titik asal dalam kanvas; canvasW/H = saiz kanvas.
 */
export const wipeGeom = (
  cx: number,
  cy: number,
  p: number,
  canvasW: number,
  canvasH: number,
) => {
  const far = Math.hypot(
    Math.max(cx, canvasW - cx),
    Math.max(cy, canvasH - cy),
  );
  return { R: wipeRadius(p, far), rot: -30 + 30 * Math.min(1, Math.max(0, p)) };
};
