# Evidencia de MOTOR-13 (campaña inicial y primer ciclo de revisión)

Archivos pequeños y reproducibles; los registros completos (≈ 420 MiB en `out/batches/`, fuera de Git) y el paquete de auditoría (ZIP) se regeneran con los scripts indicados. Ver [`../motor13.md`](../motor13.md).

| Archivo | Qué es |
|---|---|
| [`plan-campana.json`](plan-campana.json) | **Plan congelado antes de ejecutar** (commit anterior a la primera simulación): doce experimentos, actores, intervención, variables conservadas, semillas de lote 131001–131012 y deportivas derivadas, reserva de validación 132001–132004. |
| [`campana-R0-con-defecto-de-lector.json`](campana-R0-con-defecto-de-lector.json) | Primera ejecución de los 24 encuentros: 16 válidos y **8 con la conciliación analítica en fallo** por un defecto del lector de quintetos (acta conciliada). Conservada como evidencia del defecto. |
| [`campana-R1.json`](campana-R1.json) | Repetición con las **mismas entradas y semillas** tras corregir el lector: 24/24 válidos y trayectorias idénticas a R0 (el deporte no cambió). Es la base de la auditoría. |
| [`informe-auditoria.md`](informe-auditoria.md) | Informe de la auditoría de lectura de la campaña R1. |
| [`auditoria/`](auditoria/) | `catalogo.json`, `ejecuciones.csv`, `hallazgos.jsonl`, `capacidades.csv`, `sensibilidad.csv`, `fiabilidad.csv`, `concentracion.json`, `partidos.csv`, `referencias.json`. |
| [`calibracion/hipotesis.json`](calibracion/hipotesis.json) | Primer ciclo: hipótesis consideradas, **sin cambios de filas**, decisión «base mantenida», defectos corregidos y comparación de trayectorias R0/R1. |
| [`calibracion/comparacion.csv`](calibracion/comparacion.csv) | Comparación descriptiva V0/V1 de cada experimento (un caso: observación, no efecto poblacional). |

Reproducir (mismo entorno, sin datos externos):

```
node scripts/audit-campaign.js --plan                 # plan congelado (no simula)
node scripts/audit-campaign.js --run --tag R1         # 24 encuentros nuevos (≈ 1 min)
node scripts/audit-cycle.js --campaign R1 --baseline R0   # auditoría de lectura + informe + comparación + paquete
npm run audit:check -- out/audit/informes/<AUDR>-R1.zip
```

El lote de cierre de MOTOR-12 (`LOT-c268fba2`) **no estaba presente** en el entorno (`out/` no se versiona): su evidencia ([`../evidencia-motor12/`](../evidencia-motor12/README.md)) se conserva solo como resumen, y no se reconstruyeron sus diez partidos.
