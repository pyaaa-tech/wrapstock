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
  ("1", "scene 1 starts (hard cut from the outro = loop point)", None, 0),
  ("1", "Si Otak hop", "yoo", None), ("1", "Si Otak hop", "yoo2", None),
  ("1", "HARD PUNCH-IN + DEADLINE slam + shake", "deadline", None),
  ("1", "ESOK! slam + red pulse + shake", "esok", None),
  ("1", "panic squash, alarm rings", "doww", None),
  ("2", "WHIP-PAN lands + TIBA-TIBA letters hop", "tibatiba", None),
  ("2", "eyes turn to sparkles", "rasa", None),
  ("2", "grabs the feather duster + MENGEMAS hops", "mengemas", None),
  ("2", "JADI hops", "jadi", None), ("2", "BEST hops + sparkle burst", "best", None),
  ("3a", "MATCH CUT (same pose, new set)", "haa", None),
  ("3a", "BUKAN", "bukan", None), ("3a", "SEBAB", "sebab", None),
  ("3a", "MALAS slam + shake, strike-through draws on", "malas", None),
  ("3b", "SCALE-THROUGH ZOOM lands + KAJIAN, glasses drop, source caption", "kajian", None),
  ("3b", "PSIKOLOGI", "psikologi", None), ("3b", "TANGGUH", "tangguh", None), ("3b", "KERJA", "kerja", None),
  ("3b", "points at himself", "otak", None), ("3b", "storm cloud", "rasa2", None), ("3b", "swats the cloud", "sekarang", None),
  ("3c", "WHIP-PAN lands + task sheet slams", "tugasan", None),
  ("3c", "BOSAN", "bosan", None), ("3c", "MENAKUTKAN", "menakutkan", None),
  ("3c", "mood bar elastic drop + shake", "jatuh", None),
  ("3c", "TUGAS TAK BEST", "jadi2", None), ("3c", "arrow 1 draws on", "otak2", None),
  ("3c", "LARI! + Si Otak runs", "pilih", None), ("3c", "arrow 2 draws on", "lebih", None),
  ("3c", "LEGA + flop on beanbag", "lega", None), ("3c", "SEKEJAP + tiny clock", "sekejap", None),
  ("4", "WHIP-PAN lands + snowball rolls in", "masalahnya", None),
  ("4", "TUGASAN + snowball grows", "tugasan2", None), ("4", "TAK", "takkan", None),
  ("4", "HILANG slam + shake + grows", "hilang", None), ("4", "snowball opens its eyes", "dia", None),
  ("4", "grows", "lamalama", None), ("4", "pressure meter rises + grows", "tekanan", None),
  ("4", "meter + grows", "semakin", None), ("4", "meter red + biggest + shake", "besar", None),
  ("5", "SCALE-THROUGH ZOOM (through the snowball) lands, see-saw pops", "kononnya", None),
  ("5", "LEGA SEKARANG slides in from the left", "lega2", None),
  ("5", "SUSAH NANTI slams in from the right + shake", "susah", None),
  ("5", "feather duster tempts him", "bila", None), ("5", "?!", "lari", None),
  ("5b", "SMASH CUT: laptop flies open + MULA + shake", "cuba", None),
  ("5b", "KECIL + typing, underline draws on", "sikitsikit", None),
  ("6", "SCALE-THROUGH ZOOM into the laptop timer (match cut)", "tak2", None),
  ("6", "5:00 slam + shake, ticking starts", "lima", None), ("6", "snowball shrinks", "minit", None),
  ("6", "shrinks", "pun2", None), ("6", "pebble squash + confetti", "jadilah", None),
  ("7", "WHIP-PAN lands, Si Otak turns to camera + ADA TAK", "kau3", None),
  ("7", "KAU PUN?", "pun3", None), ("7", "wink", "kan", None),
  ("7", "comment bubble 1", "dapat", None), ("7", "comment bubble 2", "catch", None),
  ("7", "comment bubble 3", "sila", None), ("7", "comment bubble 4 + eyes drift to the duster", "komen", None),
  ("outro", "whip-pan into the cream brand outro (right after the last word)", None, 1312),
  ("outro", "Soyaa Soy logo pops (spring 0.3 -> 1.08 -> 1.0, -9deg -> 0) + bubble 'blup'", None, 1320),
  ("outro", "6 flat pink sparkles twinkle, one every 3 frames", None, 1326),
  ("outro", "logo holds; hard cut back to frame 0", None, 1354),
]
print("| Scene | Event | Word | Voice onset (s) | Frame @30fps |")
print("|---|---|---|---|---|")
for sc, ev, k, fr in CUES:
    if k:
        d, w = by[k]
        print(f"| {sc} | {ev} | {d.strip('.,?!')} | {w['s']:.3f} | {math.floor(w['s']*30)} |")
    else:
        print(f"| {sc} | {ev} | – | {fr/30:.3f} | {fr} |")
