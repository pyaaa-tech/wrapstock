import React from "react";
import { useFrame } from "../platform";
import { Enter, Parallax, pointsToPath } from "../motion/fx";
import { ease, lerp, noise, ramp } from "../motion/math";
import { Mask, Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Head, serif, text } from "./kit";

const at = local("rest");
const BLOB: [number, number] = [540, 1010];
const SCROLL = 690;
/** where the breathing shape sits once the page has scrolled — the next scene irises out of it */
export const BREATH_CENTRE: [number, number] = [BLOB[0], BLOB[1] - SCROLL * 0.35];

/** A soft organic shape that breathes — the visual opposite of the pulse rings. */
const Breath: React.FC<{ r: number; fill: string; seed: number; opacity: number }> = ({ r, fill, seed, opacity }) => {
  const f = useFrame();
  const breath = 1 + Math.sin((f / 120) * Math.PI * 2 - 1.2) * 0.07; // one breath every 4 seconds
  const pts: [number, number][] = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const rr = r * breath * (1 + noise(f / 70 + i * 1.9, seed) * 0.16);
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  });
  return <path d={pointsToPath(pts, true, true)} fill={fill} opacity={opacity} />;
};

/** 50.96–57.00s · "Dan kalau badan terasa penat, jangan lupa beri ruang untuk diri sendiri berehat. Luangkan masa untuk self-care…" */
export const Rest: React.FC = () => {
  const f = useFrame();
  const turn = ramp(f, at(55.4) - 14, at(55.4) + 22, ease.breathe);
  const scroll = turn * SCROLL;
  const leave = 1 - ramp(f, at(55.4) - 14, at(55.4) + 2, ease.inOut); // earlier lines dissolve as the page moves on
  const open = ramp(f, at(53.7), at(53.7) + 44, ease.breathe); // "ruang": the letters make room

  return (
    <Enter kind="bloom" dur={22} background={color.ivory}>
      <Parallax depth={0.35} y={-scroll}>
        <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="1080" height="1920" viewBox="0 0 1080 1920">
          <g transform={`translate(${BLOB[0]} ${BLOB[1]})`}>
            <Breath r={520} fill={color.bone} seed={2} opacity={0.9} />
            <Breath r={390} fill={color.sage} seed={7} opacity={0.75} />
          </g>
        </svg>
      </Parallax>
      <Head tone={color.burgundy} right="Tenang" />

      <Parallax depth={1} y={-scroll}>
        <div style={{ opacity: leave }}>
        <At y={300} w={912}>
          <Words text="Kalau badan terasa penat," cues={[at(51.36), at(51.6), at(52.04), at(52.3)]} dur={20} style={text(60, color.burgundy, 400)} />
        </At>
        <At y={440}>
          <Words text="jangan lupa beri" cues={[at(52.76), at(53.02), at(53.44)]} dur={22} style={serif(118, color.burgundy)} />
        </At>
        <At x={84} y={622} style={{ opacity: ramp(f, at(53.7), at(53.7) + 14, ease.breathe) }}>
          <Stretch size={150} wght={300} wdth={lerp(60, 150, open)} style={{ color: color.burgundy, letterSpacing: `${lerp(-0.02, 0.2, open)}em` }}>
            ruang
          </Stretch>
        </At>
        <At y={822}>
          <Words text="untuk diri sendiri" cues={[at(53.98), at(54.18), at(54.56)]} dur={22} style={serif(118, color.burgundy)} />
        </At>
        </div>
        <At x={70} y={910}>
          <Mask p={ramp(f, at(54.72), at(54.72) + 34, ease.breathe)} dir="up" style={{ padding: "50px 40px 60px 0" }}>
            <div style={serif(318, color.burgundy)}>berehat.</div>
          </Mask>
        </At>

        <At y={2050} w={912}>
          <Words text="Luangkan masa untuk" cues={[at(55.4), at(55.88), at(56.16)]} dur={20} style={text(60, color.sageDeep, 400)} />
        </At>
        <At x={70} y={2090}>
          <Mask p={ramp(f, at(56.5), at(56.5) + 30, ease.breathe)} dir="up" style={{ padding: "50px 40px 60px 0" }}>
            <div style={serif(300, color.sageDeep)}>self-care</div>
          </Mask>
        </At>
      </Parallax>
    </Enter>
  );
};
