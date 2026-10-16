# Estado del proyecto

Fotografía breve y actual (no es un changelog; ver [`../CHANGELOG.md`](../CHANGELOG.md)). Última actualización: 2026-10-16, entrega MOTOR-07.

## Qué hay realmente en el repositorio

- **Documentación y normas**: [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), índices, registro de decisiones y catálogo de prompts.
- **Diseño funcional del motor y del primer laboratorio**, organizado por temas en [`motor/`](motor/README.md) (34 capítulos). Es **especificación**: está *definida*, no implementada.
- **Copia original congelada** del funcional unificado y **exportado completo vigente** generado: ver [`historico/`](historico/README.md) y [`exportados/`](exportados/README.md).
- **Utilidades documentales** en `scripts/docs/` (Python 3, librería estándar).

## MOTOR-07 (ejecutado, pendiente de Dennis)

- **Existe**: mapa causal de las 32 capacidades con sondas, Forma estable, presión (máximo de importancia y tensión, MEN07), tres momentos individuales con Consistencia y actualización perezosa, T colectivo sin conversión directa, pausas, episodios EPI01–EPI06 con evidencia, perturbación neutral de la salida final, copias de contraste C00–C06, vistas propia/rival/diagnóstico y `export/6`. 11 pruebas nuevas (106 en total) y cinco partidos completos de cierre. Ver [`tecnico/motor07.md`](tecnico/motor07.md) y [recorrido manual](prompts/MOTOR-07-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM), tablas declarativas de tareas con estados y episodios (lectura de Claude); nada calibrado ni validado. **Cambia los resultados** (referencia `20261016`: 82–97 → 83–97); el `export/5` se rechaza sin reproducirse.
- **Salvedades de MOTOR-06**: corregidos ESP15 y el envío forzado de saque; pendientes COB04 en entregas, libres de la disruptiva (PDF FIBA inaccesible, 403) y etiquetas ESP: cuatro `DECISIÓN REQUERIDA` en `motor07.md`.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-08: memoria y entrenador estratégico; no iniciado).

## MOTOR-06 (ejecutado, pendiente de Dennis)

- **Existe**: catálogo ESP01–ESP20 sobre un único flujo de oportunidades (llamada, recurso autónomo y decisión directa con la misma ejecución), transición con continuidad, seis saques ofensivos y seis respuestas defensivas con sacador fuera de pista, plazo de 5 s y tres relojes separados, llamada puntual de saque, pase inicial real en POS05/06, director como aislador en POS14, coberturas en entregas e indirectos, decisión única de robo y categorías disruptiva/flagrante. `export/5`, diagnóstico con numerador y denominador. 20 pruebas nuevas y cinco partidos completos de cierre. Ver [`tecnico/motor06.md`](tecnico/motor06.md) y [recorrido manual](prompts/MOTOR-06-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM), contenido declarativo (lectura de Claude) y lecturas FIBA propias (PDF no accesible, 403); nada calibrado. **Cambia los resultados** (referencia `20261016`: 70–100 → 82–97); `export/4` se rechaza sin reproducirse.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones de `motor06.md`. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-07: Forma y momentos; no iniciado).

## MOTOR-05 (ejecutado, pendiente de Dennis)

- **Existe**: seis organizaciones defensivas como funciones y responsabilidades (individual, 2–3, 3–2, 1–3–1, 1–2–2, box and one con objetivo, alternativa y ORG02 por ausencia), cinco estilos defensivos, tres alturas de presión (avance presionado y violación de 8 s), cuatro coberturas, doce roles, marcas, ayudas con relevo, ESPD01–ESPD03 (falta táctica con antideportiva administrada, doble, no abandonar), órdenes defensivas con validación conjunta, controles en Preparación y dirección en vivo y panel › Repertorio defensivo. 75 pruebas y cinco partidos completos de cierre. Ver [`tecnico/motor05.md`](tecnico/motor05.md) y [recorrido manual](prompts/MOTOR-05-recorrido-manual.md).
- **Salvedades de MOTOR-04**: V03 corregido; V05 y V09 verificados; V01 contrastado (POS05/06 y POS14 pendientes de decisión de contenido); el 90–126 revisado sin evidencia de error («SEM, evaluación pendiente»).
- **Provisional**: cifras del anexo A (SEM), contenido declarativo defensivo (lectura de Claude, D01) y lecturas FIBA propias de antideportiva y 8 s (PDF no accesible); nada calibrado. **Cambia los resultados** (referencia `20261016`: 90–126 → 70–100); los `export/2` y `/3` se rechazan sin reproducirse.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y las decisiones de `motor05.md`. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-06: ESP completo y saques tácticos; no iniciado).

## MOTOR-04 (ejecutado, pendiente de Dennis)

- **Existe**: siete estilos y media distancia con efecto, DIS01–DIS06, quince roles, libro de quince fichas por familia con nueve continuaciones, decisión del receptor, negación (CONT06/CONT07), encargos de rebote y balance, panel › Repertorio, candidata explícita desde perfiles anteriores y órdenes de disposición y roles. 63 pruebas y cuatro partidos completos de cierre. Ver [`tecnico/motor04.md`](tecnico/motor04.md) y [recorrido manual](prompts/MOTOR-04-recorrido-manual.md).
- **Provisional**: cifras del anexo A (SEM) y contenido declarativo del repertorio (lectura de Claude, V01); nada calibrado. **Cambia los resultados** respecto a MOTOR-02/03.
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual y V01/V03/V05/V09. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-05 ejecutado: defensa completa).

## MOTOR-03 (ejecutado, pendiente de Dennis)

- **Existe**: pestaña «Panel de ajustes» (diccionario, tabla maestra, mesa por preguntas, vistas, catálogo 81 + 4, perfiles con herencia, validación, publicación/activación, comparador y intercambio JSON), perfil base protegido V0 y persistencia local. 53 pruebas. Ver [`tecnico/motor03.md`](tecnico/motor03.md) y [recorrido manual](prompts/MOTOR-03-recorrido-manual.md).
- **Provisional**: todo sigue SEM; las 384 filas no tienen referencia ni evaluación; 22 filas están declaradas sin mecanismo (solo lectura); la asignación a los 81 grupos es propuesta de Claude.
- **Comprobado por Claude**: pruebas automáticas, equivalencia con el partido de referencia anterior (semilla 20261016, 94–89) y recorrido completo en Chromium. **Pendiente de Dennis**: todo el recorrido manual. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis. Continuidad obligatoria: cada entrega posterior añade al mismo diccionario sus filas, validaciones, consumidores y cobertura.

## MOTOR-02 (integrado en `main`)

- **Existe**: tres modalidades (total, por cuartos con prórrogas, por tiempo x2/x4/x8/x16 con pausa) sobre un único núcleo por fronteras; órdenes (estilos, prioridades, director, llamada, sustitución/quinteto, devolver al entrenador, tiempo muerto) con ciclo de vida; JSON ampliado y reproducción. 40 pruebas. Ver [`tecnico/motor02.md`](tecnico/motor02.md) y [recorrido manual](prompts/MOTOR-02-recorrido-manual.md).
- **Provisional**: extensión `SEM-MOTOR02-20261016` (+1,5 de energía por tiempo muerto) y cupos de tiempos muertos: semilla/lectura propia, no calibradas ni contrastadas con el PDF FIBA (no accesible). No completa los 81 grupos.
- **Cambio de resultados**: la corrección B01 (el lanzador de libres ya no sale antes de tirar) modifica los resultados de referencia de MOTOR-01 (p. ej. `20261016`: 98–85 → 94–89).
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: todo el recorrido manual. **No ejecutado**: Node 24, otros navegadores, contraste con el PDF FIBA.

## MOTOR-01 (integrado en `main`; Dennis comunicó arranque local y recorrido manual correctos)

- **Existe**: motor de partidos por acontecimientos (`src/match/`), laboratorio web local (`npm run dev`, <http://localhost:5173/>) con plantillas editables de EQ01/EQ02, +1/+3/+5, preparación, simulación completa, acta, relato, detalle y descarga JSON; 23 pruebas automáticas. Ver [`tecnico/motor01.md`](tecnico/motor01.md).
- **Provisional**: perfil y fichas son SEM, no calibrados; no cierran los 81 grupos finales. Interpretaciones reglamentarias T01–T04 sin contrastar con el PDF FIBA (no accesible).
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: [recorrido manual](prompts/MOTOR-01-recorrido-manual.md). **No ejecutado**: Node 24, otros navegadores.

## Qué no existe todavía (histórico DOC-001, parcialmente superado)

- No hay motor de partidos, laboratorio, manager, pantallas, API, tablas de base de datos, servicios, simulador, jugadores ejecutables ni fórmulas de partido implementadas.
- No hay stack de aplicación elegido ni aplicación ejecutable; no hay CI. `main` no es «jugable» porque aún no hay juego (N03).
- La documentación técnica está vacía a propósito: ver [`tecnico/README.md`](tecnico/README.md).

## Entrega realizada

**DOC-001 — Organización documental y normas** (2026-10-16): ver [ficha](prompts/README.md#doc-001). Estado: ejecutada por Claude, **pendiente de revisión de Dennis**.

| Comprobado por Claude | Pendiente de Dennis | No ejecutado |
|---|---|---|
| Conservación íntegra de la importación, enlaces locales y exportado reproducible: ver [`motor/COBERTURA.md`](motor/COBERTURA.md). | Revisión manual de la lista de [`prompts/README.md`](prompts/README.md#doc-001-revisión-manual-para-dennis) y aceptación de la PR. | Presentación en GitHub (renderizado de anclajes y tablas) no comprobada visualmente desde el entorno de ejecución. |

## Lo que el propio funcional deja por completar

No es una decisión que falte por inventar; está identificado en el diseño con sus estados (CARGA, SEM, EVAL):

- Filas numéricas de los 81 grupos deportivos y de contenido, correspondencias reglamentarias y estadísticas, perfiles completos de las 144 plazas, planes, rangos del generador y escenarios y tolerancias de auditoría.
- Las semillas numéricas son **provisionales**; nada está **calibrado**; no hay evidencia (EVAL) de partidos ejecutados.
- Detalle: [Alcance de construcción y trabajos por completar](motor/alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md) y [Perfil inicial y semillas](motor/configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md).

## Incidencias conocidas

- Los **ocho originales** (MD01–MD08) no fueron suministrados; se declara en [`historico/README.md`](historico/README.md). El unificado registra sus nombres y huellas SHA-256 en su [capítulo 34](motor/trazabilidad/README.md).

## Siguiente paso autorizado

Ninguno está ordenado por esta entrega. La siguiente entrega se definirá mediante otro prompt en Markdown (norma N11), usando esta documentación ya organizada. Esta PR documental **no** ordena implementar el catálogo completo ni iniciar el resto del manager.
