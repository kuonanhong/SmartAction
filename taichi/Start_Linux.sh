#!/bin/sh
set -eu
taichi_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 "$taichi_root/tools/serve.py" "$@"
