import React from "react";
import { AbsoluteFill, Composition, Folder, continueRender, delayRender, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Film, SCENE_COMPONENTS } from "../core/Film";
import { loadFonts } from "../core/fonts";
import { PlatformProvider } from "../core/platform";
import { SCENES, sceneFrames } from "../core/storyboard";
import { STAGE } from "../core/tokens";
import { remotionPlatform } from "./platform";

// Fonts are local files; block the first frame until they are ready.
const fontsHandle = delayRender("Loading local fonts");
loadFonts(staticFile).then(() => continueRender(fontsHandle));

const FilmComposition: React.FC<{ sfx: boolean }> = ({ sfx }) => (
  <AbsoluteFill>
    <PlatformProvider value={remotionPlatform}>
      <Film />
    </PlatformProvider>
    <Audio src={staticFile("audio/vo.mp3")} />
    {sfx && <Audio src={staticFile("audio/sfx.mp3")} volume={0.9} />}
  </AbsoluteFill>
);

const scene = (C: React.FC) => () => (
  <AbsoluteFill>
    <PlatformProvider value={remotionPlatform}>
      <C />
    </PlatformProvider>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={FilmComposition} width={STAGE.width} height={STAGE.height} fps={STAGE.fps} durationInFrames={STAGE.durationInFrames} defaultProps={{ sfx: true }} />
    <Folder name="Scenes">
      {SCENES.map((s, i) => (
        <Composition
          key={s.id}
          id={`${String(i + 1).padStart(2, "0")}-${s.id}`}
          component={scene(SCENE_COMPONENTS[s.id])}
          width={STAGE.width}
          height={STAGE.height}
          fps={STAGE.fps}
          durationInFrames={sceneFrames(s).duration}
        />
      ))}
    </Folder>
  </>
);
