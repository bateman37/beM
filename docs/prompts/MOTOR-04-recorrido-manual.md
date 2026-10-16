# MOTOR-04 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (o el `PORT` que definas); tests: `npm test`; datos: `npm run data:check`; reproducir un JSON: `npm run replay -- fichero.json`. Semilla de referencia `20261016`. Estado de cada paso: **pendiente de Dennis** (Claude recorrió el flujo con Chromium automatizado; no sustituye tu revisión). Implementación: [`../tecnico/motor04.md`](../tecnico/motor04.md).

Si el navegador conserva un perfil de MOTOR-03 activo, entra en **Panel de ajustes › Inicio** y pulsa «Activar la base de MOTOR-04» (o «Crear candidata MOTOR-04 desde esta versión»).

| Prueba | Pasos | Qué revisar |
|---|---|---|
| Estilos | Preparación → «Estilos ofensivos» y «Media distancia». | Siete controles agrupados y la media distancia legibles; nivel 3 «Equilibrado»; cada nivel explica su efecto numérico sin prometer victorias. |
| Ritmo/elaboración | Poner ritmo «Muy rápido» y elaboración «Pocas acciones» (y al revés). | Se combinan de forma independiente; el número de pases no es una cuota. |
| Disposiciones | Cambiar la disposición del equipo por las seis. | Se ven las funciones, la ocupación con tu quinteto y, en cada ficha, entrada natural / realizable / tras reorganizar / no realizable con su causa funcional (no por posición nominal). No cambia el talento por colocar fuera. |
| Horns y 1–4 | Elegir DIS04 y DIS06. | Son entradas del selector general (no mezclan con saques box/stack/diamond). |
| Roles | Cambiar el rol ofensivo de un jugador en «Roles ofensivos». | Cambia a quién se asigna/protagonismo en las fichas; sus capacidades quedan intactas. |
| Director | Cambiar el director y jugar. | Cambia quién organiza; tras una recepción corta decide el receptor con su propia lectura (ver «decide X tras recibir» en el relato). |
| Libro | «Libro: quince fichas por familia»: activar/desactivar, repetir la prioridad 1. | Seis familias; «ver ficha» muestra intención, funciones, entradas naturales, salidas, opciones y compatibilidad; repetir prioridad no multiplica la familia. |
| Llamadas | Partido por cuartos o por tiempo → «Llamar una ficha» (p. ej. POS13 desde DIS02). | La llamada se consume al inicio efectivo (tras una reorganización visible); si no se inicia, caduca con motivo. |
| Apertura / corta | Cargar el plan de demostración y jugar; buscar POS03 y POS04 en el relato. | POS03: el bloqueador abre (CONT02); POS04: recepción corta (CONT03) y decide el receptor. Opciones distintas. |
| Indirecto / corte | Buscar POS07/POS08 con «sistema negado» (cobertura) y CONT06/CONT07. | Puede haber salida negada y corte útil sin recepción inventada; POS10 solo aparece tras una negación. |
| Poste / alto-bajo | Buscar POS11, POS12, POS13. | Posiciones y actores distintos; no garantizan recepción profunda. |
| Aclarado / directo | POS14/POS15 y los recursos ESP. | Las fichas exigen intención organizada; un tiro espontáneo no se etiqueta como ficha (procedencia «recurso directo»). |
| Rebote / balance | «Después del tiro» 1 vs 5; ver el detalle del rebote. | `encargos`: quiénes cargan y quiénes quedan de balance; coste visible en las transiciones del rival. |
| Dirección en vivo | Por cuartos: cambiar disposición/rol/estilos. | Disposición y rol esperan la próxima entrada/reorganización; no alteran lo ya jugado. |
| Panel | Panel › Tabla maestra → buscar `transitionAttemptOddsRatio`, `midrangePolicy`, `offensiveReboundAssignmentTarget`; pestaña «Repertorio». | Filas SEM-MOTOR04 localizables, editables, con consumidor real; el repertorio es inspeccionable (solo lectura). |
| Comparación | Panel › Comparador (candidata vs base). | Conserva entradas, muestra y límites; no activa nada. |
| Exportación | Descargar el JSON y `npm run replay -- fichero.json`. | Reproduce el mismo encuentro (versión `0.4.0-MOTOR04`); un export de MOTOR-02/03 se rechaza como anterior. |
| Regresión | Jugar total/cuartos/tiempo, pausas, sustituciones, tiempos muertos y editar jugadores. | Siguen utilizables. |
