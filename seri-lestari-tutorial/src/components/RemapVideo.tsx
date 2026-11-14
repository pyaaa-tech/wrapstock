import React from "react";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";

const FRAMES = { 1: 3244, 2: 1756 } as const;

/**
 * Papar satu frame tepat daripada rakaman pada masa sumber `srcTime` (saat).
 * Time-remap: <Sequence from={frame}> + trimBefore, jadi masa video pada frame
 * semasa sentiasa = srcTime, tanpa mengira kelajuan (speed ramp / freeze / cut).
 */
export const RemapVideo: React.FC<{
  clip: 1 | 2;
  kind: "rec" | "bg";
  srcTime: number;
  style?: React.CSSProperties;
  objectFit?: "fill" | "cover";
}> = ({ clip, kind, srcTime, style, objectFit = "fill" }) => {
  const frame = useCurrentFrame();
  const srcFrame = Math.min(
    FRAMES[clip] - 2,
    Math.max(0, Math.round(srcTime * 30)),
  );
  return (
    <Sequence from={frame} layout="none">
      <Video
        src={staticFile(`${kind}${clip}.mp4`)}
        trimBefore={srcFrame}
        muted
        objectFit={objectFit}
        style={style}
      />
    </Sequence>
  );
};
