import React from "react";
import { C, CX } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, clamp01, hopSquash, hopY, pathSpring, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Duster, Laptop, SparkleStar } from "../components/Props";
import { DustPuffs } from "../components/Fx";

const OX = CX - 30;
const OY = 1170;
const OS = 1.02;

// "Tiba-tiba rasa nak mengemas bilik jadi best pulak."
export const S2Mengemas: React.FC<SceneProps> = ({ f, cam }) => {
  const tiba = F("tibatiba");
  const rasa = F("rasa");
  const grab = F("mengemas");
  const jadi = F("jadi");
  const best = F("best");
  const pulak = F("pulak");
  const push = clamp01((f - S.s2) / (S.s3a - S.s2));

  const grabbed = f >= grab;
  const sparkle = f >= rasa;
  // dusting: right hand sweeps in an arc once the duster is in hand
  const dustT = Math.max(0, f - grab - 3);
  const sweep = grabbed ? Math.sin(dustT * 0.62) : 0;
  const reach: Pt = [500, 330];
  const rh: Pt = !grabbed
    ? pathSpring(f, [
        [0, [394, 372]],
        [grab - 5, [470, 300]],
      ], { damping: 14, stiffness: 200 })
    : f < grab + 4
      ? [reach[0] - (reach[0] - 360) * ramp(f, grab, grab + 4), reach[1] - (reach[1] - 150) * ramp(f, grab, grab + 4)]
      : [370 + sweep * 60, 140 + Math.abs(sweep) * 20];
  const lh: Pt = sparkle ? [30 + Math.sin(f * 0.4) * 6, 330] : [6, 372];
  const duAngle = grabbed ? -15 + sweep * 28 : 0;

  // anticipation crouch before the grab, squash/stretch on the snap, hop on "pulak"
  const sq =
    1 - 0.12 * antic(f, grab, 5) + 0.1 * pop(f, grab, { damping: 8, stiffness: 260 }) * (1 - ramp(f, grab + 2, grab + 10)) - wobble(f, best, 0.1, 0.9, 0.3);
  const y = OY + hopY(f, pulak, 40, 9);
  const sqAll = sq * hopSquash(f, pulak, 9);
  const lean = grabbed ? sweep * 4 : f >= rasa ? 4 * pop(f, rasa) : 0;

  // duster tip in screen space (for dust puffs)
  const tipAt = (fr: number): [number, number] => {
    const t = Math.max(0, fr - grab - 3);
    const sw = Math.sin(t * 0.62);
    const hx = 370 + sw * 60;
    const hy = 140 + Math.abs(sw) * 20;
    const a = ((-15 + sw * 28) * Math.PI) / 180;
    const tx = hx + Math.sin(a) * 230;
    const ty = hy - Math.cos(a) * 230;
    return [OX + (tx - 200) * OS, OY + (ty - 450) * OS];
  };

  // the duster waiting in its pot, wiggling enticingly, then flying to the hand
  const potX = 845;
  const potY = 1176;
  const flyU = ramp(f, grab - 2, grab + 1);

  return (
    <SceneShell
      bg={C.cream}
      cam={cam}
      push={push}
      focus={[OX, 900]}
      decor={<Decor seed="s2" f={f} colors={[C.teal, C.yellow, C.pink]} opacity={0.14} />}
      keys={
        <>
          <At y={160}>
            <Kinetic text="TIBA-TIBA," at={tiba} f={f} size={96} mode="hop" color={C.ink} stroke={C.white} strokeW={7} stagger={1.2} />
          </At>
          <At y={268}>
            <Kinetic text="MENGEMAS" at={grab} f={f} size={150} mode="hop" color={C.teal} stroke={C.ink} strokeW={11} depth={9} stagger={1.3} tilt={-2} />
          </At>
          <At y={430} style={{ gap: 26 }}>
            <Kinetic text="JADI" at={jadi} f={f} size={130} mode="hop" color={C.ink} stroke={C.white} strokeW={8} stagger={1.3} />
            <Kinetic text="BEST" at={best} f={f} size={150} mode="hop" color={C.yellow} stroke={C.ink} strokeW={11} depth={9} stagger={1.3} tilt={3} />
          </At>
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {/* closed laptop, put aside */}
        <g transform="translate(170 1176) rotate(-4)">
          <Laptop w={200} open={0} />
        </g>
        {/* pot */}
        <g transform={`translate(${potX} ${potY})`}>
          <path d="M -60 -110 L 60 -110 L 46 0 L -46 0 Z" fill={C.coral} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <rect x={-70} y={-128} width={140} height={26} rx={8} fill={C.coral} stroke={C.ink} strokeWidth={9} />
        </g>
        {!grabbed ? (
          <g
            transform={`translate(${potX + (OX + (470 - 200) * OS - potX) * flyU} ${potY - 100 + (OY + (300 - 450) * OS - potY + 100) * flyU}) rotate(${Math.sin(f * 0.5) * 6 * (f >= rasa ? 1.6 : 1) - 8 * flyU}) scale(${0.95})`}
          >
            <Duster t={f} />
          </g>
        ) : null}
        {f >= rasa && !grabbed
          ? [0, 1].map((i) => (
              <g key={i} transform={`translate(${potX - 70 + i * 140} ${potY - 380 + i * 60}) rotate(${f * 4}) scale(${0.5 + 0.5 * Math.abs(Math.sin(f * 0.3 + i))})`}>
                <SparkleStar r={22} />
              </g>
            ))
          : null}
        <OtakAt
          x={OX}
          y={y}
          s={OS}
          t={f}
          squash={sqAll}
          lean={lean}
          eyes={sparkle ? "sparkle" : "open"}
          sparkleSpin={f * 4}
          mouth={sparkle ? "grin" : f >= tiba + 4 ? "o" : "smile"}
          brows={sparkle ? "raised" : "none"}
          look={f < rasa ? [1, -0.3] : [0, 0]}
          lh={lh}
          rh={rh}
          rItem={grabbed ? <Duster t={f} fluff={0.6} /> : undefined}
          rItemAngle={duAngle}
        />
        {grabbed ? <DustPuffs f={f} from={grab + 4} to={S.s3a} at={tipAt} /> : null}
        {/* sparkle burst on "best" */}
        {f >= best
          ? Array.from({ length: 7 }, (_, i) => {
              const d = f - best;
              const a = (i / 7) * Math.PI * 2 + 0.3;
              const r = 150 + 170 * (1 - Math.exp(-d * 0.25));
              const s = Math.max(0, pop(f, best + i * 0.5) * (1 - clamp01((d - 14) / 10)));
              return (
                <g key={i} transform={`translate(${OX + Math.cos(a) * r} ${880 + Math.sin(a) * r * 0.8}) rotate(${d * 6}) scale(${s})`}>
                  <SparkleStar r={i % 2 ? 20 : 30} color={i % 3 === 0 ? C.yellow : i % 3 === 1 ? C.white : C.teal} />
                </g>
              );
            })
          : null}
      </Stage>
    </SceneShell>
  );
};
