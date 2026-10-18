# 00 · LÉEME — paquete de revisión rápida de MOTOR-15B

**Envía primero `MOTOR-15B-revision-rapida.zip`.** El paquete detallado (`MOTOR-15B-evidencia-detallada.zip`) solo si se pide: es **incremental** sobre el paquete de MOTOR-15 (que se conserva sin tocar y se referencia por hash).

Orden de lectura: `01-RESUMEN.md` (breve; separa comprobado por Claude, pendiente de Dennis y no ejecutado) → `18-CIERRE-15B.md` (estado de C1–C4 y R, commits y entrada para MOTOR-16) → tablas `02`–`12` (cambios, cobertura, hallazgos, partidos, equipos, rendimiento, equivalencia, auditorías, capacidades, normativa, compatibilidad) → **`15-ROBOS.csv`, `16-CASOS-ROBOS.csv`, `17-TRAZABILIDAD.csv`** → `13-NAVEGADOR.md` → `14-PENDIENTES-MOTOR16.md` → `DICCIONARIO.md`.

**Histórico frente a nuevo.** Cada fila de `05`, `06`, `07` lleva su `origin`: `histórico MOTOR-15` (benchmark de cien, matrices e integración original; conservados, **no repetidos**) o `nuevo MOTOR-15B` (reejecución de integración, reproducciones para auditoría, caso RG-I03 y colas). Los cien resultados del benchmark no son ejecuciones de MOTOR-15B.

Comprobación (solo paquetes de devolución; no re-simula ni demuestra que una auditoría leyó el caso apropiado):

```
node scripts/m15b-package-check.js out/motor15b/MOTOR-15B-revision-rapida.zip
node scripts/m15b-package-check.js out/motor15b/MOTOR-15B-revision-rapida.zip --detail out/motor15b/MOTOR-15B-evidencia-detallada.zip --base out/motor15
```

Resultado esperado: `PAQUETE CORRECTO (N comprobaciones…)`. Un paquete alterado o incompleto se rechaza con el motivo (`PAQUETE RECHAZADO`). Un dato no medido va vacío, nunca cero.
