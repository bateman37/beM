# MOTOR-02 — recorrido manual para Dennis

Estado de cada paso: **pendiente de Dennis** (ninguno confirmado por Dennis). Claude ya recorrió la interfaz con Chromium automatizado (ver [`../tecnico/motor02.md`](../tecnico/motor02.md)); eso no sustituye esta revisión.

**Arranque**: `npm run dev` y abrir <http://localhost:5173/> (si el puerto está ocupado: `PORT=5199 npm run dev`). Pestaña **Partido**.

| Prueba | Pasos | Resultado que revisar |
|---|---|---|
| Regresión inicial | Plantillas: editar una ficha y usar +1/+3/+5. | Funciona como en MOTOR-01; la edición no altera partidos ya preparados ni terminados. |
| Total | Modalidad «Simulado total» → Preparar → Iniciar. | Termina sin clics entre periodos; acta, relato y descarga. |
| Cuartos | «Por cuartos» → Jugar primer cuarto. | Para al cerrar el periodo: parcial y acumulado, aviso de energía **anterior** al descanso; no empieza el siguiente solo. |
| Cuartos sin cambios | Pulsar «Aplicar plan y jugar siguiente periodo» sin editar hasta el final. | Sin reinicios de faltas, acta ni energía indebidos; prórroga solo si hay empate. |
| Tiempo | «Por tiempo» → x16 → Iniciar visionado; probar x2/x4/x8/x16. | Ritmo perceptiblemente distinto sin saltos deportivos. |
| Pausa | Pausar y mirar acta/fichas un rato. | Reloj, energía y hechos no cambian. |
| Estilos/libro | Pausar, editar un estilo o prioridad, «Aplicar cambios», continuar. | Borrador ≠ pendiente ≠ vigente; efectos solo hacia delante. |
| Llamada | Pausar, elegir ficha y ámbito, «Confirmar llamada». | Se consume al empezar la ficha, o caduca con motivo; no garantiza canasta. |
| Director | Cambiar director/alternativa (↑↓) y aplicar. | Queda como orden vigente; si el director no está en pista decide la alternativa. |
| Sustitución | «Pedir cambio» (sale/entra). | Queda pendiente; entra en una ventana (falta, balón muerto…), nunca en juego vivo. |
| Quinteto | Quinteto: elegir el mismo jugador en dos posiciones y aplicar; después uno válido. | Error comprensible sin cambios parciales; el válido llega entero. |
| Tiempo muerto | «Pedir tiempo muerto» y continuar. | Pendiente sin gastar cupo; al concederse, parada «Tiempo muerto concedido» y +1,5 de energía a ambos equipos una vez. «Reanudar» sin espera. |
| Delegación | Fijar un quinteto y luego «Devolver el quinteto al entrenador». | Mientras es manual no hay relevos ordinarios; después el entrenador básico continúa. |
| Reproducción | Descargar el JSON de un partido terminado → «Reproducir partido desde JSON» → elegir el archivo → Reproducir. | «Reproducción idéntica…». Un JSON de MOTOR-01 se rechaza con explicación. También: `npm run replay -- archivo.json`. |
| Nuevo partido | Terminar y «Preparar otro encuentro». | Sin órdenes ni temporizadores arrastrados. |

La prórroga no se fuerza en la interfaz; su administración está comprobada con un fixture identificado en `tests/direction.test.js` (6b).
