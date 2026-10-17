# MOTOR-15 — Recorrido manual para Dennis

Qué probar en la entrega [MOTOR-15](MOTOR-15-cierre-funcional-y-rendimiento-del-mundo.md). Documentación técnica: [`../tecnico/motor15.md`](../tecnico/motor15.md). Todo está **pendiente de Dennis**; Claude ejecutó un recorrido automatizado en Chromium (ver `docs/tecnico/evidencia-motor15/13-NAVEGADOR.md`), que no sustituye esta revisión.

## Arranque

```
npm run dev            # http://localhost:5173/  (PORT=otro para cambiar el puerto)
```

La cabecera debe decir `MOTOR-15 — cierre funcional, compatibilidad y rendimiento del mundo · motor beM-motor-0.15.0-MOTOR15 · beM-match-export/9`. Versión de aplicación, motor, formato, perfil y dataset son cosas distintas.

## 1 · Panel con un perfil anterior (el error de la captura)

1. Panel de ajustes › Inicio. Si el perfil activo es anterior (p. ej. «V0 de la cadena SEM hasta MOTOR-04») ya **no aparece** «No se pudo preparar el panel…». Debe verse una **tarjeta de compatibilidad** con identidad, versión, módulos presentes y módulos «no compatibles» (no es lo mismo que valor cero).
2. Botones: **Crear candidata compatible desde la base actual** (borrador; el original queda intacto), **Activar la base actual** (pide confirmación) y **Consultar la base actual**. Nada se activa solo.
3. Comprueba que Catálogo, Perfiles e Intercambio siguen abriéndose y que el perfil original sigue en la lista.
4. Cómo reproducirlo sin tu biblioteca: `node scripts/browser/panel-recovery.mjs <biblioteca-antigua.json>`.

## 2 · Partido, dirección y guardar/continuar

1. Partido › «Por cuartos» › Preparar › Jugar primer cuarto. En la revisión pide un **tiempo muerto** (queda pendiente hasta su ventana).
2. «Guardar ahora» (con etiqueta). Recarga la página (F5), Partido › «Guardar y continuar» › **Continuar**: debe retomar el mismo marcador como *rama de laboratorio*; el guardado original no cambia. Termina el encuentro.
3. Casos preparados (al terminar un partido): «Cola de sanciones del art. 43 en el núcleo» (43-5 compensada; 43-7: la técnica primero y se conserva el derecho) y «Sanciones combinadas» (la técnica ya es ejecutable).

## 3 · Análisis

1. Análisis › audiencia **Propia** › Rotaciones y quintetos: tarjeta «Estado propio por tramo» (energía con número y barra; Forma y momentos como categorías; muestras al inicio y final de cada periodo, sin interpolar).
2. Análisis › Informes: REC10-01 y REC10-02 muestran una recomendación o su **insuficiencia** (lo observado frente a lo exigido), distintas entre sí.
3. Cambia a **Público/rival**: los estados privados desaparecen (también en Exportar).

## 4 · Lotes: nivel esencial y concurrencia

1. Lotes › Nivel de registro «Esencial para el mundo»; Concurrencia «2 workers» (o 4 / automática). Repeticiones: 3 (tras editar el número pulsa Tab). Revisar agenda › Iniciar lote.
2. **Detener** no corta partidos: no despacha nuevos y espera los activos (se muestra cuántos). **Continuar pendientes** completa el resto. Los fallos, si los hubiera, aparecen sin marcador y sin contar como derrota.
3. Mide en CLI: `node scripts/bench-world.js --n=8 --concurrency=4`.

## 5 · Auditorías y Cierre

1. Auditorías: catálogo AUD01–32 (definición ≠ resultado).
2. **Cierre**: estado por eje (funcional, rendimiento, evaluación deportiva, aceptación), versiones, coste y **descargas**. Descarga el paquete rápido y comprueba: `node scripts/m15-package-check.js <zip descargado>`.
3. Primero envía `MOTOR-15-revision-rapida.zip`; el detalle solo si se pide. (Se generan con `node scripts/m15-package.js`; viven en `out/motor15/`, fuera de Git.)

## Señales de fallo

- «No se pudo preparar el panel» con cualquier perfil guardado.
- Un perfil que cambia de activo sin pulsar «Activar».
- Una continuación que repite libres o créditos, o cambia el marcador guardado.
- Estados propios visibles con audiencia pública.
- Un lote «Completado» con intentos fallidos contados como derrota.
- Un 404 en la consola o la red (se registra el hallazgo; no se atribuye automáticamente al favicon).
