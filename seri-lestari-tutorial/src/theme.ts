import { loadVariableFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";

// Fraunces: fail variable penuh (paksi opsz / SOFT / WONK) supaya optical size tinggi boleh dipaksa.
const fraunces = loadFraunces("italic", { subsets: ["latin"] });
const jakarta = loadJakarta("normal", {
  weights: ["500", "800"],
  subsets: ["latin"],
});

export const SERIF = fraunces.fontFamily;
export const SANS = jakarta.fontFamily;

/** Fraunces italic pada optical size maksimum (144) — kontras tinggi untuk tajuk & nombor. */
export const serifDisplay = (weight = 500): React.CSSProperties => ({
  fontFamily: SERIF,
  fontStyle: "italic",
  fontWeight: weight,
  fontVariationSettings: `"opsz" 144, "SOFT" 40, "WONK" 1`,
  fontOpticalSizing: "none",
});

export const C = {
  espresso: "#24120F",
  maroon: "#8C4A45",
  blush: "#F1E6E0",
  gold: "#C8A35A",
  cream: "#FFF8F2",
} as const;

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
