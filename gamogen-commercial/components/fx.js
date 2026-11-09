/* =========================================================================
   FX components: particles, glows, light sweeps, rings, bokeh, product hero,
   pedestal, arch frames, bubbles, caustics. All motion is GSAP (seekable).
   ========================================================================= */
(function () {
  const { C, el, box, svg, prng, float } = HG;

  /** gold dust particles drifting upward. Returns container. */
  function particles(parent, tl, { seed = 1, count = 40, t0 = 0, t1 = 10, area = [0, 0, 1080, 1920], color = C.gold, size = [3, 9], drift = 260, opacity = [0.25, 0.85], z, glow = true } = {}) {
    const r = prng(seed);
    const wrap = box(parent, { x: 0, y: 0, w: 1080, h: 1920, z, cls: "particles" });
    wrap.style.pointerEvents = "none";
    const dur = t1 - t0;
    for (let i = 0; i < count; i++) {
      const s = size[0] + r() * (size[1] - size[0]);
      const px = area[0] + r() * area[2], py = area[1] + r() * area[3];
      const p = el("div", {}, wrap);
      const o = opacity[0] + r() * (opacity[1] - opacity[0]);
      Object.assign(p.style, {
        position: "absolute", left: px + "px", top: py + "px", width: s + "px", height: s + "px", borderRadius: "50%",
        background: glow ? `radial-gradient(circle, ${C.ivory} 0%, ${color} 45%, rgba(214,184,120,0) 72%)` : color,
        opacity: 0,
      });
      const dy = -(drift * (0.5 + r()));
      const dx = (r() - 0.5) * 120;
      tl.fromTo(p, { x: 0, y: 0 }, { x: dx, y: dy, duration: dur, ease: "none" }, t0);
      // twinkle: finite yoyo
      const per = 1.2 + r() * 2.2, dl = r() * 0.8;
      const reps = Math.max(1, Math.floor((dur - dl) / per) - 1);
      tl.fromTo(p, { opacity: 0 }, { opacity: o, duration: per, ease: "sine.inOut", repeat: reps, yoyo: true }, t0 + dl);
    }
    return wrap;
  }

  /** soft radial glow orb */
  function orb(parent, { x, y, r = 300, color = C.gold, alpha = 0.55, z, center = true } = {}) {
    const o = box(parent, { x, y, w: r * 2, h: r * 2, center, z, cls: "orb" });
    const rgba = hexA(color, alpha);
    o.style.background = `radial-gradient(circle, ${rgba} 0%, ${hexA(color, alpha * 0.45)} 35%, ${hexA(color, 0)} 70%)`;
    o.style.borderRadius = "50%";
    return o;
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  /** diagonal light sweep band across a region (full scene by default) */
  function lightSweep(parent, tl, t, { dur = 1.6, w = 1080, h = 1920, x = 0, y = 0, angle = 20, width = 380, alpha = 0.55, color = "#FFFFFF", z, blend = "soft-light" } = {}) {
    const wrap = box(parent, { x, y, w, h, z });
    wrap.style.overflow = "hidden"; wrap.style.pointerEvents = "none";
    const band = box(wrap, { x: -width * 2, y: -h * 0.25, w: width, h: h * 1.5 });
    band.style.background = `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${hexA(color, alpha)} 50%, rgba(255,255,255,0) 100%)`;
    band.style.transform = `rotate(${angle}deg)`;
    if (blend) band.style.mixBlendMode = blend;
    tl.fromTo(band, { x: -width * 0.5 }, { x: w + width * 2.5, duration: dur, ease: "power2.inOut" }, t);
    return wrap;
  }

  /** concentric thin gold rings drawn with stroke animation */
  function rings(parent, { x, y, radii = [260, 330, 410], color = C.gold, width = 2, z, dashed = [] } = {}) {
    const R = Math.max(...radii) + 10;
    const inner = radii.map((r, i) => `<circle cx="${R}" cy="${R}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" ${dashed.includes(i) ? 'stroke-dasharray="4 14" stroke-linecap="round"' : "data-draw"} opacity="${0.9 - i * 0.2}" transform="rotate(-90 ${R} ${R})"/>`).join("");
    const s = svg(parent, { x, y, w: R * 2, h: R * 2, center: true, z, inner });
    HG.prepDraw(s);
    return s;
  }

  /** the real product photo (bottle cut-out) with masked sheen + contact shadow.
   *  kind: "bottle" | "full" (bottle + box) */
  function product(parent, { x, y, h = 760, kind = "bottle", z, shadow = true, reflection = false } = {}) {
    const src = kind === "bottle" ? "assets/product-images/bottle.png" : "assets/product-images/product_full.png";
    const ratio = kind === "bottle" ? 438 / 1408 : 876 / 1528;
    const w = Math.round(h * ratio);
    const wrap = box(parent, { x, y, w, h, center: true, z, cls: "product" });
    wrap.style.perspective = "1400px";
    let sh = null;
    if (shadow) {
      sh = box(wrap, { x: w / 2, y: h - 6, w: w * 1.35, h: 46, center: true });
      sh.style.background = "radial-gradient(ellipse at center, rgba(40,10,16,.45) 0%, rgba(40,10,16,.18) 45%, rgba(40,10,16,0) 72%)";
    }
    const body = box(wrap, { x: 0, y: 0, w, h, cls: "pbody" });
    body.style.transformStyle = "preserve-3d";
    const img = el("img", { src, style: { width: w + "px", height: h + "px", display: "block" } }, body);
    // sheen overlay masked by the product alpha
    const sheen = box(body, { x: 0, y: 0, w, h });
    Object.assign(sheen.style, {
      webkitMaskImage: `url(${src})`, maskImage: `url(${src})`, webkitMaskSize: "100% 100%", maskSize: "100% 100%",
      overflow: "hidden", mixBlendMode: "screen",
    });
    const band = box(sheen, { x: -w, y: -h * 0.1, w: w * 0.55, h: h * 1.2 });
    band.style.background = "linear-gradient(90deg, rgba(255,240,210,0) 0%, rgba(255,244,220,.75) 50%, rgba(255,240,210,0) 100%)";
    band.style.transform = "rotate(14deg)";
    let refl = null;
    if (reflection) {
      refl = el("img", { src }, wrap);
      Object.assign(refl.style, { position: "absolute", left: "0px", top: h + 4 + "px", width: w + "px", height: h + "px", transform: "scaleY(-1)", opacity: 0.16,
        webkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0) 72%, rgba(0,0,0,1) 100%)", maskImage: "linear-gradient(to top, rgba(0,0,0,0) 72%, rgba(0,0,0,1) 100%)" });
    }
    return { wrap, body, img, sheen, band, shadow: sh, w, h, refl };
  }
  function sheenSweep(tl, p, t, dur = 1.3) {
    tl.fromTo(p.band, { x: 0 }, { x: p.w * 2.6, duration: dur, ease: "power2.inOut" }, t);
  }
  /** gentle 2.5D "turn" of the flat product (perspective rotateY + sheen) */
  function turn(tl, p, t0, t1, deg = 9) {
    const per = 4.2, reps = Math.max(1, Math.floor((t1 - t0) / (per / 2)) - 1);
    tl.fromTo(p.body, { rotationY: -deg }, { rotationY: deg, duration: per / 2, ease: "sine.inOut", repeat: reps, yoyo: true, immediateRender: false }, t0);
  }
  function hover(tl, p, t0, t1, amp = 16, per = 3.4) {
    const reps = Math.max(1, Math.floor((t1 - t0) / (per / 2)) - 1);
    tl.fromTo(p.body, { y: -amp / 2 }, { y: amp / 2, duration: per / 2, ease: "sine.inOut", repeat: reps, yoyo: true, immediateRender: false }, t0);
    if (p.shadow) tl.fromTo(p.shadow, { scale: 1.06, opacity: 0.8 }, { scale: 0.9, opacity: 1, duration: per / 2, ease: "sine.inOut", repeat: reps, yoyo: true, immediateRender: false }, t0);
  }

  /** premium pedestal (cylinder) — cream marble with gold rim */
  function pedestal(parent, { x, y, w = 520, h = 120, z, dark = false } = {}) {
    const top = dark ? "#5A1A27" : C.ivory, side1 = dark ? "#3E0F19" : "#E9DCC4", side2 = dark ? "#2C0A12" : "#D9C6A3";
    const d = box(parent, { x, y, w, h: h + w * 0.18, center: false, z, cls: "pedestal" });
    d.style.left = x - w / 2 + "px";
    const eh = w * 0.18;
    d.innerHTML = `<svg width="${w}" height="${h + eh}" viewBox="0 0 ${w} ${h + eh}" style="overflow:visible">
      <defs>
        <linearGradient id="pdS${x}${y}" x1="0" x2="1"><stop offset="0" stop-color="${side2}"/><stop offset=".35" stop-color="${side1}"/><stop offset=".6" stop-color="${top}"/><stop offset="1" stop-color="${side2}"/></linearGradient>
        <radialGradient id="pdT${x}${y}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${side1}"/></radialGradient>
        <linearGradient id="pdG${x}${y}" x1="0" x2="1"><stop offset="0" stop-color="${C.goldDeep}"/><stop offset=".45" stop-color="${C.goldLight}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>
      </defs>
      <path d="M0 ${eh / 2} L0 ${h + eh / 2} A ${w / 2} ${eh / 2} 0 0 0 ${w} ${h + eh / 2} L ${w} ${eh / 2} Z" fill="url(#pdS${x}${y})"/>
      <path d="M0 ${eh / 2 + 10} A ${w / 2} ${eh / 2} 0 0 0 ${w} ${eh / 2 + 10}" fill="none" stroke="url(#pdG${x}${y})" stroke-width="5"/>
      <ellipse cx="${w / 2}" cy="${eh / 2}" rx="${w / 2}" ry="${eh / 2}" fill="url(#pdT${x}${y})" stroke="url(#pdG${x}${y})" stroke-width="4"/>
    </svg>`;
    return d;
  }

  /** arch frame (spa-style window) with clipped content container */
  function arch(parent, { x, y, w = 680, h = 900, z, border = C.gold, bg = C.ivory, borderW = 4 } = {}) {
    const wrap = box(parent, { x, y, w, h, center: true, z, cls: "arch" });
    const r = w / 2;
    const inner = box(wrap, { x: 0, y: 0, w, h });
    Object.assign(inner.style, { borderRadius: `${r}px ${r}px 28px 28px`, overflow: "hidden", background: bg,
      boxShadow: "0 40px 80px -40px rgba(69,18,29,.45)" });
    const frame = box(wrap, { x: -14, y: -14, w: w + 28, h: h + 28 });
    Object.assign(frame.style, { borderRadius: `${r + 14}px ${r + 14}px 40px 40px`, border: `${borderW}px solid ${border}`, boxSizing: "border-box", opacity: 0.85 });
    return { wrap, inner, frame, w, h };
  }

  /** rising bubbles (underwater feel, outline in gold) */
  function bubbles(parent, tl, { seed = 7, count = 18, t0, t1, area = [0, 600, 1080, 1300], z } = {}) {
    const r = prng(seed);
    const wrap = box(parent, { x: 0, y: 0, w: 1080, h: 1920, z });
    for (let i = 0; i < count; i++) {
      const s = 8 + r() * 26;
      const b = el("div", {}, wrap);
      Object.assign(b.style, { position: "absolute", left: area[0] + r() * area[2] + "px", top: area[1] + r() * area[3] + "px", width: s + "px", height: s + "px",
        borderRadius: "50%", border: `2px solid ${hexA(C.gold, 0.7)}`, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.8), rgba(255,255,255,0) 45%)" });
      const d = t1 - t0;
      tl.fromTo(b, { y: 0, x: 0, opacity: 0 }, { y: -(300 + r() * 500), x: (r() - 0.5) * 80, duration: d, ease: "none" }, t0);
      tl.to(b, { opacity: 0.4 + r() * 0.5, duration: 0.8 }, t0 + r() * 1.5);
    }
    return wrap;
  }

  /** caustic light lines (soft wavy gold strokes drifting) */
  function caustics(parent, tl, { t0, t1, z, seed = 3, count = 7, alpha = 0.22 } = {}) {
    const r = prng(seed);
    let paths = "";
    for (let i = 0; i < count; i++) {
      const y0 = 150 + i * 250 + r() * 80;
      let d = `M -100 ${y0}`;
      for (let k = 0; k < 6; k++) d += ` Q ${k * 240 + 120} ${y0 + (r() - 0.5) * 160} ${k * 240 + 240} ${y0 + (r() - 0.5) * 60}`;
      paths += `<path d="${d}" fill="none" stroke="${C.gold}" stroke-width="${3 + r() * 6}" stroke-linecap="round" opacity="${alpha * (0.5 + r())}"/>`;
    }
    const s = svg(parent, { x: 0, y: 0, w: 1080, h: 1920, z, inner: `<g>${paths}</g>` });
    s.style.filter = "blur(2px)";
    tl.fromTo(s, { x: -60, y: 20 }, { x: 60, y: -20, duration: t1 - t0, ease: "sine.inOut" }, t0);
    return s;
  }

  /** soft bokeh circles */
  function bokeh(parent, tl, { seed = 11, count = 12, t0, t1, z, color = C.gold, area = [0, 0, 1080, 1920], size = [60, 220], alpha = [0.08, 0.28] } = {}) {
    const r = prng(seed);
    const wrap = box(parent, { x: 0, y: 0, w: 1080, h: 1920, z });
    for (let i = 0; i < count; i++) {
      const s = size[0] + r() * (size[1] - size[0]);
      const b = el("div", {}, wrap);
      const a = alpha[0] + r() * (alpha[1] - alpha[0]);
      Object.assign(b.style, { position: "absolute", left: area[0] + r() * area[2] - s / 2 + "px", top: area[1] + r() * area[3] - s / 2 + "px", width: s + "px", height: s + "px",
        borderRadius: "50%", background: `radial-gradient(circle, ${hexA(color, a)} 0%, ${hexA(color, a * 0.8)} 55%, ${hexA(color, 0)} 72%)` });
      tl.fromTo(b, { x: 0, y: 0 }, { x: (r() - 0.5) * 140, y: (r() - 0.5) * 140 - 40, duration: t1 - t0, ease: "sine.inOut" }, t0);
    }
    return wrap;
  }

  /** subtle botanical leaf silhouettes framing a scene (parallax) */
  function leafFrame(parent, tl, { t0, t1, z, color = C.gold, alpha = 0.35, seed = 5, side = "both", top = 1100 } = {}) {
    const r = prng(seed);
    const leaf = (x, y, s, rot, fill) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M0 0 C 40 -60 120 -80 200 -70 C 150 -10 80 30 0 0 Z" fill="${fill}" />
      <path d="M0 0 C 70 -30 130 -55 200 -70" fill="none" stroke="${C.ivory}" stroke-width="3" opacity=".6"/></g>`;
    const mk = (xBase, flip) => {
      let g = "";
      for (let i = 0; i < 6; i++) {
        const y = top + i * 110 + r() * 40;
        g += leaf(flip ? 1080 - xBase - r() * 30 : xBase + r() * 30, y, 0.9 + r() * 0.8, flip ? 180 + 20 + r() * 50 : -20 - r() * 50, hexA(color, alpha * (0.6 + r() * 0.6)));
      }
      return g;
    };
    const s = svg(parent, { x: 0, y: 0, w: 1080, h: 1920, z, inner: (side !== "right" ? `<g class="lfL">${mk(-40, false)}</g>` : "") + (side !== "left" ? `<g class="lfR">${mk(-40, true)}</g>` : "") });
    const L = s.querySelector(".lfL"), R = s.querySelector(".lfR");
    if (L) tl.fromTo(L, { x: -40, rotation: -2, transformOrigin: "0% 100%" }, { x: 10, rotation: 1.5, duration: t1 - t0, ease: "sine.inOut" }, t0);
    if (R) tl.fromTo(R, { x: 40, rotation: 2, transformOrigin: "100% 100%" }, { x: -10, rotation: -1.5, duration: t1 - t0, ease: "sine.inOut" }, t0);
    return s;
  }

  window.FX = { particles, orb, lightSweep, rings, product, sheenSweep, turn, hover, pedestal, arch, bubbles, caustics, bokeh, leafFrame, hexA };
})();
