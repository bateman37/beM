# Catálogo de prompts y ejecuciones

Directorio de los encargos a Claude Code. **El texto original de un prompt ejecutado no se edita**: los cambios de alcance, instrucciones adicionales o correcciones se guardan como continuaciones numeradas (`<ID>-C01-<asunto>.md`) enlazadas al encargo. Los metadatos que cambian (estado, rama, PR, resultado) viven en este índice o en fichas de ejecución, no dentro del prompt. Norma N10 (conservación) y N11 (entrega en `.md`) en [`../../AGENTS.md`](../../AGENTS.md).

- Convención de nombres: `<ID>-<asunto>.md` (se conservan los identificadores existentes; no se renumera la historia).
- Plantilla (no es un encargo): [`plantilla-prompt.md`](plantilla-prompt.md).
- Estados posibles: preparado · en ejecución · ejecutado pendiente de revisión · requiere corrección · validado por Dennis · cancelado/sustituido.
- Prompts de conversaciones antiguas (MD01–MD08 y similares): **texto no disponible**; solo se conocen por mención en el funcional y no se reconstruyen.

## Catálogo

| ID | Objetivo | Texto | Estado | Última ejecución | Continuaciones |
|---|---|---|---|---|---|
| DOC-001 | Organización documental de beM y normas de trabajo | [`DOC-001-organizacion-documental-y-normas.md`](DOC-001-organizacion-documental-y-normas.md) | Ejecutado, **pendiente de revisión de Dennis** | 2026-10-16 (intento 1) | — |

## Fichas de ejecución

### DOC-001

| Campo | Valor |
|---|---|
| Objetivo | Organizar la documentación por temas, conservar íntegro el funcional unificado, incorporar normas N01–N12, índices, plantilla y utilidades documentales. Sin implementar motor ni laboratorio. |
| Medio de entrada del texto | Archivo `.md` adjunto (`972a69f1-beM-PROMPT-DOC-001-ORGANIZACION-DOCUMENTAL-Y-NORMAS.md`; prefijo añadido por la subida). La copia archivada es byte a byte idéntica. |
| Entrada adicional | Funcional unificado (`eb261b7b-beM-DISENO-FUNCIONAL-UNIFICADO-MOTOR-DE-PARTIDOS.md`), SHA-256 `df05edda…1fdd`. Los ocho originales no se suministraron. |
| Fecha real de ejecución | 2026-10-16 · intento 1 |
| Revisión de partida | `053144e` («Initial commit», solo `README.md` de una línea). |
| Rama | `claude/busy-edison-b1fmnc` (rama designada por el entorno de ejecución; el prompt proponía `docs/DOC-001-organizacion-documental`). |
| PR | [bateman37/beM#1](https://github.com/bateman37/beM/pull/1) (abierta contra `main`, sin fusionar). |
| Commits | Los de la rama; el SHA final no puede constar dentro del propio commit. |
| Resultado breve | Funcional importado sin pérdidas y seccionado en 74 archivos por 12 temas; índices, normas, estado, decisiones, catálogo y plantilla creados; exportado generado y reproducible. |
| Comprobaciones realizadas | `check_engine_docs.py --importacion` y `build_engine_docs.py --check`; resultados en [`../motor/COBERTURA.md`](../motor/COBERTURA.md). No se ejecutaron simulaciones, pruebas del motor ni E2E (no existen; el cambio es documental). |
| Limitaciones | No se comprobó el renderizado en GitHub. Ocho originales ausentes. |
| Pendientes | Validación de Dennis y decisión de fusión. |

#### DOC-001: revisión manual para Dennis

Estado de cada paso: **pendiente de Dennis** (ninguno confirmado por Dennis).

| Paso | Resultado esperado | Dónde |
|---|---|---|
| Abrir el README del repositorio. | Se entiende qué hay ahora y dónde empezar a consultar. | [`../../README.md`](../../README.md) |
| Abrir las normas y buscar «prompts en Markdown» y «pruebas». | Figuran el archivo MD obligatorio (N11) y la política de automatización proporcionada con revisión manual de Dennis (N12). | [`../../AGENTS.md`](../../AGENTS.md) |
| Buscar energía, tácticas y estadísticas desde los índices. | Cada materia se localiza por rutas claras y muestra sus dependencias. | [`../motor/README.md`](../motor/README.md#mapa-por-tareas) |
| Abrir una tabla extensa o un anexo dividido. | Se consulta por partes, con títulos, orden y enlaces coherentes. | [Trazabilidad](../motor/trazabilidad/README.md) · [registro de decisiones, parte 1](../motor/trazabilidad/c34-p02-registro-de-decisiones-de-origen.md) |
| Abrir el funcional original y el completo vigente. | Se distinguen su propósito y su procedencia; ambos contienen el documento que corresponde. | [Original](../historico/motor/unificado-original.md) · [Vigente](../exportados/beM-MOTOR-COMPLETO-VIGENTE.md) |
| Consultar la cobertura de un capítulo. | Se ve dónde se conservó su contenido y qué verificación se realizó. | [`../motor/COBERTURA.md`](../motor/COBERTURA.md) |
| Abrir el catálogo de prompts y DOC-001. | Está el texto completo enviado, su estado real y la trazabilidad disponible. | Este archivo y [DOC-001](DOC-001-organizacion-documental-y-normas.md) |
| Abrir el estado del proyecto. | El diseño documentado no aparece confundido con implementación o calibración terminadas. | [`../estado.md`](../estado.md) |

Comprobación local de enlaces: hecha por Claude. Presentación en GitHub: no comprobada desde el entorno de ejecución.
