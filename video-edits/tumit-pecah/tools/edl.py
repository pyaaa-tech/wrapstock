import json, re, subprocess
SRC_END = 96.65
sil_txt = subprocess.run(['ffmpeg','-hide_banner','-i','tumit/assets/footage/talk.mp4','-af','silencedetect=noise=-30dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', sil_txt)]
en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', sil_txt)]
sil = list(zip(st, en))
PAD = 0.09
removals = [(0.0, 0.72), (4.02, 8.40), (94.40, SRC_END)]
for a, b in sil:
    if b - a >= 0.25:
        removals.append((a + PAD, b - PAD))
removals.sort()
merged = []
for a, b in removals:
    if merged and a <= merged[-1][1]:
        merged[-1] = (merged[-1][0], max(merged[-1][1], b))
    else:
        merged.append((a, b))
keep = []; t = 0.0
for a, b in merged:
    if a > t: keep.append((round(t,3), round(a,3)))
    t = max(t, b)
if t < SRC_END: keep.append((round(t,3), SRC_END))
keep = [k for k in keep if k[1]-k[0] > 0.05]
out = 0.0; edl = []
for a, b in keep:
    edl.append({'src': a, 'srcEnd': b, 'out': round(out,3), 'dur': round(b-a,3)})
    out += b - a
def map_t(t):
    for e in edl:
        if e['src'] - 1e-6 <= t <= e['srcEnd'] + 1e-6:
            return round(e['out'] + t - e['src'], 3)
    return None
words = json.load(open('words_seg.json'))
mw = []
for a, b, txt in words:
    ma, mb = map_t(a), map_t(b)
    if ma is None and mb is None: continue
    if ma is None: ma = mb - (b-a)
    if mb is None: mb = ma + (b-a)
    mw.append({'text': txt, 'start': ma, 'end': mb, 'src': a})
json.dump({'edl': edl, 'words': mw, 'total': round(out,3)}, open('edl.json','w'), indent=1)
for e in edl: print(e)
print('TOTAL', round(out,2), 'clips', len(edl))
print(' '.join(f"{w['start']:.2f}:{w['text']}" for w in mw))
