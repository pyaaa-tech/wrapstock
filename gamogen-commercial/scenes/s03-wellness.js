/* SCENE 03 — WELLNESS & TRADITION  (VO 26.26–38.63)
   "Formula ini dipasarkan sebagai sokongan untuk tenaga harian, keseimbangan nutrisi, dan
    kesejahteraan umum. Ekstrak gamat juga telah lama menjadi sebahagian daripada tradisi
    kesihatan di Asia Tenggara." */
SCENES.push({
  id: "s03",
  build(tl, root) {
    const { C, box, svg, SFX } = HG;
    const st = box(root, { x: 0, y: 0, w: 1080, h: 1920, cls: "stage" });
    st.style.background = `linear-gradient(180deg, #FFF8EC 0%, #F9EAD2 60%, #F1DBB6 100%)`;
    // transition in: warm light-leak dissolve
    tl.fromTo(st, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power1.inOut" }, 26.15);
    const leak = box(root, { x: -400, y: 300, w: 1900, h: 1400, z: 50 });
    leak.style.background = `radial-gradient(ellipse at center, rgba(255,250,236,.95) 0%, rgba(235,216,168,.7) 35%, rgba(235,216,168,0) 70%)`;
    tl.fromTo(leak, { opacity: 0, x: -500 }, { opacity: 1, x: -200, duration: 0.4, ease: "power2.out" }, 26.05);
    tl.to(leak, { opacity: 0, x: 200, duration: 0.7, ease: "power2.in" }, 26.45);
    SFX("whoosh_soft", 26.0, 0.6);

    FX.bokeh(st, tl, { seed: 31, count: 12, t0: 26.1, t1: 39.6, alpha: [0.1, 0.3] });
    const leaves = FX.leafFrame(st, tl, { t0: 26.1, t1: 34, alpha: 0.28, top: 1150 });
    tl.to(leaves, { opacity: 0, duration: 0.6 }, 33.4);
    FX.particles(st, tl, { seed: 32, count: 26, t0: 26.1, t1: 39.6, size: [3, 8], opacity: [0.25, 0.7] });

    // eyebrow (sentence 1)
    const eb = KT.text(st, "DIPASARKAN SEBAGAI SOKONGAN UNTUK", { y: 200, size: 31, font: "Plus Jakarta Sans", weight: 700, ls: 0.16, color: C.goldDeep, split: "words" });
    KT.blurIn(tl, eb, 26.35, { dur: 0.7, stagger: 0.12 });
    tl.to(eb, { opacity: 0, duration: 0.4 }, 33.35);

    // arch window
    const A = FX.arch(st, { x: 540, y: 980, w: 660, h: 840, bg: C.ivory });
    tl.fromTo(A.wrap, { y: 120, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: "power3.out" }, 26.3);
    const num = box(st, { x: 540, y: 560, w: 84, h: 84, center: true, z: 5 });
    Object.assign(num.style, { borderRadius: "50%", background: C.burg, border: `3px solid ${C.gold}`, color: C.goldLight, font: "800 30px Montserrat", display: "flex", alignItems: "center", justifyContent: "center" });
    const nums = ["01", "02", "03"].map((n, i) => { const sp = HG.el("span", { style: { position: "absolute", opacity: i ? 0 : 1 } }, num, n); return sp; });
    tl.fromTo(num, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 29.6);

    // layers inside the arch
    const L = n => { const d = box(A.inner, { x: 0, y: 0, w: 660, h: 840 }); return d; };
    const la = L(), lb = L(), lc = L();
    // A: morning energy
    la.innerHTML = ILL.morningBackdrop({ w: 660, h: 840 });
    tl.fromTo(la.querySelectorAll(".sun, .sunCore"), { y: 160 }, { y: 0, duration: 3.6, ease: "power2.out" }, 26.3);
    const plA = box(la, { x: 470, y: 560, w: 180, h: 270, html: ILL.plant({ w: 180 }) });
    const figA = svg(la, { x: 0, y: 0, w: 660, h: 840, inner: "" });
    const woman = FIG.create(figA.querySelector("svg"), { x: 300, y: 805, s: 0.9, gender: "f", top: C.burg, bottom: C.ivory });
    FIG.pose(tl, woman, "stand", "stretch", 27.7, 1.5, "power2.inOut");
    tl.fromTo(woman.g, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 26.5);
    const energy = svg(la, { x: 0, y: 0, w: 660, h: 840, inner: `<g fill="none" stroke="${C.goldDeep}" stroke-width="5" stroke-linecap="round">
      ${[[-1, 0], [1, 0]].map(([s]) => [0, 1, 2].map(k => `<path data-draw d="M ${300 + s * (110 + k * 46)} ${320 - k * 10} C ${300 + s * (150 + k * 50)} ${260 - k * 20} ${300 + s * (150 + k * 50)} ${200 - k * 20} ${300 + s * (120 + k * 46)} ${150 - k * 26}"/>`).join("")).join("")}
      </g><g fill="${C.gold}">${[[160, 140], [450, 120], [120, 300], [480, 280]].map(([x, y]) => `<path class="spk" d="M ${x} ${y - 16} Q ${x + 2} ${y - 2} ${x + 16} ${y} Q ${x + 2} ${y + 2} ${x} ${y + 16} Q ${x - 2} ${y + 2} ${x - 16} ${y} Q ${x - 2} ${y - 2} ${x} ${y - 16} Z"/>`).join("")}</g>` });
    HG.prepDraw(energy);
    HG.draw(tl, energy.querySelectorAll("[data-draw]"), 29.55, 0.7, "power2.out", 0.04);
    tl.fromTo(energy.querySelectorAll(".spk"), { scale: 0, transformOrigin: "50% 50%", opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: "back.out(3)" }, 29.7);
    // B: nutritional balance (circular infographic)
    lb.style.background = `radial-gradient(circle at 50% 45%, ${C.ivory}, ${C.cream} 70%, ${C.creamDeep})`;
    const R = 165, cx = 330, cy = 430, segs = 5;
    let arcs = "", icons = "";
    const iconNames = ["leaf", "drop", "vitamin", "seed", "sun"];
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2 - Math.PI / 2 + 0.06, a1 = ((i + 1) / segs) * Math.PI * 2 - Math.PI / 2 - 0.06;
      const p0 = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], p1 = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R];
      arcs += `<path data-draw d="M ${p0[0]} ${p0[1]} A ${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}" fill="none" stroke="${i % 2 ? C.burg : C.gold}" stroke-width="22" stroke-linecap="round"/>`;
      const am = (a0 + a1) / 2;
      icons += `<g transform="translate(${cx + Math.cos(am) * (R + 82) - 40} ${cy + Math.sin(am) * (R + 82) - 40})"><g class="nIcon"><circle cx="40" cy="40" r="44" fill="${C.ivory}" stroke="${C.gold}" stroke-width="3"/><g transform="translate(10 10) scale(.6)" fill="none" stroke="${C.burg}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${ICON.svg(iconNames[i]).replace(/^<svg[^>]*>|<\/svg>$/g, "").replace(/<g[^>]*>/, "").replace(/<\/g>$/, "")}</g></g></g>`;
    }
    const nut = svg(lb, { x: 0, y: 0, w: 660, h: 840, inner: `${arcs}<circle cx="${cx}" cy="${cy}" r="104" fill="${C.burg}"/><circle cx="${cx}" cy="${cy}" r="116" fill="none" stroke="${C.gold}" stroke-width="3"/>${icons}` });
    HG.prepDraw(nut);
    const lotus = box(lb, { x: cx, y: cy, w: 120, h: 120, center: true, html: ICON.svg("lotus", { size: 120, color: C.goldLight, sw: 5 }) });
    HG.draw(tl, nut.querySelectorAll("[data-draw]"), 30.55, 0.9, "power2.out", 0.1);
    tl.fromTo(nut.querySelectorAll(".nIcon"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "back.out(2)" }, 30.65);
    tl.fromTo(nut, { rotation: -8, transformOrigin: "330px 430px" }, { rotation: 4, duration: 2.2, ease: "sine.inOut" }, 30.4);
    // C: general wellness / spa self-care
    lc.style.background = `linear-gradient(180deg, #FBF1E2 0%, #F3E0C2 100%)`;
    const arcGlow = FX.orb(lc, { x: 330, y: 330, r: 300, color: C.goldLight, alpha: 0.7 });
    const figC = svg(lc, { x: 0, y: 0, w: 660, h: 840, inner: "" });
    const med = FIG.create(figC.querySelector("svg"), { x: 330, y: 560, s: 0.95, gender: "f", top: C.ivory, bottom: C.burg, seated: true, pose: "meditate" });
    med.st.lsh = -22; med.render();
    const mat = box(lc, { x: 330, y: 600, w: 520, h: 60, center: true });
    Object.assign(mat.style, { borderRadius: "50%", background: `radial-gradient(ellipse, ${C.gold} 0%, rgba(214,184,120,0) 70%)`, opacity: 0.7 });
    const spa = box(lc, { x: 30, y: 600, w: 600, h: 300, html: ILL.spaStill({ w: 600 }) });
    HG.prepDraw(spa);
    HG.draw(tl, spa.querySelectorAll("[data-draw]"), 32.1, 1.2, "sine.inOut", 0.2);
    tl.fromTo(figC, { y: 8 }, { y: -8, duration: 0.8, ease: "sine.inOut", repeat: 1, yoyo: true }, 31.9);
    tl.fromTo(spa.querySelectorAll(".flame"), { scaleY: 0.9, transformOrigin: "50% 100%" }, { scaleY: 1.12, duration: 0.25, repeat: 5, yoyo: true, ease: "sine.inOut" }, 31.9);
    // push transitions between A -> B -> C
    tl.set(lb, { x: 660 }, 0); tl.set(lc, { x: 660 }, 0);
    tl.to(la, { x: -660, duration: 0.55, ease: "power3.inOut" }, 30.4);
    tl.to(lb, { x: 0, duration: 0.55, ease: "power3.inOut" }, 30.4);
    tl.to(lb, { x: -660, duration: 0.55, ease: "power3.inOut" }, 31.75);
    tl.to(lc, { x: 0, duration: 0.55, ease: "power3.inOut" }, 31.75);
    tl.set(nums[0], { opacity: 0 }, 30.6); tl.set(nums[1], { opacity: 1 }, 30.6);
    tl.set(nums[1], { opacity: 0 }, 31.95); tl.set(nums[2], { opacity: 1 }, 31.95);
    tl.fromTo(num, { rotationY: 0 }, { rotationY: 360, duration: 0.6, ease: "power2.inOut" }, 30.35);
    tl.fromTo(num, { rotationY: 0 }, { rotationY: 360, duration: 0.6, ease: "power2.inOut", immediateRender: false }, 31.7);
    SFX("whoosh_soft", 30.35, 0.45); SFX("whoosh_soft", 31.7, 0.45);

    // headline per section
    const head = (str, t, tOut, col = C.burg) => {
      const b = KT.text(st, str, { y: 262, size: 92, font: "Montserrat", weight: 900, color: col, lh: 1.0 });
      KT.riseWords(tl, b, t, { dur: 0.6, stagger: 0.07 });
      KT.outUp(tl, b, tOut, { dur: 0.32 });
      return b;
    };
    head("SOKONGAN TENAGA HARIAN", 29.62, 30.4);
    head("KESEIMBANGAN NUTRISI", 30.52, 31.72);
    head("KESEJAHTERAAN UMUM", 31.85, 33.35);
    SFX("chime", 29.65, 0.45); SFX("pop", 30.6, 0.55); SFX("sparkle", 31.9, 0.45);

    // ---- Tradition (sentence 2): arch opens into a heritage seascape
    tl.to(A.wrap, { scale: 2.4, opacity: 0, duration: 1.0, ease: "power3.in" }, 33.3);
    tl.to(num, { scale: 0, opacity: 0, duration: 0.3 }, 33.3);
    const her = box(st, { x: 0, y: 470, w: 1080, h: 1100, html: ILL.heritage({ w: 1080, h: 1100 }) });
    her.style.webkitMaskImage = her.style.maskImage = "linear-gradient(180deg, transparent 0px, #000 220px)";
    tl.fromTo(her, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 33.55);
    tl.fromTo(her.querySelector(".palmL"), { rotation: -2, transformOrigin: "110px 858px" }, { rotation: 2, duration: 1.5, ease: "sine.inOut", repeat: 3, yoyo: true }, 33.6);
    tl.fromTo(her.querySelector(".palmR"), { rotation: 2, transformOrigin: "990px 880px" }, { rotation: -2, duration: 1.7, ease: "sine.inOut", repeat: 2, yoyo: true }, 33.6);
    tl.fromTo(her.querySelector(".waves"), { x: 0 }, { x: -100, duration: 6, ease: "none" }, 33.6);
    tl.fromTo(her.querySelector(".hsun"), { scale: 0.85, transformOrigin: "50% 50%" }, { scale: 1.1, duration: 6, ease: "sine.inOut" }, 33.6);
    const sc = box(st, { x: 540, y: 1300, w: 520, h: 219, center: true, html: ILL.seaCucumber({ w: 520, seed: 12 }) });
    HG.prepDraw(sc);
    tl.fromTo(sc, { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }, 34.0);
    HG.draw(tl, sc.querySelectorAll("[data-draw]"), 34.1, 1.6, "power2.inOut", 0.03);
    tl.fromTo(sc.firstElementChild, { scaleY: 0.98 }, { scaleY: 1.02, duration: 1.2, ease: "sine.inOut", repeat: 3, yoyo: true }, 34.2);

    const eb2 = KT.text(st, "EKSTRAK GAMAT", { y: 200, size: 36, font: "Plus Jakarta Sans", weight: 800, ls: 0.34, color: C.goldDeep, split: "none" });
    KT.spaceIn(tl, eb2, 33.6, { fromLs: 0.8, toLs: 0.34, dur: 1.2 });
    const tr1 = KT.text(st, "TRADISI KESIHATAN", { y: 258, size: 92, x: 140, w: 800, font: "Montserrat", weight: 900, color: C.burg });
    KT.riseWords(tl, tr1, 36.6, { dur: 0.7 });
    const tr2 = KT.text(st, "ASIA TENGGARA", { y: 452, size: 88, font: "Montserrat", weight: 900, color: C.goldDeep });
    KT.riseWords(tl, tr2, 37.9, { dur: 0.7 });
    const ulT = KT.underline(st, { x: 540, y: 556, w: 380, h: 5 });
    KT.growX(tl, ulT, 38.2, 0.7);
    const note = KT.text(st, "Warisan tradisional — bukan bukti klinikal", { y: 1404, size: 28, font: "DM Sans", weight: 600, color: C.ink, ls: 0.04, split: "none" });
    note.style.opacity = 0;
    tl.to(note, { opacity: 0.8, duration: 0.6 }, 37.0);
    SFX("whoosh", 33.3, 0.5); SFX("chime", 36.65, 0.5); SFX("sparkle", 37.95, 0.4);
  },
});
