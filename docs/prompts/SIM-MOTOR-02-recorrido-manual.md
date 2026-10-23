# SIM-MOTOR-02 · recorrido manual para Dennis

Estado de cada paso: **pendiente de Dennis** (Chromium automático recorrió un camino equivalente, pero eso no sustituye su aceptación).

Arranque: `npm run dev` y abrir `http://localhost:5173/`. Pulsar **Motor ultrarrápido**. (Las semillas y escenarios están fijados para que el resultado sea comparable.)

| # | Paso | Resultado esperado | Señal de fallo |
|---|---|---|---|
| 1 | Pestaña **Partido**: equipos EQ03–EQ04, semilla `20261023`, marcar «copia de aprendizaje sintética», **Generar partido**. | Marcador, «conciliación 23/23», «estado finished», contrato `beM-sim-match/2`. | Conciliación < 23/23 o error de entrada. |
| 2 | Recorrer las 11 vistas (Resumen … Exportar). | Todas se pintan; Tiro dice «sin coordenadas ni lados»; Diagnóstico lista «no representado» (alternativas de pase, ayudas, movimientos, saques tácticos) y «no aplica» (ataques mixtos). | Una vista vacía; ceros donde debería decir «no representado». |
| 3 | En **Acta**: columnas «Fin. SIM», «Cuota cierres» y «Pts/100 ctl. SIM»; ver que los libres figuran en **Ataque** (columna TLI/TLC) y que `bonus_sin_familia` aparece si hubo bonus. | Los puntos de Ataque suman los del acta. | Puntos de familias ≠ acta. |
| 4 | Cambiar **Audiencia** a *Público* y abrir **Diagnóstico** e **Informes**. | Decisiones «No visible para esta audiencia»; nada de prioridades ni conocimiento privado. | Se ven decisiones del entrenador o el sufijo privado. |
| 5 | **Horizonte de lectura** = 600 s. | Estado «running», horizonte 600 s; al volver a «Presente publicado» el resultado vuelve entero. | El horizonte cambia el resultado final. |
| 6 | **Exportar**: descargar JSON, CSV, Markdown y «Guardado (continuable)». | Cuatro archivos con contenido; el JSON declara `beM-sim-match/2`. | Archivo vacío. |
| 7 | **Aprendizaje posterior**: Vista previa → Aplicar a la copia → Aplicar de nuevo → Deshacer (equipo EQ03). | Vista previa con fuente `…|M1|EQ03`; segunda aplicación rechazada; deshacer restaura. | Se aplica dos veces. |
| 8 | Pestaña **Jornada** → **Preparar jornada mixta**. | Cinco encuentros: F1 «DETALLADO (sénior propio)», F2/F3 SIM, F4 SIM con inicio +600 s, F5 «SIM (cantera propia)»; tablas iniciales marcadas «hipotética de fixture (artificial)». | Resolutor sin identificar. |
| 9 | **Avanzar una barrera** cuatro veces y **Pausar**. | T = 480 s; en pausa «Avanzar» deshabilitado. F4 aún sin marcador (inicio desplazado). | F4 con marcador antes de +600 s. |
| 10 | **Reanudar**, «Avanzar hasta el cuarto siguiente», una **orden manual** (ritmo máximo) sobre F2 y **Guardar**. | T = 600 s; mensaje con bytes y sha256. | Error al guardar. |
| 11 | **Recargar la página (F5)** → Motor ultrarrápido → Jornada → **Recuperar**. | «Jornada recuperada en T = 600 s». | No recupera o T distinto. |
| 12 | **Completar automáticamente**; mirar las tablas y las decisiones de entrenadores. | Final con tabla definitiva; decisiones con razón, muestra y cambio; la orden manual no se sobrescribe. | Empate en curso tratado como victoria; jornada que no termina. |
| 13 | Pestaña **Temporadas** → Crear mundo → «Jugar hasta la ronda 5» → «Movimiento de prueba» → «Dirigir el sénior propio» → «Jugar el resto». | 72 encuentros; la historia del jugador movido muestra tramos por club; los dos últimos del sénior propio usan el detallado. | Estadísticas de rondas futuras visibles antes de jugarlas. |
| 14 | «Cerrar temporada» y «Abrir la siguiente». | T1 se conserva; T2 empieza vacía. | Pierde el histórico. |
| 15 | Pestaña **Lotes persistentes**: tipo *repetir*, 6 repeticiones, Crear → «Ejecutar solo 2» → Recuperar → Iniciar/continuar; recargar la página. | 2/6 y luego 6/6 sin duplicados; el lote sigue listado tras recargar; «Abrir análisis» muestra un resultado sin la secuencia completa. | Duplicados, «terminado» sin archivo. |

Opcional (reinicio real del servidor): detener `npm run dev` con la jornada guardada, volver a arrancarlo y recuperarla (paso 11).
