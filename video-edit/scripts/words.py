import sys, json
d = json.load(open(sys.argv[1]))
prev = None
for s in d["segments"]:
    for w in s["words"]:
        gap = "" if prev is None else (f"  <gap {w['s']-prev:.2f}s>" if w['s']-prev > 0.45 else "")
        if gap: print(gap)
        print(f"{w['s']:7.2f} {w['e']:7.2f} {w['p']:.2f} {w['w']}")
        prev = w['e']
