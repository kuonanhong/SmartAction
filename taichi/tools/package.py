#!/usr/bin/env python3
"""Generate a relative offline manifest and a small, reproducible core ZIP.
Weights stay separately downloadable with the included verified installer.
"""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SKIP = {'.git', '__pycache__', '.DS_Store', 'node_modules', 'tmp'}

def files():
    return sorted(p for p in ROOT.rglob('*') if p.is_file() and not p.is_symlink()
                  and not any(part in SKIP for part in p.relative_to(ROOT).parts)
                  and not p.name.endswith(('.zip', '.pyc', '.gguf'))
                  and not re.search(r'\.part\d+$', p.name))

def main():
    static = []
    for p in files():
        rel = p.relative_to(ROOT).as_posix()
        if p.suffix in {'.html','.css','.js','.json','.webmanifest','.svg','.jpg','.jpeg','.png','.wasm','.md','.mjs','.task'}:
            if rel.startswith(('tests/','tools/')) or rel in {'package.json','offline-manifest.json'}:
                continue
            static.append(rel)
    (ROOT/'offline-manifest.json').write_text(json.dumps({'version':'2.0.0','files':static},ensure_ascii=False,indent=2)+'\n')
    checksums = {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
                 for p in files() if p.name!='PACKAGE_SHA256.json'}
    (ROOT/'PACKAGE_SHA256.json').write_text(json.dumps(checksums,ensure_ascii=False,indent=2)+'\n')
    destination = ROOT.parent/'SmartAction_Taichi_Game_v2.zip'
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8) as archive:
        for p in files():
            archive.write(p,'SmartAction_Taichi_Game_v2/'+p.relative_to(ROOT).as_posix())
    print(f'Core package: {destination} | {destination.stat().st_size:,} bytes | {len(files())} files')
    print(f'CPU weights are separate. Precache: {len(static)} files.')

if __name__=='__main__':
    main()
