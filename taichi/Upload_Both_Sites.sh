#!/bin/bash
# SmartAction v4.0 dual-site deployment. Bash 3.2+, Git, Python 3.8+.
set -euo pipefail
smartaction_dual_source="$(cd "$(dirname "$0")" && pwd)"
smartaction_dual_mode='--with-model'
smartaction_dual_fresh=0
smartaction_dual_auth=''
smartaction_dual_stage='尚未開始'
usage() {
  cat <<'HELP'
SmartAction 雙站上傳 v4.0
  bash Upload_Both_Sites.sh --fresh-login
    一行：補齊/驗證 Qwen3 權重，更新以下兩站，再核對各站提交：
    1. https://kuonanhong.github.io/SmartAction/taichi/
    2. https://kuonanhong.github.io/taichi/
  bash Upload_Both_Sites.sh --web-only       只更新網站，保留既有遠端權重
  bash Upload_Both_Sites.sh --with-model     同預設，網站與模型一起更新
--fresh-login 繞過舊憑證。Token 必須同時授權 SmartAction 與 taichi，
Contents = Read and write。支援 credential-cache 的 Git 兩站共用本次 RAM 快取。
請將此檔、Upload_SmartAction.sh 與 index.html 放同一層，保留完整 tools/。
SmartAction 根首頁只增加一個太極入口；不刪除其他內容。不使用 force push。
腳本只傳輸/核對 Git 檔案；兩站的 Pages 仍需各自設定並等待 Actions 完成。
HELP
}
cleanup() {
  smartaction_dual_status=$?
  if [ -n "$smartaction_dual_auth" ]; then
    git credential-cache --socket="$smartaction_dual_auth/socket" exit >/dev/null 2>&1 || true
    rm -rf -- "$smartaction_dual_auth"
  fi
  if [ "$smartaction_dual_status" -ne 0 ]; then
    printf '\n双站作業停在：%s。已完成的網站/批次會保留，重跑同一指令即可比對續傳。\n' "$smartaction_dual_stage" >&2
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
smartaction_dual_mode_explicit=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --fresh-login) smartaction_dual_fresh=1 ;;
    --with-model|--web-only)
      if [ -n "$smartaction_dual_mode_explicit" ] && [ "$smartaction_dual_mode_explicit" != "$1" ]; then
        printf '%s\n' '不能同時使用 --with-model 和 --web-only。' >&2; exit 1
      fi
      smartaction_dual_mode="$1";smartaction_dual_mode_explicit="$1" ;;
    --help|-h) usage;exit 0 ;;
    *) printf '%s\n' '參數無法辨識；請執行 bash Upload_Both_Sites.sh --help。' >&2;exit 1 ;;
  esac
  shift
done
[ -f "$smartaction_dual_source/Upload_SmartAction.sh" ] && [ -f "$smartaction_dual_source/index.html" ] && [ -f "$smartaction_dual_source/tools/patch_smartaction_home.py" ] || {
  printf '%s\n' '找不到完整 v4 套件；請把 Upload_Both_Sites.sh 放在解壓後 index.html 同一層，保留 tools/。' >&2;exit 1;
}
command -v git >/dev/null 2>&1 || { printf '%s\n' '需要 Git。' >&2;exit 1; }
smartaction_dual_args=("$smartaction_dual_mode")
if [ "$smartaction_dual_fresh" -eq 1 ]; then
  smartaction_dual_args+=(--fresh-login)
  smartaction_dual_auth="$(mktemp -d /tmp/sa-both-auth.XXXXXX)"
  chmod 700 "$smartaction_dual_auth"
  if printf 'protocol=https\nhost=github.com\n\n' | git credential-cache --socket="$smartaction_dual_auth/socket" get >/dev/null 2>&1; then
    export SMARTACTION_SHARED_AUTH_DIR="$smartaction_dual_auth"
  else
    printf '%s\n' '此 Git 不支援 RAM 憑證快取；Git 可能再次提示輸入 Token。'
    unset SMARTACTION_SHARED_AUTH_DIR
  fi
else
  unset SMARTACTION_SHARED_AUTH_DIR
fi
printf '%s\n' 'SmartAction dual uploader v4.0 — 本地更新 → 兩個 GitHub 儲存庫'
smartaction_dual_stage='SmartAction/taichi/'
printf '\n%s\n' '【1/2】SmartAction：太極遊戲與協會首頁入口'
bash "$smartaction_dual_source/Upload_SmartAction.sh" --site smartaction "${smartaction_dual_args[@]}"
smartaction_dual_stage='獨立 taichi/'
printf '\n%s\n' '【2/2】taichi：獨立遊戲網站'
bash "$smartaction_dual_source/Upload_SmartAction.sh" --site taichi "${smartaction_dual_args[@]}"
smartaction_dual_stage='兩站均已核對完成'
printf '\n%s\n' '兩站 Git 檔案均已上傳並核對；請等待各站最新 Pages Actions 部署成功。'
printf '%s\n' '協會首頁：https://kuonanhong.github.io/SmartAction/' '協會太極：https://kuonanhong.github.io/SmartAction/taichi/' '獨立太極：https://kuonanhong.github.io/taichi/'
printf '%s\n' '設定：https://github.com/kuonanhong/SmartAction/settings/pages' '設定：https://github.com/kuonanhong/taichi/settings/pages'
