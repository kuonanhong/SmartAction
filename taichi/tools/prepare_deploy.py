#!/usr/bin/env python3
"""Copy public files into an isolated Git checkout; never delete remote files."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT_FILES = {
    'index.html', 'styles.css', 'service-worker.js', 'manifest.webmanifest',
    'offline-manifest.json', 'README.md', 'LICENSE', 'LICENSE.txt',
    'THIRD_PARTY_NOTICES.md', '.gitattributes', '.nojekyll',
    'Start_Mac.command', 'Start_Windows.bat', 'Start_Linux.sh',
    'Upload_GitHub.command', 'Upload_GitHub.bat', 'package.json',
    'PACKAGE_SHA256.json', 'Upload_SmartAction.sh',
}
PUBLIC_DIRS = {'assets', 'data', 'js', 'vendor', 'models', 'docs', 'tools', 'tests', 'dist'}
SKIP_DIRS = {'.git', '.github', 'tmp', 'temp', '__pycache__', 'node_modules'}
MAX_FILE = 100 * 1024 * 1024


def git(checkout, *args):
    return subprocess.check_output(['git', '-C', str(checkout), *args], text=True).strip()


def fail(message):
    raise RuntimeError(message)


def check_folder(folder):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*', folder):
        fail('上傳子目錄必須是單一名稱，例如 taichi；不可使用根目錄、斜線或 ..。')


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def public_files(source):
    result = []
    for name in sorted(ROOT_FILES):
        p = source / name
        if p.is_symlink():
            fail('來源含有符號連結，請改用實際檔案：' + name)
        if p.is_file():
            result.append(p)
    for name in sorted(PUBLIC_DIRS):
        base = source / name
        if base.is_symlink():
            fail('來源含有符號連結，請改用實際資料夾：' + name)
        if not base.is_dir():
            continue
        for current, dirs, names in os.walk(base, followlinks=False):
            dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
            for d in dirs:
                if (Path(current) / d).is_symlink():
                    fail('來源含有符號連結：' + str((Path(current) / d).relative_to(source)))
            for filename in sorted(names):
                p = Path(current) / filename
                if p.is_symlink():
                    fail('來源含有符號連結：' + str(p.relative_to(source)))
                if filename == '.DS_Store' or filename.startswith('._'):
                    continue
                if filename.endswith(('.gguf', '.pyc', '.tmp', '.download', '.log')):
                    continue
                result.append(p)
    return result


def validate_models(source):
    manifest_path = source / 'models' / 'manifest.json'
    if not manifest_path.is_file():
        return 0
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    parts = manifest.get('parts', [])
    existing = [p for p in parts if (source / 'models' / p['file']).exists()]
    if not existing:
        return 0
    if len(existing) != len(parts):
        fail('模型分片不完整。請先執行 bash tools/Download_Model.command，完成後再上傳。')
    for part in parts:
        name = part['file']
        if Path(name).name != name or name in {'.', '..'}:
            fail('模型清單含有無效分片名稱。')
        path = source / 'models' / name
        if path.is_symlink() or not path.is_file():
            fail('模型分片不是普通檔案：' + name)
        expected_size = part.get('bytes', part.get('size'))
        if path.stat().st_size != expected_size or digest(path) != part['sha256']:
            fail('模型分片驗證失敗：' + name + '；請重新下載該模型。')
    return len(parts)


def safe_target(checkout, relative):
    target = checkout / relative
    p = target
    while p != checkout:
        if p.is_symlink():
            fail('遠端上傳位置含有符號連結，停止覆寫：' + str(relative))
        if p.exists() and p != target and not p.is_dir():
            fail('遠端資料夾位置被普通檔案占用：' + str(relative))
        p = p.parent
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True)
    parser.add_argument('--checkout', required=True)
    parser.add_argument('--folder', default='taichi')
    parser.add_argument('--report', required=True)
    args = parser.parse_args()
    check_folder(args.folder)
    source = Path(args.source).resolve()
    checkout = Path(args.checkout).resolve()
    if source == checkout or source in checkout.parents or checkout in source.parents:
        fail('來源與上傳副本必須是分開的資料夾。')
    if not (source / 'index.html').is_file() or not (source / 'js' / 'app.js').is_file():
        fail('找不到遊戲 index.html / js/app.js；請使用完整解壓後的套件。')
    if git(checkout, 'rev-parse', '--show-toplevel') != str(checkout):
        fail('上傳副本不是獨立 Git 專案。')
    model_count = validate_models(source)
    sources = public_files(source)
    for p in sources:
        if p.stat().st_size >= MAX_FILE:
            fail('檔案達到 GitHub 普通 Git 的 100 MiB 限制：' + str(p.relative_to(source)))
    copied = []
    total_bytes = 0
    for p in sources:
        relative = Path(args.folder) / p.relative_to(source)
        target = safe_target(checkout, relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and not target.is_file():
            fail('遠端檔案位置被資料夾占用：' + str(relative))
        shutil.copyfile(p, target)
        copied.append(relative.as_posix())
        total_bytes += p.stat().st_size
    # A nested attribute prevents inherited Git LFS filters from turning
    # browser WASM and model segments into pointer files on GitHub Pages.
    attr_rel = args.folder + '/.gitattributes'
    attr = safe_target(checkout, Path(attr_rel))
    content = attr.read_text(encoding='utf-8') if attr.exists() else ''
    if content.splitlines()[-1:] != ['* -filter -text']:
        content = content.rstrip('\n') + ('\n' if content else '') + '* -filter -text\n'
        attr.write_text(content, encoding='utf-8')
    if attr_rel not in copied:
        copied.append(attr_rel)
    # Keep an existing root file and its contents intact.
    nojekyll_tracked = subprocess.run(
        ['git', '-C', str(checkout), 'cat-file', '-e', 'HEAD:.nojekyll'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    added_nojekyll = False
    if not nojekyll_tracked:
        p = safe_target(checkout, Path('.nojekyll'))
        if not p.exists():
            p.write_bytes(b'')
        copied.append('.nojekyll')
        added_nojekyll = True
    # Stage only present copied files. No deletion and no other remote path
    # can enter this commit through a blanket "git add -A".
    for start in range(0, len(copied), 100):
        subprocess.run(['git', '-C', str(checkout), 'add', '--', *copied[start:start + 100]], check=True)
    # Compare staged blobs with plain local bytes. Fail rather than publish
    # a filter-generated LFS pointer or other transformed runtime file.
    for relative in copied:
        p = checkout / relative
        plain = git(checkout, 'hash-object', '--no-filters', str(p))
        staged = git(checkout, 'rev-parse', ':' + relative)
        if plain != staged:
            fail('Git 過濾器改變了檔案內容，停止上傳：' + relative)
    report = {
        'files': len(copied), 'bytes': total_bytes,
        'model_parts': model_count, 'added_root_nojekyll': added_nojekyll,
        'paths': copied,
    }
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print('已比對並準備 {} 個檔案，約 {:.1f} MB；模型分片 {} 個。'.format(
        len(copied), total_bytes / 1_000_000, model_count))
    if not model_count:
        print('本次未上傳模型權重。網頁仍能玩，可按「下載並啟用」在使用者裝置取得模型。')
    if added_nojekyll:
        print('另新增根目錄 .nojekyll，使 Pages 直接發佈靜態檔案。')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, ValueError, KeyError, subprocess.CalledProcessError) as exc:
        print('準備失敗：' + str(exc), file=sys.stderr)
        sys.exit(1)
