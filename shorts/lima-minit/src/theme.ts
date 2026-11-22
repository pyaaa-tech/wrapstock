import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  cream: "#FFF4E0",
  ink: "#1B1B3A",
  coral: "#FF5A5F",
  teal: "#00C2A8",
  yellow: "#FFD23F",
  pink: "#FF9EB5",
  pinkDark: "#E9708F",
  pinkLight: "#FFC4D3",
  white: "#FFFFFF",
  paper: "#FFFDF7",
  gray: "#B9B4C7",
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const OUTRO_START = 1326; // 44.2 s: programme ends, brand outro lands (voiceover is 44.199 s, never trimmed)
export const DURATION = 1360; // 45.33 s = programme + 1.13 s logo hold (outro is ~1.4 s including its whip-pan)

// Safe zones (Shorts UI): keep the bottom 20% and the right 12% clear.
export const SAFE = {
  left: 64,
  right: Math.floor(W * 0.88), // 950
  keyTop: 150,
  keyBottom: Math.floor(H * 0.35), // 672
  capCenter: Math.round(H * 0.66), // 1267 (captions sit at ~62-70%)
  bottomClear: Math.floor(H * 0.8), // 1536
};
export const CX = Math.round((SAFE.left + SAFE.right) / 2); // horizontal centre of the safe area

export const FONT_KEY = "Baloo2";
export const FONT_CAP = "Poppins";

loadFont({ family: FONT_KEY, url: staticFile("fonts/baloo-2-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: FONT_CAP, url: staticFile("fonts/poppins-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: FONT_CAP, url: staticFile("fonts/poppins-latin-700-normal.woff2"), weight: "700" });
