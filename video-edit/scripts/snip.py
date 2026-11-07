import sys, wave, numpy as np, os
os.environ["HF_HUB_DISABLE_XET"]="1"
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
for spec in sys.argv[1:]:
    f, t0, t1 = spec.split(":"); t0=float(t0); t1=float(t1)
    w = wave.open(f); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
    seg = a[int(t0*16000):int(t1*16000)]
    segs, _ = m.transcribe(seg, language="ms", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    print(spec, "=>", " ".join(f"{w.word.strip()}[{t0+w.start:.2f}-{t0+w.end:.2f}]" for s in segs for w in s.words))
