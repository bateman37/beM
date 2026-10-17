# Implementación de MOTOR-11 (población de referencia, generador y escenarios)

Encargo archivado: [`../prompts/MOTOR-11-poblacion-generador-y-escenarios.md`](../prompts/MOTOR-11-poblacion-generador-y-escenarios.md). Recorrido manual: [`../prompts/MOTOR-11-recorrido-manual.md`](../prompts/MOTOR-11-recorrido-manual.md).

> **Naturaleza.** MOTOR-11 es **datos + lectura + interfaz**: hace utilizables los doce equipos, añade un generador reproducible y escenarios. **No cambia el deporte**: la referencia `20261016` sigue en **83–103 con 6 505 sorteos**; el motor `beM-motor-0.9.0-MOTOR09` y `beM-match-export/8` no cambian. Todo lo nuevo es SEM, nada calibrado.

## 1. Base real

| Dato | Valor |
|---|---|
| Rama | `claude/busy-edison-b1fmnc` (designada por el entorno; el encargo proponía `feature/MOTOR-11-poblacion-y-generador`), rehecha desde `origin/main` (`d18f78c`). |
| MOTOR-10 | **Fusionado en `main`** (PR #11, comprobado en el repositorio). No hace falta PR dependiente. |
| Punto de partida comprobado | 141 pruebas pasan, `data:check` y comprobación documental correctos, referencia `20261016` = 83–103 con 6 505 sorteos. |

## 2. Mapa de requisitos

| Requisito | Código | Datos | Interfaz |
|---|---|---|---|
| §5 144 fichas y revisión de edad | `src/population/reference.js` (CSV R0 intacto + revisión R1) | `population.revisions` | Plantillas › catálogo e inspección |
| §6–§7 doce planes naturales | `scripts/build-motor11-data.js` los materializa; `reference.js` | `population.teams.*.plan` | Preparación › «Cargar el plan natural» |
| §8–§10 generador | `src/population/generator.js`, `hash.js` | `generator.*` | Plantillas › Generador |
| §11 edición masiva | `src/population/edit.js`, `src/lab/store.js` | — | Plantillas › +1/+3/+5 y «Deshacer» |
| §12–§13 escenarios | `scenarios.js`, `exchange.js`, `library.js` | `lab.*` | Plantillas › Escenarios |
| §4 pendientes de MOTOR-10 | `src/analysis/closures.js`, `orgat.js`, `offball.js`, `shooting.js`; `instr` en el motor | — | Análisis |
| §16 versión visible | `src/version.js` | — | cabecera, consola, Panel › Inicio |
| §15 tablas | `src/profiles/rows-motor11.js` (35 filas `optional`) | `SEM-MOTOR11-20261017` | Panel |

## 3. Las 144 fichas y la revisión de edad

Las fichas son las del anexo B de MOTOR-01 (`data/fixtures/reference-players-MOTOR01.csv`, no se edita; `data:check` lo sigue comparando con el prompt archivado). Cada plaza lleva procedencia por revisión (`R0` dato inicial, `R1` revisión aceptada). **R1 solo cambia la edad de EQ07-J01 (37 → 40)**; capacidades y cuerpo se conservan; `R0` sigue accesible y el CSV mantiene 37. La edad no modifica el rendimiento (test existente de MOTOR-07). Estados ordinarios: energía 100, Forma y momentos neutros.

## 4. Planes naturales

Los doce planes se **escriben completos** en `data/match/motor11-seed-extension.json` (disposición, defensa, altura, estilos ofensivos y defensivos, libro de quince fichas con P1/P2/resto a 5, saques seguridad a 1 y el resto a 3, quinteto, director J01 con alternativas J12/J06/J02, política ENTREF02 y delegación total, participación 200 min). Los relevos salen de la precarga funcional existente (`defaultParticipationPlan`) y se fijan los minutos objetivo del encargo (ordinario 28/12, EQ07 y EQ12 24/16, EQ08 26/14, EQ11 32/8 para J03). `data:check` comprueba que el archivo coincide con lo que produce el script y que cada plan es válido frente a otro equipo. Decisiones de lectura: «3–2 ofensivo» = DIS03 y «4–1» = DIS02 (por nombre del catálogo); EQ07 usa media distancia «buscar», el resto «aceptar si está liberada»; EQ10 usa COB03 con navegación `over_and_recover` (el motor ya declara la limitación cuando la cobertura no es aplicable). No sobrescriben los planes históricos de EQ01/EQ02 (siguen disponibles como «plan histórico»; LAB11-00).

## 5. Generador

Receta SEM `GEN-MOTOR11-R1` / dataset `POB-MOTOR11-R1`: `A = clamp(μ + d·[1,0·T_g + 1,5·Z_g + 0,75·e_a + cruce], 1, 30)` con `Z = U1 + U2 − 1`, ocho grupos que cubren exactamente las 32 capacidades, cruces del encargo, cuerpo con factor corporal único (altura/peso/envergadura con límites e intersección), edad `base + floor(5U) − 2` con límites por identidad, tendencias independientes y normalización de zonas con salvaguarda de suma cero. Precisión: 3 decimales (capacidades), 1 (cuerpo), 4 (tendencias). **Derivación RNG**: FNV-1a de 32 bits sobre `semilla|receta|dataset|identidad|clave del stream` → xorshift32 del perfil con 4 sorteos de calentamiento; un stream por equipo/plaza/campo, por lo que el resultado no depende del orden. No usa `Math.random`, la fecha ni el RNG del partido (comprobado en prueba). La huella es SHA-256 canónico de fichas y plan. Una generación aceptada se **materializa** (fichas + plan + procedencia) y el partido guarda sus valores efectivos, no la receta.

**Correlación de población frente a cuerpo del motor.** La correlación solo construye entradas; durante el partido solo actúan los efectos corporales ya aprobados (el peso sigue sin efecto directo; no se reaplica el factor corporal).

## 6. Identidades e instancias

IDs `EQxx-Jnn`; variantes `EQ04V01-Jnn`; generados `GEN04_<semilla>_D<dispersión>-Jnn`. Dos copias del mismo equipo se juegan como `EQ04` y `EQ04_B` (remapeo de todas las referencias propias del plan, director, relevos, sacadores; `source.instance` lo registra y viaja en el export). Colocar un equipo en un puesto no cambia el rival; se retiran y **se muestran** las marcas/objetivos del rival sobre jugadores que ya no existen.

## 7. Edición, variantes, escenarios

+1/+3/+5 por puntos absolutos con precisión continua, saturación visible y **deshacer exacto** (se guarda el valor anterior de cada celda; 29→30 con +3 vuelve a 29). Variantes con identidad nueva y diferencias por campo; la referencia no se puede sobrescribir ni eliminar. Escenarios LAB11-00…12 como **datos** (`lab.scenarios`, operaciones declarativas), C00–C06 reutilizadas, guardado en `localStorage` (`beM.motor11.population.v1`), export/import `beM-scenario/1` con huella (un archivo alterado se rechaza) y comparación de resultados individuales sin lotes. LAB11-10 guarda órdenes previstas que se envían a mano desde «Partido» en su frontera.

## 8. Pendientes de MOTOR-10, uno a uno

| Pendiente | Resultado |
|---|---|
| Lateralidad del mapa | **Confirmado sin productor.** Se conserva la función del tirador en la disposición (esquina/ala/cabecera; dato propio) y el lado queda «desconocido». No se sortea ni se simula espacio. |
| Asistencia: continuación de ventaja y desviación | **Confirmado sin productor**: el motor distingue recepción sin movimiento y creación propia (`moved`); no existe operación de desvío ni «continuación» distinta. No se inventan; el % de asistidas no es un objetivo. |
| Organización defensiva por hecho | **Resuelto**: `orgat.js` (plan + órdenes aplicadas + hechos de organización efectiva) relaciona cada tiro con su organización y versión de plan; sirve también para archivos anteriores. |
| OB05 y disponibilidad de corte | **Instrumentado**: campo `instr` en el hecho con elegibles/ocupados/no abandonar/candidatos y corte CONT06 evaluado. Sin sorteos nuevos; excluido de `sportsProjection`. Partidos anteriores: «no registrado». Visible solo para el equipo propio y diagnóstico. |
| Cuota de cierres | **Resuelto** (`closures.js`): autoría causal (canasta, último libre, tiro con rebote defensivo o tapón, pérdida con actor); fin de periodo, balón suelto y pérdida de equipo = fila colectiva; conciliado. |
| Producción por 100 en presencia completa | **Resuelto**: mismas unidades en numerador y denominador, ofensivo con ataques propios y defensivo con rivales; mixtas y parciales aparte. |
| Director observable | `observableActors` (hecho permitido, público) separado de la configuración privada (director designado, prioridades, libro), que sigue siendo propia. |
| Sin resolver | Estado propio visible por tramo; recomendaciones distintas de REC10-01/02. |

## 9. Versiones, perfiles y compatibilidad

`src/version.js` es la fuente única (`MOTOR-11`): consola del servidor, cabecera (rellenada por JS, sin versión fija en el HTML) y Panel › Inicio, que muestra por separado aplicación/motor, perfil activo, dataset/escenario y formato de export. Perfil efectivo: `…+SEM-MOTOR10-20261016+SEM-MOTOR11-20261017`; activación explícita en Panel › Inicio («Activar la base de MOTOR-11»); sin ella Plantillas usa la base de MOTOR-11 y lo indica. `export/8` **no cambia** (los export/8 de MOTOR-10 siguen reproduciéndose: prueba 7). El hash de la proyección de referencia cambia solo por la identidad del perfil en las decisiones del entrenador (igual que en MOTOR-10): `tests/fixtures/baseline-motor11.json`; con el perfil de MOTOR-10 el hash es idéntico al de `baseline-motor10.json` (comprobado).

## 10. Comprobaciones

| Qué | Resultado |
|---|---|
| `npm test` | ver resumen final (141 previas + 8 de `tests/motor11.test.js`) |
| `npm run data:check` | correcto (incluye `checkMotor11`) |
| `scripts/integration-motor11.js` | 1 histórica **83–103**; 2 EQ03–EQ09 **73–64**; 3 EQ07–EQ08 **84–88**; 4 EQ11–EQ12 **88–68**; 5 generados EQ04/EQ10 **93–92**, reproducido idéntico. Acta y análisis válidos (23 comprobaciones) en los cinco. Resultados observados, no objetivos ni calibración. |
| Chromium (automatizado) | cabecera, 12 tarjetas, inspección de EQ07-J01 (40 años), colocar A/B, +3 y deshacer exacto, generación/reproducción/guardado/uso, escenario LAB11-02 → partido completo → análisis. Un 404 de consola (favicon, ajeno a la entrega). **No** es un recorrido humano. |

Solo jugaron partidos completos EQ01, EQ02, EQ03, EQ09, EQ07, EQ08, EQ11, EQ12 y dos generados (EQ04/EQ10). EQ04–EQ06 naturales y EQ10 natural están validados desde preparación (`data:check`), sin partido automático.

## 11. Pendientes y límites

1. **MOTOR-11 no ejecutable**: ninguno.
2. **Heredado**: deuda normativa de MOTOR-09 (PDF, técnicas, compensación, inferioridad, tiro en vuelo, suspensión), estado propio por tramo, recomendaciones extra.
3. **Posteriores**: ejecución masiva y ZIP (MOTOR-12), auditorías y calibración (MOTOR-13), rendimiento (MOTOR-14).
4. Recorrido manual de MOTOR-08/09/10/11 pendiente de Dennis; no ejecutado: Node 24, otros navegadores.
