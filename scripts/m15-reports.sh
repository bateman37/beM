#!/bin/sh
# Informes de comandos de MOTOR-15 (§19): cada uno con comando, salida y código de salida en out/motor15/informes/. Uso: sh scripts/m15-reports.sh
cd "$(dirname "$0")/.." || exit 1
mkdir -p out/motor15/informes
run() { name="$1"; shift; { echo "comando: $*"; echo "fecha: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo "commit: $(git rev-parse --short HEAD)"; echo "---"; "$@"; code=$?; echo "---"; echo "código de salida: $code"; } > "out/motor15/informes/$name.txt" 2>&1; }
run npm-test npm test
run data-check npm run data:check
run docs-check python3 scripts/docs/check_engine_docs.py
run equivalence node scripts/equivalence.js
run panel-recovery node scripts/browser/panel-recovery.mjs out/motor15/panel-old-library.json 5199
