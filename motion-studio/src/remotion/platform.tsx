import React from "react";
import { Img as RImg, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Video as RVideo } from "@remotion/media";
import type { Platform } from "../core/platform";
import { STAGE } from "../core/tokens";

/** Remotion engine: frames come from the renderer, media is frame-exact. */
export const remotionPlatform: Platform = {
  useFrame: useCurrentFrame,
  Seq: ({ from, duration, name, children }) => (
    <Sequence from={from} durationInFrames={duration} name={name} layout="none">
      {children}
    </Sequence>
  ),
  Video: ({ src, startAt = 0, rate = 1, style }) => {
    // @remotion/media draws to a canvas, so object-fit is a prop rather than CSS
    const { objectFit, ...rest } = style ?? {};
    return <RVideo src={src} trimBefore={Math.round(startAt * STAGE.fps)} playbackRate={rate} muted style={rest} objectFit={(objectFit as "cover" | "contain" | undefined) ?? "cover"} />;
  },
  Img: ({ src, style, alt }) => <RImg src={src} style={style} alt={alt} />,
  asset: (p) => staticFile(p),
};
