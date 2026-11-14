import React from "react";
import { Video, useFrame } from "../platform";
import { Draw, Enter, GlitchBars, morphPoints, pointsToPath } from "../motion/fx";
import { clamp, ease, lerp, noise, ramp, rand, spring } from "../motion/math";
import { Mask, Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, BigIndex, Head, RiskTag, mono, serif, text } from "./kit";

const at = local("sleep");

const N = 29, W = 912, H = 540;
const calmLine: [number, number][] = Array.from({ length: N }, (_, i) => [28 + (i / (N - 1)) * (W - 56), 410 + Math.sin((i / (N - 1)) * Math.PI * 6) * 48]);
const brokenLine: [number, number][] = calmLine.map(([x], i) => [x + (rand(i * 3.1) - 0.5) * 16, 370 + (rand(i * 1.7 + 4) - 0.5) * 250]);

/** 13.72–19.68s · "Pertama, tidur secara konsisten. Corak tidur yang terganggu boleh meningkatkan risiko migrain." */
export const Sleep: React.FC = () => {
  const f = useFrame();
  const tidur = spring(f, { delay: at(14.66), stiffness: 150, damping: 12 });
  const broken = ramp(f, at(17.26) - 2, at(17.26) + 12, ease.inOut);
  const jitter = broken * (0.25 + 0.75 * clamp(1 - (f - at(17.26)) / 40));
  const pts = morphPoints(calmLine, brokenLine, broken).map(([x, y], i) => [x, y + noise(f / 3 + i, i) * 18 * broken] as [number, number]);
  const d = pointsToPath(pts, broken < 0.5);

  return (
    <Enter kind="wipeUp" dur={14} background={color.ink}>
      <Head tone={color.ivory} right="Tabiat 01 / 03" />
      <BigIndex n="01" stroke={color.sage} start={2} />
      <At x={560} y={188} style={{ ...mono(28, color.sage), opacity: ramp(f, at(13.82), at(13.82) + 10) }}>
        Pertama
      </At>

      <At x={76} y={566}>
        <Stretch size={300} wdth={lerp(150, 100, tidur)} style={{ color: color.ivory, opacity: f >= at(14.66) ? 1 : 0, translate: `${(1 - tidur) * 260}px 0` }}>
          tidur
        </Stretch>
      </At>
      <At y={842}>
        <Words text="secara konsisten." cues={[at(15.22), at(15.58)]} dur={18} style={serif(116, color.sage)} />
      </At>

      {/* footage + the rhythm of the night */}
      <Mask p={ramp(f, 14, 40, ease.outExpo)} dir="up" style={{ position: "absolute", left: 84, top: 1004, width: W, height: H }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", background: color.burgundy, translate: `${noise(f * 1.3, 9) * 16 * jitter}px 0` }}>
          <Video src="video/sleep.mp4" style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${lerp(1.16, 1.04, ramp(f, 0, 180, ease.out))}`, filter: `saturate(${lerp(0.85, 0.5, broken)}) brightness(0.86)` }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 35%, ${color.ink} 110%)` }} />
          <GlitchBars amount={jitter} color={color.vermilion} seed={4} />
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <Draw d={d} p={ramp(f, at(15.4), at(16.3), ease.inOut)} stroke={broken > 0.5 ? color.vermilion : color.sage} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: 30, top: 26, ...mono(22, color.ivory), opacity: 0.9 }}>Corak tidur</div>
        <div style={{ position: "absolute", right: 30, top: 26, ...mono(22, broken > 0.5 ? color.vermilion : color.sage), fontWeight: 700 }}>
          {broken > 0.5 ? "● Terganggu" : "● Konsisten"}
        </div>
      </Mask>

      <At y={1584} w={912}>
        <Words
          text="Corak tidur yang terganggu"
          cues={[at(16.38), at(16.82), at(17.16), at(17.26)]}
          dur={14}
          style={text(58, color.ivory, 500)}
          accent={{ 3: { color: color.vermilion, fontWeight: 700 } }}
        />
      </At>
      <RiskTag start={at(18.84) - 4} y={1676} />
    </Enter>
  );
};
