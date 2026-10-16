# CLAUDE.md — instrucciones para Claude Code en beM

## Antes de empezar cualquier entrega

1. Lee [`AGENTS.md`](AGENTS.md): normas N01–N12, responsabilidades y límite de decisiones. Es el contrato común y prevalece sobre cualquier hábito propio.
2. Lee [`docs/README.md`](docs/README.md): índice general, autoridad documental y mapa «tarea → lecturas de entrada».
3. Después, **solo** los temas y dependencias que afecten al encargo: [`docs/motor/README.md`](docs/motor/README.md) y el `README.md` de la carpeta del tema, y de ahí las dependencias pertinentes.
4. Si retomas una implementación: [`docs/estado.md`](docs/estado.md) y el prompt anterior en [`docs/prompts/README.md`](docs/prompts/README.md).

No leas todo el repositorio, todos los prompts ni el funcional completo por sistema. Si surge una dependencia nueva, amplía la lectura de forma dirigida.

## Durante la entrega

- Trabaja únicamente dentro del alcance del encargo y **solo en este repositorio**. No abras, clones ni busques en `basket-manager`, `BeManager` ni otros repositorios de referencia: esas consultas las hace ChatGPT y sus conclusiones llegan en los documentos o prompts.
- Puedes resolver detalles técnicos internos, locales y reversibles. **No decidas** reglas de juego, probabilidades, atributos, tácticas, prioridades de producto, alcance visible, formatos de competición ni comportamientos no definidos: comunica `DECISIÓN REQUERIDA` (cuestión, referencias, opciones y consecuencias, trabajo afectado) y continúa con lo independiente.
- No cambies el stack ni instales dependencias, frameworks, bases de datos o herramientas no pedidas.
- «Diseño definido» no es «implementado» ni «calibrado». No marques como validado por Dennis lo que Dennis no haya probado.
- Si editas `docs/motor/`, reconstruye el exportado y ejecuta la comprobación documental (ver [`AGENTS.md`](AGENTS.md#8-utilidades-documentales)). Nunca edites a mano `docs/exportados/` ni sobrescribas `docs/historico/`.
- Pruebas: las pertinentes al cambio (N04, N12). No lances baterías completas ni lotes masivos de partidos por inercia.

## Al finalizar la entrega

1. Actualiza la documentación afectada, [`CHANGELOG.md`](CHANGELOG.md) y [`docs/estado.md`](docs/estado.md); registra decisiones nuevas en [`docs/decisiones/README.md`](docs/decisiones/README.md).
2. Archiva el prompt ejecutado y su ficha en [`docs/prompts/README.md`](docs/prompts/README.md).
3. Crea la PR (rama propia del bloque) y **no la fusiones**: Dennis valida y decide.
4. Responde de forma breve y comprensible para Dennis: qué se hizo, enlaces, comprobaciones reales (distinguiendo «comprobado por Claude», «pendiente de Dennis» y «no ejecutado»), incidencias y pasos manuales.
