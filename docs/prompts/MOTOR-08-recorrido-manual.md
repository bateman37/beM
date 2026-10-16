# MOTOR-08 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (`PORT` para cambiar el puerto); tests: `npm test`; datos: `npm run data:check`; reproducir un JSON: `npm run replay -- fichero.json`. Semilla de referencia `20261016` (resultado de la versión **88–110**, parciales 22–30 · 20–30 · 22–20 · 24–30; perfil `SEM-MOTOR01…+SEM-MOTOR08-20261016`, SEM: provisional, no calibrado).

Si el navegador conserva un perfil de MOTOR-07 activo, entra en **Panel de ajustes › Inicio** y activa de forma explícita la base de MOTOR-08 (o crea una candidata desde esa versión): nada se activa ni se migra en silencio. Tu entrada guardada se migra de forma explícita (política ENTREF02, ámbitos delegados y plan de participación precargados, revisables).

| Prueba | Pasos | Qué revisar |
|---|---|---|
| Preparación | Preparación › desplegable «Entrenador» de cada equipo. | Política (Cauta / Equilibrada / Agresiva), cinco ámbitos delegables y plan de participación por pareja (suma 200 min). Al cambiar un titular, el plan se recarga desde la precarga SEM (revisable). Ninguna política se presenta como «mejor». |
| Rotaciones | Partido completo; Panel › Vistas temáticas › Entrenador; diagnóstico «Entrenador y memoria». | Sustituciones con motivo (energía, tramo largo, protección por faltas); sin intercambios inmediatos; un titular con energía baja no sale solo por eso si el relevo es peor. |
| Faltas | Plantillas: pon 4 faltas a un titular al empezar el Q4 (o juega hasta que ocurra). | En Q1–Q3 se protege con un relevo compatible; en el cierre disputado puede mantenerse. Cinco faltas = sale siempre. |
| Tiempos muertos | Partido con racha adversa; tarjeta «Entrenador» del partido. | Solicitud con causa y evidencia, espera su ventana, una sola pausa; tu tiempo muerto manual prevalece sobre el automático. |
| Ajustes y memoria | Panel › Memoria; diagnóstico › memoria final; libro de una sola ficha para repetir un recurso. | Los patrones se reconocen aunque cambie la ficha; la respuesta es un cambio de plan en su frontera (nunca resta acierto); máximo ocho patrones. |
| Delegación | Partido «por cuartos»: desmarca «Ajustes tácticos» y reanuda. | El entrenador reconoce y registra pero no ejecuta; la delegación entra en la siguiente frontera. |
| Control manual | Cambia tu cobertura a mano (con «hasta final de cuarto») y mira la tarjeta. | «Control manual activo sobre: coverage»; el entrenador no la sobrescribe; «Devolver el control» lo libera. |
| Finales | Partido con marcador cerrado en el Q4. | Estilos de cierre por contexto, falta táctica solo perdiendo con la posesión rival, estilos restaurados al terminar el contexto. |
| Información | Partido dirigiendo un equipo. | El rival no muestra energía, Forma ni momentos; el entrenador automático usa solo su vista permitida. |
| Salvedades FIBA | Detalle de una falta disruptiva fuera del acto de tiro. | Dos libres para quien recibió la falta y saque de su equipo con 14 s; COB04 en una entrega con fallback declarado. **Texto tomado del resumen del encargo, sin PDF.** |
| Reproducción | Descargar JSON y `npm run replay`; probar un `export/6`. | El `export/7` reproduce decisiones y órdenes automáticas sin duplicar tiempos muertos; el `export/6` se rechaza con motivo y se conserva. |
| Regresión | Tres modos, repertorio, ESP, saques, defensa, +1/+3/+5, edición de fichas. | Siguen utilizables. |

**Comprobado por Claude**: pruebas automáticas (118), `data:check`, cinco partidos completos de integración y recorrido en Chromium (preparación, partido completo, tarjeta de entrenador, diagnóstico, vistas del panel). **Pendiente de Dennis**: todo el recorrido anterior y las decisiones de [`../tecnico/motor08.md`](../tecnico/motor08.md). **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA.
