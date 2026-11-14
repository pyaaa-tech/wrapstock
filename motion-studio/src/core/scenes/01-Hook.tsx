import React from "react";
import { Img, useFrame } from "../platform";
import { Enter, PulseRings } from "../motion/fx";
import { beatEnvelope, ease, lerp, ramp, spring } from "../motion/math";
import { Letters, Mask, Stretch, Words } from "../motion/text";
import { local } from "../storyboard";
import { color } from "../tokens";
import { At, Fill, Head, serif } from "./kit";

const at = local("hook");

/** 0.00–3.62s · "Migrain buat kepala anda berdenyut? Anda bukan keseorangan." */
export const Hook: React.FC = () => {
  const f = useFrame();
  // the type throbs on the stressed syllables of the voice
  const hard = [0, at(0.64), at(1.18)];
  const soft = [at(2.3), at(3.05)];
  const env = beatEnvelope(f, hard, 7) + beatEnvelope(f, soft, 12) * 0.35;
  const calm = ramp(f, at(1.8) - 6, at(1.8) + 14, ease.inOut); // the voice softens → so does the frame
  const slam = ramp(f, 0, 9, ease.outExpo);
  const foreHead: [number, number] = [540, 700];
  // the pain group sits centred, then lifts to make room for the answer
  const lift = lerp(118, 0, calm);

  return (
    <Enter kind="cut" background={color.ink}>
      <Fill
        style={{
          background: `radial-gradient(circle at ${foreHead[0]}px ${foreHead[1]}px, ${color.vermilion} 0%, transparent ${lerp(34, 52, env)}%)`,
          opacity: lerp(0.34 + env * 0.4, 0.14, calm),
        }}
      />
      <Head tone={color.ivory} right="Nota migrain" />

      <Fill style={{ translate: `0 ${lift}px` }}>
      {/* MIGRAIN — width axis throbs with the pulse */}
      <At x={0} y={188} w={1080} style={{ display: "flex", justifyContent: "center", opacity: lerp(1, 0.32, calm) }}>
        <Stretch size={232} wdth={lerp(64, 104, env)} style={{ color: color.vermilion, scale: `${lerp(1.2, 1, slam)}`, transformOrigin: "50% 60%" }}>
          Migrain
        </Stretch>
      </At>

      {/* portrait in an arch — multiplied onto ivory so the red highlight survives */}
      <Mask p={0.64 + 0.36 * ramp(f, 0, 18, ease.outExpo)} dir="down" style={{ position: "absolute", left: 250, top: 440, width: 580, height: 740 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "290px 290px 26px 26px", overflow: "hidden", background: color.ivory }}>
          <Img src="img/migraine.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", scale: `${1.05 + env * 0.045}`, transformOrigin: "50% 34%", filter: `contrast(1.08) saturate(${lerp(1.15, 0.7, calm)})` }} />
        </div>
      </Mask>
      <PulseRings beats={hard} x={foreHead[0]} y={foreHead[1]} color={color.vermilion} maxR={700} life={30} width={12} />
      <PulseRings beats={soft} x={foreHead[0]} y={foreHead[1]} color={color.ivory} maxR={520} life={46} width={4} />

      <At y={1206}>
        <Words text="buat kepala anda" cues={[at(0.48), at(0.64), at(1.04)]} dur={12} style={{ ...serif(70, color.ivory), opacity: lerp(1, 0.4, calm) }} />
      </At>
      <At x={76} y={1296} style={{ opacity: lerp(1, 0.32, calm) }}>
        <Stretch size={148} wdth={lerp(52, 84, spring(f, { delay: at(1.18), stiffness: 160, damping: 9 })) + env * 8} style={{ color: color.ivory }}>
          <Letters text="berdenyut?" start={at(1.18)} stagger={1} mode="pop" stiffness={300} damping={13} />
        </Stretch>
      </At>

      </Fill>

      {/* the calm voice answers */}
      <At y={1490} w={912}>
        <Words text="Anda bukan keseorangan." cues={[at(1.8), at(2.3), at(2.78)]} dur={20} style={serif(146, color.ivory)} />
      </At>
      <At y={1466} style={{ width: lerp(0, 150, ramp(f, at(1.8), at(1.8) + 20)), height: 5, background: color.sage }} />
    </Enter>
  );
};
