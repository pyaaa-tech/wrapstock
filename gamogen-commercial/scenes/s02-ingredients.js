/* SCENE 02 — THE INGREDIENT STORY  (VO 11.58–25.90)
   "Gamogen menggabungkan ekstrak gamat Stichopus horrens, yang dikenali sebagai Gamodulin®,
    bersama omega-3 dan omega-6 daripada minyak flaxseed, vitamin E, vitamin B, chlorella
    serta beta-karotena." */
SCENES.push({
  id: "s02",
  build(tl, root) {
    const { C, box, svg, SFX, prng } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `linear-gradient(180deg, ${C.ivory} 0%, #F8EFDD 55%, #EEDDBC 100%)`;
    // transition in: circular mask reveal from the product
    tl.fromTo(st, { clipPath: "circle(0% at 50% 52%)" }, { clipPath: "circle(80% at 50% 52%)", duration: 0.85, ease: "power3.inOut" }, 11.15);
    SFX("whoosh", 11.1, 0.8);

    FX.caustics(st, tl, { t0: 11.2, t1: 26.9, alpha: 0.2 });
    FX.bokeh(st, tl, { seed: 21, count: 10, t0: 11.2, t1: 26.9, alpha: [0.08, 0.22] });
    FX.bubbles(st, tl, { seed: 22, count: 22, t0: 11.2, t1: 26.9, area: [40, 900, 1000, 700] });
    FX.particles(st, tl, { seed: 23, count: 24, t0: 11.2, t1: 26.9, size: [3, 8], opacity: [0.2, 0.6] });

    // header: eyebrow + progress dots
    const eb = KT.text(st, "FORMULASI GAMOGEN", { y: 196, size: 34, font: "Plus Jakarta Sans", weight: 700, ls: 0.34, color: C.goldDeep, split: "none" });
    KT.spaceIn(tl, eb, 11.55, { fromLs: 0.8, toLs: 0.34, dur: 1.2 });
    const dots = [];
    const cues = [13.0, 16.1, 17.55, 20.1, 21.55, 23.6, 24.68];
    cues.forEach((c, i) => {
      const d = box(st, { x: 540 - 3 * 34 + i * 34 - 7, y: 252, w: 14, h: 14 });
      Object.assign(d.style, { borderRadius: "50%", border: `2px solid ${C.gold}`, background: "transparent" });
      tl.fromTo(d, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 11.8 + i * 0.05);
      tl.to(d, { backgroundColor: C.burg, borderColor: C.burg, scale: 1.25, duration: 0.3 }, c);
      dots.push(d);
    });

    // title slot helper: each ingredient title rises in, leaves upward
    const titles = [];
    function title(str, t, tOut, o = {}) {
      const b = KT.text(st, str, Object.assign({ y: 300, size: 96, font: "Montserrat", weight: 900, color: C.burg, lh: 1.02 }, o));
      KT.riseWords(tl, b, t, { dur: 0.6, stagger: 0.07 });
      if (tOut) KT.outUp(tl, b, tOut, { dur: 0.35 });
      titles.push(b);
      return b;
    }
    function sub(str, t, tOut, y = 410) {
      const b = KT.text(st, str, { y, size: 56, font: "Playfair Display", weight: 500, italic: true, color: C.goldDeep, split: "words" });
      KT.blurIn(tl, b, t, { dur: 0.6, stagger: 0.08 });
      if (tOut) KT.fadeOut(tl, b, tOut, 0.3);
      return b;
    }

    // ---- intro: bottle carries over, then exits as ingredients begin
    title("GABUNGAN BAHAN", 11.75, 12.85, { size: 92 });
    const p = FX.product(st, { x: 540, y: 1000, h: 700, kind: "bottle" });
    tl.fromTo(p.wrap, { scale: 1.06, y: -20 }, { scale: 1, y: 0, duration: 1.2, ease: "power2.out" }, 11.2);
    FX.sheenSweep(tl, p, 11.9, 1.0);
    tl.to(p.wrap, { x: 760, rotation: 8, opacity: 0, duration: 0.7, ease: "power3.in" }, 12.75);

    // ---- B1 Stichopus horrens (ekstrak gamat)
    title("EKSTRAK GAMAT", 13.0, 15.75, { size: 92 });
    sub("Stichopus horrens", 13.7, 15.7);
    const seagrass = svg(st, { x: 0, y: 760, w: 1080, h: 600, inner: [120, 260, 830, 960].map((x, i) => `<path class="sg" d="M ${x} 600 C ${x - 30} 450 ${x + 40} 330 ${x + (i % 2 ? 30 : -30)} 180" fill="none" stroke="${C.gold}" stroke-width="9" stroke-linecap="round" opacity=".55"/>`).join("") });
    tl.fromTo(seagrass, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8 }, 13.0);
    tl.fromTo(seagrass.querySelectorAll(".sg"), { rotation: -4, transformOrigin: "50% 100%" }, { rotation: 4, duration: 1.4, ease: "sine.inOut", repeat: 1, yoyo: true, stagger: 0.2 }, 13.0);
    tl.to(seagrass, { opacity: 0, duration: 0.4 }, 15.8);
    const sc = box(st, { x: 540, y: 960, w: 900, h: 380, center: true });
    sc.innerHTML = ILL.seaCucumber({ w: 900, seed: 4 });
    HG.prepDraw(sc);
    // specimen frame corner ticks
    const frame = svg(st, { x: 540, y: 960, w: 960, h: 520, center: true, inner: `<g fill="none" stroke="${C.goldDeep}" stroke-width="4" stroke-linecap="round">
      <path d="M10 70 V10 H70"/><path d="M890 10 H950 V70"/><path d="M950 450 V510 H890"/><path d="M70 510 H10 V450"/></g>` });
    tl.fromTo(frame, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 13.15);
    tl.to(frame, { opacity: 0, duration: 0.3 }, 15.8);
    tl.fromTo(sc, { x: -820, opacity: 0, rotation: -6 }, { x: 0, opacity: 1, rotation: 0, duration: 1.0, ease: "power3.out" }, 12.95);
    HG.draw(tl, sc.querySelectorAll("[data-draw]"), 13.3, 1.2, "power2.inOut", 0.03);
    tl.fromTo(sc.firstElementChild, { scaleY: 0.97, skewX: -1.5 }, { scaleY: 1.03, skewX: 1.5, duration: 0.9, ease: "sine.inOut", repeat: 2, yoyo: true }, 13.4);
    // label callout
    const lab = box(st, { x: 540, y: 1215, w: 600, h: 60, center: true, html: `<div style="font:600 30px 'DM Sans';color:${C.ink};letter-spacing:.18em;text-align:center">EKSTRAK TIMUN LAUT · GAMAT</div>` });
    tl.fromTo(lab, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 14.4);
    tl.to(lab, { opacity: 0, duration: 0.3 }, 15.75);
    SFX("whoosh_soft", 12.9, 0.6); SFX("chime", 13.72, 0.55);

    // ---- B2 Gamodulin®
    tl.to(sc, { x: 250, y: -330, scale: 0.42, opacity: 0.0, duration: 0.6, ease: "power3.inOut" }, 15.75);
    title("DIKENALI SEBAGAI", 15.75, 17.35, { size: 60, font: "Plus Jakarta Sans", weight: 800, ls: 0.06, y: 330 });
    const ring = svg(st, { x: 540, y: 990, w: 640, h: 640, center: true, inner: `
      <circle data-draw cx="320" cy="320" r="270" fill="none" stroke="${C.gold}" stroke-width="6" transform="rotate(-90 320 320)"/>
      <circle cx="320" cy="320" r="300" fill="none" stroke="${C.goldDeep}" stroke-width="2" stroke-dasharray="2 16" stroke-linecap="round" class="ticks"/>
      <circle cx="320" cy="320" r="240" fill="${C.ivory}" opacity=".85"/>` });
    HG.prepDraw(ring);
    HG.draw(tl, ring.querySelector("[data-draw]"), 15.95, 0.9, "power2.inOut");
    tl.fromTo(ring.querySelector(".ticks"), { rotation: 0, transformOrigin: "320px 320px" }, { rotation: 60, duration: 1.6, ease: "none" }, 15.95);
    tl.fromTo(ring, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, 15.9);
    const gm = box(st, { x: 540, y: 950, w: 600, h: 140, center: true, html: `<div style="font:900 104px Montserrat;color:${C.burg};text-align:center;line-height:1">Gamodulin<span style="font-size:.42em;vertical-align:top;color:${C.goldDeep}">®</span></div>` });
    tl.fromTo(gm, { scale: 0.5, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "back.out(1.6)" }, 16.15);
    const gms = box(st, { x: 540, y: 1060, w: 520, h: 60, center: true, html: `<div style="font:italic 500 40px 'Playfair Display';color:${C.goldDeep};text-align:center">ekstrak gamat</div>` });
    tl.fromTo(gms, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 16.5);
    tl.to([ring, gm, gms], { scale: 0.6, opacity: 0, duration: 0.45, ease: "power3.in" }, 17.35);
    SFX("sparkle", 16.15, 0.7);

    // ---- B3 Omega-3 + Omega-6
    const om = KT.text(st, "OMEGA-3 + OMEGA-6", { y: 300, size: 90, font: "Montserrat", weight: 900, color: C.burg });
    tl.fromTo(om._words[0], { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: "power4.out" }, 17.55);
    tl.fromTo(om._words.slice(1), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power4.out" }, 18.5);
    KT.outUp(tl, om, 19.85, { dur: 0.35 });
    const d3 = box(st, { x: 360, y: 980, w: 240, h: 312, center: true, html: ILL.droplet({ w: 240, label: "3" }) });
    const d6 = box(st, { x: 720, y: 980, w: 240, h: 312, center: true, html: ILL.droplet({ w: 240, label: "6" }) });
    const ripple = (x, t) => {
      for (let k = 0; k < 3; k++) {
        const r = box(st, { x, y: 1170, w: 300, h: 70, center: true });
        Object.assign(r.style, { border: `3px solid ${C.gold}`, borderRadius: "50%" });
        tl.fromTo(r, { scale: 0.2, opacity: 0.9 }, { scale: 1.3 + k * 0.3, opacity: 0, duration: 1.2, ease: "power2.out" }, t + k * 0.18);
      }
    };
    tl.fromTo(d3, { y: -900, opacity: 0, scaleY: 1.25, scaleX: 0.85 }, { y: 0, opacity: 1, scaleY: 1, scaleX: 1, duration: 0.55, ease: "power2.in" }, 17.5);
    tl.to(d3, { scaleY: 0.9, scaleX: 1.08, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 18.05);
    ripple(360, 18.05);
    tl.fromTo(d6, { y: -900, opacity: 0, scaleY: 1.25, scaleX: 0.85 }, { y: 0, opacity: 1, scaleY: 1, scaleX: 1, duration: 0.55, ease: "power2.in" }, 18.45);
    tl.to(d6, { scaleY: 0.9, scaleX: 1.08, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 19.0);
    ripple(720, 19.0);
    HG.float(tl, d3, { t0: 18.3, t1: 20.0, y: 14, period: 1.6 });
    tl.to([d3, d6], { y: -520, scale: 0.38, opacity: 0.0, duration: 0.6, ease: "power3.inOut", stagger: 0.06 }, 19.9);
    SFX("pop", 18.05, 0.8); SFX("pop", 19.0, 0.8);

    // ---- B4 minyak flaxseed
    title("MINYAK FLAXSEED", 20.1, 21.35, { size: 88 });
    const flax = box(st, { x: 420, y: 960, w: 420, h: 620, center: true, html: ILL.flaxSprig({ w: 420 }) });
    HG.prepDraw(flax);
    tl.fromTo(flax, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 20.0);
    HG.draw(tl, flax.querySelectorAll("[data-draw]"), 20.05, 0.9, "power2.out", 0.02);
    const r4 = prng(44), seeds = [];
    for (let i = 0; i < 9; i++) {
      const s = box(st, { x: 640 + r4() * 300, y: 760 + r4() * 460, w: 40, h: 70, center: true, html: ILL.seed({ w: 40 + r4() * 14 }) });
      tl.fromTo(s, { opacity: 0, scale: 0, rotation: r4() * 180 }, { opacity: 1, scale: 1, rotation: "+=" + (60 + r4() * 120), duration: 1.2, ease: "back.out(1.6)" }, 20.2 + i * 0.05);
      seeds.push(s);
    }
    tl.to([flax, ...seeds], { opacity: 0, x: -120, duration: 0.4, ease: "power2.in", stagger: 0.01 }, 21.35);
    SFX("whoosh_soft", 20.0, 0.45);

    // ---- B5 vitamin E + vitamin B
    const ve = KT.text(st, "VITAMIN E", { y: 300, size: 92, font: "Montserrat", weight: 900, color: C.burg });
    KT.riseWords(tl, ve, 21.55, { dur: 0.55 });
    const vb = KT.text(st, "VITAMIN B", { y: 400, size: 92, font: "Montserrat", weight: 900, color: C.goldDeep });
    KT.riseWords(tl, vb, 22.45, { dur: 0.55 });
    KT.outUp(tl, ve, 23.4, { dur: 0.3 }); KT.outUp(tl, vb, 23.42, { dur: 0.3 });
    const cE = box(st, { x: 380, y: 920, w: 340, h: 159, center: true, html: ILL.capsule({ w: 340, type: "softgel", letter: "E" }) });
    const cB = box(st, { x: 700, y: 1110, w: 340, h: 159, center: true, html: ILL.capsule({ w: 340, type: "capsule", letter: "B" }) });
    tl.fromTo(cE, { scale: 0, rotation: -40, opacity: 0 }, { scale: 1, rotation: -18, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, 21.6);
    tl.fromTo(cB, { scale: 0, rotation: 50, opacity: 0 }, { scale: 1, rotation: 22, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, 22.5);
    HG.float(tl, cE, { t0: 22.2, t1: 23.5, y: 16, rot: 4, period: 1.3 });
    tl.to([cE, cB], { scale: 0, opacity: 0, duration: 0.35, ease: "back.in(1.6)", stagger: 0.05 }, 23.4);
    SFX("pop", 21.6, 0.75); SFX("pop", 22.5, 0.75);

    // ---- B6 chlorella
    title("CHLORELLA", 23.6, 24.55, { size: 96 });
    const ch = box(st, { x: 540, y: 970, w: 520, h: 520, center: true, html: ILL.chlorella({ w: 520 }) });
    tl.fromTo(ch, { scale: 0.4, opacity: 0, rotation: -30 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.55, ease: "power3.out" }, 23.55);
    tl.fromTo(ch.querySelector(".cells"), { rotation: 0, transformOrigin: "260px 260px" }, { rotation: 40, duration: 1.5, ease: "none" }, 23.55);
    tl.to(ch, { scale: 0.3, opacity: 0, duration: 0.35, ease: "power3.in" }, 24.55);
    SFX("tick", 23.62, 0.8);

    // ---- B7 beta-karotena
    title("BETA-KAROTENA", 24.65, 25.3, { size: 90 });
    const bc = box(st, { x: 540, y: 970, w: 380, h: 380, center: true, html: ILL.betaCarotene({ w: 380 }) });
    tl.fromTo(bc, { scale: 0.3, opacity: 0, rotation: 90 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" }, 24.62);
    const orbit = box(st, { x: 540, y: 970, w: 620, h: 620, center: true });
    const r7 = prng(77);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, rr = 250 + r7() * 50, s = 10 + r7() * 14;
      const d = HG.el("div", {}, orbit);
      Object.assign(d.style, { position: "absolute", left: 310 + Math.cos(a) * rr - s / 2 + "px", top: 310 + Math.sin(a) * rr - s / 2 + "px", width: s + "px", height: s + "px", borderRadius: "50%", background: `radial-gradient(circle, #FBD9A8, ${C.amber})` });
    }
    tl.fromTo(orbit, { rotation: 0, scale: 0.6, opacity: 0 }, { rotation: 140, scale: 1, opacity: 1, duration: 1.0, ease: "power2.out" }, 24.62);
    tl.to([bc, orbit], { scale: 0.2, opacity: 0, duration: 0.35, ease: "power3.in" }, 25.3);
    SFX("sparkle", 24.65, 0.5);

    // ---- B8 finale: bottle surrounded by ingredient badges
    title("GAMOGEN", 25.32, null, { size: 104 });
    const fsub = sub("bersama Gamodulin®", 25.6, null, 412);
    const p2 = FX.product(st, { x: 540, y: 1010, h: 640, kind: "bottle" });
    tl.fromTo(p2.wrap, { y: 260, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 25.25);
    FX.sheenSweep(tl, p2, 25.8, 1.0);
    const minis = [
      ILL.seaCucumber({ w: 104 }), ILL.droplet({ w: 52, label: "" }), ILL.flaxSprig({ w: 56 }), ILL.capsule({ w: 92, type: "softgel", letter: "E" }),
      ILL.capsule({ w: 92, type: "capsule", letter: "B" }), ILL.chlorella({ w: 96 }), ILL.betaCarotene({ w: 96 }), ILL.droplet({ w: 52, label: "" }),
    ];
    const pos = [[205, 760], [175, 930], [175, 1100], [205, 1270], [875, 760], [905, 930], [905, 1100], [875, 1270]];
    minis.forEach((m, i) => {
      const b = box(st, { x: pos[i][0], y: pos[i][1], w: 132, h: 132, center: true });
      Object.assign(b.style, { borderRadius: "50%", background: C.ivory, border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px -16px rgba(69,18,29,.5)" });
      b.innerHTML = m;
      tl.fromTo(b, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" }, 25.35 + i * 0.06);
      HG.float(tl, b, { t0: 25.9, t1: 26.9, y: 10, period: 1.0 + (i % 3) * 0.2 });
    });
    SFX("whoosh_soft", 25.2, 0.5); SFX("sparkle", 25.5, 0.55);
  },
});
