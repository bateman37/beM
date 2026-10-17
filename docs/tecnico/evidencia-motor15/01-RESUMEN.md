# 01 · Resumen — MOTOR-15

**Estado:** completo técnicamente en el alcance del encargo, con límites. Coste: **objetivo no alcanzado**. Evaluación deportiva: **pendiente (MOTOR-16/17)**. Aceptación de Dennis: **pendiente**.

## Qué se hizo
- **A. Panel:** el error «reading 'policies'» venía de perfiles sin `coach`; corregido en la frontera con tarjeta de compatibilidad y recuperación explícita (sin convertir ni activar nada solo).
- **B. Deporte (versionado `SEM-MOTOR15-20261017`, motor 0.15.0):** técnicas/contadores, compensación y cola del art. 43, correcciones del art. 45, tiro pendiente (0,35 s), interferencia condicionada, asistencias causales, estado propio por tramo, REC10-01/02. Con semillas a cero se reproduce MOTOR-14; con ellas, 83–98 / 6 684 sorteos.
- **C. Mundo:** nivel `world-essential`, pool persistente de workers (1/2/4/auto), detener/continuar/reintentar.
- **D. Medición y cierre:** benchmark real de 100 partidos (100/100 válidos), integración C15-01..06, auditorías AUD01–32 (15 conformes, 16 inconclusas, 1 señal, 0 defectos), recorrido real de Chromium, pestaña «Cierre» y paquetes.

## Coste
100 partidos en ≈22,8 s con 4 workers (objetivo 5 s). 200 partidos: ≈46 s **estimado, no ejecutado**.

## Límites declarados
Semillas SEM15 sin calibrar; consecuencias de interferencia provisionales; 45.4.x sin lectura directa; sin generación natural de técnicas ni desvío de asistencia; fuentes FIBA ilegibles (HTTP 403).

## No ejecutado
Recorrido manual de Dennis, otros navegadores, Node 24, 200 partidos reales, campaña de MOTOR-16.

Ver `04-HALLAZGOS.csv` para el detalle de lo hallado y corregido.
