import React from "react";
import { useFrame } from "../platform";
import { Enter } from "../motion/fx";
import { ease, lerp, noise, ramp, spring } from "../motion/math";
import { Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, BigIndex, Head, RiskTag, mono, serif, text } from "./kit";

const at = local("caffeine");

const Cup: React.FC<{ fill?: string; stroke: string; steam: boolean; phase: number }> = ({ fill = "none", stroke, steam, phase }) => {
  const wave = (x: number, k: number) =>
    `M${x},84 C${x + 14 * Math.sin(phase + k)},64 ${x - 14 * Math.sin(phase + k)},44 ${x + 10 * Math.sin(phase * 0.7 + k)},18`;
  return (
    <svg width="160" height="250" viewBox="0 0 160 250" style={{ overflow: "visible" }}>
      {steam && (
        <g fill="none" stroke={stroke} strokeWidth="7" strokeLinecap="round" opacity="0.75">
          <path d={wave(52, 0)} />
          <path d={wave(88, 1.7)} />
        </g>
      )}
      <path d="M14 108 H126 V168 a48 48 0 0 1 -48 48 h-16 a48 48 0 0 1 -48 -48 Z" fill={fill} stroke={stroke} strokeWidth="8" strokeLinejoin="round" />
      <path d="M126 124 h10 a22 22 0 0 1 0 44 h-12" fill="none" stroke={stroke} strokeWidth="8" />
      <path d="M2 236 H138" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
};

/** 27.40–35.90s · "Ketiga, kawal pengambilan kafein. Hadkan kepada maksimum 2 hidangan sehari…" */
export const Caffeine: React.FC = () => {
  const f = useFrame();
  const squeeze = ramp(f, at(29.52) + 6, at(29.52) + 30, ease.inOut); // "kawal": the word is brought under control
  const kIn = ramp(f, at(29.52), at(29.52) + 10);
  const slots = [0, 1, 2, 3, 4].map((i) => 84 + i * 188);
  const goodAt = [at(31.56), at(31.78)];
  const badAt = [at(33.1), at(33.4), at(33.7)];
  const over = ramp(f, at(33.62), at(33.62) + 12);

  return (
    <Enter kind="diagonal" dur={16} background={color.ivory}>
      <Head tone={color.burgundy} right="Tabiat 03 / 03" />
      <BigIndex n="03" stroke={color.burgundy} start={2} />
      <At x={560} y={188} style={{ ...mono(28, color.burgundy), opacity: ramp(f, at(27.46), at(27.46) + 10) }}>
        Ketiga
      </At>

      <At y={574}>
        <Words text="kawal pengambilan" cues={[at(28.46), at(28.98)]} dur={18} style={serif(108, color.burgundy)} />
      </At>
      {/* KAFEIN arrives too wide, then is squeezed between two rules */}
      <At x={84} y={716} style={{ display: "flex", alignItems: "stretch", gap: 20, opacity: kIn, translate: `${(1 - kIn) * 120}px 0` }}>
        <div style={{ width: 14, background: color.burgundy }} />
        <Stretch size={268} wdth={lerp(150, 78, squeeze)} style={{ color: color.burgundy, paddingTop: 16 }}>
          kafein
        </Stretch>
        <div style={{ width: 14, background: color.burgundy }} />
      </At>

      {/* the ration: two cups — then the excess */}
      <At x={84} y={1070} w={348} style={{ opacity: ramp(f, at(30.94), at(30.94) + 10) }}>
        <div style={{ height: 22, borderTop: `5px solid ${color.burgundy}`, borderLeft: `5px solid ${color.burgundy}`, borderRight: `5px solid ${color.burgundy}`, transformOrigin: "0 0", scale: `${ramp(f, at(30.94), at(30.94) + 18)} 1` }} />
      </At>
      <At x={84} y={1014} style={{ ...mono(27, color.burgundy), fontWeight: 700, opacity: ramp(f, at(30.94), at(30.94) + 10) }}>
        Maks. 2 sehari
      </At>
      <At x={460} y={1070} w={536} style={{ opacity: over }}>
        <div style={{ height: 22, borderTop: `5px solid ${color.vermilion}`, borderLeft: `5px solid ${color.vermilion}`, borderRight: `5px solid ${color.vermilion}`, transformOrigin: "0 0", scale: `${over} 1` }} />
      </At>
      <At x={460} y={1014} style={{ ...mono(27, color.vermilion), fontWeight: 700, opacity: over }}>
        Berlebihan
      </At>

      {slots.map((x, i) => {
        const good = i < 2;
        const start = good ? goodAt[i] : badAt[i - 2];
        const p = spring(f, { delay: start, stiffness: good ? 220 : 170, damping: good ? 10 : 9 });
        if (f < start) return null;
        const shake = good ? 0 : noise(f / 2.2, i) * 5 * ramp(f, start + 6, start + 20);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 1120,
              transformOrigin: "50% 100%",
              scale: good ? `${lerp(0.2, 1, p)}` : "1",
              translate: good ? undefined : `${shake}px ${-Math.abs(1 - p) * 520}px`, // bounces on the saucer line
              rotate: good ? undefined : `${shake * 1.4 + (1 - p) * 30}deg`,
            }}
          >
            <Cup fill={good ? color.burgundy : "none"} stroke={good ? color.burgundy : color.vermilion} steam={good} phase={f / 9 + i} />
          </div>
        );
      })}

      <At y={1456} w={912}>
        <Words
          text="Hadkan kepada maksimum 2 hidangan sehari."
          cues={[at(30.1), at(30.6), at(30.94), at(31.56), at(31.78), at(32.22)]}
          dur={14}
          style={text(58, color.burgundy, 500)}
          accent={{ 3: { fontWeight: 800 } }}
        />
      </At>
      <RiskTag start={at(35.08) - 6} y={1650} />
    </Enter>
  );
};
