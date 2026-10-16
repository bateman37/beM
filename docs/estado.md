# Estado del proyecto

Fotografía breve y actual (no es un changelog; ver [`../CHANGELOG.md`](../CHANGELOG.md)). Última actualización: 2026-10-16, entrega MOTOR-02.

## Qué hay realmente en el repositorio

- **Documentación y normas**: [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), índices, registro de decisiones y catálogo de prompts.
- **Diseño funcional del motor y del primer laboratorio**, organizado por temas en [`motor/`](motor/README.md) (34 capítulos). Es **especificación**: está *definida*, no implementada.
- **Copia original congelada** del funcional unificado y **exportado completo vigente** generado: ver [`historico/`](historico/README.md) y [`exportados/`](exportados/README.md).
- **Utilidades documentales** en `scripts/docs/` (Python 3, librería estándar).

## MOTOR-03 (ejecutado, pendiente de Dennis)

- **Existe**: pestaña «Panel de ajustes» (diccionario, tabla maestra, mesa por preguntas, vistas, catálogo 81 + 4, perfiles con herencia, validación, publicación/activación, comparador y intercambio JSON), perfil base protegido V0 y persistencia local. 53 pruebas. Ver [`tecnico/motor03.md`](tecnico/motor03.md) y [recorrido manual](prompts/MOTOR-03-recorrido-manual.md).
- **Provisional**: todo sigue SEM; las 384 filas no tienen referencia ni evaluación; 22 filas están declaradas sin mecanismo (solo lectura); la asignación a los 81 grupos es propuesta de Claude.
- **Comprobado por Claude**: pruebas automáticas, equivalencia con el partido de referencia anterior (semilla 20261016, 94–89) y recorrido completo en Chromium. **Pendiente de Dennis**: todo el recorrido manual. **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-04 no iniciado). Continuidad obligatoria: cada entrega posterior añade al mismo diccionario sus filas, validaciones, consumidores y cobertura.

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
