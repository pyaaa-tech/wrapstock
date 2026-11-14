import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS, H, K, SCREEN, W } from "../geometry";
import { lotusRosette, wipeGeom } from "../petal";
import { C, rgba } from "../theme";
import { SCENES, sceneIndexAt, srcTime, wipeProgress } from "../timeline";
import { Grain } from "./Grain";
import { RemapVideo } from "./RemapVideo";

const BlurredClip: React.FC<{ sceneIdx: number; frame: number }> = ({
  sceneIdx,
  frame,
}) => {
  const scene = SCENES[sceneIdx];
  return (
    <AbsoluteFill style={{ filter: "saturate(1.3)", scale: "1.14" }}>
      <RemapVideo
        clip={scene.clip}
        kind="bg"
        srcTime={srcTime(scene, frame / FPS)}
        objectFit="cover"
        style={{ width: W, height: H }}
      />
    </AbsoluteFill>
  );
};

/**
 * Latar: salinan rakaman semasa, diblur kuat semasa pra-proses (216x384, gblur sigma 10 ≈ 50 px pada kanvas;
 * blur CSS tambahan tidak diperlukan dan 2.5x lebih perlahan), digrade ke maroon/espresso,
 * bergerak mengikut klip yang sama, bertukar babak dengan petal wipe yang sama, + grain.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = sceneIndexAt(frame);
  const p = cur > 0 ? wipeProgress(SCENES[cur].start, frame) : 1;
  const wiping = p < 1;
  const [ox, oy] = SCENES[cur].origin;
  const cx = SCREEN.x + ox * K;
  const cy = SCREEN.y + oy * K;
  const g = wipeGeom(cx, cy, p, W, H);
  return (
    <AbsoluteFill style={{ backgroundColor: C.espresso }}>
      {wiping ? <BlurredClip sceneIdx={cur - 1} frame={frame} /> : null}
      <AbsoluteFill
        style={
          wiping
            ? {
                clipPath: `path('${lotusRosette(cx, cy, g.R, g.rot)}')`,
              }
            : undefined
        }
      >
        <BlurredClip sceneIdx={cur} frame={frame} />
      </AbsoluteFill>
      {/* grade jenama: darab maroon, kemudian tirai espresso + vignette */}
      <AbsoluteFill
        style={{ backgroundColor: C.maroon, mixBlendMode: "multiply" }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${rgba(C.espresso, 0.66)} 0%, ${rgba(C.espresso, 0.4)} 30%, ${rgba(
            C.espresso,
            0.5,
          )} 62%, ${rgba(C.espresso, 0.9)} 78%, ${rgba(C.espresso, 0.96)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 60% 38%, ${rgba(C.espresso, 0)} 0%, ${rgba(C.espresso, 0.55)} 100%)`,
        }}
      />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};
