# SIM-MOTOR-04 · recorrido manual de Dennis

Pendiente de Dennis: **no** está aceptado. Arranque: `npm run dev` (ver el puerto en la consola) → laboratorio → resolutor **Motor ultrarrápido**. Cabecera esperada: aplicación `SIM-MOTOR-04`, SIM `0.3.0-SIMMOTOR04`, resultado `beM-sim-match/3`, guardado `beM-sim-snapshot/2`.

## 1. Candidata provisional (activación explícita)
1. En la pestaña SIM abre la tarjeta **Candidatas numéricas** (`#sim-candidates`). Debe listar `C04-FINAL-PROVISIONAL` con sus cuatro filas (volumen 19,5 s/control, mezcla de triples 0,70, pase final elegible 0,90, coste de energía 3) y la leyenda «provisional».
2. Sin pulsar nada, genera EQ01 – EQ12 (semilla 20261023): usa el perfil base. Pulsa «Cargar candidata», regenera: la cabecera muestra el perfil con la extensión y el marcador es distinto (más bajo: ver `16-LIMITES-Y-DECISIONES.md`). Nunca se activa sola.

## 2. Zonas y canastas con falta (C04-02)
En Análisis → estadísticas por zona de un partido: la suma de intentos por zona = intentos de campo del acta (las canastas con falta cuentan; la falta sin canasta no). Señal de fallo: zonas con intentos que no suman los de campo.

## 3. Bloqueador y presión (C04-03/04)
Análisis → bloque **Bloqueador, presión y asistencias** (`#sim-participants`): bloqueadores con crédito solo en jugadas con rol de bloqueo; presión con segundos expuestos; denominadores de asistencia con numerador/denominador. Los valores no representados salen como «no representado», no como 0.

## 4. Guardado de partido (compatibilidad)
Guarda un partido a medias (botón de guardado) y cárgalo con `#sim-load-snap`: se restaura y continúa igual. Carga un guardado de 02 o 03: debe **rechazarse con un motivo** en `#sim-snap-msg` (no se convierte en silencio).

## 5. Perfil antiguo
`#sim-import-profile` con un perfil de 03: aparece la tarjeta de perfil importado y «Aplicar» lo usa explícitamente; el resultado conserva su procedencia.

## 6. Jornada mixta
Jornada → «Preparar jornada mixta» → barreras hasta T = 2400 s (F1, F2, F3, F5 terminados, F4 activo) → Guardar → recargar → Recuperar → completar. Una orden manual a un equipo sin autoridad se rechaza con `sin_autoridad`. El terminado no desaparece y el resultado es el mismo que sin recargar.

## 7. Descargas
JSON/CSV/Markdown del partido y guardado de jornada: abren y se aceptan al recuperarlos.

Si algo falla, anota semilla, cabecera y pestaña.
