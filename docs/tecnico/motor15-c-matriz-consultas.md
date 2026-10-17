# Matriz consulta → dato → nivel de registro (MOTOR-15 §11.4)

Versión `MAT-MOTOR15-R1` · generada por `node scripts/build-query-matrix.js` desde `data/batch/matriz-consultas-motor15.json`.

Los tres niveles usan el MISMO resolutor: trayectoria deportiva, sorteos, estados y acta idénticos para las mismas entradas y versión. Solo cambia lo que se conserva.

| ID | Consulta | Dato | Completo | Reducido | `world-essential` | Dónde (esencial) |
|---|---|---|---|---|---|---|
| Q01 | Identidad, versiones, estado y resultado de cancha frente a adjudicado | `identity + result (court_score, administrative)` | sí | sí | sí | result, identity |
| Q02 | Parciales y duración | `result.period_scores, game_tenths` | sí | sí | sí | result |
| Q03 | Acta individual (minutos, tiros, puntos, créditos, faltas, DNP) | `acta.players` | sí | sí | sí | acta.players |
| Q04 | Acta colectiva (totales, colectivos, faltas por periodo, tiempos muertos) | `acta.teams` | sí | sí | sí | acta.teams |
| Q05 | Series de libres y finalizaciones F | `acta.series, acta.finals` | sí | sí | sí | acta.series, acta.finals |
| Q06 | Créditos y trazabilidad de asistencias y rebotes | `acta.credits` | sí | sí | sí | acta.credits |
| Q07 | Posesiones beM (origen, cierre, puntos) y partición de puntos | `acta.possessions, acta.partition` | sí | sí | sí | acta.possessions |
| Q08 | Secuencia de hechos (orden estable, referencias, créditos) | `sequence` | sí (hechos completos) | sí (hechos completos) | sí (filas compactas; sin intent/effects/params) | sequence.columns/rows |
| Q09 | Presencia: entradas/salidas, quintetos, on-off, mixtas | `presence.lineups, presence.intervals, sequence.lineup_*` | sí | sí | sí | presence |
| Q10 | Tiro: autor, sector funcional, valor, resultado/validez y causa | `shots` | sí | sí | sí | shots |
| Q11 | Tiro: preparación/oposición en categorías (calidad, defensor, cobertura, organización efectiva) | `shots.quality / defender / coverage / defense_org` | sí | sí | sí (categorías; sin probabilidades ni pesos) | shots |
| Q12 | Cruce jugador × defensa de tiro | `shots.shooter × shots.defender` | sí | sí | sí (conservado por fila: los marginales por jugador y por defensa no bastarían y no se ofrecen como sustituto) | shots |
| Q13 | Táctica observada: familias ejecutadas, cobertura y organización efectivas por posesión | `tactics` | sí | sí | sí | tactics |
| Q14 | Dirección: órdenes, comandos y delegación efectiva del entrenador | `direction` | sí | sí | sí (órdenes y comandos; sin decisiones calculadas) | direction |
| Q15 | Estados propios por tramo (energía, Forma, momentos) autorizados | `states` | sí | sí | sí (registro de cambios y episodios; los valores internos solo en diagnóstico) | states |
| Q16 | Integridad: huella de trayectoria, sorteos consumidos, pasos, cobertura observada | `integrity` | sí (TRAY-MOTOR12-R1) | sí (TRAY-MOTOR12-R1) | sí (TRAYINC-MOTOR15-R1 incremental; `none` declarado si se desactiva) | integrity |
| Q17 | Conciliación del acta y conciliación analítica | `validity` | sí | sí | sí (modo `full`; `acta` solo si se declara) | validity |
| Q18 | Sorteos con ordinal y propósito | `sorteos.jsonl` | sí | sí | no (solo su cuenta y la huella) | — |
| Q19 | Decisiones calculadas con capacidad base/efectiva y pesos | `decisiones.jsonl` | sí | no | no | — |
| Q20 | Contrafactuales y sensibilidad +1/+3/+5 | `decisiones.jsonl + capacidades-uso` | sí | no | no | — |
| Q21 | Indicadores del catálogo MOTOR-10, ejecuciones y quintetos tabulados | `tablas/*.csv` | sí | sí | no tabulados (recalculables desde Q03–Q15 con la capa de análisis sobre el resultado reproducido) | — |
| Q22 | Relato / prosa | `relato` | opcional | opcional | no | — |
| Q23 | Paquete ZIP de análisis (MOTOR-12) y agregados del lote | `paquetes/` | sí | sí | no: el nivel esencial no genera tablas; la extracción es el JSON esencial | — |
