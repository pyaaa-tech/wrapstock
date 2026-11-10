import sys, wave, struct, math
w = wave.open(sys.argv[1]); sr = w.getframerate(); n = w.getnframes()
data = struct.unpack('<%dh' % n, w.readframes(n))
for rng in sys.argv[2:]:
    a, b = map(float, rng.split('-'))
    out = []
    t = a
    while t < b:
        s = data[int(t*sr):int((t+0.02)*sr)]
        r = math.sqrt(sum(x*x for x in s)/max(1,len(s)))
        db = 20*math.log10(max(r,1)/32768)
        out.append(f"{t:.2f}:{int(db)}")
        t += 0.02
    print(rng, ' '.join(out)); print()
