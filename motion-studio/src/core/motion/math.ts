/**
 * Frame-based motion maths. Pure + deterministic: the same frame always gives the
 * same value, so the MP4 render and the browser playback are identical.
 */
export type Ease = (t: number) => number;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** CSS-style cubic-bezier easing */
export const bezier = (x1: number, y1: number, x2: number, y2: number): Ease => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-5) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return sy(clamp(t));
  };
};

export const ease = {
  linear: ((t) => t) as Ease,
  /** fast attack, long settle — the house default */
  outExpo: bezier(0.16, 1, 0.3, 1),
  out: bezier(0.22, 1, 0.36, 1),
  in: bezier(0.64, 0, 0.78, 0),
  inOut: bezier(0.65, 0, 0.35, 1),
  /** slow, breathing — used in the calm act */
  breathe: bezier(0.37, 0, 0.63, 1),
  /** overshoot */
  back: ((t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }) as Ease,
  /** anticipation: dips below 0 before launching */
  anticipate: ((t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  }) as Ease,
  elastic: ((t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1;
  }) as Ease,
};

/** 0→1 progress between two frames, clamped + eased */
export const ramp = (frame: number, from: number, to: number, e: Ease = ease.outExpo) =>
  e(clamp((frame - from) / Math.max(1e-6, to - from)));

/** Multi-keyframe interpolation (clamped). One ease for all segments, or one per segment. */
export const interp = (frame: number, input: number[], output: number[], e: Ease | Ease[] = ease.linear) => {
  if (frame <= input[0]) return output[0];
  const last = input.length - 1;
  if (frame >= input[last]) return output[last];
  let i = 0;
  while (i < last - 1 && frame > input[i + 1]) i++;
  const fn = Array.isArray(e) ? e[i] ?? ease.linear : e;
  const t = fn((frame - input[i]) / (input[i + 1] - input[i]));
  return lerp(output[i], output[i + 1], t);
};

/** Analytical damped spring 0→1 (overshoots when damping ratio < 1). */
export const spring = (
  frame: number,
  { delay = 0, stiffness = 140, damping = 13, mass = 1, fps = 30 }: { delay?: number; stiffness?: number; damping?: number; mass?: number; fps?: number } = {},
) => {
  const t = (frame - delay) / fps;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};

/** Deterministic pseudo-random 0..1 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Smooth 1D value noise, -1..1 */
export const noise = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 57.3), rand(i + 1 + seed * 57.3), u) * 2 - 1;
};

/**
 * Heartbeat envelope: sharp attack + exponential decay, restarting on every beat.
 * Returns 0..1. `beats` are absolute frames.
 */
export const beatEnvelope = (frame: number, beats: number[], decay = 9) => {
  let v = 0;
  for (const b of beats) {
    const d = frame - b;
    if (d >= 0) v = Math.max(v, Math.exp(-d / decay) * clamp(d / 1.5 + 0.35));
  }
  return v;
};
