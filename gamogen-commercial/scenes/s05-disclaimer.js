/* SCENE 05 — SCIENTIFIC DISCLAIMER  (VO 54.16–64.60)
   "Namun, kajian ini adalah kajian awal pada haiwan. Bagi manusia, Gamogen perlu dilihat sebagai
    suplemen sokongan, bukan pengganti ubat atau rawatan doktor."
   Clear, professional, never hidden behind decoration. */
SCENES.push({
  id: "s05",
  build(tl, root) {
    const { C, box, svg, SFX } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `linear-gradient(180deg, ${C.ivory} 0%, ${C.cream} 100%)`;
    // transition: clean panel slide from right with gold leading edge
    tl.fromTo(st, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.inOut" }, 54.0);
    const edge = box(root, { x: 0, y: 0, w: 6, h: 1920, z: 40 });
    edge.style.background = `linear-gradient(180deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`;
    edge.style.boxShadow = "0 0 30px 6px rgba(214,184,120,.55)";
    tl.fromTo(edge, { x: 1080, opacity: 1 }, { x: 0, duration: 0.7, ease: "power3.inOut" }, 54.0);
    tl.to(edge, { opacity: 0, duration: 0.2 }, 54.7);
    SFX("whoosh", 53.95, 0.55);

    // corner ornaments
    const orn = svg(st, { x: 0, y: 0, w: 1080, h: 1920, inner: `<g fill="none" stroke="${C.gold}" stroke-width="3" opacity=".7">
      <path data-draw d="M60 160 V 60 H 160"/><path data-draw d="M920 60 H 1020 V 160"/><path data-draw d="M1020 1760 V 1860 H 920"/><path data-draw d="M160 1860 H 60 V 1760"/></g>` });
    HG.prepDraw(orn);
    HG.draw(tl, orn.querySelectorAll("[data-draw]"), 54.4, 0.9, "power2.out");

    // notice eyebrow
    const nb = box(st, { x: 540, y: 222, w: 620, h: 70, center: true, html: `<div style="display:flex;gap:18px;align-items:center;justify-content:center;font:800 34px 'Plus Jakarta Sans';letter-spacing:.3em;color:${C.burg}">${ICON.svg("info", { size: 54, color: C.goldDeep, sw: 6 })}<span>MAKLUMAN PENTING</span></div>` });
    tl.fromTo(nb, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 54.3);

    // top block (compresses later)
    const top = box(st, { x: 0, y: 0, w: 1080, h: 760 });
    top.style.transformOrigin = "50% 0%";
    const t1 = KT.text(top, "KAJIAN AWAL PADA HAIWAN", { y: 300, size: 108, font: "Montserrat", weight: 900, color: C.burg, lh: 1.0, w: 900, x: 90 });
    KT.riseWords(tl, t1, 55.45, { dur: 0.7, stagger: 0.12 });
    const icoL = box(top, { x: 540, y: 560, w: 260, h: 80, center: true, html: `<div style="display:flex;gap:40px;justify-content:center">${ICON.svg("flask", { size: 72, color: C.goldDeep, sw: 6 })}${ICON.svg("mouse", { size: 72, color: C.goldDeep, sw: 6 })}</div>` });
    tl.fromTo(icoL, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 56.6);
    const t2box = box(top, { x: 90, y: 612, w: 900, h: 150 });
    Object.assign(t2box.style, { borderTop: `3px solid ${C.gold}`, borderBottom: `3px solid ${C.gold}` });
    const t2 = KT.text(t2box, "BUKAN BUKTI KEBERKESANAN PADA MANUSIA", { x: 0, y: 22, w: 900, size: 46, font: "Plus Jakarta Sans", weight: 800, color: C.burg, ls: 0.02, lh: 1.15 });
    tl.set(icoL, { opacity: 0 }, 57.5);
    KT.maskWipe(tl, t2box, 57.55, { dur: 0.7 });
    KT.riseWords(tl, t2, 57.6, { dur: 0.6, stagger: 0.05 });
    SFX("pop", 55.5, 0.5); SFX("tick", 57.6, 0.6);

    // compress top block, introduce the human context
    tl.to(top, { scale: 0.72, y: 62, duration: 0.7, ease: "power3.inOut" }, 58.25);
    const glow = FX.orb(st, { x: 540, y: 790, r: 260, color: C.goldLight, alpha: 0.8 });
    const hum = box(st, { x: 540, y: 790, w: 170, h: 363, center: true, html: ILL.humanSilhouette({ w: 170 }) });
    HG.prepDraw(hum);
    tl.fromTo(glow, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.8 }, 58.35);
    tl.fromTo(hum, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 58.4);
    HG.draw(tl, hum.querySelectorAll("[data-draw]"), 58.4, 1.2, "power2.inOut");
    const bm = KT.text(st, "BAGI MANUSIA", { y: 990, size: 34, font: "Plus Jakarta Sans", weight: 800, ls: 0.3, color: C.goldDeep, split: "none" });
    KT.spaceIn(tl, bm, 58.5, { fromLs: 0.7, toLs: 0.3, dur: 1.0 });

    const pill = KT.chip(st, "SUPLEMEN SOKONGAN", { x: 540, y: 1052, size: 60, font: "Montserrat", weight: 900, ls: 0.02, pad: "20px 50px", border: `4px solid ${C.gold}`,
      icon: ICON.svg("check", { size: 62, color: C.goldLight, sw: 7 }) });
    KT.chipIn(tl, pill, 60.85, 0.6);
    SFX("chime", 60.9, 0.55);

    const t4 = KT.text(st, "BUKAN PENGGANTI UBAT ATAU RAWATAN DOKTOR", { y: 1205, size: 58, font: "Plus Jakarta Sans", weight: 800, color: C.burg, lh: 1.12, x: 80, w: 920 });
    KT.riseWords(tl, t4, 62.2, { dur: 0.6, stagger: 0.07 });
    const ul = KT.underline(st, { x: 540, y: 1352, w: 520, h: 5 });
    KT.growX(tl, ul, 63.0, 0.8);
    SFX("pop", 62.25, 0.5);
  },
});
