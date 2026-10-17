# beM

Juego de gestión de baloncesto en desarrollo. Este repositorio contiene, por ahora, el **diseño funcional documentado del motor de partidos y de su primer laboratorio**, las normas de trabajo y utilidades para mantener esa documentación.

## Estado real

- **Desde MOTOR-01 hay motor y laboratorio ejecutables**: `npm run dev` → <http://localhost:5173/>; `npm test` para las comprobaciones. **MOTOR-05** añade la defensa completa ([`docs/tecnico/motor05.md`](docs/tecnico/motor05.md)); **MOTOR-04** añade el ataque posicional completo ([`docs/tecnico/motor04.md`](docs/tecnico/motor04.md)); **MOTOR-02** añade tres modalidades y dirección manual: [`docs/tecnico/motor02.md`](docs/tecnico/motor02.md). Datos provisionales, sin calibrar; MOTOR-02 pendiente de validación de Dennis.
- **MOTOR-12** añade la **simulación masiva y la extracción completa**: pestaña *Lotes* del laboratorio (agenda con variantes y semillas congeladas, progreso, detener/continuar), persistencia en `out/batches/`, paquete ZIP de análisis (CSV, JSON, JSONL) con partes e índice y comprobador (`npm run batch:check -- <ruta>`): [`docs/tecnico/motor12.md`](docs/tecnico/motor12.md). Sin cambio deportivo.

- Existen documentación, motor de partidos y laboratorio (MOTOR-01); **no** hay manager, base de datos ni despliegue. Ver [`docs/estado.md`](docs/estado.md).
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
