# Plantilla de prompt para Claude Code

_Esto es una plantilla, no un encargo. Copia este archivo a `docs/prompts/<ID>-<asunto>.md` y rellénalo. No pegues aquí las normas N01–N12 ni el funcional: remite a ellas. El prompt se entrega siempre como archivo `.md` íntegro (norma N11)._

Normas comunes: [`AGENTS.md`](../../AGENTS.md) · índice: [`docs/README.md`](../README.md)

---

# <ID> — <título>

## 1. Identificador, objetivo y resultado visible esperado

- **ID:** 
- **Objetivo (comprobable, con cierre):** 
- **Resultado visible esperado:** 

## 2. Archivos obligatorios y dependencias de entrada

- Lecturas obligatorias (rutas concretas de temas y dependencias; no «todo el repositorio»):
- Entradas adjuntas:
- Prompt/ejecución anterior relacionada y revisión de partida:

## 3. Decisiones aprobadas aplicables y cuestiones pendientes conocidas

- Aprobadas (enlazar a la sección vigente, sin copiarla):
- Pendientes (si falta una decisión de producto, Claude comunica `DECISIÓN REQUERIDA` y sigue con lo independiente):

## 4. Alcance, exclusiones y tareas ordenadas

- **Alcance:** 
- **Exclusiones:** 
- **Tareas (en orden):** 
  1. 

## 5. Criterios de aceptación concretos

- [ ] 

## 6. Comprobaciones automáticas mínimas necesarias

| Comprobación | Propósito (qué riesgo cubre) |
|---|---|
| | |

No se piden baterías completas ni lotes masivos salvo una auditoría concreta (N12).

## 7. Pruebas manuales para Dennis

| Paso | Resultado esperado |
|---|---|
| | |

## 8. Documentación y registros que cambiarán

- Documentos temáticos afectados:
- `docs/estado.md`, `CHANGELOG.md`, `docs/decisiones/README.md`, `docs/prompts/README.md`:

## 9. Formato de entrega

- Prompt entregado como archivo `.md` (N11).
- Rama/PR cuando corresponda; Claude no fusiona (N02).
- Resultado real, distinguiendo «comprobado por Claude», «pendiente de Dennis» y «no ejecutado por una limitación»; pendientes e incidencias.
