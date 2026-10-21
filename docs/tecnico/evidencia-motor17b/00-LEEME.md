# Evidencia de MOTOR-17B para ChatGPT

**Lectura inicial.** MOTOR-17B cierra los pendientes concretos de la revisión independiente de MOTOR-17 (B17-01…05) sobre la base del partido que Dennis considera correcta. No es una campaña de calibración ni de rendimiento: la interpretación deportiva corresponde a ChatGPT y a Dennis, y los números de esta carpeta se generan desde los archivos finales (nada se copia a mano).

## Orden de lectura

1. `01-RESUMEN-OPERATIVO.md` — cantidades reales, base de Git, comparación CONTROL17 ↔ M17B, cierres B17-01…05 y estado de cada comprobación (comprobado por Claude · pendiente de Dennis · no ejecutado).
2. `02-HALLAZGOS-B17.csv` — por hallazgo: causa, cambio, consumidor, prueba/evidencia y estado final.
3. `03-IDENTIDADES-Y-GIT.json` y `04-PLAN-CONGELADO/` — commits completos, perfiles P0/P1, versiones, entorno y el plan legible y de máquina (plan congelado antes de simular).
4. `05-RESULTADOS/` — tablas (mapa de casos, ejecuciones, equipos, jugadores, comparación CONTROL17 ↔ M17B, organización efectiva, embudo de robos, cadenas de saque, coste). Diccionario: `11-DICCIONARIO.md`.
5. `06-AUDITORIA-Y-SENSIBILIDAD/M17B/` — AUD01–32, matriz de 32 capacidades, sensibilidad con la salida de la operación real y `contextos-contraste.jsonl`.
6. `07-EVIDENCIA-DE-CAUSAS/`, `08-LOGS-DE-EJECUCION/`, `09-PRUEBAS-Y-DATOS/`, `10-NAVEGADOR/`.

## Qué es y qué no es esta muestra

- 72 ejecuciones planificadas = 30 casos lógicos en CONTROL17 + 30 en M17B + 12 diagnósticos de M17B que **repiten** esenciales. No son 72 observaciones independientes y no estiman medias de liga. Los cálculos +1/+3/+5 no son partidos nuevos.
- Plan, semillas y casos se congelaron antes de simular; no se ajustó ningún parámetro tras ver resultados, no se eligieron semillas y no se excluyó ningún caso válido. Un ensayo técnico previo de la herramienta de campaña (mismas definiciones, directorio descartado) se declara en `docs/tecnico/motor17b.md`.
- P1 (C17-02, gasto 3,5) es una referencia provisional. Calibración deportiva general, rendimiento masivo del manager, aceptación manual y conformidad FIBA integral **no** se cierran aquí.

## Reproducir y comprobar

`python3 scripts/m17b-verify-delivery.py` comprueba mecánicamente integridad, recuentos, claves, enlaces, pertenencia, comparación de versiones, semántica de la organización efectiva, alcance de la sensibilidad, coherencia AUD05 y la existencia/resultado de las evidencias finales. No otorga aceptación deportiva. Su recibo (`MOTOR-17B-verificacion-final.json`) y la prueba de descarga real están fuera de los ZIP.
