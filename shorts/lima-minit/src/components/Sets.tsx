import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, FONT_KEY } from "../theme";
import { clamp01, easeOutCubic, ramp } from "../lib/anim";
import { BedBack, Blanket } from "./Bedroom";
import { OtakAt, OtakPose, Pt } from "./SiOtak";
import { AlarmClock } from "./Props";

/** Si Otak in bed: bed, sleeper, blanket, optional hands resting on the blanket edge. */
export const InBed: React.FC<
  {
    x: number;
    y: number; // mattress top
    s?: number;
    blanketTop?: number;
    handsOnBlanket?: boolean;
    otakDy?: number;
    otakLean?: number;
  } & OtakPose
> = ({ x, y, s = 0.85, blanketTop = -40, handsOnBlanket = true, otakDy = 0, otakLean = 0, ...pose }) => {
  const hidden: Pt = [200, 440];
  return (
    <g>
      <g transform={`translate(${x} ${y})`}>
        <BedBack />
      </g>
      <OtakAt x={x} y={y + 40 + otakDy} s={s} lh={hidden} rh={hidden} lean={otakLean} {...pose} />
      <g transform={`translate(${x} ${y})`}>
        <Blanket top={blanketTop} t={pose.t} />
      </g>
      {handsOnBlanket
        ? [-1, 1].map((side) => (
            <circle key={side} cx={x + side * 62} cy={y + blanketTop + 4 + Math.sin(pose.t * 0.12) * 5} r={16} fill={C.pink} stroke={C.ink} strokeWidth={7} />
          ))
        : null}
    </g>
  );
};

/** Sleep-depth chart (hypnogram). Screen coordinates. */
export const CH = { x0: 110, x1: 900, y0: 700, y1: 1150 }; // leaves room for the slow push-in inside the safe zone
const BAND = [
  { y0: CH.y0, y1: 850, fill: "#E3F7F3", label: "RINGAN" },
  { y0: 850, y1: 1000, fill: "#B9EBE2", label: "" },
  { y0: 1000, y1: CH.y1, fill: "#7FD8C8", label: "NYENYAK" },
];

export const SleepChart: React.FC<{
  f: number;
  curve: string;
  /** progress 0..1 of the draw-on line */
  p: number;
  deepPulse?: number;
  lightPulse?: number;
  deepLabelIn?: number;
  marker?: (pt: { x: number; y: number }) => React.ReactNode;
  extra?: React.ReactNode;
  appear?: number;
}> = ({ f, curve, p, deepPulse = 0, lightPulse = 0, deepLabelIn = 1, marker, extra, appear = 1 }) => {
  const len = getLength(curve);
  const pt = getPointAtLength(curve, Math.max(0.01, len * clamp01(p))) ?? { x: CH.x0, y: CH.y0 };
  return (
    <g transform={`translate(${(CH.x0 + CH.x1) / 2} ${CH.y1}) scale(${appear}) translate(${-(CH.x0 + CH.x1) / 2} ${-CH.y1})`}>
      <rect x={CH.x0 - 14} y={CH.y0 - 14} width={CH.x1 - CH.x0 + 28} height={CH.y1 - CH.y0 + 28} rx={26} fill={C.white} stroke={C.ink} strokeWidth={9} />
      {BAND.map((b, i) => (
        <rect key={i} x={CH.x0} y={b.y0} width={CH.x1 - CH.x0} height={b.y1 - b.y0} fill={b.fill} opacity={0.9} />
      ))}
      {deepPulse > 0 ? <rect x={CH.x0} y={1000} width={CH.x1 - CH.x0} height={CH.y1 - 1000} fill={C.coral} opacity={0.35 * deepPulse} /> : null}
      {lightPulse > 0 ? <rect x={CH.x0} y={CH.y0} width={CH.x1 - CH.x0} height={150} fill={C.yellow} opacity={0.45 * lightPulse} /> : null}
      <text x={CH.x0 + 22} y={CH.y0 + 52} fontFamily={FONT_KEY} fontWeight={800} fontSize={40} fill={C.ink} opacity={0.75}>
        RINGAN
      </text>
      <g transform={`translate(${CH.x0 + 22} ${CH.y1 - 26}) scale(${deepLabelIn})`}>
        <text x={0} y={0} fontFamily={FONT_KEY} fontWeight={800} fontSize={46} fill={C.ink}>
          NYENYAK
        </text>
      </g>
      <path d={curve} fill="none" stroke={C.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * clamp01(p)} ${len}`} />
      {extra}
      {marker && p > 0 ? marker(pt) : null}
    </g>
  );
};

/** A sleeping curve that dips into deep sleep in the middle. */
export const CURVE_DEEP = `M ${CH.x0 + 30} 760 C 220 760, 250 1090, 420 1090 C 560 1090, 600 780, 700 780 C 790 780, 820 940, ${CH.x1 - 30} 930`;
/** Same night, but the end is spent snoozing near the light band. */
export const CURVE_SNOOZE = `M ${CH.x0 + 30} 760 C 220 760, 250 1090, 400 1090 C 520 1090, 560 790, 640 790 C 700 790, 720 860, 770 850 C 800 842, 820 790, ${CH.x1 - 70} 780`;

/** Mini Si Otak head riding the chart line. */
export const ChartMarker: React.FC<{ pt: { x: number; y: number }; t: number; eyes?: OtakPose["eyes"]; jolt?: number }> = ({ pt, t, eyes = "closed", jolt = 0 }) => (
  <g transform={`translate(${pt.x + Math.sin(t * 2.4) * 6 * jolt} ${pt.y})`}>
    <OtakAt x={0} y={44} s={0.24} t={t} eyes={eyes} mouth={eyes === "dizzy" ? "wavy" : eyes === "closed" ? "smile" : "o"} lf={[170, 440]} rf={[230, 440]} />
  </g>
);

/** Small ringing alarm that slams in above a point. */
export const AlarmPing: React.FC<{ x: number; y: number; f: number; at: number; s?: number }> = ({ x, y, f, at, s = 0.42 }) => {
  if (f < at - 2) return null;
  const drop = easeOutCubic(ramp(f, at - 2, at + 1));
  return (
    <g transform={`translate(${x} ${y - 160 + 40 * drop}) scale(${s * (0.6 + 0.4 * drop)})`}>
      <AlarmClock r={90} sec={f / 6} pulse={((f - at) % 10) / 10} ring={f} />
    </g>
  );
};
