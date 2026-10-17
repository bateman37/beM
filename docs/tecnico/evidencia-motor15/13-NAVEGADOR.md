# 13 · Recorrido de navegador (MOTOR-15)

Ejecutado por **Claude** (no por Dennis) en Chromium 141.0.7390.37 (Playwright 1.56.1) contra `npm run dev` local, el 2026-10-17T18:57:31.962Z. Reproducible con `node scripts/browser/m15-recorrido.mjs`.

| Paso | Ruta | Acción | Resultado | Observación |
|---|---|---|---|---|
| 1 | http://127.0.0.1:5197/ | arranque y versiones | ok | MOTOR-15 — cierre funcional, compatibilidad y rendimiento del mundo · motor beM-motor-0.15.0-MOTOR15 · beM-match-export/9 |
| 3 | Partido | por cuartos: primer cuarto jugado | ok | Revisión entre periodos EQ01 28 – 24 EQ02 |
| 3 | Partido | solicitud de tiempo muerto en la revisión (pendiente hasta su ventana) | ok | (sin #planned-orders) |
| 4 | Partido | Guardar ahora (frontera entre periodos, con solicitud pendiente) | ok | Guardado SAVE-aa351b3e5931 (EQ01 – EQ02 · C1 0:00.0 · 28–24 · paso 116). La partida sigue en su estado actual. |
| 4 | Partido | recargar la página y Continuar el guardado (rama de laboratorio) | ok | EQ01 28 – 24 EQ02 (guardado EQ01 28 – 24 EQ02) |
| 4 | Partido | terminar el encuentro continuado | ok | Finalizado EQ01 83 – 98 EQ02 (tras 2.º periodo: Revisión entre periodos) |
| 5 | Partido › casos preparados | CASO-COLA-43 (43-5 y 43-7) | ok | 43-5 y 43-7) Cola de sanciones del art. 43 en el núcleo (43-5 y 43-7) |
| 5 | Partido › casos preparados | CASO-COMBINADAS: la técnica ya es ejecutable y la compensación se aplica | ok | sin duplicados al continuar: el guardado se reanudó sin repetir series (comprobado en pruebas; aquí no hay serie pendiente) |
| 6 | Análisis › Rotaciones | estado propio por tramo (audiencia propia) | ok | Estado propio por tramo de EQ01 Jugador Forma Energía inicial Inicio C1 Final C1 Inicio C2 Final C2 Inicio C3 Final C3 Inicio C4 Final C4 EQ |
| 6 | Análisis › Informes | REC10-01 y REC10-02: recomendación o insuficiencia diferenciada | ok | REC10-01 · Salida negada Poste: 7 ejecuciones frente a «niega la recepción» |
| 10 | Análisis | audiencia pública: sin estados privados | ok | Estado propio por tramo de EQ01 La energía, la Forma y los momentos son información propia o de diagnóstico: no se entregan a otra audiencia |
| 10 | Análisis › Exportar | el export deportivo con audiencia pública no filtra diagnóstico privado | ok | comprobado además por pruebas (M15·8) |
| 7 | Lotes | lote esencial con 2 workers; detener (no despacha nuevos y espera los activos) | ok | botones: 10 / 100 / 1000 / quitar / Añadir candidata / Revisar agenda y entradas · Detenido 6 4 4 0 2 auditoría general de coherencia y dist |
| 7 | Lotes | continuar hasta completar; resultados y errores diferenciados | ok | Lotes: simulación masiva y extracción completa Recorrido: plantillas/variantes → preparar experimento → revisar agenda y entradas → ejecutar |
| 8 | Auditorías | catálogo AUD01–32 | ok | Auditorías, sensibilidad y calibración Recorrido: elegir evidencia → verificar integridad → analizar (lectura: NO simula) → hallazgos y matr |
| 8 | Cierre | estado por eje, versiones, coste y descargas | ok | Cierre de MOTOR-15 Cuatro ejes que no se mezclan: funcional, rendimiento, evaluación deportiva y aceptación. Un objetivo de coste no alcanza |
| 9 | Cierre | descarga real de los dos paquetes | ok | MOTOR-15-revision-rapida.zip 40592 B · MOTOR-15-evidencia-detallada.zip 12558594 B |
| 9 | CLI | comprobador sobre el ZIP descargado desde la UI | ok | PAQUETE CORRECTO (103 comprobaciones; cubre solo el paquete rápido, no los ZIP de lote ni de auditoría) |
| 0 | consola/red | errores durante todo el recorrido | ok | consola 0; red 0 |

Errores de consola: 0. Errores de red: 0.

**No ejecutado:** recorrido manual de Dennis; otros navegadores; Node 24.
