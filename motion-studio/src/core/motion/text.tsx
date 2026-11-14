import React, { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "../platform";
import { font, vf } from "../tokens";
import { clamp, ease, lerp, ramp, rand, spring, type Ease } from "./math";

type Style = React.CSSProperties;

/* ───────────────────────── Staggered word reveal ─────────────────────────
 * Each word rises out of its own mask. Pass `cues` (frames) to land every word
 * on the syllable the voice speaks it — otherwise words stagger evenly. */
export const Words: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  cues?: number[];
  dur?: number;
  style?: Style;
  /** per-word style overrides, by index */
  accent?: Record<number, Style>;
  from?: "below" | "above";
}> = ({ text, start = 0, stagger = 4, cues, dur = 16, style, accent, from = "below" }) => {
  const frame = useFrame();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", rowGap: 0, ...style }}>
      {words.map((w, i) => {
        const at = cues?.[i] ?? start + i * stagger;
        const p = ramp(frame, at, at + dur, ease.outExpo);
        const dir = from === "below" ? 1 : -1;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.14em 0.08em", margin: "-0.14em -0.08em" }}>
            <span
              style={{
                display: "inline-block",
                translate: `0 ${(1 - p) * 115 * dir}%`,
                rotate: `${(1 - p) * 5 * dir}deg`,
                transformOrigin: "0% 100%",
                ...accent?.[i],
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ───────────────────────── Elastic letters ─────────────────────────
 * Per-letter spring with overshoot. `mode` picks the gesture. */
export const Letters: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  mode?: "pop" | "drop" | "rise";
  stiffness?: number;
  damping?: number;
  style?: Style;
  letterStyle?: (i: number, p: number) => Style;
}> = ({ text, start = 0, stagger = 2, mode = "pop", stiffness = 220, damping = 11, style, letterStyle }) => {
  const frame = useFrame();
  return (
    <div style={{ display: "flex", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        const p = spring(frame, { delay: start + i * stagger, stiffness, damping });
        const shown = frame >= start + i * stagger;
        const t: Style =
          mode === "pop"
            ? { scale: `${lerp(0.2, 1, p)}`, transformOrigin: "50% 85%" }
            : mode === "drop"
              ? { translate: `0 ${(1 - p) * -140}%`, scale: `1 ${lerp(1.5, 1, p)}`, transformOrigin: "50% 100%" }
              : { translate: `0 ${(1 - p) * 90}%`, transformOrigin: "50% 100%" };
        return (
          <span key={i} style={{ display: "inline-block", opacity: shown ? 1 : 0, ...t, ...letterStyle?.(i, p) }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ───────────────────────── Kinetic stretch ─────────────────────────
 * Real typographic stretching on Anybody's width axis (50–150) — the glyphs
 * are redrawn, not scaled, so stems stay crisp. */
export const Stretch: React.FC<{
  children: React.ReactNode;
  wdth: number;
  wght?: number;
  size: number;
  style?: Style;
}> = ({ children, wdth, wght = 900, size, style }) => (
  <div
    style={{
      fontFamily: font.display,
      fontVariationSettings: vf(clamp(wdth, 50, 150), wght),
      fontSize: size,
      lineHeight: 0.86,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────────────────── Fit to width ─────────────────────────
 * Scales a line so it always spans exactly `width`. Combined with <Stretch> this
 * turns the width axis into squash-and-stretch: as the letters condense, the word
 * grows taller instead of narrower. Measured synchronously, so it is render-safe. */
export const Fit: React.FC<{ width: number; align?: "top" | "bottom"; style?: Style; children: React.ReactNode }> = ({ width, align = "top", style, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const w = ref.current?.offsetWidth;
    if (!w) return;
    const next = width / w;
    if (Math.abs(next - scale) > 0.0005) setScale(next);
  });
  return (
    <div style={{ width, ...style }}>
      <div ref={ref} style={{ display: "inline-block", whiteSpace: "nowrap", scale: `${scale}`, transformOrigin: align === "top" ? "0 0" : "0 100%" }}>
        {children}
      </div>
    </div>
  );
};

/* ───────────────────────── Masked reveal ───────────────────────── */
export const Mask: React.FC<{
  /** 0 hidden → 1 fully revealed */
  p: number;
  dir?: "up" | "down" | "left" | "right" | "center";
  style?: Style;
  children: React.ReactNode;
}> = ({ p, dir = "up", style, children }) => {
  const h = (1 - clamp(p)) * 100;
  const inset =
    dir === "up" ? `${h}% 0 0 0`
    : dir === "down" ? `0 0 ${h}% 0`
    : dir === "left" ? `0 0 0 ${h}%`
    : dir === "right" ? `0 ${h}% 0 0`
    : `0 ${h / 2}% 0 ${h / 2}%`;
  return <div style={{ clipPath: `inset(${inset})`, ...style }}>{children}</div>;
};

/* ───────────────────────── Glitch displacement ─────────────────────────
 * Horizontal slices shear sideways; a ghost copy trails in the accent colour.
 * Deterministic: slice offsets are seeded by the frame. */
export const Glitch: React.FC<{
  amount: number; // 0..1
  slices?: number;
  ghost?: string;
  seed?: number;
  /** hold each random state for N frames */
  hold?: number;
  style?: Style;
  children: React.ReactNode;
}> = ({ amount, slices = 7, ghost, seed = 1, hold = 2, style, children }) => {
  const frame = useFrame();
  if (amount <= 0.001) return <div style={style}>{children}</div>;
  const step = Math.floor(frame / hold);
  const rows = Array.from({ length: slices }, (_, i) => i);
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ visibility: "hidden" }}>{children}</div>
      {rows.map((i) => {
        const top = (i / slices) * 100;
        const bottom = 100 - ((i + 1) / slices) * 100;
        const dx = (rand(step * 13.1 + i * 7.7 + seed) - 0.5) * 2 * 120 * amount;
        return (
          <React.Fragment key={i}>
            {ghost && (
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(${top}% -20% ${bottom}% -20%)`, translate: `${-dx * 0.6}px 0`, color: ghost, opacity: 0.9 }}>
                {children}
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(${top}% -20% ${bottom}% -20%)`, translate: `${dx}px 0` }}>{children}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ───────────────────────── Typewriter ───────────────────────── */
export const Typewriter: React.FC<{ text: string; start?: number; cps?: number; cursor?: boolean; style?: Style }> = ({ text, start = 0, cps = 30, cursor = true, style }) => {
  const frame = useFrame();
  const n = Math.floor(clamp(((frame - start) / 30) * cps, 0, text.length));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ fontFamily: font.mono, whiteSpace: "pre-wrap", ...style }}>
      {text.slice(0, n)}
      {cursor && frame >= start && <span style={{ opacity: n < text.length || blink ? 1 : 0 }}>▍</span>}
    </span>
  );
};

/* ───────────────────────── Counter ───────────────────────── */
export const useCount = (from: number, to: number, start: number, end: number, e: Ease = ease.out) => {
  const frame = useFrame();
  return lerp(from, to, ramp(frame, start, end, e));
};
