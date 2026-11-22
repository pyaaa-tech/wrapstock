import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { DURATION, FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LimaMinit" component={Main} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
    </>
  );
};
