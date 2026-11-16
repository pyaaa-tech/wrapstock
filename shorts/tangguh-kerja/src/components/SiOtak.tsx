import React from "react";
import { C } from "../theme";

/**
 * "Si Otak": an original cute pink brain with big eyes, tiny noodle arms and legs.
 * Drawn in a 400 x 460 design space; feet rest on y = 450.
 */

export type Eyes = "open" | "sparkle" | "wink" | "happy" | "shock" | "closed";
export type Mouth = "smile" | "grin" | "o" | "grimace" | "wavy" | "smirk" | "flat" | "sad";
export type Brows = "none" | "worried" | "determined" | "raised";
export type Pt = [number, number];

export type OtakPose = {
  /** frame used for idle animation (blinks, breathing) */
  t: number;
  eyes?: Eyes;
  mouth?: Mouth;
  brows?: Brows;
  /** pupil direction, -1..1 */
  look?: Pt;
  /** hand targets in design space */
  lh?: Pt;
  rh?: Pt;
  /** foot targets */
  lf?: Pt;
  rf?: Pt;
  /** 1 = rest, <1 squash, >1 stretch (volume preserving) */
  squash?: number;
  /** degrees, pivot at feet */
  lean?: number;
  /** turn: 1 = facing camera, ~0 = edge-on (used for "turns to camera") */
  turn?: number;
  sweat?: number;
  blush?: number;
  glasses?: number;
  sparkleSpin?: number;
  /** 0..1 eyelid droop */
  droop?: number;
  /** items */
  rItem?: React.ReactNode;
  rItemAngle?: number;
  lItem?: React.ReactNode;
  lItemAngle?: number;
  front?: React.ReactNode;
  back?: React.ReactNode;
  blink?: boolean;
};

export const OTAK_DEFAULT = {
  lh: [6, 372] as Pt,
  rh: [394, 372] as Pt,
  lf: [158, 446] as Pt,
  rf: [242, 446] as Pt,
};

const BODY_CX = 200;
const BODY_CY = 236;
const RX = 168;
const RY = 148;

const brainOutline = (() => {
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { a, x: BODY_CX + RX * Math.cos(a), y: BODY_CY + RY * Math.sin(a) };
  });
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const am = p.a + Math.PI / n;
    const bottomness = Math.max(0, Math.sin(am));
    const k = 40 * (1 - 0.8 * bottomness);
    const cx = BODY_CX + (RX + k) * Math.cos(am);
    const cy = BODY_CY + (RY + k) * Math.sin(am);
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  return d + " Z";
})();

const GYRI_LEFT = [
  "M 66 196 C 76 176, 100 176, 110 192",
  "M 86 140 C 100 120, 128 122, 134 140 S 158 156, 168 138",
  "M 124 100 C 138 88, 160 90, 168 106",
  "M 52 248 C 60 232, 80 230, 88 242",
];

const limb = (a: Pt, b: Pt, bend: number) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${a[0]} ${a[1]} Q ${mx + nx * bend} ${my + ny * bend} ${b[0]} ${b[1]}`;
};

const star4 = (R: number, r: number) =>
  `M 0 ${-R} Q ${r} ${-r} ${R} 0 Q ${r} ${r} 0 ${R} Q ${-r} ${r} ${-R} 0 Q ${-r} ${-r} 0 ${-R} Z`;

const Eye: React.FC<{ cx: number; cy: number; kind: Eyes; look: Pt; blink: boolean; spin: number; side: -1 | 1; droop: number }> = ({
  cx,
  cy,
  kind,
  look,
  blink,
  spin,
  side,
  droop,
}) => {
  if (kind === "sparkle") {
    return (
      <g transform={`translate(${cx} ${cy}) rotate(${spin * side}) scale(${1 + 0.08 * Math.sin(spin / 6)})`}>
        <path d={star4(50, 9)} fill={C.yellow} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={-8} cy={-10} r={6} fill={C.white} />
      </g>
    );
  }
  if (kind === "happy" || (kind === "wink" && side === 1) || kind === "closed") {
    const d =
      kind === "closed"
        ? `M ${cx - 34} ${cy + 6} Q ${cx} ${cy + 22} ${cx + 34} ${cy + 6}`
        : `M ${cx - 34} ${cy + 10} Q ${cx} ${cy - 30} ${cx + 34} ${cy + 10}`;
    return <path d={d} stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
  }
  const shock = kind === "shock";
  const sy = blink ? 0.08 : 1;
  const pr = shock ? 11 : 20;
  const px = cx + look[0] * (shock ? 8 : 13);
  const py = cy + look[1] * 12 + 4;
  return (
    <g transform={`translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})`}>
      <ellipse cx={cx} cy={cy} rx={shock ? 44 : 40} ry={shock ? 50 : 46} fill={C.white} stroke={C.ink} strokeWidth={7} />
      <circle cx={px} cy={py} r={pr} fill={C.ink} />
      <circle cx={px - pr * 0.35} cy={py - pr * 0.4} r={pr * 0.36} fill={C.white} />
      <circle cx={px + pr * 0.4} cy={py + pr * 0.35} r={pr * 0.16} fill={C.white} />
      {droop > 0 ? (
        <path
          d={`M ${cx - 46} ${cy - 50} L ${cx + 46} ${cy - 50} L ${cx + 46} ${cy - 50 + 52 * droop} Q ${cx} ${cy - 44 + 60 * droop} ${cx - 46} ${cy - 50 + 52 * droop} Z`}
          fill={C.pink}
          stroke={C.ink}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
};

const MouthShape: React.FC<{ kind: Mouth }> = ({ kind }) => {
  const s = { stroke: C.ink, strokeWidth: 8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "smile":
      return <path d="M 174 314 Q 200 342 226 314" {...s} />;
    case "grin":
      return (
        <g>
          <path d="M 166 308 Q 200 316 234 308 Q 230 356 200 356 Q 170 356 166 308 Z" fill={C.ink} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={200} cy={343} rx={17} ry={9} fill={C.coral} />
        </g>
      );
    case "o":
      return <ellipse cx={200} cy={326} rx={14} ry={18} fill={C.ink} />;
    case "grimace":
      return (
        <g>
          <rect x={164} y={306} width={72} height={32} rx={13} fill={C.white} stroke={C.ink} strokeWidth={6} />
          <path d="M 164 322 L 236 322 M 182 306 L 182 338 M 200 306 L 200 338 M 218 306 L 218 338" stroke={C.ink} strokeWidth={4} />
        </g>
      );
    case "wavy":
      return <path d="M 168 324 q 8 -10 16 0 t 16 0 t 16 0 t 16 0" {...s} strokeWidth={7} />;
    case "smirk":
      return <path d="M 174 322 Q 206 336 230 304" {...s} />;
    case "flat":
      return <path d="M 180 324 L 220 324" {...s} />;
    case "sad":
      return <path d="M 174 334 Q 200 306 226 334" {...s} />;
  }
};

export const SiOtak: React.FC<OtakPose> = (p) => {
  const eyes = p.eyes ?? "open";
  const look = p.look ?? [0, 0];
  const lh = p.lh ?? OTAK_DEFAULT.lh;
  const rh = p.rh ?? OTAK_DEFAULT.rh;
  const lf = p.lf ?? OTAK_DEFAULT.lf;
  const rf = p.rf ?? OTAK_DEFAULT.rf;
  const sq = p.squash ?? 1;
  const sx = 1 / Math.sqrt(sq);
  const turn = p.turn ?? 1;
  const blink = p.blink ?? (eyes === "open" && (((p.t + 50) % 83) + 83) % 83 < 4);
  const breathe = 1 + 0.012 * Math.sin(p.t * 0.16);
  const spin = p.sparkleSpin ?? p.t * 3;
  const shoulderL: Pt = [46, 290];
  const shoulderR: Pt = [354, 290];
  const hipL: Pt = [164, 376];
  const hipR: Pt = [236, 376];

  return (
    <g transform={`translate(200 450) rotate(${p.lean ?? 0}) scale(${sx * turn} ${sq}) translate(-200 -450)`}>
      {p.back}
      {/* legs */}
      {[
        [hipL, lf, -1],
        [hipR, rf, 1],
      ].map(([hip, foot, side], i) => (
        <g key={`leg${i}`}>
          <path d={limb(hip as Pt, foot as Pt, 8 * (side as number))} stroke={C.ink} strokeWidth={24} fill="none" strokeLinecap="round" />
          <path d={limb(hip as Pt, foot as Pt, 8 * (side as number))} stroke={C.pink} strokeWidth={11} fill="none" strokeLinecap="round" />
          <ellipse cx={(foot as Pt)[0] + 8 * (side as number)} cy={(foot as Pt)[1] + 4} rx={27} ry={14} fill={C.ink} />
          <ellipse cx={(foot as Pt)[0] + 2 * (side as number)} cy={(foot as Pt)[1] - 2} rx={9} ry={4} fill={C.white} opacity={0.35} />
        </g>
      ))}
      {/* body */}
      <g transform={`translate(200 ${BODY_CY + RY}) scale(${1 / Math.sqrt(breathe)} ${breathe}) translate(-200 ${-(BODY_CY + RY)})`}>
        <path d={brainOutline} fill={C.pink} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
        <path d="M 96 112 Q 122 82 162 80" stroke={C.white} strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.55} />
        <g stroke={C.pinkDark} strokeWidth={7} fill="none" strokeLinecap="round">
          <path d="M 200 86 C 188 106, 212 122, 200 150" />
          {GYRI_LEFT.map((d, i) => (
            <path key={`gl${i}`} d={d} />
          ))}
          <g transform="translate(400 0) scale(-1 1)">
            {GYRI_LEFT.map((d, i) => (
              <path key={`gr${i}`} d={d} />
            ))}
          </g>
        </g>
        {/* face */}
        <g opacity={turn < 0.35 ? 0 : 1}>
          <ellipse cx={104} cy={304} rx={24} ry={13} fill={C.coral} opacity={0.32 + 0.4 * (p.blush ?? 0)} />
          <ellipse cx={296} cy={304} rx={24} ry={13} fill={C.coral} opacity={0.32 + 0.4 * (p.blush ?? 0)} />
          <Eye cx={150} cy={252} kind={eyes} look={look} blink={blink} spin={spin} side={-1} droop={p.droop ?? 0} />
          <Eye cx={250} cy={252} kind={eyes} look={look} blink={blink} spin={spin} side={1} droop={p.droop ?? 0} />
          {p.brows === "worried" ? (
            <path d="M 112 192 L 170 178 M 288 192 L 230 178" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          ) : p.brows === "determined" ? (
            <path d="M 110 180 L 172 198 M 290 180 L 228 198" stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
          ) : p.brows === "raised" ? (
            <path d="M 116 186 Q 146 166 176 182 M 224 182 Q 254 166 284 186" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
          ) : null}
          {(p.glasses ?? 0) > 0 ? (
            <g transform={`translate(0 ${(1 - (p.glasses ?? 0)) * -170})`} stroke={C.ink} strokeWidth={8} fill="none">
              <circle cx={150} cy={254} r={56} fill={C.white} fillOpacity={0.18} />
              <circle cx={250} cy={254} r={56} fill={C.white} fillOpacity={0.18} />
              <path d="M 194 246 Q 200 238 206 246" />
              <path d="M 94 246 L 60 232 M 306 246 L 340 232" />
              <path d="M 120 226 L 136 212 M 220 226 L 236 212" stroke={C.white} strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null}
          <MouthShape kind={p.mouth ?? "smile"} />
        </g>
        {(p.sweat ?? 0) > 0 ? (
          <g opacity={Math.min(1, p.sweat ?? 0)} transform={`translate(0 ${((p.t * 2.2) % 40) * (p.sweat ?? 0)})`}>
            <path d="M 338 150 Q 352 176 352 188 A 14 14 0 0 1 324 188 Q 324 176 338 150 Z" fill="#7FE3F0" stroke={C.ink} strokeWidth={5} />
            <path d="M 70 168 Q 80 186 80 195 A 10 10 0 0 1 60 195 Q 60 186 70 168 Z" fill="#7FE3F0" stroke={C.ink} strokeWidth={4} />
          </g>
        ) : null}
      </g>
      {/* arms */}
      {[
        [shoulderL, lh, 1],
        [shoulderR, rh, -1],
      ].map(([sh, hand, side], i) => (
        <g key={`arm${i}`}>
          <path d={limb(sh as Pt, hand as Pt, 14 * (side as number))} stroke={C.ink} strokeWidth={24} fill="none" strokeLinecap="round" />
          <path d={limb(sh as Pt, hand as Pt, 14 * (side as number))} stroke={C.pink} strokeWidth={11} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {p.front}
      {p.lItem ? <g transform={`translate(${lh[0]} ${lh[1]}) rotate(${p.lItemAngle ?? 0})`}>{p.lItem}</g> : null}
      {p.rItem ? <g transform={`translate(${rh[0]} ${rh[1]}) rotate(${p.rItemAngle ?? 0})`}>{p.rItem}</g> : null}
      {[lh, rh].map((h, i) => (
        <circle key={`hand${i}`} cx={h[0]} cy={h[1]} r={17} fill={C.pink} stroke={C.ink} strokeWidth={7} />
      ))}
    </g>
  );
};

/** Positions an SVG character/prop in screen space. (x, y) is where the design-space anchor lands. */
export const Place: React.FC<{
  x: number;
  y: number;
  scale?: number;
  w?: number;
  h?: number;
  ax?: number;
  ay?: number;
  vb?: [number, number, number, number];
  rotate?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, scale = 1, vb = [-80, -80, 560, 600], ax = 200, ay = 450, rotate = 0, style, children }) => {
  const [vx, vy, vw, vh] = vb;
  const left = x - (ax - vx) * scale;
  const top = y - (ay - vy) * scale;
  return (
    <svg
      width={vw * scale}
      height={vh * scale}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transformOrigin: `${(ax - vx) * scale}px ${(ay - vy) * scale}px`,
        rotate: `${rotate}deg`,
        ...style,
      }}
    >
      {children}
    </svg>
  );
};

/** Si Otak placed in screen space: (x, y) is the point between his feet. */
export const OtakAt: React.FC<{ x: number; y: number; s?: number } & OtakPose> = ({ x, y, s = 1, ...pose }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-200 -450)`}>
    <SiOtak {...pose} />
  </g>
);

/** Screen position of a design-space point for an OtakAt with the same x, y, s (ignores squash/lean). */
export const otakToScreen = (x: number, y: number, s: number, p: Pt): Pt => [x + (p[0] - 200) * s, y + (p[1] - 450) * s];
