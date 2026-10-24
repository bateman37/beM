# SIM-MOTOR-04E · recorrido manual para Dennis

Unos doce pasos. La aceptación deportiva y manual es de Dennis: el recorrido automático de Claude Code (Chromium: 12 pasos, consola 0, red 0) **no** la sustituye. Arranque: `npm run dev` y abrir la dirección que muestre la consola.

| # | Qué hacer | Qué mirar (observable) | Señal de fallo |
|---|---|---|---|
| 1 | Pantalla de inicio → «Motor ultrarrápido (SIM)» | Aplicación `SIM-MOTOR-04E`; en la cabecera, **por separado**: detallado `beM-motor-0.18.2-SIM04E`, SIM `0.3.4-SIMMOTOR04E`, formato `beM-sim-match/3`, acta `EST-SIM04E-R1`, crédito de rebote `REBCRED-SIM04E-R1`, conciliación `RECON-SIM04E-R1` | Falta una de esas identidades o aparece `04D` |
| 2 | SIM → pestaña «Parámetros» | Tres candidatas en pantalla: `C04E-FINAL-PROVISIONAL` («provisional»; coincide con la base: es un **alias**), `C04E-EXPERIMENTAL` («EXPERIMENTAL, no recomendada») y las anteriores; ninguna está activa | La experimental aparece como recomendada o activa |
| 3 | Pulsa «Cargar `C04E-EXPERIMENTAL` como borrador» | Mensaje de **borrador** con 22 filas distintas de la base; el perfil base no cambia hasta que actúes | Se aplica sin acción tuya |
| 4 | «Restaurar la base» | «Perfil restaurado a la base»; sin filas editadas | Quedan filas editadas |
| 5 | Pestaña «Partido»: EQ03 contra EQ04, semilla `20261024` → «Generar» | Marcador de cierre (en esta entrega, EQ03 90–73 EQ04), «conciliación 27/27» y `beM-sim-match/3` | Conciliación con fallos |
| 6 | Vista «Ataque» | `putback` como familia propia; fichas solo con ejecuciones organizadas | `putback` repartido en fichas POS |
| 7 | Vista «Exportar»: JSON, CSV, Markdown y guardado | Cuatro descargas reales no vacías; el JSON abre y declara `beM-sim-match/3` | Descarga vacía o ilegible |
| 8 | Cargar el guardado que acabas de descargar | «restaurado en t = …» con la revisión `0.3.4-SIMMOTOR04E`; la continuación acaba con el mismo marcador | Marcador distinto al continuar |
| 9 | Cargar `tests/fixtures/sim-snapshot-04d.json` (guardado REAL de 04D; el campo `snap` es el contenido) | «Guardado rechazado»: «SIM-MOTOR-04E añade el crédito colectivo de rebote tras tapón fuera…»; el archivo no cambia | Se acepta o se modifica el archivo |
| 10 | En una terminal: `node scripts/run-match.js 20261016` (partido de referencia del **detallado**) | «Equilibrado 87 – 108 Exterior» con parciales 15‑32 · 20‑21 · 20‑27 · 32‑28 (6.733 sorteos); la referencia histórica de 04D era 83–98 (6.684) | Marcador histórico 83–98 con el motor `0.18.2` |
| 11 | En el acta del detallado de cualquier partido con tapones | El rebote tras tapón aparece acreditado (individual si el balón sigue vivo, de **equipo** si sale fuera, sin jugador inventado); el total de equipo = suma individual + colectiva | Un tapón sin crédito ni causa |
| 12 | Pestaña «Jornada» | Se abre sin errores; una jornada mixta (DET + SIM) avanza y se recupera tras recargar | Error en consola o resultado distinto tras recargar |

**Qué no está hecho por esta guía**: calibración, equivalencia estadística, rendimiento a 1.000 partidos ni aceptación deportiva. Casos de reloj: con el detallado no debe aparecer una expiración «de periodo» con el reloj de juego positivo (se puede buscar en la crónica del partido: `fin: periodo` solo con el reloj de juego a 0).
