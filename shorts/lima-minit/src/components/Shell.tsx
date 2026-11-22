import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, CX } from "../theme";

export type SceneProps = {
  /** frame on the global timeline (may be negative for the loop copy of scene 1) */
  f: number;
  /** horizontal camera offset during whip-pans, used for parallax */
  cam: number;
};

/**
 * Three parallax planes + slow camera push-in:
 * decor (far, moves 0.55x), stage (characters), keys (keywords, near, 1.12x).
 */
export const SceneShell: React.FC<{
  bg: string;
  cam: number;
  push: number;
  decor?: React.ReactNode;
  keys?: React.ReactNode;
  children?: React.ReactNode;
  focus?: [number, number];
  pushAmt?: number;
}> = ({ bg, cam, push, decor, keys, children, focus = [CX, 920], pushAmt = 0.06 }) => (
  <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        transform: `translateX(${-cam * 0.45}px) scale(${1 + pushAmt * 0.45 * push})`,
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
      }}
    >
      {decor}
    </AbsoluteFill>
    <AbsoluteFill style={{ transform: `scale(${1 + pushAmt * push})`, transformOrigin: `${focus[0]}px ${focus[1]}px` }}>{children}</AbsoluteFill>
    <AbsoluteFill
      style={{
        transform: `translateX(${cam * 0.12}px) scale(${1 + pushAmt * 0.35 * push})`,
        transformOrigin: `${CX}px 260px`,
      }}
    >
      {keys}
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Soft background shapes (far parallax plane). */
export const Decor: React.FC<{ seed: string; f: number; colors?: string[]; kind?: "blobs" | "dots" | "rays" | "squiggles"; opacity?: number; cx?: number; cy?: number }> = ({
  seed,
  f,
  colors = [C.teal, C.yellow, C.pink, C.coral],
  kind = "blobs",
  opacity = 0.22,
  cx = CX,
  cy = 900,
}) => {
  if (kind === "rays") {
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
        <g transform={`translate(${cx} ${cy}) rotate(${f * 0.25})`}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d="M 0 0 L -120 -1500 L 120 -1500 Z" transform={`rotate(${i * 22.5})`} fill={i % 2 ? colors[0] : "transparent"} />
          ))}
        </g>
      </svg>
    );
  }
  if (kind === "dots") {
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
        {Array.from({ length: 13 * 22 }, (_, i) => {
          const x = (i % 13) * 90 + ((Math.floor(i / 13) % 2) * 45) - 20;
          const y = Math.floor(i / 13) * 90 - 20;
          return <circle key={i} cx={x} cy={y} r={7} fill={colors[0]} />;
        })}
      </svg>
    );
  }
  if (kind === "squiggles") {
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = random(`${seed}x${i}`) * 1000;
          const y = random(`${seed}y${i}`) * 1800;
          const r = random(`${seed}r${i}`) * 360;
          return (
            <path
              key={i}
              d="M -50 0 q 12.5 -20 25 0 t 25 0 t 25 0 t 25 0"
              transform={`translate(${x} ${y + Math.sin(f * 0.05 + i) * 8}) rotate(${r})`}
              stroke={colors[i % colors.length]}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
      {Array.from({ length: 9 }, (_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const y = random(`${seed}y${i}`) * 1920;
        const r = 70 + random(`${seed}r${i}`) * 170;
        return <circle key={i} cx={x + Math.sin(f * 0.03 + i) * 10} cy={y + Math.cos(f * 0.025 + i) * 10} r={r} fill={colors[i % colors.length]} />;
      })}
    </svg>
  );
};

/** Floor line with a soft shadow, gives characters something to stand on. */
export const Floor: React.FC<{ y?: number; color?: string }> = ({ y = 1180, color = C.ink }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
    <path d={`M -20 ${y} Q 540 ${y - 14} 1100 ${y} L 1100 2000 L -20 2000 Z`} fill={color} opacity={0.06} />
    <path d={`M -20 ${y} Q 540 ${y - 14} 1100 ${y}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
  </svg>
);

/** Full-frame SVG layer in screen coordinates. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/** Absolutely positioned block, centred horizontally on x. */
export const At: React.FC<{ x?: number; y: number; children: React.ReactNode; style?: React.CSSProperties; anchor?: "center" | "left" }> = ({
  x = CX,
  y,
  children,
  style,
  anchor = "center",
}) => (
  <div
    style={{
      position: "absolute",
      left: anchor === "center" ? x - 600 : x,
      width: anchor === "center" ? 1200 : undefined,
      top: y,
      display: "flex",
      justifyContent: anchor === "center" ? "center" : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);
