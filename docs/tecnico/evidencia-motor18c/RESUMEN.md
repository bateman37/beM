# MOTOR-18C — Resumen de la evidencia

Cifras reales de la entrega (comprobado por Claude). El paquete completo (`MOTOR-18C-revision-rapida.zip`) y el recibo de verificación están fuera de Git en `out/motor18c/entrega-final/`.

| Comprobación | Resultado |
|---|---|
| T18C-01…04 con la corrección (`node --test tests/motor18c.test.js`) | 4/4 correctas |
| T18C-01…04 con el comportamiento anterior (interfaz de `main`) | T18C-01, 02 y 03 **fallan**; T18C-04 pasa (la copia correcta no cambia) |
| Suite completa (`npm test`, una vez) | 279 pruebas, 279 correctas, 0 fallos (275 de 18B + 4 de 18C) |
| `npm run data:check` | datos correctos |
| Comprobador documental (copia limpia, sin `out/`) | ver `verificaciones/doc-check.txt` del paquete |
| Recorrido de Chromium | 15/15 pasos, consola 0, red 0; 1 partido nuevo (ver `recorrido-navegador.json`) |
| Áreas deportivas y datos | 176 archivos de `src/` (salvo `lab/` y `version.js`) y `data/` con SHA-256 idéntico a la base `d744e23` |

`identidad-casos.json`: 52 filas (caso, copia del resultado, copia activa, encuentro, equipo, fuente esperada, fuentes registradas, acción, aceptación/rechazo y motivo). Regenerar: `node scripts/m18c-evidence.js`. Los partidos ejecutados internamente por la suite no se contabilizan (recuento no disponible).
