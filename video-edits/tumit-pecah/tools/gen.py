"""Generate the HyperFrames project for the 'Tumit Pecah' edit.

Reads edl.json (cuts + remapped word timings) and writes:
  tumit/index.html, tumit/compositions/*.html
All times below are OUTPUT (edited) seconds, looked up from the spoken words.
"""
import json, os, re

ROOT = "tumit"
D = json.load(open("edl.json"))
EDL, WORDS, TOTAL = D["edl"], D["words"], D["total"]
TOTAL = round(TOTAL, 2)
FPS = 30
FR = 1 / FPS

# ---------- word lookup ----------
def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

def W(text, near, end=False):
    """start (or end) time of the spoken word `text` closest to `near`."""
    c = [w for w in WORDS if norm(w["text"]) == norm(text)]
    if not c:
        raise SystemExit(f"word not found: {text}")
    w = min(c, key=lambda w: abs(w["start"] - near))
    return round(w["end"] if end else max(0.0, w["start"]), 2)

# ---------- shared look ----------
FONT_CSS = """
  font-family: 'Montserrat', sans-serif;
"""
BASE_CSS = """
    #root { position: absolute; inset: 0; overflow: visible; font-family: 'Montserrat', sans-serif; color: #fff; }
    .abs { position: absolute; }
    .glass { background: rgba(9, 36, 34, 0.84); border: 2px solid rgba(159, 216, 200, 0.35); border-radius: 28px; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
    .hdr { position: absolute; left: 54px; right: 54px; top: 186px; height: 132px; display: flex; align-items: center; gap: 26px; padding: 0 30px 0 22px; }
    .hdr .num { flex: none; width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(140deg, #ffd978, #e9a92a); color: #1b1405; font-weight: 900; font-size: 58px; display: flex; align-items: center; justify-content: center; }
    .hdr .ttl { font-weight: 900; font-size: 52px; line-height: 1.02; letter-spacing: -0.01em; text-transform: uppercase; }
    .hdr .ttl em { font-style: normal; color: #ffd36b; }
    .chip { position: absolute; display: flex; align-items: center; gap: 16px; padding: 0 30px; height: 92px; border-radius: 46px; font-weight: 900; font-size: 44px; text-transform: uppercase; white-space: nowrap; }
    .chip svg { width: 46px; height: 46px; flex: none; }
    .card { position: absolute; border-radius: 26px; overflow: hidden; background: #fff; box-shadow: 0 18px 44px rgba(0,0,0,.4); border: 5px solid #fff; }
    .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .lbl { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 0 12px; text-align: center; font-weight: 900; font-size: 30px; text-transform: uppercase; color: #fff; background: linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,0)); }
    .badge { position: absolute; width: 92px; height: 92px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 6px solid #fff; box-shadow: 0 10px 26px rgba(0,0,0,.35); }
    .badge svg { width: 52px; height: 52px; }
    .ok { background: #22c27d; } .no { background: #ef3b3b; }
    .chip span svg, .ico svg { width: 100%; height: 100%; display: block; }
    .scrim { position: absolute; left: 0; right: 0; top: 0; height: 760px; background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,0) 100%); }
"""

ICON = {
    "check": '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>',
    "checkDark": '<svg viewBox="0 0 24 24" fill="none" stroke="#0b2b27" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>',
    "x": '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    "warn": '<svg viewBox="0 0 24 24" fill="none" stroke="#2a1a00" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3L2 21h20L12 3z"/><path d="M12 10v5"/><path d="M12 18.2v.1"/></svg>',
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="#1b1405" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></svg>',
    "drop": '<svg viewBox="0 0 24 24" fill="#7fd3ff"><path d="M12 2.5C9 7 5.5 10.6 5.5 14.5a6.5 6.5 0 0013 0C18.5 10.6 15 7 12 2.5z"/></svg>',
    "chat": '<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>',
    "bookmark": '<svg viewBox="0 0 24 24" fill="#1b1405"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
    "follow": '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M19 8v6M16 11h6"/></svg>',
}

GLASS_SVG = '<svg viewBox="0 0 60 90"><path d="M6 4h48l-6 80H12z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path class="water" d="M10.6 30h38.8l-4.1 50H14.7z" fill="#5cc8ff"/></svg>'


def scene(cid, start, end, body, script, extra_css=""):
    """Write compositions/<cid>.html and return the host div for index.html."""
    dur = round(end - start, 2)
    html = f"""<template>
  <style>
{BASE_CSS}
{extra_css}
  </style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">
{body}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      const q = (s) => document.querySelectorAll(s.split(',').map((p) => '[data-composition-id="{cid}"] ' + p.trim()).join(','));
{script}
      window.__timelines["{cid}"] = tl;
    }})();
  </script>
</template>
"""
    os.makedirs(f"{ROOT}/compositions", exist_ok=True)
    open(f"{ROOT}/compositions/{cid}.html", "w").write(html)
    return (cid, start, dur)


def L(t, s0):
    return round(t - s0, 3)

# common motion snippets (local times) ----------------------------------
def enter_hdr(sel, t=0.0):
    return f"""      tl.fromTo(q('{sel}'), {{ x: -140, opacity: 0, filter: 'blur(14px)' }}, {{ x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.42, ease: 'expo.out' }}, {t});
      tl.fromTo(q('{sel} .num'), {{ scale: 0.3, rotation: -40 }}, {{ scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)' }}, {t + 0.08});
"""

def pop_in(sel, t, frm="scale: 0.5", ease="back.out(1.7)", dur=0.38):
    return f"      tl.fromTo(q('{sel}'), {{ {frm}, opacity: 0 }}, {{ scale: 1, x: 0, y: 0, rotation: 0, opacity: 1, duration: {dur}, ease: '{ease}' }}, {round(t,3)});\n"

def out_all(sel, t, dur=0.22):
    return f"      tl.to(q('{sel}'), {{ opacity: 0, filter: 'blur(10px)', duration: {dur}, ease: 'power2.in' }}, {round(t,3)});\n"

def stamp(sel, t, rot=-8):
    return f"      tl.fromTo(q('{sel}'), {{ scale: 2.4, rotation: {rot - 10}, opacity: 0 }}, {{ scale: 1, rotation: {rot}, opacity: 1, duration: 0.26, ease: 'power4.out' }}, {round(t,3)});\n"


hosts = []
sfx = []  # (file, event_time, volume)
PEAK = {"pop": 0.12, "click-soft": 0.07, "impact-bass-1": 0.07, "notification": 0.23,
        "ping": 0.32, "sparkle": 0.03, "whoosh": 0.16, "whoosh-short": 0.16}
def S(name, t, vol):
    sfx.append((name, round(max(0.0, t + FR - PEAK[name]), 3), vol))

# ======================= 1. HOOK  (0 → first cut) =======================
h0, h1 = 0.0, EDL[0]["dur"]
t_bukan = W("bukan", 0.7); t_kurang = W("kurang", 1.9); t_je = W("je", 2.9)
body = f"""    <div class="scrim"></div>
    <div id="hook-broll" class="abs" style="inset:0; overflow:hidden;">
      <img id="hook-img" src="assets/img/heel-hand.jpg" alt="Tumit" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:38% 50%;" />
      <div class="abs" style="inset:0; background: linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0) 45%, rgba(0,0,0,.25));"></div>
    </div>
    <div id="hook-flash" class="abs" style="inset:0; background:#fff; opacity:0;"></div>
    <div id="hook-t1" class="abs" style="left:0; right:0; top:206px; text-align:center; white-space:nowrap; font-weight:900; font-size:112px; letter-spacing:-0.02em; line-height:1; text-shadow: 0 8px 30px rgba(0,0,0,.5);">TUMIT <span style="color:#ffd36b">PECAH?</span></div>
    <div id="hook-t2wrap" class="abs" style="left:0; right:0; top:360px; display:flex; justify-content:center;">
      <div id="hook-t2" style="background:#ef3b3b; color:#fff; font-weight:900; font-size:70px; padding:8px 34px 12px; border-radius:18px; transform: rotate(-3deg); box-shadow: 0 12px 30px rgba(0,0,0,.35);">BUKAN SEBAB</div>
    </div>
    <div id="hook-t3wrap" class="abs" style="left:0; right:0; top:478px; display:flex; justify-content:center;">
      <div id="hook-t3" style="position:relative; display:flex; align-items:center; gap:18px; font-weight:900; font-size:76px; text-shadow: 0 6px 24px rgba(0,0,0,.55);">
        <span class="ico" style="width:72px; height:72px; display:inline-block;">{ICON['drop']}</span>KURANG MINUM AIR
        <div id="hook-strike" style="position:absolute; left:-12px; right:-12px; top:50%; height:12px; margin-top:-6px; background:#ef3b3b; border-radius:6px; transform-origin:0 50%; transform: scaleX(0);"></div>
      </div>
    </div>
"""
s0 = h0
script = f"""      // frame 0: the hook line is already on screen over the cracked-heel shot
      tl.fromTo(q('#hook-t1'), {{ scale: 1.05 }}, {{ scale: 1, duration: 0.5, ease: 'expo.out' }}, 0);
      tl.fromTo(q('#hook-img'), {{ scale: 1.14 }}, {{ scale: 1.04, duration: {L(t_bukan, s0)}, ease: 'none' }}, 0);
      // flash cut from the heel to the speaker on "bukan"
      tl.set(q('#hook-flash'), {{ opacity: 0.85 }}, {L(t_bukan - 0.07, s0)});
      tl.set(q('#hook-broll'), {{ opacity: 0 }}, {L(t_bukan - 0.03, s0)});
      tl.to(q('#hook-flash'), {{ opacity: 0, duration: 0.18, ease: 'power2.out' }}, {L(t_bukan, s0)});
{stamp('#hook-t2', L(t_bukan, s0), -3)}      tl.fromTo(q('#hook-t3'), {{ y: 30, opacity: 0, filter: 'blur(8px)' }}, {{ y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power4.out' }}, {L(t_kurang, s0)});
      tl.to(q('#hook-strike'), {{ scaleX: 1, duration: 0.24, ease: 'power3.inOut' }}, {L(t_je, s0)});
      tl.to(q('#hook-t3'), {{ opacity: 0.55, duration: 0.2 }}, {L(t_je + 0.24, s0)});
{out_all('#hook-t1, #hook-t2wrap, #hook-t3wrap, .scrim', L(h1 - 0.2, s0), 0.18)}"""
hosts.append(scene("hook", h0, h1, body, script))
S("impact-bass-1", 0.0 + 0.04, 0.16)
S("whoosh", t_bukan - 0.05, 0.28)
S("pop", t_bukan, 0.55)
S("whoosh-short", t_je, 0.22)

# ======================= 2. PUNCA (cause) =======================
p0 = EDL[1]["out"]; p1 = W("itu", 9.4)
t_punca = W("punca", 3.6); t_kulit = W("kulit", 4.9); t_tek = W("tekanan", 7.2); t_ges = W("geseran", 7.8)
body = f"""    <div class="scrim"></div>
    <div id="pc-kick" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:196px; height:70px; font-size:36px; background:#ffd36b; color:#1b1405; letter-spacing:.06em;">PUNCA SEBENAR</div>
    <div id="pc-main" class="glass abs" style="left:90px; right:90px; top:296px; height:150px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:96px; letter-spacing:-0.01em;">KULIT <span style="color:#ffd36b; margin-left:24px;">KERING</span></div>
    <div id="pc-c1" class="chip glass" style="left:120px; top:480px; border-radius:46px;"><span style="color:#ffd36b">+</span>TEKANAN</div>
    <div id="pc-c2" class="chip glass" style="right:120px; top:480px; border-radius:46px;"><span style="color:#ffd36b">+</span>GESERAN</div>
"""
s0 = p0
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, 0);
{pop_in('#pc-kick', L(t_punca, s0), 'y: -30', 'expo.out', 0.35)}{pop_in('#pc-main', L(t_kulit, s0), 'scale: 0.7', 'back.out(1.5)', 0.42)}{pop_in('#pc-c1', L(t_tek, s0), 'x: -80', 'expo.out', 0.36)}{pop_in('#pc-c2', L(t_ges, s0), 'x: 80', 'expo.out', 0.36)}{out_all('#pc-kick, #pc-main, #pc-c1, #pc-c2, .scrim', L(p1 - 0.24, s0))}"""
hosts.append(scene("punca", p0, p1, body, script))
S("whoosh", t_punca, 0.2); S("pop", t_kulit, 0.6); S("click-soft", t_tek, 0.7); S("pop", t_ges, 0.5)

# ======================= 3. SUMBER (Cleveland Clinic) =======================
c0 = p1; c1 = EDL[3]["out"]
t_cl = W("cleveland", 10.6); t_th = W("2025", 12.5)
body = f"""    <div class="scrim"></div>
    <div id="cc-card" class="card" style="left:150px; top:196px; width:780px; height:360px;">
      <img src="assets/img/cleveland.jpg" alt="Cleveland Clinic" style="object-position:50% 72%;" />
    </div>
    <div id="cc-lbl" class="chip glass" style="left:0; right:0; margin:0 auto; width:max-content; top:586px; height:80px; font-size:38px;">PAKAR CLEVELAND CLINIC, AS <span id="cc-yr" style="color:#ffd36b">· 2025</span></div>
"""
s0 = c0
t_in = max(L(t_cl - 0.35, s0), 0.05)
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {t_in});
      tl.fromTo(q('#cc-card'), {{ y: -60, rotation: -6, opacity: 0, filter: 'blur(12px)' }}, {{ y: 0, rotation: -2, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out' }}, {t_in});
{pop_in('#cc-lbl', L(t_cl + 0.1, s0), 'y: 40', 'expo.out', 0.35)}      tl.fromTo(q('#cc-yr'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15 }}, {L(t_th, s0)});
      tl.fromTo(q('#cc-yr'), {{ opacity: 0 }}, {{ opacity: 0 }}, 0);
{out_all('#cc-card, #cc-lbl, .scrim', L(c1 - 0.24, s0))}"""
hosts.append(scene("sumber", c0, c1, body, script))
S("whoosh", t_cl - 0.3, 0.26); S("click-soft", t_th, 0.6)

# ======================= 4. SOALAN (what to do?) =======================
q0 = c1; q1 = W("pertama", 15.0) + 0.3
t_jadi = W("jadi", 13.6); t_buat = W("buat", 14.5)
words4 = ["JADI,", "APA", "NAK", "BUAT?"]
body = '    <div class="scrim"></div>\n    <div id="qa-line" class="abs" style="left:0; right:0; top:236px; text-align:center; white-space:nowrap; font-weight:900; font-size:88px; letter-spacing:-0.02em; text-shadow:0 8px 30px rgba(0,0,0,.5);">' + \
    " ".join(f'<span class="qw" style="display:inline-block">{w}</span>' for w in words4) + \
    '</div>\n    <div id="qa-badge" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:390px; height:110px; font-size:64px; background:linear-gradient(140deg,#ffd978,#e9a92a); color:#1b1405; border-radius:56px;">5 CARA ATASI</div>\n'
s0 = q0
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2 }}, 0);
      tl.fromTo(document.querySelectorAll('[data-composition-id="soalan"] .qw'), {{ opacity: 0, filter: 'blur(8px)' }}, {{ opacity: 1, filter: 'blur(0px)', duration: 0.14, stagger: 0.09, ease: 'power2.out' }}, {L(t_jadi, s0)});
{pop_in('#qa-badge', L(t_jadi + 0.3, s0), 'scale: 0.4', 'back.out(1.8)', 0.4)}{out_all('#qa-line, #qa-badge', L(q1 - 0.2, s0), 0.16)}{out_all('.scrim', L(q1 - 0.5, s0), 0.2)}"""
hosts.append(scene("soalan", q0, q1, body, script))
S("whoosh-short", t_jadi, 0.18); S("ping", t_jadi + 0.3, 0.45)

# ======================= 5. TIPS =======================
def header(n, title_html):
    return f'    <div class="scrim"></div>\n    <div id="hdr{n}" class="hdr glass"><div class="num">{n}</div><div class="ttl">{title_html}</div></div>\n'

# --- tip 1: krim ---
t1a = W("pertama", 15.0); t1b = W("kedua", 25.8)
t_mandi = W("lagi", 17.7); t_aad = W("pakar", 21.0); t_urea = W("urea", 25.3); t_pilih = W("pilih", 24.2)
body = header(1, 'SAPU <em>KRIM</em> SETIAP MALAM') + f"""    <div id="t1-chip" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:380px; background:#9fd8c8; color:#0b2b27;">{ICON['checkDark']}LAGI BAGUS LEPAS MANDI</div>
    <div id="t1-aad" class="abs" style="left:110px; top:350px; width:250px; text-align:center;">
      <div class="card" style="position:relative; width:250px; height:250px; border-radius:50%;"><img src="assets/img/aad.jpg" alt="AAD" style="object-fit:contain; padding:8px;" /></div>
      <div style="margin:12px auto 0; width:max-content; padding:4px 16px 6px; border-radius:12px; background:rgba(9,36,34,.9); font-weight:800; font-size:30px;">PAKAR KULIT AAD</div>
    </div>
    <div id="t1-urea" class="card" style="left:420px; top:350px; width:550px; height:290px;">
      <img src="assets/img/urea.jpg" alt="Urea" style="object-fit:contain; padding:10px 120px 60px;" />
      <div class="lbl" style="background:#0b2b27; font-size:38px;">PILIH KRIM ADA <span style="color:#ffd36b">UREA</span></div>
    </div>
"""
s0 = t1a
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{enter_hdr('#hdr1')}{pop_in('#t1-chip', L(t_mandi, s0), 'y: 30', 'expo.out', 0.35)}{out_all('#t1-chip', L(t_aad - 0.2, s0), 0.18)}{pop_in('#t1-aad', L(t_aad, s0), 'scale: 0.6', 'back.out(1.6)', 0.42)}{pop_in('#t1-urea', L(t_pilih, s0), 'x: 120', 'expo.out', 0.42)}      tl.fromTo(q('#t1-urea .lbl span'), {{ color: '#ffffff' }}, {{ color: '#ffd36b', duration: 0.15 }}, {L(t_urea, s0)});
{out_all('#hdr1, #t1-aad, #t1-urea, .scrim', L(t1b - 0.22, s0), 0.2)}"""
hosts.append(scene("tip1", t1a, t1b, body, script))
S("whoosh", t1a, 0.28); S("click-soft", t_mandi, 0.65); S("pop", t_aad, 0.55); S("pop", t_pilih, 0.45); S("ping", t_urea, 0.35)

# --- tip 2: kasut ---
t2a = t1b; t2b = W("ketiga", 35.0)
t_sel = W("selipak", 27.3); t_sok = W("sokongan", 30.5); t_pil = W("pilihlah", 31.9); t_ber = W("bertutup", 32.8)
def shoe(id_, x, img, label, pos="50% 50%"):
    return f"""    <div id="{id_}" class="abs" style="left:{x}px; top:350px; width:290px; height:290px;">
      <div class="card" style="left:0; top:0; width:290px; height:290px;"><img src="assets/img/{img}" alt="{label}" style="object-position:{pos};" /><div class="lbl">{label}</div></div>
    </div>
"""
body = header(2, 'PILIH <em>KASUT</em> YANG BETUL') + shoe("t2-a", 66, "selipar.jpg", "SELIPAR") + shoe("t2-b", 395, "kasut-tutup.jpg", "TUTUP TUMIT", "50% 60%") + shoe("t2-c", 724, "sandal.jpg", "ADA TALI TUMIT", "70% 70%") + \
f"""    <div id="t2-xa" class="badge no" style="left:240px; top:322px;">{ICON['x']}</div>
    <div id="t2-ob" class="badge ok" style="left:569px; top:322px;">{ICON['check']}</div>
    <div id="t2-oc" class="badge ok" style="left:898px; top:322px;">{ICON['check']}</div>
"""
s0 = t2a
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{enter_hdr('#hdr2')}{pop_in('#t2-a', L(t_sel, s0), 'y: 60', 'expo.out', 0.4)}{stamp('#t2-xa', L(t_sok, s0), 0)}      tl.to(q('#t2-a .card'), {{ filter: 'grayscale(1) brightness(.75)', duration: 0.25 }}, {L(t_sok + 0.05, s0)});
{pop_in('#t2-b', L(t_pil, s0), 'y: 60', 'expo.out', 0.4)}{pop_in('#t2-c', L(t_ber, s0), 'y: 60', 'expo.out', 0.4)}{stamp('#t2-ob', L(t_pil + 0.3, s0), 0)}{stamp('#t2-oc', L(t_ber + 0.3, s0), 0)}{out_all('#hdr2, #t2-a, #t2-b, #t2-c, #t2-xa, #t2-ob, #t2-oc, .scrim', L(t2b - 0.22, s0), 0.2)}"""
hosts.append(scene("tip2", t2a, t2b, body, script))
S("whoosh", t2a, 0.26); S("pop", t_sel, 0.5); S("impact-bass-1", t_sok, 0.1); S("pop", t_pil, 0.45); S("ping", t_pil + 0.3, 0.3); S("click-soft", t_ber, 0.6); S("ping", t_ber + 0.3, 0.3)

# --- tip 3: rendam ---
t3a = t2b; t3b = W("keempat", 44.7)
t_lima = W("lima", 37.1); t_garam = W("garam", 38.7); t_belum = W("belum", 41.8)
body = header(3, 'RENDAM KAKI <em>AIR SUAM</em>') + f"""    <div id="t3-time" class="chip" style="left:80px; top:400px; height:120px; border-radius:60px; font-size:64px; background:linear-gradient(140deg,#ffd978,#e9a92a); color:#1b1405;"><span style="width:62px;height:62px;display:inline-block">{ICON['clock']}</span>5–10 MINIT</div>
    <div id="t3-salt" class="card" style="left:620px; top:340px; width:330px; height:300px;"><img src="assets/img/epsom.jpg" alt="Garam" style="object-position:55% 60%;" /><div class="lbl">GARAM</div></div>
    <div id="t3-stamp" class="abs" style="left:560px; top:450px; width:450px; text-align:center; font-weight:900; font-size:46px; color:#fff; background:#ef3b3b; border:5px solid #fff; border-radius:14px; padding:8px 0 10px; box-shadow:0 12px 28px rgba(0,0,0,.4);">BELUM TERBUKTI</div>
"""
s0 = t3a
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{enter_hdr('#hdr3')}{pop_in('#t3-time', L(t_lima, s0), 'scale: 0.5', 'back.out(1.7)', 0.4)}{pop_in('#t3-salt', L(t_garam, s0), 'x: 120', 'expo.out', 0.42)}{stamp('#t3-stamp', L(t_belum, s0), -9)}{out_all('#hdr3, #t3-time, #t3-salt, #t3-stamp, .scrim', L(t3b - 0.22, s0), 0.2)}"""
hosts.append(scene("tip3", t3a, t3b, body, script))
S("whoosh", t3a, 0.26); S("pop", t_lima, 0.55); S("pop", t_garam, 0.45); S("impact-bass-1", t_belum, 0.14)

# --- tip 4: batu apung ---
t4a = t3b; t4b = W("kelima", 51.7)
t_batu = W("batu", 47.0); t_jangan = W("jangan", 48.0); t_diab = W("kalau", 49.6)
body = header(4, 'GOSOK GUNA <em>BATU APUNG</em>') + f"""    <div id="t4-img" class="card" style="left:66px; top:350px; width:330px; height:290px;"><img src="assets/img/batu-apung.jpg" alt="Batu apung" style="object-position:55% 60%;" /><div class="lbl">PERLAHAN-LAHAN</div></div>
    <div id="t4-c1" class="chip glass" style="left:430px; top:356px; height:96px; font-size:40px;">JANGAN KUAT SANGAT!</div>
    <div id="t4-warn" class="abs" style="left:430px; top:476px; width:584px; height:164px; border-radius:26px; background:#ffc93c; color:#2a1a00; display:flex; align-items:center; gap:20px; padding:0 26px; box-shadow:0 14px 34px rgba(0,0,0,.35);">
      <span style="width:84px; height:84px; flex:none;">{ICON['warn']}</span>
      <div style="font-weight:900; font-size:40px; line-height:1.08;">ADA DIABETES?<br/><span style="font-size:34px; font-weight:800;">TANYA DOKTOR DULU</span></div>
    </div>
"""
s0 = t4a
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{enter_hdr('#hdr4')}{pop_in('#t4-img', L(t_batu, s0), 'y: 60', 'expo.out', 0.42)}{pop_in('#t4-c1', L(t_jangan, s0), 'x: 80', 'expo.out', 0.36)}{pop_in('#t4-warn', L(t_diab, s0), 'scale: 0.6', 'back.out(1.6)', 0.42)}{out_all('#hdr4, #t4-img, #t4-c1, #t4-warn, .scrim', L(t4b - 0.22, s0), 0.2)}"""
hosts.append(scene("tip4", t4a, t4b, body, script))
S("whoosh", t4a, 0.26); S("pop", t_batu, 0.5); S("click-soft", t_jangan, 0.65); S("notification", t_diab, 0.3)

# --- tip 5: air ---
t5a = t4b; t5b = W("tapi", 58.25)
t_enam = W("enam", 53.8); t_kkm = W("kementerian", 56.1)
glasses = "".join(f'<div class="gl" style="width:96px; height:144px;">{GLASS_SVG}</div>' for _ in range(8))
body = header(5, 'MINUM <em>AIR</em> SECUKUPNYA') + f"""    <div id="t5-row" class="abs" style="left:0; right:0; top:344px; display:flex; justify-content:center; gap:14px;">{glasses}</div>
    <div id="t5-lbl" class="abs" style="left:0; right:0; top:500px; text-align:center; font-weight:900; font-size:56px; text-shadow:0 6px 20px rgba(0,0,0,.55);"><span style="color:#ffd36b">6–8 GELAS</span> SEHARI</div>
    <div id="t5-kkm" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:574px; height:76px; padding:0 26px 0 8px; font-size:30px; background:#fff; color:#1a1a1a;"><img src="assets/img/kkm.jpg" alt="KKM" style="width:64px; height:64px; border-radius:50%; object-fit:cover;" />PANDUAN KEMENTERIAN KESIHATAN MALAYSIA</div>
"""
s0 = t5a
fill_start = L(t_enam, s0)
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{enter_hdr('#hdr5')}      const gl = document.querySelectorAll('[data-composition-id="tip5"] .gl');
      const wt = document.querySelectorAll('[data-composition-id="tip5"] .water');
      tl.fromTo(gl, {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'expo.out' }}, {round(fill_start - 0.35, 3)});
      tl.fromTo(wt, {{ scaleY: 0, transformOrigin: '50% 100%' }}, {{ scaleY: 1, duration: 0.25, stagger: 0.12, ease: 'power2.out' }}, {fill_start});
      tl.to(Array.from(gl).slice(6), {{ opacity: 0.55, duration: 0.2 }}, {round(fill_start + 1.2, 3)});
{pop_in('#t5-lbl', fill_start + 0.1, 'y: 30', 'expo.out', 0.35)}{pop_in('#t5-kkm', L(t_kkm, s0), 'y: 30', 'expo.out', 0.38)}{out_all('#hdr5, #t5-row, #t5-lbl, #t5-kkm, .scrim', L(t5b - 0.2, s0), 0.18)}"""
hosts.append(scene("tip5", t5a, t5b, body, script))
S("whoosh", t5a, 0.26); S("pop", t_enam, 0.5); S("click-soft", t_kkm, 0.6)

# ======================= 6. CALLBACK =======================
k0 = t5b; k1 = W("kalau", 62.1)
t_air = W("air", 59.4); t_tak = W("tak", 59.8); t_krim = W("krim", 60.5)
body = """    <div class="scrim"></div>
    <div id="cb-l1" class="abs" style="left:0; right:0; top:210px; text-align:center; white-space:nowrap; font-weight:900; font-size:82px; letter-spacing:-0.02em; text-shadow:0 8px 28px rgba(0,0,0,.55);">AIR JE <span id="cb-tak" style="display:inline-block; color:#fff; background:#ef3b3b; padding:0 22px 6px; border-radius:16px;">TAK CUKUP</span></div>
    <div id="cb-l2" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:370px; height:124px; border-radius:62px; font-size:66px; background:linear-gradient(140deg,#ffd978,#e9a92a); color:#1b1405;">""" + f'<span style="width:60px;height:60px;display:inline-block">{ICON["checkDark"]}</span>' + """KRIM TETAP KENA ADA</div>
"""
s0 = k0
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
      tl.fromTo(q('#cb-l1'), {{ y: -30, opacity: 0, filter: 'blur(10px)' }}, {{ y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power4.out' }}, {L(t_air - 0.1, s0)});
{stamp('#cb-tak', L(t_tak, s0), -4)}{pop_in('#cb-l2', L(t_krim, s0), 'scale: 0.4', 'back.out(1.7)', 0.42)}{out_all('#cb-l1, #cb-l2, .scrim', L(k1 - 0.22, s0), 0.2)}"""
hosts.append(scene("callback", k0, k1, body, script))
S("whoosh-short", t_air - 0.1, 0.18); S("impact-bass-1", t_tak, 0.15); S("ping", t_krim, 0.45)

# ======================= 7. SPA (CTA) =======================
sp0 = k1; sp1 = W("jangan", 75.0)
t_seri = W("seri", 64.2); t_kami = W("kami", 65.4); t_s1 = W("spa", 66.0); t_s2 = W("rendaman", 66.7); t_s3 = W("urutan", 68.1)
t_lembut = W("kaki", 69.6); t_pm = W("pm", 71.7)
def svc(id_, top, text):
    return f'    <div id="{id_}" class="chip glass" style="left:150px; top:{top}px; height:84px; font-size:40px;"><span class="badge ok" style="position:relative; width:56px; height:56px; border-width:4px;">{ICON["check"]}</span>{text}</div>\n'
body = f"""    <div class="scrim" style="height:820px;"></div>
    <div id="sp-logo" class="abs glass" style="left:140px; right:140px; top:200px; height:330px; display:flex; align-items:center; justify-content:center; background:rgba(8,8,8,.86); border-color:rgba(255,211,107,.45);">
      <img src="assets/img/seri-lestari.png" alt="Seri Lestari Spa" style="width:90%; height:90%; object-fit:contain;" />
    </div>
{svc('sp-s1', 330, 'SPA KAKI')}{svc('sp-s2', 432, 'RENDAMAN KAKI')}{svc('sp-s3', 534, 'URUTAN SELURUH BADAN')}    <div id="sp-tag" class="abs" style="left:0; right:0; top:360px; text-align:center; font-weight:900; font-size:66px; line-height:1.1; text-shadow:0 6px 22px rgba(0,0,0,.6);">KAKI <span style="color:#9fd8c8">LEMBUT</span>,<br/>BADAN PUN <span style="color:#ffd36b">LEGA</span></div>
    <div id="sp-pm" class="chip" style="left:0; right:0; margin:0 auto; width:max-content; top:390px; height:120px; border-radius:60px; font-size:60px; background:#0f7a3f; color:#fff;"><span style="width:58px;height:58px;display:inline-block">{ICON['chat']}</span>PM KAMI</div>
    <div id="sp-pm2" class="abs" style="left:0; right:0; top:530px; text-align:center; font-weight:800; font-size:34px; text-shadow:0 4px 14px rgba(0,0,0,.7);">UNTUK PERTANYAAN &amp; MAKLUMAT LANJUT</div>
"""
s0 = sp0
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {L(t_seri - 0.3, s0)});
      tl.fromTo(q('#sp-logo'), {{ scale: 0.7, opacity: 0, filter: 'blur(14px)' }}, {{ scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out' }}, {L(t_seri - 0.08, s0)});
      // logo moves up to make room for the service list
      tl.to(q('#sp-logo'), {{ y: -40, scale: 0.62, duration: 0.5, ease: 'power2.inOut', transformOrigin: '50% 0%' }}, {L(t_kami, s0)});
{pop_in('#sp-s1', L(t_s1, s0), 'x: -80', 'expo.out', 0.36)}{pop_in('#sp-s2', L(t_s2, s0), 'x: -80', 'expo.out', 0.36)}{pop_in('#sp-s3', L(t_s3, s0), 'x: -80', 'expo.out', 0.36)}{out_all('#sp-s1, #sp-s2, #sp-s3', L(t_lembut - 0.2, s0), 0.18)}      tl.fromTo(q('#sp-tag'), {{ opacity: 0, filter: 'blur(8px)' }}, {{ opacity: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power2.out' }}, {L(t_lembut, s0)});
{out_all('#sp-tag', L(t_pm - 0.2, s0), 0.18)}{pop_in('#sp-pm', L(t_pm, s0), 'scale: 0.4', 'back.out(1.8)', 0.4)}      tl.to(q('#sp-pm'), {{ scale: 0.92, duration: 0.08, ease: 'power2.in' }}, {L(t_pm + 0.6, s0)});
      tl.to(q('#sp-pm'), {{ scale: 1, duration: 0.25, ease: 'back.out(2)' }}, {L(t_pm + 0.68, s0)});
{pop_in('#sp-pm2', L(t_pm + 0.3, s0), 'y: 20', 'expo.out', 0.3)}{out_all('#sp-logo, #sp-pm, #sp-pm2, .scrim', L(sp1 - 0.2, s0), 0.18)}"""
hosts.append(scene("spa", sp0, sp1, body, script))
S("sparkle", t_seri, 0.2); S("whoosh-short", t_kami, 0.16); S("pop", t_s1, 0.5); S("click-soft", t_s2, 0.65); S("pop", t_s3, 0.45); S("pop", t_pm, 0.55); S("click-soft", t_pm + 0.6, 0.7)

# ======================= 8. OUTRO =======================
o0 = sp1; o1 = TOTAL
t_save = W("save", 75.7); t_ikut = W("ikuti", 76.2); t_info = W("info", 77.7)
body = f"""    <div class="scrim"></div>
    <div id="ot-logo" class="abs" style="left:300px; right:300px; top:190px; height:150px; border-radius:24px; background:rgba(8,8,8,.86); display:flex; align-items:center; justify-content:center;"><img src="assets/img/seri-lestari.png" alt="Seri Lestari Spa" style="width:92%; height:88%; object-fit:contain;" /></div>
    <div id="ot-save" class="chip" style="left:110px; top:380px; height:120px; border-radius:60px; font-size:54px; background:linear-gradient(140deg,#ffd978,#e9a92a); color:#1b1405;"><span style="width:56px;height:56px;display:inline-block">{ICON['bookmark']}</span>SAVE</div>
    <div id="ot-follow" class="chip" style="right:110px; top:380px; height:120px; border-radius:60px; font-size:54px; background:#ef3b6b; color:#fff;"><span style="width:60px;height:60px;display:inline-block">{ICON['follow']}</span>FOLLOW</div>
    <div id="ot-sub" class="abs" style="left:0; right:0; top:530px; text-align:center; font-weight:800; font-size:36px; text-shadow:0 4px 14px rgba(0,0,0,.7);">UNTUK LEBIH BANYAK INFO MENARIK</div>
"""
s0 = o0
script = f"""      tl.fromTo(q('.scrim'), {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, 0);
{pop_in('#ot-logo', 0.0, 'y: -30', 'expo.out', 0.4)}{pop_in('#ot-save', L(t_save, s0), 'scale: 0.4', 'back.out(1.8)', 0.38)}{pop_in('#ot-follow', L(t_ikut, s0), 'scale: 0.4', 'back.out(1.8)', 0.38)}      tl.to(q('#ot-save'), {{ scale: 0.92, duration: 0.08 }}, {L(t_save + 0.45, s0)});
      tl.to(q('#ot-save'), {{ scale: 1, duration: 0.25, ease: 'back.out(2)' }}, {L(t_save + 0.53, s0)});
      tl.to(q('#ot-follow'), {{ scale: 0.92, duration: 0.08 }}, {L(t_ikut + 0.45, s0)});
      tl.to(q('#ot-follow'), {{ scale: 1, duration: 0.25, ease: 'back.out(2)' }}, {L(t_ikut + 0.53, s0)});
{pop_in('#ot-sub', L(t_save + 0.25, s0), 'y: 20', 'expo.out', 0.3)}"""
hosts.append(scene("outro", o0, o1, body, script))
S("whoosh", o0, 0.22); S("pop", t_save, 0.5); S("click-soft", t_save + 0.45, 0.7); S("pop", t_ikut, 0.45); S("click-soft", t_ikut + 0.45, 0.6)

# ======================= CAPTIONS =======================
FIX = {"selipak": "selipar", "suaum": "suam", "pelan-lahan": "perlahan-lahan", "lima": "5", "sepuluh": "10",
       "enam": "6", "lapan": "8"}
HOT = {"kulit", "kering", "tekanan", "geseran", "krim", "urea", "selipar", "sokongan", "merekah", "bertutup", "suam",
       "5", "10", "bukti", "batu", "apung", "pedih", "diabetes", "doktor", "6", "8", "gelas", "cukup", "seri", "lestari",
       "spa", "pm", "save", "ikuti", "lembut", "lega", "cleveland", "clinic", "2025", "dermatology", "malaysia", "kering"}
cap_words = []
for w in WORDS:
    if w["start"] < EDL[1]["out"] - 0.05:  # hook is carried by the title
        continue
    raw = w["text"]
    core = norm(raw) if raw != "pelan-lahan" else "pelan-lahan"
    disp = FIX.get(raw.lower().strip(".,?!"), raw.strip())
    disp = disp.replace("buat.", "buat?")
    cap_words.append({"text": disp, "start": w["start"], "end": w["end"], "punct": bool(re.search(r"[.,?!]$", raw))})
# monotonic + clamp
for i, w in enumerate(cap_words):
    if i and w["start"] < cap_words[i-1]["start"] + 0.06:
        w["start"] = round(cap_words[i-1]["start"] + 0.06, 3)
    nxt = cap_words[i+1]["start"] if i + 1 < len(cap_words) else TOTAL
    w["end"] = round(min(max(w["end"], w["start"] + 0.1), nxt if nxt > w["start"] else w["end"]), 3)
groups, cur = [], []
for i, w in enumerate(cap_words):
    cur.append(w)
    nxt = cap_words[i+1] if i + 1 < len(cap_words) else None
    gap = (nxt["start"] - w["end"]) if nxt else 9
    chars = sum(len(x["text"]) for x in cur)
    if w["punct"] or gap >= 0.15 or len(cur) >= 3 or chars >= 16 or not nxt:
        groups.append(cur); cur = []
cap_html, cap_js = [], []
CAP0 = round(EDL[1]["out"] - 0.1, 3)  # captions host start (hook carried by the title)
for gi, g in enumerate(groups):
    gs = max(CAP0, g[0]["start"] - 0.05)
    nxt_s = groups[gi+1][0]["start"] - 0.05 if gi + 1 < len(groups) else TOTAL
    ge = min(g[-1]["end"] + 0.3, nxt_s)
    spans = []
    for wi, w in enumerate(g):
        txt = w["text"].upper().rstrip(".,!")
        hot = norm(w["text"]) in HOT or w["text"].lower().strip(".,?!") in HOT
        spans.append(f'<span id="cw{gi}-{wi}" class="cw{" hot" if hot else ""}">{txt}</span>')
    cap_html.append(f'    <div id="cg{gi}" class="cg">{" ".join(spans)}</div>')
    cap_js.append(f"      tl.fromTo(q('#cg{gi}'), {{ opacity: 0, scale: 0.86, y: 14 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.14, ease: 'back.out(2)' }}, {gs - CAP0:.3f});")
    for wi, w in enumerate(g):
        cap_js.append(f"      tl.fromTo(q('#cw{gi}-{wi}'), {{ color: 'rgba(255,255,255,0.78)', scale: 1 }}, {{ color: '{'#ffd36b' if spans[wi].find('hot') > 0 else '#ffffff'}', scale: 1.08, duration: 0.08, ease: 'power2.out' }}, {max(gs, w['start']) - CAP0:.3f});")
        cap_js.append(f"      tl.to(q('#cw{gi}-{wi}'), {{ scale: 1, duration: 0.12, ease: 'power2.out' }}, {max(gs, w['start']) + 0.1 - CAP0:.3f});")
    cap_js.append(f"      tl.to(q('#cg{gi}'), {{ opacity: 0, duration: 0.08, ease: 'power2.in' }}, {ge - 0.08 - CAP0:.3f});")
    cap_js.append(f"      tl.set(q('#cg{gi}'), {{ opacity: 0, visibility: 'hidden' }}, {ge - CAP0:.3f});")
cap_css = """
    .cg { position: absolute; left: 0; right: 0; top: 1218px; padding: 0 70px; text-align: center; opacity: 0; font-weight: 900; font-size: 74px; line-height: 1.12; letter-spacing: 0.005em; }
    .cw { display: inline-block; color: rgba(255,255,255,0.78); text-transform: uppercase;
          text-shadow: 0 0 2px #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 4px 0 #000, 0 -4px 0 #000, 4px 0 0 #000, -4px 0 0 #000, 0 10px 24px rgba(0,0,0,.6); }
"""
os.makedirs(f"{ROOT}/compositions", exist_ok=True)
open(f"{ROOT}/compositions/captions.html", "w").write(f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; font-family: 'Montserrat', sans-serif; }}
{cap_css}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(cap_html)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      const q = (s) => document.querySelector('[data-composition-id="captions"] ' + s);
{chr(10).join(cap_js)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
""")

# ======================= INDEX =======================
# punch-in camera: alternate framing on every jump cut, plus emphasis punches
ZOOM = []
for i, e in enumerate(EDL):
    ZOOM.append((e["out"], 1.0 if i % 2 == 0 else 1.11))
ZOOM += [(t_bukan, 1.13), (t_tak, 1.2), (t_seri, 1.08)]
ZOOM.sort()
vids = []
for i, e in enumerate(EDL):
    vids.append(f'''        <video id="v{i:02d}" class="clip cam-v" src="assets/footage/talk.mp4" data-start="{e['out']:.3f}" data-duration="{e['dur']:.3f}" data-media-start="{e['src']:.3f}" data-track-index="0" data-has-audio="true" data-volume="0.6" data-fade-in="0.02" data-fade-out="0.02" playsinline></video>''')
SFX_LEN = {"pop": 0.72, "click-soft": 0.366, "impact-bass-1": 2.116, "notification": 2.456, "ping": 1.32,
           "sparkle": 1.802, "whoosh": 0.575, "whoosh-short": 0.575}
aud = []; lanes = []  # greedy lane packing so no two sfx overlap on one track
for i, (name, t, vol) in enumerate(sorted(sfx, key=lambda x: x[1])):
    d = min(SFX_LEN[name], round(TOTAL - t, 3))
    lane = next((k for k, end in enumerate(lanes) if end <= t), None)
    if lane is None:
        lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = t + d
    aud.append(f'    <audio id="sfx{i:02d}" class="clip" src="assets/sfx/{name}.mp3" data-start="{t:.3f}" data-duration="{d:.3f}" data-track-index="{5 + lane}" data-volume="{round(vol * 0.6, 3)}"></audio>')
host_html = []
for k, (cid, st, du) in enumerate(hosts):
    host_html.append(f'    <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{2 + k % 2}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:{10 + k}"></div>')
cap_start = CAP0
zoom_js = "\n".join(f"      tl.set('#cam', {{ scale: {z} }}, {t:.3f});" for t, z in ZOOM)
index = f"""<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Tumit Pecah — Seri Lestari Spa</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #000; font-family: 'Montserrat', sans-serif; }}
      #stage {{ position: absolute; inset: 0; overflow: hidden; z-index: 1; }}
      #cam {{ position: absolute; inset: 0; transform-origin: 50% 50%; }}
      .cam-v {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-fps="{FPS}" data-width="1080" data-height="1920">
      <div id="stage">
        <div id="cam" data-layout-allow-overflow>
{chr(10).join(vids)}
        </div>
      </div>
{chr(10).join(host_html)}
    <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="{cap_start:.3f}" data-duration="{TOTAL - cap_start:.3f}" data-track-index="4" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:40"></div>
{chr(10).join(aud)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      // camera: framing alternates on each jump cut; hard punch-ins on emphasis words
      tl.fromTo('#cam', {{ scale: 1 }}, {{ scale: 1, duration: 0.01 }}, 0);
{zoom_js}
      tl.set({{}}, {{}}, {TOTAL:.3f});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
open(f"{ROOT}/index.html", "w").write(index)
json.dump({"hosts": hosts, "sfx": sfx, "zoom": ZOOM, "groups": len(groups)}, open("gen_summary.json", "w"), indent=1)
print("hosts", hosts)
print("sfx", len(sfx), "caption groups", len(groups), "total", TOTAL)
