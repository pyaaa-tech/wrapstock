import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./theme";
import { Place, SiOtak } from "./components/SiOtak";
import { Kinetic } from "./components/Kinetic";

export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const poses = [
    { eyes: "open", mouth: "smile" },
    { eyes: "sparkle", mouth: "grin" },
    { eyes: "shock", mouth: "grimace", brows: "worried", sweat: 1, lh: [60, 150], rh: [340, 150] },
    { eyes: "wink", mouth: "smirk", blush: 1 },
    { eyes: "open", mouth: "wavy", brows: "worried", droop: 0.4, look: [-1, 0.5] },
    { eyes: "open", mouth: "flat", brows: "determined", glasses: 1 },
  ] as const;
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {poses.map((p, i) => (
        <Place key={i} x={200 + (i % 2) * 520} y={560 + Math.floor(i / 2) * 560} scale={0.9}>
          <SiOtak t={10} {...(p as any)} />
        </Place>
      ))}
      <div style={{ position: "absolute", left: 60, top: 30 }}>
        <Kinetic text="DEADLINE ESOK" at={0} f={f} size={130} color={C.coral} stroke={C.ink} strokeW={10} depth={8} />
      </div>
    </AbsoluteFill>
  );
};
