#!/usr/bin/env python3
"""Insert/update only the owned Taichi link block in an existing homepage.

No homepage is invented. All bytes outside the owned marker are preserved.
Use on an isolated deployment checkout; the upload script commits this change.
"""
from pathlib import Path
import re
import sys

START=b'<!-- SMARTACTION_TAICHI_LINK_START -->'
END=b'<!-- SMARTACTION_TAICHI_LINK_END -->'
BLOCK=('''<!-- SMARTACTION_TAICHI_LINK_START -->
<a id="smartaction-taichi-entry" href="./taichi/" aria-label="聰動太極練習 · Taichi practice" style="position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:10px;padding:12px 17px;background:#153e32;color:#fff;border:1px solid #a6c89b;border-radius:999px;box-shadow:0 5px 22px #0003;text-decoration:none;font:600 15px/1.35 system-ui,-apple-system,sans-serif;max-width:calc(100vw - 32px)"><span aria-hidden="true" style="font-size:28px;line-height:1">☯</span><span>聰動太極練習<br><span lang="en" style="font-size:11px;font-weight:400">Taichi · Practice together</span></span></a>
<!-- SMARTACTION_TAICHI_LINK_END -->''').encode('utf-8')


def patch_bytes(data):
    count_start,count_end=data.count(START),data.count(END)
    if count_start or count_end:
        if count_start!=1 or count_end!=1 or data.index(START)>=data.index(END):
            raise ValueError('首頁入口標記不完整或重複；停止，請先檢查首頁。')
        begin=data.index(START);end=data.index(END)+len(END)
        return data[:begin]+BLOCK+data[end:]
    # Refuse to duplicate a hand-made link with the same owned element ID.
    if re.search(br'''\bid\s*=\s*["']smartaction-taichi-entry["']''',data,re.I):
        raise ValueError('首頁已有同名入口但缺少更新標記；停止以免產生重複入口。')
    ends=list(re.finditer(br'</body\s*>',data,re.I))
    if not ends:
        return None
    position=ends[-1].start()
    return data[:position]+b'\n'+BLOCK+b'\n'+data[position:]


def main():
    if len(sys.argv)!=2:raise SystemExit('用法：python3 tools/patch_smartaction_home.py /path/to/existing/index.html')
    target=Path(sys.argv[1])
    if target.is_symlink():raise SystemExit('根首頁是符號連結；停止以免修改連結目標。')
    if not target.is_file():
        print('SmartAction 根目錄沒有 index.html；保留原樣，未建立假的協會首頁。');return
    original=target.read_bytes()
    try:updated=patch_bytes(original)
    except ValueError as error:raise SystemExit(str(error))
    if updated is None:
        print('SmartAction 首頁沒有可辨識的 </body>；保留原樣，請手動加入 ./taichi/ 連結。');return
    if updated==original:
        print('SmartAction 首頁太極入口已是最新，保留全部其他內容。');return
    target.write_bytes(updated)
    print('SmartAction 首頁已加入/更新 ☯ 太極入口 → ./taichi/；其他內容逐位元組保留。')


if __name__=='__main__':main()
