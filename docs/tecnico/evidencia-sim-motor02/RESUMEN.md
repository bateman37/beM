# SIM-MOTOR-02 · resumen de la evidencia

Los paquetes completos están **fuera de Git** (`out/sim-motor02/entrega-final/`, regenerables con `node scripts/sim02-package.js` y verificables con `node scripts/sim02-verify-delivery.js`). Este resumen recoge las cifras reales de su última generación.

| Comprobación | Resultado |
|---|---|
| Suite completa | 307/307 (≈149 s) |
| Verificación de paquetes | integridad 11/11 · contenido 39/39 · no evaluado: calidad deportiva, FIBA integral, recorrido manual |
| Chromium | 43 pasos · consola 0 · red 0 · recargas reales (jornada y lotes) · cuatro descargas verificadas por bytes |
| Lote real interrumpido (SIGKILL) | 40 casos; parada con ≥ 8 confirmados; 0 inconsistentes; un aceptado por caso; 0 duplicados |
| Jornada mixta | 5 encuentros (1 detallado); 25 barreras; equivalencia por cuartos/pausa/guardado igual a completar |
| Temporada de prueba | 72 encuentros (2 detallados tras activar la dirección); movimiento con tramos por club; reimportar no suma |
| Referencia detallada | 83–98 y 6.684 sorteos; 0 archivos deportivos modificados |
| Rendimiento | P02-F 8,30 s; calientes 5,15 / 5,52 / 5,91 s; objetivo de 5 s **no alcanzado**; esenciales 15,4 MiB; RSS 851 MiB |
| Jornada de 1.000 simultáneos | 14,4 s de avance coordinado; 1.000/1.000 válidos; RSS 2,3 GiB |

Contenido de los ZIP: `SIM-MOTOR-02-revision-rapida.zip` (≈0,3 MiB; `00-LEEME.md` … `15-PENDIENTES-SIM03.md` y `ejemplo/`) y `SIM-MOTOR-02-evidencia-detallada.zip` (≈2,3 MiB: jornada, escenarios, snapshots, lote real, temporada, aprendizaje, muestra esencial y código de solo lectura), más `SIM-MOTOR-02-indice.json` y `SIM-MOTOR-02-verificacion-final.json`.
