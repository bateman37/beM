# MOTOR-14 — Recorrido manual para Dennis

Arranque: `npm run dev` → `http://localhost:5173/`. Perfil: base de MOTOR-14 (`…+SEM-MOTOR14-20261017`; activación explícita desde el Panel si el activo es anterior). Semilla de referencia `20261016` (83–103). Estado de lo comprobado por Claude: ver [motor14.md](../tecnico/motor14.md); **la interfaz de guardados NO se recorrió en navegador por Claude**.

| # | Pasos | Resultado observable | Señal de fallo |
|---|---|---|---|
| 1 | Abrir la web; mirar cabecera y consola del servidor | «MOTOR-14» en ambas; perfil/formatos por separado | otra versión |
| 2 | Partido → modalidad «Por tiempo» → Preparar → Iniciar; cambiar x2/x4/x8/x16, pausar, abrir una ficha, volver | marcador y relojes no cambian por leer o pausar | cambia el deporte al pausar |
| 3 | En curso, sección «Guardar y continuar» → Guardar ahora | mensaje con `SAVE-…`, el partido sigue donde estaba | error o partido avanzado |
| 4 | Parar el servidor (`Ctrl+C`), `npm run dev`, Partido → «Guardar y continuar» → Actualizar lista → Continuar | badge «Rama de laboratorio…», mismo marcador/reloj/periodo; el guardado original sigue en la lista | continuar re-simula o cambia el marcador |
| 5 | Descargar un guardado y alterar un byte (copia); colocarlo como otro `SAVE-…` | no aparece como continuable / «copia alterada» | se acepta |
| 6 | Terminar el partido continuado y comparar con uno sin interrupción (misma semilla y plan) | mismo marcador final (83–103) | difiere |
| 7 | Por cuartos y simulado total con la misma entrada | mismo marcador final | difiere |
| 8 | `npm run equivalence` y `npm run cost` | 8 comparaciones IGUAL; tabla de coste | alguna DIFIERE |
| 9 | Auditorías → AUD29 (con el informe de `out/equivalence/`) | conforme/inconcluso con familias cubiertas | defecto |
| 10 | Auditorías → matriz de capacidades de un lote **nuevo** con diagnóstico completo | TEC17, TEC18, MEN02, MEN03, MEN06, MEN07, FIS06 con usos y contraste +1/+3/+5 | «sin receta registrada» en lote nuevo |
| 11 | Inferioridad: ver `tests/motor14.test.js` grupo 6 o `src/engine` (`retirePlayer`) | 4→3→2 en pista sin jugador fantasma; <2 listos = adjudicado distinto del marcador de cancha | error de ejecución |

No ejecutado por Claude: pasos 2–7 en navegador, lotes de 100/1000, Node 24, otros navegadores. Pendiente de Dennis: aceptación funcional (también MOTOR-08 a MOTOR-13).
