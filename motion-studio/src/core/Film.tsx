import React from "react";
import { Seq } from "./platform";
import { Grain } from "./motion/fx";
import { SCENES, sceneFrames, type SceneId } from "./storyboard";
import { color } from "./tokens";
import { Hook } from "./scenes/01-Hook";
import { Stat } from "./scenes/02-Stat";
import { Pivot } from "./scenes/03-Pivot";
import { Sleep } from "./scenes/04-Sleep";
import { Active } from "./scenes/05-Active";
import { Caffeine } from "./scenes/06-Caffeine";
import { Extra } from "./scenes/07-Extra";
import { Warning } from "./scenes/08-Warning";
import { Note } from "./scenes/09-Note";
import { Rest } from "./scenes/10-Rest";
import { Brand } from "./scenes/11-Brand";
import { Tag } from "./scenes/12-Tag";
import { End } from "./scenes/13-End";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook, stat: Stat, pivot: Pivot, sleep: Sleep, active: Active, caffeine: Caffeine,
  extra: Extra, warning: Warning, note: Note, rest: Rest, brand: Brand, tag: Tag, end: End,
};

/**
 * THE FILM — identical in both outputs. Each scene mounts on top of the previous
 * one and reveals itself through its own transition.
 */
export const Film: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: color.ink }}>
    {SCENES.map((s) => {
      const { from, duration } = sceneFrames(s);
      const C = SCENE_COMPONENTS[s.id];
      return (
        <Seq key={s.id} from={from} duration={duration} name={s.title}>
          <C />
        </Seq>
      );
    })}
    <Grain opacity={0.08} />
  </div>
);
