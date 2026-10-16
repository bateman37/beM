# Documentación de beM

Punto de entrada. Lectura habitual: **normas comunes → este índice → índice del tema → dependencias pertinentes**.

## Mapa general

| Qué busco | Dónde |
|---|---|
| Normas, responsabilidades y límite de decisiones | [`AGENTS.md`](../AGENTS.md) · instrucciones para Claude: [`CLAUDE.md`](../CLAUDE.md) |
| Qué existe, qué se ha comprobado, qué sigue | [`estado.md`](estado.md) |
| Diseño funcional del motor (por temas) | [`motor/README.md`](motor/README.md) |
| Funcional completo vigente (generado) | [`exportados/beM-MOTOR-COMPLETO-VIGENTE.md`](exportados/beM-MOTOR-COMPLETO-VIGENTE.md) · cómo se genera: [`exportados/README.md`](exportados/README.md) |
| Decisiones de proceso y organización | [`decisiones/README.md`](decisiones/README.md) |
| Documentación técnica de lo implementado | [`tecnico/README.md`](tecnico/README.md) |
| Prompts, ejecuciones y plantilla | [`prompts/README.md`](prompts/README.md) |
| Originales y versiones conservadas | [`historico/README.md`](historico/README.md) |
| Historial de entregas | [`../CHANGELOG.md`](../CHANGELOG.md) |

## Tarea → lecturas de entrada

| Tarea | Entradas mínimas |
|---|---|
| Empezar una entrega nueva | [`AGENTS.md`](../AGENTS.md) → [`estado.md`](estado.md) → índice del tema afectado. |
| Retomar una implementación | [`estado.md`](estado.md) → ficha del prompt anterior en [`prompts/README.md`](prompts/README.md) → documentos de los temas afectados. |
| Consultar o cambiar una regla del motor | [`motor/README.md`](motor/README.md) (mapa por materias y por tareas) → archivo del tema → dependencias. |
| Preparar un prompt para Claude Code | [`prompts/plantilla-prompt.md`](prompts/plantilla-prompt.md) (entrega en `.md`, norma N11). |
| Registrar una decisión aceptada | Actualizar el documento temático y anotar el registro en [`decisiones/README.md`](decisiones/README.md). |
| Cambiar una sección del motor | Editar la sección → `python3 scripts/docs/build_engine_docs.py` → `python3 scripts/docs/check_engine_docs.py`. |
| Preparar o analizar tandas de partidos | Tema [laboratorio](motor/laboratorio/README.md) y la ruta de [`motor/README.md`](motor/README.md#mapa-por-tareas). |
| Averiguar de dónde viene un epígrafe del funcional | [`motor/trazabilidad/README.md`](motor/trazabilidad/README.md) y [`motor/COBERTURA.md`](motor/COBERTURA.md). |

## Autoridad documental

1. Las **instrucciones expresas vigentes de Dennis** y los **cambios funcionales aceptados** tienen prioridad. Al registrar un cambio aceptado se actualiza el documento temático correspondiente.
2. Dentro del diseño de las ocho entregas, prevalece la última decisión aceptada que modifica un punto. El unificado ya recoge esa consolidación; no se reinterpreta.
3. Verificada la migración, los **documentos temáticos de `docs/motor/`** son la referencia vigente de trabajo por materia. La definición detallada vive en un único lugar; el resto enlaza.
4. La copia íntegra recibida ([`historico/motor/unificado-original.md`](historico/motor/unificado-original.md)) es una **referencia congelada**; nunca se sobrescribe con una versión generada.
5. La **versión completa vigente** ([`exportados/`](exportados/beM-MOTOR-COMPLETO-VIGENTE.md)) es un exportado **generado** desde las secciones. No se mantiene a mano como segunda especificación.
6. Los ocho originales (si existen) y los documentos antiguos son **históricos**: una formulación sustituida no vuelve a ser alternativa vigente.
7. Los **prompts** conservan el encargo y su historia; un prompt o una respuesta de implementación no alteran por sí solos el funcional: las decisiones nuevas aceptadas se incorporan a la sección vigente.
8. La fecha de modificación de un archivo no determina por sí sola la prioridad de una regla.

### Separación de propósitos

| Propósito | Dónde vive |
|---|---|
| Diseño funcional (lo que queremos que haga el producto) | [`motor/`](motor/README.md) |
| Documentación técnica (cómo se ha implementado realmente) | [`tecnico/`](tecnico/README.md) |
| Estado de entrega (qué existe, qué se ha comprobado, qué falta) | [`estado.md`](estado.md) |
| Histórico y evidencia (antecedentes, ejecuciones, decisiones anteriores) | [`historico/`](historico/README.md), [`prompts/`](prompts/README.md), [`decisiones/`](decisiones/README.md) |

### Estados del funcional

DEC (decisión cerrada), FUN (contenido funcional definido), SEM (semilla provisional), CARGA (por completar), EVAL (evidencia de evaluación) e Ilustración **no son equivalentes** y pueden concurrir. Definición en [`motor/uso-y-estados.md`](motor/uso-y-estados.md). «Definido», «implementado», «validado» y «calibrado» son estados distintos.
