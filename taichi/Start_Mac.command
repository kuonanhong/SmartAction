#!/bin/bash
set -euo pipefail
taichi_root="$(cd "$(dirname "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' '請先安裝 Python 3：https://www.python.org/downloads/'
  exit 1
fi
exec python3 "$taichi_root/tools/serve.py" "$@"
