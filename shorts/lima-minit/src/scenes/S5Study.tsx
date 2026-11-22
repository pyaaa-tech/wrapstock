import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, CX, FONT_CAP, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, easeInOutCubic, hopSquash, hopY, mixColor, pop, ramp, wobble } from "../lib/anim";
import { At, Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { Kinetic } from "../components/Kinetic";
import { DrawPath } from "../components/Fx";
import { AlarmPing, ChartMarker, CH, CURVE_SNOOZE, SleepChart } from "../components/Sets";
import { Clipboard, MapPin } from "../components/Bedroom";
import { OtakAt, Pt } from "../components/SiOtak";

/** Small source caption at the bottom of the keyword area. */
export const SourceCaption: React.FC<{ f: number; at: number; out?: number; text: string }> = ({ f, at, out, text }) => {
  const a = ramp(f, at, at + 10) * (out !== undefined ? 1 - ramp(f, out, out + 6) : 1);
  if (a <= 0) return null;
  return (
    <At y={598} style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div
        style={{
          fontFamily: FONT_CAP,
          fontWeight: 600,
          fontSize: 30,
          color: C.ink,
          background: "rgba(255,255,255,0.8)",
          border: `4px solid ${C.ink}`,
          borderRadius: 999,
          padding: "8px 26px",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </At>
  );
};
export const SOURCE = "Sundelin et al., 2023 · Journal of Sleep Research";

const SnoozeButton: React.FC<{ pressed: number }> = ({ pressed }) => (
  <g>
    <rect x={-120} y={-20} width={240} height={40} rx={14} fill={C.ink} />
    <rect x={-104} y={-70 + 26 * pressed} width={208} height={70 - 26 * pressed} rx={18} fill={C.yellow} stroke={C.ink} strokeWidth={8} />
    <text x={0} y={-22 + 13 * pressed} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={42} fill={C.ink}>
      SNOOZE
    </text>
  </g>
);

// [excited] "Menariknya, satu kajian kecil di Sweden jumpa, snooze sekejap tak nampak merosakkan."
export const S5Study: React.FC<SceneProps> = ({ f, cam }) => {
  const menarik = F("menariknya");
  const kajian = F("kajian");
  const kecil = F("kecil");
  const sweden = F("sweden");
  const snooze = F("snooze");
  const sekejap = F("sekejap");
  const tak = F("tak");
  const meros = F("merosakkan");
  const push = clamp01((f - S.s5) / (S.s5b - S.s5));
  const part2 = f >= snooze - 4;
  const clipIn = pop(f, kajian, { damping: 10, stiffness: 200 });
  const clipS = 0.85 - 0.25 * pop(f, kecil, { damping: 9, stiffness: 220 }); // "kecil": it shrinks
  const pinIn = pop(f, sweden, { damping: 9, stiffness: 220 });
  const swapOut = ramp(f, snooze - 4, snooze + 2);
  const btnIn = pop(f, snooze, { damping: 10, stiffness: 200 });
  const press = f >= sekejap ? Math.max(0, 1 - Math.abs(f - sekejap - 2) / 5) : 0;
  const rh: Pt = part2 ? [394 + 40 * (1 - Math.min(1, Math.abs(f - sekejap) / 6)), 372 - 10] : [394, 260 + Math.sin(f * 0.5) * 20];
  const bg = mixColor(C.cream, C.yellow, 0.28);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 900]}
      decor={<Decor seed="s5" f={f} kind="rays" colors={[C.yellow]} opacity={0.35} cx={330} cy={900} />}
      keys={
        <>
          <At y={175} style={{ gap: 26 }}>
            <Kinetic text="KAJIAN" at={kajian} f={f} size={130} color={C.teal} stroke={C.ink} strokeW={10} depth={8} out={snooze - 6} />
            <Kinetic text="KECIL" at={kecil} f={f} size={96} color={C.ink} stroke={C.white} strokeW={8} out={snooze - 6} />
          </At>
          <At y={165}>
            <Kinetic text="SNOOZE SEKEJAP" at={snooze} f={f} size={100} color={C.yellow} stroke={C.ink} strokeW={10} depth={8} stagger={1} />
          </At>
          <At y={325} style={{ gap: 24 }}>
            <Kinetic text="TAK" at={tak} f={f} size={94} color={C.ink} stroke={C.white} strokeW={8} />
            <Kinetic text="MEROSAKKAN" at={meros} f={f} size={98} color={C.teal} stroke={C.ink} strokeW={10} depth={8} stagger={0.9} />
          </At>
          <SourceCaption f={f} at={kajian + 4} text={SOURCE} />
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        {!part2 || swapOut < 1 ? (
          <g transform={`translate(0 ${400 * swapOut * swapOut})`}>
            <g transform={`translate(745 1020) scale(${clipIn * clipS}) rotate(${6 + Math.sin(f * 0.2) * 2})`}>
              <Clipboard label="KAJIAN" />
            </g>
            {pinIn > 0.01 ? (
              <g transform={`translate(800 ${900 - 30 * clipS}) scale(${0.85 * pinIn})`}>
                <MapPin label="SWEDEN" />
              </g>
            ) : null}
          </g>
        ) : null}
        {part2 ? (
          <g transform={`translate(730 1060) scale(${btnIn})`}>
            <SnoozeButton pressed={press} />
          </g>
        ) : null}
        {part2 ? (
          <g>
            {/* big check mark draws on with "merosakkan" */}
            <DrawPath d="M 610 860 L 690 940 L 880 720" f={f} from={meros} dur={8} color={C.teal} width={30} />
          </g>
        ) : null}
        <OtakAt
          x={330}
          y={1170 + hopY(f, menarik, 60, 11)}
          s={0.88}
          t={f}
          squash={hopSquash(f, menarik, 11) - wobble(f, sekejap, 0.08, 0.9, 0.3)}
          eyes="sparkle"
          sparkleSpin={f * 4}
          mouth="grin"
          brows="raised"
          look={[1, 0]}
          lh={[10, 300]}
          rh={rh}
        />
      </Stage>
    </SceneShell>
  );
};

// "Mungkin sebab kau kurang terbangun dari tidur yang paling nyenyak."
export const S5bSnoozeChart: React.FC<SceneProps> = ({ f, cam }) => {
  const mungkin = F("mungkin");
  const kurang = F("kurang");
  const terbangun = F("terbangun2");
  const dari = F("dari");
  const paling = F("paling");
  const nyenyak = F("nyenyak2");
  const push = clamp01((f - S.s5b) / (S.s6 - S.s5b));
  const len = getLength(CURVE_SNOOZE);
  // first part of the night is already drawn; the snooze stretch draws on with "kurang terbangun"
  let pSnoozeStart = 0.62;
  for (let k = 0; k <= 200; k++) {
    const pt = getPointAtLength(CURVE_SNOOZE, (len * k) / 200);
    if (pt && pt.x >= 640) {
      pSnoozeStart = k / 200;
      break;
    }
  }
  const p = pSnoozeStart + (1 - pSnoozeStart) * easeInOutCubic(ramp(f, kurang - 4, terbangun + 2));
  const chartIn = pop(f, mungkin - 1, { damping: 13, stiffness: 190 });
  const snoozeStart = getPointAtLength(CURVE_SNOOZE, len * pSnoozeStart) ?? { x: 640, y: 790 };
  const bg = mixColor(C.cream, C.teal, 0.12);
  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 920]}
      decor={<Decor seed="s5b" f={f} kind="squiggles" colors={[C.teal, C.yellow]} opacity={0.22} />}
      keys={
        <>
          <At y={150}>
            <Kinetic text="KURANG" at={kurang} f={f} size={124} color={C.teal} stroke={C.ink} strokeW={10} depth={8} />
          </At>
          <At y={290}>
            <Kinetic text="TERBANGUN" at={terbangun} f={f} size={124} color={C.teal} stroke={C.ink} strokeW={10} depth={8} stagger={1} />
          </At>
          <At y={450} style={{ gap: 20, alignItems: "flex-end" }}>
            <Kinetic text="DARI TIDUR" at={dari} f={f} size={72} color={C.ink} stroke={C.white} strokeW={7} stagger={0.9} />
            <Kinetic text="NYENYAK" at={nyenyak} f={f} size={90} color={C.coral} stroke={C.ink} strokeW={9} depth={7} />
          </At>
          <SourceCaption f={f} at={mungkin - 30} out={S.s6 - 8} text={SOURCE} />
        </>
      }
    >
      <Floor y={1176} />
      <Stage>
        <SleepChart
          f={f}
          curve={CURVE_SNOOZE}
          p={p}
          appear={chartIn}
          lightPulse={f >= terbangun ? 0.5 + 0.5 * Math.sin((f - terbangun) * 0.35) : 0}
          deepPulse={f >= paling ? 0.4 : 0}
          extra={
            <>
              {/* bracket over the snooze stretch */}
              {f >= kurang ? (
                <g opacity={clamp01((f - kurang) / 5)}>
                  <path d={`M ${snoozeStart.x} 735 L ${snoozeStart.x} 722 L ${CH.x1 - 70} 722 L ${CH.x1 - 70} 735`} stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
                  <text x={(snoozeStart.x + CH.x1 - 70) / 2} y={712} textAnchor="middle" fontFamily={FONT_KEY} fontWeight={800} fontSize={36} fill={C.coral}>
                    SNOOZE
                  </text>
                </g>
              ) : null}
              <AlarmPing x={CH.x1 - 100} y={840} f={f} at={terbangun} s={0.34} />
              {/* the deepest sleep gets crossed out: you are not woken from it */}
              <DrawPath d="M 360 1050 L 460 1130" f={f} from={nyenyak} dur={4} color={C.coral} width={16} />
              <DrawPath d="M 460 1050 L 360 1130" f={f} from={nyenyak + 3} dur={4} color={C.coral} width={16} />
            </>
          }
          marker={(pt) => <ChartMarker pt={pt} t={f} eyes={f >= terbangun + 4 ? "open" : "closed"} />}
        />
      </Stage>
    </SceneShell>
  );
};
