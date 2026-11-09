/* =========================================================================
   Rigged, elegant adult characters (faceless editorial illustration style).
   Forward-kinematics SVG rig: limbs are round-capped strokes whose joint
   angles are tweened by GSAP (seek-safe: every tween redraws via onUpdate).
   Angle convention (degrees): 0 = pointing down, +90 = toward +x, 180 = up.
   ========================================================================= */
(function () {
  const { C } = HG;
  const NS = "http://www.w3.org/2000/svg";
  const rad = d => (d * Math.PI) / 180;
  const pt = (x, y, a, L) => [x + Math.sin(rad(a)) * L, y + Math.cos(rad(a)) * L];
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };

  const POSES = {
    stand: { lsh: -9, lel: -4, rsh: 9, rel: 4, lhip: -3, lknee: -2, rhip: 3, rknee: 2, tilt: 0, bob: 0 },
    standHip: { lsh: -9, lel: -4, rsh: 38, rel: -55, lhip: -4, lknee: -2, rhip: 4, rknee: 2, tilt: 0, bob: 0 },
    stretch: { lsh: -163, lel: -176, rsh: 163, rel: 176, lhip: -5, lknee: -3, rhip: 5, rknee: 3, tilt: 0, bob: -6 },
    meditate: { lsh: -22, lel: -62, rsh: 22, rel: 62, lhip: -78, lknee: 98, rhip: 78, rknee: -98, tilt: 0, bob: 0 },
  };

  /**
   * create(parentSvg, opts) -> rig
   * opts: x,y (feet/ground point), s (scale), view "front"|"side", gender "f"|"m",
   *       top, bottom, skin, hair, sleeves(bool)
   */
  function create(parent, o = {}) {
    const { x = 0, y = 0, s = 1, view = "front", gender = "f", top = C.burg, bottom = C.ivory, skin = C.skin, hair = C.hair, sleeves = gender === "m", seated = false } = o;
    const g = mk("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    const inner = mk("g", {}, g);
    const st = Object.assign({}, POSES[o.pose || "stand"]);
    // body dimensions (fashion proportions, ~8 heads; total height 600)
    const D = { sh: gender === "m" ? 64 : 54, hip: gender === "m" ? 30 : 32, ua: 118, fa: 108, th: 150, sn: 150, headY: -540 };
    const legW = gender === "m" ? 34 : 30, shinW = gender === "m" ? 28 : 25, armW = gender === "m" ? 24 : 20, faW = gender === "m" ? 20 : 17;
    const hipY = seated ? -40 : -300; // hip joint height above ground (feet at y=0 when standing)
    const shY = hipY - 190;

    // draw order: back limbs, torso, front limbs, head
    const L = {};
    const back = mk("g", {}, inner), mid = mk("g", {}, inner), front = mk("g", {}, inner);
    const line = (p, color, w) => mk("line", { stroke: color, "stroke-width": w, "stroke-linecap": "round" }, p);
    if (view === "front") {
      L.lthigh = line(mid, bottom, legW); L.rthigh = line(mid, bottom, legW);
      L.lshin = line(mid, bottom, shinW); L.rshin = line(mid, bottom, shinW);
      L.lfoot = mk("ellipse", { rx: 16, ry: 8, fill: C.burgDeep }, mid); L.rfoot = mk("ellipse", { rx: 16, ry: 8, fill: C.burgDeep }, mid);
      // torso
      const w1 = D.sh, w2 = gender === "m" ? 44 : 34, w3 = gender === "m" ? 48 : 56;
      L.torso = mk("path", { fill: top, d: `M ${-w1} ${shY + 8} Q 0 ${shY - 8} ${w1} ${shY + 8} L ${w2 + 4} ${hipY - 70} L ${w3} ${hipY + 10} L ${-w3} ${hipY + 10} L ${-w2 - 4} ${hipY - 70} Z` }, mid);
      if (gender === "f") mk("path", { fill: "none", stroke: C.gold, "stroke-width": 3, d: `M ${-w1 + 14} ${shY + 6} Q 0 ${shY + 70} ${w2} ${hipY - 66}`, opacity: 0.9 }, mid); // wrap-top seam
      else mk("path", { fill: "none", stroke: C.goldDeep, "stroke-width": 3, d: `M -16 ${shY + 2} L 0 ${shY + 34} L 16 ${shY + 2}`, opacity: 0.9 }, mid); // collar
      mk("path", { fill: C.gold, d: `M ${-w2 - 6} ${hipY - 62} L ${w2 + 6} ${hipY - 62} L ${w2 + 8} ${hipY - 50} L ${-w2 - 8} ${hipY - 50} Z`, opacity: 0.95 }, mid); // belt
      L.neck = mk("rect", { x: -11, y: shY - 30, width: 22, height: 36, rx: 8, fill: C.skinShade }, mid);
      L.luarm = line(front, sleeves ? top : skin, armW); L.ruarm = line(front, sleeves ? top : skin, armW);
      L.lfarm = line(front, skin, faW); L.rfarm = line(front, skin, faW);
      L.lhand = mk("circle", { r: 11, fill: skin }, front); L.rhand = mk("circle", { r: 11, fill: skin }, front);
      // head + hair
      const hg = mk("g", {}, front);
      if (gender === "f") mk("ellipse", { cx: 0, cy: shY - 92, rx: 40, ry: 30, fill: hair }, hg); // volume behind
      mk("ellipse", { cx: 0, cy: shY - 62, rx: 30, ry: 38, fill: skin }, hg);
      if (gender === "f") {
        mk("path", { fill: hair, d: `M -34 ${shY - 60} Q -38 ${shY - 112} 0 ${shY - 108} Q 38 ${shY - 112} 34 ${shY - 60} Q 26 ${shY - 92} 0 ${shY - 94} Q -26 ${shY - 92} -34 ${shY - 60} Z` }, hg);
        mk("circle", { cx: 0, cy: shY - 122, r: 20, fill: hair }, hg); // elegant bun
        mk("circle", { cx: 26, cy: shY - 52, r: 4, fill: C.gold }, hg); // earring
      } else {
        mk("path", { fill: hair, d: `M -32 ${shY - 64} Q -34 ${shY - 108} 0 ${shY - 106} Q 34 ${shY - 108} 32 ${shY - 64} Q 28 ${shY - 88} 0 ${shY - 90} Q -22 ${shY - 90} -32 ${shY - 64} Z` }, hg);
      }
      L.head = hg;
    } else {
      // side view (facing +x)
      L.bthigh = line(back, C.creamDeep === bottom ? bottom : shade(bottom), legW); L.bshin = line(back, shade(bottom), shinW);
      L.bfoot = mk("ellipse", { rx: 20, ry: 8, fill: C.burgDeep }, back);
      L.buarm = line(back, shade(sleeves ? top : skin), armW); L.bfarm = line(back, shade(skin), faW); L.bhand = mk("circle", { r: 10, fill: shade(skin) }, back);
      L.torso = mk("path", { fill: top, d: `M -26 ${shY - 2} Q 4 ${shY - 14} 28 ${shY + 4} Q 36 ${shY + 80} 26 ${hipY - 40} L 30 ${hipY + 12} L -30 ${hipY + 12} L -24 ${hipY - 40} Q -34 ${shY + 80} -26 ${shY - 2} Z` }, mid);
      mk("path", { fill: C.gold, d: `M -26 ${hipY - 30} L 28 ${hipY - 30} L 29 ${hipY - 18} L -27 ${hipY - 18} Z` }, mid);
      L.fthigh = line(mid, bottom, legW); L.fshin = line(mid, bottom, shinW);
      L.ffoot = mk("ellipse", { rx: 20, ry: 8, fill: C.burgDeep }, mid);
      L.neck = mk("rect", { x: -6, y: shY - 30, width: 20, height: 36, rx: 8, fill: C.skinShade }, mid);
      L.fuarm = line(front, sleeves ? top : skin, armW); L.ffarm = line(front, skin, faW); L.fhand = mk("circle", { r: 11, fill: skin }, front);
      const hg = mk("g", {}, front);
      mk("ellipse", { cx: 8, cy: shY - 62, rx: 30, ry: 37, fill: skin }, hg);
      mk("path", { fill: skin, d: `M 34 ${shY - 70} L 44 ${shY - 56} L 34 ${shY - 52} Z` }, hg); // nose hint
      mk("path", { fill: hair, d: `M -26 ${shY - 46} Q -34 ${shY - 104} 8 ${shY - 102} Q 42 ${shY - 104} 38 ${shY - 74} Q 14 ${shY - 86} -4 ${shY - 66} Q -10 ${shY - 50} -26 ${shY - 46} Z` }, hg);
      if (gender === "f") { mk("path", { fill: hair, d: `M -24 ${shY - 70} Q -60 ${shY - 60} -52 ${shY - 20} Q -40 ${shY - 46} -20 ${shY - 52} Z` }, hg); } // ponytail
      L.head = hg;
    }

    function render() {
      inner.setAttribute("transform", `translate(0 ${st.bob || 0}) rotate(${st.tilt || 0} 0 ${hipY})`);
      if (view === "front") {
        const lh = [-D.hip, hipY], rh = [D.hip, hipY];
        const lk = pt(...lh, st.lhip, D.th), la = pt(...lk, st.lknee, D.sn);
        const rk = pt(...rh, st.rhip, D.th), ra = pt(...rk, st.rknee, D.sn);
        set(L.lthigh, lh, lk); set(L.lshin, lk, la); set(L.rthigh, rh, rk); set(L.rshin, rk, ra);
        L.lfoot.setAttribute("cx", la[0] - 6); L.lfoot.setAttribute("cy", la[1] + 6);
        L.rfoot.setAttribute("cx", ra[0] + 6); L.rfoot.setAttribute("cy", ra[1] + 6);
        const ls = [-D.sh + 8, shY + 14], rs = [D.sh - 8, shY + 14];
        const le = pt(...ls, st.lsh, D.ua), lw = pt(...le, st.lel, D.fa);
        const re = pt(...rs, st.rsh, D.ua), rw = pt(...re, st.rel, D.fa);
        set(L.luarm, ls, le); set(L.lfarm, le, lw); set(L.ruarm, rs, re); set(L.rfarm, re, rw);
        L.lhand.setAttribute("cx", lw[0]); L.lhand.setAttribute("cy", lw[1]);
        L.rhand.setAttribute("cx", rw[0]); L.rhand.setAttribute("cy", rw[1]);
      } else {
        const h = [0, hipY];
        const fk = pt(...h, st.rhip, D.th), fa = pt(...fk, st.rknee, D.sn);
        const bk = pt(...h, st.lhip, D.th), ba = pt(...bk, st.lknee, D.sn);
        set(L.fthigh, h, fk); set(L.fshin, fk, fa); set(L.bthigh, h, bk); set(L.bshin, bk, ba);
        L.ffoot.setAttribute("cx", fa[0] + 12); L.ffoot.setAttribute("cy", fa[1] + 6);
        L.bfoot.setAttribute("cx", ba[0] + 12); L.bfoot.setAttribute("cy", ba[1] + 6);
        const s0 = [2, shY + 16];
        const fe = pt(...s0, st.rsh, D.ua), fw = pt(...fe, st.rel, D.fa);
        const be = pt(...s0, st.lsh, D.ua), bw = pt(...be, st.lel, D.fa);
        set(L.fuarm, s0, fe); set(L.ffarm, fe, fw); set(L.buarm, s0, be); set(L.bfarm, be, bw);
        L.fhand.setAttribute("cx", fw[0]); L.fhand.setAttribute("cy", fw[1]);
        L.bhand.setAttribute("cx", bw[0]); L.bhand.setAttribute("cy", bw[1]);
      }
    }
    function set(l, a, b) { l.setAttribute("x1", a[0]); l.setAttribute("y1", a[1]); l.setAttribute("x2", b[0]); l.setAttribute("y2", b[1]); }
    render();
    return { g, st, render, POSES };
  }

  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const f = 0.82;
    const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }

  /** tween a rig to a pose (fromTo for seek-safety) */
  function pose(tl, rig, from, to, t, dur = 1, ease = "power2.inOut") {
    const f = typeof from === "string" ? POSES[from] : from, e = typeof to === "string" ? POSES[to] : to;
    tl.fromTo(rig.st, Object.assign({}, f), Object.assign({}, e, { duration: dur, ease, onUpdate: rig.render, immediateRender: false }), t);
  }

  /** side-view walk cycle for [t0, t1] (deterministic, seek-safe) */
  function walk(tl, rig, t0, t1, { period = 1.1 } = {}) {
    const proxy = { p: 0 };
    const cycles = (t1 - t0) / period;
    tl.fromTo(proxy, { p: 0 }, {
      p: cycles * Math.PI * 2, duration: t1 - t0, ease: "none", immediateRender: false,
      onUpdate: () => {
        const ph = proxy.p, s = Math.sin(ph), c = Math.cos(ph);
        rig.st.rhip = 24 * s; rig.st.lhip = -24 * s;
        rig.st.rknee = rig.st.rhip - 22 * Math.max(0, -c) - 4;
        rig.st.lknee = rig.st.lhip - 22 * Math.max(0, c) - 4;
        rig.st.rsh = -20 * s; rig.st.lsh = 20 * s;
        rig.st.rel = rig.st.rsh + 28; rig.st.lel = rig.st.lsh + 28;
        rig.st.bob = -4 * Math.abs(Math.cos(ph));
        rig.render();
      },
    }, t0);
  }

  window.FIG = { create, pose, walk, POSES };
})();
