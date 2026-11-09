/* SCENE 08 — PRODUCT HERO & BRAND CLOSING  (VO 97.04–101.71, then CTA end card to 107.5)
   "Gamogen House of Healin — sokongan untuk kesejahteraan harian anda."
   CTA uses only the supplied details (no invented phone numbers, URLs or handles). */
SCENES.push({
  id: "s08",
  build(tl, root) {
    const { C, box, svg, SFX } = HG;
    const END = 107.5;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `radial-gradient(ellipse 85% 60% at 50% 48%, #8A3242 0%, ${C.burg} 42%, ${C.burgDeep} 78%, #2E0B13 100%)`;
    // transition: burgundy curtain rises with a gold leading edge
    tl.fromTo(st, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power3.inOut" }, 96.8);
    const edge = box(root, { x: 0, y: 0, w: 1080, h: 6, z: 40 });
    edge.style.background = `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`;
    edge.style.boxShadow = "0 0 36px 10px rgba(214,184,120,.6)";
    tl.fromTo(edge, { y: 1920, opacity: 1 }, { y: 0, duration: 0.75, ease: "power3.inOut" }, 96.8);
    tl.to(edge, { opacity: 0, duration: 0.25 }, 97.5);
    SFX("whoosh", 96.75, 0.7); SFX("riser", 96.0, 0.45);

    const cam = box(st, { x: 0, y: 0, w: 1080, h: 1920 });
    cam.style.transformOrigin = "50% 50%";
    tl.fromTo(cam, { scale: 1.0 }, { scale: 1.05, duration: END - 96.8, ease: "none" }, 96.8);

    // spotlight beam + glows
    const beam = box(cam, { x: 140, y: -120, w: 800, h: 1600 });
    beam.style.background = "linear-gradient(180deg, rgba(255,236,200,.55) 0%, rgba(235,216,168,.18) 55%, rgba(235,216,168,0) 100%)";
    beam.style.clipPath = "polygon(42% 0, 58% 0, 100% 100%, 0 100%)";
    beam.style.mixBlendMode = "screen";
    tl.fromTo(beam, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, 97.1);
    const g1 = FX.orb(cam, { x: 540, y: 1050, r: 560, color: C.gold, alpha: 0.42 });
    tl.fromTo(g1, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.6 }, 97.1);
    const rg = FX.rings(cam, { x: 540, y: 1000, radii: [380, 450, 520], width: 2.5, dashed: [1] });
    HG.draw(tl, rg.querySelectorAll("[data-draw]"), 97.4, 1.6, "power2.inOut", 0.15);
    tl.fromTo(rg, { rotation: 0 }, { rotation: 30, duration: END - 97.4, ease: "none" }, 97.4);
    FX.particles(cam, tl, { seed: 81, count: 60, t0: 96.8, t1: END, size: [4, 12], drift: 340 });
    FX.bokeh(cam, tl, { seed: 82, count: 10, t0: 96.8, t1: END, color: C.goldLight, alpha: [0.06, 0.16] });

    // hero group: pedestal + real product (bottle + box)
    const hero = box(cam, { x: 0, y: 0, w: 1080, h: 1920 });
    hero.style.transformOrigin = "540px 1010px";
    const ped = FX.pedestal(hero, { x: 540, y: 1374, w: 620, h: 110, dark: true });
    tl.fromTo(ped, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" }, 97.2);
    const p = FX.product(hero, { x: 540, y: 1052, h: 760, kind: "full" });
    tl.fromTo(p.wrap, { y: 180, opacity: 0, scale: 0.88, filter: "blur(14px) brightness(1.5)" }, { y: 0, opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", duration: 1.3, ease: "power3.out" }, 97.35);
    FX.hover(tl, p, 98.7, END, 12, 3.8);
    FX.turn(tl, p, 98.7, END, 4);
    FX.sheenSweep(tl, p, 98.4, 1.3);
    FX.sheenSweep(tl, p, 101.0, 1.3);
    FX.sheenSweep(tl, p, 104.6, 1.5);
    SFX("impact", 97.4, 0.85); SFX("sparkle", 98.4, 0.6);

    // brand logo + title
    const logo = box(st, { x: 540, y: 120, w: 96, h: 96, center: true, html: `<img src="assets/product-images/healin_logo_circle.png" style="width:96px;height:96px;display:block;border-radius:50%;box-shadow:0 0 0 3px ${C.gold}, 0 10px 30px rgba(0,0,0,.35)">` });
    tl.fromTo(logo, { scale: 0, opacity: 0, rotation: -40 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(1.8)" }, 97.4);
    const k1 = KT.text(st, "HEALIN", { y: 196, size: 46, font: "Plus Jakarta Sans", weight: 800, ls: 0.5, color: C.goldLight, split: "none" });
    KT.spaceIn(tl, k1, 97.45, { fromLs: 1.1, toLs: 0.5, dur: 1.3 });
    const t1 = KT.text(st, "GAMOGEN", { y: 258, size: 146, font: "Montserrat", weight: 900, split: "chars", lh: 1, color: C.gold });
    KT.gradText(t1, `linear-gradient(180deg, #FFF1CF 0%, ${C.goldLight} 30%, ${C.gold} 60%, ${C.goldDeep} 100%)`);
    KT.addReg(t1, C.goldLight);
    t1.style.whiteSpace = "nowrap";
    KT.riseChars(tl, t1, 97.6, { dur: 0.9, stagger: 0.05 });
    KT.shine(tl, st, "GAMOGEN", { y: 258, size: 146, font: "Montserrat", weight: 900, lh: 1 }, 98.7, 1.1);
    KT.shine(tl, st, "GAMOGEN", { y: 258, size: 146, font: "Montserrat", weight: 900, lh: 1 }, 105.6, 1.3);
    SFX("chime", 97.6, 0.7);

    const tg = KT.text(st, "SOKONGAN UNTUK KESEJAHTERAAN HARIAN ANDA", { y: 455, size: 50, font: "Plus Jakarta Sans", weight: 800, color: C.ivory, lh: 1.18, ls: 0.02, x: 110, w: 860 });
    KT.blurIn(tl, tg, 99.25, { dur: 0.7, stagger: 0.08 });
    const ulg = KT.underline(st, { x: 540, y: 590, w: 360, h: 4, color: C.gold });
    KT.growX(tl, ulg, 100.0, 0.8);
    SFX("sparkle", 99.3, 0.45);

    // ---- CTA end card
    tl.to([tg, ulg], { opacity: 0, y: -16, duration: 0.45, ease: "power2.in" }, 101.35);
    tl.to(hero, { scale: 0.6, y: -235, duration: 1.0, ease: "power3.inOut" }, 101.3);
    tl.to(rg, { scale: 0.62, y: -250, opacity: 0.6, duration: 1.0, ease: "power3.inOut" }, 101.3);
    tl.to(beam, { opacity: 0.5, duration: 1.0 }, 101.3);
    SFX("whoosh_soft", 101.3, 0.55);

    const panel = box(st, { x: 60, y: 1088, w: 960, h: 600 });
    Object.assign(panel.style, { borderRadius: "40px", background: "linear-gradient(180deg, rgba(69,18,29,.78), rgba(46,11,19,.88))", border: `2px solid ${FX.hexA(C.gold, 0.8)}`, boxShadow: "0 40px 90px -30px rgba(0,0,0,.6), inset 0 0 0 10px rgba(214,184,120,.08)", overflow: "hidden" });
    tl.fromTo(panel, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 101.6);
    const c1 = KT.text(panel, "DAPATKAN GAMOGEN DI", { x: 0, y: 42, w: 960, size: 36, font: "Plus Jakarta Sans", weight: 800, ls: 0.3, color: C.goldLight, split: "none" });
    KT.spaceIn(tl, c1, 101.8, { fromLs: 0.7, toLs: 0.3, dur: 1.0 });
    const c2 = KT.text(panel, "SERI LESTARI HEALIN", { x: 30, y: 98, w: 900, size: 96, font: "Montserrat", weight: 900, color: C.ivory, lh: 1.0, mark: ["HEALIN"], markColor: C.gold });
    KT.riseWords(tl, c2, 102.05, { dur: 0.75, stagger: 0.12 });
    KT.shine(tl, panel, "SERI LESTARI HEALIN", { x: 30, y: 98, w: 900, size: 96, font: "Montserrat", weight: 900, lh: 1.0 }, 104.3, 1.4);
    const dv = box(panel, { x: 180, y: 318, w: 600, h: 3 });
    dv.style.background = `linear-gradient(90deg, transparent, ${C.gold}, transparent)`;
    KT.growX(tl, dv, 102.7, 0.8);
    const row = (icon, html, y, t) => {
      const r = box(panel, { x: 60, y, w: 840, h: 120 });
      Object.assign(r.style, { display: "flex", alignItems: "center", gap: "28px" });
      r.innerHTML = `<div class="ic" style="flex:0 0 92px;height:92px;border-radius:50%;background:${C.burg};border:3px solid ${C.gold};display:flex;align-items:center;justify-content:center">${ICON.svg(icon, { size: 58, color: C.goldLight, sw: 6 })}</div>
        <div style="font:600 34px 'DM Sans';color:${C.ivory};line-height:1.25">${html}</div>`;
      tl.fromTo(r, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, t);
      tl.fromTo(r.querySelector(".ic"), { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.2)" }, t + 0.05);
      SFX("pop", t + 0.05, 0.6);
      return r;
    };
    const r1 = row("pin", "Pengedar sah produk House of Healin<br>bagi kawasan <b style='color:#EBD8A8'>Batu Pahat</b>.", 346, 102.9);
    const r2 = row("truck", "Penghantaran tersedia ke<br><b style='color:#EBD8A8'>seluruh Malaysia</b>.", 470, 103.7);
    tl.fromTo(r1.querySelector(".ic svg"), { y: 0 }, { y: -8, duration: 0.5, repeat: 5, yoyo: true, ease: "sine.inOut" }, 103.6);
    tl.fromTo(r2.querySelector(".ic svg"), { x: -4 }, { x: 4, duration: 0.4, repeat: 7, yoyo: true, ease: "sine.inOut" }, 104.3);
    SFX("chime", 102.05, 0.55); SFX("sparkle", 104.3, 0.4);
  },
});
