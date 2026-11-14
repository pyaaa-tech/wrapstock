import React from "react";
import { Composition } from "remotion";
import { DURATION, FPS, H, W } from "./geometry";
import { Tutorial } from "./Tutorial";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TutorialTempahan"
    component={Tutorial}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={DURATION}
  />
);
