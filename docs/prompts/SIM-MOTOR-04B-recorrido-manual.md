# SIM-MOTOR-04B · recorrido manual de Dennis

Pendiente de Dennis: **no** está aceptado. Arranque: `npm run dev` (puerto en la consola) → laboratorio → resolutor **Motor ultrarrápido**. Cabecera esperada: SIM `0.3.1-SIMMOTOR04B`, resultado `beM-sim-match/3`, guardado `beM-sim-snapshot/2`, perfil `SEM-SIM01+SEM-SIM02+SEM-SIM04+SEM-SIM04B-20261023`.

Distinción de la entrega: lo **comprobado por Claude** (suite, Chromium de 60 pasos, comprobador offline) no sustituye esta aceptación. Anota semilla, cabecera y pestaña de cualquier fallo.

## 1. Fatiga en la rotación (P1)
1. Pestaña **Partido**: EQ03 – EQ04, semilla 20261023, «Generar». Vista **Rotaciones**.
2. Busca un cambio por cansancio: en el diagnóstico, la decisión de relevo muestra el motivo (`energia`, `energia_critica` o `tramo_largo`). Un jugador con energía muy baja no debe seguir en pista cuando hay un suplente razonable; un referente claramente superior con energía media sí puede seguir.
3. Señal de fallo: un titular con energía ≈ 5 que juega varios minutos más sin cambio.

## 2. Candidata provisional y parámetros (activación explícita)
1. **Parámetros → Candidatas** (`#sim-candidates`): `C04B-FINAL-PROVISIONAL`, con la leyenda «provisional: el selector mecánico no encontró ninguna fila adicional admisible»; los cuatro valores son los de 04. Sin pulsar nada, el perfil activo es la base.
2. Filtra `rimWeightFactor`: filas neutrales (valor 1) con origen `SEM-SIM04B` y unidad. «Cargar candidata» deja un borrador con diferencias visibles; «Restaurar base» lo deshace.
3. Descarga la candidata y comprueba que incluye base, huellas y diferencias.

## 3. Guardado y compatibilidad
Guarda un partido a medias, cárgalo con `#sim-load-snap` (se restaura y continúa igual). Carga un guardado de 04: debe **rechazarse con motivo** («SIM-MOTOR-04B cambia el futuro de un partido en curso…») sin tocar el archivo ni la sesión activa.

## 4. Jornada mixta con cierre diferido (P2)
1. **Jornada → Preparar jornada mixta**. Avanza barreras hasta que haya terminados: la etiqueta `#day-seal-status` pasa de «sellando actas · pendientes: n» a «actas selladas» **después** de que el marcador y la clasificación ya se vean publicados; los controles siguen respondiendo mientras tanto.
2. Guardar → recargar la página → Recuperar → completar: el terminado no desaparece y la tabla final es la misma que sin recargar. Una orden manual a un equipo sin autoridad se rechaza (`sin_autoridad`).
3. Abre un encuentro SIM terminado desde la jornada: muestra su acta esencial.

## 5. Contrastes y capacidades
Revisa en la revisión rápida `09e-CONTRASTES-SUFICIENCIA.csv` (T03: cero esperado en altura normal, exposición positiva con presión adelantada) y `10-RESUMEN-CAPACIDADES.json` (FIS04 topa en 30 en dos situaciones; declarado).

## 6. Lectura de la evidencia (decisión tuya)
1. `07-CAL-SELECCION.json` y `16-LIMITES-Y-DECISIONES.md`: ningún vector adicional fue admisible; Z2 y Q2 mejoran mucho eZ, eQ y eR y solo quedan fuera por la guarda acumulada de asistencias (0,1643). **DECISIÓN REQUERIDA**: ¿reformular esa guarda en una entrega nueva?
2. `13-RENDIMIENTO.json`: F0 7,95 s (objetivo 5 s) y publicación de barrera 1,36 s (objetivo 1 s) **no** se alcanzan.

## 7. Descargas
JSON/CSV/Markdown del partido y guardado de jornada: abren y se aceptan al recuperarlos.
