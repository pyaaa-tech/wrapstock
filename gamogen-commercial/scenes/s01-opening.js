/* SCENE 01 — THE OPENING HOOK  (VO 0.00–11.06)
   "Hai everyone! Hari ini kita bercakap tentang Gamogen daripada House of Healin —
    suplemen berasaskan gamat yang dirumus untuk menyokong kesihatan harian anda." */
SCENES.push({
  id: "s01",
  build(tl, root) {
    const { C, box, SFX } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `radial-gradient(ellipse 90% 70% at 50% 50%, #FFF9EC 0%, #F7EBD3 45%, #E8D4AC 100%)`;

    const cam = box(st, { x: 0, y: 0, w: 1080, h: 1920 });
    cam.style.transformOrigin = "50% 55%";
    tl.fromTo(cam, { scale: 1.0 }, { scale: 1.04, duration: 12, ease: "none" }, 0);

    // atmosphere
    const glow = FX.orb(cam, { x: 540, y: 960, r: 620, color: C.gold, alpha: 0.6 });
    tl.fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2.2, ease: "power2.out" }, 0.1);
    const halo = FX.orb(cam, { x: 540, y: 760, r: 300, color: "#FFFFFF", alpha: 0.9 });
    tl.fromTo(halo, { opacity: 0 }, { opacity: 0.85, duration: 1.4 }, 0.5);
    const rg = FX.rings(cam, { x: 540, y: 960, radii: [330, 405, 480], width: 2.5, dashed: [2] });
    HG.draw(tl, rg.querySelectorAll("[data-draw]"), 0.6, 1.8, "power2.inOut", 0.15);
    tl.fromTo(rg, { rotation: -20, opacity: 0 }, { rotation: 10, opacity: 1, duration: 11, ease: "none" }, 0.5);
    FX.particles(cam, tl, { seed: 101, count: 46, t0: 0, t1: 12, size: [4, 11] });

    // pedestal + real product
    const ped = FX.pedestal(cam, { x: 540, y: 1317, w: 480, h: 70 });
    tl.fromTo(ped, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, 0.3);
    const p = FX.product(cam, { x: 540, y: 1020, h: 680, kind: "bottle" });
    tl.fromTo(p.wrap, { opacity: 0, scale: 0.84, y: 90, filter: "blur(16px) brightness(1.4)" },
      { opacity: 1, scale: 1, y: 0, filter: "blur(0px) brightness(1)", duration: 1.6, ease: "power3.out" }, 0.55);
    FX.hover(tl, p, 2.1, 12, 18, 3.6);
    FX.turn(tl, p, 2.1, 12, 7);
    FX.sheenSweep(tl, p, 1.7, 1.2);
    FX.sheenSweep(tl, p, 5.1, 1.3);
    FX.sheenSweep(tl, p, 8.6, 1.3);
    FX.lightSweep(st, tl, 0.0, { dur: 1.9, width: 520, alpha: 0.85, angle: 18, blend: "soft-light" });
    FX.lightSweep(st, tl, 7.3, { dur: 2.0, width: 300, alpha: 0.5, angle: -16, color: C.goldLight, blend: "screen" });

    // ---- typography
    const k1 = KT.text(st, "KENALI HEALIN", { y: 238, size: 44, font: "Plus Jakarta Sans", weight: 700, ls: 0.34, color: C.goldDeep, split: "none" });
    KT.spaceIn(tl, k1, 1.0, { fromLs: 0.9, toLs: 0.34, dur: 1.6 });

    const t1 = KT.text(st, "GAMOGEN", { y: 300, size: 150, font: "Montserrat", weight: 900, ls: 0.01, split: "chars", lh: 1 });
    KT.gradText(t1, `linear-gradient(180deg, #84303F 0%, ${C.burg} 55%, ${C.burgDeep} 100%)`);
    KT.addReg(t1, C.goldDeep);
    t1.style.whiteSpace = "nowrap";
    KT.riseChars(tl, t1, 3.42, { dur: 0.9, stagger: 0.05, from: 115 });
    KT.shine(tl, st, "GAMOGEN", { y: 300, size: 150, font: "Montserrat", weight: 900, ls: 0.01, lh: 1 }, 4.3, 1.1);
    KT.shine(tl, st, "GAMOGEN", { y: 300, size: 150, font: "Montserrat", weight: 900, ls: 0.01, lh: 1 }, 9.9, 1.2);

    const ul = KT.underline(st, { x: 540, y: 500, w: 440, h: 5, color: C.gold });
    KT.growX(tl, ul, 4.3, 0.9);
    const hoh = KT.text(st, "HOUSE OF HEALIN", { y: 522, size: 34, font: "DM Sans", weight: 600, ls: 0.42, color: C.goldDeep });
    KT.blurIn(tl, hoh, 4.96, { dur: 0.8, stagger: 0.1 });

    const chip = KT.chip(st, "Suplemen berasaskan gamat", { x: 540, y: 570, size: 38, icon: ICON.svg("wave", { size: 40, color: C.goldLight, sw: 7 }) });
    KT.chipIn(tl, chip, 6.4);
    tl.to(chip, { opacity: 0, y: -24, duration: 0.45, ease: "power2.in" }, 8.75);
    const tag = KT.text(st, "Pilihan sokongan nutrisi harian", { y: 574, size: 50, font: "Plus Jakarta Sans", weight: 700, color: C.burg, ls: 0.01 });
    KT.riseWords(tl, tag, 9.05, { dur: 0.7, stagger: 0.09 });
    const ul2 = KT.underline(st, { x: 540, y: 645, w: 300, h: 4, color: C.gold });
    KT.growX(tl, ul2, 9.6, 0.8);

    // SFX
    SFX("impact", 0.5, 0.9); SFX("sparkle", 1.65, 0.7); SFX("riser", 1.95, 0.55); SFX("chime", 3.42, 0.8);
    SFX("whoosh_soft", 4.9, 0.5); SFX("pop", 6.42, 0.7); SFX("sparkle", 8.6, 0.5); SFX("whoosh_soft", 8.95, 0.45);
  },
});
