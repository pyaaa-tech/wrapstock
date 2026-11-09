/* =========================================================================
   HEALIN GAMOGEN — core helpers shared by every scene
   (palette, deterministic PRNG, DOM helpers, SFX cue registry)
   ========================================================================= */
(function () {
  const C = {
    gold: "#D6B878",
    goldDeep: "#B8954F",   // darker tint of champagne gold (outlines on cream)
    goldLight: "#EBD8A8",  // lighter tint (glows, text on burgundy)
    burg: "#641D2B",
    burgDeep: "#45121D",   // darker tint of burgundy
    burgSoft: "#8A3A48",
    cream: "#F7F1E7",
    creamDeep: "#EDE1CB",
    ivory: "#FFFDF8",
    ink: "#3B1B22",
    // accent tints used only where the narration names them
    sage: "#8EA07A",       // chlorella
    amber: "#E3974A",      // beta-carotene (matches the bottle's own orange band)
    skin: "#B98563",
    skinShade: "#9C6B4D",
    hair: "#2E1A17",
  };

  // mulberry32 — deterministic random numbers (renders must be repeatable)
  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(tag, attrs, parent, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "style" && typeof attrs[k] === "object") Object.assign(e.style, attrs[k]);
      else if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }

  /** absolutely-positioned box: x,y = top-left unless center:true */
  function box(parent, { x = 0, y = 0, w, h, center = false, cls = "", z, html = "", style = {} } = {}) {
    const s = Object.assign({ position: "absolute" }, style);
    if (w != null) s.width = w + "px";
    if (h != null) s.height = h + "px";
    if (center) { s.left = x - (w || 0) / 2 + "px"; s.top = y - (h || 0) / 2 + "px"; }
    else { s.left = x + "px"; s.top = y + "px"; }
    if (z != null) s.zIndex = z;
    return el("div", { class: cls, style: s }, parent, html);
  }

  function svg(parent, { x = 0, y = 0, w, h, vb, center = false, cls = "", z, inner = "", style = {} }) {
    const d = box(parent, { x, y, w, h, center, cls, z, style });
    d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb || `0 0 ${w} ${h}`}" style="overflow:visible;display:block">${inner}</svg>`;
    return d;
  }

  // ---- SFX cue registry: scenes call SFX(type, time, gain); exported to JSON for the FFmpeg mix
  const sfxCues = [];
  function SFX(type, t, gain = 1) { sfxCues.push({ type, t: +t.toFixed(3), gain }); }

  // ---- finite "floating" loop (seek-safe: no infinite repeats inside the paused master)
  function float(tl, target, { t0, t1, y = 12, x = 0, rot = 0, period = 3.2, ease = "sine.inOut" }) {
    const reps = Math.max(1, Math.floor((t1 - t0) / (period / 2)) - 1);
    const a = { y: -y / 2 }, b = { y: y / 2, duration: period / 2, ease, repeat: reps, yoyo: true, immediateRender: false };
    if (x) { a.x = -x / 2; b.x = x / 2; }
    if (rot) { a.rotation = "-=" + rot / 2; b.rotation = "+=" + rot; }
    tl.fromTo(target, a, b, t0);
  }

  // stroke "draw-on" for SVG paths (sets dash arrays from real lengths)
  function prepDraw(root) {
    root.querySelectorAll("[data-draw]").forEach(p => {
      const L = p.getTotalLength ? p.getTotalLength() : 1000;
      p.style.strokeDasharray = L + " " + (L + 2);
      p.style.strokeDashoffset = L;
      p.dataset.len = L;
    });
  }
  function draw(tl, targets, t, dur = 1.2, ease = "power2.inOut", stagger = 0) {
    tl.to(targets, { strokeDashoffset: 0, duration: dur, ease, stagger }, t);
  }

  window.HG = { C, prng, el, box, svg, SFX, sfxCues, float, prepDraw, draw, W: 1080, H: 1920 };
  window.__SFX_CUES = sfxCues;
})();
