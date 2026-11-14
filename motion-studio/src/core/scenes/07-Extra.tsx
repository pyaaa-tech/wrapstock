import React from "react";
import { useFrame } from "../platform";
import { Draw, Enter } from "../motion/fx";
import { clamp, ease, lerp, noise, ramp, rand, spring } from "../motion/math";
import { Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, BigIndex, Head, mono, serif, text } from "./kit";

const at = local("extra");

const PILLS = Array.from({ length: 13 }, (_, i) => ({
  x: 110 + (i % 5) * 182 + (rand(i + 1) - 0.5) * 60 + (Math.floor(i / 5) % 2) * 80,
  y: 1260 + Math.floor(i / 5) * 104 + (rand(i * 2.2) - 0.5) * 30,
  r: (rand(i * 5.1) - 0.5) * 120,
  tone: i % 3,
}));

/** 35.90–40.74s · "Satu lagi perkara penting: elakkan penggunaan ubat tahan sakit secara berlebihan." */
export const Extra: React.FC = () => {
  const f = useFrame();
  const stampAt = at(37.6);
  const stamp = ramp(f, stampAt, stampAt + 8, ease.outExpo);
  const shake = clamp(1 - (f - stampAt - 6) / 14) * (f >= stampAt + 6 ? 1 : 0);
  const strike = ramp(f, at(40.12), at(40.12) + 14, ease.inOut);

  return (
    <Enter kind="wipeUp" dur={14} background={color.burgundy}>
      <Head tone={color.ivory} right="Satu lagi" />
      <BigIndex n="+1" stroke={color.ivory} start={2} />

      <At y={566} w={912}>
        <Words text="Satu lagi perkara penting." cues={[at(35.98), at(36.54), at(36.72), at(37.02)]} dur={18} style={serif(130, color.ivory)} />
      </At>

      {/* ELAKKAN — stamped */}
      {f >= stampAt && (
        <At
          x={84}
          y={902}
          style={{
            rotate: "-5deg",
            scale: `${lerp(2.6, 1, stamp)}`,
            translate: `${noise(f * 1.7, 1) * 14 * shake}px ${noise(f * 1.9, 2) * 14 * shake}px`,
            transformOrigin: "30% 50%",
            background: color.vermilion,
            padding: "30px 40px 14px",
            opacity: clamp(stamp * 3),
          }}
        >
          <Stretch size={196} wdth={92} style={{ color: color.ink }}>
            elakkan
          </Stretch>
        </At>
      )}

      {/* a spill of capsules */}
      <svg style={{ position: "absolute", inset: 0 }} width="1080" height="1920" viewBox="0 0 1080 1920">
        {PILLS.map((p, i) => {
          const start = at(38.28) + i * 2.2;
          const s = spring(f, { delay: start, stiffness: 190, damping: 11 });
          if (f < start) return null;
          const dim = lerp(1, 0.3, strike);
          const a = p.tone === 0 ? color.ivory : p.tone === 1 ? color.sage : color.bone;
          return (
            <g key={i} transform={`translate(${p.x} ${p.y - (1 - s) * 700}) rotate(${p.r + (1 - s) * 200})`} opacity={dim}>
              <rect x={-66} y={-27} width={132} height={54} rx={27} fill={a} />
              <path d="M0 -27 H39 a27 27 0 0 1 0 54 H0 Z" fill={color.ink} opacity={0.82} />
            </g>
          );
        })}
        <Draw d="M70 1500 L1010 1250" p={strike} stroke={color.vermilion} strokeWidth={22} strokeLinecap="round" />
      </svg>

      <At y={1584} w={912}>
        <Words
          text="penggunaan ubat tahan sakit secara berlebihan."
          cues={[at(38.28), at(38.86), at(39.08), at(39.32), at(39.68), at(40.12)]}
          dur={14}
          style={text(58, color.ivory, 500)}
          accent={{ 5: { fontWeight: 800 } }}
        />
      </At>
      <At x={560} y={188} style={{ ...mono(28, color.ivory), opacity: ramp(f, 6, 18) }}>
        Perkara penting
      </At>
    </Enter>
  );
};
