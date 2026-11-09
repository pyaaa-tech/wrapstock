// Export the on-screen Malay subtitles (components/subtitles.js) as SRT + a corrected transcript JSON.
const fs = require("fs");
global.window = {};
eval(fs.readFileSync(__dirname + "/../components/subtitles.js", "utf8"));
const subs = window.SUBS.data;
const ts = s => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(r).padStart(3, "0")}`; };
const clean = t => t.replace(/<[^>]+>/g, "");
fs.writeFileSync(__dirname + "/../output/HEALIN_GAMOGEN_subtitles_ms.srt", subs.map(([s, e, t], i) => `${i + 1}\n${ts(s)} --> ${ts(e)}\n${clean(t)}\n`).join("\n"));
fs.writeFileSync(__dirname + "/../project/transcript.json", JSON.stringify(subs.map(([s, e, t]) => ({ start: s, end: e, text: clean(t) })), null, 1));
console.log("exported", subs.length, "cues");
