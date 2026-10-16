# MOTOR-01 — recorrido manual para Dennis

Arranque: `npm run dev` y abrir <http://localhost:5173/>. Estado de cada caso: **pendiente de Dennis** salvo lo indicado como comprobado por Claude (Chromium automatizado, semilla 20261016).

| Caso | Pasos | Resultado esperado | Comprobado por Claude | Resultado de Dennis |
|---|---|---|---|---|
| Arranque limpio | `npm run dev`, abrir la URL. | Se ve «Plantillas» con EQ01 y EQ02, doce jugadores cada uno, quinteto marcado, perfil SEM visible en la cabecera. | Sí | |
| Ficha y edición | «Abrir ficha» de un jugador. Cambiar una capacidad (p. ej. Pase). | 32 capacidades en 6 grupos, cuerpo, roles, tendencias, estados neutrales sin controles. El valor admite decimales (1–30). | Sí (32 campos) | |
| +1/+3/+5 | Seleccionar dos jugadores y dos capacidades; «Ver qué se va a modificar»; aplicar +3. Repetir con todos + todas + +5. | La vista previa lista exactamente la selección; sin selección no cambia nada; los valores en 30 se quedan en 30 (sin wraparound). | Sí (768 valores, 27 al límite) | |
| Restaurar | «Restaurar fichas iniciales». | Vuelven los valores del anexo B; no ocurre al simular ni al cambiar de pestaña. | Sí | |
| Energía | Cambiar la energía inicial de un titular a 20 y simular. | Se muestra la energía final; el titular es relevado cuando hay ventana legal y recambio útil. | Parcial (editable) | |
| Partido completo | «Preparación» → semilla 20261016 → «Partido» → «Simular partido». | Marcador 98–85 (EQ01), parciales 23-23, 32-13, 23-21, 20-28, acta, quintetos, sustituciones, relato por posesiones. | Sí | |
| Libro y estilo | En «Preparación» subir la prioridad de POS11 a 1 y la prioridad de finalización de EQ02 a 5; simular. | Cambian las elecciones de la tabla «Elecciones producidas». Una partida no demuestra estadística. | No | |
| Atributo pertinente | Subir el Pase (TEC08) del director EQ01-J01; simular; abrir «ver detalle» de un acontecimiento con pase. | El detalle muestra la capacidad base y efectiva, el peso, la energía y las probabilidades. No se exige ganar. | Sí (detalle abre) | |
| Repetición y descarga | «Repetir con la entrada congelada»; «Descargar encuentro (JSON)». | Repetición idéntica; el JSON contiene entrada, perfil, semilla, hechos, sorteos, acta y cobertura. | Sí | |
| Edición posterior | Editar una ficha después de terminar un partido. | El acta mostrada no cambia. | No (probado por test automático) | |
