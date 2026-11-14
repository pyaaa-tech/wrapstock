import React from "react";
import { useFrame } from "../platform";
import { color, font, safe, vf } from "../tokens";
import { ease, lerp, ramp, spring } from "../motion/math";

type Style = React.CSSProperties;

export const Fill: React.FC<{ style?: Style; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, ...style }}>{children}</div>
);

/** Absolutely positioned block in stage pixels */
export const At: React.FC<{ x?: number; y: number; w?: number; style?: Style; children?: React.ReactNode }> = ({ x = safe.x, y, w, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, ...style }}>{children}</div>
);

export const mono = (size = 26, c: string = color.ivory): Style => ({
  fontFamily: font.mono,
  fontSize: size,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: c,
  lineHeight: 1.2,
});

export const serif = (size: number, c: string, italic = true): Style => ({
  fontFamily: font.serif,
  fontStyle: italic ? "italic" : "normal",
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: "-0.015em",
  color: c,
});

export const text = (size: number, c: string, weight = 500): Style => ({
  fontFamily: font.text,
  fontSize: size,
  fontWeight: weight,
  lineHeight: 1.16,
  letterSpacing: "-0.012em",
  color: c,
});

/** Running head — the editorial constant across every scene */
export const Head: React.FC<{ tone: string; right: string }> = ({ tone, right }) => {
  const f = useFrame();
  const p = ramp(f, 4, 22);
  return (
    <div style={{ position: "absolute", left: safe.x, right: safe.x, top: 66, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.72 * p, ...mono(21, tone) }}>
      <span>Seri Lestari Spa</span>
      <span style={{ flex: 1, height: 2, margin: "0 22px", background: tone, opacity: 0.35, transformOrigin: "0 50%", scale: `${p} 1` }} />
      <span>{right}</span>
    </div>
  );
};

/** Giant outlined index numeral for the three habits */
export const BigIndex: React.FC<{ n: string; stroke: string; start?: number }> = ({ n, stroke, start = 0 }) => {
  const f = useFrame();
  const p = spring(f, { delay: start, stiffness: 150, damping: 12 });
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 150,
        fontFamily: font.display,
        fontVariationSettings: vf(lerp(140, 64, p), 900),
        fontSize: 400,
        lineHeight: 0.8,
        color: "transparent",
        WebkitTextStroke: `4px ${stroke}`,
        translate: `0 ${(1 - p) * -260}px`,
        opacity: f >= start ? 1 : 0,
      }}
    >
      {n}
    </div>
  );
};

/** "↑ risiko migrain" — the recurring risk marker, always vermilion */
export const RiskTag: React.FC<{ start: number; y: number; label?: string; ink?: string }> = ({ start, y, label = "risiko migrain", ink = color.vermilion }) => {
  const f = useFrame();
  const p = spring(f, { delay: start, stiffness: 200, damping: 12 });
  const bob = Math.sin((f - start) / 5) * 6;
  if (f < start) return null;
  return (
    <div style={{ position: "absolute", left: safe.x, top: y, display: "flex", alignItems: "center", gap: 26, scale: `${lerp(0.6, 1, p)}`, transformOrigin: "0 50%" }}>
      <svg width="74" height="92" viewBox="0 0 74 92" style={{ translate: `0 ${bob - (1 - p) * -40}px` }}>
        <path d="M37 88 V10 M8 40 L37 8 L66 40" fill="none" stroke={ink} strokeWidth="12" strokeLinecap="square" />
      </svg>
      <span style={{ fontFamily: font.display, fontVariationSettings: vf(96, 800), fontSize: 76, textTransform: "uppercase", color: ink, letterSpacing: "0.01em", lineHeight: 1 }}>{label}</span>
    </div>
  );
};

export { color, font, safe, vf, ease, lerp, ramp, spring };
