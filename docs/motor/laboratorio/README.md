# Tema: laboratorio

> [Índice del motor](../README.md) · [Índice general](../../README.md) · [Cómo leer y estados](../uso-y-estados.md)

**Qué regula:** Modalidades y primer laboratorio: edición de jugadores, controles masivos, modos, lotes, extracción y logs.

**Aviso:** este tema recoge diseño funcional. «Definido» no equivale a implementado, validado ni calibrado; los estados DEC/FUN/SEM/CARGA/EVAL conservan su significado (ver [uso y estados](../uso-y-estados.md)).

## Contenido

### Capítulo 24 — Modalidades y primer laboratorio

| Archivo | Palabras | Apartados |
|---|---|---|
| [c24-modalidades-y-primer-laboratorio.md](c24-modalidades-y-primer-laboratorio.md) | 2985 | 24.1. Requisitos solicitados del primer laboratorio; 24.2. Plantillas y fichas iniciales; 24.3. Edición masiva; 24.4. Preparación y tres modalidades; 24.5. Simulación masiva; 24.6. Resultados y comparación; 24.7. Exportación completa del lote para análisis; 24.8. Recorrido funcional y relación con el panel; …(5 más) |

## Estado de implementación

La simulación masiva (§24.5), los resultados y la comparación (§24.6) y la exportación completa del lote (§24.7) están **implementadas en MOTOR-12** (pestaña *Lotes*, paquete `beM-analysis-package/1`, comprobador `npm run batch:check`): ver [`../../tecnico/motor12.md`](../../tecnico/motor12.md). «Implementado» no significa validado por Dennis ni calibrado; las auditorías de comportamiento, sensibilidad y calibración (MOTOR-13) y el rendimiento (MOTOR-14) siguen pendientes.

## Dependencias directas

Relaciones funcionales principales con otros temas. Consulta solo las que afecten a la tarea; si aparece otra durante el trabajo, amplía la lectura de forma dirigida.

- [Cap. 19 — Registro, conservación y reproducción](../estadisticas/c19-registro-conservacion-y-reproduccion.md) (tema `estadisticas`): registro y reproducción de lo extraído
- [Cap. 23 — Visibilidad e información disponible](../estadisticas/c23-visibilidad-e-informacion-disponible.md) (tema `estadisticas`): visibilidad: qué se muestra y qué se exporta
- [Cap. 25 — Población de referencia y generación](../validacion/c25-p01-contenido-y-poblacion-con-y-pob.md) (tema `validacion`): población de referencia y generación de equipos
- [Cap. 26 — Panel, parámetros, perfiles y versiones](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md) (tema `configuracion`): panel, perfiles y versiones de configuración
- [Cap. 29 — Perfil inicial y semillas numéricas](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) (tema `configuracion`): perfil inicial y semillas usados al preparar partidos
