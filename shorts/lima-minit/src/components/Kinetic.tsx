import React from "react";
import { C, FONT_KEY } from "../theme";
import { backOut, clamp01, easeInCubic, pop, wobble } from "../lib/anim";

/** Text-shadow ring that draws a smooth, round outline around HTML text. */
export const outline = (r: number, color: string, extra = "") => {
  const out: string[] = [];
  const n = Math.max(16, Math.round(r * 2.2));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push(`${(Math.cos(a) * r).toFixed(2)}px ${(Math.sin(a) * r).toFixed(2)}px 0 ${color}`);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out.push(`${(Math.cos(a) * r * 0.5).toFixed(2)}px ${(Math.sin(a) * r * 0.5).toFixed(2)}px 0 ${color}`);
  }
  if (extra) out.push(extra);
  return out.join(", ");
};

export type KineticMode = "bounce" | "hop" | "slam" | "slideL" | "slideR";

export type KineticProps = {
  text: string;
  /** frame the first letter lands on (the spoken onset) */
  at: number;
  f: number;
  size: number;
  color?: string;
  stroke?: string;
  strokeW?: number;
  /** hard drop shadow depth in px */
  depth?: number;
  stagger?: number;
  mode?: KineticMode;
  tilt?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
  /** frame from which the word leaves (pops out) */
  out?: number;
};

const Letter: React.FC<{
  ch: string;
  f: number;
  a: number;
  i: number;
  mode: KineticMode;
  size: number;
  color: string;
  stroke: string;
  strokeW: number;
  depth: number;
}> = ({ ch, f, a, i, mode, size, color, stroke, strokeW, depth }) => {
  if (ch === " ") return <span style={{ display: "inline-block", width: size * 0.28 }} />;
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let sx = 1;
  let sy = 1;
  let rot = 0;
  let op = 1;
  const d = f - a;
  if (mode === "bounce") {
    if (d < 0) op = 0;
    const sp = pop(f, a, { damping: 9, stiffness: 210, mass: 0.6 });
    ty = (1 - sp) * -size * 0.9;
    sc = 0.25 + 0.75 * sp;
    rot = (1 - sp) * (i % 2 ? 28 : -28);
    const w = wobble(f, a + 5, 0.16, 0.9, 0.35);
    sy = 1 - w;
    sx = 1 + w * 0.6;
  } else if (mode === "hop") {
    if (d < 0) op = 0;
    const u = clamp01(d / 7);
    ty = size * 0.7 * (1 - u) - size * 0.75 * Math.sin(Math.PI * u);
    sc = 0.4 + 0.6 * clamp01(d / 3);
    rot = (1 - u) * (i % 2 ? -14 : 14);
    const w = wobble(f, a + 7, 0.26, 0.85, 0.3);
    sy = 1 - w;
    sx = 1 + w * 0.7;
  } else if (mode === "slam") {
    // letters fly in huge and land on `a` with a squash
    const start = a - 3;
    if (f < start) op = 0;
    const u = clamp01((f - start) / 3);
    sc = 1 + 1.7 * (1 - easeInCubic(u));
    op = f < start ? 0 : 0.5 + 0.5 * u;
    const w = wobble(f, a, 0.24, 0.95, 0.32);
    sy = 1 - w;
    sx = 1 + w * 0.75;
  } else if (mode === "slideL" || mode === "slideR") {
    const dir = mode === "slideL" ? -1 : 1;
    if (d < 0) op = 0;
    const sp = pop(f, a, { damping: 12, stiffness: 160, mass: 0.8 });
    tx = dir * (1 - sp) * 900;
    rot = dir * (1 - sp) * 20;
  }
  return (
    <span
      style={{
        display: "inline-block",
        opacity: op,
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc * sx}, ${sc * sy})`,
        transformOrigin: "50% 85%",
        color,
        textShadow: outline(strokeW, stroke, depth ? `0px ${depth + strokeW}px 0 ${stroke}` : ""),
        whiteSpace: "pre",
      }}
    >
      {ch}
    </span>
  );
};

export const Kinetic: React.FC<KineticProps> = ({
  text,
  at,
  f,
  size,
  color = C.ink,
  stroke = C.ink,
  strokeW = 0,
  depth = 0,
  stagger = 1.4,
  mode = "bounce",
  tilt = 0,
  letterSpacing = 0,
  style,
  out,
}) => {
  const letters = [...text];
  let outScale = 1;
  if (out !== undefined && f >= out) {
    const u = clamp01((f - out) / 5);
    outScale = Math.max(0, 1 - backOut(u, 1.6));
  }
  if (outScale <= 0.001) return null;
  let li = 0;
  return (
    <div
      style={{
        fontFamily: FONT_KEY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing,
        whiteSpace: "nowrap",
        rotate: `${tilt}deg`,
        scale: `${outScale}`,
        ...style,
      }}
    >
      {letters.map((ch, i) => {
        const idx = ch === " " ? li : li++;
        const a = mode === "slam" ? at + Math.min(idx, 2) * 0 : at + idx * stagger;
        return (
          <Letter
            key={i}
            ch={ch}
            f={f}
            a={mode === "slideL" || mode === "slideR" ? at + idx * 0.6 : a}
            i={idx}
            mode={mode}
            size={size}
            color={color}
            stroke={stroke}
            strokeW={strokeW}
            depth={depth}
          />
        );
      })}
    </div>
  );
};
