# Exportados

Archivos **generados**; no se editan a mano.

| Archivo | Qué es | Origen |
|---|---|---|
| [`beM-MOTOR-COMPLETO-VIGENTE.md`](beM-MOTOR-COMPLETO-VIGENTE.md) | Funcional íntegro **vigente** para lectura integral (capítulos, tablas, enlaces internos, anexos de referencia y trazabilidad). Los índices se generan a partir de los encabezados. | Las secciones de [`../motor/`](../motor/README.md) en el orden de [`manifest.json`](../motor/manifest.json). |

Naturaleza: refleja el estado **actual** de las secciones. La copia congelada de la importación es otra cosa: [`../historico/motor/unificado-original.md`](../historico/motor/unificado-original.md). Nunca se usa un exportado para sobrescribir cambios vigentes en las secciones. Su cabecera indica carácter generado, fuentes, revisión de composición y una huella del contenido; no incluye marcas de tiempo, de modo que reconstruir sin cambios no modifica el archivo.

## Comandos (requieren Python 3; solo librería estándar)

```
python3 scripts/docs/build_engine_docs.py            # reconstruye el exportado
python3 scripts/docs/build_engine_docs.py --check    # solo verifica que está al día
python3 scripts/docs/check_engine_docs.py            # integridad, enlaces y exportado
python3 scripts/docs/check_engine_docs.py --importacion   # además: conservación frente al original importado
```

Qué comprueba `check_engine_docs.py`: módulos y manifiesto coherentes, formato de páginas (bloques de código y tablas no cortados), identificadores únicos, enlaces locales de todos los Markdown (archivo y ancla), alcanzabilidad de `docs/` desde los índices y exportado idéntico al generado con todos sus enlaces internos resueltos. Con `--importacion`: SHA-256 del original, reproducción literal de cada módulo, toda línea no vacía cubierta, anclajes y filas de tabla conservados. Esta última verificación es **del punto de importación**: tras un cambio funcional aceptado dejará de coincidir y es lo esperado.

## Cómo se construye una página

Cada módulo de `docs/motor/` tiene una cabecera (`<!-- beM:nav-inicio -->`…`<!-- beM:nav-fin -->`) y un pie (desde `<!-- beM:pie-inicio -->`) de navegación; las tablas paginadas empiezan con `<!-- beM:cab-repetida -->` y dos líneas de cabecera repetida. Todo eso es navegación añadida: el generador lo retira, devuelve los enlaces a `](#ancla)` y recompone el contenido con las separaciones registradas en el manifiesto. Detalle de las transformaciones: [`manifest.json`](../motor/manifest.json) (`transformaciones_de_navegacion`).
