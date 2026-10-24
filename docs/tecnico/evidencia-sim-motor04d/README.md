# Evidencia pequeña de SIM-MOTOR-04D

Plan, reglas y resúmenes necesarios para reproducir y leer la entrega sin versionar `out/` (los paquetes completos están fuera de Git en `out/sim-motor04d/entrega-final/`).

- `plan/`: agenda congelada (DEV = las 48 entradas VAL de 04C reutilizadas con sus semillas; VAL04D nueva con semillas `20261024|SIM04D|VAL|<pareja-orientada>|R<réplica>`; CONTRAST = las 16 entradas de 04C), entradas materializadas, `plan.json`, reglas de selección (`SEL-SIM04D-R1`, `selection-rules.json`, con los 36 vectores completos) y las congelaciones (`freeze-dev.json` antes de DEV, `freeze-dev-verify-at-val.json`: nada deportivo cambió, `freeze-val.json` antes de la reserva).
- `11-SELECCION-DEV.json` (versión compacta): errores, `M04D`, `M04D_comparable`, guardas y causa de descarte de cada uno de los 36 vectores.
- `06-COMPARATIVA-ACTA-VAL.csv`, `06b-M04D-VAL.json`, `08-REBOTES-Y-RECUPERACIONES-VAL.csv`, `09-ASISTENCIAS-VAL.csv`: lectura de VAL04D (acta DET frente a SIM, rebotes y universos de AST).
- `12-RENDIMIENTO.json`, `13-COMPROBACIONES.json`, [`14-LIMITES-Y-DECISIONES.md`](14-LIMITES-Y-DECISIONES.md): coste real, comprobaciones y límites.
- `DICCIONARIO.md`: unidades, fórmulas, denominadores, porcentajes frente a puntos porcentuales, alias y nulos.
- Página técnica: [`../sim-motor04d.md`](../sim-motor04d.md).
