# Evidencia del lote de cierre de MOTOR-12

Identificación del paquete de cierre (**no se versionan los ZIP**: son artefactos descargables, ver [AGENTS.md §7](../../../AGENTS.md)). Se reproduce con:

```
node scripts/integration-motor12.js            # escribe en out/batches/ (excluido de Git); --out <dir> y --target-mib <n> opcionales
npm run batch:check -- out/batches/LOT-c268fba2/paquetes/<fecha>
```

| Dato | Valor |
|---|---|
| Lote | `LOT-c268fba2` (5 casos × 2 variantes = 10 encuentros; semilla de lote 20261017, derivación `LOT-SEED-R1`) |
| Motor / instrumentación / registro / paquete | `beM-motor-0.9.0-MOTOR09` · `INSTR-MOTOR11-R1` · `REG-MOTOR12-R1` · `beM-analysis-package/1` |
| Perfil efectivo | `…+SEM-MOTOR11-20261017+SEM-MOTOR12-20261017` (huella en el manifest) |
| Resultado | 10 terminados, **10 válidos**, 0 fallidos; índice + 9 partes (10 ZIP, 27,5 MiB, 378,6 MiB sin comprimir); `batch:check` ✔ |
| Pregunta | «¿Cómo cambian pérdidas, creación y distribución de tiros al sumar +3 en Pase (TEC08) a los directores?» (auditoría general de coherencia y distribuciones). Es evidencia de **integración**, no de realismo ni de calibración |

Archivos de esta carpeta (copias del índice global del paquete): [`resumen-LOT-c268fba2.md`](resumen-LOT-c268fba2.md), [`manifest-indice-LOT-c268fba2.json`](manifest-indice-LOT-c268fba2.json), [`indice-LOT-c268fba2.json`](indice-LOT-c268fba2.json) (partes con tamaño y SHA-256 de cada ZIP) y [`cobertura-LOT-c268fba2.csv`](cobertura-LOT-c268fba2.csv). Los ZIP volverán a producirse con otras fechas y otros SHA-256 al repetir la ejecución; lo que debe coincidir son los marcadores, los sorteos y las huellas de trayectoria (`trajectory_fp`).
