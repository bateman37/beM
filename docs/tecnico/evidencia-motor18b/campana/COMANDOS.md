# Campaña MOTOR18B-CIERRE-20261022 · comandos reales

Desde la raíz del árbol de MOTOR-18B (`T=$PWD`) con CONTROL17B en `C=/home/user/control17b` (worktree inmutable de `f67113e`). Todo escribe en `out/motor18b/` (fuera de Git). La agenda, los perfiles y las semillas se congelaron **antes** de simular y no se ajustó ningún valor mirando marcadores.

0. Control de MOTOR-18 (antes de editar): `out/motor18b/control-motor18/` (agenda, congelación, planes de lotes, L18 histórica y huellas de los paquetes finales de MOTOR-18; commit `fa13869`).
1. Congelar (no simula): `node scripts/m18b-campaign.js create --version=CONTROL17B --tree=$C --out=out/motor18b && node scripts/m18b-campaign.js create --version=M18B --tree=$T --out=out/motor18b && node scripts/m18b-freeze.js --control=$C --m18=$T --out=out/motor18b`
2. Simular: `node scripts/m18b-campaign.js run --version=CONTROL17B --tree=$C --out=out/motor18b && node scripts/m18b-campaign.js run --version=M18B --tree=$T --out=out/motor18b` (incluye D02, ejecución especial de guardar/restaurar).
3. Auditoría de los seis diagnósticos C: `node scripts/m18b-audit-regen.js --tree=$T --plan=out/motor18b/plan/lotes-M18B.json --lots-root=out/motor18b/lotes/M18B --out=out/motor18b/auditoria --label=M18B --commit=$(git rev-parse HEAD)`
4. Tablas y evidencia: `node scripts/m18b-compare.js --out=out/motor18b && node scripts/m18b-tables.js --tree=$T --out=out/motor18b && node scripts/m18b-l18b-table.js && node scripts/browser/m18b-recorrido.mjs --out=docs/tecnico/evidencia-motor18b/ui && node scripts/m18b-evidence.js && node scripts/m18b-summary.js`
5. Verificaciones: `npm test` · `npm run data:check` · `python3 scripts/docs/check_engine_docs.py` (en copia limpia del commit) → `out/motor18b/verificaciones/`.
6. Paquetes y recibo: `python3 scripts/m18b-package.py --tree=$T --control=$C --out=out/motor18b && python3 scripts/m18b-verify-delivery.py --out=out/motor18b`

Los lotes de la campaña MOTOR-18B reutilizan los identificadores deterministas de lote de MOTOR-18 (el identificador sale de la huella de la agenda: misma agenda y semillas ⇒ mismo `LOT-…`), pero viven en carpetas distintas (`out/motor18/…` frente a `out/motor18b/…`); nada de MOTOR-18 se sobrescribe.
