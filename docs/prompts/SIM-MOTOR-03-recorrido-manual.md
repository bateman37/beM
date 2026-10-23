# SIM-MOTOR-03 · recorrido manual de Dennis

Pendiente de Dennis: **no** está aceptado. Arranque: `npm run dev` (ver la consola para el puerto) y abrir el laboratorio; elegir **Motor ultrarrápido**. Cabecera esperada: aplicación `SIM-MOTOR-03`, `beM-sim-segment 0.2.1-SIMMOTOR02B`, resultado `beM-sim-match/2`.

## 1. Jornada con un encuentro terminado y otro activo (C03-01)
1. Pestaña **Jornada** → «Preparar jornada mixta». Pulsa «Barrera» hasta T = 2640 s (el encuentro F4 empieza 600 s después, así que sigue activo; los demás ya habrán terminado).
2. Pulsa «Guardar», recarga la página (F5), vuelve a Jornada y pulsa «Recuperar».
3. Esperado: «Jornada recuperada en T = 2640 s»; el encuentro terminado sigue en la lista con su marcador; pulsa una barrera más: **no desaparece**. «Completar» → «TERMINADA» con tabla final de encuentros terminados válidos.
4. Señal de fallo: el terminado desaparece del conjunto o la jornada no llega a «terminada».

## 2. Partido con dirección automática (C03-11)
1. Pestaña **Partido**: EQ03 contra EQ04, semilla 20261023 → «Generar». Esperado: 23/23 conciliaciones, estado finished y, en Diagnóstico, **decisiones del entrenador** (la entrada de 02 daba 76–83 sin decisiones; ahora 77–79 con 8).
2. Señal de fallo: ninguna decisión del entrenador en un partido completo.

## 3. Análisis y conservación (C03-07/08)
1. En un **lote persistente** (Lotes persistentes → crear 6, ejecutar, abrir un resultado) con nivel «análisis»: vistas Defensa y Rotaciones.
2. Esperado: Defensa con puntos y finalizaciones rivales por organización/cobertura/altura (no ceros); Rotaciones con controles propios y rivales por quinteto y tasas por 100. Un resultado de nivel Referencia muestra «no conservado» (no cero).

## 4. Aprendizaje y deshacer (C03-06)
Partido con «copia de aprendizaje» → Vista previa → Aplicar → Aplicar otra vez (rechazado) → Deshacer. Esperado: recibo, rechazo por encuentro lógico y estado restaurado.

## 5. Temporada (C03-09)
Pestaña **Temporadas** → nueva temporada → 5 rondas → «Movimiento de prueba (intercambio EQ05↔EQ02)». Esperado: rige desde la ronda siguiente (6) y ambos clubes conservan doce fichas. No existe movimiento a rondas lejanas.

## 6. Descargas
Descarga JSON/CSV/Markdown de un partido y el guardado de la jornada; comprueba que abren y que el guardado se acepta al recuperarlo.

Si algo falla, anota la semilla, el perfil (cabecera) y la pestaña.
