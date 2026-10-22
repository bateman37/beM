# MOTOR-18C — Recorrido manual para Dennis

Prueba **concreta y breve** de lo que cambia en 18C: el aprendizaje posterior al partido solo se aplica a **su propia copia** y el encuentro aplicado se identifica por su fuente completa. Arranque: `npm run dev` y abrir la dirección que muestra la consola. Cabecera esperada: `MOTOR-18C — identidad del aprendizaje del laboratorio · motor beM-motor-0.18.1-MOTOR18B · beM-match-export/10`. El motor, el perfil, la familiaridad y los formatos **no cambian** respecto a 18B.

Qué ha recorrido Claude y qué queda a Dennis: Claude recorrió con Chromium (Playwright) el flujo completo (15 pasos, consola 0, red 0; resultado en [`../tecnico/evidencia-motor18c/recorrido-navegador.json`](../tecnico/evidencia-motor18c/recorrido-navegador.json)) y jugó **un** partido nuevo para ambos recorridos. **La aceptación manual queda pendiente de Dennis**: que el navegador automatizado pase no la sustituye. La distinción M1/M10 se acredita automáticamente (prueba T18C-01); no hace falta jugar diez encuentros.

## 1 · Activar una copia de aprendizaje

1. **Plantillas › Crear copia de aprendizaje MOTOR-18**. Anota el identificador de la copia activa (termina en `-I<n>`, por ejemplo `LEARN18-S-EQ01-EQ02-d0-I1`).

## 2 · Terminar un encuentro y ver la propuesta

1. **Partido**: modo «Simulado total» › **Preparar encuentro** › **Iniciar simulación completa**. Espera a «Finalizado».
2. Debajo del marcador aparece la tarjeta **«Aprendizaje propuesto por este partido»** con los botones «Ver aprendizaje propuesto» y «Aplicar a esta variante». Pulsa **Ver aprendizaje propuesto**: cada equipo muestra su fuente completa, `<copia>|M1|EQ01` y `<copia>|M1|EQ02`.
- **Fallo:** la tarjeta aplica algo sin pulsar «Aplicar»; una fuente basada en la semilla o el marcador en lugar de la identidad de copia y encuentro.

## 3 · Aplicar una vez y comprobar el recibo

1. Pulsa **Aplicar a esta variante**. Mensaje verde: «EQ01: aplicado (APL-1) · EQ02: aplicado (APL-1)».
2. El botón queda **deshabilitado**: la misma fuente no se aplica dos veces. En **Plantillas › Laboratorio de conocimiento › Registro de aplicaciones** aparecen dos filas «aplicada» con esas fuentes exactas.
- **Fallo:** el botón sigue activo tras aplicar; aparece una segunda aplicación de la misma fuente.

## 4 · Deshacer

1. En **Plantillas › Laboratorio de conocimiento** pulsa **Deshacer la última aplicación** dos veces (una por equipo, en orden inverso). El mensaje indica que conocimiento, peak, reloj y presupuestos se restauran; en el registro las aplicaciones quedan «revertida» y conservan su rastro.
2. Vuelve a **Partido**: el botón «Aplicar a esta variante» está de nuevo habilitado (política vigente: una fuente revertida puede reaplicarse).
- **Fallo:** un estado que no vuelve al anterior; el botón sigue deshabilitado tras revertir ambas aplicaciones.

## 5 · Mantener el resultado y crear otra copia con los mismos equipos

1. **Sin recargar la página**, ve a **Plantillas** y pulsa de nuevo **Crear copia de aprendizaje MOTOR-18**. Acepta el aviso «¿Sustituirla por una nueva…?». La copia nueva tiene otro identificador (`-I2`) pero los mismos equipos EQ01/EQ02.

## 6 · Volver al resultado: aviso de pertenencia

1. Vuelve a **Partido**. El resultado anterior sigue visible, pero la tarjeta muestra el aviso **«Este partido pertenece a otra copia de aprendizaje. No se puede aplicar a la copia activa.»** Despliega «Detalle de diagnóstico»: verás la copia del resultado (`…-I1`), el encuentro (`M1`) y la copia activa (`…-I2`).
2. No hay botón «Aplicar a esta variante» ni «Ver aprendizaje propuesto», y no existe ninguna acción de forzar o importar entre copias. En **Plantillas** el registro de la copia nueva sigue vacío.
- **Fallo:** aparece un botón de aplicar; la copia nueva registra una aplicación con fuentes de la copia anterior.

> Nota: tras **recargar** la página (F5) el partido terminado en memoria desaparece (no se reabre): la copia activa y su registro sí se conservan. Esto no cambia en 18C.

Marca aquí tu resultado: ☐ 1 · ☐ 2 · ☐ 3 · ☐ 4 · ☐ 5 · ☐ 6 (pendiente de Dennis).
