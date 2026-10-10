#!/bin/bash
# Compatibility entry point. The root script contains the deployment logic.
set -euo pipefail
smartaction_root="$(cd "$(dirname "$0")/.." && pwd)"
# Preserve the original positional [repo] [folder] syntax.
if [ "$#" -gt 0 ] && [[ "$1" != --* ]]; then
  smartaction_repo="$1"; shift
  smartaction_folder='taichi'
  if [ "$#" -gt 0 ] && [[ "$1" != --* ]]; then smartaction_folder="$1"; shift; fi
  exec bash "$smartaction_root/Upload_SmartAction.sh" --repo "$smartaction_repo" --folder "$smartaction_folder" "$@"
fi
exec bash "$smartaction_root/Upload_SmartAction.sh" "$@"
