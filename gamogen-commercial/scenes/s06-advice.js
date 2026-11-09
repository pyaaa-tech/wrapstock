/* SCENE 06 — WHO SHOULD SEEK PROFESSIONAL ADVICE?  (VO 65.33–80.99)
   "Gamogen sesuai bagi orang dewasa yang ingin menambah sokongan nutrisi harian. Bagi individu yang
    mengambil ubat, mengandung, menyusu, atau mempunyai keadaan kesihatan khusus, berbincanglah
    dengan doktor atau farmasis sebelum memulakan sebarang suplemen." */
SCENES.push({
  id: "s06",
  build(tl, root) {
    const { C, box, svg, SFX } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `radial-gradient(ellipse 100% 70% at 50% 40%, ${C.ivory} 0%, ${C.cream} 55%, ${C.creamDeep} 100%)`;
    // transition: soft focus dissolve
    tl.fromTo(st, { opacity: 0, filter: "blur(28px)", scale: 1.08 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.85, ease: "power2.out" }, 64.85);
    SFX("whoosh_soft", 64.8, 0.6);
    const arcs = svg(st, { x: 0, y: 0, w: 1080, h: 1920, inner: `<g fill="none" stroke="${C.gold}" stroke-width="2.5" opacity=".45">
      <circle data-draw cx="540" cy="900" r="460"/><circle data-draw cx="540" cy="900" r="520" stroke-dasharray="3 14"/></g>` });
    HG.prepDraw(arcs);
    HG.draw(tl, arcs.querySelectorAll("[data-draw]"), 65.0, 1.6);
    tl.fromTo(arcs, { rotation: 0, transformOrigin: "540px 900px" }, { rotation: 25, duration: 17, ease: "none" }, 65);
    FX.bokeh(st, tl, { seed: 61, count: 10, t0: 64.9, t1: 82.2, alpha: [0.08, 0.22] });
    FX.particles(st, tl, { seed: 62, count: 20, t0: 64.9, t1: 82.2, size: [3, 8], opacity: [0.2, 0.55] });

    // ---- Part 1: for adults
    const h1 = KT.text(st, "UNTUK ORANG DEWASA", { y: 240, size: 104, font: "Montserrat", weight: 900, color: C.burg, lh: 1.0, x: 100, w: 880 });
    KT.riseWords(tl, h1, 66.7, { dur: 0.7, stagger: 0.1 });
    const floor = box(st, { x: 540, y: 1290, w: 760, h: 90, center: true });
    floor.style.background = `radial-gradient(ellipse, rgba(214,184,120,.55) 0%, rgba(214,184,120,0) 70%)`;
    const figs = svg(st, { x: 0, y: 560, w: 1080, h: 760, inner: "" });
    const s = figs.querySelector("svg");
    const woman = FIG.create(s, { x: 430, y: 735, s: 1.0, gender: "f", top: C.burg, bottom: C.ivory, pose: "standHip" });
    const man = FIG.create(s, { x: 660, y: 740, s: 1.03, gender: "m", top: C.ivory, bottom: C.burgDeep, pose: "stand" });
    tl.fromTo([woman.g, man.g], { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.2 }, 65.35);
    tl.fromTo(figs, { y: 60 }, { y: 0, duration: 1.2, ease: "power3.out" }, 65.35);
    tl.fromTo(floor, { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 1.0 }, 65.4);
    FIG.pose(tl, man, "stand", { lsh: -9, lel: -4, rsh: 30, rel: 120, lhip: -3, lknee: -2, rhip: 3, rknee: 2, tilt: 0, bob: 0 }, 67.4, 0.9); // gentle wave
    FIG.pose(tl, man, { lsh: -9, lel: -4, rsh: 30, rel: 120, lhip: -3, lknee: -2, rhip: 3, rknee: 2, tilt: 0, bob: 0 }, "stand", 68.9, 0.8);
    const chip = KT.chip(st, "Sokongan nutrisi harian", { x: 540, y: 1336, size: 40, icon: ICON.svg("leaf", { size: 42, color: C.goldLight, sw: 7 }) });
    KT.chipIn(tl, chip, 68.45);
    SFX("chime", 66.75, 0.5); SFX("pop", 68.5, 0.6);
    // exit part 1
    tl.to([figs, floor], { opacity: 0, y: -40, scale: 0.92, duration: 0.5, ease: "power2.in" }, 69.9);
    tl.to(chip, { opacity: 0, duration: 0.3 }, 69.9);
    KT.outUp(tl, h1, 69.95, { dur: 0.4 });

    // ---- Part 2: precautions grid
    const eb = KT.text(st, "BAGI INDIVIDU YANG:", { y: 222, size: 56, font: "Montserrat", weight: 900, color: C.burg, ls: 0.02 });
    KT.riseWords(tl, eb, 70.25, { dur: 0.6 });
    const items = [
      ["pillBottle", "MENGAMBIL<br>UBAT", 71.3],
      ["pregnant", "MENGANDUNG", 72.25],
      ["motherBaby", "MENYUSU", 72.98],
      ["heartPulse", "KEADAAN KESIHATAN<br>KHUSUS", 73.72],
    ];
    const cards = items.map(([ic, lab, t], i) => {
      const cx = i % 2 ? 784 : 296, cy = i < 2 ? 520 : 890;
      const c = box(st, { x: cx, y: cy, w: 452, h: 340, center: true });
      Object.assign(c.style, { background: C.ivory, borderRadius: "34px", border: `2px solid ${C.gold}`, boxShadow: "0 30px 60px -36px rgba(69,18,29,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "22px" });
      c.innerHTML = ICON.badge(ic, { size: 150, sw: 5 }) + `<div style="text-align:center;font:800 36px 'Plus Jakarta Sans';color:${C.burg};line-height:1.12;letter-spacing:.02em">${lab}</div>`;
      tl.fromTo(c, { scale: 0.6, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "back.out(1.7)" }, t);
      SFX("pop", t + 0.02, 0.7);
      return c;
    });

    // ---- Part 3: consult banner
    tl.to(cards, { opacity: 0.55, scale: 0.97, duration: 0.5 }, 76.3);
    const ban = box(st, { x: 70, y: 1098, w: 940, h: 300 });
    Object.assign(ban.style, { background: `linear-gradient(135deg, ${C.burg} 0%, ${C.burgDeep} 100%)`, borderRadius: "36px", border: `3px solid ${C.gold}`, overflow: "hidden", boxShadow: "0 40px 80px -40px rgba(69,18,29,.8), 0 0 0 10px rgba(214,184,120,.18)" });
    const cons = box(ban, { x: 40, y: 50, w: 200, h: 200, html: ILL.consult({ w: 200 }) });
    const tx = box(ban, { x: 270, y: 44, w: 640, html: `<div style="font:800 32px 'Plus Jakarta Sans';letter-spacing:.24em;color:${C.goldLight}">DAPATKAN NASIHAT</div>
      <div style="font:900 64px Montserrat;color:${C.ivory};line-height:1.02;margin-top:10px">DOKTOR ATAU<br>FARMASIS</div>` });
    const tx2 = box(ban, { x: 270, y: 222, w: 640, html: `<div style="font:500 28px 'DM Sans';color:${C.goldLight};opacity:.95">sebelum memulakan sebarang suplemen</div>` });
    KT.maskWipe(tl, ban, 76.3, { dur: 0.8, dir: "right" });
    tl.fromTo(cons, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.8)" }, 76.6);
    tl.fromTo(tx, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 76.7);
    tl.fromTo(tx2, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 78.55);
    tl.fromTo(ban, { boxShadow: "0 40px 80px -40px rgba(69,18,29,.8), 0 0 0 0px rgba(214,184,120,.0)" }, { boxShadow: "0 40px 80px -40px rgba(69,18,29,.8), 0 0 0 16px rgba(214,184,120,.28)", duration: 0.9, yoyo: true, repeat: 3, ease: "sine.inOut" }, 77.4);
    FX.lightSweep(ban, tl, 77.2, { w: 940, h: 300, dur: 1.2, width: 160, alpha: 0.35, angle: 18, blend: "screen", color: C.goldLight });
    SFX("whoosh", 76.25, 0.55); SFX("chime", 76.4, 0.55);
  },
});
