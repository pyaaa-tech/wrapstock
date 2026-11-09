/* SCENE 07 — HEALTHY LIFESTYLE STORYTELLING  (VO 81.66–96.80)
   "Kesihatan bermula dengan pilihan harian: pemakanan seimbang, rehat mencukupi, aktiviti fizikal,
    dan sokongan nutrisi yang sesuai. Jika anda ingin mencuba Gamogen, dapatkan nasihat profesional
    dan gunakannya sebagai sebahagian daripada gaya hidup sihat."
   The supplement card is one of four equal pillars — never a replacement for the lifestyle. */
SCENES.push({
  id: "s07",
  build(tl, root) {
    const { C, box, svg, SFX, prng } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `radial-gradient(ellipse 110% 80% at 50% 35%, #FFFBF1 0%, #F8ECD6 50%, #EFDDBD 100%)`;
    st.style.perspective = "1800px";
    // transition: organic circular reveal with a travelling gold ring
    tl.fromTo(st, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(78% at 50% 50%)", duration: 0.9, ease: "power3.inOut" }, 81.3);
    const ringT = box(root, { x: 540, y: 960, w: 2400, h: 2400, center: true, z: 40 });
    Object.assign(ringT.style, { borderRadius: "50%", border: `10px solid ${C.gold}`, boxShadow: `0 0 40px 10px rgba(214,184,120,.5)` });
    tl.fromTo(ringT, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.9, ease: "power3.inOut" }, 81.3);
    tl.to(ringT, { opacity: 0, duration: 0.25 }, 82.05);
    SFX("whoosh", 81.25, 0.6); SFX("sparkle", 81.7, 0.45);

    FX.bokeh(st, tl, { seed: 71, count: 14, t0: 81.3, t1: 97.6, alpha: [0.1, 0.3] });
    FX.leafFrame(st, tl, { t0: 81.3, t1: 97.6, alpha: 0.22, top: 1250, seed: 9 });
    FX.particles(st, tl, { seed: 72, count: 30, t0: 81.3, t1: 97.6, size: [3, 9] });

    // ---- opening line, word-synced
    const T = KT.text(st, "KESIHATAN BERMULA DENGAN PILIHAN HARIAN", { y: 640, size: 100, font: "Montserrat", weight: 900, color: C.burg, lh: 1.02, x: 90, w: 900 });
    T.style.transformOrigin = "50% 0%";
    [81.66, 82.26, 82.88, 83.22, 83.7].forEach((t, i) => tl.fromTo(T._words[i], { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, t));
    tl.set(T._words[4], { color: C.goldDeep }, 0);
    const ulT = KT.underline(st, { x: 540, y: 975, w: 360, h: 6 });
    KT.growX(tl, ulT, 83.95, 0.6);
    tl.to(ulT, { opacity: 0, duration: 0.3 }, 84.0);
    tl.to(T, { y: -120, scale: 0.7, opacity: 0, duration: 0.55, ease: "power3.in" }, 83.95);
    const Tm = KT.text(st, "KESIHATAN BERMULA DENGAN PILIHAN HARIAN", { y: 206, size: 32, font: "Plus Jakarta Sans", weight: 800, ls: 0.12, color: C.goldDeep, lh: 1.25, x: 90, w: 900 });
    KT.blurIn(tl, Tm, 84.3, { dur: 0.6, stagger: 0.05 });
    SFX("chime", 83.72, 0.45);

    // ---- four pillar cards (arch shaped)
    const CW = 600, CH = 800, CX = 540, CY = 1010;
    function card(bg) {
      const c = box(st, { x: CX, y: CY, w: CW, h: CH, center: true });
      const inner = box(c, { x: 0, y: 0, w: CW, h: CH });
      Object.assign(inner.style, { borderRadius: `${CW / 2}px ${CW / 2}px 40px 40px`, overflow: "hidden", background: bg, boxShadow: "0 50px 90px -50px rgba(69,18,29,.55)" });
      const fr = box(c, { x: -12, y: -12, w: CW + 24, h: CH + 24 });
      Object.assign(fr.style, { borderRadius: `${CW / 2 + 12}px ${CW / 2 + 12}px 50px 50px`, border: `4px solid ${C.gold}`, boxSizing: "border-box" });
      c.style.opacity = 0;
      return { c, inner };
    }
    function inLabel(card, html, size = 46) {
      const l = box(card.inner, { x: 0, y: 640, w: CW, h: 160 });
      Object.assign(l.style, { display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", font: `900 ${size}px Montserrat`, color: C.burg, lineHeight: 1.05, background: `linear-gradient(180deg, rgba(255,253,248,0), ${C.ivory} 30%)` });
      l.innerHTML = html;
      return l;
    }

    // A — balanced nutrition
    const A = card(`linear-gradient(180deg, #FFF9EE, ${C.creamDeep})`);
    FX.orb(A.inner, { x: 300, y: 260, r: 260, color: C.goldLight, alpha: 0.8 });
    const bowl = box(A.inner, { x: 25, y: 190, w: 550, h: 412, html: ILL.foodBowl({ w: 550 }) });
    const lA = inLabel(A, "PEMAKANAN<br>SEIMBANG");
    ["f1", "f2", "f3", "f4"].forEach((k, i) => tl.fromTo(bowl.querySelector("." + k), { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 84.1 + i * 0.08));
    tl.fromTo(bowl.querySelector(".foods"), { y: 0 }, { y: -10, duration: 0.8, ease: "sine.inOut", repeat: 5, yoyo: true }, 84.6);

    // B — sufficient rest
    const B = card(`linear-gradient(180deg, #F4E7CF, #E2CDA8)`);
    FX.orb(B.inner, { x: 160, y: 430, r: 220, color: C.goldLight, alpha: 0.7 });
    const bed = box(B.inner, { x: 10, y: 170, w: 580, h: 471, html: ILL.bedroom({ w: 580 }) });
    const lB = inLabel(B, "REHAT<br>MENCUKUPI");
    tl.fromTo(bed.querySelector(".moonShape"), { rotation: -12, transformOrigin: "500px 130px" }, { rotation: 8, duration: 1.2, ease: "sine.inOut", repeat: 3, yoyo: true }, 85.3);
    tl.fromTo(bed.querySelectorAll(".star"), { opacity: 0.2 }, { opacity: 1, duration: 0.5, stagger: 0.15, repeat: 5, yoyo: true }, 85.3);
    tl.fromTo(bed.querySelector(".zz"), { y: 10, opacity: 0 }, { y: -16, opacity: 1, duration: 1.0, ease: "sine.out", repeat: 2, yoyo: true }, 85.6);

    // C — physical activity
    const Cc = card(`linear-gradient(180deg, #FFF7E8, #F2E1C2)`);
    FX.orb(Cc.inner, { x: 420, y: 230, r: 180, color: C.goldLight, alpha: 0.9 });
    const trees = svg(Cc.inner, { x: 0, y: 0, w: 1200, h: 800, inner: Array.from({ length: 8 }, (_, i) => { const x = 60 + i * 150, s = 0.8 + (i % 3) * 0.2; return `<g transform="translate(${x} 560) scale(${s})"><rect x="-6" y="-20" width="12" height="80" fill="${C.goldDeep}"/><circle cx="0" cy="-70" r="56" fill="${C.gold}" opacity=".75"/><circle cx="-26" cy="-40" r="34" fill="${C.goldDeep}" opacity=".45"/></g>`; }).join("") + `<path d="M0 640 H 1200" stroke="${C.goldDeep}" stroke-width="4"/>` });
    const walkerSvg = svg(Cc.inner, { x: 0, y: 0, w: 600, h: 800, inner: "" });
    const walker = FIG.create(walkerSvg.querySelector("svg"), { x: 290, y: 630, s: 0.82, view: "side", gender: "f", top: C.burg, bottom: C.ivory });
    FIG.walk(tl, walker, 85.9, 89.4, { period: 0.95 });
    tl.fromTo(trees, { x: 0 }, { x: -520, duration: 4.0, ease: "none" }, 85.6);
    const motion = svg(Cc.inner, { x: 0, y: 0, w: 600, h: 800, inner: `<g stroke="${C.goldDeep}" stroke-width="5" stroke-linecap="round" opacity=".6"><path d="M150 300 H 210"/><path d="M130 360 H 200"/><path d="M150 420 H 205"/></g>` });
    tl.fromTo(motion, { x: 20, opacity: 0 }, { x: -20, opacity: 1, duration: 0.5, repeat: 5, yoyo: true }, 86.4);
    const lC = inLabel(Cc, "AKTIVITI<br>FIZIKAL");

    // D — appropriate nutritional support (the product, as one pillar)
    const D = card(`radial-gradient(circle at 50% 40%, #FFF6E0, #F0DDB5 70%, #E5CB98)`);
    const beam = box(D.inner, { x: 120, y: -40, w: 360, h: 700 });
    beam.style.background = "linear-gradient(180deg, rgba(255,250,232,.95), rgba(255,250,232,0))";
    beam.style.clipPath = "polygon(40% 0, 60% 0, 100% 100%, 0 100%)";
    const pd = FX.product(D.inner, { x: 300, y: 370, h: 470, kind: "bottle" });
    const fl = [["leaf", 120, 220], ["drop", 480, 260], ["capsule", 100, 470], ["seed", 500, 500]].map(([n, x, y]) => box(D.inner, { x, y, w: 64, h: 64, center: true, html: ICON.svg(n, { size: 64, color: C.goldDeep, sw: 6 }) }));
    const lD = inLabel(D, "SOKONGAN NUTRISI<br>YANG SESUAI", 42);
    FX.sheenSweep(tl, pd, 88.05, 1.1);
    tl.fromTo(fl, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.08, ease: "back.out(2)" }, 87.9);
    tl.fromTo(fl, { y: 8 }, { y: -8, duration: 0.9, repeat: 3, yoyo: true, ease: "sine.inOut", stagger: 0.15 }, 88.3);

    // carousel choreography
    const cards = [A, B, Cc, D];
    const S = {
      center: { x: 0, y: 0, scale: 1, rotationY: 0, opacity: 1, zIndex: 5 },
      left: { x: -590, y: 30, scale: 0.66, rotationY: 32, opacity: 0.55, zIndex: 3 },
      right: { x: 590, y: 30, scale: 0.66, rotationY: -32, opacity: 0.55, zIndex: 3 },
      offL: { x: -1100, y: 30, scale: 0.5, rotationY: 40, opacity: 0, zIndex: 1 },
      offR: { x: 1100, y: 30, scale: 0.5, rotationY: -40, opacity: 0, zIndex: 1 },
    };
    cards.forEach(k => tl.set(k.c, S.offR, 81.3));
    const step = (t, states) => states.forEach((s, i) => s && tl.to(cards[i].c, Object.assign({ duration: 0.5, ease: "power3.inOut" }, S[s]), t));
    step(84.0, ["center", "right", null, null]);
    step(85.35, ["left", "center", "right", null]);
    step(86.3, ["offL", "left", "center", "right"]);
    step(87.55, [null, "offL", "left", "center"]);
    SFX("whoosh_soft", 84.0, 0.5); SFX("whoosh_soft", 85.35, 0.5); SFX("whoosh_soft", 86.3, 0.5); SFX("whoosh_soft", 87.55, 0.5); SFX("sparkle", 87.95, 0.5);

    // ---- grid: four equal pillars
    const G = [[290, 655], [790, 655], [290, 1125], [790, 1125]];
    tl.to([lA, lB, lC, lD], { opacity: 0, duration: 0.3 }, 89.15);
    cards.forEach((k, i) => tl.to(k.c, { x: G[i][0] - CX, y: G[i][1] - CY, scale: 0.5, rotationY: 0, opacity: 1, zIndex: 4, duration: 0.8, ease: "power3.inOut" }, 89.15 + i * 0.04));
    tl.to(Tm, { opacity: 0, duration: 0.4 }, 89.2);
    const glabels = ["Pemakanan seimbang", "Rehat mencukupi", "Aktiviti fizikal", "Sokongan nutrisi"].map((s, i) => {
      const l = box(st, { x: G[i][0] - 220, y: G[i][1] + 214, w: 440, html: `<div style="text-align:center;font:700 30px 'Plus Jakarta Sans';color:${C.burg}">${s}</div>` });
      tl.fromTo(l, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }, 89.75 + i * 0.07);
      return l;
    });
    cards.forEach((k, i) => HG.float(tl, k.c.firstElementChild, { t0: 90.0, t1: 97.6, y: 10, period: 2.6 + i * 0.3 }));
    SFX("whoosh_soft", 89.1, 0.5);

    // header messages
    const e1 = KT.text(st, "INGIN MENCUBA GAMOGEN?", { y: 196, size: 40, font: "Plus Jakarta Sans", weight: 800, ls: 0.16, color: C.goldDeep });
    KT.blurIn(tl, e1, 90.15, { dur: 0.6, stagger: 0.08 });
    const h1 = KT.text(st, "DAPATKAN NASIHAT PROFESIONAL", { y: 262, size: 80, font: "Montserrat", weight: 900, color: C.burg, lh: 1.0 });
    KT.riseWords(tl, h1, 91.95, { dur: 0.6, stagger: 0.09 });
    const doc = box(st, { x: 540, y: 890, w: 150, h: 150, center: true, z: 8, html: ILL.consult({ w: 150 }) });
    tl.fromTo(doc, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 92.1);
    SFX("chime", 92.0, 0.5);
    tl.to(e1, { opacity: 0, duration: 0.3 }, 94.05);
    KT.outUp(tl, h1, 94.05, { dur: 0.35 });
    tl.to(doc, { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(2)" }, 94.05);
    const h2 = KT.text(st, "SEBAHAGIAN DARIPADA GAYA HIDUP SIHAT", { y: 214, size: 68, font: "Montserrat", weight: 900, color: C.burg, lh: 1.04, mark: ["GAYA", "HIDUP", "SIHAT"], markColor: C.goldDeep });
    KT.riseWords(tl, h2, 94.3, { dur: 0.6, stagger: 0.08 });
    const ring = svg(st, { x: 540, y: 890, w: 760, h: 760, center: true, inner: `<circle data-draw cx="380" cy="380" r="330" fill="none" stroke="${C.gold}" stroke-width="5" transform="rotate(-90 380 380)"/>` });
    ring.style.zIndex = 2;
    HG.prepDraw(ring);
    HG.draw(tl, ring.querySelector("[data-draw]"), 94.4, 1.2);
    const emb = box(st, { x: 540, y: 890, w: 150, h: 150, center: true, z: 8, html: ICON.badge("heart", { size: 150, bg: C.burg, color: C.goldLight, sw: 6 }) });
    tl.fromTo(emb, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2)" }, 94.8);
    tl.fromTo(emb, { scale: 1 }, { scale: 1.08, duration: 0.6, repeat: 1, yoyo: true, ease: "sine.inOut", immediateRender: false }, 95.4);
    SFX("chime", 94.75, 0.45);
  },
});
