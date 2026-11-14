// Transkripsi voiceover dengan whisper.cpp (bahasa ms) -> scripts/whisper_raw.json
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const to = path.join(process.cwd(), "whisper.cpp");
const model = process.env.WHISPER_MODEL ?? "medium";
const version = "1.5.5";

await installWhisperCpp({ to, version });
await downloadWhisperModel({ model, folder: to });

const wav = path.join(process.cwd(), "scripts", "voiceover16k.wav");
execSync(`ffmpeg -y -v error -i assets/voiceover.mp3 -ar 16000 -ac 1 ${wav}`);

const whisperCppOutput = await transcribe({
  model,
  whisperPath: to,
  whisperCppVersion: version,
  inputPath: wav,
  tokenLevelTimestamps: true,
  language: "ms",
  splitOnWord: true,
});
fs.writeFileSync("scripts/whisper_full.json", JSON.stringify(whisperCppOutput, null, 1));
const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync("scripts/whisper_raw.json", JSON.stringify(captions, null, 1));
console.log("words:", captions.length);
