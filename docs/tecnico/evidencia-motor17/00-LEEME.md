# MOTOR-17 — evidencia para ChatGPT (léeme)

Entrega de MOTOR-17 ([prompt](../../prompts/MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md), [documentación técnica](../motor17.md)): correcciones demostradas, optimización exacta, dos candidatas numéricas **propuestas** (una elegida para el cierre antes de simular) y la auditoría comparativa de cierre `MOTOR17-CIERRE-20261018` (R0 = MOTOR-15B frente a R17). **Interpretación deportiva, comparación externa y aceptación: de ChatGPT y Dennis.** Nada de lo que sigue es una calibración aceptada.

## Archivos y orden de lectura

**`MOTOR-17-revision-rapida.zip`** (léelo primero; ≈ pocos MiB) y **`MOTOR-17-indice-partes.json`** (índice externo con tamaños reales en bytes y SHA-256 del paquete rápido y de cada parte). **`MOTOR-17-evidencia-detallada-parte-NN-de-MM.zip`** (partes de ≈ 64 MiB; se piden solo si hace falta).

| En el paquete rápido | Contenido |
|---|---|
| `00-LEEME.md` | este archivo |
| `01-RESUMEN-OPERATIVO.md` | base real, alcance realizado, cantidades, defectos, cambios numéricos, comparación mecánica, auditorías, coste, equivalencia, comprobaciones y pendientes (**generado desde los archivos finales**) |
| `02-HIPOTESIS.csv` | cada hipótesis de MOTOR-16: confirmada / refutada / no resuelta, con el archivo o caso y el punto del código |
| `03-TABLA-DE-CAMBIOS.csv` | tipo (crédito, registro, código deportivo, parámetro, optimización), antes/después, consumidores, efecto sobre IA/estados/dirección y causa |
| `04-IDENTIDADES-Y-GIT.json` | R0, A17, P17, candidatas y R17: commits completos, árboles, estado de Git, perfiles efectivos y huella deportiva, políticas, dependencias, Node/SO/CPU |
| `05-PLAN-CONGELADO/` | planes de las dos versiones (lotes, entradas, variantes, semillas, selección diagnóstica) con sus SHA-256, **guardados antes de simular** |
| `06-RESULTADOS/` | tablas CSV (ver [diccionario](DICCIONARIO.md)): ejecuciones, equipos, jugadores, rendimiento, comparación R0/R17, embudo de pérdidas y robos, cierres de saque, decisiones de relevo, tiros por sector y calidad, ritmo por tipo de hecho, rotación por jugador |
| `07-AUDITORIAS/` | por lectura (`R0-lectorR0`, `R0-lectorR17`, `R17-lectorR17`): informe, ejecuciones, hallazgos, capacidades (32), sensibilidad (exacta/aproximada), fiabilidad, referencias, resumen |
| `08-COSTE/` | cuatro trabajos reales (R0 y R17 × 100 y 200) con fases, memoria, bytes y esfuerzo deportivo; atribución de la optimización en `coste-atribucion` (detallada) |
| `09-EQUIVALENCIA/` | A17f↔P17 (completo y mínimo), `npm run equivalence` de cada versión y la referencia histórica 20261016 |
| `10-EVIDENCIA-DE-CAUSAS/` | embudo de robos antes/después, cadenas de saque antes/después |
| `11-DESARROLLO-Y-CANDIDATAS/` | muestra de desarrollo (24 encuentros por perfil) y definición de las candidatas |
| `12-DICCIONARIO.md` | columnas, unidades, claves y contratos de huellas |
| `13-PRUEBAS-Y-NAVEGADOR/` | resultados de pruebas, `data:check`, comprobador documental, recorrido de Chromium y recuperación de perfil anterior |
| `14-INDICE-DE-PARTES.json` | copia del índice de las partes detalladas (sin hash propio, para evitar dependencias circulares) |

**Evidencia detallada** (partes): lotes esenciales íntegros por versión y bloque (entradas congeladas, índice y registros), paquetes `beM-analysis-package/1` de los 24 diagnósticos, auditorías (con sus paquetes), coste, equivalencia, evidencia de causas, plan, informes, registros y comandos, código pertinente de solo lectura de R17 con el diff frente a R0 (R0 no va incluido: se reproduce con `git worktree add --detach <ruta> 6a6814c`), sin `.git`, `node_modules` ni secretos.

## Mapa de casos (identidad)
Clave lógica `bloque|grupo|r..|H0/H1/fija|variante` (`04-MAPA-CASOS.csv`) empareja el mismo caso entre R0 y R17. Un `M000001`/`E0052` local **no** identifica nada entre lotes: usa `row_key = versión:batch_id:attempt_id`. A: 66 pares × H0/H1 (semilla `271000000 + 1000·p + 1`, espacio cambiado respecto al prompt: ver declaración en el resumen); B: EXP13-01…12 × r=1,2 × V0/V1 (`280000000 + 1000·e + r`); C: ORG01…06 × COB01…04 con EQ01 local (`290000001`); D: LAB11-02/03/04/06 × r=1,2 (`300000000 + 1000·f + r`). Los 12 diagnósticos por versión repiten entradas y semilla con registro diagnóstico completo (`purpose = diagnostico_completo`); los benchmarks no se suman al universo natural.

## Comprobar la entrega
```
python3 scripts/m17-verify-delivery.py            # CRC, tamaños, SHA-256 de partes/ZIP internos/paquete rápido, agenda, tablas, auditorías y coste
node scripts/batch-check.js <paquete diagnóstico>   # batch:check solo reconoce los paquetes beM-analysis-package/1 (no los esenciales ni el contenedor externo)
node scripts/audit-check.js <AUDR-….zip>            # paquete de auditoría
```

## Lo que NO hay
Calibración aceptada; lectura directa de FIBA por Claude (síntesis de ChatGPT); referencia externa compatible para fijar dianas; recorrido manual de Dennis; Node 24 y otros navegadores. La primera pasada de R17 (antes de la revisión B) se conserva identificada en la copia de trabajo de Claude y no se usa.
