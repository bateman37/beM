# Campaña MOTOR18-CIERRE-20261021 · comandos reales

Agenda de máquina y legible: `AGENDA-ensayo.*` (generadas por `m18-freeze.js` sobre un ensayo; los IDs de lote son deterministas por huella de agenda, pero la agenda definitiva se vuelve a congelar en `out/motor18/plan/` antes de simular y es la que manda).
Desde la raíz del árbol M18 (`T=$PWD`) con CONTROL17B en `C=/home/user/control17b` (inmutable):

1. Congelar (no simula): `node scripts/m18-campaign.js create --version=CONTROL17B --tree=$C && node scripts/m18-campaign.js create --version=M18 --tree=$T && node scripts/m18-freeze.js --control=$C --m18=$T`
2. Simular: `node scripts/m18-campaign.js run --version=CONTROL17B --tree=$C && node scripts/m18-campaign.js run --version=M18 --tree=$T` (incluye D02, ejecución especial de guardar/restaurar).
3. Auditoría de los seis diagnósticos C (sensibilidad corregida): `node scripts/m18-audit-regen.js --tree=$T --plan=out/motor18/plan/lotes-M18.json --lots-root=out/motor18/lotes/M18 --out=out/motor18/auditoria --label=M18`. El script del auditor selecciona los lotes con `kind === 'diagnostico'`; el plan de M18 los marca con `kind: 'diagnostico'` (bloque C).
4. Tablas y resumen: `node scripts/m18-compare.js && node scripts/m18-tables.js --tree=$T && node scripts/m18-summary.js`
5. Paquetes y recibo: `python3 scripts/m18-package.py --tree=$T --control=$C && python3 scripts/m18-verify-delivery.py`

Todos aceptan `--out=<dir>` (por defecto `out/motor18`, fuera de Git). Un ensayo usa `--out=out/motor18-dry` y `--allow-incomplete` en el comprobador.
