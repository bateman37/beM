# SIM-MOTOR-03 · nota de resultados de la campaña (redactada DESPUÉS de ejecutar)

Plan previo (escrito antes de ejecutar): [`sim-motor03-plan.md`](sim-motor03-plan.md). Correcciones: [`sim-motor02b.md`](sim-motor02b.md). Esta nota solo recoge **hechos de ejecución, recuentos y límites**; no interpreta el deporte ni propone calibración (eso es de ChatGPT y de SIM-MOTOR-04).

## Ejecución real
- Código congelado: `24187fe` (rama `claude/busy-edison-b1fmnc`, PR [bateman37/beM#21](https://github.com/bateman37/beM/pull/21)); `freeze.json` y `node scripts/sim03/freeze.js --mode=verify` (277 archivos vigilados, plan y 79 archivos deportivos del detallado: ninguno cambiado frente a `4194158`). La campaña arrancó con el árbol limpio.
- Detallado congelado: referencia 83–98 con 6.684 sorteos intacta.
- Una sola ejecución de la campaña, sin reintentos ni incidencias (`incidents.jsonl` vacío):

| Bloque | Resolutor | Solicitados | Válidos | No válidos | Fallidos | Interrumpidos | No ejecutados |
|---|---|---:|---:|---:|---:|---:|---:|
| A | SIM | 1.056 | 1.056 | 0 | 0 | 0 | 0 |
| B | SIM | 512 | 512 | 0 | 0 | 0 | 0 |
| C | SIM | 64 | 64 | 0 | 0 | 0 | 0 |
| A | detallado | 48 | 48 | 0 | 0 | 0 | 0 |
| B | detallado | 24 | 24 | 0 | 0 | 0 | 0 |

- Extras de verificación (aparte): 16 repeticiones técnicas E, 5.000 ejecuciones de rendimiento F (cuatro pasadas de mil + jornada de mil, repetidas en dos rondas y en el control), cuatro detallados del lote diagnóstico de auditoría, pruebas, recorrido de Chromium y muestras de perfilado.
- Mecánico (no es una conclusión): puntos medios por equipo-partido (desv. típica muestral) — SIM A 94,54 (15,99; sin prórrogas 94,29; 24/1.056 partidos con prórroga), SIM B 93,06, SIM C 96,48, detallado A 82,32 (15,91; 2/48 con prórroga), detallado B 80,69. La señal previa de 02 (94,517) no es una meta.

## Datos entregados
`out/sim-motor03/entrega-final/` (fuera de Git): `SIM-MOTOR-03-revision-rapida.zip` (0,88 MiB), `SIM-MOTOR-03-evidencia-detallada-parte1…4.zip` (1,5 / 12,0 / 13,8 / 5,7 MiB) y `…-LEEME.zip`, `SIM-MOTOR-03-indice-partes.json` y `SIM-MOTOR-03-verificacion-final.json` (28 comprobaciones del comprobador offline, 0 fallos, 4 «no evaluado» declarados). Regenerar: `node scripts/sim03/make-tables.js && node scripts/sim03/package.js && node scripts/sim03/verify-delivery.js` (los registros brutos de la campaña viven en `out/sim-motor03/campaign/`).

## Equivalencia técnica (E)
Ocho casos × {E1 un worker por instantes/cuartos con consultas; E2 cuatro workers con guardado/serialización/restauración y nivel Análisis}: **16/16 iguales** en las seis secciones deportivas (marcador y periodos, acta, presencia/quintetos/tiempos, órdenes/decisiones/contexto, azar y ordinal, zonas/familias/exposición/estados) frente al control ya ejecutado. El comprobador offline recalcula esas comparaciones desde los datos.

## Rendimiento (límite real, no atribuido a hardware sin control)
Mismo código con las correcciones funcionales y sin las optimizaciones (control `ee14ec5`) frente al final, en la **misma sesión y máquina**, dos rondas alternadas; política automática activa; esencial individual completo transportado (cuatro workers):

| Código | F0 (proceso nuevo) | F1 | F2 | F3 |
|---|---:|---:|---:|---:|
| control, ronda 1 | 13,92 s | 9,62 s | 9,40 s | 9,67 s |
| **final**, ronda 1 | **12,37 s** | **9,20 s** | **8,78 s** | **8,41 s** |
| control, ronda 2 | 12,44 s | 9,45 s | 8,44 s | 9,70 s |
| final, ronda 2 | 13,24 s | 8,89 s | 8,18 s | 8,73 s |

- **Objetivo de 5 s: NO cumplido** en ninguna pasada ni ronda (margen negativo de ≈3–9 s). Esta máquina es ≈1,7× más lenta que la sesión en la que 02 midió 8,30 s / 5,15–5,91 s: el código de 02 medido aquí dio ≈11,5 s / ≈8 s, por lo que las diferencias entre sesiones no se atribuyen a mejoras ni a regresiones.
- Las optimizaciones exactas dan una mejora pequeña (≈5–8 % en caliente; dentro del ruido de una pasada a otra) con **1.000/1.000 huellas por caso idénticas** al control y entre pasadas. El coste de la política (corrección C03-11) quedó dentro del ruido; no se atribuye a calibración ni a optimización.
- Jornada de mil simultáneos (pool de cuatro workers, barreras de 120 s, paquetes públicos, clasificación y esenciales al terminar): ≈19 s para completarla (final, 19,0 / 19,4 s; control 21,3 / 18,8 s), 1.000/1.000 válidos; **RSS máximo ≈2,66 GiB** frente a ≈2,31 GiB del control: las cachés entre tramos y la vista incremental aumentan la memoria (≈15 %). La compactación del estado al terminar sigue siendo la liberación de SIM del trabajador; no se buscó una tercera línea de optimización tras congelar.
- Percentiles de actualización de barrera, mensajes/bytes, ocupación por worker y memoria por barrera: `12-RENDIMIENTO.json`.

## Auditorías, historia y aprendizaje
- AUD01–32 ejecutadas sobre un lote diagnóstico de los cuatro detallados de la muestra (sus marcadores coinciden con la campaña): 32 auditorías, 2 hallazgos (cobertura de ESP no expuestos; cadena de saque interrumpida por fin de periodo, informativa). Las conciliaciones R01–R23 de SIM se cumplen en los 1.632 casos. Lo no aplicable a SIM se declara.
- Historia: 72 resultados de A (rondas ficticias), ledgers SIM y mixto (13 detallados), conciliaciones y comprobaciones superadas; movimiento administrativo solo en copia y a la ronda siguiente. Aprendizaje: seis pares, 633 filas jugador·modelo·Polivalencia 8/16/24, sin dosis sin participación y sin presupuesto adicional por más eventos.

## Límites y pendientes
Ver `15-PENDIENTES-Y-LIMITES.md` del paquete: referencia externa pendiente de investigación por ChatGPT; limitaciones de instrumentación de las sondas; calibración (SIM-MOTOR-04); recorrido manual de Dennis; objetivo de rendimiento abierto.
