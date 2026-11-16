# CTC forced alignment of the known transcript with the MMS forced-aligner model.
import json, subprocess, sys, re
import numpy as np, torch, torchaudio
from transformers import Wav2Vec2ForCTC, AutoTokenizer
audio, words_txt, out = sys.argv[1], sys.argv[2], sys.argv[3]
sr = 16000
raw = subprocess.run(["ffmpeg","-v","error","-i",audio,"-f","f32le","-ac","1","-ar",str(sr),"-"],capture_output=True,check=True).stdout
wav = torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy())
name = "MahmoudAshraf/mms-300m-1130-forced-aligner"
tok = AutoTokenizer.from_pretrained(name)
model = Wav2Vec2ForCTC.from_pretrained(name).eval()
vocab = tok.get_vocab()
words = open(words_txt).read().split()
with torch.inference_mode():
    x = (wav - wav.mean()) / (wav.std() + 1e-7)
    logits = model(x[None]).logits[0]
emis = torch.log_softmax(logits, dim=-1)
T = emis.shape[0]; dur = len(wav)/sr; fr = dur / T
blank = vocab.get("<blank>", tok.pad_token_id)
star = vocab.get("<star>")
print("frames", T, "frame dur", fr, "blank", blank, "star", star, "vocab size", len(vocab))
targets, owner = [], []
for wi, w in enumerate(words):
    clean = re.sub(r"[^a-z]", "", w.lower())
    for ch in clean:
        if ch not in vocab: print("missing char", ch); continue
        targets.append(vocab[ch]); owner.append(wi)
tg = torch.tensor([targets], dtype=torch.int32)
ali, scores = torchaudio.functional.forced_align(emis[None], tg, blank=blank)
ali = ali[0].tolist(); scores = scores[0].exp().tolist()
# map frames to target positions
spans = [[None, None, []] for _ in words]
ti = -1; prev = blank
for f, (a, sc) in enumerate(zip(ali, scores)):
    if a != blank:
        if a != prev or prev == blank:
            ti += 1
        wi = owner[ti]
        if spans[wi][0] is None: spans[wi][0] = f
        spans[wi][1] = f
        spans[wi][2].append(sc)
    prev = a
res = []
for w, (a, b, sc) in zip(words, spans):
    res.append({"w": w, "s": round(a*fr, 3), "e": round((b+1)*fr, 3), "conf": round(float(np.mean(sc)), 3)})
    print(f"{w:14s} {a*fr:6.3f} {(b+1)*fr:6.3f} conf {np.mean(sc):.2f}")
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
