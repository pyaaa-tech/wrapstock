import React from "react";
import { useFrame } from "../platform";
import { Enter } from "../motion/fx";
import { ease, lerp, ramp, rand, spring } from "../motion/math";
import { Fit, Stretch, Typewriter, Words, useCount } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Head, mono, text } from "./kit";

const at = local("stat");

const COLS = 13, ROWS = 6, GAP = 73, X0 = 102, Y0 = 1122, R = 17;
/** the dot that will swell into the next scene */
export const SEED_DOT: [number, number] = [X0 + 6 * GAP, Y0 + 3 * GAP];
const isLit = (c: number, r: number) => (c === 6 && r === 3) || rand(c * 7.3 + r * 13.7 + 2) < 0.14;

/** 3.62–8.70s · "Dianggarkan 1.2 bilion orang di seluruh dunia mengalami migrain." */
export const Stat: React.FC = () => {
  const f = useFrame();
  const n = useCount(0, 1.2, at(4.3), at(5.25), ease.out);
  const land = ramp(f, at(4.3), at(5.3), ease.outExpo);
  const bil = spring(f, { delay: at(5.7), stiffness: 130, damping: 10 });
  const world = at(6.4);
  const end = at(8.7);
  const swell = ramp(f, end - 8, end + 12, ease.in); // seed dot grows as the next scene irises out of it

  return (
    <Enter kind="wipeLeft" dur={10} background={color.ink} edge={color.vermilion}>
      <Head tone={color.ivory} right="Anggaran global" />
      <At y={236}>
        <Typewriter text="Dianggarkan —" start={at(3.74)} cps={26} cursor={false} style={mono(30, color.sage)} />
      </At>

      {/* 1.2 — compresses as it lands */}
      <At x={70} y={300}>
        <Fit width={850}>
          <Stretch size={590} wdth={lerp(150, 92, land)} style={{ color: color.ivory, opacity: f >= at(4.2) ? 1 : 0, letterSpacing: "-0.02em" }}>
            {n.toFixed(1)}
          </Stretch>
        </Fit>
      </At>
      <At y={834}>
        <Stretch size={188} wdth={lerp(50, 128, bil)} style={{ color: color.vermilion, opacity: f >= at(5.7) ? 1 : 0 }}>
          bilion
        </Stretch>
      </At>

      {/* the world as a field of dots — the lit ones ache */}
      <svg style={{ position: "absolute", inset: 0 }} width="1080" height="1920" viewBox="0 0 1080 1920">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          const dist = Math.hypot(c - 6, r - 3);
          const p = spring(f, { delay: at(3.9) + dist * 2.2, stiffness: 240, damping: 14 });
          const flare = ramp(f, world + dist * 2.6, world + dist * 2.6 + 8);
          const lit = isLit(c, r) && flare > 0;
          const seed = c === 6 && r === 3;
          const throb = lit ? 1 + 0.22 * Math.max(0, Math.sin((f - world) / 4.2 - dist * 0.7)) : 1;
          return (
            <circle
              key={i}
              cx={X0 + c * GAP}
              cy={Y0 + r * GAP}
              r={(lit ? lerp(1, 1.18, flare) : 1) * R * p * throb + (seed ? swell * 60 : 0)}
              fill={seed && swell > 0 ? color.ivory : lit ? color.vermilion : color.ivory}
              opacity={lit ? 1 : 0.2}
            />
          );
        })}
      </svg>

      <At y={1598} w={912}>
        <Words
          text="orang di seluruh dunia mengalami migrain."
          cues={[at(6.4), at(6.68), at(6.8), at(7.3), at(7.64), at(8.2)]}
          dur={14}
          style={text(62, color.ivory, 500)}
          accent={{ 5: { color: color.vermilion, fontWeight: 700 } }}
        />
      </At>
    </Enter>
  );
};
