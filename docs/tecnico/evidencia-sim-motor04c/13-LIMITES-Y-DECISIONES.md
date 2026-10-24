# SIM-MOTOR-04C · límites y decisiones

Nada de lo siguiente es «calibrado», «estadísticamente equivalente» ni «aceptado por Dennis».

## Diferencias residuales (VAL nueva, 48 casos por modelo, misma entrada y semilla)
| error | banda | N04C | candidata | estado |
|---|---:|---:|---:|---|
| eP | 0.08 | 0.0907 | 0.0589 | mejora; dentro de banda |
| eF | 0.08 | 0.0198 | 0.0280 | empeora; dentro de banda |
| eZ | 0.1 | 0.2250 | 0.1695 | mejora; FUERA de banda |
| e2 | 0.04 | 0.0634 | 0.0450 | mejora; FUERA de banda |
| eR | 0.05 | 0.0472 | 0.0591 | empeora; FUERA de banda |
| eI | 0.05 | 0.0512 | 0.0077 | mejora; dentro de banda |
| eQ | 0.05 | 0.1288 | 0.0286 | mejora; dentro de banda |
| eA | 0.08 | 0.1395 | 0.1272 | mejora; FUERA de banda |
| M | 1 | 2.5770 | 1.6954 | mejora; FUERA (dominante eZ) |

- Quedan fuera de banda: eZ, e2, eR, eA. **eR empeora en VAL** frente a N04C y supera la banda (en CAL mejoraba): contradicción CAL/VAL declarada, sin reajustar con VAL.
- Las asistencias siguen por debajo del detallado (AST_FG/FGM 0.5486 frente a 0.6758); la parte posterior a rebote se acerca, pero el desfase también existe fuera del rebote (ver 09-REBOTE-Y-ASISTENCIAS.csv).
- Los puntos por 40 min siguen por debajo del detallado (77.5787 frente a 82.4375).
- El coeficiente conversion.simInsideLogitOffset está en el borde de su rango autorizado (0,30) y es una traducción agregada provisional, no una regla deportiva.
- Robos, libres, ritmo, factor de triples, volumen de controles y plantillas no se calibraron en esta entrega.
- Rendimiento: los tres objetivos (5 s por lote, 1 s de publicación, 1,5 GiB) NO se cumplen con 2.000 clubes (ver 11-RENDIMIENTO.json).
- La campaña usa las ocho plantillas principales; no acredita generalización a otras.

## Preguntas concretas para Dennis / ChatGPT
1. ¿Se acepta C04C-FINAL-PROVISIONAL como punto de partida pese a eA, eZ y eR fuera de banda, o se prefiere conservar N04C?
2. eA (asistencias) persiste: ¿se autoriza actuar sobre la elegibilidad de pase final de las fichas organizadas (no solo tras rebote)?
3. eR empeora en VAL: ¿se autoriza revisar la mezcla de zona aro frente a inside en una entrega nueva (la reserva VAL actual dejaría de ser independiente)?
4. ¿Qué objetivo de rendimiento se mantiene cuando la carga son miles de clubes distintos?

## Estados
Comprobado por Claude: pruebas, campañas, neutralidad, TECH, conciliación, jornada mixta, historia/aprendizaje y recorrido de Chromium. Pendiente de Dennis: aceptación deportiva y recorrido manual. No ejecutado: otros navegadores, Node 24.
