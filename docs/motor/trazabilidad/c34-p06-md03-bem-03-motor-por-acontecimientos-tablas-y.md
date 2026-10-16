<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: trazabilidad](README.md) · Capítulo 34 — Trazabilidad y decisiones reconciliadas · parte 6 de 15
> Anterior: [c34-p05-md02-bem-02-motor-atributos-y-estados-decisiones-md](c34-p05-md02-bem-02-motor-atributos-y-estados-decisiones-md.md) · Siguiente: [c34-p07-md04-bem-04-estadisticas-y-resumen-funcional-completo-md](c34-p07-md04-bem-04-estadisticas-y-resumen-funcional-completo-md.md)
<!-- beM:nav-fin -->

#### MD03 — beM-03-MOTOR-POR-ACONTECIMIENTOS-TABLAS-Y-COBERTURA.md

| Epígrafe original | Tratamiento | Destino interno |
|---|---|---|
| beM — Documento 03: motor por acontecimientos, tablas configurables y cobertura del partido | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0001](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md#cap-01) |
| Índice | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0015](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md#cap-01) |
| 1. Relación con los documentos anteriores | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0043](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md#cap-01) |
| 1.1 Precedencia de esta aclaración | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0058](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md#cap-01) |
| 1.2 Qué queda consolidado y qué sigue siendo provisional | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0064](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md#cap-01) |
| 2. Resolución por acontecimientos: decisión confirmada | Desarrollo integrado | [MD03-L0076](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0076) |
| 2.1 Qué calcula un paso | Desarrollo integrado | [MD03-L0082](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0082) |
| 2.2 Qué se representa de forma resumida | Desarrollo integrado | [MD03-L0095](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0095) |
| 2.3 Funciones lógicas y pasos de simulación | Desarrollo integrado | [MD03-L0103](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0103) |
| 3. Unidad deportiva, continuidad y contexto | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0116](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#cap-11) |
| 3.1 Posesión y resolución | Integrado con sustituciones expresas aplicadas | [MD03-L0118](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0118) |
| 3.2 Orígenes distintos del ataque | Desarrollo integrado | [MD03-L0126](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0126) |
| 3.3 Contexto mínimo funcional | Integrado con sustituciones expresas aplicadas | [MD03-L0140](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0140) |
| 3.4 Flujo de resolución | Desarrollo integrado | [MD03-L0160](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0160) |
| 4. Tres tablas configurables | Desarrollo integrado | [MD03-L0182](../simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md#src-md03-l0182) |
| 5. Tabla 1: selección de intenciones y participantes | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0194](../simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md#cap-12) |
| 5.1 Cobertura funcional | Desarrollo integrado | [MD03-L0196](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0196) |
| 5.2 Libro y prioridades | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0217](../simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md#src-md05-l0241) |
| 5.3 Libertad, iniciativa y lectura | Desarrollo integrado | [MD03-L0225](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0225) |
| 5.4 Participantes y candidatos conjuntos | Desarrollo integrado | [MD03-L0235](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0235) |
| 5.5 Decisiones con reloj | Desarrollo integrado | [MD03-L0241](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0241) |
| 6. Ataque: disposiciones, familias y alternativas | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0247](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md#cap-07) |
| 6.1 Estilos vigentes | Desarrollo integrado | [MD03-L0249](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0249) |
| 6.2 Disposiciones | Desarrollo integrado | [MD03-L0255](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0255) |
| 6.3 Amenaza de los cinco atacantes | Desarrollo integrado | [MD03-L0268](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0268) |
| 6.4 Familias y variantes | Desarrollo integrado | [MD03-L0276](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0276) |
| 6.5 Continuaciones comunes | Desarrollo integrado | [MD03-L0289](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0289) |
| 7. Defensa: organización y respuestas | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0295](../tacticas/c08-p01-estilos-defensivos-cinco-dimensiones-y-cinco-niveles.md#cap-08) |
| 7.1 Estilos vigentes | Desarrollo integrado | [MD03-L0297](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md03-l0297) |
| 7.2 Organizaciones | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0303](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md06-l0257) |
| 7.3 Coberturas | Desarrollo integrado | [MD03-L0318](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md03-l0318) |
| 7.4 Ayudas y presupuesto de responsabilidades | Desarrollo integrado | [MD03-L0329](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md03-l0329) |
| 7.5 Presión | Desarrollo integrado | [MD03-L0337](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md03-l0337) |
| 7.6 Aportación defensiva sin robo ni tapón | Desarrollo integrado | [MD03-L0343](../tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md#src-md03-l0343) |
| 8. Tabla 2: oportunidades y desenlaces | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0349](../simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md#cap-12) |
| 8.1 Mecanismos compartidos | Desarrollo integrado | [MD03-L0351](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0351) |
| 8.2 Autor de cada capacidad | Desarrollo integrado | [MD03-L0375](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0375) |
| 8.3 Recepción y balón dividido | Desarrollo integrado | [MD03-L0381](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0381) |
| 8.4 Salidas necesarias de una resolución | Integrado con sustituciones expresas aplicadas | [MD03-L0387](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0387) |
| 8.5 Probabilidades y exposición | Integrado con sustituciones expresas aplicadas | [MD03-L0401](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0401) |
| 8.6 Concentración y coordinación | Desarrollo integrado | [MD03-L0409](../simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md#src-md03-l0409) |
| 9. Finalizaciones y fronteras entre capacidades | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0415](../simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md#src-md06-l0691) |
| 10. Tabla 3: tiempo, esfuerzo y estados | Desarrollo integrado | [MD03-L0436](../simulacion/c13-tiempo-esfuerzo-y-energia.md#src-md03-l0436) |
| 10.1 Momento real del acontecimiento | Desarrollo integrado | [MD03-L0461](../simulacion/c13-tiempo-esfuerzo-y-energia.md#src-md03-l0461) |
| 10.2 Rebote y continuidad | Desarrollo integrado | [MD03-L0467](../simulacion/c13-tiempo-esfuerzo-y-energia.md#src-md03-l0467) |
| 10.3 Reorganización y cambios | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0473](../direccion/c15-ordenes-delegacion-y-direccion-en-vivo.md#src-md06-l0569) |
| 11. Mapa completo de las 32 capacidades | Desarrollo integrado | [MD03-L0479](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0479) |
| 11.1 Técnicas | Desarrollo integrado | [MD03-L0485](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0485) |
| 11.2 Físicas | Desarrollo integrado | [MD03-L0508](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0508) |
| 11.3 Mentales | Desarrollo integrado | [MD03-L0524](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0524) |
| 11.4 Uso mental de todos los jugadores | Desarrollo integrado | [MD03-L0536](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0536) |
| 11.5 Auditoría de cobertura | Desarrollo integrado | [MD03-L0550](../jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md#src-md03-l0550) |
| 12. Energía, forma, momento, consistencia y presión | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0556](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#cap-14) |
| 12.1 Energía y Resistencia | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0558](../simulacion/c13-tiempo-esfuerzo-y-energia.md#cap-13) |
| 12.2 Forma | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0568](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#src-md05-l0566) |
| 12.3 Consistencia fuera del tiro | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0578](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#cap-14) |
| 12.4 Momento por ámbitos: propuesta pendiente | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0586](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#cap-14) |
| 12.5 Presión | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0602](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#src-md05-l0608) |
| 12.6 Aplicación única de causas | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0608](../jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md#cap-14) |
| 13. Roles, dirección, experiencia y veteranos | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0620](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md#src-md01-l0255) |
| 13.1 Roles | Desarrollo integrado | [MD03-L0622](../tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md#src-md03-l0622) |
| 13.2 Director | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0641](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md#cap-07) |
| 13.3 Experiencia y envejecimiento | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0647](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md#cap-07) |
| 13.4 Veterano útil con límites | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0653](../tacticas/c07-p01-estructura-de-la-configuracion-tactica.md#cap-07) |
| 14. Repetición y adaptación | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0661](../direccion/c17-memoria-defensiva-y-adaptacion.md#cap-17) |
| 15. Saques y finales | Integrado con sustituciones expresas aplicadas | [MD03-L0681](../tacticas/c10-banda-fondo-y-situaciones-especiales.md#src-md03-l0681) |
| 16. Reglas y acontecimientos menos frecuentes | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0707](../reglamento/c18-reglamento-y-administracion-deportiva.md#cap-18) |
| 16.1 Cobertura reglamentaria | Integrado con sustituciones expresas aplicadas | [MD03-L0709](../reglamento/c18-reglamento-y-administracion-deportiva.md#src-md03-l0709) |
| 16.2 Capacidad, acontecimiento y consecuencia | Desarrollo integrado | [MD03-L0730](../reglamento/c18-reglamento-y-administracion-deportiva.md#src-md03-l0730) |
| 16.3 Disponibilidad y salud | Desarrollo integrado | [MD03-L0738](../reglamento/c18-reglamento-y-administracion-deportiva.md#src-md03-l0738) |
| 16.4 Límites de la cobertura | Desarrollo integrado | [MD03-L0742](../reglamento/c18-reglamento-y-administracion-deportiva.md#src-md03-l0742) |
| 17. Configuración y versiones | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0748](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md#cap-26) |
| 17.1 Dos niveles de uso | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0750](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md#cap-26) |
| 17.2 Ficha de parámetro | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0764](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md#cap-26) |
| 17.3 Versionado y reproducción | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0783](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md#cap-26) |
| 17.4 Perfil por competición | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0791](../configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md#cap-26) |
| 18. Modalidades, presentación y rendimiento | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0797](../laboratorio/c24-modalidades-y-primer-laboratorio.md#cap-24) |
| 18.1 Núcleo común | Desarrollo integrado | [MD03-L0799](../laboratorio/c24-modalidades-y-primer-laboratorio.md#src-md03-l0799) |
| 18.2 Presentación | Desarrollo integrado | [MD03-L0813](../laboratorio/c24-modalidades-y-primer-laboratorio.md#src-md03-l0813) |
| 18.3 Rendimiento | Desarrollo integrado | [MD03-L0819](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0819) |
| 19. Estadísticas finales: siguiente bloque pendiente | Sustituido o integrado en desarrollo vigente identificado | [MD03-L0827](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20) |
| 19.1 Conexión necesaria desde ahora | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0839](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20) |
| 19.2 Preguntas para la siguiente definición | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0853](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20) |
| 19.3 Criterios que debe respetar la futura atribución | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0865](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20) |
| 19.4 Datos explicativos candidatos | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0871](../estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md#cap-20) |
| 20. Comprobación sobre partidos completos | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0877](../validacion/c28-p01-poblacion-modalidades-y-conservacion.md#cap-28) |
| 20.1 Unidad de revisión | Desarrollo integrado | [MD03-L0879](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0879) |
| 20.2 Efecto de capacidades | Desarrollo integrado | [MD03-L0885](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0885) |
| 20.3 Efecto táctico | Desarrollo integrado | [MD03-L0902](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0902) |
| 20.4 Magnitudes deportivas y límites | Desarrollo integrado | [MD03-L0908](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0908) |
| 20.5 Pruebas proporcionadas | Integrado con sustituciones expresas aplicadas | [MD03-L0914](../validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md#src-md03-l0914) |
| 21. Decisiones consolidadas | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0920](c34-p01-corpus-de-origen.md#cap-34) |
| 22. Pendientes y orden de cierre | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0955](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md#cap-30) |
| 22.1 Pendientes del motor y del primer laboratorio | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0957](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md#cap-30) |
| 22.2 Orden práctico | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0976](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md#cap-30) |
| 22.3 Sistemas posteriores que no bloquean el primer partido | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L0986](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md#cap-30) |
| 23. Implementación y responsabilidades | Integrado con sustituciones expresas aplicadas | [MD03-L0992](../alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md#src-md03-l0992) |
| Anexo A. Valores y fórmulas iniciales provisionales | Desarrollo integrado | [MD03-L1004](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1004) |
| A.1 Convenciones matemáticas | Integrado con sustituciones expresas aplicadas | [MD03-L1010](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1010) |
| A.2 Prioridades, libertad y elección | Integrado con sustituciones expresas aplicadas | [MD03-L1035](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1035) |
| A.3 Preferencias ofensivas y reparto inicial de salidas | Desarrollo integrado | [MD03-L1073](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1073) |
| A.4 Defensa y memoria: primeras referencias | Integrado con sustituciones expresas aplicadas | [MD03-L1103](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1103) |
| A.5 Mezclas iniciales para crear oportunidades | Integrado con sustituciones expresas aplicadas | [MD03-L1125](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1125) |
| A.6 Sucesos principales y control | Desarrollo integrado | [MD03-L1156](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1156) |
| A.7 Tiros, preparación y tapones | Integrado con sustituciones expresas aplicadas | [MD03-L1188](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1188) |
| A.8 Rebote | Integrado con sustituciones expresas aplicadas | [MD03-L1221](../configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md#src-md03-l1221) |
| A.9 Duración, carga y fatiga | Integrado con sustituciones expresas aplicadas | [MD03-L1240](../configuracion/c29-p02-duracion-carga-y-fatiga.md#src-md03-l1240) |
| A.10 Forma, momento, consistencia y presión | Integrado con sustituciones expresas aplicadas | [MD03-L1279](../configuracion/c29-p02-duracion-carga-y-fatiga.md#src-md03-l1279) |
| A.11 Entrenador automático y revisión neutral | Integrado con sustituciones expresas aplicadas | [MD03-L1316](../configuracion/c29-p02-duracion-carga-y-fatiga.md#src-md03-l1316) |
| Anexo B. Fuentes, investigación y límites | Consolidado en regla vigente o metadatos/índice de origen | [MD03-L1337](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#cap-33) |
| B.1 Fuentes de decisiones | Desarrollo integrado | [MD03-L1339](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#src-md03-l1339) |
| B.2 Referencias primarias consultadas durante la definición | Desarrollo integrado | [MD03-L1349](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#src-md03-l1349) |
| B.3 Qué respalda la investigación | Desarrollo integrado | [MD03-L1364](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#src-md03-l1364) |
| B.4 Estado real de validación | Desarrollo integrado | [MD03-L1370](../referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md#src-md03-l1370) |

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c34-p05-md02-bem-02-motor-atributos-y-estados-decisiones-md](c34-p05-md02-bem-02-motor-atributos-y-estados-decisiones-md.md) · Siguiente: [c34-p07-md04-bem-04-estadisticas-y-resumen-funcional-completo-md](c34-p07-md04-bem-04-estadisticas-y-resumen-funcional-completo-md.md)
