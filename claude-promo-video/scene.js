import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONTENT } from './content.js';

const PORTRAIT = new URLSearchParams(location.search).get('v') === 'portrait';
if (PORTRAIT) document.documentElement.classList.add('portrait');
const W = PORTRAIT ? 1080 : 1920, H = PORTRAIT ? 1920 : 1080;
const FOV = PORTRAIT ? 52 : 35;
export const DURATION = 19.2;

// ───────────────────────── helpers ─────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo3 = (k) => 1 - Math.pow(1 - k, 3);
const eo4 = (k) => 1 - Math.pow(1 - k, 4);
const eo5 = (k) => 1 - Math.pow(1 - k, 5);
const ei3 = (k) => k * k * k;
const eio3 = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eio5 = (k) => (k < 0.5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2);
const smooth = (a, b, t) => { const k = seg(t, a, b); return k * k * (3 - 2 * k); };
const win = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
const pulse = (t, t0, rise, decay) => (t < t0 ? Math.exp(-(((t - t0) / rise) ** 2)) : Math.exp(-(t - t0) / decay));
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
const col = (hex) => new THREE.Color(hex);
const rgba = (hex, a) => { const c = new THREE.Color(hex); return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`; };

// Monotone cubic (Fritsch–Carlson): smooth, C1, never overshoots keyframes.
function monotone(ts, vs) {
  const n = ts.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  m[0] = d[0] * 0.5; m[n - 1] = d[n - 2] * 0.5;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const tau = 3 / Math.sqrt(s); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; }
  }
  return (t) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], s = (t - ts[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * vs[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * vs[i + 1] + (s3 - s2) * h * m[i + 1];
  };
}
function track(keys) { // keys: [t, [px,py,pz], [tx,ty,tz]]
  const ts = keys.map((k) => k[0]);
  const f = [0, 1, 2].map((a) => monotone(ts, keys.map((k) => k[1][a])));
  const g = [0, 1, 2].map((a) => monotone(ts, keys.map((k) => k[2][a])));
  return (t, pos, tgt) => { pos.set(f[0](t), f[1](t), f[2](t)); tgt.set(g[0](t), g[1](t), g[2](t)); };
}

function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

// ───────────────────────── renderer ─────────────────────────
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 400);

// Studio environment with coloured soft boxes → warm/cool reflections.
function makeEnv() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x060508);
  const add = (hex, k, w, h, p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col(hex).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...p); m.lookAt(0, 0, 0); env.add(m);
  };
  add('#FFE7D2', 7, 9, 4, [0, 7, 2]);      // overhead warm softbox
  add('#FFFFFF', 4, 2.5, 7, [7, 1.5, 3]);  // right key strip
  add('#E07B57', 5, 2.2, 9, [-7, 0, 1.5]); // coral side strip
  add('#6F8DFF', 3.5, 8, 2, [0, -3, -7]);  // cool back
  add('#B48CFF', 2.5, 2, 6, [5, -1, -6]);  // violet kicker
  add('#FFD9A8', 2, 5, 1.2, [-3, -5, 4]);  // floor bounce
  const pm = new THREE.PMREMGenerator(renderer);
  return pm.fromScene(env, 0.03).texture;
}
scene.environment = makeEnv();

const keyLight = new THREE.DirectionalLight(0xffe4cc, 1.5); keyLight.position.set(4, 6, 8); scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x86a2ff, 2.2); rimLight.position.set(-6, 2, -9); scene.add(rimLight);
const sweep = new THREE.PointLight(0xfff1e6, 0, 14, 2); scene.add(sweep);
const coralFill = new THREE.PointLight(0xe07b57, 0, 10, 2); scene.add(coralFill);

// ───────────────────────── background ─────────────────────────
const bgMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, depthTest: false,
  uniforms: { uTime: { value: 0 }, uA: { value: col('#E07B57') }, uB: { value: col('#5B3FD6') }, uC: { value: col('#1E7F86') }, uI: { value: 1 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`,
  fragmentShader: `
    varying vec3 vDir; uniform float uTime, uI; uniform vec3 uA, uB, uC;
    float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*noise(p); p*=2.03; a*=.5; } return s; }
    void main(){
      vec3 d = normalize(vDir);
      vec3 base = mix(vec3(.0035,.003,.0055), vec3(.016,.011,.016), smoothstep(-.6,.8,d.y));
      float n  = fbm(d*2.1 + vec3(0.,0.,uTime*.05));
      float n2 = fbm(d*3.0 + vec3(5.2,uTime*.04,1.3));
      float wA = pow(max(dot(d, normalize(vec3(.55,.42,-.72))),0.),3.);
      float wB = pow(max(dot(d, normalize(vec3(-.62,-.18,-.76))),0.),3.);
      float wC = pow(max(dot(d, normalize(vec3(.05,-.75,-.62))),0.),4.);
      vec3 c = base + uA*wA*n*n*.55 + uB*wB*n2*n2*.5 + uC*wC*n*.25;
      gl_FragColor = vec4(c*uI, 1.);
    }`,
});
const bg = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 32), bgMat);
bg.renderOrder = -10; bg.frustumCulled = false; scene.add(bg);

// ───────────────────────── particles ─────────────────────────
function makeParticles() {
  const r = rng(11), N = 1700, BIG = 70;
  const pos = new Float32Array((N + BIG) * 3), size = new Float32Array(N + BIG), seed = new Float32Array(N + BIG), colr = new Float32Array((N + BIG) * 3);
  const palette = [col('#FFE2C6'), col('#FFD2B0'), col('#E07B57'), col('#B48CFF'), col('#8FB4FF'), col('#F4B860')];
  for (let i = 0; i < N + BIG; i++) {
    const big = i >= N;
    pos[i * 3] = (r() - 0.5) * (big ? 24 : 34);
    pos[i * 3 + 1] = (r() - 0.5) * (big ? 14 : 22);
    pos[i * 3 + 2] = lerp(-48, 15, r());
    size[i] = big ? lerp(0.25, 0.6, r()) : lerp(0.018, 0.07, r() ** 2);
    seed[i] = r();
    const c = palette[r() < 0.6 ? (r() < 0.5 ? 0 : 1) : 2 + Math.floor(r() * 4)];
    const k = big ? 0.12 : lerp(0.5, 1.4, r());
    colr[i * 3] = c.r * k; colr[i * 3 + 1] = c.g * k; colr[i * 3 + 2] = c.b * k;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aColor', new THREE.BufferAttribute(colr, 3));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: H / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) }, uI: { value: 1 } },
    vertexShader: `
      attribute float aSize, aSeed; attribute vec3 aColor; uniform float uTime, uPx; varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*.22 + aSeed*6.283)*.35; p.y += cos(uTime*.17 + aSeed*12.1)*.3 + uTime*.05*(aSeed-.3);
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        float dist = -mv.z;
        gl_PointSize = clamp(aSize*uPx/max(dist,.1), 0., 140.);
        vA = (.55 + .45*sin(uTime*1.7 + aSeed*40.)) * smoothstep(1.2, 4.5, dist);
        vC = aColor;
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA; uniform float uI;
      void main(){ float d = length(gl_PointCoord-.5)*2.; float a = smoothstep(1.,.0,d); a = a*a*(.6+.4*smoothstep(.55,.9,d)+.4);
        gl_FragColor = vec4(vC*a*vA*uI, 1.); }`,
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}
const particles = makeParticles(); particles.renderOrder = 10; scene.add(particles);

// Warp streaks for the fly-through transitions.
function makeStreaks() {
  const a = new THREE.PlaneGeometry(0.022, 1); a.rotateX(Math.PI / 2);
  const b = new THREE.PlaneGeometry(0.022, 1); b.rotateX(Math.PI / 2); b.rotateZ(Math.PI / 2);
  const geo = mergeGeometries([a, b]);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uI: { value: 0 }, uStretch: { value: 1 }, uColor: { value: col('#FFE0C8').multiplyScalar(1.6) } },
    vertexShader: `uniform float uStretch; varying vec2 vUv; varying float vF; void main(){ vUv=uv; vec3 p=position; p.z*=uStretch; vec4 mv=modelViewMatrix*instanceMatrix*vec4(p,1.); vec3 n=normalize(normalMatrix*normal); vec3 v=normalize(-mv.xyz); vF=smoothstep(2.0,6.0,-mv.z)*smoothstep(.12,.45,abs(dot(n,v))); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float uI; uniform vec3 uColor; varying vec2 vUv; varying float vF; void main(){ float a = sin(vUv.y*3.14159)*(1.-abs(vUv.x-.5)*2.); gl_FragColor=vec4(uColor*a*a*uI*vF,1.); }`,
  });
  const N = 420, mesh = new THREE.InstancedMesh(geo, m, N), r = rng(5), o = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const ang = r() * Math.PI * 2, rad = lerp(2.2, 8.0, Math.sqrt(r()));
    o.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.7, lerp(-34, 12, r()));
    o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
  }
  mesh.frustumCulled = false; return mesh;
}
const streaks = makeStreaks(); streaks.renderOrder = 11; scene.add(streaks);

// ───────────────────────── glow sprites ─────────────────────────
function glowMat(shader, color, extra = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: col(color) }, uI: { value: 0 }, ...extra },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: shader,
  });
}
const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), glowMat(`varying vec2 vUv; uniform vec3 uColor; uniform float uI;
  void main(){ vec2 p=vUv-.5; float d=length(p)*2.; float g=exp(-d*d*5.)*.7 + exp(-d*12.)*.5; gl_FragColor=vec4(uColor*g*uI,1.); }`, '#E07B57'));
const flare = new THREE.Mesh(new THREE.PlaneGeometry(22, 1.2), glowMat(`varying vec2 vUv; uniform vec3 uColor; uniform float uI;
  void main(){ vec2 p=vUv-.5; float g=exp(-pow(p.y*14.,2.))*exp(-abs(p.x)*5.5) + exp(-pow(p.y*40.,2.))*exp(-abs(p.x)*2.2)*.6;
  gl_FragColor=vec4(uColor*g*uI,1.); }`, '#FFC7A8'));
const shock = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMat(`varying vec2 vUv; uniform vec3 uColor; uniform float uI;
  void main(){ float d=length(vUv-.5)*2.; float g=exp(-pow((d-.9)*28.,2.)) + exp(-pow((d-.9)*8.,2.))*.25; gl_FragColor=vec4(uColor*g*uI,1.); }`, '#FFB08C'));
[halo, flare, shock].forEach((m) => { m.renderOrder = 5; m.frustumCulled = false; scene.add(m); });
halo.renderOrder = -5;

// ───────────────────────── the spark ─────────────────────────
function makeSpark() {
  const group = new THREE.Group(), r = rng(7), rays = [];
  const lens = [1.0, 0.8, 0.93, 0.76, 1.0, 0.85, 0.92, 0.78, 0.97, 0.82, 0.9, 0.79];
  const mat = new THREE.MeshPhysicalMaterial({
    color: col('#D97757'), metalness: 0.38, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.07,
    envMapIntensity: 1.3, emissive: col('#D97757'), emissiveIntensity: 0.05, sheen: 0.4, sheenColor: col('#FFC2A0'),
  });
  const N = lens.length;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.13 + 0.12;
    const L = 1.18 * lens[i], wi = 0.15, wo = 0.165, rr = wo / 2;
    const s = new THREE.Shape();
    s.moveTo(-0.06, -wi / 2); s.lineTo(L - rr, -wo / 2); s.absarc(L - rr, 0, rr, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-0.06, wi / 2); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.032, bevelSegments: 6, curveSegments: 20 });
    geo.translate(0, 0, -0.055);
    const mesh = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Object3D(); pivot.add(mesh); group.add(pivot);
    const dir = new THREE.Vector3(Math.cos(a + (r() - 0.5) * 1.2), Math.sin(a + (r() - 0.5) * 1.2), lerp(-0.6, 0.35, r())).normalize();
    rays.push({
      pivot, a, z: (i - N / 2) * 0.0045,
      from: dir.multiplyScalar(lerp(7, 12, r())),
      fromQ: new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 5, (r() - 0.5) * 5, a + (r() - 0.5) * 4)),
      delay: r() * 0.42, spin: (r() - 0.5) * 3.2, rdelay: r() * 0.3,
    });
  }
  return { group, rays, mat };
}
const spark = makeSpark(); scene.add(spark.group);
const _q = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();

// assemble: 0 = scattered → 1 = formed (per ray eased), explode: 0 → 1 = blown outward
function poseSpark(assembleAt, explode) {
  for (const ray of spark.rays) {
    const k = assembleAt(ray);
    const e = explode(ray);
    _qa.setFromEuler(_e.set(0, 0, ray.a + e * ray.spin));
    _q.copy(ray.fromQ).slerp(_qa, k);
    ray.pivot.quaternion.copy(_q);
    _v.set(Math.cos(ray.a), Math.sin(ray.a), 0).multiplyScalar(e * 7.5);
    _v.z += ray.z + e * 2.4;
    ray.pivot.position.copy(ray.from).lerp(_v, k);
    const s = lerp(0.35, 1, k) * (1 + e * 0.6);
    ray.pivot.scale.setScalar(s);
  }
}

// ───────────────────────── canvas textures ─────────────────────────
function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
function wrapText(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur); return lines;
}
function fitFont(ctx, text, weight, size, family, maxW) {
  let s = size; do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 10);
}

const CW = 1150, CH = 1600, CARD_W = 2.3, CARD_H = 3.2, CARD_R = 0.14;
const SERIF = '"Instrument Serif", serif', SANS = '"Inter Display", "Inter", sans-serif';
const px2card = (x, y) => [(x / CW - 0.5) * CARD_W, (0.5 - y / CH) * CARD_H];

function drawCard(card, i) {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const ctx = c.getContext('2d');
  ctx.save();
  ctx.beginPath(); ctx.roundRect(0, 0, CW, CH, CARD_R * 500); ctx.clip();
  let g = ctx.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, rgba(card.accent, 0.26)); g.addColorStop(0.42, rgba(card.accent, 0.06)); g.addColorStop(1, 'rgba(255,255,255,0.025)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  g = ctx.createRadialGradient(CW * 0.88, 40, 10, CW * 0.88, 40, 760);
  g.addColorStop(0, rgba(card.accent, 0.42)); g.addColorStop(1, rgba(card.accent, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  ctx.restore();

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(243,237,228,0.62)'; ctx.font = `500 34px ${SANS}`; ctx.letterSpacing = '10px';
  ctx.fillText('CLAUDE', 92, 132);
  ctx.fillStyle = rgba(card.accent, 0.9); ctx.fillText(`0${i + 1}`, 92, 190);
  ctx.letterSpacing = '0px';

  ctx.font = `400 250px ${SERIF}`; ctx.fillStyle = '#F7F1E9';
  ctx.fillText(card.name, 88, 610);
  const nw = ctx.measureText(card.name).width;
  ctx.font = `italic 400 150px ${SERIF}`; ctx.fillStyle = card.accent;
  ctx.fillText(card.ver, 88 + nw + 26, 610);

  ctx.fillStyle = card.accent; ctx.beginPath(); ctx.roundRect(92, 662, 120, 7, 4); ctx.fill();

  fitFont(ctx, card.tag, 600, 78, SANS, 970); ctx.fillStyle = '#F7F1E9';
  ctx.fillText(card.tag, 90, 795);
  ctx.font = `400 49px ${SANS}`; ctx.fillStyle = 'rgba(243,237,228,0.74)';
  wrapText(ctx, card.desc, 970).forEach((l, k) => ctx.fillText(l, 90, 878 + k * 66));

  const M = CONTENT.models;
  ctx.font = `500 30px ${SANS}`; ctx.letterSpacing = '5px'; ctx.fillStyle = 'rgba(243,237,228,0.58)';
  ctx.fillText(M.speedLabel.toUpperCase(), 90, 1180);
  ctx.fillText(M.smartLabel.toUpperCase(), 90, 1300);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.beginPath(); ctx.roundRect(90, 1205, 970, 16, 8); ctx.fill();
  ctx.beginPath(); ctx.roundRect(90, 1325, 970, 16, 8); ctx.fill();

  ctx.font = `600 28px ${SANS}`; ctx.letterSpacing = '5px';
  const cw = ctx.measureText(M.chip).width + 64;
  ctx.fillStyle = rgba(card.accent, 0.1); ctx.strokeStyle = rgba(card.accent, 0.65); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(90, 1418, cw, 76, 38); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#F7EDE2'; ctx.fillText(M.chip, 90 + 34, 1467);
  ctx.letterSpacing = '0px';
  return { canvas: c, bars: [{ x: 90, y: 1213, w: 970, h: 16 }, { x: 90, y: 1333, w: 970, h: 16 }], gem: [1010, 150] };
}

const PW = 1800, PH = 560, PILL_W = 3.6, PILL_H = 1.12;
function drawIcon(ctx, kind, cx, cy) {
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = '#22160F'; ctx.fillStyle = '#22160F'; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'bars') {
    [[-48, 18, 40], [0, -10, 68], [48, -40, 98]].forEach(([x, , h]) => { ctx.beginPath(); ctx.roundRect(x - 15, 55 - h, 30, h, 9); ctx.fill(); });
  } else if (kind === 'spark') {
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2, L = k % 2 ? 46 : 68; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
  } else if (kind === 'terminal') {
    ctx.lineWidth = 12; ctx.beginPath(); ctx.roundRect(-70, -54, 140, 108, 18); ctx.stroke();
    ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-8, 4); ctx.lineTo(-36, 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 28); ctx.lineTo(40, 28); ctx.stroke();
  } else if (kind === 'search') {
    ctx.beginPath(); ctx.arc(-12, -12, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(58, 58); ctx.stroke();
  }
  ctx.restore();
}
function drawPill(item) {
  const c = document.createElement('canvas'); c.width = PW; c.height = PH;
  const ctx = c.getContext('2d');
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, PW, PH, PH / 2); ctx.clip();
  let g = ctx.createLinearGradient(0, 0, PW, 0);
  g.addColorStop(0, rgba(item.accent, 0.28)); g.addColorStop(0.45, rgba(item.accent, 0.07)); g.addColorStop(1, 'rgba(255,255,255,0.03)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH); ctx.restore();
  g = ctx.createRadialGradient(240, 220, 10, 280, 280, 175);
  g.addColorStop(0, '#FFF1E2'); g.addColorStop(0.35, item.accent); g.addColorStop(1, rgba(item.accent, 0.85));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(280, 280, 165, 0, Math.PI * 2); ctx.fill();
  drawIcon(ctx, item.icon, 280, 280);
  fitFont(ctx, item.title, 600, 90, SANS, 1250); ctx.fillStyle = '#F7F1E9'; ctx.fillText(item.title, 510, 262);
  fitFont(ctx, item.sub, 400, 58, SANS, 1250); ctx.fillStyle = 'rgba(243,237,228,0.74)'; ctx.fillText(item.sub, 510, 356);
  return c;
}

// Border + sheen overlay (rounded-rect SDF), additive.
function edgeMat(w, h, bw, bh, r, accent) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uAccent: { value: col(accent) }, uGlow: { value: 0 }, uSheen: { value: 0 }, uO: { value: 1 }, uTime: { value: 0 }, uSize: { value: new THREE.Vector2(w, h) }, uBox: { value: new THREE.Vector2(bw, bh) }, uR: { value: r } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      varying vec2 vUv; uniform vec3 uAccent; uniform float uGlow, uSheen, uO, uTime, uR; uniform vec2 uSize, uBox;
      float sdR(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
      void main(){
        vec2 p=(vUv-.5)*uSize; float d=sdR(p, uBox*.5, uR);
        float inside = 1.-smoothstep(-.003,.003,d);
        float line = exp(-pow(d/.0075,2.));
        float halo = exp(-pow(max(d,0.)/.05,2.))*step(0.,d)*.35;
        float ang = atan(p.y,p.x);
        float grad = .45 + .55*pow(.5+.5*sin(ang*1. + 1.2 + uTime*1.3), 2.);
        vec3 c = uAccent*(line*(.35 + uGlow*2.6)*grad + halo*uGlow*grad);
        float x = p.x/uBox.x + p.y/uBox.y*.55;
        float band = exp(-pow((x-(uSheen*2.6-1.3))/.07,2.)) + exp(-pow((x-(uSheen*2.6-1.42))/.02,2.))*.6;
        c += vec3(1.,.96,.9)*band*inside*.32*step(.001,uSheen)*(1.-step(.999,uSheen));
        gl_FragColor = vec4(c*uO,1.);
      }`,
  });
}

function makeBody(w, h, r, tint = '#17141C') {
  const geo = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: 0.04, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.022, bevelSegments: 4, curveSegments: 14 });
  geo.translate(0, 0, -0.02);
  const mat = new THREE.MeshPhysicalMaterial({ color: col(tint), metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.85, transparent: true, opacity: 0.9 });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 1; return m;
}
function makeFace(w, h, texture, z, order) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  m.position.z = z; m.renderOrder = order; return m;
}

// ───────────────────────── model cards ─────────────────────────
const STAGE_CARDS = -14, STAGE_PRO = -28;
const CARD_POS = PORTRAIT
  ? [[-1.3, 1.75, 0], [1.3, 1.75, 0], [-1.3, -1.75, 0], [1.3, -1.75, 0]]
  : [[-3.9, 0, 0.55], [-1.3, 0, 0.08], [1.3, 0, 0.08], [3.9, 0, 0.55]];
const FOCUS = [5.75, 6.85, 7.95, 9.05];
const cardsGroup = new THREE.Group(); scene.add(cardsGroup);
const cards = [];
function gemGeo(kind) {
  if (kind === 'sphere') return new THREE.SphereGeometry(0.16, 48, 32);
  if (kind === 'torus') return new THREE.TorusGeometry(0.14, 0.055, 32, 96);
  if (kind === 'ico') return new THREE.IcosahedronGeometry(0.19, 0);
  const g = new THREE.OctahedronGeometry(0.17, 0); g.scale(0.8, 1.35, 0.8); return g;
}

function buildCards() {
  CONTENT.models.cards.forEach((card, i) => {
    const d = drawCard(card, i);
    const root = new THREE.Group();
    const body = makeBody(CARD_W, CARD_H, CARD_R);
    const face = makeFace(CARD_W, CARD_H, tex(d.canvas), 0.047, 2);
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W + 0.3, CARD_H + 0.3), edgeMat(CARD_W + 0.3, CARD_H + 0.3, CARD_W + 0.04, CARD_H + 0.04, CARD_R + 0.02, card.accent));
    edge.position.z = 0.05; edge.renderOrder = 3;
    root.add(body, face, edge);

    const bars = d.bars.map((b, k) => {
      const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0.5, 0, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(card.accent).multiplyScalar(k === 0 ? 1.7 : 2.1), transparent: true }));
      const [x, y] = px2card(b.x, b.y + b.h / 2);
      m.position.set(x, y, 0.06); m.scale.set(0.0001, (b.h / CH) * CARD_H, 0.018); m.renderOrder = 4;
      root.add(m); return { mesh: m, w: (b.w / CW) * CARD_W, v: k === 0 ? card.speed : card.smart };
    });

    const gem = new THREE.Mesh(gemGeo(card.gem), new THREE.MeshPhysicalMaterial({
      color: col(card.accent), metalness: 0.45, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05,
      iridescence: 0.8, iridescenceIOR: 1.7, emissive: col(card.accent), emissiveIntensity: 0.3, envMapIntensity: 1.4,
      flatShading: card.gem === 'ico' || card.gem === 'crystal', transparent: true,
    }));
    const [gx, gy] = px2card(...d.gem); gem.position.set(gx, gy, 0.32); root.add(gem);

    cardsGroup.add(root);
    cards.push({ root, body, face, edge, bars, gem, i, accent: col(card.accent), baseX: CARD_POS[i][0], baseY: CARD_POS[i][1], baseZ: STAGE_CARDS - CARD_POS[i][2], baseRY: -CARD_POS[i][0] * (PORTRAIT ? 0.05 : 0.055), baseRX: CARD_POS[i][1] * 0.03 });
  });
}

// ───────────────────────── pro section ─────────────────────────
const proGroup = new THREE.Group(); proGroup.position.set(0, 0, STAGE_PRO); scene.add(proGroup);
const PILL_POS = PORTRAIT ? [[0, -0.52], [0, -1.8], [0, -3.08], [0, -4.36]] : [[-3.3, 0.55], [3.3, 0.55], [-3.3, -0.92], [3.3, -0.92]];
const PRO_SPARK_Y = PORTRAIT ? 1.02 : -0.15, OUTRO_SPARK_Y = PORTRAIT ? 0.5 : -0.15;
const PRO_SPARK_S = PORTRAIT ? 0.62 : 0.78, RING_S = PORTRAIT ? 0.72 : 1;
const PILL_T = [12.75, 13.0, 13.25, 13.5];
const pills = [];
const rings = [];
function buildPro() {
  CONTENT.pro.items.forEach((item, i) => {
    const root = new THREE.Group();
    const body = makeBody(PILL_W, PILL_H, PILL_H / 2);
    const face = makeFace(PILL_W, PILL_H, tex(drawPill(item)), 0.047, 2);
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(PILL_W + 0.3, PILL_H + 0.3), edgeMat(PILL_W + 0.3, PILL_H + 0.3, PILL_W + 0.04, PILL_H + 0.04, PILL_H / 2 + 0.02, item.accent));
    edge.position.z = 0.05; edge.renderOrder = 3;
    root.add(body, face, edge); proGroup.add(root);
    pills.push({ root, body, face, edge, i, x: PILL_POS[i][0], y: PILL_POS[i][1] });
  });
  const ringMat = (hex) => new THREE.MeshPhysicalMaterial({ color: col(hex), metalness: 1, roughness: 0.18, clearcoat: 1, emissive: col(hex), emissiveIntensity: 0.55, envMapIntensity: 1.6, transparent: true });
  [[1.22, 0.011, '#F4B860'], [1.38, 0.008, '#E8845F'], [1.52, 0.006, '#FFD9B0']].forEach(([R, tube, hex], k) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 16, 256), ringMat(hex));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045 - k * 0.008, 24, 16), ringMat(hex));
    bead.position.x = R; ring.add(bead);
    g.add(ring); g.position.y = PRO_SPARK_Y; proGroup.add(g);
    rings.push({ g, ring, k });
  });
}

// ───────────────────────── post ─────────────────────────
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.6, 0.8);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const finalPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) }, uCA: { value: 0.006 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uCA; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 c=vUv-.5; float r2=dot(c,c); vec2 off=c*r2*uCA;
      vec3 col = vec3(texture2D(tDiffuse, vUv+off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv-off).b);
      col += (h(floor(vUv*uRes) + fract(uTime*7.13)*317.) - .5)*.03;
      gl_FragColor = vec4(col,1.);
    }`,
});
composer.addPass(finalPass);

// ───────────────────────── DOM overlay ─────────────────────────
const $ = (id) => document.getElementById(id);
function splitChars(el, text) {
  el.innerHTML = '';
  return [...text].map((ch) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch === ' ' ? ' ' : ch; el.appendChild(s); return s; });
}
function splitWords(el, text) {
  el.innerHTML = '';
  return text.split(' ').map((w, i) => { if (i) el.appendChild(document.createTextNode(' ')); const s = document.createElement('span'); s.className = 'ch'; s.textContent = w; el.appendChild(s); return s; });
}
const dom = {};
function buildDom() {
  const C = CONTENT;
  dom.introWord = splitChars($('introWord'), C.intro.word);
  $('introTag').textContent = C.intro.tagline; dom.introTag = $('introTag');
  $('mLabel').textContent = C.models.label; dom.mLabel = $('mLabel');
  dom.mTitle = splitWords($('mTitle'), C.models.title);
  $('mFoot').querySelector('.pill').innerHTML = C.models.footer.replace(/(1 juta token)/i, '<b>$1</b>'); dom.mFoot = $('mFoot');
  $('pLabel').textContent = C.pro.label; dom.pLabel = $('pLabel');
  $('pTitle').querySelector('.grad').textContent = C.pro.title; dom.pTitle = $('pTitle'); dom.pGrad = $('pTitle').querySelector('.grad');
  dom.outroWord = splitChars($('outroWord'), C.outro.word);
  $('outroTag').textContent = C.outro.tagline; dom.outroTag = $('outroTag');
  $('outroUrl').querySelector('.url').textContent = C.outro.url; dom.outroUrl = $('outroUrl');
  dom.fade = $('fade'); dom.scrim = $('scrim');
}
function style(el, o, y = 0, s = 1, blur = 0, extra = '') {
  el.style.opacity = o.toFixed(4);
  el.style.visibility = o < 0.002 ? 'hidden' : 'visible';
  el.style.transform = `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)})${extra}`;
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
}
function reveal(spans, t, start, stagger, dur, outA, outB, rise = 70) {
  spans.forEach((s, i) => {
    const k = eo4(seg(t, start + i * stagger, start + i * stagger + dur));
    const o = eio3(seg(t, outA + i * 0.015, outB + i * 0.015));
    style(s, k * (1 - o), (1 - k) * rise - o * 30, 1 + o * 0.08, (1 - k) * 16 + o * 14);
  });
}

// ───────────────────────── timeline ─────────────────────────
const KEYS_LANDSCAPE = [
  [0.0, [-3.2, 1.3, 14.8], [0, -0.55, 0]],
  [2.4, [-1.1, 0.5, 11.0], [0, -0.6, 0]],
  [4.1, [0.35, 0.15, 9.3], [0, -0.6, 0]],
  [4.55, [0.1, 0.0, 3.2], [-0.5, -0.3, -14]],
  [5.1, [-1.7, 0.12, -4.0], [-2.7, 0.0, -14]],
  [5.75, [-2.8, 0.18, -5.5], [-3.5, 0.0, -14]],
  [6.3, [-2.6, 0.15, -5.65], [-3.3, 0, -14]],
  [6.85, [-1.0, 0.12, -5.55], [-1.2, 0, -14]],
  [7.4, [-0.8, 0.12, -5.65], [-1.0, 0, -14]],
  [7.95, [1.0, 0.12, -5.55], [1.2, 0, -14]],
  [8.5, [1.2, 0.12, -5.65], [1.4, 0, -14]],
  [9.05, [2.8, 0.18, -5.55], [3.5, 0, -14]],
  [9.5, [2.6, 0.18, -5.7], [3.3, 0, -14]],
  [10.2, [0.0, 0.5, -3.4], [0, -0.1, -14]],
  [10.95, [0.0, 0.45, -4.0], [0, -0.1, -14]],
  [11.55, [0.0, 0.2, -10.5], [0, -0.1, -28]],
  [12.3, [0.0, 0.12, -17.1], [0, -0.05, -28]],
  [15.9, [0.2, 0.1, -17.9], [0, -0.05, -28]],
  [17.3, [0.0, 0.05, -18.8], [0, -0.62, -28]],
  [19.2, [0.0, 0.05, -19.3], [0, -0.62, -28]],
];
// Portrait: cards in a 2×2 grid visited in a Z pattern, Pro benefits stacked.
const KEYS_PORTRAIT = [
  [0.0, [-1.6, 1.0, 13.5], [0, -1.0, 0]],
  [2.4, [-0.6, 0.4, 10.2], [0, -1.0, 0]],
  [4.1, [0.25, 0.1, 8.6], [0, -1.0, 0]],
  [4.55, [0.05, 0.1, 3.0], [-0.4, 0.8, -14]],
  [5.1, [-0.9, 1.5, -6.6], [-1.2, 1.9, -14]],
  [5.75, [-1.2, 1.7, -8.3], [-1.3, 2.05, -14]],
  [6.3, [-1.1, 1.72, -8.45], [-1.2, 2.0, -14]],
  [6.85, [1.2, 1.7, -8.35], [1.3, 2.05, -14]],
  [7.4, [1.1, 1.72, -8.45], [1.2, 2.0, -14]],
  [7.95, [-1.2, -1.8, -8.35], [-1.3, -1.45, -14]],
  [8.5, [-1.1, -1.78, -8.45], [-1.2, -1.5, -14]],
  [9.05, [1.2, -1.8, -8.35], [1.3, -1.45, -14]],
  [9.5, [1.1, -1.78, -8.45], [1.2, -1.5, -14]],
  [10.2, [0.0, 0.45, -3.8], [0, 0.25, -14]],
  [10.95, [0.0, 0.4, -4.3], [0, 0.25, -14]],
  [11.55, [0.0, 0.1, -10.5], [0, 0.0, -28]],
  [12.3, [0.0, 0.05, -18.2], [0, -0.6, -28]],
  [15.9, [0.12, 0.05, -18.9], [0, -0.6, -28]],
  [17.3, [0.0, 0.05, -19.4], [0, -1.0, -28]],
  [19.2, [0.0, 0.05, -19.9], [0, -1.0, -28]],
];
const camTrack = track(PORTRAIT ? KEYS_PORTRAIT : KEYS_LANDSCAPE);
const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
const tmpC = new THREE.Color();
const ACC = { coral: col('#E07B57'), violet: col('#5B3FD6'), teal: col('#1E7F86'), gold: col('#F4B860') };

function update(t) {
  // camera ---------------------------------------------------
  camTrack(t, camPos, camTgt);
  camPos.x += Math.sin(t * 0.9) * 0.03; camPos.y += Math.sin(t * 0.7 + 1) * 0.02;
  camera.position.copy(camPos); camera.lookAt(camTgt);
  camera.rotateZ(Math.sin(t * 0.45) * 0.006 + (seg(t, 4.2, 4.9) - seg(t, 4.9, 5.4)) * 0.05);
  const fly1 = win(t, 4.2, 4.5, 4.75, 5.2), fly2 = win(t, 11.0, 11.35, 11.7, 12.2);
  camera.fov = FOV + fly1 * 10 + fly2 * 8; camera.updateProjectionMatrix();
  bg.position.copy(camera.position);

  // background tint per section ------------------------------
  let A = ACC.coral.clone(), B = ACC.violet.clone();
  const focusIdx = clamp(Math.round((t - 5.75) / 1.1), 0, 3);
  const inCards = win(t, 4.6, 5.4, 10.9, 11.6);
  if (inCards > 0) {
    const fi = clamp((t - 5.75) / 1.1 + 0.5, 0, 3.999), i0 = Math.floor(fi), fr = smooth(0.55, 1, fi - i0);
    tmpC.copy(cards[i0].accent).lerp(cards[Math.min(3, i0 + 1)].accent, fr);
    const ov = smooth(9.6, 10.3, t);
    tmpC.lerp(ACC.coral, ov * 0.6);
    A.lerp(tmpC, inCards);
  }
  const inPro = win(t, 11.6, 12.6, 15.9, 16.8);
  A.lerp(ACC.gold, inPro * 0.8); B.lerp(ACC.coral, inPro * 0.5);
  bgMat.uniforms.uA.value.copy(A); bgMat.uniforms.uB.value.copy(B);
  bgMat.uniforms.uTime.value = t;
  bgMat.uniforms.uI.value = 1 + fly1 * 0.4 + fly2 * 0.3;

  particles.material.uniforms.uTime.value = t;
  streaks.material.uniforms.uI.value = fly1 * 0.8 + fly2 * 0.7;
  streaks.material.uniforms.uStretch.value = 0.4 + Math.max(fly1, fly2) * 7;
  streaks.visible = fly1 + fly2 > 0.001;

  // spark ----------------------------------------------------
  const sparkVisible = t < 4.95 || t > 11.3;
  spark.group.visible = sparkVisible;
  const pro = t > 8;
  const sPos = pro ? new THREE.Vector3(0, lerp(PRO_SPARK_Y, OUTRO_SPARK_Y, eio3(seg(t, 16.0, 17.4))), STAGE_PRO) : new THREE.Vector3(0, 0, 0);
  spark.group.position.copy(sPos);
  if (!pro) {
    poseSpark((r) => eo4(seg(t, 0.2 + r.delay, 1.95 + r.delay)), (r) => ei3(seg(t, 4.12 + r.rdelay * 0.3, 4.78 + r.rdelay * 0.3)));
    const k = eo4(seg(t, 0.2, 2.6));
    spark.group.rotation.set(0.12 * Math.sin(t * 0.6) * k + (1 - k) * 0.5, lerp(-1.5, 0, k) + 0.22 * Math.sin(t * 0.8) * smooth(2.2, 3.2, t), lerp(-0.8, 0, k) + t * 0.04);
    spark.group.scale.setScalar(1 + smooth(4.0, 4.7, t) * 0.5);
  } else {
    poseSpark((r) => 1, (r) => 1 - eo4(seg(t, 11.35 + r.rdelay, 12.4 + r.rdelay)));
    const spin = eio5(seg(t, 16.15, 17.45));
    spark.group.rotation.set(0.1 * Math.sin(t * 0.6), 0.25 * Math.sin(t * 0.7) + spin * Math.PI * 2, -t * 0.06);
    spark.group.scale.setScalar(lerp(PRO_SPARK_S, 1.0, eio3(seg(t, 16.0, 17.4))));
  }
  const impact = pulse(t, 2.3, 0.08, 0.45), impact2 = pulse(t, 17.4, 0.1, 0.5), impactPro = pulse(t, 12.45, 0.1, 0.4);
  spark.mat.emissiveIntensity = 0.06 + impact * 0.8 + impact2 * 0.8 + impactPro * 0.5 + fly1 * 0.6;

  // glows follow spark, face camera
  [halo, flare, shock].forEach((m) => { m.position.copy(sPos); m.quaternion.copy(camera.quaternion); });
  halo.visible = flare.visible = shock.visible = sparkVisible;
  const formed = pro ? eo3(seg(t, 11.6, 12.6)) : eo3(seg(t, 1.0, 2.4)) * (1 - seg(t, 4.2, 4.7));
  halo.material.uniforms.uI.value = 0.15 * formed * (1 + 0.1 * Math.sin(t * 2.0)) + impact * 0.16 + impact2 * 0.16 + impactPro * 0.1;
  const near = smooth(2.5, 6.5, camera.position.distanceTo(sPos));
  flare.material.uniforms.uI.value = (impact * 0.75 + impact2 * 0.7 + impactPro * 0.35 + fly1 * 0.25) * near;
  halo.material.uniforms.uI.value *= near;
  const sk = pro ? (t > 17.3 ? seg(t, 17.35, 18.4) : seg(t, 12.4, 13.4)) : seg(t, 2.28, 3.3);
  shock.scale.setScalar(lerp(1.0, pro ? 4.5 : 6.5, eo3(sk)));
  shock.material.uniforms.uI.value = (sk > 0 && sk < 1 ? Math.pow(1 - sk, 2) * smooth(0, 0.06, sk) : 0) * (pro && t < 17 ? 0.35 : 0.5);

  // lights
  sweep.intensity = 0; coralFill.intensity = 0;
  if (!pro) {
    const s = seg(t, 2.1, 3.9);
    sweep.position.set(lerp(-4, 4, eio3(s)), 1.6, 2.4); sweep.intensity = 26 * win(t, 2.0, 2.4, 3.6, 4.0);
    coralFill.position.set(0, -1.5, 2.5); coralFill.intensity = 6 * formed;
  }

  // model cards ----------------------------------------------
  cardsGroup.visible = t > 4.5 && t < 12.2;
  if (cardsGroup.visible) {
    const ovw = win(t, 9.75, 10.2, 10.9, 11.2);
    for (const c of cards) {
      const f = FOCUS[c.i];
      const ke = eo4(seg(t, f - 0.62, f + 0.25));
      const foc = win(t, f - 0.45, f, f + 0.55, f + 0.95);
      const glow = Math.max(foc, ovw * 0.65);
      const other = Math.max(...FOCUS.map((ff, j) => (j === c.i ? 0 : win(t, ff - 0.45, ff, ff + 0.55, ff + 0.95))));
      const dim = PORTRAIT ? 1 - 0.62 * other * (1 - ovw) : 1;
      const side = c.baseX < 0 ? -1 : 1;
      const exd = PORTRAIT ? c.i * 0.04 : Math.abs(c.baseX) > 2 ? 0.07 : 0;
      const ex = ei3(seg(t, 10.95 + exd, 11.65 + exd));
      const vside = c.baseY > 0 ? 1 : c.baseY < 0 ? -1 : 0;
      c.root.position.set(
        c.baseX + side * ex * (PORTRAIT ? 5 : 7.5),
        c.baseY - 2.4 * (1 - ke) + vside * ex * 3 + Math.sin(t * 1.1 + c.i) * 0.03,
        c.baseZ - 2.8 * (1 - ke) + foc * 0.35 + ex * 2.5,
      );
      c.root.rotation.set(c.baseRX + 0.75 * (1 - ke) - foc * 0.02 + vside * ex * 0.6, c.baseRY + side * 0.55 * (1 - ke) + side * ex * 1.1 + Math.sin(t * 0.8 + c.i) * 0.02, -side * 0.12 * (1 - ke));
      c.root.scale.setScalar(1 + foc * 0.04);
      const vis = ke * (1 - seg(t, 11.5, 11.9)) * dim;
      c.root.visible = vis > 0.001;
      c.body.material.opacity = 0.9 * vis;
      c.face.material.opacity = vis * (0.82 + 0.18 * Math.max(foc, ovw));
      c.edge.material.uniforms.uO.value = vis;
      c.edge.material.uniforms.uGlow.value = glow;
      c.edge.material.uniforms.uTime.value = t + c.i;
      const sh1 = seg(t, f - 0.2, f + 0.75), sh2 = seg(t, 9.95 + c.i * 0.1, 10.75 + c.i * 0.1);
      c.edge.material.uniforms.uSheen.value = sh1 > 0 && sh1 < 1 ? sh1 : sh2 > 0 && sh2 < 1 ? sh2 : 0;
      const fill = eo3(seg(t, f - 0.25, f + 0.65));
      c.bars.forEach((b, k) => { b.mesh.scale.x = Math.max(0.0001, b.w * b.v * eo3(seg(t, f - 0.25 + k * 0.1, f + 0.65 + k * 0.1))); b.mesh.material.opacity = vis; });
      c.gem.rotation.set(t * 0.7 + c.i, t * 1.1 + c.i * 2, 0.3);
      c.gem.position.z = 0.32 + Math.sin(t * 1.6 + c.i) * 0.04 + foc * 0.1;
      c.gem.material.opacity = vis;
      c.gem.scale.setScalar(ke * (1 + foc * 0.15));
    }
    const [fx, fy] = CARD_POS[focusIdx];
    sweep.position.set(fx - 2.0 + 4.0 * seg(t, FOCUS[focusIdx] - 0.3, FOCUS[focusIdx] + 0.8), fy + 2.6, STAGE_CARDS + 4.0);
    sweep.intensity = (PORTRAIT ? 0 : 1.6) * inCards;
  }

  // pro ------------------------------------------------------
  proGroup.visible = t > 11.7 && t < 16.9;
  if (proGroup.visible) {
    for (const p of pills) {
      const t0 = PILL_T[p.i];
      const k = eo5(seg(t, t0, t0 + 0.95));
      const back = ei3(seg(t, 15.9 + p.i * 0.06, 16.55 + p.i * 0.06));
      const side = PORTRAIT ? (p.i % 2 ? 1 : -1) : p.x < 0 ? -1 : 1;
      const m = k * (1 - back);
      p.root.position.set(lerp(0, p.x, m), lerp(PRO_SPARK_Y, p.y, m) + Math.sin(t * 1.2 + p.i) * 0.025, lerp(-0.6, 0, m) + 0.1 * Math.sin(t + p.i));
      p.root.rotation.set(0.05 * Math.sin(t + p.i), (PORTRAIT ? 0 : -side * 0.16) + side * (1 - k) * 1.5 - side * back * 1.0, 0);
      p.root.scale.setScalar(lerp(0.15, 1, m));
      const vis = seg(t, t0, t0 + 0.3) * (1 - seg(t, 16.3, 16.6));
      p.root.visible = vis > 0.001;
      p.body.material.opacity = 0.9 * vis; p.face.material.opacity = vis;
      p.edge.material.uniforms.uO.value = vis;
      p.edge.material.uniforms.uGlow.value = 0.25 + win(t, t0 + 0.3, t0 + 0.7, t0 + 1.2, t0 + 1.9) * 0.75 + 0.15 * Math.sin(t * 2 + p.i);
      p.edge.material.uniforms.uTime.value = t;
      const sh = seg(t, t0 + 0.45, t0 + 1.35);
      p.edge.material.uniforms.uSheen.value = sh < 1 ? sh : 0;
    }
    const rk = eo4(seg(t, 12.3, 13.3)) * (1 - ei3(seg(t, 15.95, 16.6)));
    for (const r of rings) {
      r.g.scale.setScalar(RING_S * lerp(0.4, 1, rk) * (1 + r.k * 0.02));
      r.g.rotation.set([1.22, -1.0, 0.32][r.k] + Math.sin(t * 0.4 + r.k) * 0.12, [0.32, -0.5, 0.15][r.k] + Math.sin(t * 0.3 + r.k * 2) * 0.25, 0);
      r.ring.rotation.z = t * (0.7 - r.k * 0.22) * (r.k % 2 ? -1 : 1);
      r.ring.material.opacity = rk; r.ring.children[0].material.opacity = rk;
      r.g.visible = rk > 0.001;
    }
    sweep.position.set(Math.cos(t * 1.2) * 3, 1.6, STAGE_PRO + 2.5 + Math.sin(t * 1.2)); sweep.intensity = (PORTRAIT ? 0 : 1.8) * inPro;
    coralFill.position.set(0, -1.8, STAGE_PRO + 2.4); coralFill.intensity = 8 * inPro;
  }
  if (t > 16.4) { coralFill.position.set(0, -1.6, STAGE_PRO + 2.6); coralFill.intensity = 7 * smooth(16.4, 17.2, t); }

  // bloom ----------------------------------------------------
  bloom.strength = 0.5 + impact * 0.45 + impact2 * 0.4 + impactPro * 0.25 + fly1 * 0.55 + fly2 * 0.35;
  bloom.radius = 0.6;
  finalPass.uniforms.uTime.value = t;
  finalPass.uniforms.uCA.value = 0.006 + (fly1 + fly2) * 0.05;

  // DOM ------------------------------------------------------
  reveal(dom.introWord, t, 2.45, 0.07, 0.95, 3.95, 4.4);
  { const k = eo4(seg(t, 2.95, 3.75)), o = eio3(seg(t, 3.9, 4.3)); style(dom.introTag, k * (1 - o), (1 - k) * 26 - o * 20, 1, (1 - k) * 10 + o * 10, ''); dom.introTag.style.letterSpacing = `${lerp(PORTRAIT ? 0.36 : 0.55, PORTRAIT ? 0.2 : 0.32, k).toFixed(3)}em`; }

  { const k = eo4(seg(t, 5.05, 5.75)), o = eio3(seg(t, 10.85, 11.2)); style(dom.mLabel, k * (1 - o), (1 - k) * 18, 1, (1 - k) * 8 + o * 8); dom.mLabel.style.letterSpacing = `${lerp(PORTRAIT ? 0.5 : 0.7, PORTRAIT ? 0.3 : 0.42, k).toFixed(3)}em`; }
  reveal(dom.mTitle, t, 5.2, 0.09, 0.85, 10.85, 11.2, 46);
  { const k = eo4(seg(t, 9.85, 10.45)), o = eio3(seg(t, 10.85, 11.15)); style(dom.mFoot, k * (1 - o), (1 - k) * 30, lerp(0.94, 1, k), (1 - k) * 8 + o * 8); }

  { const k = eo4(seg(t, 12.25, 12.85)), o = eio3(seg(t, 15.75, 16.15)); style(dom.pLabel, k * (1 - o), (1 - k) * 18, 1, (1 - k) * 8 + o * 8); dom.pLabel.style.letterSpacing = `${lerp(PORTRAIT ? 0.55 : 0.75, PORTRAIT ? 0.32 : 0.42, k).toFixed(3)}em`; }
  { const k = eo5(seg(t, 12.3, 13.3)), o = eio3(seg(t, 15.75, 16.2));
    style(dom.pTitle, k * (1 - o), (1 - k) * 40 - o * 20, lerp(1.12, 1, k) + o * 0.06, (1 - k) * 22 + o * 18);
    dom.pTitle.style.letterSpacing = `${lerp(0.12, -0.005, k).toFixed(3)}em`;
    dom.pGrad.style.backgroundPosition = `${lerp(100, 0, eio3(seg(t, 12.3, 15.8))).toFixed(2)}% 50%`; }

  reveal(dom.outroWord, t, 17.05, 0.075, 1.0, 99, 100);
  { const k = eo4(seg(t, 17.5, 18.25)); style(dom.outroTag, k, (1 - k) * 24, 1, (1 - k) * 10); }
  { const k = eo4(seg(t, 17.8, 18.45)); style(dom.outroUrl, k, (1 - k) * 20, lerp(0.92, 1, k), (1 - k) * 8); }

  dom.scrim.style.opacity = PORTRAIT ? (win(t, 5.0, 5.5, 9.55, 9.95) * 0.95).toFixed(4) : '0';
  dom.fade.style.opacity = (clamp(1 - smooth(0.0, 0.7, t) + smooth(18.55, 19.15, t))).toFixed(4);
}

// ───────────────────────── boot ─────────────────────────
async function boot() {
  await Promise.all([
    document.fonts.load(`400 100px "Instrument Serif"`), document.fonts.load(`italic 400 100px "Instrument Serif"`),
    document.fonts.load(`400 40px "Inter Display"`), document.fonts.load(`500 40px "Inter Display"`), document.fonts.load(`600 40px "Inter Display"`),
  ]);
  await document.fonts.ready;
  buildDom(); buildCards(); buildPro();
  // warm up: compile every material once
  for (const tt of [0.5, 3, 6, 10, 13, 17]) { update(tt); composer.render(); }
}
window.renderAt = (t) => { update(t); if (window.__hook) window.__hook(); composer.render(); return true; };
window.DURATION = DURATION;
window.__dbg = { streaks, particles, bloom, halo, flare, shock, cardsGroup, proGroup, spark };
window.__ready = boot().then(() => true);
