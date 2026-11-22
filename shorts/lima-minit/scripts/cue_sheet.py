# Prints the cue sheet: every cut / slam / pop and the voice onset it lands on.
import json, os, math
here = os.path.dirname(os.path.abspath(__file__))
words = json.load(open(os.path.join(here, "../data/aligned.json")))
disp = open(os.path.join(here, "../data/transcript.txt")).read().split()
keys, seen = [], {}
import re
for w in words:
    b = re.sub(r"[^a-z]", "", w["w"].lower()); seen[b] = seen.get(b, 0) + 1
    keys.append(b if seen[b] == 1 else f"{b}{seen[b]}")
by = {k: (d, w) for k, d, w in zip(keys, disp, words)}
CUES = [
  ("1", "Si Otak asleep in bed; dream bubble with the '5 MINIT' gift + 5 MINIT pops", "lima", None),
  ("1", "LAGI...", "lagi", None), ("1", "blissful smile", "rasa", None),
  ("1", "= HADIAH? slam, gift lid pops open + sparkles", "hadiah", None),
  ("2", "SMASH CUT: alarm rings + ALARM slam + shake (music cuts dead)", "alarm", None),
  ("2", "BUNYI!", "bunyi", None), ("2", "arm winds up (anticipation)", "terus", None),
  ("2", "SNOOZE! slam: slaps the snooze button + shake", "cakap", None),
  ("2", "sleepy speech bubble 'Lima minit je lagi...', lullaby returns", "lima2", None),
  ("3", "WHIP-PAN lands, whispered 'shh', dim room", "sebenarnya", None),
  ("3", "brain meter + OTAK", "otak", None), ("3", "BELUM", "belum", None), ("3", "BETUL-BETUL", "betulbetul", None),
  ("3", "ON slam: power button fails (bzzt)", "on", None),
  ("3b", "MATCH CUT: same Si Otak, now dizzy (spiral eyes, orbiting stars)", "orang", None),
  ("3b", "SLEEP slam + shake", "sleep", None), ("3b", "INERTIA", "inertia", None), ("3b", "= RASA MAMAI + fog", "mamai", None),
  ("4", "WHIP-PAN lands, sleep graph pops, line draws on", "lagi3", None), ("4", "TERUK! slam", "teruk", None),
  ("4", "alarm hits at the deepest point + shake", "terbangun", None), ("4", "NYENYAK band pulses", "nyenyak", None),
  ("4", "graph swipes out, timer dial + MAMAI", "mamai2", None), ("4", "HILANG, dial starts sweeping, fog clears", "hilang", None),
  ("4", "+/- 30 MINIT slam", "setengah", None), ("4", "dial keeps going past 30 (+ badge)", "kadangkadang", None),
  ("5", "SCALE-THROUGH ZOOM lands, excited hop", "menariknya", None),
  ("5", "KAJIAN + clipboard + source caption", "kajian", None), ("5", "KECIL: clipboard shrinks", "kecil", None),
  ("5", "SWEDEN pin drops", "sweden", None), ("5", "SNOOZE SEKEJAP + snooze button", "snooze", None),
  ("5", "TAK", "tak", None), ("5", "MEROSAKKAN + check mark draws on", "merosakkan", None),
  ("5b", "WHIP-PAN lands, snooze graph", "mungkin", None), ("5b", "KURANG", "kurang", None),
  ("5b", "TERBANGUN, gentle alarm in light sleep", "terbangun2", None), ("5b", "DARI TIDUR", "dari", None),
  ("5b", "NYENYAK, deepest sleep crossed out", "nyenyak2", None),
  ("6", "SCALE-THROUGH ZOOM lands, thinking", "tapi", None), ("6", "KAJIAN + magnifier", "kajian2", None),
  ("6", "KECIL: the paper shrinks", "kecil2", None), ("6", "JE...", "je2", None),
  ("6", "BELUM MUKTAMAD stamp slam + shake (music stops)", "muktamad", None),
  ("7", "WHIP-PAN lands, dim room, stretch", "lepas2", None), ("7", "BUKA, grabs the curtains", "buka", None),
  ("7", "LANGSIR! curtains whoosh open, sunrise, music returns bright", "langsir", None),
  ("7", "CAHAYA PAGI", "cahaya", None), ("7", "brain meter fills", "bantu", None), ("7", "power ON + ting + sparkles", "sedar", None),
  ("8", "WHIP-PAN lands, DAPAT CATCH UP? + bubble 1", "dapat", None), ("8", "bubble 2", "catch", None),
  ("8", "SILA KOMEN! + bubble 3", "sila", None), ("8", "bubble 4 + wink", "komen", None),
  ("outro", "silent whip-pan into the cream brand outro (right after the last word)", None, 1318),
  ("outro", "Soyaa Soy logo pops (spring 0.3 -> 1.08 -> 1.0, -9deg -> 0) + bubble 'blup'", None, 1326),
  ("outro", "6 flat pink sparkles twinkle, one every 3 frames", None, 1332),
  ("outro", "logo holds; hard cut back to frame 0", None, 1360),
]
print("| Scene | Event | Word | Voice onset (s) | Frame @30fps |")
print("|---|---|---|---|---|")
for sc, ev, k, fr in CUES:
    if k:
        d, w = by[k]
        print(f"| {sc} | {ev} | {d.strip('.,?!')} | {w['s']:.3f} | {math.floor(w['s']*30)} |")
    else:
        print(f"| {sc} | {ev} | – | {fr/30:.3f} | {fr} |")
