# MOTOR-07 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (`PORT` para cambiar el puerto); tests: `npm test`; datos: `npm run data:check`; reproducir un JSON: `npm run replay -- fichero.json`. Semilla de referencia `20261016` (resultado de la versión 83–97, perfil `…+SEM-MOTOR07-20261016`). Estado de cada paso: **pendiente de Dennis** (Claude recorrió el flujo con Chromium automatizado; no sustituye tu revisión). Implementación: [`../tecnico/motor07.md`](../tecnico/motor07.md).

Si el navegador conserva un perfil de MOTOR-06 activo, entra en **Panel de ajustes › Inicio** y pulsa «Activar la base de MOTOR-07» (o «Crear candidata MOTOR-07 desde esta versión»). Tu entrada guardada se migra de forma explícita (importancia ordinaria y estados neutrales) y se avisa en Preparación.

| Prueba | Pasos | Qué revisar |
|---|---|---|
| Catálogo | Panel › «Capacidades por tarea y cuerpo»; `docs/tecnico/motor07.md` (mapa). | 32 notas agrupadas; cada una tiene tareas/consumidores reales, no otra habilidad escondida. |
| Gesto/preparación | Detalle de un tiro de poste y de un triple tras bote. | Técnica de tiro y preparación separadas; el poste crea la ventaja sin reemplazar el tiro. |
| Energía | Plantillas › energía inicial 100 / 70 / 30 / 10 y partido; panel › vista «Estados» (curva). | Poco efecto entre 100 y 70 y coste creciente bajo 10; un referente con E30 no se retira solo por eso. |
| Forma | Plantillas › activa el modo diagnóstico y pon Forma +0,6 / −0,6 (o copia C01). | Categoría propia (Buena/Mala); no cambia con canastas ni al acabar un cuarto. |
| Momentos | Partido con una copia C05; mira la tabla propia y la tarjeta de diagnóstico. | Tres ámbitos separados, estado inicial y evolución registrada; un acierto no garantiza calentarse. |
| Consistencia | Copia C04. | Más estabilidad frente a más variación, sin una etiqueta de «más talento». |
| Presión | Importancia «Decisivo» en Partido; mira el detalle de un tiro (`estados:forma_presion`). | Importancia/tensión (máximo, no suma) y resistencia de MEN07; ningún bonus universal de final. |
| Colectivo | Detalle de la calidad de una oportunidad con T ≠ 0 y lista de episodios. | Una reorganización real (EPI03) o una ayuda útil (EPI04) puede influir sin anotar; entrar/salir de un jugador no activa ni borra un aura. |
| Pausas | Modo «por cuartos» o un tiempo muerto manual. | Una pausa visual no cambia estados; el tiempo muerto o el intervalo (EPI06) atenúa una vez, sin fijar a neutral. |
| Veterano | Copia C03. | Lectura y técnica útiles pese a físicas bajas; la edad sola no cambia resultados (edita solo la edad: mismo partido). |
| Información | Partido con dirección de un equipo. | El rival no muestra energía, Forma ni momentos exactos (solo racha pública); el diagnóstico está separado y no llega al entrenador automático. |
| Panel | Abre filas `form.*`, `pressure.*`, `moment.*`, `episodes.*`. | Curvas, composición, episodios y datos SEM con su valor efectivo y consumidor. |
| Perfiles | Crear candidata, validar, activar. | Activar una candidata no cambia el partido abierto ni los históricos; `alpha ≥ 1` o un aporte directo de T se rechazan. |
| Reproducción | Descargar JSON y `npm run replay`; probar un `export/5`. | El export actual reproduce estados, episodios y órdenes; el anterior se rechaza con motivo y se conserva. |
| Regresión | Tres modos, repertorio, ESP, saques, defensa, +1/+3/+5, edición de fichas. | Siguen utilizables. |

**Comprobado por Claude**: pruebas automáticas, `data:check`, cinco partidos completos y recorrido en Chromium (copia C05, partido completo, diagnóstico, panel). **Pendiente de Dennis**: todo el recorrido anterior y las decisiones de `motor07.md`. **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA (403).
