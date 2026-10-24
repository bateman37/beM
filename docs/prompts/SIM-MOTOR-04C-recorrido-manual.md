# SIM-MOTOR-04C · recorrido manual para Dennis

Perfil requerido: el perfil activo por defecto (las filas nuevas están a 0). Ningún paso usa un marcador concreto como criterio deportivo. Aplicación: `npm run dev`, motor «SIM» (modelo estadístico).

| # | Paso | Semilla / datos | Resultado observable | Señal de fallo |
|---|---|---|---|---|
| 1 | Abrir la aplicación y elegir el motor SIM | — | La cabecera muestra `SIM-MOTOR-04C` y SIM `0.3.2-SIMMOTOR04C`; el perfil activo no cambia de forma silenciosa | Versión anterior; candidata ya aplicada al abrir |
| 2 | Parámetros → tarjeta «Filas nuevas de SIM-MOTOR-04C» | — | `rebound.organizedResetP0`, `opportunity.simInsideQualityLogit` y `conversion.simInsideLogitOffset` en 0, con rango, unidad, procedencia y efecto | Faltan filas o aparecen con valor distinto de 0 |
| 3 | Cargar `C04C-FINAL-PROVISIONAL` como borrador (acción explícita) | — | Mensaje «cargada como BORRADOR (provisional…)»; diferencias visibles (10 filas); la base no cambia; «Restaurar base» la deshace | Se activa sin pulsar; no se puede restaurar |
| 4 | Partido EQ03–EQ04 con la base | 20261023 | Se genera completo; «conciliación 27/27» | Conciliación con fallos |
| 5 | Partido con la candidata cargada | 20261023 | En Diagnóstico: R27 correcta; las canastas tras rebote ofensivo muestran fichas y asistencias; el diagnóstico no inventa pases | R27 en fallo; asistencia de un jugador a sí mismo |
| 6 | Mismo partido con la base y con la candidata | 20261023 | Los marcadores pueden diferir; ambos son partidos válidos | Partido no terminado |
| 7 | Exportar guardado, recargar y continuar | — | «restaurado en t = …» y continuación | No restaura |
| 8 | Cargar el guardado real de 04B (`tests/fixtures/sim-snapshot-04b.json`, campo `snap`) | — | «rechazado» con la explicación; el archivo no cambia; la sesión activa conserva su resultado | Lo acepta o borra la sesión |
| 9 | Jornada mixta: avanzar cuatro barreras, guardar con un terminado y otro activo, recargar y recuperar | — | Recupera con el terminado publicado; al completar, tabla final y actas selladas | Desaparece el terminado; duplica noticias |
| 10 | Descargar JSON, CSV, Markdown y el guardado | — | Se descargan con contenido | Descarga vacía |

Qué queda de tu lado: aceptación deportiva de `C04C-FINAL-PROVISIONAL` (eA, eZ, e2 y eR quedan fuera de banda; ver `docs/tecnico/sim-motor04c.md`) y las preguntas de §8.
