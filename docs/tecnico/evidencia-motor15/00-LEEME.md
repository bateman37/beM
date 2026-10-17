# 00 · LÉEME — paquete de revisión rápida de MOTOR-15

**Envía primero `MOTOR-15-revision-rapida.zip`.** El paquete detallado (`MOTOR-15-evidencia-detallada.zip`) solo si se pide.

Contenido: `01-RESUMEN.md` (leer primero), `02`–`12` tablas CSV (cambios, cobertura, hallazgos, equivalencia, rendimiento, integración, auditorías, normativa, compatibilidad), `13-NAVEGADOR.md`, `14-PENDIENTES-MOTOR16.md`, `DICCIONARIO.md` y el manifiesto.

Comprobación (solo paquete rápido):

```
node scripts/m15-package-check.js out/motor15/MOTOR-15-revision-rapida.zip
```

Resultado esperado: `PAQUETE CORRECTO (N comprobaciones…)`. Un dato no medido va vacío, nunca cero. Distinguimos **comprobado por Claude / pendiente de Dennis / no ejecutado**.
