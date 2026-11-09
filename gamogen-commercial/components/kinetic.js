/* =========================================================================
   Kinetic typography — headline system (separate from subtitles)
   ========================================================================= */
(function () {
  const { el, box } = HG;

  /** Build a text block. Words wrapped in mask spans so they can rise out of a clip.
   *  opts: x,y,w (block left/top/width), align, size, font, weight, color, ls (letter-spacing em),
   *        lh, split: "words"|"chars"|"none", cls, z, html (raw html instead of text), mark (array of words to highlight) */
  function text(parent, str, o = {}) {
    const {
      x = 70, y = 0, w = 940, align = "center", size = 80, font = "Montserrat", weight = 800,
      color = HG.C.burg, ls = 0, lh = 1.05, split = "words", cls = "", z, upper = false,
      mark = [], markColor = null, italic = false, shadow = null,
    } = o;
    const b = box(parent, { x, y, w, cls: "kt " + cls, z });
    Object.assign(b.style, {
      textAlign: align, fontFamily: font, fontWeight: weight, fontSize: size + "px", color,
      letterSpacing: ls + "em", lineHeight: lh, fontStyle: italic ? "italic" : "normal",
      textTransform: upper ? "uppercase" : "none", textWrap: "balance",
    });
    if (shadow) b.style.textShadow = shadow;
    const words = str.split(" ");
    b._words = []; b._chars = [];
    words.forEach((wd, i) => {
      const mask = el("span", { class: "ktm", style: { display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginBottom: "-0.08em" } }, b);
      const inner = el("span", { class: "ktw", style: { display: "inline-block" } }, mask);
      const isMark = mark.includes(wd.replace(/[^\wÀ-ÿ®\-+]/g, ""));
      if (isMark && markColor) inner.style.color = markColor;
      if (split === "chars") {
        [...wd].forEach(ch => {
          const c = el("span", { class: "ktc", style: { display: "inline-block" } }, inner, ch === " " ? "&nbsp;" : ch);
          b._chars.push(c);
        });
      } else inner.innerHTML = wd;
      b._words.push(inner);
      if (i < words.length - 1) b.appendChild(document.createTextNode(" "));
    });
    return b;
  }

  // ---- reveal presets --------------------------------------------------
  function riseWords(tl, b, t, { dur = 0.7, stagger = 0.08, ease = "power4.out", from = 110 } = {}) {
    tl.fromTo(b._words, { yPercent: from, opacity: 0 }, { yPercent: 0, opacity: 1, duration: dur, stagger, ease }, t);
  }
  function riseChars(tl, b, t, { dur = 0.8, stagger = 0.035, ease = "power4.out", from = 120, rot = 0 } = {}) {
    tl.fromTo(b._chars, { yPercent: from, opacity: 0, rotation: rot }, { yPercent: 0, opacity: 1, rotation: 0, duration: dur, stagger, ease }, t);
  }
  function blurIn(tl, b, t, { dur = 0.9, stagger = 0.06, from = 14 } = {}) {
    tl.fromTo(b._words, { opacity: 0, filter: `blur(${from}px)`, y: 18 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: dur, stagger, ease: "power2.out" }, t);
  }
  function scalePop(tl, b, t, { dur = 0.8, from = 0.6, ease = "back.out(1.6)" } = {}) {
    tl.fromTo(b, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, ease }, t);
  }
  function spaceIn(tl, b, t, { dur = 1.4, fromLs = 0.6, toLs = null } = {}) {
    const to = toLs != null ? toLs : parseFloat(b.style.letterSpacing) || 0;
    tl.fromTo(b, { letterSpacing: fromLs + "em", opacity: 0 }, { letterSpacing: to + "em", opacity: 1, duration: dur, ease: "power3.out" }, t);
  }
  function maskWipe(tl, b, t, { dur = 0.9, dir = "right", ease = "power3.inOut" } = {}) {
    const from = dir === "right" ? "inset(0% 100% 0% 0%)" : dir === "left" ? "inset(0% 0% 0% 100%)" : dir === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
    tl.fromTo(b, { clipPath: from, webkitClipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", webkitClipPath: "inset(0% 0% 0% 0%)", duration: dur, ease }, t);
  }
  function outUp(tl, b, t, { dur = 0.45, ease = "power3.in" } = {}) {
    tl.to(b._words || b, { yPercent: -110, opacity: 0, duration: dur, stagger: 0.03, ease }, t);
  }
  function fadeOut(tl, b, t, dur = 0.4) { tl.to(b, { opacity: 0, duration: dur, ease: "power2.in" }, t); }

  /** animated underline (gold) beneath a block */
  function underline(parent, { x, y, w, color = HG.C.gold, h = 6, z, center = true, radius = 3 }) {
    const u = box(parent, { x: center ? x - w / 2 : x, y, w, h, z });
    Object.assign(u.style, { background: `linear-gradient(90deg, transparent, ${color} 18%, ${color} 82%, transparent)`, borderRadius: radius + "px", transformOrigin: "50% 50%" });
    return u;
  }
  function growX(tl, target, t, dur = 0.9, ease = "power3.out", origin = "50% 50%") {
    tl.fromTo(target, { scaleX: 0, transformOrigin: origin }, { scaleX: 1, duration: dur, ease }, t);
  }

  /** pill/chip label */
  function chip(parent, str, o = {}) {
    const { x = 540, y = 0, bg = HG.C.burg, color = HG.C.ivory, size = 40, font = "Plus Jakarta Sans", weight = 700, pad = "18px 40px", ls = 0.06, border = null, z, icon = "" } = o;
    const c = el("div", { class: "chip" }, parent);
    Object.assign(c.style, {
      position: "absolute", left: x + "px", top: y + "px", transform: "translateX(-50%)",
      background: bg, color, fontFamily: font, fontWeight: weight, fontSize: size + "px", letterSpacing: ls + "em",
      padding: pad, borderRadius: "999px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "16px",
      boxShadow: "0 18px 40px -18px rgba(69,18,29,.55)",
    });
    if (border) c.style.border = border;
    if (z != null) c.style.zIndex = z;
    c.innerHTML = icon + `<span>${str}</span>`;
    return c;
  }
  // chip uses translateX(-50%) for centering, so animate with xPercent kept at -50
  function chipIn(tl, c, t, dur = 0.7) {
    c.style.transform = "";
    tl.fromTo(c, { xPercent: -50, y: 30, opacity: 0, scale: 0.85 }, { xPercent: -50, y: 0, opacity: 1, scale: 1, duration: dur, ease: "back.out(1.7)" }, t);
  }

  /** gradient-filled text (applied per char/word: background-clip cannot cross inline-blocks) */
  function gradText(b, grad) {
    const t = b._chars.length ? b._chars : b._words;
    t.forEach(e => { e.style.background = grad; e.style.webkitBackgroundClip = "text"; e.style.backgroundClip = "text"; e.style.color = "transparent"; e.style.webkitTextFillColor = "transparent"; });
  }
  /** light glint travelling across a headline: plain-text twin clipped to the glyphs */
  function shine(tl, parent, str, o, t, dur = 1.1) {
    const { x = 70, y = 0, w = 940, align = "center", size = 80, font = "Montserrat", weight = 800, ls = 0, lh = 1.05, z } = o;
    const d = box(parent, { x, y, w, z });
    Object.assign(d.style, { textAlign: align, fontFamily: font, fontWeight: weight, fontSize: size + "px", letterSpacing: ls + "em", lineHeight: lh,
      color: "transparent", webkitTextFillColor: "transparent", pointerEvents: "none", paddingBottom: "0.08em",
      background: "linear-gradient(110deg, rgba(255,255,255,0) 42%, rgba(255,251,238,.95) 50%, rgba(255,255,255,0) 58%)",
      backgroundSize: "300% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "100% 0%" });
    d.style.webkitBackgroundClip = "text"; d.style.backgroundClip = "text";
    d.innerHTML = str;
    tl.fromTo(d, { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: dur, ease: "power2.inOut" }, t);
    return d;
  }

  /** append a small registered-trademark mark to a split-chars headline (animates with the chars) */
  function addReg(b, color, scale = 0.26) {
    const lastW = b._words[b._words.length - 1];
    const r = el("span", { class: "ktc", style: { display: "inline-block", fontSize: scale + "em", verticalAlign: "top", marginTop: "0.35em", marginLeft: "0.04em", color, webkitTextFillColor: color, background: "none" } }, lastW, "®");
    b._chars.push(r);
    return r;
  }

  window.KT = { addReg, gradText, shine, text, riseWords, riseChars, blurIn, scalePop, spaceIn, maskWipe, outUp, fadeOut, underline, growX, chip, chipIn };
})();
