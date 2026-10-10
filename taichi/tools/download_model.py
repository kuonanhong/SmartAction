#!/usr/bin/env python3
"""Download verified Qwen3 weight segments using only Python's standard library."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'models' / 'manifest.json'


def digest_file(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def verify_segments(destination, manifest):
    total_hash = hashlib.sha256()
    for part in manifest['parts']:
        path = destination / part['file']
        if not path.is_file() or path.stat().st_size != part['bytes']:
            raise RuntimeError('模型分片不存在或大小錯誤 / Missing or incorrect model segment: ' + str(path))
        h = hashlib.sha256()
        with path.open('rb') as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                h.update(chunk)
                total_hash.update(chunk)
        if h.hexdigest() != part['sha256']:
            raise RuntimeError('模型分片 SHA-256 不符 / Segment SHA-256 mismatch: ' + path.name)
    if total_hash.hexdigest() != manifest['sha256']:
        raise RuntimeError('模型總 SHA-256 不符 / Full model SHA-256 mismatch')


def download(destination, manifest):
    with tempfile.NamedTemporaryFile(prefix='.smartaction-download-', suffix='.gguf', dir=destination, delete=False) as stream:
        temporary = Path(stream.name)
    downloaded = 0
    try:
        request = urllib.request.Request(manifest['url'], headers={'User-Agent': 'SmartAction-model-downloader/1.0'})
        print('下載約 484 MB，請保持網路連線 / Downloading about 484 MB.', flush=True)
        h = hashlib.sha256()
        last_report = 0
        with urllib.request.urlopen(request, timeout=90) as response, temporary.open('wb') as stream:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                downloaded += len(chunk)
                if downloaded > manifest['bytes']:
                    raise RuntimeError('下載檔案比預期大 / Download larger than expected')
                stream.write(chunk)
                h.update(chunk)
                now = time.monotonic()
                if now - last_report > 1:
                    print(f"  {downloaded / manifest['bytes']:.0%} · {downloaded / 1_000_000:.1f} MB", flush=True)
                    last_report = now
        if downloaded != manifest['bytes'] or h.hexdigest() != manifest['sha256']:
            raise RuntimeError('來源檔案大小或 SHA-256 不符 / Source size or SHA-256 mismatch')
        return temporary
    except BaseException:
        temporary.unlink(missing_ok=True)
        raise


def split_source(source, destination, manifest):
    if source.stat().st_size != manifest['bytes'] or digest_file(source) != manifest['sha256']:
        raise RuntimeError('請提供清單指定的 Qwen3 Q4_K_M 模型 / Wrong model file or SHA-256 mismatch')
    with source.open('rb') as stream:
        for index, part in enumerate(manifest['parts'], 1):
            data = stream.read(part['bytes'])
            if len(data) != part['bytes'] or hashlib.sha256(data).hexdigest() != part['sha256']:
                raise RuntimeError('分片校驗失敗 / Segment verification failed: ' + part['file'])
            target = destination / part['file']
            with tempfile.NamedTemporaryFile(prefix='.segment-', dir=destination, delete=False) as output:
                temporary = Path(output.name)
                output.write(data)
            try:
                os.replace(temporary, target)
            finally:
                temporary.unlink(missing_ok=True)
            print(f"[{index}/{len(manifest['parts'])}] {part['file']} ✓", flush=True)


def main():
    parser = argparse.ArgumentParser(description='下載並校驗 CPU 離線教練模型 / Download and verify the CPU coach model')
    parser.add_argument('--target', type=Path, default=ROOT / 'models', help='輸出分片目錄 / destination folder')
    parser.add_argument('--file', type=Path, help='已下載的完整 GGUF / an existing full GGUF file')
    parser.add_argument('--verify-only', action='store_true', help='僅校驗現有分片 / verify existing segments only')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    destination = args.target.expanduser().resolve()
    destination.mkdir(parents=True, exist_ok=True)
    if args.verify_only:
        verify_segments(destination, manifest)
        print('所有模型分片與完整 SHA-256 均正確 / All segments and full SHA-256 verified.')
        return
    try:
        verify_segments(destination, manifest)
        print('模型已完整下載，不須再下載 / Model already complete; nothing to download.')
        return
    except RuntimeError:
        pass
    required = manifest['bytes'] * (1 if args.file else 2) + 64 * 1024 * 1024
    if shutil.disk_usage(destination).free < required:
        raise RuntimeError('磁碟可用空間不足，首次下載請保留約 1.1 GB / Keep about 1.1 GB free for the first download')
    source = args.file.expanduser().resolve() if args.file else download(destination, manifest)
    try:
        split_source(source, destination, manifest)
    finally:
        if not args.file:
            source.unlink(missing_ok=True)
    if destination != MANIFEST.parent:
        shutil.copyfile(MANIFEST, destination / 'manifest.json')
    verify_segments(destination, manifest)
    print('\n完成 / Complete: ' + str(destination))
    print('開啟網站後，按「載入已部署模型」。每片 32 MiB 以下，可用一般 Git 上傳；不需 Git LFS。')
    print('Open the site and choose Load bundled model. Each segment is at most 32 MiB; ordinary Git can upload them.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, urllib.error.URLError, KeyboardInterrupt) as error:
        print('\n未完成 / Not completed: ' + str(error), file=sys.stderr)
        sys.exit(1)
