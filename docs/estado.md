# Estado del proyecto

Fotografía breve y actual (no es un changelog; ver [`../CHANGELOG.md`](../CHANGELOG.md)). Última actualización: 2026-10-16, entrega MOTOR-01.

## Qué hay realmente en el repositorio

- **Documentación y normas**: [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), índices, registro de decisiones y catálogo de prompts.
- **Diseño funcional del motor y del primer laboratorio**, organizado por temas en [`motor/`](motor/README.md) (34 capítulos). Es **especificación**: está *definida*, no implementada.
- **Copia original congelada** del funcional unificado y **exportado completo vigente** generado: ver [`historico/`](historico/README.md) y [`exportados/`](exportados/README.md).
- **Utilidades documentales** en `scripts/docs/` (Python 3, librería estándar).

## MOTOR-01 (ejecutado, pendiente de Dennis)

- **Existe**: motor de partidos por acontecimientos (`src/match/`), laboratorio web local (`npm run dev`, <http://localhost:5173/>) con plantillas editables de EQ01/EQ02, +1/+3/+5, preparación, simulación completa, acta, relato, detalle y descarga JSON; 23 pruebas automáticas. Ver [`tecnico/motor01.md`](tecnico/motor01.md).
- **Provisional**: perfil y fichas son SEM, no calibrados; no cierran los 81 grupos finales. Interpretaciones reglamentarias T01–T04 sin contrastar con el PDF FIBA (no accesible).
- **Comprobado por Claude**: pruebas automáticas y recorrido en Chromium. **Pendiente de Dennis**: [recorrido manual](prompts/MOTOR-01-recorrido-manual.md). **No ejecutado**: Node 24, otros navegadores.
- Siguiente: lo que ordene Dennis (MOTOR-02 no iniciado).

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
