# Tema: configuracion

> [Índice del motor](../README.md) · [Índice general](../../README.md) · [Cómo leer y estados](../uso-y-estados.md)

**Qué regula:** Panel, parámetros, perfiles y versiones; inventario de tablas y contratos de datos; perfil inicial y semillas numéricas.

**Aviso:** este tema recoge diseño funcional. «Definido» no equivale a implementado, validado ni calibrado; los estados DEC/FUN/SEM/CARGA/EVAL conservan su significado (ver [uso y estados](../uso-y-estados.md)).

## Contenido

### Capítulo 26 — Panel, parámetros, perfiles y versiones

| Archivo | Palabras | Apartados |
|---|---|---|
| [c26-p01-panel-de-administracion-finalidad-y-organizacion.md](c26-p01-panel-de-administracion-finalidad-y-organizacion.md) | 2408 | 26.1. Panel de administración: finalidad y organización; 26.2. Diccionario y edición de parámetros |
| [c26-p02-perfiles-versiones-y-ciclo-de-mejora.md](c26-p02-perfiles-versiones-y-ciclo-de-mejora.md) | 2605 | 26.3. Perfiles, versiones y ciclo de mejora; 26.4. Ejemplos funcionales integrados; 26.5. Ampliación del panel administrable; 26.6. Soportes y funcionamiento del panel; 26.7. Diccionario y ejemplos de lectura; 26.8. Configuración, exportación y correcciones |

### Capítulo 27 — Inventario de tablas y contratos de datos

| Archivo | Palabras | Apartados |
|---|---|---|
| [c27-p01-organizacion-de-los-datos.md](c27-p01-organizacion-de-los-datos.md) | 2975 | 27.1. Organización de los datos; 27.2. Contrato de una fila completa; 27.3. Selección: SEL01–SEL12; 27.4. Defensa: DEF01–DEF09; 27.5. Resolución: RES01–RES13; 27.6. Cuerpo: COR01–COR02; 27.7. Tiempo y estados: ACT01–ACT12; 27.8. Entrenador: ENT01–ENT07; …(2 más) |
| [c27-p02-estadistica-y-resumen-est01est08.md](c27-p02-estadistica-y-resumen-est01est08.md) | 869 | 27.11. Estadística y resumen: EST01–EST08; 27.12. Reglamento: REG01–REG04; 27.13. Soportes y funcionamiento del panel; 27.14. Clasificación de los elementos T06; 27.15. Diccionario y ejemplos de lectura |
| [c27-p03-diccionario-de-tablas-y-parametros.md](c27-p03-diccionario-de-tablas-y-parametros.md) | 2726 | 27.16. Diccionario de tablas y parámetros; 27.17. Catálogo administrable del motor |

### Capítulo 29 — Perfil inicial y semillas numéricas

| Archivo | Palabras | Apartados |
|---|---|---|
| [c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md](c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) | 2998 | 29.1. Perfil inicial, semillas y trabajo numérico; 29.2. Valores y fórmulas iniciales provisionales |
| [c29-p02-duracion-carga-y-fatiga.md](c29-p02-duracion-carga-y-fatiga.md) | 2881 | 29.3. Filas de ejemplo para el panel |

## Dependencias directas

Relaciones funcionales principales con otros temas. Consulta solo las que afecten a la tarea; si aparece otra durante el trabajo, amplía la lectura de forma dirigida.

- [Cap. 28 — Auditorías y criterios de aceptación](../validacion/c28-p01-poblacion-modalidades-y-conservacion.md) (tema `validacion`): auditorías que ejercitan los parámetros
- [Cap. 24 — Modalidades y primer laboratorio](../laboratorio/c24-modalidades-y-primer-laboratorio.md) (tema `laboratorio`): laboratorio que usa perfiles y versiones
- [Cap. 12 — Selección, oportunidad, ejecución y desenlace](../simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md) (tema `simulacion`): tablas funcionales de selección y resolución
- [Cap. 13 — Tiempo, esfuerzo y energía](../simulacion/c13-tiempo-esfuerzo-y-energia.md) (tema `simulacion`): tabla de tiempo, esfuerzo y estados
