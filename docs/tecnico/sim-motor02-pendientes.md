# SIM-MOTOR-02 · pendientes y decisiones para SIM-MOTOR-03

Detalle ampliado en `15-PENDIENTES-SIM03.md` del paquete de evidencia. Resumen:

- **Rendimiento**: el límite de 5 s con cuatro workers no queda acreditado (frío 8,30 s; calientes 5,15–5,91 s). Hace falta perfilar la generación (flujo plano: `shotCells`, recolección de basura, serialización) y valorar optimizaciones exactas; la jornada de 1.000 simultáneos usa ≈2,3 GiB.
- **Aproximaciones de 01 conservadas** (no recalibradas): transición esperada y tensión por periodo; ritmo común por tramo.
- **Calidad deportiva sin validar** frente al detallado ni a competiciones reales: los cambios de resultado de esta entrega se deben a correcciones y funciones aprobadas, no a ajustes de coeficientes.
- **No representado**: alternativas de pase, cadenas de ayudas, movimientos, saques tácticos; ataques mixtos «no aplica».
- **Decisiones nuevas para Dennis**: convención de clasificación de laboratorio; edades en el cierre de temporada; registros compactos que exigirán los lectores definitivos del nivel «Simulada».
- **Aceptación manual**: recorrido de [`SIM-MOTOR-02-recorrido-manual.md`](../prompts/SIM-MOTOR-02-recorrido-manual.md), pendiente de Dennis.
