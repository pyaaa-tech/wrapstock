import React from "react";
import { C, CX, FONT_KEY } from "../theme";
import { F } from "../lib/time";
import { S } from "../cues";
import { clamp01, hopSquash, hopY, mixColor, pop, ramp, steps, wobble } from "../lib/anim";
import { Decor, Floor, SceneProps, SceneShell, Stage } from "../components/Shell";
import { OtakAt } from "../components/SiOtak";
import { Pebble, Snowball } from "../components/Props";
import { Confetti } from "../components/Fx";
import { outline } from "../components/Kinetic";

// "Tak lama pun. Lima minit pun jadilah."
export const S6Timer: React.FC<SceneProps> = ({ f, cam }) => {
  const tak = F("tak2");
  const lima = F("lima");
  const minit = F("minit");
  const pun = F("pun2");
  const jadilah = F("jadilah");
  const push = clamp01((f - S.s6) / (S.s7 - S.s6));

  // 5:00 holds, slams on "Lima", then ticks down fast
  const ticks = f >= lima ? Math.floor((f - lima) / 3) : 0;
  const secs = 300 - ticks;
  const label = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const slam = wobble(f, lima, 0.16, 0.9, 0.3);
  const tickBump = f >= lima ? 0.03 * Math.exp(-((f - lima) % 3) * 0.9) : 0;
  const prog = f >= lima ? clamp01((f - lima) / 90) : 0;

  // snowball shrinks to a pebble
  const r = steps(f, [
    [minit, 120],
    [pun, 84],
  ], 150, { damping: 10, stiffness: 190 });
  const pebbled = f >= jadilah;
  const pebS = pop(f, jadilah, { damping: 7, stiffness: 220, mass: 0.6 });
  const pebSq = wobble(f, jadilah + 3, 0.3, 0.9, 0.25);

  const cheer = f >= jadilah;
  const teal = ramp(f, jadilah - 2, jadilah + 6);
  const bg = mixColor(mixColor(C.cream, C.coral, 0.1), "#BFF0E6", teal);

  return (
    <SceneShell
      bg={bg}
      cam={cam}
      push={push}
      focus={[CX, 700]}
      decor={<Decor seed="s6" f={f} kind="rays" colors={[C.teal]} opacity={0.14 + 0.16 * teal} cx={CX} cy={430} />}
      keys={
        <div
          style={{
            position: "absolute",
            left: CX - 360,
            top: 238,
            width: 720,
            height: 380,
            transform: `scale(${(1 + slam * 0.6 + tickBump) * (0.6 + 0.4 * pop(f, tak - 1, { damping: 10, stiffness: 200 }))}, ${1 - slam + tickBump})`,
            transformOrigin: "50% 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: C.white,
              border: `12px solid ${C.ink}`,
              borderRadius: 48,
              boxShadow: `0 16px 0 ${C.ink}`,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 74, background: C.teal, borderBottom: `10px solid ${C.ink}` }} />
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                bottom: 30,
                height: 26,
                borderRadius: 13,
                background: "#EEE8F6",
                border: `6px solid ${C.ink}`,
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${(1 - prog) * 100}%`, height: "100%", background: C.coral }} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 82,
              textAlign: "center",
              fontFamily: FONT_KEY,
              fontWeight: 800,
              fontSize: 250,
              lineHeight: 1,
              color: C.ink,
              fontVariantNumeric: "tabular-nums",
              textShadow: outline(4, C.white),
            }}
          >
            {label}
          </div>
        </div>
      }
    >
      <Floor y={1176} />
      <Stage>
        {!pebbled ? (
          <g transform={`translate(700 ${1176 - r}) rotate(${(150 - r) * 2})`}>
            <Snowball r={r} roll={f * 2} eyes={1} look={-1} grin={0} />
          </g>
        ) : (
          <g transform={`translate(700 1176) scale(${pebS * (1 + pebSq * 0.6)} ${pebS * (1 - pebSq)})`}>
            <Pebble s={1.3} />
          </g>
        )}
        <OtakAt
          x={360}
          y={1170 + hopY(f, jadilah, 70, 12)}
          s={0.92}
          t={f}
          squash={hopSquash(f, jadilah, 12) - wobble(f, lima, 0.08, 0.9, 0.3)}
          eyes={cheer ? "happy" : "open"}
          mouth={cheer ? "grin" : "smirk"}
          brows={cheer ? "raised" : "determined"}
          look={[1, 0.3]}
          lh={cheer ? [-30, 90] : [6, 372]}
          rh={cheer ? [430, 90] : [330, 240]}
          rItem={
            !cheer ? (
              <g>
                <path d="M 0 0 L 0 -40" stroke={C.ink} strokeWidth={20} strokeLinecap="round" />
                <path d="M 0 0 L 0 -40" stroke={C.pink} strokeWidth={9} strokeLinecap="round" />
              </g>
            ) : undefined
          }
        />
      </Stage>
      <Confetti f={f} at={jadilah} x={700} y={1080} n={50} />
      <Confetti f={f} at={jadilah + 2} x={360} y={760} n={30} seed="cf2" spread={0.8} />
    </SceneShell>
  );
};
