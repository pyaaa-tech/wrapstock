"""Transcribe the original Malay voice-over with word-level timestamps (faster-whisper)."""
import json, sys
from faster_whisper import WhisperModel
import numpy as np, wave
w = wave.open("audio/source/voiceover_16k.wav"); audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
model_name = sys.argv[1] if len(sys.argv) > 1 else "medium"
m = WhisperModel(model_name, device="cpu", compute_type="int8")
prompt = ("Hai everyone! Hari ini kita bercakap tentang Gamogen daripada House of Healin. "
          "Stichopus horrens, Gamodulin, omega-3, omega-6, flaxseed, vitamin E, vitamin B, chlorella, beta-karotena. "
          "Universiti Sains Malaysia.")
segs, info = m.transcribe(audio, language="ms", word_timestamps=True,
                          initial_prompt=prompt, vad_filter=False, beam_size=5)
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text.strip(),
                "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}", flush=True)
json.dump(out, open(f"project/transcript_raw_{model_name}.json", "w"), ensure_ascii=False, indent=1)
