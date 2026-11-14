/**
 * DESIGN TOKENS — single source of truth for both outputs (Remotion MP4 + HTML site).
 * Project: Seri Lestari Spa — "Denyut → Tenang" (Throb → Calm)
 */
export const STAGE = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** 69.07s voice-over + a held end card */
  durationInFrames: 2100,
} as const;

/** Burgundy & muted sage, with vermilion as the single "pain" accent and gold reserved for the brand. */
export const color = {
  ink: "#1B0A0E", // burgundy-black ground
  burgundy: "#5B1423",
  wine: "#7F2334",
  vermilion: "#FF4A2B", // pain / risk / urgency — never decorative
  ivory: "#F3EADB",
  bone: "#E6DAC6",
  sage: "#A9B69B",
  sageDeep: "#55634C",
  gold: "#C9A254", // brand only
} as const;

export const font = {
  /** Kinetic display — variable width 50–150, weight 100–900 */
  display: "'Anybody', 'Arial Narrow', sans-serif",
  /** Supporting sentences */
  text: "'Bricolage Grotesque', 'Helvetica Neue', sans-serif",
  /** The calm voice */
  serif: "'Instrument Serif', 'Times New Roman', serif",
  /** Data, indices, labels */
  mono: "'Space Mono', 'Courier New', monospace",
} as const;

/** Safe area for 1080×1920 social video */
export const safe = { x: 84, top: 120, bottom: 150 } as const;

/** Variable-font helper for Anybody */
export const vf = (wdth: number, wght: number) => `"wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`;

export const sec = (s: number) => Math.round(s * STAGE.fps);
