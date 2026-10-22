# Resumen operativo de MOTOR18B-CIERRE-20261022

Generado desde los archivos finales de la campaña. Hechos, no aceptación: no hay calibración ni juicio deportivo aquí. «Comprobado por Claude» no equivale a validado por Dennis.

## 1 · Identidades

CONTROL17B `f67113e81353da4d464e8bc62544d28b2dbcb8fa` · código MOTOR-18B congelado `f8112953bcb4f97a7791337629229fac34c8b59c` (Git limpio al congelar: true) · Node v22.22.0 · 4 CPU · base MOTOR-18 `fa13869` (PR #19, sin fusionar).
Perfiles: P0 = base efectiva con SEM-MOTOR18B (curva de Polivalencia) · P1 = P0 + C17-02 (gasto 3,5; **referencia provisional, no aceptada deportivamente**). Motor `beM-motor-0.18.1-MOTOR18B`, aplicación MOTOR-18B, FAM-MOTOR18B-R1.

## 2 · Curva de Polivalencia (aprendizaje, no deporte)

Anclajes 1→0.25 · 8→0.5 · 16→1 · 24→2 · 30→2.5. En el ejemplo ORG02 (K12, 1 hora equivalente efectiva al objetivo): P8 factor 0.50 G=0.4841 ganancia=0.2980 · P16 factor 1.00 G=0.9682 ganancia=0.5910 · P24 factor 2.00 G=1.9364 ganancia=1.1627. G24/G8 = 4.000000; ganancia24/ganancia8 = 3.901764. Dosis eficaz K12→K18: P8 24.289281 h-eq · P16 12.144640 h-eq · P24 6.072320 h-eq (comparación controlada, no calendario).

Tabla L18B: 12/12 casos conformes (cálculo puro, sin partidos).

## 3 · Estado de R01–R06 y unidades

| ID | Área | Estado |
|---|---|---|
| M18-R01 | Preparación y copia activa | corregido y comprobado |
| M18-R02 | Participantes reales y bloqueadores | corregido y comprobado |
| M18-R03 | Sesiones después de recargar | corregido y comprobado |
| M18-R04 | Exposición de encuentro terminado | corregido y comprobado |
| M18-R05 | Sesiones y entradas válidas | corregido y comprobado |
| M18-R06 | Estimación y resolución coherentes | corregido y comprobado |
| M18B-CURVA | Curva de Polivalencia | corregido y comprobado |
| M18B-UNIDADES | Unidades | corregido y comprobado |

R02, inventario de los seis diagnósticos: MOTOR-18 tenía **35** operaciones sin continuación con bloqueador registrado y ausente de los participantes de familiaridad (29 de bloqueo directo y 6 de otras familias; numerador sobre 375 operaciones con bloqueador registrado); MOTOR-18B tiene **0** (de 375). Con continuación listada el bloqueador puede no figurar: es otra interacción (72 operaciones).

## 4 · Ejecuciones

Planificadas 36 (A 12 + B 16 + C 6 + D 2; **no son 36 observaciones independientes**). Listadas 35 + D02 especial · terminadas 35 · válidas 35 · fallidas 0 · sin ejecutar 0 · con reintento 0. Un intento fallido no tiene marcador ni cuenta como derrota. Encuentros adicionales de suite, navegador, depuración o controles reconstruidos se declaran aparte (sección 9); aquí no se cuentan.

## 5 · Neutralidad y continuidad

CONTROL17B ↔ MOTOR-18B (bloque A): comparados 6 de 6; **iguales: true**. 

Seis diagnósticos frente a su esencial: iguales en marcador, hechos, sorteos y exposición final. D01 (Polivalencia EQ02 16→30) frente a B01-K8: deporte igual: true; exposición igual: true; propuestas de aprendizaje distintas para EQ02: true (10 de 147 objetivos cambian de nivel; G medio ×2.500). D02 (guardar en «period» y restaurar): secciones deportivas iguales a B02-K28: true; exposición final igual: true.

## 6 · Frente a MOTOR-18 (histórico, solo lectura)

Los 17 registros B/D01 recalculados con las mismas semillas: **17 idénticos en deporte** al de MOTOR-18; 0 cambian de trayectoria (ninguno). Las correcciones de R02/R06 sí cambian ajustes por operación (sumas de ajuste en `comparacion-historica-M18.json`), pero no llegan a cambiar estas trayectorias. Comprobación «solo la curva» (mismo código, dos modelos de Polivalencia): deporte idéntico en los 16 contrastes.

## 7 · Contrastes B (K8 frente a K28)

- B01: ORG02 de los jugadores de EQ02; solo cambia ese conocimiento: true; exposición K8=143.20 K28=150.10 (crédito ponderado por operación)
- B02: FAM:pick_and_roll de EQ01; solo cambia ese conocimiento: true; exposición K8=10.80 K28=10.80 (crédito ponderado por operación)
- B03: familiaridad O01 de EQ01-J01; solo cambia ese conocimiento: true; exposición K8=18000.00 K28=18000.00 (décimas de juego vivo)
- B04: familiaridad PG de EQ01-J10; solo cambia ese conocimiento: true; exposición K8=22881.00 K28=22881.00 (décimas de juego vivo)
- B05: familiaridad D06 de EQ02; solo cambia ese conocimiento: true; exposición K8=120000.00 K28=120000.00 (décimas de juego vivo)
- B06: módulo PRESS de EQ02; solo cambia ese conocimiento: true; exposición K8=68.60 K28=68.60 (crédito ponderado por operación)
- B07: SAQ:O:band de EQ01; solo cambia ese conocimiento: true; exposición K8=8.00 K28=8.00 (crédito ponderado por operación)
- B08: SAQ:D:endline de EQ02; solo cambia ese conocimiento: true; exposición K8=33.60 K28=32.90 (crédito ponderado por operación)

Sin conclusión de efecto medio por marcador: una semilla por contraste.

## 8 · Auditoría y sensibilidad

Estado: aportado. AUD01–32: {"conforme":17,"inconcluso":14,"no_evaluado":1} (no se exige que las 32 sean conformes; los «inconclusos» no se han cambiado).

## 9 · Comprobaciones técnicas

| Comprobación | Estado |
|---|---|
| Suite completa (`npm test`) | comprobado por Claude: 275/275 sobre `415ae2b709ca9f220da90a70edc1cd3b554b542c` |
| `npm run data:check` | comprobado por Claude |
| Comprobación documental | comprobado por Claude |
| Recorrido de Chromium (Preparación efectiva, entrenar–recargar–entrenar, continuidad, descargas) | comprobado por Claude: 24/24 pasos, consola 0, red 0 |
| Descarga real del encuentro y del análisis por bytes | comprobado por Claude (beM-MOTOR02-20261016-EQ01-EQ02.json 17567169 B sha d099bb61116f · LEARN18-S-EQ01-EQ02-d0-I) |
| Otros navegadores, Node 24, tandas de 100/200, rendimiento masivo | **no ejecutado** |
| Recorrido manual de Dennis | **pendiente de Dennis** (`docs/prompts/MOTOR-18B-recorrido-manual.md`) |

## 10 · Coste observado (casos ejecutados; no es un benchmark)

Ejecuciones: 35; tiempo de ejecución por lote entre 705 y 3992 ms (Node v22.22.0, 4 CPU, concurrencia 4 en esenciales y 2 en diagnósticos; modo de registro «world-essential» y «diagnostic») (esenciales ~1 s; diagnósticos ~3–4 s); registro de entrada/entorno en `00-congelacion.json`. No se extrapola a cien o doscientos partidos.

## 11 · No cerrado por esta entrega

- Aceptación manual de Dennis, calibración deportiva global, conformidad FIBA integral y presupuesto de rendimiento del mundo (partidos simultáneos).
- Seis pares neutrales y ocho contrastes con una semilla cada uno son una muestra muy pequeña: no se declara efecto deportivo ni calibración; las cifras de la curva son semillas SEM18B autorizadas por el encargo.
- C17-02 (gasto 3,5) sigue siendo una referencia provisional, no una aceptación.
