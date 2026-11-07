import sys, json
from faster_whisper import WhisperModel
wav, out, model_name = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv)>3 else "medium")
m = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4)
import wave, numpy as np
_w = wave.open(wav); audio = np.frombuffer(_w.readframes(_w.getnframes()), np.int16).astype(np.float32)/32768.0
segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=False, beam_size=5,
                          condition_on_previous_text=False)
res = {"language": info.language, "prob": info.language_probability, "duration": info.duration, "segments": []}
for s in segs:
    res["segments"].append({"start": s.start, "end": s.end, "text": s.text.strip(),
        "words": [{"w": w.word, "s": w.start, "e": w.end, "p": w.probability} for w in (s.words or [])]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text.strip()}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print("lang", info.language, info.language_probability)
