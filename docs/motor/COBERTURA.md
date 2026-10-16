# Cobertura de la importación del funcional

> [Índice del motor](README.md) · [Estado](../estado.md) · [Manifiesto](manifest.json) · [Original congelado](../historico/motor/unificado-original.md)

Informe de conservación de la importación de DOC-001 (2026-10-16). La correspondencia detallada (rangos de líneas, huella por bloque y mapa de 1157 anclajes) está en [`manifest.json`](manifest.json); los contenidos de cada archivo, en el `README.md` de su tema.

## Resultado

- **Origen:** `eb261b7b-beM-DISENO-FUNCIONAL-UNIFICADO-MOTOR-DE-PARTIDOS.md` · 1058586 bytes · 16289 líneas · SHA-256 `df05edda480c7da556ba6a24009bedcd0a7f96c25e54f57c983951e63fc01fdd` (idéntico al de la copia histórica).
- **Estructura:** 34 capítulos → 74 archivos temáticos en 12 carpetas, más [`presentacion.md`](presentacion.md) y [`uso-y-estados.md`](uso-y-estados.md). Ningún archivo supera las 3.000 palabras de referencia (ver abajo); no hubo excepciones de tamaño.
- **Conservación:** cada módulo reproduce literalmente sus líneas del original una vez retirada la navegación añadida y devueltos los enlaces a su forma original; toda línea no vacía del original está en un módulo o es navegación sustituida; los 1157 anclajes y las filas de tabla se conservan. Tablas, fórmulas, identificadores, estados y referencias se comparan **línea a línea**, no por recuentos.
- **Navegación sustituida (no es contenido omitido):** el «Índice general» y el «Índice detallado» del original (líneas 13–48 y 129–470); el exportado genera índices equivalentes y la copia histórica conserva los originales.
- **Tablas paginadas (≤100 filas de datos por página; la cabecera repetida es navegación añadida):** 10 páginas, todas del capítulo 34 ([registro de decisiones de origen](trazabilidad/README.md) y matriz de epígrafes): `p03`, `p04`, `p08`, `p09`, `p10`, `p11`, `p12`, `p13`, `p14`, `p15`.
- **No se alteró contenido:** ni redacción, ni estilo, ni contradicciones; no se corrigió ninguna referencia. Observaciones editoriales o funcionales: ninguna registrada. Las referencias externas (59 enlaces HTTP del funcional) **no** se comprobaron por red.

## Comprobaciones ejecutadas

Comandos reales, ejecutados desde la raíz del repositorio al generar este informe (la comparación con el original es del punto de importación; ver [exportados](../exportados/README.md)):

```
$ python3 scripts/docs/check_engine_docs.py --importacion   # código de salida 0
PASS  Manifiesto: todos los módulos existen y no hay módulos sin registrar
PASS  Manifiesto: el orden de composición cubre exactamente los bloques y los dos índices generados
PASS  Páginas: formato, bloques de código cerrados y tablas con cabecera tras la partición
PASS  Identificadores explícitos únicos (1157 anclajes)
PASS  El mapa de anclajes del manifiesto coincide con los módulos
PASS  Enlaces locales de todos los Markdown (6132 enlaces locales en 105 archivos)
PASS  Todo documento de docs/ es alcanzable desde README.md o docs/README.md
PASS  Exportado: coincide con lo generado desde las secciones
PASS  Exportado: 1804 enlaces internos resueltos
PASS  Exportado: sin identificadores duplicados
PASS  Exportado: sin marcas de navegación de las páginas
PASS  Original: SHA-256 y tamaño de la copia histórica coinciden con el manifiesto (df05edda480c7da5)
PASS  Importación: cada módulo reproduce literalmente sus líneas del original (76 bloques)
PASS  Importación: toda línea no vacía del original está en un módulo o es navegación sustituida
PASS  Importación: separaciones en blanco registradas igual que en el original
PASS  Importación: los 1157 anclajes del original están todos en los módulos
PASS  Importación: filas de tabla conservadas (5005 en el original, 5005 en los módulos)
PASS  Importación: los 34 capítulos tienen destino (74 archivos)

RESULTADO: todas las comprobaciones pasan.

$ python3 scripts/docs/build_engine_docs.py --check         # código de salida 0
OK: el exportado esta al dia (1059568 bytes).
```

Además: reconstrucción reproducible (dos generaciones seguidas sin cambios) y prueba del propio verificador con una copia mutada (un dígito alterado y una línea borrada en dos módulos fueron detectados como diferencias). Comprobación del renderizado en GitHub: **no realizada** desde el entorno de ejecución. Validación de Dennis: **pendiente**.

## Correspondencia por capítulo

| Cap. | Título | Tema | Líneas de origen | Palabras | Destino (archivos) |
|---|---|---|---|---|---|
| 1 | Identidad, alcance y decisiones de dirección | `alcance` | 474–585 | 822 | [c01-identidad-alcance-y-decisiones-de-direccion.md](alcance/c01-identidad-alcance-y-decisiones-de-direccion.md) |
| 2 | Datos de entrada, capas y participantes | `jugadores` | 587–659 | 563 | [c02-datos-de-entrada-capas-y-participantes.md](jugadores/c02-datos-de-entrada-capas-y-participantes.md) |
| 3 | Catálogo de 32 capacidades y escala | `jugadores` | 661–1277 | 7146 | [p01](jugadores/c03-p01-escala-visible-130.md) · [p02](jugadores/c03-p02-mapa-de-uso-de-las-32-capacidades.md) · [p03](jugadores/c03-p03-relacion-con-las-32-capacidades.md) |
| 4 | Cuerpo y alcance funcional | `jugadores` | 1279–1477 | 1561 | [c04-cuerpo-y-alcance-funcional.md](jugadores/c04-cuerpo-y-alcance-funcional.md) |
| 5 | Tendencias individuales y decisiones | `jugadores` | 1479–1732 | 2108 | [c05-tendencias-individuales-y-decisiones.md](jugadores/c05-tendencias-individuales-y-decisiones.md) |
| 6 | Experiencia, veteranos y desarrollo | `jugadores` | 1734–1899 | 1047 | [c06-experiencia-veteranos-y-desarrollo.md](jugadores/c06-experiencia-veteranos-y-desarrollo.md) |
| 7 | Táctica ofensiva: estilos, disposiciones, libro y roles | `tacticas` | 1901–2458 | 4085 | [p01](tacticas/c07-p01-estructura-de-la-configuracion-tactica.md) · [p02](tacticas/c07-p02-estilos-y-disposiciones-de-precarga.md) |
| 8 | Táctica defensiva: organización, estilos y responsabilidades | `tacticas` | 2460–3058 | 4558 | [p01](tacticas/c08-p01-estilos-defensivos-cinco-dimensiones-y-cinco-niveles.md) · [p02](tacticas/c08-p02-objetivos-sustituciones-y-alternativa-de-box-and-one.md) |
| 9 | Repertorio declarativo: tareas, continuaciones y fichas | `tacticas` | 3060–3804 | 6971 | [p01](tacticas/c09-p01-repertorio-declarativo-y-decisiones-sin-jugada.md) · [p02](tacticas/c09-p02-las-17-tareas-compartidas.md) · [p03](tacticas/c09-p03-las-15-fichas-posicionales.md) · [p04](tacticas/c09-p04-las-20-situaciones-espontaneas.md) |
| 10 | Banda, fondo y situaciones especiales | `tacticas` | 3806–4014 | 1639 | [c10-banda-fondo-y-situaciones-especiales.md](tacticas/c10-banda-fondo-y-situaciones-especiales.md) |
| 11 | Flujo de partido, posesiones y contexto pequeño | `simulacion` | 4016–4255 | 1915 | [c11-flujo-de-partido-posesiones-y-contexto-pequeno.md](simulacion/c11-flujo-de-partido-posesiones-y-contexto-pequeno.md) |
| 12 | Selección, oportunidad, ejecución y desenlace | `simulacion` | 4257–4855 | 5481 | [p01](simulacion/c12-p01-seleccion-oportunidades-y-desenlaces.md) · [p02](simulacion/c12-p02-tabla-1-seleccion-de-intenciones-y-participantes.md) |
| 13 | Tiempo, esfuerzo y energía | `simulacion` | 4857–5083 | 1973 | [c13-tiempo-esfuerzo-y-energia.md](simulacion/c13-tiempo-esfuerzo-y-energia.md) |
| 14 | Forma, momento, consistencia y presión | `jugadores` | 5085–5645 | 4532 | [p01](jugadores/c14-p01-forma-momento-individual-consistencia-y-presion.md) · [p02](jugadores/c14-p02-catalogo-de-episodios-y-actualizacion-de-estados.md) |
| 15 | Órdenes, delegación y dirección en vivo | `direccion` | 5647–6023 | 2855 | [c15-ordenes-delegacion-y-direccion-en-vivo.md](direccion/c15-ordenes-delegacion-y-direccion-en-vivo.md) |
| 16 | Entrenador: rotación, faltas, pausas y finales | `direccion` | 6025–6431 | 3408 | [p01](direccion/c16-p01-rotaciones-funciones-y-gestion-de-faltas.md) · [p02](direccion/c16-p02-tres-politicas-iniciales-de-entrenador.md) |
| 17 | Memoria defensiva y adaptación | `direccion` | 6433–6569 | 917 | [c17-memoria-defensiva-y-adaptacion.md](direccion/c17-memoria-defensiva-y-adaptacion.md) |
| 18 | Reglamento y administración deportiva | `reglamento` | 6571–6747 | 1454 | [c18-reglamento-y-administracion-deportiva.md](reglamento/c18-reglamento-y-administracion-deportiva.md) |
| 19 | Registro, conservación y reproducción | `estadisticas` | 6749–7070 | 2440 | [c19-registro-conservacion-y-reproduccion.md](estadisticas/c19-registro-conservacion-y-reproduccion.md) |
| 20 | Estadísticas: acta, atribución y magnitudes | `estadisticas` | 7072–8760 | 15241 | [p01](estadisticas/c20-p01-unidad-de-finalizacion-de-tiro.md) · [p02](estadisticas/c20-p02-principios-de-interpretacion-y-presentacion.md) · [p03](estadisticas/c20-p03-atribucion-que-hecho-produce-cada-registro.md) · [p04](estadisticas/c20-p04-faltas-sanciones-lesiones-y-disponibilidad.md) · [p05](estadisticas/c20-p05-catalogo-avanzado-y-formulas.md) · [p06](estadisticas/c20-p06-mapa-de-tiros-y-perfiles-de-finalizacion.md) |
| 21 | Análisis táctico, quintetos, filtros e informes | `estadisticas` | 8762–9560 | 6623 | [p01](estadisticas/c21-p01-lectura-ofensiva-libro-y-direccion-de-juego.md) · [p02](estadisticas/c21-p02-aportaciones-sin-balon-y-oportunidades.md) · [p03](estadisticas/c21-p03-informes-para-entrenador-jugadores-y-rival.md) |
| 22 | Resumen final, relato y presentación | `estadisticas` | 9562–9828 | 1932 | [c22-resumen-final-relato-y-presentacion.md](estadisticas/c22-resumen-final-relato-y-presentacion.md) |
| 23 | Visibilidad e información disponible | `estadisticas` | 9830–10057 | 1956 | [c23-visibilidad-e-informacion-disponible.md](estadisticas/c23-visibilidad-e-informacion-disponible.md) |
| 24 | Modalidades y primer laboratorio | `laboratorio` | 10059–10378 | 2985 | [c24-modalidades-y-primer-laboratorio.md](laboratorio/c24-modalidades-y-primer-laboratorio.md) |
| 25 | Población de referencia y generación | `validacion` | 10380–10795 | 4383 | [p01](validacion/c25-p01-contenido-y-poblacion-con-y-pob.md) · [p02](validacion/c25-p02-eq08-jovenes-atleticos-y-menor-comprension.md) |
| 26 | Panel, parámetros, perfiles y versiones | `configuracion` | 10797–11410 | 5013 | [p01](configuracion/c26-p01-panel-de-administracion-finalidad-y-organizacion.md) · [p02](configuracion/c26-p02-perfiles-versiones-y-ciclo-de-mejora.md) |
| 27 | Inventario de tablas y contratos de datos | `configuracion` | 11412–12173 | 6570 | [p01](configuracion/c27-p01-organizacion-de-los-datos.md) · [p02](configuracion/c27-p02-estadistica-y-resumen-est01est08.md) · [p03](configuracion/c27-p03-diccionario-de-tablas-y-parametros.md) |
| 28 | Auditorías y criterios de aceptación | `validacion` | 12175–13024 | 9158 | [p01](validacion/c28-p01-poblacion-modalidades-y-conservacion.md) · [p02](validacion/c28-p02-conciliaciones-y-aceptacion-del-catalogo.md) · [p03](validacion/c28-p03-auditorias-y-casos-de-aceptacion.md) · [p04](validacion/c28-p04-criterios-de-aceptacion-documental-y-funcional.md) |
| 29 | Perfil inicial y semillas numéricas | `configuracion` | 13026–13638 | 5879 | [p01](configuracion/c29-p01-perfil-inicial-semillas-y-trabajo-numerico.md) · [p02](configuracion/c29-p02-duracion-carga-y-fatiga.md) |
| 30 | Alcance de construcción y trabajos por completar | `alcance` | 13640–13829 | 1244 | [c30-alcance-de-construccion-y-trabajos-por-completar.md](alcance/c30-alcance-de-construccion-y-trabajos-por-completar.md) |
| 31 | Comparativa histórica de habilidades y sistemas | `referencias` | 13831–14114 | 2740 | [c31-comparativa-historica-de-habilidades-y-sistemas.md](referencias/c31-comparativa-historica-de-habilidades-y-sistemas.md) |
| 32 | Glosario y diccionarios | `referencias` | 14116–14384 | 2752 | [c32-glosario-y-diccionarios.md](referencias/c32-glosario-y-diccionarios.md) |
| 33 | Fuentes y límites de la investigación | `referencias` | 14386–14734 | 3566 | [p01](referencias/c33-p01-fuentes-y-alcance-de-la-investigacion.md) · [p02](referencias/c33-p02-fuentes-y-limites-de-la-investigacion.md) |
| 34 | Trazabilidad y decisiones reconciliadas | `trazabilidad` | 14736–16288 | 23571 | [p01](trazabilidad/c34-p01-corpus-de-origen.md) · [p02](trazabilidad/c34-p02-registro-de-decisiones-de-origen.md) · [p03](trazabilidad/c34-p03-registro-de-decisiones-de-origen.md) · [p04](trazabilidad/c34-p04-matriz-completa-de-epigrafes.md) · [p05](trazabilidad/c34-p05-md02-bem-02-motor-atributos-y-estados-decisiones-md.md) · [p06](trazabilidad/c34-p06-md03-bem-03-motor-por-acontecimientos-tablas-y.md) · [p07](trazabilidad/c34-p07-md04-bem-04-estadisticas-y-resumen-funcional-completo-md.md) · [p08](trazabilidad/c34-p08-md04-bem-04-estadisticas-y-resumen-funcional-completo-md.md) · [p09](trazabilidad/c34-p09-md05-bem-05-decisiones-cerradas-panel-del-motor-y.md) · [p10](trazabilidad/c34-p10-md05-bem-05-decisiones-cerradas-panel-del-motor-y.md) · [p11](trazabilidad/c34-p11-md06-bem-06-cierre-funcional-de-los-siete-puntos-del.md) · [p12](trazabilidad/c34-p12-md06-bem-06-cierre-funcional-de-los-siete-puntos-del.md) · [p13](trazabilidad/c34-p13-md07-bem-07-inventario-tablas-contenido-y-cierre.md) · [p14](trazabilidad/c34-p14-md07-bem-07-inventario-tablas-contenido-y-cierre.md) · [p15](trazabilidad/c34-p15-md08-bem-08-primer-laboratorio-de-partidos-md.md) |
