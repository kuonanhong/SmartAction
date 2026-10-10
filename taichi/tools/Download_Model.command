#!/bin/bash
set -euo pipefail
SMARTACTION_TOOLS_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo "需要 Python 3。請至 https://www.python.org/downloads/ 安裝後重試。"
  exit 1
fi
python3 "$SMARTACTION_TOOLS_DIR/download_model.py" "$@"
