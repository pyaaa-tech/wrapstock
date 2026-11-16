import React from "react";
import { C, CX } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, easeOutCubic, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Duster } from "../components/Props";
import { DrawPath } from "../components/Fx";

const OX = CX - 30; // same spot as scene 2: match cut
const OY = 1170;
const OS = 1.02;

// "Haa, ni bukan sebab kau malas."
export const S3aBukanMalas: React.FC<SceneProps> = ({ f, cam }) => {
  const haa = F("haa");
  const ni = F("ni");
  const bukan = F("bukan");
  const sebab = F("sebab");
  const malas = F("malas");
  const push = clamp01((f - S.s3a) / (S.s3b - S.s3a));

  // toss the duster away on "Haa"
  const toss = ramp(f, haa, haa + 12);
  const dx = OX + (370 - 200) * OS + 520 * easeOutCubic(toss);
  const dy = OY + (140 - 450) * OS - 260 * Math.sin(Math.PI * toss * 0.8) + 300 * toss * toss;

  // finger raise on "Haa", wag "no-no" from "ni" to the end
  const up = pop(f, haa + 1, { damping: 10, stiffness: 220 });
  const wag = f >= ni ? Math.sin((f - ni) * 0.75) * 34 : 0;
  const rh: Pt = [394 - 14 * up + wag, 372 - 250 * up];
  const lh: Pt = [70, 360 - 40 * pop(f, malas)];
  const headShake = f >= malas ? Math.sin((f - malas) * 0.9) * Math.exp(-(f - malas) * 0.06) : 0;

  const bg = mixColor(C.cream, C.yellow, 0.32);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[OX, 900]}
      decor={<Decor seed="s3a" f={f} kind="rays" colors={[C.yellow]} opacity={0.35} cx={OX} cy={860} />}
      keys={
        <>
          <At y={170} style={{ gap: 28 }}>
            <Kinetic text="BUKAN" at={bukan} f={f} size={118} color={C.ink} stroke={C.white} strokeW={8} stagger={1.2} />
            <Kinetic text="SEBAB" at={sebab} f={f} size={118} color={C.ink} stroke={C.white} strokeW={8} stagger={1.2} />
          </At>
          <At y={318}>
            <div style={{ position: "relative" }}>
              <Kinetic text="MALAS" at={malas} f={f} size={210} mode="slam" color={C.coral} stroke={C.ink} strokeW={12} depth={10} tilt={-3} />
              <svg width={620} height={260} style={{ position: "absolute", left: -40, top: -20, overflow: "visible" }}>
                <DrawPath d="M 20 150 Q 280 110 600 96" f={f} from={malas + 4} dur={7} color={C.ink} width={26} />
              </svg>
            </div>
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {toss < 1 ? (
          <g transform={`translate(${dx} ${dy}) rotate(${-15 + toss * 420})`}>
            <Duster t={f} fluff={0.6} />
          </g>
        ) : null}
        <OtakAt
          x={OX}
          y={OY}
          s={OS}
          t={f}
          squash={1 - wobble(f, haa, 0.12, 0.9, 0.3) - wobble(f, malas, 0.08, 0.9, 0.3)}
          lean={-3 * up}
          eyes={f < haa + 2 ? "sparkle" : "open"}
          mouth={f < ni ? "o" : f < malas ? "smirk" : "smile"}
          brows={f < haa + 2 ? "raised" : "raised"}
          look={[headShake * 0.8, -0.1]}
          lh={lh}
          rh={rh}
          rItem={
            up > 0.3 ? (
              <g>
                <path d="M 0 -6 L 0 -46" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
                <path d="M 0 -6 L 0 -46" stroke={C.pink} strokeWidth={10} strokeLinecap="round" />
              </g>
            ) : undefined
          }
        />
        {/* motion lines for the wag */}
        {f >= ni
          ? [0, 1].map((i) => (
              <path
                key={i}
                d={`M ${OX + (394 - 200) * OS + (i ? 70 : -70)} ${OY + (60 - 450) * OS} q ${i ? 16 : -16} 26 0 52`}
                stroke={C.ink}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                opacity={0.5 + 0.5 * Math.abs(Math.sin((f - ni) * 0.75))}
              />
            ))
          : null}
      </Stage>
    </SceneShell>
  );
};
