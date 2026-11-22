import React from "react";
import { C, FONT_KEY } from "../theme";
import { clamp01, mixColor } from "../lib/anim";
import { SparkleStar } from "./Props";

const INK = { stroke: C.ink, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Bed behind the sleeper. Origin = centre of the mattress top edge. */
export const BedBack: React.FC<{ w?: number }> = ({ w = 620 }) => (
  <g>
    <path
      d={`M ${-w / 2} 40 L ${-w / 2} -250 Q ${-w / 2} -330 ${-w / 2 + 80} -330 L ${w / 2 - 80} -330 Q ${w / 2} -330 ${w / 2} -250 L ${w / 2} 40 Z`}
      fill={C.coral}
      {...INK}
      strokeWidth={9}
    />
    <path d={`M ${-w / 2 + 40} -40 L ${-w / 2 + 40} -240 Q ${-w / 2 + 40} -290 ${-w / 2 + 100} -290 L ${w / 2 - 100} -290 Q ${w / 2 - 40} -290 ${w / 2 - 40} -240 L ${w / 2 - 40} -40`} fill="none" stroke={C.white} strokeWidth={8} opacity={0.6} />
    <path d="M -230 -10 C -250 -110, -110 -130, -10 -118 C 120 -128, 250 -110, 230 -10 Z" fill={C.white} {...INK} strokeWidth={8} />
    <rect x={-w / 2 - 10} y={0} width={w + 20} height={70} rx={18} fill={C.white} {...INK} strokeWidth={9} />
    <rect x={-w / 2 + 6} y={66} width={22} height={60} rx={6} fill={C.ink} />
    <rect x={w / 2 - 28} y={66} width={22} height={60} rx={6} fill={C.ink} />
  </g>
);

/** Blanket in front of the sleeper. Origin = centre of the mattress top edge; `top` = y of the blanket's top edge. */
export const Blanket: React.FC<{ w?: number; top?: number; t?: number; breathe?: number }> = ({ w = 640, top = -110, t = 0, breathe = 1 }) => {
  const b = Math.sin(t * 0.12) * 5 * breathe;
  const y0 = top + b;
  return (
    <g>
      <path
        d={`M ${-w / 2} 80 L ${-w / 2} ${y0 + 40} Q ${-w / 2} ${y0} ${-w / 2 + 60} ${y0 - 6} Q ${-w / 4} ${y0 - 22} 0 ${y0 - 8} Q ${w / 4} ${y0 + 6} ${w / 2 - 60} ${y0 - 4} Q ${w / 2} ${y0} ${w / 2} ${y0 + 40} L ${w / 2} 80 Z`}
        fill={C.yellow}
        {...INK}
        strokeWidth={9}
      />
      <path d={`M ${-w / 2 + 20} ${y0 + 30} Q 0 ${y0 + 12} ${w / 2 - 20} ${y0 + 28}`} stroke={C.white} strokeWidth={14} fill="none" opacity={0.55} strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => {
        const x = -w / 2 + 70 + (i % 5) * ((w - 140) / 4) + (Math.floor(i / 5) % 2) * 50;
        const y = y0 + 80 + Math.floor(i / 5) * 70;
        return y < 70 ? <circle key={i} cx={x} cy={y} r={13} fill={C.coral} opacity={0.85} /> : null;
      })}
    </g>
  );
};

/** Floating "Z z z". Origin = where they rise from. */
export const Zzz: React.FC<{ t: number; s?: number; opacity?: number }> = ({ t, s = 1, opacity = 1 }) => (
  <g opacity={opacity} fontFamily={FONT_KEY} fontWeight={800} fill={C.white} stroke={C.ink} strokeWidth={6} paintOrder="stroke">
    {[0, 1, 2].map((i) => {
      const ph = ((t * 0.9 + i * 18) % 54) / 54;
      return (
        <text key={i} x={ph * 70 * s + Math.sin(t * 0.15 + i) * 8} y={-ph * 150 * s} fontSize={(34 + i * 6) * s * (0.6 + 0.4 * ph)} opacity={Math.sin(Math.PI * ph)}>
          Z
        </text>
      );
    })}
  </g>
);

/** Gift box. Origin = bottom centre. `lid` 0 closed -> 1 popped open. */
export const GiftBox: React.FC<{ lid?: number; label?: string; t?: number }> = ({ lid = 0, label = "5 MINIT", t = 0 }) => {
  const lift = -150 * lid;
  const rot = -28 * lid;
  return (
    <g>
      <ellipse cx={0} cy={4} rx={150} ry={14} fill={C.ink} opacity={0.12} />
      <rect x={-125} y={-190} width={250} height={190} rx={14} fill={C.pink} {...INK} strokeWidth={9} />
      <rect x={-22} y={-190} width={44} height={190} fill={C.teal} {...INK} strokeWidth={7} />
      <g transform={`translate(${70 * lid} ${lift}) rotate(${rot})`}>
        <rect x={-140} y={-240} width={280} height={58} rx={14} fill={C.pink} {...INK} strokeWidth={9} />
        <rect x={-24} y={-240} width={48} height={58} fill={C.teal} {...INK} strokeWidth={7} />
        <path d="M 0 -240 C -40 -300, -110 -290, -80 -250 C -60 -228, -20 -236, 0 -240 Z" fill={C.teal} {...INK} strokeWidth={7} />
        <path d="M 0 -240 C 40 -300, 110 -290, 80 -250 C 60 -228, 20 -236, 0 -240 Z" fill={C.teal} {...INK} strokeWidth={7} />
      </g>
      <g transform="translate(96 -120) rotate(14)">
        <rect x={-6} y={-30} width={150} height={60} rx={12} fill={C.white} {...INK} strokeWidth={6} />
        <circle cx={10} cy={0} r={7} fill={C.ink} />
        <text x={80} y={13} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={34} fill={C.coral}>
          {label}
        </text>
      </g>
      {lid > 0.2
        ? [0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${-90 + i * 60} ${-280 - 60 * lid - (i % 2) * 40}) rotate(${t * 6 + i * 30}) scale(${clamp01(lid) * (0.6 + 0.3 * Math.sin(t * 0.4 + i))})`}>
              <SparkleStar r={18 + (i % 2) * 8} />
            </g>
          ))
        : null}
    </g>
  );
};

/** Brain-power meter (pill + power icon). Origin = left centre. level 0..1 */
export const BrainMeter: React.FC<{ level: number; on?: boolean; blink?: boolean; label?: string; w?: number }> = ({ level, on = false, blink = false, label = "OTAK", w = 420 }) => {
  const L = clamp01(level);
  const col = mixColor(C.coral, C.teal, L);
  return (
    <g>
      <rect x={0} y={-40} width={w} height={80} rx={40} fill={C.white} {...INK} strokeWidth={8} />
      <rect x={12} y={-28} width={Math.max(0, (w - 24) * L)} height={56} rx={28} fill={col} />
      <text x={34} y={14} fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink}>
        {label}
      </text>
      <text x={w - 30} y={14} textAnchor="end" fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink}>
        {Math.round(L * 100)}%
      </text>
      <g transform={`translate(${w + 70} 0)`}>
        <circle r={48} fill={on ? C.teal : blink ? C.coral : C.white} {...INK} strokeWidth={8} />
        <path d="M -20 -12 A 26 26 0 1 0 20 -12" fill="none" stroke={on || blink ? C.white : C.ink} strokeWidth={8} strokeLinecap="round" />
        <path d="M 0 -30 L 0 2" stroke={on || blink ? C.white : C.ink} strokeWidth={8} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Little stars orbiting a head (dizzy). Origin = orbit centre. */
export const DizzyOrbit: React.FC<{ t: number; rx?: number; ry?: number; n?: number; opacity?: number }> = ({ t, rx = 170, ry = 46, n = 4, opacity = 1 }) => (
  <g opacity={opacity}>
    <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="8 14" opacity={0.35} />
    {Array.from({ length: n }, (_, i) => {
      const a = t * 0.16 + (i / n) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      const front = Math.sin(a) > 0;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${t * 8}) scale(${front ? 1.1 : 0.75})`}>
          <SparkleStar r={i % 2 ? 22 : 28} color={i % 2 ? C.yellow : C.white} />
        </g>
      );
    })}
  </g>
);

/** Soft fog cloud ("mamai"). Origin centre. */
export const Fog: React.FC<{ s?: number; t?: number; label?: string; opacity?: number }> = ({ s = 1, t = 0, label, opacity = 1 }) => (
  <g opacity={opacity} transform={`scale(${s})`}>
    {[
      [-120, 10, 80],
      [-40, -40, 100],
      [70, -30, 90],
      [140, 20, 70],
      [10, 40, 90],
      [-90, 60, 60],
      [100, 70, 60],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x + Math.sin(t * 0.05 + i) * 8} cy={y + Math.cos(t * 0.06 + i) * 6} r={r} fill="#E6E2EE" opacity={0.85} />
    ))}
    {label ? (
      <text x={0} y={20} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={56} fill={C.ink} opacity={0.7}>
        {label}
      </text>
    ) : null}
  </g>
);

/** Timer dial: wedge sweeps `minutes` of 60. Origin centre. */
export const Dial: React.FC<{ minutes: number; r?: number }> = ({ minutes, r = 170 }) => {
  const a = (Math.min(minutes, 59.9) / 60) * Math.PI * 2;
  const x = Math.sin(a) * (r - 14);
  const y = -Math.cos(a) * (r - 14);
  const large = a > Math.PI ? 1 : 0;
  return (
    <g>
      <circle r={r + 16} fill={C.white} {...INK} strokeWidth={10} />
      {minutes > 0.05 ? <path d={`M 0 0 L 0 ${-(r - 14)} A ${r - 14} ${r - 14} 0 ${large} 1 ${x} ${y} Z`} fill={minutes > 30 ? C.coral : C.teal} opacity={0.85} /> : null}
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M 0 ${-r} L 0 ${-r + (i % 3 === 0 ? 30 : 16)}`} transform={`rotate(${i * 30})`} stroke={C.ink} strokeWidth={i % 3 === 0 ? 9 : 5} strokeLinecap="round" />
      ))}
      <path d={`M 0 0 L ${x * 0.92} ${y * 0.92}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <circle r={16} fill={C.ink} />
      <text x={0} y={-r + 70} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink}>
        0
      </text>
      <text x={0} y={r - 44} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink}>
        30
      </text>
    </g>
  );
};

/** Small clipboard ("KAJIAN"). Origin centre. */
export const Clipboard: React.FC<{ label?: string }> = ({ label = "KAJIAN" }) => (
  <g>
    <rect x={-110} y={-140} width={220} height={280} rx={18} fill="#C98B5B" {...INK} strokeWidth={9} />
    <rect x={-88} y={-112} width={176} height={232} rx={8} fill={C.white} {...INK} strokeWidth={6} />
    <rect x={-50} y={-160} width={100} height={44} rx={12} fill={C.gray} {...INK} strokeWidth={7} />
    <text x={0} y={-60} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={36} fill={C.ink}>
      {label}
    </text>
    {[-20, 14, 48, 82].map((y, i) => (
      <g key={y}>
        <path d={`M -64 ${y} l 12 12 l 20 -22`} stroke={C.teal} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M -16 ${y + 2} L ${i % 2 ? 40 : 64} ${y + 2}`} stroke={C.gray} strokeWidth={8} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

/** Map pin with a label. Origin = pin tip. */
export const MapPin: React.FC<{ label: string }> = ({ label }) => (
  <g>
    <ellipse cx={0} cy={4} rx={30} ry={8} fill={C.ink} opacity={0.18} />
    <path d="M 0 0 C -20 -40, -58 -70, -58 -110 A 58 58 0 1 1 58 -110 C 58 -70, 20 -40, 0 0 Z" fill={C.coral} {...INK} strokeWidth={8} />
    <circle cx={0} cy={-112} r={22} fill={C.white} {...INK} strokeWidth={6} />
    <g transform="translate(0 -210)">
      <rect x={-110} y={-36} width={220} height={66} rx={33} fill={C.ink} />
      <text x={0} y={14} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={42} fill={C.yellow}>
        {label}
      </text>
    </g>
  </g>
);

/** Magnifying glass. Origin = lens centre. */
export const Magnifier: React.FC<{ r?: number }> = ({ r = 80 }) => (
  <g>
    <path d={`M ${r * 0.7} ${r * 0.7} L ${r * 1.7} ${r * 1.7}`} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
    <path d={`M ${r * 0.85} ${r * 0.85} L ${r * 1.6} ${r * 1.6}`} stroke="#C98B5B" strokeWidth={16} strokeLinecap="round" />
    <circle r={r} fill={C.white} fillOpacity={0.35} stroke={C.ink} strokeWidth={12} />
    <path d={`M ${-r * 0.55} ${-r * 0.2} A ${r * 0.6} ${r * 0.6} 0 0 1 ${-r * 0.15} ${-r * 0.58}`} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

/** Window with sky, sun and two curtains. Origin = window centre. open 0..1, day 0..1 */
export const Window: React.FC<{ open: number; day: number; t: number; w?: number; h?: number }> = ({ open, day, t, w = 460, h = 520 }) => {
  const sky = mixColor("#3A3A63", "#9BE7DD", day);
  const sunY = h * 0.25 - day * h * 0.32;
  const cw = (w / 2 + 40) * (1 - 0.72 * open);
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={sky} {...INK} strokeWidth={10} />
      <clipPath id="winclip">
        <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} rx={12} />
      </clipPath>
      <g clipPath="url(#winclip)">
        {day > 0.02 ? (
          <g transform={`translate(${w * 0.12} ${sunY})`}>
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d="M 0 -96 L 0 -130" transform={`rotate(${i * 36 + t * 1.2})`} stroke={C.yellow} strokeWidth={12} strokeLinecap="round" opacity={day} />
            ))}
            <circle r={76} fill={C.yellow} stroke={C.ink} strokeWidth={8} opacity={day} />
          </g>
        ) : null}
        {day < 0.98
          ? [
              [-120, -170, 6],
              [90, -120, 4],
              [-40, -60, 5],
              [140, -200, 3],
            ].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={C.white} opacity={(1 - day) * (0.6 + 0.4 * Math.sin(t * 0.2 + i))} />)
          : null}
        <path d={`M ${-w / 2 + 20} ${h / 2 - 90} Q ${-w / 4} ${h / 2 - 150} 0 ${h / 2 - 100} Q ${w / 4} ${h / 2 - 160} ${w / 2 - 20} ${h / 2 - 100} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`} fill={mixColor("#2B2B4F", C.teal, day)} opacity={0.9} />
      </g>
      <path d={`M 0 ${-h / 2} L 0 ${h / 2} M ${-w / 2} 0 L ${w / 2} 0`} stroke={C.ink} strokeWidth={12} />
      <rect x={-w / 2 - 30} y={h / 2 - 6} width={w + 60} height={30} rx={10} fill={C.white} {...INK} strokeWidth={8} />
      {/* curtain rod + curtains */}
      <rect x={-w / 2 - 70} y={-h / 2 - 50} width={w + 140} height={22} rx={11} fill={C.ink} />
      {[-1, 1].map((side) => {
        const x0 = side * (w / 2 + 50);
        const x1 = x0 - side * cw;
        const folds = 4;
        let d = `M ${x0} ${-h / 2 - 40} L ${x1} ${-h / 2 - 40}`;
        d += ` L ${x1 + side * 10} ${h / 2 + 40}`;
        for (let i = 1; i <= folds; i++) {
          const xx = x1 + side * 10 + ((x0 - x1 - side * 10) * i) / folds;
          d += ` Q ${xx - ((x0 - x1) / folds) * 0.5} ${h / 2 + 70} ${xx} ${h / 2 + 40}`;
        }
        d += ` L ${x0} ${-h / 2 - 40} Z`;
        return (
          <g key={side}>
            <path d={d} fill={C.coral} {...INK} strokeWidth={8} />
            {Array.from({ length: folds - 1 }, (_, i) => {
              const xx = x1 + ((x0 - x1) * (i + 1)) / folds;
              return <path key={i} d={`M ${xx} ${-h / 2 - 30} L ${xx + side * 6} ${h / 2 + 30}`} stroke={C.ink} strokeWidth={4} opacity={0.3} />;
            })}
          </g>
        );
      })}
    </g>
  );
};
