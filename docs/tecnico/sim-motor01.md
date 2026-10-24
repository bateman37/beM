# SIM-MOTOR-01 — Generador estadístico por tramos y medición de 1.000 partidos

Primera de las cuatro entregas de SIM-MOTOR (roadmap v2). Encargo íntegro: [`../prompts/SIM-MOTOR-01-generador-y-rendimiento.md`](../prompts/SIM-MOTOR-01-generador-y-rendimiento.md). Recorrido de Dennis: [`../prompts/SIM-MOTOR-01-recorrido-manual.md`](../prompts/SIM-MOTOR-01-recorrido-manual.md). Pendientes: [`sim-motor01-pendientes.md`](sim-motor01-pendientes.md).

**Estado**: implementado y medido; **aceptación manual de Dennis pendiente**; calidad estadística **no validada** (los coeficientes de origen eran provisionales y traducirlos no los calibra).

## 1. Qué es y qué no es

SIM-MOTOR es **otro modelo de resolución**, alimentado por los mismos conceptos y datos de jugadores y planes que el motor detallado, que queda congelado como referencia deportiva de MOTOR-18C. Unidad de resolución: un **tramo** con quintetos estables (≤120 s; 30 s en la ventana final del cuarto periodo y de cada prórroga). Sobre un presupuesto conjunto de controles se generan **flujos agregados** y después se **materializan** sus registros (participantes, instantes, créditos). No se llama al resolutor detallado (comprobado estáticamente en `S01-10`), no se simulan posesiones, pases, ayudas ni desplazamientos y no hay simulación por segundos.

| Modelo | Uso previsto en el manager |
|---|---|
| Detallado (`src/match`, `src/engine`) | Partidos del equipo sénior dirigido por el usuario |
| SIM-MOTOR (`src/sim`) | Resto de partidos (cantera propia, demás ligas) y, en Referencia, la ejecución agrupada del mismo modelo |

## 2. Módulos (`src/sim/`)

| Archivo | Responsabilidad |
|---|---|
| `version.js` | `beM-sim-segment`, `beM-sim-match/1`, `SEM-SIM01-20261022`, versión `0.1.0-SIMMOTOR01` |
| `rng.js` | xoshiro128** sembrado con splitmix32; binomial, multinomial, redondeo aleatorio sin sesgo, `deriveSeed` (FNV-1a) |
| `profile.js` | Perfil SIM: 484 filas con ruta, valor, unidad, procedencia (`heredada` 468 · `derivada` 8 · `SEM-SIM01` 8) y efecto; candidatas validadas |
| `tables.js` | Tablas declarativas heredadas por referencia (15 fichas con salidas y roles, organizaciones, coberturas, políticas del entrenador) |
| `adapt.js` | Adaptador de entrada (`beM-match-input/6\|7`): validación localizada y vista normalizada sin modificar el original |
| `model.js` | Magnitudes del tramo (puras, sin azar): control, pérdidas, faltas, celdas de finalización, calidad, rebote, asistencia, libres |
| `engine.js` · `materialize.js` | `SimMatch`: estado, tramos, rotación, generación de registros, cronología con faltas/exclusión/bonus, periodos y prórrogas, avance/consulta/órdenes |
| `result.js` · `reconcile.js` | Contrato de resultado, acta, zonas, familias, quintetos, evolución, huella deportiva; 18 conciliaciones |
| `probe.js` · `capabilities.js` · `controls.js` | Sonda de magnitudes (distribución **antes** del sorteo), matriz de las 32 capacidades y de los controles |
| `schedule.js` · `cases.js` · `runner.js` · `pool.js` · `worker-node.js` · `worker-web.js` | Agenda congelada, caso de lote, trabajadores Node/Web y pool reutilizable |
| `teams.js` · `context.js` | Cruces EQ01–EQ12 con identidades de instancia; contexto serializable a trabajadores |

Fachada (`src/sim/index.js`): validar/normalizar (`validateSimInput`, `normalizeInput`), preparar contexto (`makeContext`), crear (`new SimMatch`), avanzar (`advance({until})`), consultar (`buildSimResult` sobre el prefijo publicado, sin azar), terminar (`finish`), construir/validar resultado (`buildSimResult`, `reconcileResult`). `playSimMatch` envuelve el avance; no hay dos implementaciones deportivas.

## 3. Generación (por tramo)

1. **Fronteras canónicas**: periodo, ventana final, exclusión, sustitución obligada y orden de plan programada. No dependen de cuántas veces se consulte ni de la velocidad de visionado. Una orden enviada entra en la siguiente frontera y devuelve su instante efectivo; programarla en la entrada con ese instante da el mismo partido (`S01-01`).
2. **Rotación** (política del plan, `ENTREF01–03`): vacantes, exclusión, faltas del librillo, energía crítica/de revisión con permanencia mínima, tramo largo y retorno de titulares; sin búsqueda de la mejor alineación.
3. **Magnitudes** (`model.js`), por equipo que ataca: capacidades efectivas (capacidad − severidad(energía) × tope de la receta), reparto defensivo por organización (interior primero; zonas con funciones y áreas; box and one con objetivo efectivo), pérdidas/faltas/tiros por control, mezcla de familias (prioridad × salida × adecuación × lectura, con `mixResolution` equivalente), transición esperada y decisiones espontáneas, calidad previa (cómoda/normal/forzada), rebote por participantes asignados, probabilidad de pase final, libres.
4. **Volumen compartido** (`§5.3`): segundos esperados por control = `16 × factor de ritmo` (acotado a [10, 24]); controles esperados por equipo = `duración/(sA+sB) × factor común` (factor uniforme en [0,92; 1,08] por tramo); redondeo aleatorio sin sesgo del total y alternancia estricta de control.
5. **Flujos**: multinomial de categorías terminales por control (pérdida, falta ofensiva, violación, falta de tiro, tiro de campo, balón suelto perdido), faltas sin tiro como flujo no terminal, reparto ponderado de celdas (ficha × salida × zona), tirador por adecuación, calidad, tapón, acierto, rebote (ofensivo → continuación con nuevas categorías terminales sesgadas al aro) y series de libres.
6. **Materialización cronológica** en dos fases: (1) por orden de tiempo se deciden las faltas (autor, víctima, bonus: la quinta falta de equipo del periodo da dos libres y sustituye al resto del control) y se detecta la primera **exclusión**; (2) se publican los hechos de los controles comprendidos. El control de la exclusión se completa; el resto del paquete generado **no se publica ni se contabiliza** (sin mover faltas al final ni reasignar créditos).
7. **Estados**: energía (gasto por minuto vivo × Resistencia × carga, recuperación de banquillo y descansos), Forma constante, momentos M-TIR/M-OFE/M-DEF por proceso de decaimiento con innovación de amplitud MEN06, momento colectivo T, importancia y presión conocidas en la frontera, familiaridad congelada (solo calidad de la oportunidad). Polivalencia **no** actúa durante el partido.

### 4.2 Unidades y aproximación principal (probabilidad por interacción → por control)

Las categorías del intento del detallado (`outcomes.base`: pérdida 0,12 · falta de tiro 0,09 · tiro de campo 0,675 · balón suelto 0,025 · falta ofensiva 0,015 · violación 0,01 · falta defensiva sin tiro 0,065) son **pesos por interacción**. SIM los usa como **pesos relativos de las salidas terminales de un control**: se normalizan sin la falta defensiva sin tiro (`derived.terminalMassBase = 0,935`), que no cierra el control salvo bonus y se genera como flujo propio (`dnRatio = peso/terminales`). Los multiplicadores de las ecuaciones (sensibilidades de control, falta y legalidad) se heredan sin cambio. Esta transformación es declarada como aproximación y es la principal fuente de diferencia estadística respecto al detallado.

## 4. Perfil, capacidades y controles

- **Perfil `SEM-SIM01-20261022`**: 484 filas editables por sección desde el laboratorio; las **ocho semillas nuevas** del encargo (`segment.*`, `volume.*`, `assist.*`) son las únicas filas `SEM-SIM01`. Las filas heredadas se comprueban contra su ruta en el perfil efectivo del detallado (diferencias = ninguna, `06-PARAMETROS.json`).
- **32 capacidades** (`capabilities.js`, `04-CAPACIDADES-32.csv`): cada una cambia al menos una magnitud esperada con +1/+3/+5 a contexto fijo (prueba `S01-05`).
- **Controles** (`controls.js`, `05-CONTROLES-Y-TABLAS.csv`): 7 estilos ofensivos, 5 defensivos, disposición, organización (incl. box and one), cobertura, altura de presión, media distancia, prioridades del libro y política del entrenador; todos cambian alguna distribución. Marcas, navegación, especiales defensivas, saques y roles se declaran **exclusivos del detallado** (sin efecto aparente).

## 5. Contrato de resultado `beM-sim-match/1`

`identity` (semilla, importancia, huella de entrada, equipos, perfil SIM y su huella, huella de tablas, perfil detallado de origen, entrada ignorada declarada) · `status`/`error` · `score` (actual, final, parciales, prórrogas, ganador solo si terminado) · `box.players` (min, PTS, T2/T3/TL, RO/RD, AS-C/AS-L, PER, ROB, TAP, TREC, FC/FR, +/-, VAL, DNP/indisponible, zonas por jugador con calidad y periodo) · `box.teams` (con rebotes y pérdidas de equipo como sujeto colectivo) · `controls` · `segments` (quintetos, controles, ritmo, organización efectiva, plan efectivo, corte) · `zones` · `families` (+ `familyDenominators`) · `quintets` (intervalos, minutos, producción) · `evolution` · `exposure` (segundos por posición y rol) · `events` (tipos `shot`, `ft`, `tov`, `reb`, `foul`, `shootfoul`, `sub`, `plan`, `period`, `end`, con enlaces de causa) · `reconciliation` (18 comprobaciones con universo y fallos) · `sportFingerprint`.

La huella deportiva (FNV de 64 bits sobre enteros) incluye la producción y el orden temporal comprometidos y excluye tiempos de CPU, rutas, orden de ejecución, worker y etiquetas editoriales.

## 6. Conciliación SIM (separada de la evaluación deportiva)

`R01` marcador por periodos · `R02` puntos = conversiones · `R03` aciertos ≤ intentos (campo, triples, libres, zonas) · `R04` series de libres (causa, orden, reloj parado) · `R05` robos 1:1 con pérdidas robables rivales · `R06` rebotes ≤ oportunidades (causa terminal explícita) · `R07` créditos a participantes en pista · `R08` ninguna acción tras la exclusión · `R09` minutos = intervalos · `R10` más/menos · `R11` quintetos sin doble conteo · `R12` final sin empate · `R13` orden y tiempos · `R14` asistencias · `R15` tapones · `R16` faltas y bonus · `R17` particiones (zonas, familias, jugadores, equipo) · `R18` lectura sin azar. Una comprobación «no evaluada» no cuenta como conforme.

## 7. Cómo usarlo

- Laboratorio: `npm run dev` → selector → **Motor ultrarrápido** (Partido · Parámetros · Lote).
- Un partido: `node scripts/sim01-match.js --a=EQ03 --b=EQ03 --seed=314159 [--json=salida.json] [--input=entrada.json] [--profile=candidata.json]`.
- Medición: `node scripts/sim01-bench.js --mode=B01` y `--mode=B02-B03` (proceso nuevo cada vez; B03 reutiliza los workers de B02).
- Cierre: `node scripts/sim01-run-checks.js`, `node scripts/browser/sim01-recorrido.mjs`, `node scripts/sim01-package.js`, `node scripts/sim01-check.js`.
- Pruebas: `node --test tests/sim01.test.js` (S01-01…10; forman parte de `npm test`).

## 8. Medición de rendimiento (resultado real)

**Máquina**: Intel(R) Xeon(R) Processor @ 2.80GHz, 4 CPU lógicas (4 disponibles), 16091 MiB de RAM, linux 6.18.44-fc-v140, Node v22.22.0. Commit de código `6ef0dab`.

**Cronómetro del objetivo** (reloj monotónico): desde la solicitud `pool.run` hasta tener en poder del coordinador los 1.000 resúmenes compactos, **con los workers ya listos**. Incluye despacho (lotes de 5 casos), preparación de la entrada, generación, construcción del resultado, las 18 conciliaciones/invariantes y la comunicación de resultados; no excluye trabajo requerido y no suma tiempos de worker como tiempo de pared. Se muestran aparte: carga de datos, preparación del contexto, arranque de los workers (incluye 12 partidos de calentamiento declarados por worker, fuera de la agenda), serialización a JSON, bytes y escritura. La RSS es la del proceso (máximo muestreado cada 25 ms y `maxRSS` de `getrusage`), **no** se suma por worker. Latencia = tiempo del worker por partido (preparar entrada + generar + resultado + conciliar), sin cola.

| Ejecución | Workers | Proceso | Objetivo (pared) | ≤ 5 s | Partidos/s | Latencia media / p95 | RSS máx. | Válidos | Total desde el inicio del proceso |
|---|---|---|---|---|---|---|---|---|---|
| B01 | 1 | nuevo | 15.89 s | no | 63 | 15.7 / 23.7 ms | 182 MiB | 1000/1000 | 16.61 s |
| B02 | 4 | nuevo | 6.50 s | no | 154 | 25.5 / 56.7 ms | 438 MiB | 1000/1000 | 7.75 s |
| B03 | 4 | reutilizado | 4.21 s | sí | 237 | 16.6 / 25.4 ms | 444 MiB | 1000/1000 | 11.99 s |

B01: un worker, proceso nuevo. B02: cuatro workers, proceso nuevo (frío). B03: los mismos cuatro workers ya iniciados y contexto reutilizado, otra pasada de 1.000 partidos **generados de nuevo** (la agenda produce las mismas huellas por caso: B01 = B02 = B03 en 1.000/1.000). Pasadas adicionales de variación (no sustituyen a las oficiales): B02 6.70 s; B03 4.15 s; B02 6.74 s; B03 4.49 s; B02 6.56 s; B03 4.67 s.

**Conclusión (sin extrapolar)**: con cuatro workers y arranque en frío (B02) el objetivo **NO se alcanza** (entre 6.50 s y 6.74 s en 4 pasadas); con workers calientes (B03) se alcanza en 4 de 4 pasadas (4.15 s–4.67 s), es decir, **con un margen de 7–17 % en esta máquina**; en una tanda anterior de la misma máquina (commit `4f5cb8c`, conservada en `09-RENDIMIENTO.json`) una de cuatro pasadas calientes llegó a 5,16 s: la variación entre sesiones es de ±10–15 %, de modo que el cumplimiento en caliente es real pero no robusto. Un worker tarda 15.89 s; cuatro workers dan una aceleración de 2.4× en frío y 3.8× en caliente (hilos lógicos compartidos). La diferencia frío/caliente es el calentamiento del compilador JIT (≈ 100 partidos por worker para alcanzar el régimen estable): reducirla con más calentamiento solo desplaza el tiempo al arranque. Las mediciones previas a cada tanda de optimizaciones exactas (huellas idénticas) y las configuraciones probadas y descartadas se conservan en `09-RENDIMIENTO.json` (`medicionesPreviasExploratorias`).

**Diagnóstico**: el coste está en la compilación de magnitudes por tramo (≈ 60 % del tiempo de generación: ≈ 0,3 ms por tramo y ambos equipos; 24 tramos por partido) y no en el sorteo ni en el registro; SIM no llama al detallado (comprobado). Las optimizaciones aplicadas conservan la producción comprometida (24/24 huellas idénticas antes y después). Una caché de magnitudes entre tramos reduciría el coste pero introduciría una aproximación nueva (queda como decisión para 02).

## 9. Compromisos para SIM-MOTOR-02

Los partidos simultáneos compartirán un reloj virtual y solo publicarán el presente alcanzado (`advance`/`query` ya lo respetan); los trabajadores físicos son limitados y reutilizables (`SimPool`); Referencia conservará identidades y estadísticas individuales sin regenerarlas; el aprendizaje será posterior al partido, único y reversible (el generador no cambia conocimiento ni consulta la Polivalencia). No se ha construido nada de 02.

> **Actualización de SIM-MOTOR-02**: los roles ofensivos O01–O15 y defensivos D01–D12 **ya no son exclusivos del detallado** (efecto sencillo y real en SIM); las correcciones C02-01…05 sustituyen los defectos conocidos de esta entrega. Ver [`sim-motor02.md`](sim-motor02.md).

> **Actualización de SIM-MOTOR-04**: el generador incorpora el rebote ofensivo colectivo ponderado (`collectiveRA`, C04-01), el bloqueador pertinente por rol de jugada (C04-03), la familiaridad de presión sobre el peso extra de pérdida (C04-04), la mezcla de triples por contexto (`shotMix.threeWeightFactor`, identidad en 1) y los denominadores de asistencia (C04-06); el contrato de resultado pasa a `beM-sim-match/3` y el esencial a `/2`. Ver [`sim-motor04.md`](sim-motor04.md).
