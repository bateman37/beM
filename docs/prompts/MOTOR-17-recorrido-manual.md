# MOTOR-17 — Recorrido manual para Dennis

Qué probar en la entrega [MOTOR-17](MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md). Documentación técnica: [`../tecnico/motor17.md`](../tecnico/motor17.md). Todo está **pendiente de Dennis**: Claude solo ha recorrido estos pasos con Chromium automatizado (informe en `evidencia-motor17/`: `navegador.json`, `panel-recovery.txt`) y no marca nada como aceptado. **No ejecutado:** otros navegadores, Node 24 y el recorrido humano.

## Arranque

```
npm run dev            # http://localhost:5173/  (PORT=otro para cambiar el puerto)
```

La cabecera debe decir `MOTOR-17 — ajustes, rendimiento y auditoría de cierre · motor beM-motor-0.17.0-MOTOR17 · beM-match-export/9`. Aplicación, motor, formato, perfil y dataset son cosas distintas.

## 1 · Base anterior y activación EXPLÍCITA de la propuesta

1. **Perfil anterior.** Si tienes una biblioteca guardada de una versión anterior: Panel de ajustes › Inicio muestra la tarjeta de compatibilidad (nada se activa solo; el original queda intacto). Sin biblioteca propia: `node scripts/browser/panel-recovery.mjs out/motor17/comandos/biblioteca-anterior-MOTOR07.json` (genera la biblioteca de un perfil de MOTOR-07, anterior a `coach`; 15/15 pasos correctos con Chromium).
2. **Activar la base MOTOR-17.** En esa tarjeta, «Activar la base actual» (pide confirmación). El perfil activo pasa a ser la base `…+SEM-MOTOR17-20261018` (**sin** candidata).
3. **La propuesta NO está activada.** La candidata elegida para el cierre (C17-02) solo existe como fila en `data/match/motor17-candidates.json`; para probarla, ve al paso 2.

Señales de fallo: la versión activa cambia sin pulsar nada; un error «reading 'policies'»; el panel no abre con el perfil anterior.

## 2 · Encontrar los parámetros y las diferencias de las candidatas

Auditorías › **Calibración y candidatas**: C17-01 y C17-02 con **fila del Panel** (`energy.costPerLiveMinute`), unidad (energía por minuto de juego en pista), valor base → candidata (2 → 3 y 2 → 3,5), consumidor (`MatchCore.consume`), causa (gasto), efecto previsto y observado en desarrollo (24 encuentros), y el aviso «sin aceptación deportiva». «**Crear borrador en el Panel (no activa)**» crea un borrador sobre la versión activa: el mensaje debe decir *NO activado*. En Panel › Perfiles, el borrador aparece con la fila editada y su diff; **activarlo es una acción tuya** y puedes descartarlo.

Señales de fallo: el botón activa algo; el borrador cambia otra fila; el valor base mostrado no es 2.

## 3 · Comprobar una recuperación con su crédito en acta y análisis

1. Partido › «Por cuartos» › Preparar › Empezar (o «Simular total») hasta **Finalizado**.
2. Análisis › audiencia **Diagnóstico** › **Acta y comparación** (REC de cada jugador) y **Defensa** (robos por organización): son ahora del orden de **7 por equipo** (antes ≈ 2–3): cada pérdida con balón vivo que recupera un defensor resuelto lleva su **REC** en el mismo hecho. En el export diagnóstico, `stats[].fuente` indica «pérdida viva recuperada con control» o «balón suelto ganado en disputa»; `contacto` es «intento de intervención» (el desvío lo inició el interceptor) o «recogida controlada».
3. Una pérdida con **balón fuera**, **violación** o **falta ofensiva** no tiene robo; una recuperación sin defensor resuelto (sorteo de recuperador) tampoco: no se fabrica un autor.

Señales de fallo: dos robos en el mismo hecho; un robo con balón fuera; un robo sin pérdida rival; el marcador o los sorteos dependen del crédito (no deben: es solo estadístico).

## 4 · Decisiones de relevo del director y de la estrella fatigada

Con la base MOTOR-17 (gasto 2) y con el borrador C17-02 activado en una copia de laboratorio (gasto 3,5): juega «Simular total» y en Análisis › **Rotaciones y quintetos** (y en el relato del Partido) mira los relevos y sus decisiones: motivo (`tramo_largo`, `fatiga`, `energia_critica`, `proteccion_faltas`, `participacion`), energías del saliente y entrante y utilidades (escala 1–30). Con gasto 2 casi nunca hay relevo por fatiga y suele haber un jugador de 40:00; con 3,5 aparecen relevos por fatiga y energías < 30 sin que ningún motivo fuerce el cambio: **una estrella con energía 30 puede seguir si su relevo es peor**, y un jugador sin minutos (J02, recurso situacional) sigue pudiendo no jugar.

## 5 · Tres modos y guardar/continuar

Partido › «Por cuartos» › Preparar › primer cuarto › «Guardar ahora» → F5 → «Guardar y continuar» › **Continuar**: mismo marcador como *rama de laboratorio*; el guardado original no se modifica. Un guardado de MOTOR-15B (motor 0.15.1) se **rechaza con motivo** y el archivo queda intacto. Repite con «Por tiempo» (x2…x16) y «Simular total»: mismo deporte en las tres modalidades (comprobado por `npm run equivalence`, 8 comparaciones).

## 6 · Análisis por audiencia, capacidades y cobertura real de las auditorías

1. Análisis › audiencia **Público / rival** › Exportar: no debe salir ningún estado privado ni probabilidad exacta.
2. Auditorías › 1 · Evidencia disponible: marca los lotes diagnósticos (copia de `out/motor17/lotes/R17/LOT-*` de los diagnósticos a `out/batches/`, o arranca con `BEM_BATCH_ROOT=…`) › «Verificar integridad» › «Analizar». Despliega «Universo efectivo de la evidencia»: los IDs locales (`M000001`) **no** identifican por sí solos partidos de lotes distintos.
3. «Matriz de 32 capacidades»: `matches` cuenta partidos de lotes distintos (hasta 12 con 12 diagnósticos, no 2); la columna `exactitud` separa la reconstrucción **exacta** (tope registrado) de la **aproximada** (solo evidencia histórica), y `unidad`/`magnitud` dicen si el cambio es la **entrada** de la operación final o su salida.
4. Hallazgos: AUD26 sin cadenas «abiertas tras desenlace»; AUD17 «conforme» solo si hay exposición real a energía < 10 (con gasto 3,5 sí; con gasto 2, no: «inconcluso»).

## 7 · Ver y descargar el cierre y sus archivos

Cierre › cabecera «Cierre de MOTOR-17»; coste medido (cien y doscientos reales, no extrapolación), versiones y **Descargas de devolución**: `MOTOR-17-revision-rapida.zip`, `MOTOR-17-indice-partes.json` y las partes `MOTOR-17-evidencia-detallada-parte-NN-de-MM.zip` (los de MOTOR-16, 15B y 15 aparecen como histórico). En la copia de Claude los archivos están en `out/motor17/entrega-final/` (fuera de Git, no recuperables desde otro clon). Verificación: `python3 scripts/m17-verify-delivery.py`.

Señales de fallo: un enlace que descarga un archivo de otra entrega; tamaños o SHA-256 distintos de los del índice externo.
