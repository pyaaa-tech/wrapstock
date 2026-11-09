// Loads the composition in headless Chromium, reports JS errors and exports the SFX cue sheet.
(async () => {
const { chromium } = require("playwright");
const { writeFileSync } = require("fs");
const { resolve } = require("path");
const url = "file://" + resolve("index.html");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errors = [];
page.on("pageerror", e => errors.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + ": " + m.text()); });
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(800);
const info = await page.evaluate(() => ({ dur: window.__timelines?.main?.duration(), cues: window.__SFX_CUES || [] }));
console.log("timeline duration:", info.dur, " sfx cues:", info.cues.length);
writeFileSync("project/sfx_cues.json", JSON.stringify(info.cues.sort((a, b) => a.t - b.t), null, 1));
console.log(errors.length ? errors.join("\n") : "no errors");
await browser.close();
})();
