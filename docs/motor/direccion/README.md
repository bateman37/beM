# Tema: direccion

> [Índice del motor](../README.md) · [Índice general](../../README.md) · [Cómo leer y estados](../uso-y-estados.md)

**Qué regula:** Órdenes, delegación y dirección en vivo; entrenador, rotación, faltas, pausas y finales; memoria defensiva y adaptación.

**Aviso:** este tema recoge diseño funcional. «Definido» no equivale a implementado, validado ni calibrado; los estados DEC/FUN/SEM/CARGA/EVAL conservan su significado (ver [uso y estados](../uso-y-estados.md)).

## Contenido

### Capítulo 15 — Órdenes, delegación y dirección en vivo

| Archivo | Palabras | Apartados |
|---|---|---|
| [c15-ordenes-delegacion-y-direccion-en-vivo.md](c15-ordenes-delegacion-y-direccion-en-vivo.md) | 2855 | 15.1. Identidad y ciclo de vida de las órdenes; 15.2. Tabla de aplicación por tipo de orden; 15.3. Precedencia y conflictos; 15.4. Dirección desde la interfaz y relato; 15.5. Ejemplos integrados; 15.6. Dirección durante el partido; 15.7. Entrenador: ENT01–ENT07 |

### Capítulo 16 — Entrenador: rotación, faltas, pausas y finales

| Archivo | Palabras | Apartados |
|---|---|---|
| [c16-p01-rotaciones-funciones-y-gestion-de-faltas.md](c16-p01-rotaciones-funciones-y-gestion-de-faltas.md) | 2790 | 16.1. Rotaciones, funciones y gestión de faltas; 16.2. Tiempos muertos, ajustes y finales; 16.3. Ejemplos funcionales integrados; 16.4. Entrenador: ENT01–ENT07 |
| [c16-p02-tres-politicas-iniciales-de-entrenador.md](c16-p02-tres-politicas-iniciales-de-entrenador.md) | 618 | 16.5. Tres políticas iniciales de entrenador; 16.6. Ejemplos integrados |

### Capítulo 17 — Memoria defensiva y adaptación

| Archivo | Palabras | Apartados |
|---|---|---|
| [c17-memoria-defensiva-y-adaptacion.md](c17-memoria-defensiva-y-adaptacion.md) | 917 | 17.1. Memoria colectiva y adaptación; 17.2. Ejemplos funcionales integrados; 17.3. Memoria: MEM01–MEM04 |

## Dependencias directas

Relaciones funcionales principales con otros temas. Consulta solo las que afecten a la tarea; si aparece otra durante el trabajo, amplía la lectura de forma dirigida.

- [Cap. 13 — Tiempo, esfuerzo y energía](../simulacion/c13-tiempo-esfuerzo-y-energia.md) (tema `simulacion`): energía y esfuerzo que informan la rotación
- [Cap. 14 — Forma, momento, consistencia y presión](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md) (tema `jugadores`): estados del jugador
- [Cap. 18 — Reglamento y administración deportiva](../reglamento/c18-reglamento-y-administracion-deportiva.md) (tema `reglamento`): obligaciones reglamentarias que priorizan sobre órdenes y planes
- [Cap. 7 — Táctica ofensiva: estilos, disposiciones, libro y roles](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md) (tema `tacticas`): táctica ofensiva sobre la que se ordena y adapta
- [Cap. 8 — Táctica defensiva: organización, estilos y responsabilidades](../tacticas/c08-p01-estilos-defensivos-cinco-dimensiones-y-cinco-niveles.md) (tema `tacticas`): táctica defensiva y memoria de la que se adapta
