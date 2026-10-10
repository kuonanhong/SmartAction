#!/bin/bash
# SmartAction v2.2 — Bash 3.2+, Git, Python 3.8+. Run from any working directory.
# Credentials are handled by Git; this script never requests, prints or saves a PAT.
set -euo pipefail
export GIT_LFS_SKIP_SMUDGE=1
smartaction_source="$(cd "$(dirname "$0")" && pwd)"
smartaction_repo='https://github.com/kuonanhong/SmartAction.git'
smartaction_folder='taichi'
smartaction_model_mode='existing'
smartaction_tmp=''
smartaction_auth_tmp=''
smartaction_fresh_login=0
smartaction_buffered=0
smartaction_git=(git)

fail() { printf '%s\n' "$*" >&2; exit 1; }
usage() {
  cat <<'USAGE'
用法 / Usage:
  bash Upload_SmartAction.sh                 上傳網站及已完整下載的模型
  bash Upload_SmartAction.sh --with-model    先下載/驗證 Qwen3，再上傳網站及模型
  bash Upload_SmartAction.sh --web-only      只更新網站，保留遠端已存在的模型
  bash Upload_SmartAction.sh --site taichi --with-model --fresh-login
    發布到 kuonanhong/taichi 根目錄，即 https://kuonanhong.github.io/taichi/
可選：--site smartaction|taichi、--fresh-login、--repo URL、--folder 子目錄
--fresh-login 繞過舊憑證，請在 Git Password 提示貼新 Token；不修改 Keychain。
--with-model 會優先合併旁邊 SmartAction_Qwen3_CPU_Weights/models/ 的有效分片。
請把此檔放在遊戲 index.html 同一層。可從任何工作目錄執行。
不需要 Git LFS；模型每兩片一批提交、上傳、核對（最多 64 MiB），重跑會跳過相同檔案。
v2.2：空儲存庫自動建立 main；斷線先核對遠端 SHA，再最多重試 3 次。
USAGE
}
on_exit() {
  smartaction_status=$?
  if [ -n "$smartaction_auth_tmp" ]; then
    git credential-cache --socket="$smartaction_auth_tmp/socket" exit >/dev/null 2>&1 || true
    rm -rf -- "$smartaction_auth_tmp"
  fi
  if [ "$smartaction_status" -ne 0 ]; then
    printf '\n%s\n' '上傳未完成。已成功上傳的批次會保留；修正問題後，重跑相同指令即可比對續傳。' >&2
    printf '%s\n' '本地原始套件未移動或刪除。請保留錯誤訊息，不要貼出 Token。' >&2
    if [ -n "$smartaction_tmp" ]; then printf '診斷副本：%s\n' "$smartaction_tmp" >&2; fi
  fi
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
while [ "$#" -gt 0 ]; do
  case "$1" in
    --with-model) [ "$smartaction_model_mode" != 'web-only' ] || fail '不能同時使用 --with-model 和 --web-only。'; smartaction_model_mode='download'; shift ;;
    --web-only) [ "$smartaction_model_mode" != 'download' ] || fail '不能同時使用 --with-model 和 --web-only。'; smartaction_model_mode='web-only'; shift ;;
    --fresh-login) smartaction_fresh_login=1; shift ;;
    --site)
      [ "$#" -ge 2 ] || fail '--site 後填 smartaction 或 taichi。'
      case "$2" in
        smartaction) smartaction_repo='https://github.com/kuonanhong/SmartAction.git'; smartaction_folder='taichi' ;;
        taichi) smartaction_repo='https://github.com/kuonanhong/taichi.git'; smartaction_folder='.' ;;
        *) fail '--site 只能填 smartaction 或 taichi。' ;;
      esac
      shift 2 ;;
    --repo) [ "$#" -ge 2 ] || fail '--repo 後缺少網址。'; smartaction_repo="$2"; shift 2 ;;
    --folder) [ "$#" -ge 2 ] || fail '--folder 後缺少名稱。'; smartaction_folder="$2"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) fail '無法辨識參數；請執行 bash Upload_SmartAction.sh --help。' ;;
  esac
done
printf '%s\n' 'SmartAction uploader v2.2 — 空儲存庫初始化 / 斷線核對與重試'
[[ "$smartaction_repo" =~ ^https://github\.com/[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || fail '只接受 https://github.com/OWNER/REPO.git；網址不可含 Token、密碼、查詢字串或空白。'
if [ "$smartaction_folder" = '.' ]; then
  case "$smartaction_repo" in https://github.com/*/taichi|https://github.com/*/taichi.git) ;; *) fail '根目錄發布僅允許獨立 taichi 儲存庫，避免覆寫協會首頁。' ;; esac
else
  [[ "$smartaction_folder" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$ ]] || fail '目標資料夾只能是單一名稱，例如 taichi；不可用 /、.. 或根目錄。'
fi
command -v git >/dev/null 2>&1 || fail '需要 Git：https://git-scm.com/downloads/；本程式不會安裝 Homebrew。'
smartaction_python=''
for smartaction_candidate in python3 python; do
  if command -v "$smartaction_candidate" >/dev/null 2>&1 && "$smartaction_candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)' >/dev/null 2>&1; then
    smartaction_python="$smartaction_candidate"; break
  fi
done
[ -n "$smartaction_python" ] || fail '需要 Python 3.8 以上：https://www.python.org/downloads/；安裝 Windows 版時請勾選 Add Python to PATH。'
[ -f "$smartaction_source/index.html" ] && [ -f "$smartaction_source/models/manifest.json" ] || fail '找不到完整遊戲套件；請把 Upload_SmartAction.sh 放在 index.html 同一層，勿只下載此腳本就執行。'
[ ! -L "$smartaction_source/models" ] || fail '來源 models 不可為符號連結；請使用套件中的實際資料夾。'
smartaction_tmp="$(mktemp -d "${TMPDIR:-/tmp}/SmartAction-upload.XXXXXX")"
smartaction_checkout="$smartaction_tmp/repository"
# The staging helper is embedded so there is only one upload script to invoke.
cat > "$smartaction_tmp/stage.py" <<'PY'
import hashlib, json, os, re, shutil, subprocess, sys
from pathlib import Path
mode, source_arg, checkout_arg, folder, model_mode, report_arg = sys.argv[1:7]
source, checkout, report = Path(source_arg).resolve(), Path(checkout_arg).resolve(), Path(report_arg)
ROOT_FILES = {'index.html','styles.css','service-worker.js','manifest.webmanifest','offline-manifest.json','README.md','README_ZH.md','LICENSE','LICENSE.txt','THIRD_PARTY_NOTICES.md','.gitattributes','.nojekyll','Start_Mac.command','Start_Windows.bat','Start_Linux.sh','Upload_SmartAction.sh','Upload_GitHub.command','Upload_GitHub.bat','package.json','PACKAGE_SHA256.json'}
PUBLIC_DIRS = {'assets','data','js','vendor','models','docs','tools','tests','dist'}
SKIP_DIRS = {'.git','.github','tmp','temp','__pycache__','node_modules'}
def fail(msg): raise RuntimeError(msg)
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1048576),b''): h.update(chunk)
    return h.hexdigest()
def git(*args): return subprocess.check_output(['git','-C',str(checkout),*args],text=True).strip()
def validate_parts():
    if model_mode=='web-only': return []
    manifest=json.loads((source/'models/manifest.json').read_text(encoding='utf-8'))
    parts=manifest.get('parts',[])
    for part in parts:
        name=part['file']
        if not re.fullmatch(r'[A-Za-z0-9_.-]+\.part\d+',name): fail('模型分片名稱不安全。')
        if not 0 < part['bytes'] <= 32*1024*1024: fail('每個模型分片必須不大於 32 MiB。')
    existing=[p for p in parts if (source/'models'/p['file']).exists()]
    if not existing: return []
    if len(existing)!=len(parts): fail('本地模型分片不完整；請加上 --with-model 修復下載，或 --web-only 只上傳網站。')
    full=hashlib.sha256(); total=0
    for part in parts:
        p=source/'models'/part['file']
        if p.is_symlink() or not p.is_file() or p.stat().st_size!=part['bytes'] or digest(p)!=part['sha256']: fail('模型分片校驗失敗：'+part['file'])
        with p.open('rb') as f:
            for chunk in iter(lambda:f.read(1048576),b''): full.update(chunk); total+=len(chunk)
    if total!=manifest['bytes'] or full.hexdigest()!=manifest['sha256']: fail('完整模型校驗失敗。')
    return [p['file'] for p in parts]
def public_files():
    paths=[]
    for name in sorted(ROOT_FILES):
        p=source/name
        if p.is_symlink(): fail('來源不接受符號連結：'+name)
        if p.is_file(): paths.append(p)
    for name in sorted(PUBLIC_DIRS):
        base=source/name
        if base.is_symlink(): fail('來源不接受符號連結：'+name)
        if not base.is_dir(): continue
        for current,dirs,names in os.walk(base,followlinks=False):
            dirs[:]=sorted(d for d in dirs if d not in SKIP_DIRS)
            for d in dirs:
                if (Path(current)/d).is_symlink(): fail('來源資料夾含符號連結。')
            for name in sorted(names):
                p=Path(current)/name
                if p.is_symlink(): fail('來源檔案含符號連結：'+str(p.relative_to(source)))
                if name.startswith('.') or name.endswith(('.gguf','.pyc','.tmp','.download','.log','.zip')) or re.search(r'\.part\d+$',name): continue
                paths.append(p)
    for p in paths:
        if p.stat().st_size >= 100*1024*1024: fail('網站檔案達 100 MiB，不能使用普通 Git 上傳：'+str(p.relative_to(source)))
    return paths
def target_for(relative):
    target=checkout/relative; p=target
    while p!=checkout:
        if p.is_symlink(): fail('遠端目標含有符號連結，停止覆寫：'+relative.as_posix())
        if p.exists() and p!=target and not p.is_dir(): fail('遠端資料夾被檔案占用：'+relative.as_posix())
        p=p.parent
    if target.exists() and not target.is_file(): fail('遠端檔案被資料夾占用：'+relative.as_posix())
    target.parent.mkdir(parents=True,exist_ok=True)
    return target
def copy_stage(paths):
    copied=[]
    for p in paths:
        rel=Path(folder)/p.relative_to(source); target=target_for(rel)
        shutil.copyfile(p,target); copied.append(rel.as_posix())
    attr_rel=Path(folder)/'.gitattributes'; attr=target_for(attr_rel)
    content=attr.read_text(encoding='utf-8') if attr.exists() else ''
    # Disable inherited LFS and CRLF conversion; deployed bytes must match ZIP bytes.
    if content.splitlines()[-1:]!=['* -filter -text']:
        attr.write_text(content.rstrip('\n')+('\n' if content else '')+'* -filter -text\n',encoding='utf-8')
    if attr_rel.as_posix() not in copied: copied.append(attr_rel.as_posix())
    for i in range(0,len(copied),80): subprocess.run(['git','-C',str(checkout),'add','-f','--',*copied[i:i+80]],check=True)
    for rel in copied:
        if git('hash-object','--no-filters',str(checkout/rel))!=git('rev-parse',':'+rel): fail('Git 過濾器改變檔案內容，停止上傳：'+rel)
    print('準備 {} 個檔案，{:.1f} MB。'.format(len(copied),sum(p.stat().st_size for p in paths)/1e6))
try:
    if folder!='.' and not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*',folder): fail('目標子目錄不安全。')
    if source==checkout or source in checkout.parents or checkout in source.parents: fail('來源與上傳副本不可重疊。')
    if mode=='validate':
        parts=validate_parts(); paths=public_files()
        report.write_text(json.dumps({'parts':parts,'webfiles':[str(p.relative_to(source)) for p in paths]},ensure_ascii=False),encoding='utf-8')
        print('本地檢查完成：{} 個網站檔案；{} 個模型分片。'.format(len(paths),len(parts)))
    else:
        if Path(git('rev-parse','--show-toplevel')).resolve()!=checkout: fail('上傳副本不是獨立 Git 專案。')
        plan=json.loads(report.read_text(encoding='utf-8'))
        if mode=='web': copy_stage([source/p for p in plan['webfiles']])
        elif mode=='part':
            name=sys.argv[7]
            if name not in plan['parts']: fail('分片未列在驗證清單。')
            manifest=json.loads((source/'models/manifest.json').read_text(encoding='utf-8'))
            part=next(p for p in manifest['parts'] if p['file']==name)
            p=source/'models'/name
            if p.stat().st_size!=part['bytes'] or digest(p)!=part['sha256']: fail('分片在上傳前變動，請重新執行。')
            copy_stage([p])
        else: fail('未知操作。')
except (OSError,RuntimeError,ValueError,KeyError,subprocess.CalledProcessError) as e:
    print('準備失敗：'+str(e),file=sys.stderr); sys.exit(1)
PY
if [ "$smartaction_fresh_login" -eq 0 ] && ! git config --get-all credential.helper >/dev/null 2>&1 && command -v gh >/dev/null 2>&1 && gh auth status --hostname github.com >/dev/null 2>&1; then
  smartaction_git=(git -c credential.helper= -c 'credential.helper=!gh auth git-credential')
fi
if [ "$smartaction_fresh_login" -eq 1 ]; then
  unset GIT_ASKPASS SSH_ASKPASS
  smartaction_git=(git -c credential.helper= -c core.askPass= -c credential.username=kuonanhong -c http.extraheader= -c http.https://github.com/.extraheader= -c "http.$smartaction_repo.extraheader=" -c "http.${smartaction_repo%.git}.extraheader=")
  smartaction_auth_tmp="$(mktemp -d /tmp/sa-auth.XXXXXX)"
  chmod 700 "$smartaction_auth_tmp"
  if git credential-cache --socket="$smartaction_auth_tmp/socket" get </dev/null >/dev/null 2>&1; then
    smartaction_git+=(-c "credential.helper=cache --timeout=3600 --socket=$smartaction_auth_tmp/socket")
  fi
  printf '%s\n' '本次繞過舊憑證；Username 為 kuonanhong，Password 請貼上具 Contents 寫入權限的新 Token。'
fi
ensure_identity() {
  if ! git -C "$smartaction_checkout" var GIT_AUTHOR_IDENT >/dev/null 2>&1; then
    printf '%s\n' '請輸入 Git 提交者資料（只設定本次副本，不修改全域設定）。'
    read -r -p '名稱：' smartaction_name
    read -r -p 'Email（可填 GitHub noreply Email）：' smartaction_email
    [ -n "$smartaction_name" ] && [ -n "$smartaction_email" ] || fail '提交者名稱和 Email 不可空白。'
    git -C "$smartaction_checkout" config user.name "$smartaction_name"
    git -C "$smartaction_checkout" config user.email "$smartaction_email"
  fi
}
printf '[1/4] 複製遠端目前版本：%s\n' "$smartaction_repo"
printf '%s\n' '若 Git 詢問 Username，填 GitHub 帳號；Password 填 Personal Access Token（輸入時不顯示）。'
"${smartaction_git[@]}" clone --depth=1 --filter=blob:none --no-checkout "$smartaction_repo" "$smartaction_checkout"
if ! git -C "$smartaction_checkout" rev-parse --verify HEAD >/dev/null 2>&1; then
  if ! smartaction_existing_refs="$("${smartaction_git[@]}" -C "$smartaction_checkout" ls-remote --refs origin)"; then
    fail '無法確認遠端是否為空儲存庫；請檢查連線或登入後重跑。尚未初始化。'
  fi
  [ -z "$smartaction_existing_refs" ] || fail '遠端已有分支或標籤，但預設 HEAD 無效；請在 GitHub 設定正確預設分支。未建立無關歷史。'
  printf '%s\n' '確認為空儲存庫；在本次副本自動初始化 main，無需手動建立 README。'
  git -C "$smartaction_checkout" symbolic-ref HEAD refs/heads/main
  ensure_identity
  git -C "$smartaction_checkout" -c commit.gpgsign=false commit --allow-empty -m 'Initialize SmartAction deployment'
fi
if [ "$smartaction_folder" != '.' ]; then
  "${smartaction_git[@]}" -C "$smartaction_checkout" sparse-checkout set --no-cone "/$smartaction_folder/"
fi
"${smartaction_git[@]}" -C "$smartaction_checkout" checkout --quiet HEAD
smartaction_branch="$(git -C "$smartaction_checkout" symbolic-ref --short HEAD)"
printf '%s\n' '[2/4] 預先檢查 Git 寫入認證（dry-run，不更動遠端）。'
if ! "${smartaction_git[@]}" -C "$smartaction_checkout" -c http.version=HTTP/1.1 push --dry-run origin "HEAD:refs/heads/$smartaction_branch"; then
  fail '寫入預檢失敗。若顯示403：請確認 Token 選取本儲存庫、Contents=Read and write，並加 --fresh-login 重跑。這個選項不會替 Token 增加權限。'
fi
if [ "$smartaction_model_mode" = 'download' ]; then
  # Import only SHA-verified parts from the already extracted sibling ZIP.
  "$smartaction_python" - "$smartaction_source" <<'IMPORT'
from pathlib import Path
import hashlib,json,shutil,sys
root=Path(sys.argv[1]); donor=root.parent/'SmartAction_Qwen3_CPU_Weights'/'models'
manifest=json.loads((root/'models/manifest.json').read_text(encoding='utf-8'))
def valid(path,part):
    return path.is_file() and not path.is_symlink() and path.stat().st_size==part['bytes'] and hashlib.sha256(path.read_bytes()).hexdigest()==part['sha256']
count=0
if donor.is_dir() and not donor.is_symlink():
    for part in manifest['parts']:
        name=part['file']
        if Path(name).name!=name or '/' in name or '\\' in name:raise SystemExit('Invalid model path')
        dst=root/'models'/name; src=donor/name
        if dst.is_symlink():raise SystemExit('Model destination must not be a symlink')
        if not valid(dst,part) and valid(src,part):shutil.copyfile(src,dst);count+=1
    print('從旁邊權重資料夾合併有效分片：',count,'；保留 models/pose/。')
IMPORT
  [ -f "$smartaction_source/tools/download_model.py" ] || fail '缺少 tools/download_model.py；請重新解壓完整套件。'
  "$smartaction_python" "$smartaction_source/tools/download_model.py"
fi
"$smartaction_python" "$smartaction_tmp/stage.py" validate "$smartaction_source" "$smartaction_checkout" "$smartaction_folder" "$smartaction_model_mode" "$smartaction_tmp/plan.json"
"$smartaction_python" - "$smartaction_tmp/plan.json" > "$smartaction_tmp/parts.txt" <<'PARTS'
import json,sys
for name in json.load(open(sys.argv[1],encoding='utf-8'))['parts']: print(name)
PARTS
remote_matches() {
  smartaction_local_head="$(git -C "$smartaction_checkout" rev-parse HEAD)"
  smartaction_remote_head=''
  if ! smartaction_remote_refs="$("${smartaction_git[@]}" -C "$smartaction_checkout" ls-remote --heads origin "refs/heads/$smartaction_branch")"; then
    printf '%s\n' '  目前無法讀取遠端提交，尚不能判定成功。' >&2
    return 1
  fi
  smartaction_remote_head="$(printf '%s\n' "$smartaction_remote_refs" | awk -v ref="refs/heads/$smartaction_branch" '$2 == ref {print $1}')"
  [ -n "$smartaction_remote_head" ] && [ "$smartaction_local_head" = "$smartaction_remote_head" ]
}
verify_remote() {
  remote_matches || fail '遠端提交尚未確認相同；可能連線中斷或有其他更新，請重跑此腳本重新比對。'
}
push_confirmed() {
  smartaction_attempt=1
  while [ "$smartaction_attempt" -le 3 ]; do
    printf '  推送第 %s/3 次，完成後核對遠端提交。\n' "$smartaction_attempt"
    smartaction_http_args=(-c http.version=HTTP/1.1)
    if [ "$smartaction_buffered" -eq 1 ]; then
      # Per-run compatibility fallback for proxies that reject chunked HTTP.
      # It is not a general cure for disconnections. No global config is changed.
      smartaction_http_args+=(-c http.postBuffer=134217728)
    fi
    if LC_ALL=C "${smartaction_git[@]}" -C "$smartaction_checkout" "${smartaction_http_args[@]}" push --progress origin "HEAD:refs/heads/$smartaction_branch" 2>&1 | tee "$smartaction_tmp/last-push.log"; then
      smartaction_push_status=0
    else
      smartaction_push_status=${PIPESTATUS[0]}
    fi
    case "$smartaction_push_status" in 130|143) exit "$smartaction_push_status" ;; esac
    if remote_matches; then
      if [ "$smartaction_push_status" -ne 0 ]; then
        printf '%s\n' '  Git 回報斷線，但已確認遠端收到相同提交；繼續下一批。'
      fi
      printf '  已核對遠端提交：%.12s\n' "$smartaction_local_head"
      return 0
    fi
    # A denied write or conflicting history needs user action, not retries.
    if LC_ALL=C grep -Eiq 'non-fast-forward|\[rejected\]|\[remote rejected\]|Authentication failed|Permission .* denied|returned error: (401|403)|repository .*not found|GH006|GH013' "$smartaction_tmp/last-push.log"; then
      fail 'Git 明確拒絕寫入（權限、分支規則或其他人更新）；停止自動重試。請依上方訊息處理，勿 force push。'
    fi
    [ "$smartaction_attempt" -lt 3 ] || break
    smartaction_buffered=1
    printf '%s\n' '  尚未確認成功；稍後以 HTTP/1.1、128 MiB 暫存重試同一提交（不改全域設定）。'
    sleep "$((smartaction_attempt * 2))"
    smartaction_attempt=$((smartaction_attempt + 1))
  done
  fail '三次推送後仍未確認成功。請暫停 VPN／代理或換穩定網路，再重跑同一指令；成功批次會自動跳過。'
}
commit_push() {
  if git -C "$smartaction_checkout" diff --cached --quiet; then
    printf '%s\n' '  內容相同，跳過此批次。'; return
  fi
  ensure_identity
  git -C "$smartaction_checkout" diff --cached --stat
  git -C "$smartaction_checkout" -c commit.gpgsign=false commit -m "$1"
  push_confirmed
}
if [ "$smartaction_folder" = '.' ]; then
  printf '%s\n' '[3/4] 上傳至獨立 taichi 儲存庫根目錄；更新同名網站檔案，保留其他檔案。'
else
  printf '[3/4] 上傳網站到 %s/，保留根首頁與其他遠端檔案。\n' "$smartaction_folder"
fi
"$smartaction_python" "$smartaction_tmp/stage.py" web "$smartaction_source" "$smartaction_checkout" "$smartaction_folder" "$smartaction_model_mode" "$smartaction_tmp/plan.json"
commit_push "Update SmartAction web app in $smartaction_folder"
printf '%s\n' '[4/4] 分批上傳模型（每片最多 32 MiB，每批最多兩片 / 64 MiB）。'
if [ ! -s "$smartaction_tmp/parts.txt" ]; then
  printf '%s\n' '本次沒有上傳模型權重；遊戲可使用。可在網頁下載模型，或再加 --with-model 上傳權重。'
else
  # At most 8 model pushes for the 15 fixed parts, plus one web push.
  smartaction_batch_count=0
  smartaction_batch_label=''
  # Use fd 3 so Git's interactive credential prompts retain normal standard input.
  while IFS= read -r smartaction_part <&3; do
    printf '模型：%s\n' "$smartaction_part"
    "$smartaction_python" "$smartaction_tmp/stage.py" part "$smartaction_source" "$smartaction_checkout" "$smartaction_folder" "$smartaction_model_mode" "$smartaction_tmp/plan.json" "$smartaction_part"
    if [ "$smartaction_batch_count" -eq 0 ]; then
      smartaction_batch_label="$smartaction_part"
    else
      smartaction_batch_label="$smartaction_batch_label + $smartaction_part"
    fi
    smartaction_batch_count=$((smartaction_batch_count + 1))
    if [ "$smartaction_batch_count" -eq 2 ]; then
      commit_push "Add SmartAction model segments $smartaction_batch_label"
      smartaction_batch_count=0
      smartaction_batch_label=''
    fi
  done 3< "$smartaction_tmp/parts.txt"
  if [ "$smartaction_batch_count" -gt 0 ]; then
    commit_push "Add SmartAction model segments $smartaction_batch_label"
  fi
fi
verify_remote
printf '\n%s\n' 'GitHub 檔案上傳已核對完成；這不代表 Pages 已完成發佈。'
printf '分支：%s；最新提交：%s\n' "$smartaction_branch" "$smartaction_local_head"
printf '上傳副本：%s\n' "$smartaction_checkout"
printf '%s\n' 'Settings → Pages：確認發佈分支與 /(root)；Actions 最新 Pages 發佈成功後開啟網址。'
smartaction_repo_slug="${smartaction_repo#https://github.com/}"
smartaction_repo_slug="${smartaction_repo_slug%.git}"
smartaction_owner="${smartaction_repo_slug%%/*}"
smartaction_repo_name="${smartaction_repo_slug##*/}"
smartaction_pages_tail=''
if [ "$smartaction_folder" != '.' ]; then smartaction_pages_tail="$smartaction_folder/"; fi
printf 'Pages 設定：https://github.com/%s/settings/pages\n' "$smartaction_repo_slug"
printf '發佈狀態：https://github.com/%s/actions\n' "$smartaction_repo_slug"
printf '預期遊戲網址：https://%s.github.io/%s/%s\n' "$smartaction_owner" "$smartaction_repo_name" "$smartaction_pages_tail"
