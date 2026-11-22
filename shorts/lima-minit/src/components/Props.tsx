import React from "react";
import { random } from "remotion";
import { C, FONT_KEY } from "../theme";
import { clamp01, mixColor } from "../lib/anim";

const INK = { stroke: C.ink, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Front-view laptop. Origin = centre of the bottom edge of the base. `open` 0..1 raises the lid. */
export const Laptop: React.FC<{ open?: number; screen?: React.ReactNode; glow?: number; w?: number }> = ({
  open = 1,
  screen,
  glow = 0,
  w = 260,
}) => {
  const h = w * 0.64;
  const lidH = h * open;
  return (
    <g>
      {glow > 0 ? <ellipse cx={0} cy={-h * 0.6} rx={w * 0.9} ry={h * 0.9} fill={C.teal} opacity={0.18 * glow} /> : null}
      {open > 0.02 ? (
        <g>
          <rect x={-w / 2} y={-22 - lidH} width={w} height={lidH} rx={14} fill={C.ink} {...INK} strokeWidth={8} />
          <rect x={-w / 2 + 14} y={-22 - lidH + 12} width={w - 28} height={Math.max(0, lidH - 24)} rx={6} fill={glow > 0 ? "#E9FFFB" : "#3A3A63"} />
          {open > 0.85 && screen ? (
            <g transform={`translate(0 ${-22 - lidH / 2})`} opacity={clamp01((open - 0.85) / 0.15)}>
              {screen}
            </g>
          ) : null}
        </g>
      ) : null}
      <path d={`M ${-w / 2 - 26} 0 L ${w / 2 + 26} 0 L ${w / 2} -24 L ${-w / 2} -24 Z`} fill="#CFCBE0" {...INK} strokeWidth={8} />
      <rect x={-34} y={-14} width={68} height={8} rx={4} fill={C.ink} opacity={0.35} />
    </g>
  );
};

/** Feather duster (kemoceng). Origin = the grip. Points up. */
export const Duster: React.FC<{ fluff?: number; t?: number }> = ({ fluff = 0, t = 0 }) => {
  const cols = [C.coral, C.yellow, C.teal, C.pink, C.coral, C.yellow, C.teal, C.pink, C.yellow, C.coral, C.teal];
  return (
    <g>
      <path d="M 0 40 L 0 -150" stroke={C.ink} strokeWidth={20} strokeLinecap="round" />
      <path d="M 0 40 L 0 -150" stroke="#A86B3C" strokeWidth={9} strokeLinecap="round" />
      <path d="M -12 -142 L 12 -142 L 9 -160 L -9 -160 Z" fill={C.ink} />
      {cols.map((c, i) => {
        const a = -70 + (i / (cols.length - 1)) * 140;
        const wob = Math.sin(t * 0.5 + i) * 6 * (0.4 + fluff);
        return (
          <g key={i} transform={`translate(0 -160) rotate(${a + wob})`}>
            <ellipse cx={0} cy={-62} rx={21 + fluff * 5} ry={58} fill={c} stroke={C.ink} strokeWidth={5} />
            <path d="M 0 -20 L 0 -104" stroke={C.ink} strokeWidth={3} opacity={0.45} />
          </g>
        );
      })}
      <circle cx={0} cy={-170} r={26} fill={C.pink} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

/** Alarm clock, origin centre. `sec` drives the ticking second hand, `ring` shakes the bells. */
export const AlarmClock: React.FC<{ r?: number; sec: number; pulse?: number; ring?: number }> = ({ r = 120, sec, pulse = 0, ring = 0 }) => {
  const tick = Math.floor(sec);
  const handA = tick * 30;
  const bell = Math.sin(ring * 2.2) * 12 * Math.min(1, Math.abs(ring) > 0 ? 1 : 0);
  return (
    <g>
      {pulse > 0 ? (
        <circle cx={0} cy={0} r={r * (1 + 0.45 * pulse)} fill="none" stroke={C.coral} strokeWidth={18 * (1 - pulse)} opacity={1 - pulse} />
      ) : null}
      <g transform={`rotate(${bell})`}>
        <path d={`M ${-r * 0.55} ${r * 0.8} L ${-r * 0.8} ${r * 1.15}`} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
        <path d={`M ${r * 0.55} ${r * 0.8} L ${r * 0.8} ${r * 1.15}`} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
        <g transform={`rotate(${-30 + bell * 1.5}) translate(0 ${-r * 1.02})`}>
          <path d={`M ${-r * 0.42} 0 A ${r * 0.42} ${r * 0.42} 0 0 1 ${r * 0.42} 0 Z`} fill={C.coral} stroke={C.ink} strokeWidth={9} />
        </g>
        <g transform={`rotate(${30 - bell * 1.5}) translate(0 ${-r * 1.02})`}>
          <path d={`M ${-r * 0.42} 0 A ${r * 0.42} ${r * 0.42} 0 0 1 ${r * 0.42} 0 Z`} fill={C.coral} stroke={C.ink} strokeWidth={9} />
        </g>
        <circle cx={0} cy={0} r={r} fill={C.coral} stroke={C.ink} strokeWidth={10} />
        <circle cx={0} cy={0} r={r * 0.8} fill={C.paper} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M 0 ${-r * 0.7} L 0 ${-r * (i % 3 === 0 ? 0.56 : 0.62)}`}
            transform={`rotate(${i * 30})`}
            stroke={C.ink}
            strokeWidth={i % 3 === 0 ? 9 : 5}
            strokeLinecap="round"
          />
        ))}
        <path d={`M 0 0 L 0 ${-r * 0.36}`} transform="rotate(-60)" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        <path d={`M 0 0 L 0 ${-r * 0.6}`} transform={`rotate(${handA})`} stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
        <circle cx={0} cy={0} r={11} fill={C.ink} />
      </g>
    </g>
  );
};

/** Ball of crumpled task sheets. Origin = centre. */
export const Snowball: React.FC<{ r: number; roll: number; eyes?: number; look?: number; grin?: number }> = ({ r, roll, eyes = 0, look = 0, grin = 0 }) => {
  const sheets = Array.from({ length: 9 }, (_, i) => ({
    a: (i / 9) * 360 + random(`sb${i}`) * 25,
    d: 0.25 + random(`sd${i}`) * 0.5,
    rot: random(`sr${i}`) * 60 - 30,
  }));
  return (
    <g>
      <ellipse cx={0} cy={r * 0.96} rx={r * 0.9} ry={r * 0.12} fill={C.ink} opacity={0.15} />
      <g transform={`rotate(${roll})`}>
        <circle cx={0} cy={0} r={r} fill={C.paper} stroke={C.ink} strokeWidth={Math.max(6, r * 0.05)} />
        {sheets.map((s, i) => {
          const x = Math.cos((s.a * Math.PI) / 180) * r * s.d;
          const y = Math.sin((s.a * Math.PI) / 180) * r * s.d;
          const sw = r * 0.42;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${s.rot + s.a})`}>
              <rect x={-sw / 2} y={-sw * 0.36} width={sw} height={sw * 0.72} rx={sw * 0.06} fill={i % 3 === 0 ? "#FFF0C2" : C.white} stroke={C.ink} strokeWidth={Math.max(3, r * 0.022)} />
              <path
                d={`M ${-sw * 0.34} ${-sw * 0.14} L ${sw * 0.3} ${-sw * 0.14} M ${-sw * 0.34} 0 L ${sw * 0.34} 0 M ${-sw * 0.34} ${sw * 0.14} L ${sw * 0.1} ${sw * 0.14}`}
                stroke={i % 2 ? C.coral : C.gray}
                strokeWidth={Math.max(2, r * 0.018)}
                strokeLinecap="round"
              />
            </g>
          );
        })}
        <path d={`M ${-r * 0.55} ${-r * 0.62} Q ${-r * 0.2} ${-r * 0.9} ${r * 0.2} ${-r * 0.86}`} stroke={C.white} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" opacity={0.9} />
      </g>
      {eyes > 0 ? (
        <g opacity={clamp01(eyes)} transform={`translate(0 ${-r * 0.1}) scale(${0.6 + 0.4 * clamp01(eyes)})`}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * r * 0.3} 0)`}>
              <ellipse cx={0} cy={0} rx={r * 0.17} ry={r * 0.2 * clamp01(eyes)} fill={C.white} stroke={C.ink} strokeWidth={r * 0.035} />
              <circle cx={look * r * 0.07} cy={r * 0.03} r={r * 0.08} fill={C.ink} />
              <path d={`M ${-r * 0.2 * s - r * 0.02} ${-r * 0.3} L ${r * 0.2 * s} ${-r * 0.18}`} stroke={C.ink} strokeWidth={r * 0.055} strokeLinecap="round" transform={`scale(${s} 1)`} />
            </g>
          ))}
          <path
            d={`M ${-r * 0.22} ${r * 0.32} Q 0 ${r * (0.32 + 0.14 * grin - 0.08 * (1 - grin))} ${r * 0.22} ${r * 0.32}`}
            stroke={C.ink}
            strokeWidth={r * 0.045}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </g>
  );
};

/** Little grey pebble with a cheeky face. Origin = bottom centre. */
export const Pebble: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={0} rx={50} ry={8} fill={C.ink} opacity={0.15} />
    <path d="M -48 -6 C -52 -40, -20 -62, 6 -60 C 38 -58, 56 -36, 50 -8 C 40 2, -36 4, -48 -6 Z" fill="#C9C3D6" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -24 -44 Q -10 -54 6 -52" stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
    <circle cx={-14} cy={-30} r={6} fill={C.ink} />
    <path d="M 8 -32 Q 16 -40 24 -32" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M -14 -16 Q 4 -4 20 -18" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    <ellipse cx={30} cy={-18} rx={8} ry={5} fill={C.coral} opacity={0.5} />
  </g>
);

/** Vertical mood bar with a face on top. Origin = bottom centre. level 0..1 */
export const MoodBar: React.FC<{ level: number; h?: number; label?: string }> = ({ level, h = 380, label = "MOOD" }) => {
  const w = 104;
  const fillH = Math.max(0, Math.min(1.15, level)) * (h - 20);
  const col = mixColor(C.coral, C.teal, level);
  const happy = level * 2 - 1;
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={w / 2} fill={C.white} stroke={C.ink} strokeWidth={9} />
      <clipPath id="moodclip">
        <rect x={-w / 2 + 10} y={-h + 10} width={w - 20} height={h - 20} rx={(w - 20) / 2} />
      </clipPath>
      <g clipPath="url(#moodclip)">
        <rect x={-w / 2} y={-10 - fillH} width={w} height={fillH + 10} fill={col} />
        <path d={`M ${-w / 2} ${-10 - fillH} q ${w / 4} -10 ${w / 2} 0 t ${w / 2} 0`} fill={col} />
      </g>
      {[0.25, 0.5, 0.75].map((k) => (
        <path key={k} d={`M ${w / 2 - 8} ${-h * k} L ${w / 2 + 14} ${-h * k}`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
      <g transform={`translate(0 ${-h - 70})`}>
        <circle cx={0} cy={0} r={62} fill={mixColor(C.coral, C.yellow, level)} stroke={C.ink} strokeWidth={8} />
        <circle cx={-20} cy={-10} r={8} fill={C.ink} />
        <circle cx={20} cy={-10} r={8} fill={C.ink} />
        <path d={`M -24 22 Q 0 ${22 + happy * 22} 24 22`} stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <text x={-80} y={-h - 52} textAnchor="end" fontFamily={FONT_KEY} fontWeight={800} fontSize={46} fill={C.ink}>
        {label}
      </text>
    </g>
  );
};

/** Thermometer-style pressure meter. Origin = bottom centre (bulb). level 0..1 */
export const PressureMeter: React.FC<{ level: number; h?: number; label?: string }> = ({ level, h = 400, label = "TEKANAN" }) => {
  const w = 70;
  const L = Math.max(0, Math.min(1.08, level));
  const col = mixColor(C.yellow, C.coral, L);
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h - 40} rx={w / 2} fill={C.white} stroke={C.ink} strokeWidth={9} />
      <rect x={-w / 2 + 14} y={-60 - (h - 90) * L} width={w - 28} height={(h - 90) * L + 40} rx={(w - 28) / 2} fill={col} />
      <circle cx={0} cy={-20} r={56} fill={col} stroke={C.ink} strokeWidth={9} />
      <circle cx={-18} cy={-36} r={12} fill={C.white} opacity={0.6} />
      {[0.2, 0.4, 0.6, 0.8].map((k) => (
        <path key={k} d={`M ${-w / 2 - 4} ${-80 - (h - 120) * k} L ${-w / 2 - 22} ${-80 - (h - 120) * k}`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
      <text x={0} y={-h - 22} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink}>
        {label}
      </text>
    </g>
  );
};

/** Assignment sheet. Origin centre. `scary` 0..1 adds a menacing face. */
export const TaskSheet: React.FC<{ scary?: number; bored?: number; t?: number }> = ({ scary = 0, bored = 0, t = 0 }) => (
  <g>
    <path d="M -130 -170 L 80 -170 L 130 -120 L 130 170 L -130 170 Z" fill={C.white} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    <path d="M 80 -170 L 80 -120 L 130 -120" fill="#E9E4F2" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <text x={-100} y={-112} fontFamily={FONT_KEY} fontWeight={800} fontSize={44} fill={C.ink}>
      TUGASAN
    </text>
    {[-60, -24, 12, 48, 84, 120].map((y, i) => (
      <path key={y} d={`M -100 ${y} L ${i % 3 === 2 ? 30 : 96} ${y}`} stroke={C.gray} strokeWidth={9} strokeLinecap="round" />
    ))}
    {bored > 0 ? (
      <g opacity={clamp01(bored) * (1 - clamp01(scary))} fontFamily={FONT_KEY} fontWeight={800} fill={C.ink}>
        <text x={110 + Math.sin(t * 0.15) * 6} y={-190 - ((t * 1.2) % 30)} fontSize={44}>
          z
        </text>
        <text x={150 + Math.sin(t * 0.15 + 1) * 6} y={-240 - ((t * 1.2) % 30)} fontSize={60}>
          Z
        </text>
      </g>
    ) : null}
    {scary > 0 ? (
      <g opacity={clamp01(scary)}>
        <path d="M -70 -40 L -20 -20 M 70 -40 L 20 -20" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        <circle cx={-44} cy={0} r={12} fill={C.coral} stroke={C.ink} strokeWidth={5} />
        <circle cx={44} cy={0} r={12} fill={C.coral} stroke={C.ink} strokeWidth={5} />
        <path d="M -70 70 L -46 46 L -23 70 L 0 46 L 23 70 L 46 46 L 70 70 Q 0 120 -70 70 Z" fill={C.ink} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -46 50 L -40 66 L -32 54 M 23 54 L 30 68 L 38 52" fill={C.white} />
      </g>
    ) : null}
  </g>
);

/** Open book with "KAJIAN". Origin = bottom centre. */
export const Book: React.FC = () => (
  <g>
    <path d="M -170 -10 Q -90 -40 0 -10 Q 90 -40 170 -10 L 170 -190 Q 90 -220 0 -190 Q -90 -220 -170 -190 Z" fill={C.teal} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -150 -24 Q -80 -50 0 -24 L 0 -196 Q -80 -222 -150 -200 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 150 -24 Q 80 -50 0 -24 L 0 -196 Q 80 -222 150 -200 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    {[-160, -130, -100, -70].map((y) => (
      <path key={y} d={`M -128 ${y} Q -70 ${y - 16} -22 ${y}`} stroke={C.gray} strokeWidth={7} fill="none" strokeLinecap="round" />
    ))}
    <g transform="translate(76 -110)">
      <path d="M -40 -30 L 40 -30 L 40 30 L -40 30 Z" fill="none" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-44 + i * 32} y={30 - [40, 70, 55][i]} width={22} height={[40, 70, 55][i]} rx={4} fill={[C.coral, C.yellow, C.teal][i]} stroke={C.ink} strokeWidth={5} />
      ))}
    </g>
  </g>
);

/** Grumpy storm cloud. Origin centre. */
export const StormCloud: React.FC<{ t: number; label?: string }> = ({ t, label }) => (
  <g>
    {Array.from({ length: 5 }, (_, i) => {
      const x = -90 + i * 45;
      const y = 70 + (((t * 9 + i * 23) % 60) as number);
      return <path key={i} d={`M ${x} ${y} l -10 26`} stroke={C.teal} strokeWidth={8} strokeLinecap="round" opacity={0.85} />;
    })}
    <path
      d="M -150 40 C -190 40, -196 -20, -150 -26 C -150 -80, -80 -96, -50 -60 C -30 -110, 60 -110, 72 -56 C 120 -84, 176 -40, 150 0 C 190 10, 180 60, 140 56 Z"
      fill="#9C98B5"
      stroke={C.ink}
      strokeWidth={9}
      strokeLinejoin="round"
    />
    <path d="M -46 -18 L -14 -8 M 46 -18 L 14 -8" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    <path d="M -24 30 Q 0 12 24 30" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
    {label ? (
      <text x={0} y={-130} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={54} fill={C.ink}>
        {label}
      </text>
    ) : null}
  </g>
);

/** Beanbag. Origin bottom centre. */
export const Beanbag: React.FC<{ squash?: number }> = ({ squash = 0 }) => (
  <g transform={`scale(${1 + squash * 0.12} ${1 - squash * 0.14})`}>
    <ellipse cx={0} cy={0} rx={170} ry={18} fill={C.ink} opacity={0.15} />
    <path d="M -165 -6 C -190 -100, -120 -190, -10 -180 C 110 -172, 186 -96, 160 -6 C 80 14, -80 14, -165 -6 Z" fill={C.teal} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -110 -120 Q -60 -160 0 -156" stroke={C.white} strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.5} />
  </g>
);

/** Simple desk. Origin = top-centre of the desk surface. */
export const Desk: React.FC<{ w?: number }> = ({ w = 620 }) => (
  <g>
    <rect x={-w / 2} y={0} width={w} height={34} rx={10} fill="#C98B5B" stroke={C.ink} strokeWidth={9} />
    <path d={`M ${-w / 2 + 50} 34 L ${-w / 2 + 40} 162 M ${w / 2 - 50} 34 L ${w / 2 - 40} 162`} stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
  </g>
);

export const SparkleStar: React.FC<{ r?: number; color?: string }> = ({ r = 30, color = C.yellow }) => (
  <path
    d={`M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`}
    fill={color}
    stroke={C.ink}
    strokeWidth={Math.max(3, r * 0.14)}
    strokeLinejoin="round"
  />
);
