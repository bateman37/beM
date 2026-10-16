# Tema: simulacion

> [Índice del motor](../README.md) · [Índice general](../../README.md) · [Cómo leer y estados](../uso-y-estados.md)

**Qué regula:** Flujo de partido, posesiones y contexto pequeño; selección, oportunidad, ejecución y desenlace; tiempo, esfuerzo y energía.

**Aviso:** este tema recoge diseño funcional. «Definido» no equivale a implementado, validado ni calibrado; los estados DEC/FUN/SEM/CARGA/EVAL conservan su significado (ver [uso y estados](../uso-y-estados.md)).

## Contenido

### Capítulo 11 — Flujo de partido, posesiones y contexto pequeño

| Archivo | Palabras | Apartados |
|---|---|---|
| [c11-flujo-de-partido-posesiones-y-contexto-pequeno.md](c11-flujo-de-partido-posesiones-y-contexto-pequeno.md) | 1915 | 11.1. Contrato de sencillez y contexto pequeño; 11.2. Resolución por acontecimientos: decisión confirmada; 11.3. Unidad deportiva, continuidad y contexto; 11.4. Tres tablas configurables |

### Capítulo 12 — Selección, oportunidad, ejecución y desenlace

| Archivo | Palabras | Apartados |
|---|---|---|
| [c12-p01-seleccion-oportunidades-y-desenlaces.md](c12-p01-seleccion-oportunidades-y-desenlaces.md) | 2839 | 12.1. Selección, oportunidades y desenlaces; 12.2. Ejemplos funcionales integrados; 12.3. Catálogo de finalizaciones y técnica principal; 12.4. Ejemplos integrados |
| [c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md](c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md) | 2642 | 12.5. Tabla 1: selección de intenciones y participantes; 12.6. Tabla 2: oportunidades y desenlaces; 12.7. Mapa de impacto en el motor; 12.8. Fórmulas: orientación elegida y límites pendientes |

### Capítulo 13 — Tiempo, esfuerzo y energía

| Archivo | Palabras | Apartados |
|---|---|---|
| [c13-tiempo-esfuerzo-y-energia.md](c13-tiempo-esfuerzo-y-energia.md) | 1973 | 13.1. Tiempo y estados: ACT01–ACT12; 13.2. Energía: reserva, curva y efectos; 13.3. Tabla 3: tiempo, esfuerzo y estados; 13.4. Energía, forma, momento y las 32 capacidades |

## Dependencias directas

Relaciones funcionales principales con otros temas. Consulta solo las que afecten a la tarea; si aparece otra durante el trabajo, amplía la lectura de forma dirigida.

- [Cap. 3 — Catálogo de 32 capacidades y escala](../jugadores/c03-p01-escala-visible-130.md) (tema `jugadores`): capacidades que alimentan la resolución
- [Cap. 14 — Forma, momento, consistencia y presión](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md) (tema `jugadores`): forma, momento, consistencia y presión que modulan la ejecución
- [Cap. 9 — Repertorio declarativo: tareas, continuaciones y fichas](../tacticas/c09-p01-repertorio-declarativo-y-decisiones-sin-jugada.md) (tema `tacticas`): tareas compartidas y fichas que se activan por pertinencia
- [Cap. 19 — Registro, conservación y reproducción](../estadisticas/c19-registro-conservacion-y-reproduccion.md) (tema `estadisticas`): registro de acontecimientos que produce la simulación
- [Cap. 29 — Perfil inicial y semillas numéricas](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) (tema `configuracion`): duración, carga y fatiga como semillas
