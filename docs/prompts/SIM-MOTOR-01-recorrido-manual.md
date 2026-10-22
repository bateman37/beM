# SIM-MOTOR-01 — Recorrido manual para Dennis

Prueba **breve y concreta** del motor ultrarrápido. Arranque: `npm run dev` y abrir la dirección que muestra la consola (`http://localhost:5173/`).

**Qué recorrió ya Claude y qué queda a Dennis.** Claude recorrió con Chromium (Playwright) el flujo completo (26 pasos, consola 0, red 0; resultado en [`../tecnico/evidencia-sim-motor01/recorrido-navegador.json`](../tecnico/evidencia-sim-motor01/recorrido-navegador.json)) y comprobó las descargas por sus bytes. **La aceptación manual es de Dennis**: nada de lo siguiente debe darse por probado por él hasta que lo recorra.

Datos de entrada de referencia: **EQ03 contra EQ03**, semilla **314159**, perfil SIM base `SEM-SIM01-20261022`.

## 1 · Selector y acceso a los dos motores
1. Al abrir el laboratorio aparece la pantalla «¿Qué motor quieres probar?» con **Motor detallado** y **Motor ultrarrápido**. La cabecera dice «Selecciona un motor».
2. Pulsa **Abrir motor detallado**: aparecen sus nueve pestañas habituales y la cabecera muestra «Motor detallado · beM-motor-0.18.1-MOTOR18B…». Pulsa **Cambiar de motor**.
3. Pulsa **Abrir motor ultrarrápido**: cabecera «Motor ultrarrápido · beM-sim-segment 0.1.0-SIMMOTOR01», y a la derecha el perfil SIM y los datos.
- **Fallo:** un motor se abre solo; el detallado cambia su comportamiento; la cabecera no distingue el modelo.

## 2 · Generar y leer un partido
1. Equipos EQ03 y EQ03 (verás EQ03 y EQ03_B), semilla 314159 → **Generar partido**. Marcador, parciales, tramos, «conciliación 18/18» y una huella de 16 caracteres.
2. Recorre **Acta, Mapa por zonas, Familias, Quintetos, Evolución, Conciliación**. El acta tiene minutos, T2/T3/TL, rebotes, asistencias, pérdidas, robos, tapones, faltas y más/menos.
3. Pulsa **Repetir con la misma entrada**: aparece «huella idéntica».
- **Fallo:** huella distinta con la misma entrada y semilla; suma de puntos que no cuadra con el marcador; algún jugador con más de 5 faltas o con acciones después de la quinta.

## 3 · Cambiar un control
1. En el plan del equipo A pon la **presión** en `full` y **Generar** (otro partido, otra huella). **Restaurar planes naturales** vuelve al plan natural.
- **Fallo:** el cambio no altera nada; cambia el detallado.

## 4 · Parámetros
1. Pestaña **Parámetros** → filtro `neutralSecondsPerControl` → fila `volume.neutralSecondsPerControl` (16, procedencia SEM-SIM01). Pon **14** → **Validar**: «Candidata válida (1 fila)» y la diferencia «16 → 14».
2. Pon **-3**: rechazo con causa («debe ser positivo»). **Descargar candidata** baja un JSON con la fila editada.
3. Vuelve a Partido y genera con la misma semilla: otra huella y «candidata con 1 fila(s)». **Restaurar base** la quita.
- **Fallo:** un valor no válido se acepta; la candidata no cambia el partido; restaurar no vuelve a la base.

## 5 · Descargas
En un resultado: **Entrada y perfil efectivo**, **Resultado** y **Conciliación** bajan archivos JSON legibles; el resultado contiene la misma huella que se ve en pantalla.

## 6 · Lote de 1.000
1. Pestaña **Lote** → **Ejecutar agenda de 1.000**. La barra avanza y la interfaz sigue respondiendo (puedes cambiar de pestaña). Termina con «1000/1000 terminados · válidos 1000».
2. **Descargar resumen** baja el JSON con los 1.000 casos.
- **Fallo:** el navegador se bloquea; algún caso inválido o fallido; el progreso no avanza.

## 7 · Cambiar de motor y volver
**Cambiar de motor** → selector → motor ultrarrápido de nuevo: el último resultado/lote sigue ahí (estado separado por motor).

## Medición de rendimiento (opcional, en terminal)
`node scripts/sim01-bench.js --mode=B01` y `node scripts/sim01-bench.js --mode=B02-B03` (consulta `out/sim-motor01/bench/`). No se ejecutan al arrancar el laboratorio ni en la suite habitual.
