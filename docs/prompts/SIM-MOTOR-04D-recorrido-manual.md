# SIM-MOTOR-04D · recorrido manual para Dennis

Perfil requerido: el perfil activo por defecto (las filas nuevas están en su valor neutral). Ningún paso usa un marcador concreto como criterio deportivo. Aplicación: `npm run dev`, motor «SIM» (modelo estadístico). Los pasos 1–10 reproducen lo que comprobó Chromium, pero el recorrido completo es tuyo.

| # | Paso | Semilla / datos | Resultado observable | Señal de fallo |
|---|---|---|---|---|
| 1 | Abrir la aplicación y elegir el motor SIM | — | La cabecera muestra `SIM-MOTOR-04D` y SIM `0.3.3-SIMMOTOR04D`; versión del detallado, perfil, esquema de resultado y dataset se muestran por separado; el perfil activo no cambia de forma silenciosa | Versión anterior; candidata ya aplicada al abrir |
| 2 | Parámetros → tarjeta «Filas nuevas de SIM-MOTOR-04D» | — | Seis filas (`shotMix.midrangeWeightFactor` 1, `conversion.simRimLogitOffset` 0, `outcomes.simOrdinaryTurnoverWeightFactor` 1, `outcomes.simStealGivenEligibleTurnoverLogit` 0, `outcomes.simShootingFoulWeightFactor` 1, `assist.spontaneousPassOddsFactor` 1) con rango, unidad, procedencia y efecto; `assist.receivedAdvantageP0` admite ahora [0, 1] | Faltan filas o aparecen con valor distinto del neutral |
| 3 | Cargar `C04D-FINAL-PROVISIONAL` como borrador (acción explícita) | — | Mensaje de borrador provisional; 16 filas visibles; la base no cambia; «Restaurar base» la deshace; la tarjeta indica que coincide con el control (alias de Z0-A0) | Se activa sin pulsar; no se puede restaurar |
| 4 | Partido EQ03–EQ04 con la base | 20261024 | Se genera completo; «conciliación 27/27» | Conciliación con fallos |
| 5 | Mismo partido con la candidata cargada | 20261024 | En Diagnóstico: R27 correcta; las canastas tras rebote ofensivo aparecen como familia `putback` (continuación inmediata) o con ficha propia (reinicio organizado), no como una ficha POS ejecutada de nuevo | Putback atribuido a una ficha POS; asistencia de un jugador a sí mismo |
| 6 | Cambiar `assist.spontaneousPassOddsFactor` a 2 y `outcomes.simStealGivenEligibleTurnoverLogit` a 0,7 y jugar el mismo partido | 20261024 | Partido válido; más entregas espontáneas y más robos; los robos siguen siendo de un defensor del rival; ninguna asistencia a sí mismo | Robo en falta ofensiva o violación; partido no terminado |
| 7 | Exportar guardado, recargar y continuar con las filas activas | — | «restaurado en t = …» y continuación con el mismo desenlace | No restaura |
| 8 | Cargar el guardado real de 04C (`tests/fixtures/sim-snapshot-04c.json`, campo `snap`) | — | «rechazado» con la explicación; el archivo no cambia; la sesión activa conserva su resultado | Lo acepta o borra la sesión |
| 9 | Jornada mixta: avanzar cuatro barreras, guardar con un terminado y otro activo, recargar y recuperar | — | Recupera con el terminado publicado; al completar, tabla final y actas selladas | Desaparece el terminado; duplica noticias |
| 10 | Descargar JSON, CSV, Markdown y el guardado | — | Se descargan con contenido | Descarga vacía |

Qué queda de tu lado: aceptación deportiva (la candidata coincide con el control de 04C; ver las bandas incumplidas en `docs/tecnico/sim-motor04d.md`) y las decisiones pendientes de §9 de esa página.
