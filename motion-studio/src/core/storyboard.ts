import { sec } from "./tokens";

/**
 * STORYBOARD — timed to the voice-over (word timestamps from the transcript, seconds).
 * Every scene boundary sits ~0.1s before the first word of its line so the cut lands
 * with the voice, not after it.
 */
export type SceneId =
  | "hook" | "stat" | "pivot" | "sleep" | "active" | "caffeine"
  | "extra" | "warning" | "note" | "rest" | "brand" | "tag" | "end";

export type SceneDef = {
  id: SceneId;
  /** chapter title shown on the website */
  title: string;
  /** act — drives the colour arc: pain → habits → warning → calm → brand */
  act: "Denyut" | "Tabiat" | "Amaran" | "Tenang" | "Seri Lestari";
  start: number; // seconds
  end: number; // seconds
  ground: "dark" | "light";
};

/** How long (frames) an outgoing scene stays mounted underneath the incoming transition */
export const OVERLAP = 16;

export const SCENES: SceneDef[] = [
  { id: "hook", title: "Kepala berdenyut?", act: "Denyut", start: 0, end: 3.62, ground: "dark" },
  { id: "stat", title: "1.2 bilion orang", act: "Denyut", start: 3.62, end: 8.7, ground: "dark" },
  { id: "pivot", title: "3 tabiat", act: "Tabiat", start: 8.7, end: 13.72, ground: "light" },
  { id: "sleep", title: "01 — Tidur konsisten", act: "Tabiat", start: 13.72, end: 19.68, ground: "dark" },
  { id: "active", title: "02 — Kekal aktif", act: "Tabiat", start: 19.68, end: 27.4, ground: "light" },
  { id: "caffeine", title: "03 — Kawal kafein", act: "Tabiat", start: 27.4, end: 35.9, ground: "light" },
  { id: "extra", title: "+1 — Ubat tahan sakit", act: "Tabiat", start: 35.9, end: 40.74, ground: "dark" },
  { id: "warning", title: "Bila perlu ke doktor", act: "Amaran", start: 40.74, end: 47.56, ground: "light" },
  { id: "note", title: "Nota", act: "Amaran", start: 47.56, end: 50.96, ground: "dark" },
  { id: "rest", title: "Beri ruang berehat", act: "Tenang", start: 50.96, end: 57.0, ground: "light" },
  { id: "brand", title: "Seri Lestari Spa", act: "Seri Lestari", start: 57.0, end: 62.3, ground: "dark" },
  { id: "tag", title: "Oh, lupa…", act: "Seri Lestari", start: 62.3, end: 68.3, ground: "light" },
  { id: "end", title: "PM kami", act: "Seri Lestari", start: 68.3, end: 70, ground: "dark" },
];

export const sceneFrames = (s: SceneDef) => {
  const from = sec(s.start);
  const isLast = s.id === SCENES[SCENES.length - 1].id;
  return { from, duration: sec(s.end) - from + (isLast ? 0 : OVERLAP) };
};

/** Convert absolute VO seconds into frames local to a scene */
export const local = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id)!;
  const from = sec(s.start);
  return (seconds: number) => sec(seconds) - from;
};

/** Voice-over transcript (Bahasa Melayu) — used for the website's live captions. */
export const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0.0, end: 1.7, text: "Migrain buat kepala anda berdenyut?" },
  { start: 1.8, end: 3.5, text: "Anda bukan keseorangan." },
  { start: 3.74, end: 8.6, text: "Dianggarkan 1.2 bilion orang di seluruh dunia mengalami migrain." },
  { start: 8.76, end: 13.7, text: "Tapi tahukah anda, ada 3 tabiat yang boleh membantu mengurangkan serangan migrain?" },
  { start: 13.82, end: 16.2, text: "Pertama, tidur secara konsisten." },
  { start: 16.38, end: 19.65, text: "Corak tidur yang terganggu boleh meningkatkan risiko migrain." },
  { start: 19.76, end: 21.55, text: "Kedua, kekal aktif." },
  { start: 21.68, end: 27.4, text: "Senaman aerobik 3 hingga 5 kali seminggu boleh membantu mengurangkan jumlah hari migrain dalam sebulan." },
  { start: 27.46, end: 30.0, text: "Ketiga, kawal pengambilan kafein." },
  { start: 30.1, end: 35.85, text: "Hadkan kepada maksimum 2 hidangan sehari kerana pengambilan berlebihan boleh meningkatkan risiko migrain." },
  { start: 35.98, end: 40.7, text: "Satu lagi perkara penting: elakkan penggunaan ubat tahan sakit secara berlebihan." },
  { start: 40.82, end: 47.55, text: "Jika sakit kepala datang secara tiba-tiba dan terasa paling teruk pernah dialami, dapatkan rawatan perubatan dengan segera." },
  { start: 47.64, end: 50.85, text: "Ingat, ini perkongsian untuk tujuan pendidikan sahaja." },
  { start: 51.04, end: 55.3, text: "Dan kalau badan terasa penat, jangan lupa beri ruang untuk diri sendiri berehat." },
  { start: 55.4, end: 58.95, text: "Luangkan masa untuk self-care di Seri Lestari Spa, Batu Pahat." },
  { start: 58.96, end: 62.25, text: "PM kami sekarang untuk sebarang pertanyaan atau buat tempahan." },
  { start: 62.38, end: 66.1, text: "Oh, lupa. Seri Lestari Spa hanya untuk Muslimah sahaja, ya?" },
  { start: 66.18, end: 68.0, text: "Saya share pengetahuan sahaja." },
];
