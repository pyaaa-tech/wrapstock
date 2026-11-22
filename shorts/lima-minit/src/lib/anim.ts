import { random, spring } from "remotion";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Linear 0..1 progress of f between a and b, optionally eased. */
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = (t) => t) =>
  ease(clamp01((f - a) / (b - a)));

export const easeInCubic = (t: number) => t * t * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeInQuad = (t: number) => t * t;
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
/** Back-out: overshoots then settles. */
export const backOut = (t: number, s = 2.2) => {
  const u = t - 1;
  return u * u * ((s + 1) * u + s) + 1;
};
/** Elastic-out: springy wobble that settles at 1. */
export const elasticOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

/** Spring pop from 0 to 1 starting at frame `at` (overshoots, then settles). */
export const pop = (f: number, at: number, cfg?: { damping?: number; stiffness?: number; mass?: number }) =>
  spring({
    frame: f - at,
    fps: 30,
    config: { damping: cfg?.damping ?? 11, stiffness: cfg?.stiffness ?? 170, mass: cfg?.mass ?? 0.7 },
  });

/** Damped oscillation impulse, 0 before `at`. Good for squash & stretch after an impact. */
export const wobble = (f: number, at: number, amt = 1, freq = 0.6, decay = 0.2) => {
  const d = f - at;
  if (d < 0) return 0;
  return amt * Math.cos(d * freq) * Math.exp(-d * decay);
};

/** Anticipation: rises 0 -> 1 over `lead` frames before `at`, then drops to 0 (the main move takes over). */
export const antic = (f: number, at: number, lead = 5) => {
  if (f >= at || f < at - lead) return 0;
  return easeOutQuad((f - (at - lead)) / lead);
};

/** Sum of springs: steps a value up at each cue frame. */
export const steps = (f: number, cues: [number, number][], base: number, cfg?: Parameters<typeof pop>[2]) => {
  let v = base;
  let prev = base;
  for (const [at, val] of cues) {
    v += (val - prev) * pop(f, at, cfg);
    prev = val;
  }
  return v;
};

/** 6-frame screen shake from a list of hit frames. */
export const shake = (f: number, hits: number[], amp = 18, len = 6) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const h of hits) {
    const d = f - h;
    if (d < 0 || d >= len) continue;
    const k = 1 - d / len;
    x += (random(`sx${h}-${d}`) * 2 - 1) * amp * k;
    y += (random(`sy${h}-${d}`) * 2 - 1) * amp * k;
    r += (random(`sr${h}-${d}`) * 2 - 1) * 0.9 * k;
  }
  return { x, y, r };
};

const parseColor = (c: string): [number, number, number] => {
  if (c.startsWith("#")) {
    const p = parseInt(c.slice(1), 16);
    return [(p >> 16) & 255, (p >> 8) & 255, p & 255];
  }
  const m = c.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
};

/** Mix two colours (hex or rgb()) and return rgb(). */
export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseColor(a);
  const pb = parseColor(b);
  const k = clamp01(t);
  const m = (i: number) => Math.round(lerp(pa[i], pb[i], k));
  return `rgb(${m(0)},${m(1)},${m(2)})`;
};

/** Vertical hop arc (negative = up) starting at `at`. */
export const hopY = (f: number, at: number, h = 60, dur = 10) => {
  const d = f - at;
  if (d < 0 || d > dur) return 0;
  return -h * Math.sin((Math.PI * d) / dur);
};

/** Squash & stretch for a hop: anticipation squash, stretch while rising, squash on landing. */
export const hopSquash = (f: number, at: number, dur = 10, amt = 1) =>
  1 -
  0.16 * amt * antic(f, at, 4) +
  (f >= at && f < at + dur ? 0.1 * amt * Math.sin((Math.PI * (f - at)) / dur) : 0) -
  wobble(f, at + dur, 0.16 * amt, 0.9, 0.3);

/** Smoothly interpolated 2D point between keyframes [[frame, [x, y]], ...] using springs. */
export const pathSpring = (f: number, keys: [number, [number, number]][], cfg?: Parameters<typeof pop>[2]): [number, number] => {
  let x = keys[0][1][0];
  let y = keys[0][1][1];
  for (let i = 1; i < keys.length; i++) {
    const k = pop(f, keys[i][0], cfg);
    x += (keys[i][1][0] - keys[i - 1][1][0]) * k;
    y += (keys[i][1][1] - keys[i - 1][1][1]) * k;
  }
  return [x, y];
};
