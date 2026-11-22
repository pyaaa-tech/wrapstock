import { WORDS } from "../timing";
import { FPS } from "../theme";

const byKey = new Map(WORDS.map((w) => [w.key, w]));

export const word = (key: string) => {
  const w = byKey.get(key);
  if (!w) throw new Error(`Unknown word key: ${key}`);
  return w;
};

/** Onset frame of a spoken word. Floored so a visual hit never trails the voice. */
export const F = (key: string) => Math.floor(word(key).s * FPS);
/** End frame of a spoken word. */
export const FE = (key: string) => Math.round(word(key).e * FPS);
export const sec = (s: number) => Math.round(s * FPS);
