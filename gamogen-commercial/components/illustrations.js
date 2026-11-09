/* =========================================================================
   Premium SVG illustration library (brand palette). Each function returns an
   SVG markup string. Strokes marked data-draw can be drawn on with HG.draw().
   ========================================================================= */
(function () {
  const { C, prng } = HG;
  let uid = 0;
  const id = p => `${p}${++uid}`;

  /** Stichopus horrens — elegant scientific-style sea cucumber (warty, papillae). viewBox 0 0 760 320 */
  function seaCucumber({ w = 760, line = C.gold, seed = 4, plate = false } = {}) {
    const r = prng(seed);
    const g1 = id("scB"), g2 = id("scP"), g3 = id("scH");
    const body = "M 70 185 C 62 120 170 92 300 96 C 450 100 590 78 680 126 C 736 156 730 214 684 228 C 596 254 452 246 300 244 C 166 242 78 240 70 185 Z";
    let pap = "";
    // papillae along the dorsal ridge (conical, gold-tipped)
    for (let i = 0; i < 15; i++) {
      const t = i / 14;
      const x = 120 + t * 560;
      const yTop = 104 - Math.sin(t * Math.PI) * 6 + (t > 0.75 ? (t - 0.75) * 120 : 0) + (t < 0.1 ? 30 * (0.1 - t) * 10 : 0);
      const hgt = 22 + r() * 18, wd = 13 + r() * 6;
      pap += `<path d="M ${x - wd} ${yTop + 14} Q ${x - 2} ${yTop - hgt} ${x + wd * 0.4} ${yTop - hgt + 4} Q ${x + 4} ${yTop - hgt * 0.4} ${x + wd} ${yTop + 14} Z" fill="url(#${g2})"/>`;
    }
    // lateral warts
    let warts = "";
    for (let i = 0; i < 46; i++) {
      const x = 110 + r() * 570, y = 130 + r() * 90;
      const s = 4 + r() * 9;
      warts += `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.8}" fill="${C.burgSoft}" opacity=".85"/><circle cx="${x - s * 0.3}" cy="${y - s * 0.3}" r="${s * 0.35}" fill="${C.goldLight}" opacity=".7"/>`;
    }
    // contour hatching
    let hatch = "";
    for (let k = 0; k < 4; k++) {
      const off = 22 + k * 24;
      hatch += `<path d="M ${100 + k * 8} ${150 + off * 0.35} C 240 ${118 + off} 470 ${112 + off} ${680 - k * 6} ${150 + off * 0.5}" fill="none" stroke="${line}" stroke-width="1.6" opacity=".35"/>`;
    }
    // oral tentacles (left end)
    let tent = "";
    for (let i = 0; i < 7; i++) {
      const a = (-60 + i * 20) * Math.PI / 180;
      const x2 = 70 - Math.cos(a) * 52, y2 = 182 + Math.sin(a) * 48;
      tent += `<path data-draw d="M 74 182 Q ${70 - Math.cos(a) * 30} ${182 + Math.sin(a) * 18} ${x2} ${y2}" fill="none" stroke="${line}" stroke-width="4" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="6" fill="${line}"/>`;
    }
    // tube feet along the belly
    let feet = "";
    for (let i = 0; i < 26; i++) { const x = 120 + i * 21; feet += `<path d="M ${x} ${240 - Math.sin(i / 25 * Math.PI) * 4} l ${-3 + r() * 6} 12" stroke="${C.burgDeep}" stroke-width="4" stroke-linecap="round"/>`; }
    const plateBits = plate ? `
      <g stroke="${C.goldDeep}" stroke-width="2" fill="none" opacity=".9">
        <path data-draw d="M 70 290 H 690"/>${Array.from({ length: 13 }, (_, i) => `<path d="M ${70 + i * 51.6} 290 v ${i % 2 ? 10 : 18}"/>`).join("")}
      </g>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 320 / 760}" viewBox="0 0 760 320" style="overflow:visible;display:block">
      <defs>
        <linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.burgSoft}"/><stop offset=".45" stop-color="${C.burg}"/><stop offset="1" stop-color="${C.burgDeep}"/></linearGradient>
        <linearGradient id="${g2}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.burg}"/><stop offset=".7" stop-color="${C.burgSoft}"/><stop offset="1" stop-color="${C.goldLight}"/></linearGradient>
        <radialGradient id="${g3}" cx=".45" cy=".2" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="390" cy="262" rx="330" ry="22" fill="${C.burgDeep}" opacity=".18"/>
      ${feet}
      ${pap}
      <path d="${body}" fill="url(#${g1})"/>
      ${warts}${hatch}
      <path d="${body}" fill="url(#${g3})"/>
      <path data-draw d="${body}" fill="none" stroke="${line}" stroke-width="3.5"/>
      ${tent}${plateBits}
    </svg>`;
  }

  /** flax sprig botanical (line art + golden seed bolls). viewBox 0 0 420 620 */
  function flaxSprig({ w = 420 } = {}) {
    const flower = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      ${[0, 72, 144, 216, 288].map(a => `<path data-draw d="M0 0 C -22 -18 -18 -54 0 -60 C 18 -54 22 -18 0 0 Z" transform="rotate(${a})" fill="${C.ivory}" stroke="${C.goldDeep}" stroke-width="3"/>`).join("")}
      <circle r="9" fill="${C.gold}"/></g>`;
    const boll = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="20" fill="${C.gold}" stroke="${C.goldDeep}" stroke-width="3"/><path d="M -14 -8 Q 0 -26 14 -8" fill="none" stroke="${C.goldDeep}" stroke-width="3"/><path d="M0 -20 V -38" stroke="${C.goldDeep}" stroke-width="3"/></g>`;
    const leaf = (x, y, rot, L = 70) => `<path data-draw d="M ${x} ${y} q ${L * 0.35} ${-L * 0.18} ${L} 0 q ${-L * 0.65} ${L * 0.2} ${-L} 0 z" transform="rotate(${rot} ${x} ${y})" fill="${FX_hex(C.gold, 0.25)}" stroke="${C.goldDeep}" stroke-width="2.5"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 620 / 420}" viewBox="0 0 420 620" style="overflow:visible;display:block">
      <g fill="none" stroke="${C.goldDeep}" stroke-width="4" stroke-linecap="round">
        <path data-draw d="M 210 610 C 206 480 214 360 200 230 C 194 170 160 120 120 80"/>
        <path data-draw d="M 202 300 C 240 240 290 200 320 140"/>
        <path data-draw d="M 206 420 C 160 380 120 340 96 280"/>
        <path data-draw d="M 200 230 C 220 180 250 150 262 100"/>
      </g>
      ${leaf(206, 520, -70)}${leaf(208, 480, -110)}${leaf(204, 380, -60, 60)}${leaf(204, 350, -120, 60)}${leaf(250, 240, -40, 50)}${leaf(140, 360, -150, 50)}
      ${flower(120, 80, 0.9, 10)}${flower(320, 140, 0.75, -20)}
      ${boll(96, 280, 1)}${boll(262, 100, 0.9)}${boll(150, 330, 0.7)}
    </svg>`;
  }
  function FX_hex(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

  /** a single flax seed (glossy) viewBox 0 0 40 70 */
  function seed({ w = 40 } = {}) {
    const g = id("sd");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 1.75}" viewBox="0 0 40 70" style="display:block;overflow:visible">
      <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${C.goldDeep}"/><stop offset=".5" stop-color="#9A6A3A"/><stop offset="1" stop-color="#6E4128"/></linearGradient></defs>
      <path d="M20 2 C 36 18 38 50 20 68 C 2 50 4 18 20 2 Z" fill="url(#${g})"/><path d="M14 16 C 10 28 10 40 14 50" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  }

  /** golden oil droplet with label. viewBox -100 -130 200 260 */
  function droplet({ w = 220, label = "", sub = "OMEGA" } = {}) {
    const g = id("dr"), h = id("dh");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 1.3}" viewBox="-100 -130 200 260" style="overflow:visible;display:block">
      <defs><radialGradient id="${g}" cx=".38" cy=".62" r=".75"><stop offset="0" stop-color="#FFF4D6"/><stop offset=".35" stop-color="${C.goldLight}"/><stop offset=".8" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></radialGradient>
      <linearGradient id="${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="M0 -122 C 46 -50 86 -6 86 42 A 86 86 0 0 1 -86 42 C -86 -6 -46 -50 0 -122 Z" fill="url(#${g})" stroke="${C.goldDeep}" stroke-width="2"/>
      <ellipse cx="-36" cy="-4" rx="14" ry="36" fill="url(#${h})" transform="rotate(20 -36 -4)"/>
      ${label ? `<text x="0" y="22" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="30" fill="${C.burg}" letter-spacing="2">${sub}</text><text x="0" y="96" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="78" fill="${C.burg}">${label}</text>` : ""}
    </svg>`;
  }

  /** vitamin capsules. type "softgel" (vit E) | "capsule" (vit B). viewBox 0 0 300 140 */
  function capsule({ w = 300, type = "softgel", letter = "E" } = {}) {
    const g = id("cp"), hl = id("ch");
    if (type === "softgel") return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 140 / 300}" viewBox="0 0 300 140" style="overflow:visible;display:block">
      <defs><radialGradient id="${g}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF6DA"/><stop offset=".4" stop-color="${C.goldLight}"/><stop offset="1" stop-color="${C.goldDeep}"/></radialGradient></defs>
      <ellipse cx="150" cy="70" rx="142" ry="62" fill="url(#${g})" stroke="${C.goldDeep}" stroke-width="2.5"/>
      <ellipse cx="110" cy="44" rx="70" ry="14" fill="#fff" opacity=".55"/>
      <text x="150" y="98" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="74" fill="${C.burg}">${letter}</text></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 140 / 300}" viewBox="0 0 300 140" style="overflow:visible;display:block">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.burgSoft}"/><stop offset="1" stop-color="${C.burgDeep}"/></linearGradient>
      <linearGradient id="${hl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ivory}"/><stop offset="1" stop-color="${C.creamDeep}"/></linearGradient></defs>
      <path d="M150 10 H 80 A 60 60 0 0 0 80 130 H 150 Z" fill="url(#${g})"/>
      <path d="M150 10 H 220 A 60 60 0 0 1 220 130 H 150 Z" fill="url(#${hl})" stroke="${C.gold}" stroke-width="2"/>
      <rect x="40" y="28" width="210" height="14" rx="7" fill="#fff" opacity=".4"/>
      <text x="96" y="96" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="66" fill="${C.ivory}">${letter}</text></svg>`;
  }

  /** chlorella cells in a microscope viewport. viewBox 0 0 520 520 */
  function chlorella({ w = 520, seed = 9 } = {}) {
    const r = prng(seed), cg = id("cl"), clip = id("cc");
    let cells = "";
    for (let i = 0; i < 16; i++) {
      const x = 70 + r() * 380, y = 70 + r() * 380, s = 26 + r() * 30;
      cells += `<g class="cell" transform="translate(${x} ${y})"><circle r="${s}" fill="url(#${cg})" stroke="#6E8460" stroke-width="3"/><circle cx="${s * 0.25}" cy="${-s * 0.2}" r="${s * 0.38}" fill="#6E8460" opacity=".55"/><circle cx="${-s * 0.35}" cy="${-s * 0.35}" r="${s * 0.16}" fill="#fff" opacity=".6"/></g>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 520 520" style="overflow:visible;display:block">
      <defs><radialGradient id="${cg}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#DCE6CF"/><stop offset=".6" stop-color="${C.sage}"/><stop offset="1" stop-color="#6E8460"/></radialGradient>
      <clipPath id="${clip}"><circle cx="260" cy="260" r="232"/></clipPath></defs>
      <circle cx="260" cy="260" r="232" fill="${C.ivory}"/>
      <g clip-path="url(#${clip})"><g class="cells">${cells}</g></g>
      <circle cx="260" cy="260" r="236" fill="none" stroke="${C.gold}" stroke-width="10"/>
      <circle cx="260" cy="260" r="252" fill="none" stroke="${C.goldDeep}" stroke-width="2" stroke-dasharray="3 12" stroke-linecap="round"/>
      <g stroke="${C.goldDeep}" stroke-width="2" opacity=".6"><path d="M260 40 V 70 M260 450 V 480 M40 260 H 70 M450 260 H 480"/></g>
    </svg>`;
  }

  /** beta-carotene motif: carrot cross-section rings + amber particles. viewBox 0 0 500 500 */
  function betaCarotene({ w = 500 } = {}) {
    const g = id("bc");
    let rays = "";
    for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; rays += `<path d="M ${250 + Math.cos(a) * 52} ${250 + Math.sin(a) * 52} L ${250 + Math.cos(a) * 112} ${250 + Math.sin(a) * 112}" stroke="#F2C08C" stroke-width="3" opacity=".7"/>`; }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 500 500" style="overflow:visible;display:block">
      <defs><radialGradient id="${g}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F6C27F"/><stop offset=".55" stop-color="${C.amber}"/><stop offset="1" stop-color="#C8742F"/></radialGradient></defs>
      <circle cx="250" cy="250" r="150" fill="url(#${g})" stroke="${C.goldDeep}" stroke-width="3"/>
      <circle cx="250" cy="250" r="118" fill="none" stroke="#F8D3A4" stroke-width="4" opacity=".8"/>
      ${rays}
      <circle cx="250" cy="250" r="50" fill="#F2B36C" stroke="#F8D3A4" stroke-width="3"/>
      <ellipse cx="205" cy="190" rx="40" ry="16" fill="#fff" opacity=".35" transform="rotate(-30 205 190)"/>
    </svg>`;
  }

  /** sunrise morning backdrop for an arch (w x h) */
  function morningBackdrop({ w = 680, h = 900 } = {}) {
    const g = id("mb"), s = id("ms");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBEBD0"/><stop offset=".55" stop-color="#F6DDB4"/><stop offset="1" stop-color="#EFCFA0"/></linearGradient>
      <radialGradient id="${s}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF8E6"/><stop offset=".5" stop-color="${C.goldLight}"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#${g})"/>
      <circle class="sun" cx="${w / 2}" cy="${h * 0.52}" r="230" fill="url(#${s})"/>
      <circle class="sunCore" cx="${w / 2}" cy="${h * 0.52}" r="92" fill="#FFF6DE"/>
      <path d="M0 ${h * 0.72} C ${w * 0.25} ${h * 0.66} ${w * 0.5} ${h * 0.7} ${w} ${h * 0.64} V ${h} H 0 Z" fill="${C.gold}" opacity=".55"/>
      <path d="M0 ${h * 0.8} C ${w * 0.3} ${h * 0.74} ${w * 0.65} ${h * 0.8} ${w} ${h * 0.75} V ${h} H 0 Z" fill="${C.goldDeep}" opacity=".45"/>
      <rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="${C.creamDeep}"/>
    </svg>`;
  }

  /** potted plant / monstera silhouette group */
  function plant({ w = 200, color = C.goldDeep } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 1.5}" viewBox="0 0 200 300" style="overflow:visible;display:block">
      <g fill="${color}" opacity=".85">
        <path d="M100 210 C 60 170 30 120 40 60 C 80 90 100 140 100 210 Z"/>
        <path d="M100 210 C 140 170 176 130 170 70 C 126 96 104 150 100 210 Z"/>
        <path d="M100 210 C 96 150 100 80 110 20 C 128 80 120 150 100 210 Z" opacity=".8"/>
      </g>
      <path d="M62 210 H 138 L 128 290 H 72 Z" fill="${C.burg}"/><path d="M58 206 H 142 V 222 H 58 Z" fill="${C.gold}"/>
    </svg>`;
  }

  /** spa still-life: candles, stacked stones, towel, orchid  viewBox 0 0 600 300 */
  function spaStill({ w = 600 } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w / 2}" viewBox="0 0 600 300" style="overflow:visible;display:block">
      <g>
        <ellipse cx="120" cy="268" rx="70" ry="14" fill="${C.burgDeep}" opacity=".15"/>
        <ellipse cx="120" cy="250" rx="62" ry="22" fill="#8E7A66"/><ellipse cx="122" cy="214" rx="48" ry="18" fill="#A8927C"/><ellipse cx="118" cy="184" rx="34" ry="14" fill="#BFAA92"/>
        <rect x="430" y="170" width="54" height="92" rx="8" fill="${C.ivory}" stroke="${C.gold}" stroke-width="3"/>
        <rect x="498" y="196" width="46" height="66" rx="8" fill="${C.ivory}" stroke="${C.gold}" stroke-width="3"/>
        <path class="flame" d="M457 168 C 446 150 456 136 457 126 C 462 138 470 150 457 168 Z" fill="${C.amber}"/>
        <path class="flame" d="M521 194 C 512 178 520 166 521 158 C 526 168 532 178 521 194 Z" fill="${C.amber}"/>
        <circle cx="457" cy="150" r="30" fill="${C.goldLight}" opacity=".35"/><circle cx="521" cy="176" r="26" fill="${C.goldLight}" opacity=".35"/>
        <path d="M230 262 H 380 C 392 262 392 232 380 232 H 230 C 218 232 218 262 230 262 Z" fill="${C.burg}"/>
        <path d="M240 232 H 372 C 382 232 382 208 372 208 H 240 C 230 208 230 232 240 232 Z" fill="${C.cream}" stroke="${C.gold}" stroke-width="2"/>
        <path d="M300 208 C 300 150 320 110 350 90" fill="none" stroke="${C.goldDeep}" stroke-width="4"/>
        <g transform="translate(350 88)"><path d="M0 0 C -26 -14 -30 -40 -6 -44 C 4 -30 6 -14 0 0 Z M0 0 C 26 -10 40 -34 20 -46 C 6 -34 2 -16 0 0 Z M0 0 C 10 20 32 26 44 10 C 28 2 12 -2 0 0 Z" fill="${C.ivory}" stroke="${C.goldDeep}" stroke-width="2.5"/><circle r="6" fill="${C.burg}"/></g>
      </g>
      <g class="steam" fill="none" stroke="${C.goldDeep}" stroke-width="3" stroke-linecap="round" opacity=".55">
        <path data-draw d="M300 196 C 290 176 312 162 300 140"/><path data-draw d="M322 198 C 312 172 336 160 324 132"/>
      </g>
    </svg>`;
  }

  /** heritage: tropical shoreline with palms and a batik-inspired motif band. w x h */
  function heritage({ w = 1080, h = 1100 } = {}) {
    const sky = id("hs"), sea = id("hse"), mot = id("hm");
    const palm = (x, y, s, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <path d="M0 0 C 10 -120 30 -240 70 -330" fill="none" stroke="${C.burgDeep}" stroke-width="16" stroke-linecap="round"/>
      ${[[-150, -300], [-60, -400], [40, -420], [150, -360], [190, -270], [-120, -230]].map(([dx, dy]) => `<path d="M70 -330 Q ${70 + dx * 0.5} ${-330 + (dy + 330) * 0.2 - 60} ${70 + dx} ${dy}" fill="none" stroke="${C.burg}" stroke-width="12" stroke-linecap="round"/><path d="M70 -330 Q ${70 + dx * 0.5} ${-330 + (dy + 330) * 0.2 - 40} ${70 + dx} ${dy}" fill="none" stroke="${C.burgSoft}" stroke-width="30" stroke-dasharray="4 10" opacity=".7"/>`).join("")}
    </g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
      <defs>
        <linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ivory}"/><stop offset="1" stop-color="#F3DFBB"/></linearGradient>
        <linearGradient id="${sea}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gold}" stop-opacity=".55"/><stop offset="1" stop-color="${C.goldDeep}" stop-opacity=".35"/></linearGradient>
        <pattern id="${mot}" width="90" height="90" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="${C.gold}" stroke-width="2.4" opacity=".55"><ellipse cx="45" cy="22" rx="12" ry="20"/><ellipse cx="45" cy="68" rx="12" ry="20"/><ellipse cx="22" cy="45" rx="20" ry="12"/><ellipse cx="68" cy="45" rx="20" ry="12"/><circle cx="45" cy="45" r="4" fill="${C.gold}"/></g>
        </pattern>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#${sky})"/>
      <circle class="hsun" cx="${w * 0.62}" cy="${h * 0.42}" r="120" fill="${C.goldLight}" opacity=".75"/>
      <rect y="${h * 0.5}" width="${w}" height="${h * 0.22}" fill="url(#${sea})"/>
      <g class="waves" fill="none" stroke="${C.ivory}" stroke-width="4" stroke-linecap="round" opacity=".9">
        ${[0.55, 0.61, 0.67].map((f, i) => `<path d="M ${-40 + i * 30} ${h * f} ${Array.from({ length: 12 }, (_, k) => `q 50 -16 100 0`).join(" ")}"/>`).join("")}
      </g>
      <path d="M0 ${h * 0.72} C ${w * 0.3} ${h * 0.69} ${w * 0.6} ${h * 0.74} ${w} ${h * 0.7} V ${h} H 0 Z" fill="${C.creamDeep}"/>
      <rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="url(#${mot})"/>
      <rect y="${h * 0.9}" width="${w}" height="4" fill="${C.gold}"/>
      <g class="palmL">${palm(110, h * 0.78, 1.15, false)}</g>
      <g class="palmR">${palm(w - 90, h * 0.8, 0.95, true)}</g>
    </svg>`;
  }

  /** university / research institution — generic building (NOT a logo) viewBox 0 0 360 260 */
  function institution({ w = 360 } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 260 / 360}" viewBox="0 0 360 260" style="overflow:visible;display:block">
      <g fill="none" stroke="${C.burg}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <path data-draw d="M20 86 L 180 16 L 340 86 Z"/>
        <path data-draw d="M40 100 H 320"/>
        ${[60, 110, 160, 200, 250, 300].map(x => `<path data-draw d="M ${x} 110 V 210"/>`).join("")}
        <path data-draw d="M24 222 H 336 M10 242 H 350"/>
      </g>
      <circle cx="180" cy="62" r="12" fill="${C.gold}"/>
    </svg>`;
  }

  /** abstract illustrative chart (NO data). dir "down" | "up". viewBox 0 0 640 400 */
  function trendChart({ w = 640, dir = "down", label = "" } = {}) {
    const g = id("tc");
    const path = dir === "down" ? "M 80 110 C 170 120 210 170 290 200 C 370 232 430 250 560 300" : "M 80 300 C 170 290 220 240 300 210 C 380 180 440 150 560 100";
    const area = path + " L 560 340 L 80 340 Z";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 400 / 640}" viewBox="0 0 640 400" style="overflow:visible;display:block">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gold}" stop-opacity=".55"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient></defs>
      <g stroke="${C.goldDeep}" stroke-width="1.5" opacity=".35">${[110, 170, 230, 290].map(y => `<path d="M80 ${y} H 580" stroke-dasharray="4 8"/>`).join("")}</g>
      <path data-draw d="M 80 60 V 340 H 590" fill="none" stroke="${C.burg}" stroke-width="4" stroke-linecap="round"/>
      <path class="area" d="${area}" fill="url(#${g})"/>
      <path data-draw class="trend" d="${path}" fill="none" stroke="${C.burg}" stroke-width="7" stroke-linecap="round"/>
      <circle class="dot" cx="${dir === "down" ? 560 : 560}" cy="${dir === "down" ? 300 : 100}" r="12" fill="${C.gold}" stroke="${C.burg}" stroke-width="4"/>
      <path class="arrow" d="${dir === "down" ? "M 520 230 L 560 270 M 560 270 L 560 236 M 560 270 L 526 270" : "M 520 170 L 560 130 M 560 130 L 526 130 M 560 130 L 560 164"}" fill="none" stroke="${C.goldDeep}" stroke-width="5" stroke-linecap="round" opacity="0"/>
    </svg>`;
  }

  /** lab mouse running in an exercise wheel (line art). viewBox 0 0 420 420 */
  function mouseWheel({ w = 420 } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 420 420" style="overflow:visible;display:block">
      <path d="M150 384 H 270 M210 362 V 384" stroke="${C.burg}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <g class="wheel" style="transform-origin:210px 200px">
        <circle cx="210" cy="200" r="160" fill="none" stroke="${C.gold}" stroke-width="10"/>
        <circle cx="210" cy="200" r="142" fill="none" stroke="${C.goldDeep}" stroke-width="2" stroke-dasharray="2 18"/>
        ${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<path d="M210 200 L ${210 + Math.cos(a) * 156} ${200 + Math.sin(a) * 156}" stroke="${C.goldDeep}" stroke-width="3" opacity=".6"/>`; }).join("")}
        <circle cx="210" cy="200" r="14" fill="${C.burg}"/>
      </g>
      <g class="mouse" transform="translate(150 290)">
        <path d="M0 40 C 0 10 30 -6 66 -2 C 96 2 118 20 120 40 C 120 46 116 48 110 48 H 8 C 2 48 0 46 0 40 Z" fill="${C.ivory}" stroke="${C.burg}" stroke-width="4"/>
        <circle cx="84" cy="-4" r="16" fill="${C.ivory}" stroke="${C.burg}" stroke-width="4"/><circle cx="84" cy="-4" r="7" fill="#E8C2B8"/>
        <circle cx="106" cy="26" r="4" fill="${C.burg}"/><circle cx="122" cy="38" r="4" fill="#D69A92"/>
        <path d="M0 36 C -30 30 -44 10 -30 -6" fill="none" stroke="${C.burg}" stroke-width="4" stroke-linecap="round"/>
        <path class="legA" d="M30 48 l -8 14 M80 48 l 10 14" stroke="${C.burg}" stroke-width="5" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  /** human silhouette — neutral standing figure outline (for disclaimer). viewBox 0 0 300 640 */
  function humanSilhouette({ w = 300 } = {}) {
    const g = id("hsil");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 640 / 300}" viewBox="0 0 300 640" style="overflow:visible;display:block">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ivory}"/><stop offset="1" stop-color="${C.creamDeep}"/></linearGradient></defs>
      <path data-draw d="M150 20 C 182 20 196 46 196 72 C 196 100 178 124 150 124 C 122 124 104 100 104 72 C 104 46 118 20 150 20 Z
        M 150 138 C 200 138 236 150 250 180 L 286 330 C 290 346 270 354 264 338 L 228 220 L 222 330 L 230 600 C 232 624 200 626 198 604 L 170 380 L 150 380 L 130 380 L 102 604 C 100 626 68 624 70 600 L 78 330 L 72 220 L 36 338 C 30 354 10 346 14 330 L 50 180 C 64 150 100 138 150 138 Z"
        fill="url(#${g})" stroke="${C.gold}" stroke-width="5" stroke-linejoin="round"/>
    </svg>`;
  }

  /** healthy food bowl composition. viewBox 0 0 560 420 */
  function foodBowl({ w = 560 } = {}) {
    const bw = id("fb");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 0.75}" viewBox="0 0 560 420" style="overflow:visible;display:block">
      <defs><linearGradient id="${bw}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ivory}"/><stop offset="1" stop-color="${C.creamDeep}"/></linearGradient></defs>
      <ellipse cx="280" cy="392" rx="210" ry="20" fill="${C.burgDeep}" opacity=".15"/>
      <g class="foods">
        <g class="f1"><path d="M150 220 C 130 160 170 120 210 140 C 240 110 290 130 280 180 Z" fill="${C.sage}"/><path d="M160 200 C 190 170 220 160 262 160" stroke="#6E8460" stroke-width="4" fill="none"/></g>
        <g class="f2"><circle cx="330" cy="170" r="54" fill="${C.amber}"/><circle cx="330" cy="170" r="42" fill="#F2B36C"/>${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<path d="M330 170 L ${330 + Math.cos(a) * 40} ${170 + Math.sin(a) * 40}" stroke="#F8D3A4" stroke-width="3"/>`; }).join("")}</g>
        <g class="f3"><ellipse cx="410" cy="200" rx="46" ry="60" fill="#6E8460" transform="rotate(30 410 200)"/><ellipse cx="410" cy="200" rx="34" ry="48" fill="#C9D3A8" transform="rotate(30 410 200)"/><circle cx="414" cy="208" r="20" fill="${C.burgSoft}"/></g>
        <g class="f4">${[[230, 200], [250, 186], [268, 204], [212, 186]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${C.burg}"/><circle cx="${x - 4}" cy="${y - 5}" r="4" fill="#fff" opacity=".5"/>`).join("")}</g>
      </g>
      <path d="M70 220 H 490 C 490 330 400 390 280 390 C 160 390 70 330 70 220 Z" fill="url(#${bw})" stroke="${C.gold}" stroke-width="4"/>
      <path d="M100 262 C 180 290 380 290 460 262" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".7"/>
      <g class="sideFruit">
        <circle cx="70" cy="370" r="34" fill="${C.burg}"/><path d="M70 336 C 72 326 80 320 88 318" stroke="#6E8460" stroke-width="4" fill="none"/><ellipse cx="90" cy="324" rx="12" ry="6" fill="${C.sage}"/>
        <path d="M480 380 A 44 44 0 0 1 540 330 L 510 370 Z" fill="${C.amber}"/>
      </g>
    </svg>`;
  }

  /** calm bedroom: bed with sleeper under duvet, window with moon. viewBox 0 0 640 520 */
  function bedroom({ w = 640 } = {}) {
    const g = id("br");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 520 / 640}" viewBox="0 0 640 520" style="overflow:visible;display:block">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B1A27"/><stop offset="1" stop-color="#7B2D3B"/></linearGradient></defs>
      <rect x="360" y="40" width="220" height="220" rx="110" fill="url(#${g})" stroke="${C.gold}" stroke-width="5"/>
      <path class="moonShape" d="M496 96 A 52 52 0 1 0 528 168 A 42 42 0 1 1 496 96 Z" fill="${C.goldLight}"/>
      ${[[410, 90], [430, 200], [540, 220], [400, 150]].map(([x, y]) => `<circle class="star" cx="${x}" cy="${y}" r="4" fill="${C.ivory}"/>`).join("")}
      <circle cx="120" cy="250" r="90" fill="${C.goldLight}" opacity=".45"/>
      <path d="M96 300 L 144 300 L 132 230 L 108 230 Z" fill="${C.gold}"/><rect x="116" y="300" width="8" height="100" fill="${C.goldDeep}"/><rect x="90" y="398" width="60" height="10" rx="4" fill="${C.goldDeep}"/>
      <rect x="160" y="300" width="440" height="120" rx="20" fill="${C.burg}"/>
      <rect x="170" y="290" width="160" height="70" rx="30" fill="${C.ivory}" stroke="${C.gold}" stroke-width="3"/>
      <ellipse cx="250" cy="300" rx="36" ry="30" fill="${C.skin}"/><path d="M216 296 C 214 262 286 262 284 296 C 270 284 230 284 216 296 Z" fill="${C.hair}"/>
      <path class="duvet" d="M230 320 C 300 290 420 300 600 310 L 600 400 C 450 410 320 410 220 400 C 200 380 205 336 230 320 Z" fill="${C.cream}" stroke="${C.gold}" stroke-width="3"/>
      <path d="M260 352 C 360 340 480 344 590 350" fill="none" stroke="${C.gold}" stroke-width="2" opacity=".7"/>
      <rect x="150" y="420" width="460" height="24" rx="8" fill="${C.burgDeep}"/>
      <g class="zz" font-family="Montserrat" font-weight="800" fill="${C.goldDeep}"><text x="300" y="250" font-size="30">z</text><text x="326" y="222" font-size="38">z</text></g>
    </svg>`;
  }

  /** consultation: doctor/pharmacist figure with clipboard (icon-illustration). viewBox 0 0 200 200 */
  function consult({ w = 200 } = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 200 200" style="overflow:visible;display:block">
      <circle cx="100" cy="100" r="96" fill="${C.ivory}" stroke="${C.gold}" stroke-width="4"/>
      <path d="M44 186 C 48 138 70 118 100 118 C 130 118 152 138 156 186 Z" fill="${C.ivory}" stroke="${C.burg}" stroke-width="5"/>
      <path d="M86 120 L 100 150 L 114 120" fill="none" stroke="${C.burg}" stroke-width="5"/>
      <circle cx="100" cy="78" r="30" fill="${C.skin}"/><path d="M70 76 C 68 42 132 42 130 76 C 120 62 82 62 70 76 Z" fill="${C.hair}"/>
      <path d="M122 132 V 152 A 10 10 0 0 0 142 152 V 146" fill="none" stroke="${C.gold}" stroke-width="5"/><circle cx="142" cy="142" r="6" fill="${C.gold}"/>
      <rect x="64" y="140" width="28" height="36" rx="4" fill="${C.burg}"/><path d="M70 152 H 86 M70 162 H 82" stroke="${C.ivory}" stroke-width="3"/>
    </svg>`;
  }

  window.ILL = { seaCucumber, flaxSprig, seed, droplet, capsule, chlorella, betaCarotene, morningBackdrop, plant, spaStill, heritage, institution, trendChart, mouseWheel, humanSilhouette, foodBowl, bedroom, consult };
})();
