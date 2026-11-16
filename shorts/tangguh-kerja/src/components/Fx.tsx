import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { C, OUTRO_START } from "../theme";
import { clamp01, easeOutCubic, ramp } from "../lib/anim";

/** Draw-on stroke for an SVG path (arrows, underlines, strike-throughs). */
export const DrawPath: React.FC<{
  d: string;
  f: number;
  from: number;
  dur: number;
  color?: string;
  width?: number;
  head?: boolean;
  headSize?: number;
}> = ({ d, f, from, dur, color = C.ink, width = 12, head = false, headSize = 34 }) => {
  const p = ramp(f, from, from + dur, easeOutCubic);
  if (p <= 0) return null;
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
  const len = getLength(d);
  let headEl: React.ReactNode = null;
  if (head && p > 0.92) {
    // arrowhead aligned to the path's final tangent
    const end = getPointAtLength(d, len) ?? { x: 0, y: 0 };
    const before = getPointAtLength(d, Math.max(0, len - 6)) ?? end;
    const ang = (Math.atan2(end.y - before.y, end.x - before.x) * 180) / Math.PI;
    const s = clamp01((p - 0.92) / 0.08);
    headEl = (
      <g transform={`translate(${end.x} ${end.y}) rotate(${ang}) scale(${0.4 + 0.6 * s})`}>
        <path d={`M ${-headSize} ${-headSize * 0.7} L 4 0 L ${-headSize} ${headSize * 0.7}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
      {headEl}
    </g>
  );
};

/** Burst of confetti from (x, y) at frame `at`. Screen-space SVG layer. */
export const Confetti: React.FC<{ f: number; at: number; x: number; y: number; n?: number; spread?: number; seed?: string }> = ({
  f,
  at,
  x,
  y,
  n = 46,
  spread = 1,
  seed = "cf",
}) => {
  const d = f - at;
  if (d < 0 || d > 70) return null;
  const cols = [C.coral, C.teal, C.yellow, C.pink, C.ink];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = (9 + random(`${seed}v${i}`) * 20) * spread;
        const vx = Math.cos(a) * v;
        const vy = Math.sin(a) * v - 16 * spread;
        const drag = 0.9;
        const k = (1 - Math.pow(drag, d)) / (1 - drag);
        const px = x + vx * k;
        const py = y + vy * k + 0.7 * d * d * 0.5;
        const rot = d * (random(`${seed}r${i}`) * 30 - 15);
        const s = 10 + random(`${seed}s${i}`) * 12;
        const op = clamp01(1 - (d - 45) / 25);
        const shape = i % 3;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot}) scale(1 ${Math.cos(d * 0.3 + i)})`} opacity={op}>
            {shape === 0 ? (
              <rect x={-s / 2} y={-s / 4} width={s} height={s / 2} fill={cols[i % cols.length]} />
            ) : shape === 1 ? (
              <circle r={s / 3} fill={cols[i % cols.length]} />
            ) : (
              <path d={`M ${-s / 2} 0 Q 0 ${-s / 2} ${s / 2} 0`} stroke={cols[i % cols.length]} strokeWidth={5} fill="none" />
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Dust puffs emitted from a moving point over [from, to]. Points are SVG local coords. */
export const DustPuffs: React.FC<{ f: number; from: number; to: number; at: (fr: number) => [number, number]; seed?: string }> = ({
  f,
  from,
  to,
  at,
  seed = "dust",
}) => {
  const items: React.ReactNode[] = [];
  for (let e = from; e <= Math.min(f, to); e += 2) {
    const age = f - e;
    if (age > 26) continue;
    for (let j = 0; j < 2; j++) {
      const [ex, ey] = at(e);
      const ang = random(`${seed}${e}-${j}`) * Math.PI * 2;
      const sp = 2 + random(`${seed}s${e}-${j}`) * 4;
      const px = ex + Math.cos(ang) * sp * age;
      const py = ey + Math.sin(ang) * sp * age - age * 1.2;
      const r = (6 + random(`${seed}r${e}-${j}`) * 12) * (0.6 + age / 20);
      items.push(<circle key={`${e}-${j}`} cx={px} cy={py} r={r} fill="#E8DCC4" stroke={C.ink} strokeWidth={3} opacity={clamp01(1 - age / 26)} />);
    }
  }
  return <g>{items}</g>;
};

/** Paper texture + animated film grain + soft vignette. */
export const Overlays: React.FC<{ f: number }> = ({ f }) => {
  // grain sequence keyed to the 44 s programme so every pre-outro frame is unchanged
  const g = Math.floor(((f % OUTRO_START) + OUTRO_START) / 2) % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile("tex/paper.jpg")} style={{ position: "absolute", width: 1080, height: 1920, mixBlendMode: "multiply", opacity: 0.6 }} />
      <Img
        src={staticFile(`tex/grain${g}.png`)}
        style={{ position: "absolute", width: 1080, height: 1920, mixBlendMode: "overlay", opacity: 0.16, imageRendering: "pixelated" }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(27,27,58,0.16) 100%)" }} />
    </AbsoluteFill>
  );
};
