# SIM-MOTOR-04E · corrección de reloj y rebotes, referencia coherente y ajuste final acotado de SIM

Estado: **ejecutado, pendiente de Dennis**. Nada de lo que sigue está «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» ni es un «motor cerrado». Encargo archivado en [`../prompts/SIM-MOTOR-04E-coherencia-y-convergencia.md`](../prompts/SIM-MOTOR-04E-coherencia-y-convergencia.md); recorrido manual en [`../prompts/SIM-MOTOR-04E-recorrido-manual.md`](../prompts/SIM-MOTOR-04E-recorrido-manual.md); diccionario de la entrega en el paquete (`DICCIONARIO.md`) y en [`evidencia-sim-motor04e/DICCIONARIO.md`](evidencia-sim-motor04e/DICCIONARIO.md). **Excepción expresa a la congelación del detallado** (solo la frontera reloj/rebote/control y los créditos de rebote vinculados); el resto de reglas, recetas, probabilidades, atributos, tácticas, estados, entrenador y arquitectura permanece congelado.

## 1. Alcance, base y versiones
- PR [bateman37/beM#23](https://github.com/bateman37/beM/pull/23) (rama `claude/busy-edison-b1fmnc`), abierta y sin fusionar; base de 04D `0dad8938`, HEAD de 04D `a4f59fb` (la serie continúa en la misma PR).
- Aplicación `SIM-MOTOR-04E` (incluye 04D, 04C, 04B, 04, 03 y 02B) · detallado `beM-motor-0.18.2-SIM04E` · SIM `0.3.4-SIMMOTOR04E` · perfil SIM sin filas nuevas (`SEM-SIM01+02+04+04B+04C+04D`; 04E solo mueve filas existentes dentro de sus dominios) · política de acta del detallado `ACTA-SIM04E-R1` · política estadística SIM `EST-SIM04E-R1` · crédito de rebote común `REBCRED-SIM04E-R1` · conciliación SIM `RECON-SIM04E-R1` · cobertura `COV-SIM04E-R1` · resultado `beM-sim-match/3` y guardado `beM-sim-snapshot/2` (campos sin cambio; los guardados de 04D y anteriores se **rechazan** con explicación y sin tocar el archivo).
- Identidades de comparación: `DET_04D_HIST` (referencia histórica 83–98, 6.684 sorteos, `a4f59fb`), `DET_04E_REF` (detallado corregido, congelado antes del ajuste), `SIM_04D_HIST`, `SIM_04E_BASE` (S0: vector de 04C/04D sobre el código corregido) y `SIM_04E_CAND` (**alias** de la base: ninguna alternativa admisible).

## 2. El defecto de entrada y su recuento
En `DET__detailed__VAL-EQ01-EQ04-R1` (VAL04D), periodo 1: E0070 (EQ04 falla `inside`, quedan 308,0 s de periodo y 0,1 s de posesión) → E0071 declara `fin: periodo` con 307,9 s de periodo → E0072 abre P020 con un saque del mismo equipo y 24 s nuevos. Ruta: `afterMiss` usaba el límite común (`min(reloj de juego, reloj de posesión)`), devolvía `{end:'periodEnd'}` cuando no cabía el rebote y `settlePossession` + el siguiente arranque reutilizaban el `nextPoss` que seguía almacenado.

Reproducido con la entrada real (4 en ese partido) y medido sobre las **176 entradas** de desarrollo, VAL04E y anclas de CONTRAST (re-ejecutadas con cada árbol de código; `scripts/sim04e/clock-audit.mjs`):

| Patrón de expiración (176 detallados) | 04D (`a4f59fb`) | 04E |
|---|---:|---:|
| Falsa expiración «de periodo» con reloj de juego positivo | **514** (488 tras fallo de campo, 26 tras último libre) | **0** |
| …limitada por el reloj de posesión / del periodo | 514 / 0 | — |
| …seguida de la reanudación del mismo equipo con la instrucción antigua | 514 de 514 | 0 |
| Fin de periodo real (reloj de juego a 0) | 632 | 635 |
| Violación de 24 s | 101 | 110 |
| Partidos terminados y conciliados válidos | 176 / 176 | 176 / 176 |
| Rebotes publicados (suma de los 176) | 8.825 | 9.500 |

El recuento no es una cuota de corrección: es el patrón que desaparece al corregir el camino real. En el estudio de entrada (96 DET de VAL04D) se habían encontrado 293 casos (280 sin pérdida y del mismo equipo, 13 aparte); los 13 se mantuvieron separados y no se tocaron por separado.

## 3. E01 · corrección de la frontera de reloj y siguiente posesión
- **Contexto de contacto.** `missRingContext(zona)` lee `shots.{zona}.ordinaryMissContactsRing` (antes «sin consumidor»; ahora fila consumida): `true` = el balón alcanzó el aro, `false` = sin aro, `null` = no registrado (se distingue de `false`; no se regala un reinicio). El tapón **no** hereda el valor de la zona del tirador (usa su desenlace explícito) y no se inventa una probabilidad de airball.
- **Con contacto:** la operación de rebote solo está limitada por el reloj de **juego** (el reloj de posesión anterior al lanzamiento ya no rige); si ni el mínimo de rebote cabe, es un fin de periodo real (reloj a cero, tratamiento existente de tiro pendiente válido). **Sin contacto (`false`/`null`):** rige el reloj de posesión y la violación aplicable llama a `expire`, que registra su causa y establece explícitamente la reanudación rival.
- **Helpers separados** (art. 29 y 51 de las Reglas Oficiales FIBA 2026 v1.1): `shotClockAfterRingContact(reglas, mismoEquipo)` = 14 s para el mismo ataque (reinicia, no solo completa) y 24 s para el rival; `shotClockAfterDefensiveStoppage` conserva el reloj si ya tiene ≥ 14 s. Se eliminó el alias que los mezclaba. Segundos tomados de las tablas del perfil (`frontcourtResetSeconds`, `shotClockSeconds`).
- **Siguiente posesión consumida una vez.** `endPossession` y el inicio de periodo marcan una transición fresca (`nextPossFresh`); `possessionUnit` la consume y lanza un error técnico si se intenta abrir otra posesión sin transición nueva. Un derecho legítimo (rebote ofensivo, saque del mismo ataque, sanción) establece su propia transición y no se bloquea; no se introduce la regla falsa «el mismo equipo nunca mantiene el balón».
- **Efecto en la trayectoria (puente).** Reproducción con 8 entradas DEV-A (`tests/fixtures/sim04e-bridge-*.json`): 04D → paso de crédito → corrección de reloj. El **paso de crédito conserva** relojes, quintetos, duraciones, marcador y la secuencia de sorteos en las 8 entradas (huella `dyn_sha` y `draws_sha` iguales); la **corrección de reloj** elimina las 24 falsas expiraciones y cambia la trayectoria en las 8. Referencia 20261016: 83–98 (6.684 sorteos) → **87–108 (6.733 sorteos)**, **sin objetivo de marcador** y sin recalibrar para volver a 83–98.

## 4. E02 · política común de crédito de rebote (`REBCRED-SIM04E-R1`)
Función pura `classifyReboundCredit` (`src/match/rebound-credit.js`), compartida por el detallado y SIM; no decide quién gana el balón ni consume azar. Datos mínimos: equipo que lanzó, tipo de fallo, balón vivo/fuera/muerto, control o derecho resultante, captor, excepción.

| Situación | Crédito |
|---|---|
| Fallo con contacto de aro y balón vivo, control de un jugador | Individual (ORB/DREB según el equipo que recupera) |
| Tapón con balón vivo y recuperación de un jugador | Individual (recuperador que `pickRecoverer` ya había elegido; sin sortear otra persona) |
| Tapón que sale fuera (derecho de saque del ataque) | **Colectivo** ofensivo (sujeto de equipo, sin jugador inventado) |
| Balón muerto por una parada, fin de periodo antes del control, violación antes de recuperar | Ninguno (causa explícita) |
| Último libre fallado con balón vivo | Individual (como antes) |

Consumidores conciliados: acta de jugador y equipo (`collective`), REB01, análisis por zona/familia, SIM (`coll`; R06 y R27 excluyen el crédito colectivo de la decisión de rama; la huella deportiva de SIM **excluye ese campo observacional** enumerado), exposición de aprendizaje (un crédito colectivo no da práctica a un jugador ficticio) e historia. El auxiliar de AST sigue leyendo el crédito acreditado y la atribución `putback`/POS de 04D se conserva. El lector del detallado cuenta cada tapón por su crédito (individual con balón vivo, colectivo si sale fuera).

**Comprobación observacional** (paso de crédito, antes del arreglo de reloj): 8 entradas × 3 etapas; las variables deportivas prometidas (relojes, duraciones, quintetos, marcador, sorteos) son idénticas a 04D; solo cambian el acta (+2…+8 rebotes acreditados por partido), la huella de acta y el hash completo (por ello las referencias de huella completa se rebasaron explícitamente).

## 5. Referencia nueva y datos de desarrollo
`DET_04E_REF` se congeló en `681c04c` **antes** de calcular objetivos (`plan/freeze-dev.json`; 7 archivos del detallado cambian respecto a `a4f59fb`: `acta.js`, `actions.js`, `core.js`, `data.js`, `flow.js`, `rebound-credit.js` (nuevo), `rules.js`). Los 72 DET de desarrollo (DEV-A: las 48 entradas de 04D, procedentes de VAL04C; DEV-B: 24 entradas de VAL04D con las parejas 01‑04, 07‑10, 02‑05, 08‑11, 03‑06, 09‑12 en ambas orientaciones y réplicas 1 y 2) se ejecutaron **una vez** y son las anclas de todos los vectores. Son 72 entradas **conocidas**, no una reserva independiente.

## 6. E05–E06 · búsqueda acotada (`SRCH-SIM04E-R1`)
Catorce coordenadas independientes (V ritmo, R peso aro, M peso media, T peso triple, O reinicio, A ventaja recibida, S odds de entrega espontánea, L pérdida ordinaria, E robo condicionado, F falta en tiro, C offset de aro, P3 y P2 (`shots.three/midrange.p0` en la copia SIM, ±0,02), B escala común de los cuatro `blockP0` desde la **misma base**). Función de exploración `L_search = mean(max(r_i − 1, 0)²) + 0,05·mean(r_i²)` (no sustituye a M ni concede aceptación); descenso por coordenadas con vecinos ±paso desde el centro vigente, cuatro inicios (S0, S1 = Z8‑A2 de 04D como hipótesis, S2 y S3 con reequilibrio de zonas `u_z = sqrt(d_z/s_z)`), cuatro movimientos conjuntos, una pasada con medio paso y cuatro reparaciones R1→R4 sobre el desarrollo conjunto. Reglas, dominios, pasos, agenda, operadores y presupuesto con hash (`plan/search-config.json`, `rulesSha256 0c10b02a…`) **antes** de ejecutar; VAL04E no se leyó en ninguna fase.

Resultado real: **84 perfiles** evaluados sobre DEV-A (4 inicios · 51 vecinos de las dos pasadas · 4 conjuntos · 25 a medio paso; 4.032 SIM), lista corta de 5 sobre DEV-B (120 SIM) y 3 reparaciones distintas sobre las 72 (216 SIM; R4 reprodujo un vector ya evaluado): **4.368 SIM de ajuste** de un máximo de 4.824. 0 fallos, 0 reintentos.

- **S0** (base) frente a la referencia nueva: M DEV-A 6,09 con 20 de 31 bandas fuera (dominante pérdidas, +25 %); S1 (Z8‑A2 de 04D) 2,77; la mejor por `L_search` en DEV-A (`V-f7936e4bd63d`) M 2,09; la de menor M del desarrollo conjunto (`V-ea7c466d124d`) M 1,52.
- **Guardas frente a S0** (conteo `e ≤ max(0,05; e0+0,02)`, acierto `max(0,03; e0+0,005)`, cuota `max(0,03; e0+0,01)`, calidad forzada +0,02): **ninguna alternativa las cumple** (p. ej. ORB 6,6–7,5 % frente a un 5,0 % admitido porque S0 tenía ORB al 0,7 %; 3PM; cuota inside). Regla aplicada: se **conserva S0 como candidata recomendada** (`C04E-FINAL-PROVISIONAL` = alias de la base) y se entrega aparte la mejor experimental (`C04E-EXPERIMENTAL`, `V-ea7c466d124d`, M conjunto 1,52, guardas incumplidas: 3PM, ORB, cuota inside). Nunca se activa ni se presenta como aceptada.

| Conjunto | Entradas | Condición | M | Dominante | Bandas incumplidas (de 31) |
|---|---:|---|---:|---|---:|
| DEV-A | 48 | base (S0) | 6.087 | tov | 20 |
| DEV-A | 48 | experimental | 1.869 | blk | 9 |
| DEV-B | 24 | base (S0) | 5.332 | stl | 19 |
| DEV-B | 24 | experimental | 5.666 | blk | 13 |
| Desarrollo conjunto (72) | 72 | base (S0) | 5.009 | tov | 20 |
| Desarrollo conjunto (72) | 72 | experimental | 1.520 | fg3m | 6 |
| VAL04E (reserva nueva) | 96 | base (S0) | 4.380 | tov | 17 |
| VAL04E (reserva nueva) | 96 | experimental | 5.400 | blk | 12 |

**Lectura mecánica (no interpretación deportiva).** La mejora de la experimental **no se sostiene fuera de DEV-A**: en DEV-B (24 entradas no vistas por el buscador) M sube a 5,67 y en VAL04E a 5,40, dominada por tapones (`blk` +27 % en VAL) sobre una media de ≈ 2,1–2,7 por equipo y partido (con 16–48 actuaciones por equipo, ±5 % equivale a ±0,1 tapón: del orden del ruido de muestreo). Aun así, en VAL04E la experimental mejora la mayoría de las demás métricas respecto a la base (AST a canasta −17,7 % → 0,1 %, pérdidas +21,9 % → +4,0 %, puntos −6,3 % → −3,4 %, rebotes totales +8,3 % → +4,0 %) y empeora otras (triples anotados −4,7 % → −17,5 %, 2PA +1,8 % → +5,5 %, cuota aro +4,5 → +5,7 pp, cuota inside +0,6 → −3,5 pp). Los datos completos están en el paquete para el análisis deportivo de ChatGPT.

## 7. Resultados de VAL04E (96 entradas nuevas, doce equipos, dieciséis actuaciones por equipo)
`DET_04E_REF` · `SIM_04E_BASE` · `SIM_04E_EXP`; medias por actuación de equipo normalizadas a 40 minutos; error relativo (conteos) y en puntos porcentuales (acierto y cuotas); bandas ±5 % / ±3 pp.

| Métrica | DET | SIM base | e | | SIM experimental | e | |
|---|---:|---:|---:|:-:|---:|---:|:-:|
| Puntos | 83.87 | 78.55 | 6.3 % | **fuera** | 81.02 | 3.4 % | dentro |
| FGM | 31.71 | 29.95 | 5.5 % | **fuera** | 31.39 | 1.0 % | dentro |
| FGA | 59.49 | 60.11 | 1.1 % | dentro | 60.12 | 1.1 % | dentro |
| 2PM | 22.63 | 21.29 | 5.9 % | **fuera** | 23.90 | 5.6 % | **fuera** |
| 2PA | 38.38 | 37.67 | 1.8 % | dentro | 40.51 | 5.5 % | **fuera** |
| 3PM | 9.08 | 8.65 | 4.7 % | dentro | 7.49 | 17.5 % | **fuera** |
| 3PA | 21.11 | 22.44 | 6.3 % | **fuera** | 19.61 | 7.1 % | **fuera** |
| FTM | 11.38 | 10.00 | 12.1 % | **fuera** | 10.74 | 5.7 % | **fuera** |
| FTA | 14.17 | 12.34 | 12.9 % | **fuera** | 13.28 | 6.3 % | **fuera** |
| ORB | 8.83 | 9.08 | 2.9 % | dentro | 9.00 | 2.0 % | dentro |
| DREB | 20.21 | 22.38 | 10.7 % | **fuera** | 21.21 | 4.9 % | dentro |
| Rebotes totales | 29.04 | 31.46 | 8.3 % | **fuera** | 30.21 | 4.0 % | dentro |
| AST a canasta | 20.53 | 16.90 | 17.7 % | **fuera** | 20.56 | 0.1 % | dentro |
| AST a libres | 1.83 | 1.76 | 3.7 % | dentro | 1.93 | 5.3 % | **fuera** |
| AST total beM (canasta + libres) | 22.37 | 18.66 | 16.6 % | **fuera** | 22.49 | 0.6 % | dentro |
| Pérdidas totales | 10.59 | 12.91 | 21.9 % | **fuera** | 11.01 | 4.0 % | dentro |
| Robos | 7.56 | 6.56 | 13.2 % | **fuera** | 6.58 | 12.9 % | **fuera** |
| Tapones | 2.11 | 2.20 | 4.0 % | dentro | 2.68 | 27.0 % | **fuera** |
| Faltas cometidas | 12.90 | 12.49 | 3.2 % | dentro | 12.95 | 0.4 % | dentro |
| Faltas recibidas | 12.89 | 12.49 | 3.1 % | dentro | 12.95 | 0.5 % | dentro |
| Campo | 0.533 | 0.498 | 3.5 pp | **fuera** | 0.522 | 1.1 pp | dentro |
| Dos | 0.589 | 0.565 | 2.4 pp | dentro | 0.590 | 0.1 pp | dentro |
| Tres | 0.430 | 0.386 | 4.5 pp | **fuera** | 0.382 | 4.8 pp | **fuera** |
| Libres | 0.803 | 0.811 | 0.8 pp | dentro | 0.808 | 0.6 pp | dentro |
| Aro | 0.637 | 0.607 | 3.0 pp | **fuera** | 0.625 | 1.2 pp | dentro |
| Inside sin aro | 0.567 | 0.586 | 1.9 pp | dentro | 0.594 | 2.7 pp | dentro |
| Media distancia | 0.430 | 0.410 | 2.0 pp | dentro | 0.412 | 1.8 pp | dentro |
| Cuota aro | 0.363 | 0.318 | 4.5 pp | **fuera** | 0.420 | 5.7 pp | **fuera** |
| Cuota inside | 0.202 | 0.196 | 0.6 pp | dentro | 0.166 | 3.5 pp | **fuera** |
| Cuota media | 0.081 | 0.113 | 3.3 pp | **fuera** | 0.087 | 0.6 pp | dentro |
| Cuota triple | 0.355 | 0.373 | 1.9 pp | dentro | 0.326 | 2.8 pp | dentro |

**Bandas incumplidas en VAL04E**: base 17 de 31 · experimental 12 de 31. **M**: base 4,38 · experimental 5,40. Un M parcial no acredita el acta completa. Intervalos: la comparativa de la entrega incluye, por métrica, la media y el intervalo de remuestreo (2.000 remuestreos deterministas de partidos completos, ambos equipos juntos, emparejados por entrada) **de la diferencia SIM − DET**; son descriptivos y no cambian el cumplimiento de la banda.

Embudo de rebote en VAL04E (por actuación de equipo): créditos de rebote DET 29,24 (ORB 8,89 · DREB 20,35), SIM base 31,60 (9,12 · 22,48), experimental 30,25 (9,01 · 21,24); P(ORB | crédito) 30,4 % · 28,9 % · 29,8 %; fallos sin crédito en el detallado 0,29 (expiraciones reales de periodo, etc.), 0 en SIM. El volumen absoluto de rebotes de SIM (base) sigue ≈ 8 % por encima: viene del volumen de fallos (la base acierta un 49,8 % de sus tiros de campo frente al 53,3 % del detallado: 28,1 fallos válidos por equipo y partido frente a 25,8), no de la fuerza de rebote ofensivo (P(ORB | crédito) casi igual).

## 8. Comprobaciones y coste
- **Pruebas** `tests/sim04e.test.js` (S04E‑01…09): la frontera E0070/E0071 (falla en 04D en 24 de 24 casos y queda corregida), relojes (contacto/sin contacto, bocina real, reloj previo alto y bajo, parada defensiva), siguiente posesión consumida una vez, créditos de cada rama, puente observacional/deportivo, buscador y selección con objetivos sintéticos, lector de oportunidades de rebote y persistencia (guardado nuevo exacto, guardado REAL de 04D y de 04C rechazados). Las referencias de huella completa del detallado de 04D se **rebasaron** a `tests/fixtures/baseline-sim04e.json` (la referencia histórica 83–98 queda enlazada) y las pruebas dependientes de una trayectoria concreta (B1, B5, M17·6) usan semillas que exhiben la misma situación en la trayectoria corregida.
- **Campaña** (todo 0 fallos, 0 reintentos): DEV 72 DET + 87 perfiles SIM (4.368 SIM de ajuste: 4.032 en DEV‑A y 336 en la fase conjunta); VAL04E 96 DET + 96 SIM base + 96 SIM experimental (la candidata recomendada es alias: no duplica observaciones); CONTRAST 8 DET + 16 SIM (base; V0/V1 y ambas orientaciones, T01/T02/T05/T07); TECH 12 SIM (auto, pasos y guardar/recuperar: huellas iguales 4/4 y iguales a DEV); DIAG 4 casos por condición; historia/aprendizaje (24 encuentros, 6 pares, checks correctos) y jornada mixta (cuatro recorridos iguales, recarga real).
- **Coste (ensayo breve de 200; no certifica la escala de 1.000)**: 4 workers preparados en la misma máquina (4 CPU lógicas, Node v22.22.0): lote A de 200 SIM 1,83 s y lote B (pool reutilizado) 1,57 s; jornada de 200 encuentros: avance coordinado 2,90 s, publicación máxima 0,21 s, RSS 633–679 MiB; 400 clubes y 4.800 jugadores remapeados (5.200 identidades). La candidata recomendada es alias de la base: se reutiliza el lote base (variación relativa control/final: no medida; 0 por identidad). **Pendiente**: el objetivo de 1.000 partidos en 5 s, publicación 1 s y RSS 1,5 GiB no se evalúa a esta escala y no se extrapola.
- **Chromium** (12 pasos, consola 0, red 0): versiones por separado, candidatas provisional/experimental, carga explícita de la experimental (22 filas), partido con conciliación 27/27, descargas reales por sus bytes, guardado y continuación, rechazo de un guardado REAL de 04D, pestaña de jornada.

## 9. Límites y decisiones pendientes (`DECISIÓN REQUERIDA` donde corresponde)
1. **Aceptación deportiva y manual**: de Dennis.
2. **Qué hacer con S0 frente a la experimental.** S0 incumple 17 de 31 bandas en VAL04E y es la recomendada por la regla; la experimental mejora la media de DEV‑A pero no generaliza a DEV‑B ni a VAL04E (dominante tapones). Opciones: (a) aceptar S0 y diseñar otra ronda con guardas distintas; (b) revisar la regla de guardas (ORB al 0,7 % en S0 hace que cualquier mejora global pierda la guarda de ORB); (c) ampliar el desarrollo antes de otra búsqueda (con 16–48 actuaciones por equipo los tapones están en el ruido). No se decide aquí.
3. **Criterio de rebote**: queda implementado según la especificación contrastada por ChatGPT (cap. 4, 5 y 8 del FIBA Statisticians’ Manual 2024; art. 29 y 51 del reglamento); **no hubo lectura directa** del PDF por Claude Code. Casos no representados en el motor (faltas de rebote, balones encajados) no se añadieron.
4. **Rendimiento a escala**: 1.000 partidos/5 s, publicación 1 s y RSS 1,5 GiB siguen pendientes de medición (esta entrega solo mide 200).
5. **No ejecutado** en esta entrega: navegadores o versiones de Node adicionales, auditoría de cada una de las 32 capacidades fuera de las sondas existentes, campaña nueva de partidos por atributo, 3.000 partidos de rendimiento.

## 10. Fuentes
Reglas Oficiales de Baloncesto FIBA 2026 v1.1 (29.1, 29.2.2, 29.2.7 y 51), Interpretaciones 2026 v1.0 (contraste puntual) y FIBA Statisticians’ Manual 2024 v2.0 (capítulos 4, 5 y 8; PDF pp. 13–14, 17 y 27). Enlaces y alcance en [`../motor/referencias/c33-p02-fuentes-y-limites-de-la-investigacion.md`](../motor/referencias/c33-p02-fuentes-y-limites-de-la-investigacion.md). Implementado desde la especificación contrastada por ChatGPT; no se afirma lectura directa propia ni conformidad integral.
