# MOTOR-06 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (`PORT` para cambiar el puerto); tests: `npm test`; datos: `npm run data:check`; reproducir un JSON: `npm run replay -- fichero.json`. Semilla de referencia `20261016` (resultado de la versión 82–97, perfil `…+SEM-MOTOR06-20261016`). Estado de cada paso: **pendiente de Dennis** (Claude recorrió el flujo con Chromium automatizado; no sustituye tu revisión). Implementación: [`../tecnico/motor06.md`](../tecnico/motor06.md).

Si el navegador conserva un perfil de MOTOR-05 activo, entra en **Panel de ajustes › Inicio** y pulsa «Activar la base de MOTOR-06» (o «Crear candidata MOTOR-06 desde esta versión»). Los planes guardados reciben los campos de saques con sus valores por defecto (SaqB01 y SaqF03 a prioridad 3; DSaqB01 y DSaqF01) y se avisa en Preparación.

| Prueba | Pasos | Qué revisar |
|---|---|---|
| Salvedades MOTOR-05 | Lee «Cierre de las salvedades» de [`motor06.md`](../tecnico/motor06.md). | POS05/06, POS14, coberturas, robos, disruptiva/flagrante y 8 s con su resultado; ninguna aprobación en bloque. |
| POS05/POS06 | Plan con POS05 o POS06 y partido; abrir la jugada en el detalle. | El director entrega primero al eje si no tiene el balón: pase real con emisor y receptor, sin segunda pérdida ni asistencia automática. |
| POS14 | Libro con POS14. | El director puede ser aislador, sin prioridad ni obligación. |
| Coberturas en entregas e indirectos | POS05–POS08 con COB01 y COB02 (y una incompatible, p. ej. COB03). | Responsables reales; lo incompatible se declara y no se sustituye. |
| ESP01–ESP20 | Partido con libertad alta; abrir el detalle y buscar etiquetas ESP. | Cada situación aparece en su contexto; una opción con varias etiquetas es una sola; sin cuotas. |
| Origen de la acción | Detalle de varias jugadas. | `procedencia` distingue llamada, libro, recurso autónomo y decisión directa; nada aparece como ficha falsa. |
| Libertad | Libertad mínima frente a máxima. | Casi sin decisiones directas con la mínima; aparecen sin cuota con la máxima. |
| Transición | Partido hasta un robo, tapón vivo o rebote. | Continuidad, balance y oposición; no reinicia ni recoloca; ESP19 solo con tiro temprano forzado. |
| Saques ofensivos | Preparación › «Saques de banda y fondo»; activar SaqB01–03 y SaqF01–03; abrir sus fichas. | Fichas legibles; prioridad 1–5 compartida; sin coeficientes en las etiquetas. |
| Sacador | Elegir preferido y alternativo; sacar a un jugador del campo. | Fuera de la pista y distinto del receptor; revalidación a alternativo y luego a política funcional. |
| Respuestas defensivas | Elegir DSaqB01–03 y DSaqF01–03; DSaqF02 con y sin objetivo. | Una respuesta por tipo de saque; DSaqF02 exige objetivo; persecución o cambio exigen COB01/COB02. |
| Plazo y relojes | Detalle de un saque tras canasta y tras pérdida. | Plazo de 5 s del sacador, reloj de juego (solo si corría) y de posesión (primer toque) distintos. |
| Llamada puntual | Dirección › llamada de saque. | Espera el siguiente saque propio compatible del periodo; caduca con el periodo; lo imposible se rechaza con motivo. |
| Diagnóstico | Tarjeta de diagnóstico tras un partido. | Numerador y denominador; denominador 0 como «no calculable». |
| Panel y exportación | Panel › Repertorio (ESP y saques), Tabla maestra; descargar JSON y `npm run replay`. | Filas con consumidor; reproduce el mismo encuentro (`0.6.0-MOTOR06`); un `export/4` se rechaza con motivo y el archivo se conserva. |
| Regresión | Fichas, disposiciones, defensa, +1/+3/+5, tiempos muertos y rotación. | Siguen utilizables. |

**Comprobado por Claude**: pruebas automáticas, `data:check`, cinco partidos completos y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido anterior. **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA (403).
