#!/usr/bin/env python3
"""Regenerate 570 fixed speech clips from assets/audio/manifest.json.
Requires espeak-ng 1.51+ and ffmpeg on PATH (both available on macOS/Linux).
For other installs pass --espeak /path/to/espeak-ng --ffmpeg /path/to/ffmpeg.
No cloud TTS request or model download is made. Run from any directory.
"""
import argparse, concurrent.futures, hashlib, json, subprocess, tempfile
from pathlib import Path
from datetime import datetime, timezone

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--espeak',default='espeak-ng');parser.add_argument('--ffmpeg',default='ffmpeg')
    parser.add_argument('--jobs',type=int,default=4)
    args=parser.parse_args();root=Path(__file__).resolve().parent.parent
    manifest_path=root/'assets/audio/manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
    def create(row):
        out=root/row['path'];out.parent.mkdir(parents=True,exist_ok=True)
        if out.suffix!='.mp3' or not out.resolve().is_relative_to((root/'assets/audio').resolve()):raise ValueError('Invalid output path')
        with tempfile.TemporaryDirectory(prefix='taichi-audio-') as td:
            wav=Path(td)/'speech.wav'
            subprocess.run([args.espeak,'-v',row['voice'],'-s','140','-w',str(wav),row['spokenText']],check=True,capture_output=True)
            subprocess.run([args.ffmpeg,'-nostdin','-y','-v','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','48k','-ar','22050',str(out)],check=True,capture_output=True)
        row.update(bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest())
        return row
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(args.jobs,8))) as pool:manifest['files']=list(pool.map(create,manifest['files']))
    manifest['generatedDate']=datetime.now(timezone.utc).date().isoformat()
    version=subprocess.run([args.espeak,'--version'],capture_output=True,text=True,check=True).stdout.strip()
    manifest['regenerationEngineVersion']=version
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    lookup={}
    for row in manifest['files']:lookup.setdefault(row['lang'],{})[row['text']]=row['path']
    (root/'data/localization-v3-audio.js').write_text('/* Fixed generated clips only; not arbitrary text-to-speech. */\nexport const recordedSpeech = '+json.dumps(lookup,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(f"Generated {len(manifest['files'])} clips, {sum(row['bytes'] for row in manifest['files']):,} bytes.")
if __name__=='__main__':main()
