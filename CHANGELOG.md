# Changelog

Registro breve de entregas. Una entrada por entrega; las más recientes primero.

## MOTOR-03 — Panel administrable, perfiles y comparación — 2026-10-16

- Diccionario de ~390 filas del perfil (SUP01) con ficha, clase (balance/contenido/reglamento/invariante), cobertura real y consumidor; literales del código convertidos en filas con su valor exacto (`SEM-MOTOR03-20261016`). Equivalencia deportiva con la referencia anterior comprobada.
- Panel de ajustes: inicio, mesa por 7 preguntas, tabla maestra con filtros, vistas temáticas, catálogo 81 + 4, edición tipada y conjunta, ciclo de perfiles (borrador → validación → publicación → activación → restauración), comparador de un partido por perfil e intercambio JSON.
- Perfil efectivo congelado por partido, `profileRef` en el resultado y filas consultadas por hecho en el detalle diagnóstico. 53 pruebas.
- Documentación: [`docs/tecnico/motor03.md`](docs/tecnico/motor03.md), [recorrido manual](docs/prompts/MOTOR-03-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-02 — Tres modalidades y dirección manual — 2026-10-16

- Avance por fronteras (`step()`), ventanas reglamentarias como frontera propia y `MatchSession` como único controlador: simulado total, por cuartos (con prórroga) y por tiempo a x2/x4/x8/x16 con pausa. Misma semilla y órdenes ⇒ mismo deporte en cualquier modalidad.
- Órdenes con ciclo de vida (estilos, prioridades, director, llamada, sustitución/quinteto, delegación, tiempo muerto), precedencia, lotes atómicos y quinteto manual; tiempos muertos con cupos y recuperación única (extensión SEM `SEM-MOTOR02-20261016`).
- JSON `beM-match-export/2` y reproducción desde archivo (`npm run replay`); laboratorio con panel de dirección.
- Corrección B01: el lanzador de libres ya no sale antes de tirar (cambia resultados de referencia de MOTOR-01). 40 pruebas.
- Documentación: [`docs/tecnico/motor02.md`](docs/tecnico/motor02.md), [recorrido manual](docs/prompts/MOTOR-02-recorrido-manual.md). Pendiente de validación de Dennis.

## MOTOR-01 — Primer partido completo y laboratorio inicial — 2026-10-16

- Motor por acontecimientos en `src/match/` (azar xorshift32, energía, reglas FIBA 2026 del funcional, fichas POS01/05/07/09/11/14, continuaciones, recursos ESP, relevo básico) y laboratorio en `src/lab/` (`npm run dev`).
- Perfil SEM y 144 fichas extraídos programáticamente del prompt archivado ([`data/`](data/catalog.json)); provisionales, sin calibrar.
- Acta proyectada desde los hechos, relato por posesiones, detalle calculado y descarga JSON. 23 pruebas (`npm test`).
- Documentación: [`docs/tecnico/motor01.md`](docs/tecnico/motor01.md), [recorrido manual](docs/prompts/MOTOR-01-recorrido-manual.md). Pendiente de validación de Dennis.

## DOC-001 — Organización documental y normas — 2026-10-16

- Incorporadas las normas de trabajo N01–N12 y las responsabilidades en [`AGENTS.md`](AGENTS.md) y [`CLAUDE.md`](CLAUDE.md) (N11 y N12 son nuevas).
- Funcional unificado del motor importado y seccionado por temas en [`docs/motor/`](docs/motor/README.md) (34 capítulos en 74 archivos, sin resumir). Copia original congelada en [`docs/historico/motor/`](docs/historico/motor/unificado-original.md) con SHA-256; completo vigente generado en [`docs/exportados/`](docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md).
- Índices, mapa por tareas, estado, registro de decisiones, catálogo y plantilla de prompts. Prompt archivado: [`DOC-001`](docs/prompts/DOC-001-organizacion-documental-y-normas.md).
- Utilidades `scripts/docs/build_engine_docs.py` y `check_engine_docs.py`. Comprobaciones: ver [`docs/motor/COBERTURA.md`](docs/motor/COBERTURA.md).
- Sin implementación del motor ni del laboratorio. Los ocho originales no fueron suministrados. Pendiente de validación de Dennis.
