# Evidencia pequeña de SIM-MOTOR-04

Resúmenes y plan necesarios para reproducir la entrega sin versionar `out/` (los paquetes completos están fuera de Git en `out/sim-motor04/entrega-final/`).

- `plan/`: agenda congelada, entradas materializadas, reglas de selección (`SEL-SIM04-R1`) y las dos congelaciones (`freeze-cal.json`, `freeze-val.json`).
- `03`, `04`, `07`, `08`, `08b`, `08c`, `08d`, `09e`, `10`, `12`, `13`: copias de los archivos de la revisión rápida con el mismo nombre (parámetros y candidatas, recuento, selección CAL, comparativa VAL, distribuciones, lectura, estrés, suficiencia de contrastes, capacidades, equivalencia y rendimiento).
- El índice de los ZIP (`SIM-MOTOR-04-indice-partes.json`) y el recibo del comprobador offline (`SIM-MOTOR-04-verificacion-final.json`) se generan fuera de Git junto a los paquetes (circularidad con el hash del propio commit); `scripts/sim04/verify-delivery.js` los produce.
- `DICCIONARIO.md`: unidades, universos, claves y semántica de ausencia. `fuentes-externas.json`: fuentes externas declaradas (validación parcial).

Regenerar: ver `docs/tecnico/sim-motor04.md` (sección «Reproducción»).
