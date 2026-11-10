# Tools used to build the edit

- `words_seg.json`: word-level transcript (whisper.cpp medium, Malay, run per speech segment for accurate timing), in source seconds.
- `edl.py`: decides the cuts (fillers, repeated line, pauses of 0.25 s or more trimmed to ~0.18 s) and writes `edl.json` (16 kept clips + words remapped to edited time).
- `gen.py`: writes `index.html` and `compositions/*.html` from `edl.json`; scene timings are tied to spoken words.
- `rms.py`: prints a 20 ms loudness envelope, used to place cuts around the fillers.

Run from a folder that has the project as `tumit/` next to these scripts: `python3 edl.py && python3 gen.py`.
`gen.py` overwrites the HTML, so once the HTML has been edited by hand, keep editing the HTML directly.
