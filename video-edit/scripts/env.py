import sys, wave, numpy as np
w = wave.open(sys.argv[1]); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
hop = 320  # 20ms
n = len(a)//hop
db = 20*np.log10(np.sqrt((a[:n*hop].reshape(n,hop)**2).mean(1))+1e-6)
for spec in sys.argv[2:]:
    t0, t1 = map(float, spec.split(":"))
    i0, i1 = int(t0/0.02), int(t1/0.02)
    print(f"--- {t0}-{t1}")
    print(" ".join(f"{(i*0.02):.2f}:{int(db[i])}" for i in range(i0, min(i1,n))))
