#!/usr/bin/env python3
"""Generate the bundled fixed-line Kokoro audio (CPU, no hosted TTS API).
Run with --help. Full model/voice downloads stay OUTSIDE the website package.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, importlib.metadata, json, os
from pathlib import Path
import subprocess, tempfile, time, urllib.request

# Official process-lifetime opt-out BEFORE importing/initializing ONNX Runtime.
# https://github.com/microsoft/onnxruntime/blob/main/docs/Privacy.md
os.environ["ORT_DISABLE_TELEMETRY"] = "1"

ROOT = Path(__file__).resolve().parents[1]
MODEL_REVISION = "f3ff3571791e39611d31c381e3a41a3af07b4987"
BASE_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/"
ASSETS = {
    "kokoro-v1.0.onnx": {"sha256": "beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a"},
    "voices-v1.0.bin": {"sha256": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"}
}
VOICES = [
    ("zf_xiaobei", "Xiaobei", "zh", "female"),
    ("zf_xiaoyi", "Xiaoyi", "zh", "female"),
    ("zm_yunxi", "Yunxi", "zh", "male"),
    ("zm_yunjian", "Yunjian", "zh", "male"),
    ("af_heart", "Heart", "en", "female"),
    ("af_bella", "Bella", "en", "female"),
    ("am_michael", "Michael", "en", "male"),
    ("am_puck", "Puck", "en", "male"),
]

def sha256(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""): h.update(chunk)
    return h.hexdigest()

def download(cache):
    cache.mkdir(parents=True, exist_ok=True)
    for name, info in ASSETS.items():
        target = cache / name
        if target.is_file() and sha256(target) == info["sha256"]: continue
        tmp = target.with_suffix(target.suffix + ".download")
        urllib.request.urlretrieve(BASE_URL + name, tmp)
        if sha256(tmp) != info["sha256"]:
            raise RuntimeError(f"Checksum mismatch: {name}; upstream release may have changed.")
        tmp.replace(target)

def phrases():
    code = """import {curriculumById} from './data/curricula.js';
const data=curriculumById.cheng37.moves.map((m,i)=>({id:String(i+1).padStart(2,'0'),name:m.name}));
data.push({id:'test',name:{'zh-TW':'請放鬆肩膀，準備開始練習。','zh-CN':'请放松肩膀，准备开始练习。',en:'Relax your shoulders. Get ready to practise.'}});
console.log(JSON.stringify(data));"""
    return json.loads(subprocess.check_output(["node", "--input-type=module", "-e", code], cwd=ROOT, text=True))

def worker(args):
    (voice, label, lang, gender), rows, cache_str, out_str, threads = args
    import numpy as np
    import onnxruntime as ort
    ort.disable_telemetry_events()
    import soundfile as sf
    from kokoro_onnx import Kokoro
    cache, out = Path(cache_str), Path(out_str)
    options = ort.SessionOptions()
    options.intra_op_num_threads = threads
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(str(cache / "kokoro-v1.0.onnx"), sess_options=options,
                                   providers=["CPUExecutionProvider"])
    kokoro = Kokoro.from_session(session, str(cache / "voices-v1.0.bin"))
    if voice not in kokoro.voices: raise RuntimeError(f"Missing official speaker: {voice}")
    g2p = None
    if lang == "zh":
        from misaki import zh
        from pypinyin import load_single_dict
        # Tai chi's 掤 is peng2; general dictionaries can use the ordinary bing1.
        load_single_dict({ord("掤"): "péng", ord("拗"): "ào"})
        g2p = zh.ZHG2P()
    destination = out / voice
    destination.mkdir(parents=True, exist_ok=True)
    bank = {"id": "kokoro:" + voice, "name": label, "lang": lang,
            "actualLang": "zh-CN" if lang == "zh" else "en-US", "gender": gender,
            "source": "Kokoro-82M v1.0", "sourceVoice": voice, "synthetic": True,
            "priority": 20 if voice in ["zf_xiaobei", "af_heart"] else 10,
            "testText": rows[-1]["name"]["zh-TW" if lang == "zh" else "en"],
            "clips": {}}
    records = []
    for row in rows:
        filename = destination / (row["id"] + ".mp3")
        spoken = row["name"]["zh-CN" if lang == "zh" else "en"].replace("・", "，" if lang == "zh" else ", ")
        if row["id"] != "test": spoken = ("下一式，" + spoken + "。") if lang == "zh" else ("Next movement, " + spoken + ".")
        # A brief context prefix mitigates Kokoro's documented short-utterance weakness.
        phonemes = g2p(spoken)[0] if g2p else kokoro.tokenizer.phonemize(spoken, "en-us")
        tokens = kokoro.tokenizer.tokenize(phonemes)
        if not 1 <= len(tokens) < 500: raise RuntimeError(f"Invalid phoneme length: {voice}/{row['id']}")
        if not filename.exists():
            names = {entry.name: entry.type for entry in session.get_inputs()}
            speed_type = np.float32 if names["speed"] == "tensor(float)" else np.int32
            # Read graph types explicitly. Some old wrapper versions incorrectly cast speed to int32.
            feed = {("input_ids" if "input_ids" in names else "tokens"): np.array([[0, *tokens, 0]], dtype=np.int64),
                    "style": np.array(kokoro.voices[voice][len(tokens)], dtype=np.float32),
                    "speed": np.array([.92 if lang == "zh" else .94], dtype=speed_type)}
            samples = session.run(None, feed)[0].flatten()
            if not np.isfinite(samples).all() or np.sqrt(np.mean(samples * samples)) < .001:
                raise RuntimeError(f"Silent/nonfinite generated audio: {voice}/{row['id']}")
            with tempfile.TemporaryDirectory(prefix="smartaction-tts-") as tmp:
                wav = Path(tmp) / "voice.wav"
                sf.write(wav, samples, 24000)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ac", "1", "-ar", "24000",
                                "-codec:a", "libmp3lame", "-b:a", "64k", "-map_metadata", "-1", str(filename)], check=True)
        # Decode the MP3 that ships, not just the pre-encoding waveform.
        pcm = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(filename), "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "1", "-ar", "24000", "pipe:1"])
        decoded = np.frombuffer(pcm, dtype="<f4")
        rms = float(np.sqrt(np.mean(decoded * decoded)))
        if not len(decoded) or not np.isfinite(decoded).all() or rms < .001: raise RuntimeError(f"Unplayable/silent MP3: {filename}")
        path = "assets/audio-natural/" + voice + "/" + filename.name
        aliases = [row["name"]["en"]] if lang == "en" else list(dict.fromkeys([row["name"]["zh-TW"],row["name"]["zh-CN"]]))
        for text in aliases: bank["clips"][text] = path
        records.append({"id": row["id"], "path": path, "aliases": aliases, "spokenText": spoken,
                        "phonemes": phonemes, "sha256": sha256(filename), "bytes": filename.stat().st_size,
                        "durationSeconds": round(len(decoded) / 24000, 5), "decodedRMS": round(rms, 7),
                        "decodedPeak": round(float(np.max(np.abs(decoded))), 7), "sampleRate": 24000})
        print(f"{voice} {row['id']} {len(decoded)/24000:.2f}s", flush=True)
    return bank, records

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, default=Path.home() / ".cache" / "smartaction-kokoro-v1")
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--threads", type=int, default=2)
    parser.add_argument("--verify-only", action="store_true", help="Verify shipped MP3 hashes without loading the generation engine")
    opts = parser.parse_args()
    if opts.verify_only:
        doc=json.loads((ROOT / "data/natural-voices-v4.json").read_text())
        files=[r for b in doc["banks"] for r in b["records"]]
        for record in files:
            if sha256(ROOT / record["path"]) != record["sha256"]: raise RuntimeError("Audio checksum failed: " + record["path"])
        print(f"Verified {len(files)} natural-voice MP3 files."); return
    if not 1 <= opts.workers <= 8 or not 1 <= opts.threads <= 8: parser.error("workers and threads must be 1..8")
    download(opts.cache)
    rows = phrases()
    output = ROOT / "assets/audio-natural"
    jobs = [(voice, rows, str(opts.cache), str(output), opts.threads) for voice in VOICES]
    start = time.time()
    with concurrent.futures.ProcessPoolExecutor(max_workers=opts.workers) as pool: results = list(pool.map(worker, jobs))
    banks = [bank for bank, records in results]
    doc = {"version": 4, "model": "hexgrad/Kokoro-82M", "modelRevision": MODEL_REVISION,
           "modelLicense": "Apache-2.0", "releaseTag": "model-files-v1.1", "modelVersion": "v1.0",
           "releaseURL": BASE_URL.removesuffix("/download/model-files-v1.1/") + "/tag/model-files-v1.1",
           "sourceFiles": {name: {"url": BASE_URL + name, **info} for name, info in ASSETS.items()},
           "precision": "float32", "output": "MPEG Audio Layer III; mono 24000 Hz, 64 kbit/s",
           "disclosure": "AI-generated fixed-line speech, not human recordings. Mandarin voices are zh-CN, not Taiwan-accent voice models.",
           "dependencies": {name: importlib.metadata.version(name) for name in ["kokoro-onnx", "onnxruntime", "misaki", "numpy", "soundfile", "pypinyin", "espeakng-loader"]},
           "banks": [{**bank, "records": records} for bank, records in results]}
    (ROOT / "data/natural-voices-v4.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "data/natural-voices-v4.js").write_text("// AI-generated fixed-line Kokoro speech. See docs/NATURAL_VOICE_LICENSES.md.\nexport const naturalVoiceBanks = " + json.dumps(banks, ensure_ascii=False, indent=2) + ";\n")
    print(f"Finished {sum(len(records) for _, records in results)} MP3 files in {time.time()-start:.1f}s", flush=True)

if __name__ == "__main__": main()
