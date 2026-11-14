export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 3038; // 101.25 s tepat (+ 0.5 frame)

/** Zon selamat TikTok/Reels: ~340 px bawah dan ~130 px kanan dibiarkan bebas. */
export const SAFE = { left: 48, right: W - 130, top: 96, bottom: H - 340 };

/** Skrin telefon (kawasan video) dalam koordinat kanvas. Sumber dicrop 384x726. */
export const SCREEN = { x: 300, y: 112, w: 632, h: 1195 };
export const SRC = { w: 384, h: 726 };
export const K = SCREEN.w / SRC.w; // 1.6458 px kanvas setiap px sumber
export const BEZEL = 12;

export const f = (sec: number) => Math.round(sec * FPS);
