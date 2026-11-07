// Render the scene frame-by-frame with headless Chromium and encode with ffmpeg.
//   node render.mjs --stills 1,2.5,6          → PNG stills in ./out/stills
//   node render.mjs --fps 60 --workers 2      → ./out/video_silent.mp4
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const FPS = Number(args.fps || 30);
const WORKERS = Number(args.workers || 1);
const PORTRAIT = !!args.portrait;
const VW = PORTRAIT ? 1080 : 1920, VH = PORTRAIT ? 1920 : 1080;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const URL_ = `http://127.0.0.1:${server.address().port}/index.html${PORTRAIT ? '?v=portrait' : ''}`;

async function openPage() {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(URL_);
  await page.waitForFunction(() => window.__ready !== undefined, null, { timeout: 60000 });
  await page.evaluate(() => window.__ready);
  return { browser, page };
}
async function frame(page, t, type = 'png') {
  await page.evaluate((tt) => window.renderAt(tt), t);
  return page.screenshot({ type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
}

if (args.stills) {
  const { browser, page } = await openPage();
  const dir = path.join(OUT, PORTRAIT ? 'stills_portrait' : 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of String(args.stills).split(',').map(Number)) {
    const t0 = Date.now();
    const buf = await frame(page, s, 'jpeg');
    const f = path.join(dir, `t${s.toFixed(2).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f, buf);
    console.log(f, `${Date.now() - t0}ms`);
  }
  await browser.close(); server.close(); process.exit(0);
}

const duration = Number(args.end || (await (async () => { const { browser, page } = await openPage(); const d = await page.evaluate(() => window.DURATION); await browser.close(); return d; })()));
const start = Number(args.start || 0);
const total = Math.round((duration - start) * FPS);
const per = Math.ceil(total / WORKERS);
console.log(`Rendering ${total} frames @ ${FPS}fps with ${WORKERS} worker(s)`);

async function worker(w) {
  const f0 = w * per, f1 = Math.min(total, f0 + per);
  if (f0 >= f1) return null;
  const file = path.join(OUT, `chunk_${PORTRAIT ? 'p' : 'l'}${w}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
  const { browser, page } = await openPage();
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const buf = await frame(page, start + f / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 30 === 0) console.log(`[w${w}] ${f - f0 + 1}/${f1 - f0}  ${(((Date.now() - t0) / (f - f0 + 1)) | 0)}ms/frame`);
  }
  ff.stdin.end(); await done; await browser.close();
  return file;
}
const files = (await Promise.all([...Array(WORKERS).keys()].map(worker))).filter(Boolean);
const list = path.join(OUT, `chunks_${PORTRAIT ? 'p' : 'l'}.txt`);
fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
const out = path.join(OUT, args.out || (PORTRAIT ? 'video_silent_portrait.mp4' : 'video_silent.mp4'));
await new Promise((r, j) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' })
  .on('close', (c) => (c === 0 ? r() : j(new Error('concat ' + c)))));
files.forEach((f) => fs.unlinkSync(f)); fs.unlinkSync(list);
console.log('Wrote', out);
server.close();
