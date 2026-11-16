import React from "react";
import { spring } from "remotion";
import { C, CX } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { antic, clamp01, easeInOutCubic, hopY, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { OtakAt, Pt } from "../components/SiOtak";
import { Beanbag, MoodBar, TaskSheet } from "../components/Props";
import { DrawPath } from "../components/Fx";
import { SourceCaption } from "./S3bKajian";

// "Tugasan yang bosan atau menakutkan buat mood jatuh. Jadi, otak kita pilih benda lain yang lebih senang dan rasa lega sekejap."
export const S3cMood: React.FC<SceneProps> = ({ f, cam }) => {
  const tugasan = F("tugasan");
  const bosan = F("bosan");
  const takut = F("menakutkan");
  const jatuh = F("jatuh");
  const jadi = F("jadi2");
  const otak = F("otak2");
  const pilih = F("pilih");
  const lebih = F("lebih");
  const rasa = F("rasa3");
  const lega = F("lega");
  const sekejap = F("sekejap");
  const push = clamp01((f - S.s3c) / (S.s4 - S.s3c));
  const part2 = f >= jadi;
  const clearOut = ramp(f, jadi - 4, jadi + 2); // part-1 props leave

  // ---------- part 1: mood bar ----------
  // elastic drop on "jatuh"
  const drop = spring({ frame: f - jatuh, fps: 30, config: { damping: 5, stiffness: 140, mass: 0.7 } });
  const level = Math.max(0.05, 0.92 - 0.12 * pop(f, bosan) - 0.14 * pop(f, takut) - 0.56 * drop);
  const barIn = pop(f, tugasan + 3, { damping: 11, stiffness: 180 });

  // sheet slams down on "Tugasan"
  const sheetY = 880 - 700 * (1 - clamp01((f - tugasan + 3) / 3)) ** 2;
  const sheetSq = wobble(f, tugasan, 0.18, 0.9, 0.3);
  const scared = f >= takut;

  // ---------- part 2: run to the beanbag ----------
  const runU = easeInOutCubic(ramp(f, pilih, lega - 8));
  const jumpU = ramp(f, lega - 8, lega);
  const runX = 330 + (720 - 330) * runU;
  const ox = part2 ? (f < pilih ? 555 + (330 - 555) * pop(f, jadi, { damping: 14, stiffness: 160 }) : runX) : 555;
  const runPhase = f >= pilih && f < lega - 8 ? (f - pilih) * 0.9 : 0;
  const onBag = f >= lega;
  const oy = part2 ? (onBag ? 1080 : 1170 - (1170 - 1080) * jumpU - 110 * Math.sin(Math.PI * jumpU)) : 1170;
  const lf: Pt = part2 && !onBag ? [158 + Math.sin(runPhase) * 40, 446 - Math.max(0, Math.cos(runPhase)) * 30] : [158, 446];
  const rf: Pt = part2 && !onBag ? [242 - Math.sin(runPhase) * 40, 446 - Math.max(0, -Math.cos(runPhase)) * 30] : [242, 446];
  const runArms = part2 && !onBag && f >= pilih;
  const lh: Pt = onBag ? [-30, 250] : runArms ? [20 - Math.sin(runPhase) * 40, 330] : scared && !part2 ? [80, 240] : [6, 372];
  const rh: Pt = onBag ? [430, 250] : runArms ? [380 + Math.sin(runPhase) * 40, 330] : scared && !part2 ? [320, 240] : [394, 372];

  let sq = 1;
  if (!part2) sq = 1 - 0.18 * drop * (f >= jatuh ? 1 : 0) + (f >= jatuh ? 0.06 * Math.sin((f - jatuh) * 0.5) * Math.exp(-(f - jatuh) * 0.15) : 0);
  else sq = 1 - 0.1 * antic(f, pilih, 4) - wobble(f, lega, 0.2, 0.8, 0.25) + (f >= pilih && !onBag ? 0.04 * Math.abs(Math.sin(runPhase)) : 0);

  const eyes = part2 ? (onBag ? "happy" : "open") : scared ? "shock" : "open";
  const mouth = part2 ? (onBag ? "grin" : f >= pilih ? "grimace" : "wavy") : f >= jatuh ? "sad" : scared ? "grimace" : f >= bosan ? "flat" : "smile";

  const bg = mixColor(C.cream, C.pink, part2 ? 0.1 : 0.18);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 900]}
      decor={<Decor seed="s3c" f={f} colors={[C.pink, C.teal, C.yellow]} opacity={0.14} />}
      keys={
        <>
          {/* part 1 tags */}
          <At y={175}>
            <Kinetic text="BOSAN" at={bosan} f={f} size={140} color={C.yellow} stroke={C.ink} strokeW={11} depth={9} tilt={-3} out={jadi - 5} />
          </At>
          <At y={335}>
            <Kinetic text="MENAKUTKAN" at={takut} f={f} size={118} color={C.coral} stroke={C.ink} strokeW={10} depth={8} tilt={2} stagger={1.1} out={jadi - 5} />
          </At>
          {/* part 2: arrow chain TUGAS TAK BEST -> LARI -> LEGA SEKEJAP */}
          <At x={90} y={150} anchor="left">
            <Kinetic text="TUGAS TAK BEST" at={jadi} f={f} size={86} color={C.ink} stroke={C.white} strokeW={8} stagger={1} />
          </At>
          <At x={560} y={296} anchor="left">
            <Kinetic text="LARI!" at={pilih} f={f} size={128} color={C.teal} stroke={C.ink} strokeW={10} depth={8} tilt={-4} />
          </At>
          <At x={96} y={470} anchor="left" style={{ gap: 22, alignItems: "flex-end" }}>
            <Kinetic text="LEGA" at={lega} f={f} size={132} color={C.yellow} stroke={C.ink} strokeW={11} depth={9} />
            <Kinetic text="SEKEJAP" at={sekejap} f={f} size={84} color={C.ink} stroke={C.white} strokeW={8} stagger={1} tilt={-5} style={{ marginBottom: 10 }} />
          </At>
          <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <DrawPath d="M 330 250 C 360 330, 430 360, 540 352" f={f} from={otak} dur={pilih - otak} color={C.ink} width={11} head />
            <DrawPath d="M 552 382 C 470 392, 360 408, 300 458" f={f} from={lebih} dur={rasa - lebih} color={C.ink} width={11} head />
          </svg>
          <SourceCaption f={f} at={tugasan - 2} out={jadi - 6} />
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {/* the task sheet (stays around in part 2, smaller, on the left) */}
        <g
          transform={`translate(${part2 ? 165 : 250} ${part2 ? 1000 : sheetY}) scale(${(part2 ? 0.52 : 0.8) * (1 + sheetSq * 0.6)} ${(part2 ? 0.52 : 0.8) * (1 - sheetSq)}) rotate(${scared && !part2 ? Math.sin(f * 2) * 3 : -4})`}
        >
          <TaskSheet bored={f >= bosan ? pop(f, bosan) : 0} scary={f >= takut ? pop(f, takut) : 0} t={f} />
        </g>
        {/* mood bar */}
        {clearOut < 1 ? (
          <g transform={`translate(840 1150) scale(${0.92 * barIn * (1 - clearOut)})`}>
            <MoodBar level={level} />
          </g>
        ) : null}
        {/* beanbag */}
        {part2 ? (
          <g transform={`translate(760 1176) scale(${pop(f, jadi + 2, { damping: 11, stiffness: 180 })})`}>
            <Beanbag squash={Math.max(0, wobble(f, lega, 1, 0.8, 0.22))} />
          </g>
        ) : null}
        {/* speed lines while running */}
        {runArms
          ? [0, 1, 2].map((i) => (
              <path key={i} d={`M ${runX - 230 - i * 30} ${930 + i * 60} l -90 0`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
            ))
          : null}
        <OtakAt
          x={ox}
          y={oy + (part2 && !onBag ? hopY(f % 8, 0, 10, 8) : 0)}
          s={0.88 - 0.1 * pop(f, jadi, { damping: 14, stiffness: 160 })}
          t={f}
          squash={sq}
          lean={runArms ? 10 : onBag ? -6 : scared && !part2 ? -6 : 0}
          eyes={eyes}
          mouth={mouth}
          brows={part2 ? (onBag ? "raised" : "worried") : scared ? "worried" : "none"}
          droop={!part2 && f >= bosan && !scared ? 0.45 : 0}
          sweat={(scared && !part2) || runArms ? 1 : 0}
          look={part2 ? (f < pilih ? [-1, 0.3] : [1, 0]) : [-1, 0.1]}
          lh={lh}
          rh={rh}
          lf={lf}
          rf={rf}
        />
        {/* "sekejap": tiny ticking clock above the beanbag */}
        {f >= sekejap ? (
          <g transform={`translate(860 820) scale(${pop(f, sekejap, { damping: 8, stiffness: 220 })})`}>
            <circle r={44} fill={C.white} stroke={C.ink} strokeWidth={7} />
            <path d={`M 0 0 L 0 -30`} transform={`rotate(${(f - sekejap) * 18})`} stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
            <circle r={6} fill={C.ink} />
          </g>
        ) : null}
      </Stage>
    </SceneShell>
  );
};
