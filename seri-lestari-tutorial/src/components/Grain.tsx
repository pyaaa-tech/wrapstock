import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";

/** Grain filem halus: tekstur hingar (lebih besar 512 px daripada kanvas) dianjak secara rawak setiap frame. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({
  frame,
  opacity = 0.13,
}) => {
  const x = Math.floor(random(`gx${frame}`) * 512);
  const y = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill
      style={{ overflow: "hidden", mixBlendMode: "overlay", opacity }}
    >
      <Img
        src={staticFile("grain.png")}
        style={{
          position: "absolute",
          left: -x,
          top: -y,
          width: 1592,
          height: 2432,
          maxWidth: "none",
        }}
      />
    </AbsoluteFill>
  );
};
