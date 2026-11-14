import React from "react";
import { useFrame, usePlatform } from "../platform";
import { clamp, ease, lerp, ramp, rand } from "./math";

type Style = React.CSSProperties;

/* ───────────────────────── Camera push / zoom ─────────────────────────
 * Wrap a whole scene: zoom, pan and tilt as one move. */
export const Camera: React.FC<{
  zoom?: number;
  x?: number;
  y?: number;
  rotate?: number;
  origin?: string;
  style?: Style;
  children: React.ReactNode;
}> = ({ zoom = 1, x = 0, y = 0, rotate = 0, origin = "50% 50%", style, children }) => (
  <div style={{ position: "absolute", inset: 0, transformOrigin: origin, scale: `${zoom}`, translate: `${x}px ${y}px`, rotate: `${rotate}deg`, ...style }}>
    {children}
  </div>
);

/* ───────────────────────── 3D rotation ───────────────────────── */
export const Tilt3D: React.FC<{ rx?: number; ry?: number; rz?: number; perspective?: number; style?: Style; children: React.ReactNode }> = ({
  rx = 0, ry = 0, rz = 0, perspective = 1400, style, children,
}) => (
  <div style={{ perspective, ...style }}>
    <div style={{ width: "100%", height: "100%", transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: "preserve-3d" }}>{children}</div>
  </div>
);

/* ───────────────────────── Parallax ─────────────────────────
 * `depth` 0 = pinned to camera, 1 = moves with the world. */
export const Parallax: React.FC<{ depth: number; x?: number; y?: number; style?: Style; children: React.ReactNode }> = ({ depth, x = 0, y = 0, style, children }) => (
  <div style={{ position: "absolute", inset: 0, translate: `${x * depth}px ${y * depth}px`, ...style }}>{children}</div>
);

/* ───────────────────────── Motion blur (ghost trail) ─────────────────────────
 * Renders the same element at earlier sub-steps with falling opacity. */
export const Trail: React.FC<{
  samples?: number;
  /** frames between ghosts */
  step?: number;
  render: (frame: number, i: number) => React.ReactNode;
}> = ({ samples = 5, step = 0.6, render }) => {
  const frame = useFrame();
  return (
    <>
      {Array.from({ length: samples }, (_, k) => {
        const i = samples - 1 - k;
        return (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : 0.32 * (1 - i / samples) }}>
            {render(frame - i * step, i)}
          </div>
        );
      })}
    </>
  );
};

/* ───────────────────────── Film grain ─────────────────────────
 * A pre-rendered noise tile that jumps position each frame. */
export const Grain: React.FC<{ opacity?: number; blend?: Style["mixBlendMode"] }> = ({ opacity = 0.12, blend = "overlay" }) => {
  const frame = useFrame();
  const { asset } = usePlatform();
  const f = Math.floor(frame / 2);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${asset("img/grain.png")})`,
        backgroundSize: "360px 360px",
        backgroundPosition: `${Math.floor(rand(f) * 360)}px ${Math.floor(rand(f + 99) * 360)}px`,
        opacity,
        mixBlendMode: blend,
        pointerEvents: "none",
      }}
    />
  );
};

/* ───────────────────────── Glitch bars ─────────────────────────
 * Signal-loss strips laid over footage — a cheap alternative to <Glitch> when the
 * content underneath is a video and must not be duplicated. */
export const GlitchBars: React.FC<{ amount: number; color: string; count?: number; seed?: number; hold?: number }> = ({ amount, color, count = 7, seed = 1, hold = 2 }) => {
  const frame = useFrame();
  if (amount <= 0.01) return null;
  const step = Math.floor(frame / hold);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(step * 17.3 + i * 5.1 + k + seed);
        if (r(0) > amount) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${r(1) * 60 - 10}%`,
              width: `${30 + r(2) * 70}%`,
              top: `${r(3) * 96}%`,
              height: `${1 + r(4) * 7}%`,
              background: color,
              opacity: 0.35 + r(5) * 0.5,
              mixBlendMode: r(6) > 0.5 ? "screen" : "multiply",
            }}
          />
        );
      })}
    </>
  );
};

/* ───────────────────────── Particle burst (SVG) ───────────────────────── */
export const Burst: React.FC<{
  start: number;
  count?: number;
  x: number;
  y: number;
  radius?: number;
  dur?: number;
  color: string;
  seed?: number;
  shape?: "dot" | "dash";
  size?: number;
}> = ({ start, count = 28, x, y, radius = 420, dur = 40, color, seed = 3, shape = "dot", size = 7 }) => {
  const frame = useFrame();
  const t = (frame - start) / dur;
  if (t <= 0 || t >= 1) return null;
  const p = ease.outExpo(t);
  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%" viewBox="0 0 1080 1920">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + rand(i + seed) * 0.5;
        const r = radius * (0.45 + rand(i * 3.3 + seed) * 0.55) * p;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r + 90 * t * t; // a little gravity
        const o = clamp(1 - t * t);
        const s = size * (0.5 + rand(i * 9.1 + seed)) * (1 - t * 0.6);
        return shape === "dot" ? (
          <circle key={i} cx={px} cy={py} r={s} fill={color} opacity={o} />
        ) : (
          <line key={i} x1={px} y1={py} x2={px + Math.cos(a) * s * 5} y2={py + Math.sin(a) * s * 5} stroke={color} strokeWidth={s * 0.55} strokeLinecap="round" opacity={o} />
        );
      })}
    </svg>
  );
};

/* ───────────────────────── Pulse rings (SVG) ─────────────────────────
 * Each beat launches a ring that expands and thins. */
export const PulseRings: React.FC<{ beats: number[]; x: number; y: number; color: string; maxR?: number; life?: number; width?: number }> = ({
  beats, x, y, color, maxR = 620, life = 34, width = 10,
}) => {
  const frame = useFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%" viewBox="0 0 1080 1920">
      {beats.map((b, i) => {
        const t = (frame - b) / life;
        if (t <= 0 || t >= 1) return null;
        const p = ease.out(t);
        return <circle key={i} cx={x} cy={y} r={lerp(40, maxR, p)} fill="none" stroke={color} strokeWidth={lerp(width, 1, p)} opacity={1 - t} />;
      })}
    </svg>
  );
};

/* ───────────────────────── Morphing path ─────────────────────────
 * Interpolates two point lists (same length) and draws a smooth or sharp line. */
export const morphPoints = (a: [number, number][], b: [number, number][], t: number): [number, number][] =>
  a.map(([x, y], i) => [lerp(x, b[i][0], t), lerp(y, b[i][1], t)]);

export const pointsToPath = (pts: [number, number][], smooth = true, close = false) => {
  if (!smooth) return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + (close ? "Z" : "");
  // Catmull-Rom → cubic bezier
  const n = pts.length;
  const g = (i: number) => (close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (close ? "Z" : "");
};

/* ───────────────────────── Draw-on stroke ───────────────────────── */
export const Draw: React.FC<{ d: string; p: number } & React.SVGProps<SVGPathElement>> = ({ d, p, ...rest }) => (
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p)} fill="none" {...rest} />
);

/* ───────────────────────── Scene transitions ─────────────────────────
 * A scene mounts ON TOP of the previous one and reveals itself through a
 * clip-path. No cross-fades except `bloom`, reserved for the calm act. */
export type EnterKind = "cut" | "iris" | "wipeUp" | "wipeLeft" | "diagonal" | "shutter" | "bloom" | "slices";

export const Enter: React.FC<{
  kind: EnterKind;
  dur?: number;
  /** iris origin in stage px */
  origin?: [number, number];
  background: string;
  /** colour of a leading edge bar on wipeUp / wipeLeft */
  edge?: string;
  children: React.ReactNode;
}> = ({ kind, dur = 14, origin = [540, 960], background, edge, children }) => {
  const frame = useFrame();
  const t = clamp(frame / dur);
  const p = ease.inOut(t);
  let style: Style = {};
  if (kind === "iris") {
    const r = lerp(0, 2300, ease.in(t) * 0.35 + p * 0.65);
    style = { clipPath: `circle(${r}px at ${origin[0]}px ${origin[1]}px)` };
  } else if (kind === "wipeUp") {
    style = { clipPath: `inset(${(1 - p) * 100}% 0 0 0)` };
  } else if (kind === "wipeLeft") {
    style = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` };
  } else if (kind === "diagonal") {
    const x = lerp(-40, 140, p);
    style = { clipPath: `polygon(0 0, ${x}% 0, ${x - 40}% 100%, 0 100%)` };
  } else if (kind === "shutter") {
    const n = 8;
    const band = 100 / n;
    const m = `repeating-linear-gradient(to bottom, #000 0, #000 ${band * p}%, transparent ${band * p}%, transparent ${band}%)`;
    style = t >= 1 ? {} : { WebkitMaskImage: m, maskImage: m };
  } else if (kind === "bloom") {
    const o = ramp(frame, 0, dur, ease.breathe);
    style = { opacity: o, filter: o < 1 ? `blur(${(1 - o) * 24}px)` : undefined };
  } else if (kind === "slices") {
    // glitch cut: 6 horizontal slices arrive from alternating sides
    const n = 6;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = ease.outExpo(clamp((frame - i * 1.2) / (dur * 0.6))) * 100;
      const y0 = (i / n) * 100, y1 = ((i + 1) / n) * 100;
      // every slice starts + ends on the x=0 spine so the joins have zero area
      if (i % 2 === 0) pts.push(`0% ${y0}%`, `${a}% ${y0}%`, `${a}% ${y1}%`, `0% ${y1}%`, `0% ${y0}%`);
      else pts.push(`0% ${y0}%`, `${100 - a}% ${y0}%`, `100% ${y0}%`, `100% ${y1}%`, `${100 - a}% ${y1}%`, `${100 - a}% ${y0}%`, `0% ${y0}%`);
    }
    style = t >= 1 ? {} : { clipPath: `polygon(${pts.join(", ")})` };
  }
  const bar =
    edge && t < 1 && kind === "wipeLeft" ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(1 - p) * 100}%`, width: 18, background: edge }} />
    : edge && t < 1 && kind === "wipeUp" ? <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - p) * 100}%`, height: 18, background: edge }} />
    : null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background, ...style }}>
      {children}
      {bar}
    </div>
  );
};
