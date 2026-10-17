# MOTOR-11 — Recorrido manual para Dennis

**Estado: pendiente de Dennis.** Lo probado automáticamente (suite, `data:check`, cinco partidos, Chromium automatizado) no sustituye este recorrido.

**Arranque:** `npm run dev` → `http://localhost:5173/`. La consola debe decir «MOTOR-11». Para repetir las pruebas empieza con el almacenamiento del navegador limpio (ventana privada).

| # | Pasos | Esperado | Señal de error |
|---|---|---|---|
| 1 | Abre la página. | Cabecera «MOTOR-11 — … motor beM-motor-0.9.0-MOTOR09 · beM-match-export/8» igual que la consola; el perfil activo aparece aparte (puede ser anterior). | Cabecera con otra versión que la consola. |
| 2 | Panel de ajustes › Inicio › «Activar la base de MOTOR-11» (si aparece). | Se activa explícitamente; tarjeta «Versiones visibles» con cuatro filas separadas. | Se activa solo o pierde perfiles guardados. |
| 3 | Plantillas › catálogo. | Doce tarjetas EQ01–EQ12 con identidad y plan; sin «fuerza» global. | Faltan equipos o hay un overall. |
| 4 | «Inspeccionar» EQ07 › ficha de EQ07-J01; después un joven de EQ08, la estrella EQ11-J03 y un suplente de EQ12. | 40 años en EQ07-J01; 32 capacidades agrupadas (18/7/7), roles, tendencias, procedencia R0→R1. | Edad 37, capacidades repetidas entre equipos. |
| 5 | Equipo A abierto › selecciona dos jugadores y TEC01+TEC08 › «Ver qué se va a modificar» con +3. | Número de celdas, saturaciones; «Aplicar» y «Deshacer» devuelve el valor anterior exacto (un 29 vuelve a 29). | Vuelve a 27 o queda un valor distinto. |
| 6 | «Guardar como variante», recarga la página, «Restaurar referencia». | La variante aparece en el catálogo con sus diferencias; restaurar no la borra. | Se pierde la variante o cambia la referencia. |
| 7 | Preparación › «Cargar el plan natural» en exterior (EQ02), interior (EQ03), Horns (EQ04), 1–4 bajo (EQ07). | Disposición, defensa, director/relevos y compatibilidades coherentes; el resto de ediciones de jugadores se conserva. | Director de otro equipo, errores de validación. |
| 8 | Coloca EQ05 y EQ06 (A y B), valida y juega un partido. | Entrada válida; partido completo si lo deseas. | Entrada inválida sin causa concreta. |
| 9 | Generador: EQ04, semilla 20261017, dispersión 1 › Previsualizar › «Comprobar reproducción»; cambia a 20261018. | Misma configuración → misma huella; otra semilla → diferencias reales. | Huella distinta con la misma semilla. |
| 10 | «Guardar como equipo generado» y «Usar como A»; coloca el mismo EQ04 como B. | Dos copias sin colisión (EQ04 / EQ04_B si procede); el partido se prepara. | Error de identificadores duplicados. |
| 11 | Escenarios: LAB11-02 (energía), LAB11-07 (Forma), LAB11-08 (libertad), LAB11-09 (carga) › «Ver base, variante y diferencias». | Diferencias exactas listadas; el escenario se rotula «diagnóstico» o «multicausa»; tu entrada no cambia. | Cambian fichas propias. |
| 12 | Prepara una variante y juega **por cuartos** y en **visionado**; en LAB11-10 envía la orden prevista en el C2. | Las órdenes respetan sus ventanas existentes. | Se aplica una orden sin enviarla. |
| 13 | Tras un partido › Análisis. | Cuota de cierres y producción por 100 en la ficha del jugador; «lado desconocido»; tiros por organización efectiva. Cambia a «Público»: OB05 y función del tirador desaparecen. | Cifras 0 en lugar de «—», OB05 visible al público. |
| 14 | Exporta un escenario (JSON) e impórtalo; descarga un partido generado y «Reproducir». | Importa con huella válida; la reproducción es idéntica sin regenerar. | Reproducción distinta. |
| 15 | Modifica una plantilla después del partido. | El acta y el análisis del partido terminado no cambian. | Cambian. |

Las copias diagnósticas son entradas preparadas, no acontecimientos naturales. No marques como probado lo que hizo la automatización.
