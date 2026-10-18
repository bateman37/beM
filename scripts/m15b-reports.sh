#!/bin/sh
# Informes de comandos de MOTOR-15B (§12.2, §14): cada uno con comando, salida, commit y código de salida en out/motor15b/informes/. Uso: sh scripts/m15b-reports.sh
cd "$(dirname "$0")/.." || exit 1
mkdir -p out/motor15b/informes
run() { name="$1"; shift; { echo "comando: $*"; echo "fecha: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo "commit: $(git rev-parse --short HEAD)"; echo "---"; "$@"; code=$?; echo "---"; echo "código de salida: $code"; } > "out/motor15b/informes/$name.txt" 2>&1; }
run npm-test npm test
run data-check npm run data:check
run docs-check python3 scripts/docs/check_engine_docs.py
run equivalence node scripts/equivalence.js
run auditoria-c15 node scripts/m15b-audit.js
run robos node scripts/m15b-robos.js
run panel-recovery node scripts/browser/panel-recovery.mjs out/motor15/panel-old-library.json 5199
