import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CX } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, backOut, clamp01, hopSquash, hopY, mixColor, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt } from "../components/SiOtak";
import { AlarmClock, Laptop } from "../components/Props";
import { FONT_KEY } from "../theme";

// "Yoo, yoo. Deadline esok doww."
export const S1Deadline: React.FC<SceneProps> = ({ f, cam }) => {
  const fl = Math.max(f, 0); // loop copy (negative f) holds the first frame
  const yoo = F("yoo");
  const yoo2 = F("yoo2");
  const dl = F("deadline");
  const esok = F("esok");
  const doww = F("doww");
  const push = clamp01(fl / (S.s2 - S.s1));

  // Hard punch-in on "Deadline": 2-frame snap with overshoot, after a tiny pull-back (anticipation).
  const punch = 1 - 0.04 * antic(fl, dl, 3) + 0.25 * backOut(ramp(fl, dl, dl + 3), 2.6);
  const panic = fl >= dl;
  const tremble = fl >= doww ? Math.sin(fl * 2.6) * 5 : 0;

  // Si Otak hops on each "yoo"
  const y = 1170 + hopY(fl, yoo, 46, 9) + hopY(fl, yoo2, 46, 9);
  const sq = hopSquash(fl, yoo, 9) * hopSquash(fl, yoo2, 9) - wobble(fl, dl, 0.12, 0.9, 0.3) - (fl >= doww ? 0.08 * (1 - Math.exp(-(fl - doww) * 0.3)) : 0);

  // ticking: twice per second, harder from "Deadline"
  const tickPeriod = 15;
  const tickPhase = ((fl % tickPeriod) + tickPeriod) % tickPeriod;
  const pulse = panic ? tickPhase / tickPeriod : 0;
  const redFlash = Math.max(1 - ramp(fl, dl, dl + 10), 1 - ramp(fl, esok, esok + 10)) * (fl >= dl ? 1 : 0);
  const bg = mixColor(C.cream, "#FFD9D2", panic ? 0.55 + 0.45 * redFlash : 0);

  const screen = (
    <g>
      <rect x={-92} y={-58} width={184} height={116} rx={10} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <rect x={-92} y={-58} width={184} height={30} rx={8} fill={C.coral} stroke={C.ink} strokeWidth={5} />
      <text x={0} y={34} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={58} fill={C.ink}>
        ESOK
      </text>
      <circle cx={0} cy={14} r={66} fill="none" stroke={C.coral} strokeWidth={7} opacity={panic ? 1 : 0} strokeDasharray="6 10" />
    </g>
  );

  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 930]}
      decor={
        <>
          <Decor seed="s1" f={fl} kind="dots" colors={[C.coral]} opacity={0.16} />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 48%, rgba(255,90,95,${0.28 * redFlash + (panic ? 0.1 + 0.08 * (1 - pulse) : 0)}) 0%, rgba(255,90,95,0) 62%)`,
            }}
          />
        </>
      }
      keys={
        <>
          <At y={175}>
            <Kinetic text="DEADLINE" at={dl} f={fl} size={150} mode="slam" color={C.coral} stroke={C.ink} strokeW={11} depth={9} tilt={-3} />
          </At>
          <At y={345}>
            <Kinetic text="ESOK!" at={esok} f={fl} size={200} mode="slam" color={C.yellow} stroke={C.ink} strokeW={12} depth={10} tilt={2} />
          </At>
        </>
      }
    >
      <AbsoluteFill style={{ transform: `scale(${punch})`, transformOrigin: "740px 900px" }}>
        <Floor y={1176} />
        <Stage>
          <g transform={`translate(${CX - 285} ${760}) rotate(${-12 + (panic ? Math.sin(fl * 1.9) * 4 : 0)}) scale(${0.95 + 0.06 * (1 - pulse) * (panic ? 1 : 0)})`}>
            <AlarmClock r={108} sec={fl / 15} pulse={pulse} ring={fl >= doww ? fl : 0} />
          </g>
          <g transform={`translate(${tremble} 0)`}>
            <OtakAt
              x={CX - 20}
              y={y}
              s={1.02}
              t={fl}
              squash={sq}
              eyes={panic ? "shock" : "open"}
              mouth={panic ? (fl >= doww ? "grimace" : "o") : "grin"}
              brows={panic ? "worried" : "raised"}
              sweat={fl >= esok ? 1 : 0}
              look={panic ? [0, 0] : [0.2, -0.2]}
              lh={panic ? [70 + Math.sin(fl * 1.3) * 4, 230] : [6, 372 + hopY(fl, yoo, 30, 9)]}
              rh={[346, 392]}
              front={
                <g transform={`translate(446 398) rotate(${-8 + Math.sin(fl * 0.3) * 1.5 + (panic ? Math.sin(fl * 2.2) * 2 : 0)})`}>
                  <Laptop w={214} open={1} screen={screen} />
                </g>
              }
            />
          </g>
          {fl >= doww
            ? [0, 1, 2].map((i) => {
                const d = fl - doww - i * 2;
                if (d < 0) return null;
                const len = 30 + 20 * clamp01(d / 4);
                const a = -60 + i * 60;
                return (
                  <g key={i} transform={`translate(${CX - 20} 952) rotate(${a})`} opacity={clamp01(1 - (d - 10) / 8)}>
                    <path d={`M 0 ${-215 - d * 2} L 0 ${-215 - d * 2 - len}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
                  </g>
                );
              })
            : null}
        </Stage>
      </AbsoluteFill>
    </SceneShell>
  );
};
