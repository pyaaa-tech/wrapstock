/* SCENE 04 — THE SCIENTIFIC RESEARCH  (VO 39.29–54.10)
   "Dari segi penyelidikan, kajian oleh penyelidik Universiti Sains Malaysia pada 2025 mendapati
    ekstrak Stichopus horrens menunjukkan trend penurunan paras glukosa darah dan peningkatan
    toleransi senaman dalam model kajian haiwan."
   ACCURACY: no numbers, no fake data, no logos — abstract, clearly-labelled illustrative charts only. */
SCENES.push({
  id: "s04",
  build(tl, root) {
    const { C, box, svg, SFX, prng } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `${C.ivory}`;
    // lab-grid backdrop
    const grid = box(st, { x: 0, y: 0, w: 1080, h: 1920 });
    grid.style.backgroundImage = `linear-gradient(rgba(184,149,79,.12) 2px, transparent 2px), linear-gradient(90deg, rgba(184,149,79,.12) 2px, transparent 2px)`;
    grid.style.backgroundSize = "60px 60px";
    // transition in: precise top-down wipe with a gold scan line
    tl.fromTo(st, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power3.inOut" }, 38.8);
    const scan = box(root, { x: 0, y: 0, w: 1080, h: 6, z: 40 });
    scan.style.background = `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`;
    scan.style.boxShadow = `0 0 30px 8px rgba(214,184,120,.6)`;
    tl.fromTo(scan, { y: 0, opacity: 1 }, { y: 1920, duration: 0.75, ease: "power3.inOut" }, 38.8);
    tl.to(scan, { opacity: 0, duration: 0.2 }, 39.5);
    tl.fromTo(grid, { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px -240px", duration: 16, ease: "none" }, 38.8);
    SFX("whoosh", 38.75, 0.6); SFX("tick", 39.45, 0.6);

    // microscopic particles (outline circles)
    const r = prng(404);
    for (let i = 0; i < 18; i++) {
      const s = 14 + r() * 50;
      const c = box(st, { x: r() * 1080, y: 500 + r() * 1100, w: s, h: s });
      Object.assign(c.style, { borderRadius: "50%", border: `2px solid rgba(184,149,79,${0.25 + r() * 0.35})` });
      tl.fromTo(c, { x: 0, y: 0, opacity: 0 }, { x: (r() - 0.5) * 120, y: -120 - r() * 160, opacity: 1, duration: 15, ease: "none" }, 39.0);
    }

    // header
    const ic = box(st, { x: 540, y: 168, w: 70, h: 70, center: true, html: ICON.svg("flask", { size: 70, color: C.goldDeep, sw: 6 }) });
    tl.fromTo(ic, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, 39.4);
    const h1 = KT.text(st, "PENYELIDIKAN", { y: 222, size: 100, font: "Montserrat", weight: 900, color: C.burg, split: "chars" });
    KT.riseChars(tl, h1, 39.95, { dur: 0.6, stagger: 0.025 });
    const yr = box(st, { x: 540, y: 420, w: 600, h: 170, center: true, html: `<div class="yr" style="font:900 156px Montserrat;line-height:1;text-align:center;color:transparent;-webkit-text-stroke:3px ${C.goldDeep};letter-spacing:.04em">2025</div>` });
    const yrFill = box(st, { x: 540, y: 420, w: 600, h: 170, center: true, html: `<div style="font:900 156px Montserrat;line-height:1;text-align:center;color:${C.gold};letter-spacing:.04em;background:linear-gradient(180deg,${C.goldLight},${C.gold} 50%,${C.goldDeep});-webkit-background-clip:text;-webkit-text-fill-color:transparent">2025</div>` });
    tl.fromTo(yr, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 40.35);
    KT.maskWipe(tl, yrFill, 43.85, { dur: 0.6, dir: "right" });
    tl.fromTo(yrFill, { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 44.35);
    SFX("chime", 43.9, 0.6);

    // ---- card carousel
    const cards = [];
    function card(i) {
      const c = box(st, { x: 540, y: 1010, w: 860, h: 720, center: true, z: 2 });
      Object.assign(c.style, { background: C.ivory, borderRadius: "36px", border: `2px solid ${C.gold}`, boxShadow: "0 50px 90px -50px rgba(69,18,29,.5), inset 0 0 0 10px rgba(214,184,120,.08)", overflow: "hidden" });
      cards.push(c);
      return c;
    }
    function label(c, str, y, o = {}) {
      return box(c, { x: 40, y, w: 780, html: `<div style="text-align:center;font:${o.weight || 700} ${o.size || 40}px '${o.font || "Plus Jakarta Sans"}';color:${o.color || C.burg};letter-spacing:${o.ls || 0}em;line-height:1.15;${o.italic ? "font-style:italic;" : ""}">${str}</div>` });
    }
    const show = (c, t, from = 900) => tl.fromTo(c, { x: from, rotationY: -25, opacity: 0 }, { x: 0, rotationY: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, t);
    const hide = (c, t) => tl.to(c, { x: -900, rotationY: 25, opacity: 0, duration: 0.6, ease: "power3.in" }, t);
    st.style.perspective = "1600px";

    // card 1 — the researchers / institution
    const c1 = card(1);
    label(c1, "KAJIAN OLEH PENYELIDIK", 70, { size: 34, ls: 0.22, color: C.goldDeep, weight: 800 });
    const inst = box(c1, { x: 250, y: 150, w: 360, h: 260, html: ILL.institution({ w: 360 }) });
    HG.prepDraw(inst);
    const uni = label(c1, "UNIVERSITI SAINS<br>MALAYSIA", 450, { size: 66, font: "Montserrat", weight: 900 });
    show(c1, 40.95);
    HG.draw(tl, inst.querySelectorAll("[data-draw]"), 41.1, 1.0, "power2.out", 0.05);
    tl.fromTo(uni, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 42.2);
    const ul = box(c1, { x: 280, y: 630, w: 300, h: 5 });
    ul.style.background = C.gold;
    KT.growX(tl, ul, 42.7, 0.7);
    hide(c1, 44.6);
    SFX("tick", 41.0, 0.6); SFX("tick", 42.25, 0.6);

    // card 2 — Stichopus horrens extract (specimen plate)
    const c2 = card(2);
    label(c2, "EKSTRAK", 70, { size: 34, ls: 0.3, color: C.goldDeep, weight: 800 });
    const spec = box(c2, { x: 50, y: 170, w: 760, h: 320, html: ILL.seaCucumber({ w: 760, seed: 8, plate: true }) });
    HG.prepDraw(spec);
    const sci = label(c2, "Stichopus horrens", 520, { size: 72, font: "Playfair Display", weight: 600, italic: true });
    show(c2, 44.65);
    HG.draw(tl, spec.querySelectorAll("[data-draw]"), 44.9, 1.2, "power2.inOut", 0.02);
    tl.fromTo(sci, { opacity: 0, letterSpacing: "0.12em" }, { opacity: 1, letterSpacing: "0em", duration: 0.9, ease: "power3.out" }, 46.0);
    hide(c2, 47.8);
    SFX("tick", 46.05, 0.6);

    // card 3 — reported trend: blood glucose (illustrative, no data)
    const c3 = card(3);
    label(c3, "TREND PENURUNAN", 56, { size: 52, font: "Montserrat", weight: 900 });
    label(c3, "paras glukosa darah", 120, { size: 44, color: C.goldDeep, weight: 700 });
    const ch1 = box(c3, { x: 110, y: 200, w: 640, h: 400, html: ILL.trendChart({ w: 640, dir: "down" }) });
    HG.prepDraw(ch1);
    label(c3, "Ilustrasi konsep sahaja — bukan data kajian", 640, { size: 26, font: "DM Sans", weight: 600, color: C.ink });
    show(c3, 47.85);
    HG.draw(tl, ch1.querySelectorAll("[data-draw]"), 48.1, 1.4, "power2.inOut", 0.15);
    tl.fromTo(ch1.querySelector(".area"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 48.9);
    tl.fromTo(ch1.querySelector(".dot"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, 49.5);
    tl.to(ch1.querySelector(".arrow"), { opacity: 1, duration: 0.4 }, 49.6);
    hide(c3, 50.6);
    SFX("tick", 48.0, 0.5); SFX("pop", 49.5, 0.6);

    // card 4 — exercise tolerance (animal model)
    const c4 = card(4);
    label(c4, "PENINGKATAN", 56, { size: 52, font: "Montserrat", weight: 900 });
    label(c4, "toleransi senaman", 120, { size: 44, color: C.goldDeep, weight: 700 });
    const mw = box(c4, { x: 90, y: 200, w: 400, h: 400, html: ILL.mouseWheel({ w: 400 }) });
    const ch2 = box(c4, { x: 470, y: 290, w: 330, h: 206, html: ILL.trendChart({ w: 330, dir: "up" }) });
    HG.prepDraw(ch2);
    label(c4, "Ilustrasi konsep sahaja — bukan data kajian", 640, { size: 26, font: "DM Sans", weight: 600, color: C.ink });
    show(c4, 50.65);
    tl.fromTo(mw.querySelector(".wheel"), { rotation: 0 }, { rotation: -540, duration: 3.6, ease: "none" }, 50.7);
    tl.fromTo(mw.querySelector(".legA"), { rotation: -12, transformOrigin: "50% 0%" }, { rotation: 12, duration: 0.15, repeat: 21, yoyo: true, ease: "none" }, 50.7);
    HG.draw(tl, ch2.querySelectorAll("[data-draw]"), 51.0, 1.2, "power2.inOut", 0.15);
    tl.fromTo(ch2.querySelector(".area"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 51.6);
    tl.fromTo(ch2.querySelector(".dot"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, 52.1);
    tl.to(ch2.querySelector(".arrow"), { opacity: 1, duration: 0.4 }, 52.2);
    SFX("tick", 50.85, 0.5); SFX("pop", 52.1, 0.6);

    // stamp: MODEL KAJIAN HAIWAN
    const stamp = KT.chip(st, "MODEL KAJIAN HAIWAN", { x: 540, y: 1388, size: 46, font: "Montserrat", weight: 900, ls: 0.04, pad: "22px 46px", z: 6,
      border: `4px solid ${C.gold}`, icon: ICON.svg("mouse", { size: 54, color: C.goldLight, sw: 6 }) });
    stamp.style.transform = "";
    tl.fromTo(stamp, { xPercent: -50, scale: 1.6, opacity: 0, rotation: -6 }, { xPercent: -50, scale: 1, opacity: 1, rotation: -2, duration: 0.55, ease: "back.out(2.2)" }, 52.95);
    SFX("impact", 52.95, 0.45); SFX("pop", 53.0, 0.6);
  },
});
