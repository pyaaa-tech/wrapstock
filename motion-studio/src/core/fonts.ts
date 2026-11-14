/** Local font files (in /public/fonts) — no network dependency at render time. */
export const FONT_FACES: { family: string; file: string; descriptors: FontFaceDescriptors }[] = [
  { family: "Anybody", file: "fonts/Anybody-Variable.woff2", descriptors: { weight: "100 900", stretch: "50% 150%" } },
  { family: "Bricolage Grotesque", file: "fonts/BricolageGrotesque-Variable.woff2", descriptors: { weight: "200 800", stretch: "75% 100%" } },
  { family: "Instrument Serif", file: "fonts/InstrumentSerif-Regular.woff2", descriptors: { weight: "400", style: "normal" } },
  { family: "Instrument Serif", file: "fonts/InstrumentSerif-Italic.woff2", descriptors: { weight: "400", style: "italic" } },
  { family: "Space Mono", file: "fonts/SpaceMono-Regular.woff2", descriptors: { weight: "400" } },
  { family: "Space Mono", file: "fonts/SpaceMono-Bold.woff2", descriptors: { weight: "700" } },
];

let loading: Promise<void> | null = null;

export const loadFonts = (asset: (p: string) => string): Promise<void> => {
  if (loading) return loading;
  loading = Promise.all(
    FONT_FACES.map(async ({ family, file, descriptors }) => {
      const face = new FontFace(family, `url(${asset(file)}) format("woff2")`, descriptors);
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => undefined);
  return loading;
};
