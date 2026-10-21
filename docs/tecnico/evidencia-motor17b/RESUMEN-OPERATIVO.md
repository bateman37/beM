# Resumen operativo de MOTOR-17B (generado por `scripts/m17b-summary.js` desde los archivos finales)

Sin ensayo deportivo: cantidades, estados y diferencias mecánicas. Interpretación deportiva: ChatGPT. Aceptación: Dennis. **30 casos lógicos no son 72 observaciones independientes**: las doce ejecuciones diagnósticas repiten esenciales y los cálculos +1/+3/+5 no son partidos nuevos.

## 1 · Base real
| Etapa | Commit |
|---|---|
| **CONTROL17** (MOTOR-17, ejecutable e inmutable, worktree aislado) | `01c8ade65fd4f3c656f5e008c3277df062abc9ab` (Git limpio: true) |
| **M17B · implementación auditada** (congelada antes de simular) | `f67113e81353da4d464e8bc62544d28b2dbcb8fa` (Git limpio en la congelación: true) |

Motor M17B `beM-motor-0.17.1-MOTOR17B` (CONTROL17 `beM-motor-0.17.0-MOTOR17`), aplicación `MOTOR-17B`, política `EST-MOTOR17B-R1` / `ACTA-MOTOR17B-R1` (CONTROL17 `EST-MOTOR17-R1`), conservación esencial `ESE-MOTOR17B-R1` (CONTROL17 `ESE-MOTOR17-R1`), proyección de auditoría `PRJ-MOTOR17B-R1`.
Perfiles: **P0** `…61017+SEM-MOTOR17-20261018+SEM-MOTOR17B-20261021` (gasto por minuto vivo 2) y **P1** = P0 + C17-02 (gasto 3.5; referencia provisional, no calibración externa ni aceptación manual). Entradas, órdenes y semillas idénticas entre versiones: **true**. Node v22.22.0, 4 CPU (Intel(R) Xeon(R) Processor @ 2.80GHz), 16 GiB.

## 2 · Campaña `MOTOR17B-CIERRE-20261021` (cantidades reales)
| Ejecuciones | CONTROL17 | M17B |
|---|---:|---:|
| A · esenciales (12 enfrentamientos, ida/vuelta) | 24 | 24 |
| B · esenciales (seis casos de cierre) | 6 | 6 |
| Diagnósticas (repiten esenciales; A: p = 1, 2, 5, 7, 9, 11; B: los seis) | 0 | 12 |
| **Total** | **30** | **42** |

Total de ejecuciones de partido: **72** (planificadas 72). Todas terminadas y válidas: **sí**; fallos: 0; reintentos: 0; excluidas: 0. Fuera de esta cuenta: suite, reproducciones dirigidas (cinco pérdidas históricas), ensayo técnico previo de la herramienta (descartado) y el recorrido de navegador.

## 3 · Comparación causal CONTROL17 → M17B (mismo deporte salvo lo autorizado)
30 casos comparados; **iguales en lo deportivo: todos**. Créditos de robo: CONTROL17 424 → M17B 433 (diferencia autorizada). Conservado idéntico: marcador, parciales, posesiones y orden de los hechos; relojes, décimas consumidas, participantes y quintetos; sorteos (número) y pasos; tiros y sus categorías (sin los campos de organización); minutos, sustituciones, energía final, estados y episodios; órdenes, comandos y decisiones del entrenador; acta de jugadores y equipos sin robos ni valoración. Autorizado: créditos de robo (acta, eventos) y su procedencia (`fuente`, `contacto`); valoración (`val`) derivada de los robos; política de acta (ACTA-MOTOR17B-R1) e identidades de versión; conservación esencial (ESE-MOTOR17B-R1: campos de organización defensiva); huella de trayectoria (incluye las estadísticas). Detalle por caso: `09-COMPARACION-CONTROL17-M17B.csv`; desviaciones con ejemplos: `09b-DESVIACIONES-Y-DIFERENCIAS-AUTORIZADAS.json`.

## 4 · Cierres B17-01…05 (hallazgos en `01-HALLAZGOS-B17.csv`)
- **B17-01 organización efectiva**: 3818 filas de tiro con `defense_org` como código efectivo (valores que no son cadena: 0); origen, versión de plan y alternativa declarados.
- **B17-02 sensibilidad**: 32/32 capacidades con salida pertinente contrastada (32 exactas; aproximadas 0; pendientes 0); 768 filas en 256 contextos (máx. 8 por capacidad); filas con la base que no coincide: 0.
- **B17-03 AUD05**: resultado **conforme** (derivado de la evidencia, no fijo); observadas 32, sin exposición 0, observadas sin entradas 0. Alcance: contraste REPRESENTATIVO de cálculo fijo (hasta ocho contextos reales por capacidad, +1/+3/+5) sobre las funciones de producción; no es un efecto en un marcador ni acredita todas las combinaciones de tarea, estado y participante.
- **B17-04 crédito de robo**: en los doce diagnósticos, pérdidas vivas con crédito 169 y sin crédito 0; las cinco pérdidas históricas sin interceptor se reprodujeron (mismo hecho y recuperador: true; creditadas al recuperador por control conservado: true).
- **B17-05 evidencia final**: ver §7.

## 5 · Auditorías AUD01–32 (M17B, doce diagnósticos; una sola ejecución es el origen de `resumen.json`, los CSV, el informe y la interfaz)
Por resultado: {"conforme":16,"inconcluso":14,"señal":1,"no_evaluado":1}. Lectura: 12 partidos (12 completos), integridad verificada antes de interpretar. Las 14 inconclusas son las quince de MOTOR-17 menos AUD05 (que se deriva de la evidencia por B17-03): siguen en su estado justificado, sin cambios de umbral, etiquetas o exclusiones.

## 6 · Cadenas de saque y coste de la campaña
Cadenas (diagnósticos): {"ejecutada":1031,"interrumpida_fin_periodo":21}. Coste real ejecutado: CONTROL17 7 lotes, 10.5 s de pared (suma de lotes), pico RSS 537 MiB; M17B 14 lotes, 37.2 s de pared (suma de lotes), pico RSS 1202 MiB. Medido en esta campaña (72 ejecuciones planificadas, tamaños de lote de 1 a 24); NO sustituye al benchmark frío de cien/doscientos ni se extrapola a esos tamaños. El objetivo heredado de cinco segundos para cien partidos sigue abierto.

## 7 · Comprobaciones (comprobado por Claude / pendiente de Dennis / no ejecutado)
| Comprobación | Estado |
|---|---|
| Suite `npm test` sobre el código final | correcto (218/218, fallos 0) |
| `npm run data:check` | correcto |
| Comprobador documental en copia limpia | correcto — RESULTADO: 1 comprobaciones fallidas. |
| Recorrido de Chromium (interfaz) | FALLIDO (16/17 pasos; consola 0; red 0) |
| Perfil anterior → tarjeta → copia explícita | no ejecutado |
| Descarga real desde los enlaces de la aplicación | **ver el recibo externo** `MOTOR-17B-verificacion-final.json` (se genera DESPUÉS de empaquetar y no puede ir dentro de los ZIP) |
| Comprobador de la entrega (`m17b-verify-delivery.py`) | **ver el recibo externo** `MOTOR-17B-verificacion-final.json` |
| Recorrido manual de Dennis | **pendiente de Dennis** |
| Otros navegadores · Node 24 · pruebas visuales extensivas | no ejecutado |

## 8 · Pendientes (ejes que MOTOR-17B NO cierra)
Calibración deportiva general (C17-02 es referencia provisional); rendimiento masivo del manager (cien en cinco segundos sin alcanzar: no se midió aquí); aceptación manual de Dennis; conformidad FIBA integral (no certificada; criterio de robo: síntesis de ChatGPT, sin lectura directa por Claude).
