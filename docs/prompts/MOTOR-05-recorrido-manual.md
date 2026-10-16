# MOTOR-05 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (comprobado: el servidor responde y la interfaz carga; `PORT` para cambiar el puerto); tests: `npm test`; datos: `npm run data:check`; reproducir un JSON: `npm run replay -- fichero.json`. Semilla de referencia `20261016` (resultado de la versión 70–100, perfil `…+SEM-MOTOR05-20261016`). Estado de cada paso: **pendiente de Dennis** (Claude recorrió el flujo con Chromium automatizado; no sustituye tu revisión). Implementación: [`../tecnico/motor05.md`](../tecnico/motor05.md).

Si el navegador conserva un perfil de MOTOR-04 activo, entra en **Panel de ajustes › Inicio** y pulsa «Activar la base de MOTOR-05» (o «Crear candidata MOTOR-05 desde esta versión»). Los planes guardados **no** cambian de organización: conservan ORG01/COB01 y reciben los campos defensivos nuevos con su valor inicial (se avisa en Preparación).

| Prueba | Pasos | Qué revisar |
|---|---|---|
| Salvedades MOTOR-04 | Lee la tabla «Cierre de las salvedades» de [`motor05.md`](../tecnico/motor05.md). | V01/V03/V05/V09 con su comprobación, lo corregido (V03) y lo pendiente de tu decisión (POS05/06, POS14). No hay aprobación genérica de V01–V13. |
| Organizaciones | Preparación → «Defensa» de un equipo → desplegar «Organización defensiva». | Seis opciones; cada una explica sus funciones y concesiones; ninguna promete un porcentaje por nombre. |
| Estilos | Misma pantalla → «Estilos defensivos». | Cinco dimensiones; nivel 3 «Equilibrado» (factor ×1); «Presión al balón» es independiente de la altura y del riesgo de robo. |
| Roles | «Roles defensivos». | Doce opciones con su encargo, independientes del rol ofensivo; no cambian notas. |
| Marcas | «Marcas manuales»: defensor → atacante o función. | La marca válida prevalece sobre la asignación automática; en zona coloca al defensor en la función que cubre ese área. |
| Zonas | Elegir 2–3, 3–2, 1–3–1 y 1–2–2 y jugar; abrir el detalle de tiros (`defensa` en la jugada). | Responsables y relevos distintos ante la misma amenaza; el aro lo protege la función de fondo; hay atacantes «abiertos» por la estructura. |
| Cambio | Cobertura COB02; buscar «cambio» en el relato/detalle. | El emparejamiento resultante persiste en la posesión hasta una reorganización; «el cambio no se completa» también ocurre. |
| Show | COB03. | El continuador puede quedar libre mientras el defensor recupera; sin canasta automática. |
| Atrapar / doble | COB04; después ESPD02 sobre un jugador. | Compromiso de dos, salida con ventaja potencial o rotación; ESPD02 no duplica la trampa. |
| No abandonar | ESPD03 sobre un tirador + doble con un único ayudante compatible. | La ayuda se restringe; la doble queda «no ejecutada: sin ayudante compatible con no abandonar». |
| Box and one | ORG06 con objetivo y alternativa. | Perseguidor + caja; si el objetivo sale (sustitución manual) pasa a la alternativa individual y, sin ninguna, a ORG02 (hecho «defiende ahora en…»). |
| Cambio manual en ausencia | Con el objetivo fuera, ordenar ORG01 y devolver al objetivo. | El plan manual se mantiene: no vuelve box and one al reentrar. |
| Alturas | Normal / tres cuartos / total, con presión máxima. | Avances con demora, presión superada (el apoyo asume y el superado recupera), pérdida o contacto; a veces violación de 8 s; mayor desgaste solo de los comprometidos. |
| Falta táctica | Dirección › «Falta táctica» (poseedor, siguiente posesión rival). | Pedirla no para el reloj; el contacto puede ser ordinaria (saque o libres si hay penalización) o antideportiva (2 libres y posesión); caduca con motivo si no hay oportunidad. |
| Panel | Panel › Tabla maestra (`defense.`) y vista «Defensa»; pestaña «Repertorio». | Filas SEM-MOTOR05 localizables, editables y con consumidor; repertorio defensivo inspeccionable; cambios por candidata, comparación y activación explícitas. |
| Modos | Total / por cuartos / por tiempo con las mismas órdenes. | Mismo deporte y órdenes en ventanas pertinentes. |
| Exportación | Descargar el JSON y `npm run replay -- fichero.json`. | Reproduce el mismo encuentro (`0.5.0-MOTOR05`); un export de MOTOR-04 (`export/3`) se rechaza explicando la versión y el archivo se conserva. |
| Regresión | Fichas ofensivas, disposiciones, jugadores, +1/+3/+5, tiempos muertos y rotación. | Siguen utilizables. |

**Comprobado por Claude**: pruebas automáticas (75), `data:check`, recorrido en Chromium (preparación → partido por cuartos → dirección con cinco órdenes defensivas → panel). **Pendiente de Dennis**: todo el recorrido anterior. **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA (no accesible).
