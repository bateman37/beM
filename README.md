# beM

Juego de gestión de baloncesto en desarrollo. Este repositorio contiene, por ahora, el **diseño funcional documentado del motor de partidos y de su primer laboratorio**, las normas de trabajo y utilidades para mantener esa documentación.

## Estado real

- **Solo documentación.** No existe todavía aplicación, motor, laboratorio ni manager implementados; no hay comandos de ejecución del juego. Ver [`docs/estado.md`](docs/estado.md).
- El diseño funcional del motor está **definido** y organizado por temas; «definido» no significa implementado, validado ni calibrado.
- Ninguna entrega ha sido aún validada por Dennis (DOC-001 está pendiente de su revisión).

## Por dónde empezar

| Quiero… | Abrir |
|---|---|
| Conocer las normas de trabajo (personas e IA) | [`AGENTS.md`](AGENTS.md) |
| Entrar a la documentación y ver qué leer según la tarea | [`docs/README.md`](docs/README.md) |
| Consultar el diseño del motor por materias | [`docs/motor/README.md`](docs/motor/README.md) |
| Leer el funcional completo vigente (generado) | [`docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md`](docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md) |
| Ver qué existe y qué falta | [`docs/estado.md`](docs/estado.md) |
| Ver los prompts de trabajo | [`docs/prompts/README.md`](docs/prompts/README.md) |
| Ver el historial de entregas | [`CHANGELOG.md`](CHANGELOG.md) |

Instrucciones específicas para Claude Code: [`CLAUDE.md`](CLAUDE.md).

## Utilidades documentales

Requieren Python 3 y solo usan la librería estándar:

```
python3 scripts/docs/build_engine_docs.py     # reconstruye el funcional completo vigente
python3 scripts/docs/check_engine_docs.py     # comprueba integridad, enlaces y exportado
```
