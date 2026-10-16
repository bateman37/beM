# MOTOR-03 — recorrido manual para Dennis

Arranque: `npm run dev` → <http://localhost:5173/> (o el `PORT` que definas) → pestaña **Panel de ajustes**. Estado de cada paso: **pendiente de Dennis** (Claude recorrió el flujo con Chromium automatizado, no sustituye tu revisión).

| Prueba | Pasos | Resultado esperado |
|---|---|---|
| Inicio | Panel de ajustes → Inicio. | Perfil activo V0, huella, tres semáforos separados (estructura, cobertura, evaluación pendiente) y distinción consultado/activo/borrador/partido. |
| Pregunta guiada | Mesa de ajustes → «El cansancio apenas se nota». | Gasto, curva y tarea afectada; sin cambios automáticos; sin indicadores hasta jugar un partido. |
| Tabla | Tabla maestra: buscar `p0`, filtrar, fijar ★ filas, ordenar. | Se localizan ajustes sin leer código. |
| Diccionario | Abrir `shots.three.p0` y `outcomes.base.turnover`. | Unidades, mecanismo y efecto distintos (eficacia vs. masa de desenlace). |
| Candidata | Perfiles → nombre → Crear borrador; editar una fila. | Base intacta; borrador con diferencia visible y motivo en el historial. |
| Tipos | Editar una probabilidad (`38,5`), una duración y la curva de severidad. | Coma decimal bien interpretada; ejemplos coherentes. |
| Inválido | Poner mínimo > máximo en una duración y validar. | Error localizado; Publicar deshabilitado. |
| Lote | Seleccionar dos `p0` → sumar 3 → Previsualizar; probar 90. | Lista antes/después; el 90 no aplica nada. |
| Herencia | Fila editada → Restablecer herencia. | Vuelve al valor del padre, no a cero. |
| Comparación | Comparador → Comparar un partido por perfil. | Dos encuentros completos, mismas entradas, diferencias con denominador, advertencia de muestra. |
| Sin activación accidental | Tras comparar, mirar la cabecera. | El perfil activo no cambia. |
| Activación | Perfiles → Publicar y activar. | Nuevos partidos usan esa versión; históricos intactos. |
| Congelación | Preparar y pausar un partido (por tiempo), activar otra versión, seguir. | El partido conserva sus parámetros; las órdenes siguen disponibles. |
| Persistencia | Recargar el navegador. | Borradores, versiones, historial y activo conservados. |
| Intercambio | Exportar V1, importarlo en otro navegador/perfil limpio. | Misma huella y origen; entra como candidata, sin activar. |
| Diagnóstico | Tras un partido, abrir «ver detalle» de un hecho. | «Filas del perfil consultadas» con los valores del perfil congelado de ese partido. |
| Restauración | Perfiles → Restaurar base. | Solo afecta a futuros encuentros; V1 sigue existiendo. |
| Regresión | Jugar total/cuartos/tiempo y editar jugadores. | MOTOR-01/02 siguen utilizables. |
