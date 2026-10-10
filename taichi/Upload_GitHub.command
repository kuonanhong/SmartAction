#!/bin/bash
set -euo pipefail
smartaction_root="$(cd "$(dirname "$0")" && pwd)"
exec bash "$smartaction_root/Upload_SmartAction.sh" "$@"
