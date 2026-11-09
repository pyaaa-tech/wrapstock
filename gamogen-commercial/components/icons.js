/* =========================================================================
   Modern line icon set (100x100 grid, round caps). ICON.svg(name, opts)
   ========================================================================= */
(function () {
  const { C } = HG;
  const P = {
    leaf: `<path d="M20 80 C 20 40 45 18 82 18 C 82 55 60 80 20 80 Z"/><path d="M20 80 L 62 38"/>`,
    drop: `<path d="M50 14 C 64 34 76 48 76 62 A 26 26 0 0 1 24 62 C 24 48 36 34 50 14 Z"/><path d="M38 64 A 12 12 0 0 0 50 76" opacity=".7"/>`,
    capsule: `<rect x="16" y="36" width="68" height="28" rx="14" transform="rotate(-35 50 50)"/><path d="M50 50 L 38 33" transform="rotate(0)"/><path d="M41 62 L 59 38"/>`,
    bowl: `<path d="M14 48 L 86 48 A 36 30 0 0 1 14 48 Z"/><path d="M32 86 L 68 86"/><path d="M40 40 C 40 28 50 22 58 18"/><circle cx="62" cy="36" r="7"/><path d="M26 40 C 30 32 38 32 42 40"/>`,
    sun: `<circle cx="50" cy="50" r="16"/><path d="M50 14 V 24 M50 76 V 86 M14 50 H 24 M76 50 H 86 M24.5 24.5 L 31.6 31.6 M68.4 68.4 L 75.5 75.5 M24.5 75.5 L 31.6 68.4 M68.4 31.6 L 75.5 24.5"/>`,
    heart: `<path d="M50 82 C 18 60 14 44 18 32 C 24 16 44 16 50 30 C 56 16 76 16 82 32 C 86 44 82 60 50 82 Z"/>`,
    heartPulse: `<path d="M50 82 C 18 60 14 44 18 32 C 24 16 44 16 50 30 C 56 16 76 16 82 32 C 86 44 82 60 50 82 Z"/><path d="M22 52 H 38 L 44 40 L 52 62 L 58 50 H 78"/>`,
    lotus: `<path d="M50 78 C 36 66 34 46 50 26 C 66 46 64 66 50 78 Z"/><path d="M50 78 C 34 76 18 66 14 48 C 30 48 42 58 50 78 Z"/><path d="M50 78 C 66 76 82 66 86 48 C 70 48 58 58 50 78 Z"/>`,
    flask: `<path d="M40 14 H 60 M44 14 V 40 L 22 80 A 6 6 0 0 0 28 88 H 72 A 6 6 0 0 0 78 80 L 56 40 V 14"/><path d="M30 66 H 70"/><circle cx="44" cy="76" r="3"/><circle cx="56" cy="72" r="2"/>`,
    microscope: `<path d="M40 14 L 56 22 L 44 48 L 28 40 Z"/><path d="M36 46 L 32 56"/><path d="M58 30 C 76 38 78 62 62 72"/><path d="M24 86 H 80"/><path d="M50 72 H 70 V 86"/><circle cx="31" cy="60" r="5"/>`,
    university: `<path d="M12 36 L 50 16 L 88 36 Z"/><path d="M20 42 V 74 M36 42 V 74 M50 42 V 74 M64 42 V 74 M80 42 V 74"/><path d="M12 80 H 88 M16 88 H 84"/>`,
    chartDown: `<path d="M14 14 V 86 H 88"/><path d="M22 30 C 40 34 46 52 58 56 C 68 60 74 66 82 72"/><path d="M72 72 H 82 V 62"/>`,
    chartUp: `<path d="M14 14 V 86 H 88"/><path d="M22 74 C 38 70 46 54 58 48 C 68 42 74 34 82 26"/><path d="M72 26 H 82 V 36"/>`,
    mouse: `<path d="M24 66 C 24 46 40 36 58 38 C 74 40 84 52 84 64 C 84 70 80 72 74 72 H 30 C 26 72 24 70 24 66 Z"/><circle cx="62" cy="34" r="9"/><circle cx="74" cy="56" r="2.5"/><path d="M24 64 C 14 64 10 56 16 50"/>`,
    paw: `<circle cx="50" cy="64" r="14"/><circle cx="28" cy="44" r="7"/><circle cx="42" cy="30" r="7"/><circle cx="58" cy="30" r="7"/><circle cx="72" cy="44" r="7"/>`,
    info: `<circle cx="50" cy="50" r="36"/><path d="M50 46 V 70"/><circle cx="50" cy="32" r="2.5"/>`,
    check: `<circle cx="50" cy="50" r="36"/><path d="M34 52 L 46 64 L 68 38"/>`,
    cross: `<circle cx="50" cy="50" r="36"/><path d="M36 36 L 64 64 M64 36 L 36 64"/>`,
    medical: `<path d="M40 16 H 60 V 40 H 84 V 60 H 60 V 84 H 40 V 60 H 16 V 40 H 40 Z"/>`,
    pillBottle: `<rect x="28" y="30" width="44" height="58" rx="8"/><rect x="24" y="14" width="52" height="16" rx="4"/><path d="M38 54 H 62 M50 42 V 66"/>`,
    stethoscope: `<path d="M26 14 V 40 A 18 18 0 0 0 62 40 V 14"/><path d="M44 58 V 66 A 16 16 0 0 0 76 66 V 58"/><circle cx="76" cy="50" r="8"/><path d="M20 14 H 32 M56 14 H 68"/>`,
    doctor: `<circle cx="50" cy="28" r="14"/><path d="M20 88 C 20 62 32 50 50 50 C 68 50 80 62 80 88"/><path d="M42 52 L 50 70 L 58 52"/><path d="M64 60 V 72 A 6 6 0 0 0 76 72"/><circle cx="70" cy="80" r="3"/>`,
    pregnant: `<circle cx="46" cy="18" r="9"/><path d="M42 30 C 34 40 36 52 40 58 C 42 62 40 74 40 88"/><path d="M48 32 C 54 36 52 44 56 48 C 70 54 70 70 54 74 C 50 75 52 82 52 88"/><path d="M42 40 L 32 58"/>`,
    motherBaby: `<circle cx="38" cy="18" r="9"/><path d="M34 30 C 24 44 26 66 30 88"/><path d="M42 30 C 52 38 54 50 50 60 L 44 88"/><path d="M30 46 C 44 56 60 56 72 46"/><circle cx="68" cy="38" r="8"/><path d="M58 52 C 66 54 74 52 78 46"/>`,
    clipboard: `<rect x="22" y="18" width="56" height="70" rx="6"/><rect x="38" y="12" width="24" height="12" rx="4"/><path d="M34 44 H 66 M34 58 H 66 M34 72 H 54"/>`,
    moon: `<path d="M64 14 A 36 36 0 1 0 86 62 A 30 30 0 1 1 64 14 Z"/><path d="M28 22 L 30 28 L 36 30 L 30 32 L 28 38 L 26 32 L 20 30 L 26 28 Z" stroke-width="3"/>`,
    clock: `<circle cx="50" cy="50" r="36"/><path d="M50 28 V 50 L 64 60"/>`,
    run: `<circle cx="62" cy="16" r="8"/><path d="M56 30 L 42 54 L 54 66 L 50 88"/><path d="M42 54 L 26 70"/><path d="M54 32 L 70 44 L 82 38"/><path d="M50 36 L 34 40 L 26 32"/>`,
    walk: `<circle cx="54" cy="14" r="8"/><path d="M52 28 L 46 56 L 58 72 L 60 88"/><path d="M46 56 L 34 72 L 32 88"/><path d="M50 34 L 36 50 M52 34 L 66 50"/>`,
    pin: `<path d="M50 88 C 50 88 22 58 22 38 A 28 28 0 0 1 78 38 C 78 58 50 88 50 88 Z"/><circle cx="50" cy="38" r="10"/>`,
    truck: `<path d="M8 28 H 58 V 70 H 8 Z"/><path d="M58 42 H 76 L 90 56 V 70 H 58"/><circle cx="26" cy="74" r="8"/><circle cx="74" cy="74" r="8"/><path d="M64 46 H 74 L 82 56 H 64 Z"/>`,
    parcel: `<path d="M50 12 L 86 30 V 70 L 50 88 L 14 70 V 30 Z"/><path d="M14 30 L 50 48 L 86 30 M50 48 V 88"/><path d="M32 21 L 68 39"/>`,
    shield: `<path d="M50 12 L 82 24 V 48 C 82 68 68 82 50 88 C 32 82 18 68 18 48 V 24 Z"/><path d="M36 50 L 46 60 L 66 40"/>`,
    sparkle: `<path d="M50 12 C 52 36 64 48 88 50 C 64 52 52 64 50 88 C 48 64 36 52 12 50 C 36 48 48 36 50 12 Z"/>`,
    seed: `<path d="M50 14 C 70 34 72 66 50 86 C 28 66 30 34 50 14 Z"/><path d="M50 26 V 74" opacity=".6"/>`,
    wave: `<path d="M10 40 C 22 30 34 30 46 40 C 58 50 70 50 82 40 L 90 34"/><path d="M10 62 C 22 52 34 52 46 62 C 58 72 70 72 82 62 L 90 56"/>`,
    cell: `<circle cx="50" cy="50" r="34"/><circle cx="56" cy="44" r="12"/><path d="M28 60 C 36 70 50 74 62 70"/>`,
    carrot: `<path d="M30 74 L 70 34 C 76 28 74 22 68 22 L 26 66 C 22 70 26 78 30 74 Z" transform="translate(0 4)"/><path d="M70 30 C 72 18 80 14 86 14 M72 32 C 82 30 88 34 90 40 M68 28 C 64 18 66 12 70 8"/><path d="M42 58 L 48 64 M52 48 L 58 54"/>`,
    vitamin: `<circle cx="50" cy="50" r="30"/><path d="M38 40 L 50 64 L 62 40"/>`,
    bed: `<path d="M10 76 V 30 M10 60 H 90 V 76"/><rect x="18" y="42" width="22" height="14" rx="6"/><path d="M44 46 H 86 A 4 4 0 0 1 90 50 V 60"/>`,
  };

  function svg(name, { size = 120, color = C.burg, sw = 5, fill = "none", accent = null } = {}) {
    const body = P[name] || P.sparkle;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" style="overflow:visible;display:block"><g fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  }

  /** circular icon badge: gold ring + icon */
  function badge(name, { size = 160, ring = C.gold, bg = C.ivory, color = C.burg, sw = 5 } = {}) {
    const inner = svg(name, { size: size * 0.52, color, sw });
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:3px solid ${ring};display:flex;align-items:center;justify-content:center;box-shadow:0 18px 36px -20px rgba(69,18,29,.55), inset 0 0 0 8px rgba(214,184,120,.18)">${inner}</div>`;
  }

  window.ICON = { svg, badge, names: Object.keys(P) };
})();
