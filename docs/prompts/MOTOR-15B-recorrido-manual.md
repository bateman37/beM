# MOTOR-15B — Recorrido manual para Dennis

Qué probar en la entrega [MOTOR-15B](MOTOR-15B-cierre-y-diagnostico-de-robos.md). Documentación técnica: [`../tecnico/motor15b.md`](../tecnico/motor15b.md). Todo está **pendiente de Dennis**: Claude solo ha recorrido estos pasos con Chromium automatizado ([`13-NAVEGADOR`](../tecnico/evidencia-motor15b/00-LEEME.md)); **no** se marca aceptado nada de MOTOR-08…15B.

## Arranque

```
npm run dev            # http://localhost:5173/  (PORT=otro para cambiar el puerto)
```

La cabecera debe decir `MOTOR-15B — cierre de MOTOR-15 y diagnóstico técnico de robos · motor beM-motor-0.15.1-MOTOR15B · beM-match-export/9`. Perfil, motor y versión de aplicación son cosas distintas.

## 1 · Perfil anterior → tarjeta → candidata/base (sin cambios respecto a MOTOR-15)

Panel de ajustes › Inicio con un perfil anterior: tarjeta de compatibilidad; «Crear candidata compatible desde la base actual», «Activar la base actual» (pide confirmación) y «Consultar la base actual». Nada se activa solo y el original queda intacto. Sin biblioteca propia: `node scripts/browser/panel-recovery.mjs <biblioteca-antigua.json>`.

## 2 · El caso de la sanción (RG-I03) sin editar JSON

1. Partido › juega un encuentro de cualquier modalidad hasta el final (p. ej. «Por cuartos» o «Simular total»).
2. Debajo del acta, **Casos de laboratorio preparados › «Interferencia defensiva en el último libre (RG-I03, MOTOR-15B)»**. Es un caso **preparado** (copia SEM de laboratorio que solo expone esa oportunidad; no mide ninguna frecuencia).
3. Resultado esperado en «Resultado obtenido»: `libreOriginal` con punto concedido **una sola vez**; `tecnica` con `categoria: tecnica2`, regla `RG-F07`, `technicalCat2: 1`, `technicalCat1: 0`, falta colectiva sumada; `libreAdicional` (lanzador elegido por la política existente; puede entrar o fallar); `reanudacion` = `throw_in` del **rival**; `guardado` con el libre adicional pendiente y `continuacionIgual: true` (al continuar desde el guardado no se repite punto, sanción ni intento).
4. Señales de fallo: dos puntos por el mismo libre, más de un libre adicional, una técnica sin infractor, un rebote tras la técnica, o `continuacionIgual: false`.

## 3 · Guardar y continuar

Partido › «Por cuartos» › Preparar › primer cuarto › «Guardar ahora» → F5 → «Guardar y continuar» › **Continuar**: mismo marcador como *rama de laboratorio*; el guardado original no se modifica. Un guardado de MOTOR-15 (motor 0.15.0) se **rechaza con motivo** (no se reinterpreta con otras reglas).

## 4 · Robos en el acta

Análisis › **Defensa** (audiencia Diagnóstico) y el acta: los robos por balón suelto ganado aparecen como `REC` del defensor con su pérdida rival en el mismo hecho. Los robos por balón suelto llevan `fuente: balón suelto ganado en disputa` (en el export diagnóstico). Un balón fuera, una violación o una falta **no** dan robo. Los encuentros de MOTOR-15 abiertos desde un archivo conservan su acta (`ACTA-MOTOR15-R1`): no se reinterpretan.

## 5 · Auditorías con la evidencia correcta

1. Genera (una vez) los lotes de reproducción: `node scripts/m15b-audit.js` y cópialos al servidor local: `cp -r out/motor15b/auditoria/c15-lote-A/LOT-* out/motor15b/auditoria/c15-lote-B/LOT-* out/batches/` (o arranca con `BEM_BATCH_ROOT=out/motor15b/auditoria/…` según prefieras). Sus etiquetas dicen «reproducción»: **no son los archivos originales de MOTOR-15**.
2. Auditorías › 1 · Evidencia disponible: marca los dos lotes › «Verificar integridad» › «Analizar». Despliega **«Universo efectivo de la evidencia»**: fuentes, encuentros, casos y huellas; C15-05 es el lote de la copia extrema.
3. Elige solo el lote de C15-05: AUD17 pasa a `conforme/observada` (más de 24.000 términos con energía < 10; el extremo no estima frecuencias normales). Con solo C15-01…04: `inconcluso/insuficiente`.
4. Hallazgos: AUD26 clasificado (`SAQUE-INTERRUMPIDO-FIN-PERIODO`, `SAQUE-SIN-ENTREGA-VALIDA` = comportamiento válido; `SAQUE-SIN-CIERRE-TRAS-DESENLACE` solo en la evidencia histórica). No hay 32 auditorías conformes: es correcto.

## 6 · Cierre y descargas

Cierre: estado por eje (cierre MOTOR-15B, robos, rendimiento, evaluación deportiva, aceptación), versiones, coste y **Descargas**: `MOTOR-15B-revision-rapida.zip`, `MOTOR-15B-evidencia-detallada.zip` (nuevos) y los de MOTOR-15 como histórico. Genera los ZIP con `node scripts/m15b-package.js --code-commit=<commit>` y compruébalos con `node scripts/m15b-package-check.js <rápido.zip> --detail <detalle.zip> --base out/motor15` (cubre solo estos paquetes). Envía primero el rápido.

## Pendiente / no ejecutado

Tu recorrido manual; otros navegadores; Node 24; campaña de MOTOR-16 y calibración; lectura directa de los PDF de FIBA.
