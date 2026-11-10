import { searchSounds, heygenAuthHeaders } from "./hf-repo/skills/media-use/audio/scripts/lib/heygen.mjs";
const headers = heygenAuthHeaders();
const qs = process.argv.slice(2);
const out = [];
for (const q of qs) {
  const r = await searchSounds(q, "music", headers, { limit: 5 });
  for (const x of r) out.push({ q, id: x.id, title: x.title ?? x.name, dur: x.duration, score: x.score, tags: x.tags, url: x.audio_url });
}
console.log(JSON.stringify(out, null, 1));
