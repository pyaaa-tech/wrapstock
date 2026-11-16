import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Sheet } from "./Sheet";
import { DURATION, FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TangguhKerja" component={Main} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
      <Composition id="Sheet" component={Sheet} durationInFrames={60} fps={30} width={W} height={H} />
    </>
  );
};
