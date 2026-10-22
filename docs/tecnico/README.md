# Documentación técnica

Cómo está **realmente implementado** el proyecto. Distingue lo documentado de lo pendiente; no diseña arquitectura nueva.

## Documentado

- **MOTOR-01** (motor, laboratorio, datos y pruebas): [`motor01.md`](motor01.md).
- **MOTOR-02** (modalidades, órdenes, tiempos muertos, registro y reproducción): [`motor02.md`](motor02.md).
- **MOTOR-03** (panel de ajustes, perfiles, herencia, validación, comparación e intercambio): [`motor03.md`](motor03.md).
- **MOTOR-04** (repertorio ofensivo, disposiciones, estilos, roles, rebote/balance): [`motor04.md`](motor04.md).
- **MOTOR-05** (defensa por funciones, coberturas, alturas de presión, especiales y cierre de salvedades de MOTOR-04): [`motor05.md`](motor05.md).
- **MOTOR-06** (transición, decisiones espontáneas ESP01–ESP20, saques de banda y fondo y cierre de salvedades de MOTOR-05): [`motor06.md`](motor06.md).
- **MOTOR-07** (capacidades, energía, Forma, presión, momentos, T y episodios, con cierre acotado de salvedades de MOTOR-06): [`motor07.md`](motor07.md).
- **MOTOR-08** (entrenador automático con tres políticas y delegación por áreas, memoria defensiva y cierre de las salvedades de MOTOR-07): [`motor08.md`](motor08.md).
- **MOTOR-09** (reglamento, administración y acta: matriz normativa con estado de contraste por fila, series de libres, posesiones beM y finalizaciones F, acta completa, conciliación, revisiones, ruta B de la memoria y cierre de pendientes de MOTOR-08): [`motor09.md`](motor09.md).
- **MOTOR-10** (análisis, estadísticas, resumen e información: lector del partido con catálogo común de indicadores, evolución y final ajustado, mapa y calidad, origen y ejecuciones, defensa, saques, sin balón, quintetos y on/off, resumen con claves sustentadas, recomendaciones condicionadas, permisos por audiencia y exportación analítica; sin cambio deportivo ni de `export/8`): [`motor10.md`](motor10.md).
- **MOTOR-11** (población de referencia de doce equipos y 144 fichas con revisión de edad, planes naturales materializados, generador correlacionado reproducible, edición +1/+3/+5 con deshacer exacto, variantes, escenarios LAB11 con export/import, cuota de cierres, producción por 100 en presencia completa, organización por hecho e instrumentación de ayuda/corte; sin cambio deportivo): [`motor11.md`](motor11.md).
- **MOTOR-12** (simulación masiva y extracción completa: agenda con variantes y semillas congeladas, controlador serial con detención/continuación/reintento y persistencia progresiva en `out/batches/`, registro diagnóstico completo R01–R08, agregados/distribuciones/comparación base-candidata, paquete ZIP `beM-analysis-package/1` con partes, índice y fragmentos, comprobador `npm run batch:check`, huellas de archivo/entrada/trayectoria separadas, pestaña Lotes y `SEM-MOTOR12-20261017`): [`motor12.md`](motor12.md) · evidencia del lote de cierre: [`evidencia-motor12/`](evidencia-motor12/README.md).
- **MOTOR-13** (auditorías AUD01–32 sobre evidencia conservada, matriz de 32 capacidades con contraste de cálculo fijo, fiabilidad y concentración, doce contrastes y campaña inicial, primer ciclo de calibración con base mantenida y paquete de auditoría): [`motor13.md`](motor13.md) · [evidencia](evidencia-motor13/README.md).
- **MOTOR-14** (parcial: siete capacidades registradas, guardar/continuar, inferioridad natural y terminación, equivalencia/AUD29, contrato para el manager, coste): [`motor14.md`](motor14.md) · [contrato](motor14-contrato.md) · evidencia en `evidencia-motor14/` ([inventario](evidencia-motor14/inventario.md)).
- **MOTOR-15** (cierre funcional, compatibilidad y rendimiento del mundo: panel con perfiles anteriores, técnicas/art. 43/art. 45, tiro pendiente e interferencia, asistencias causales, estado por tramo, REC10, `world-essential` y workers; coste medido y objetivo no alcanzado): [`motor15.md`](motor15.md) · [esencial y workers](motor15-c-esencial-y-workers.md) · [evidencia](evidencia-motor15/00-LEEME.md).
- **MOTOR-15B** (cierre de MOTOR-15: RG-I03 con técnica de categoría 2, numeración del art. 45, procedencia de auditorías y energía crítica, equivalencia con campos y observador, y diagnóstico técnico de robos con corrección de crédito): [`motor15b.md`](motor15b.md) · [evidencia](evidencia-motor15b/00-LEEME.md).
- **MOTOR-17** (ajustes, rendimiento y auditoría de cierre: criterio único de robo, cierre de cadenas de saque, identidad global y sensibilidad exacta, optimización exacta del coste, candidatas numéricas propuestas y campaña comparativa R0/R17): [`motor17.md`](motor17.md) · [evidencia](evidencia-motor17/00-LEEME.md) · [diccionario](evidencia-motor17/DICCIONARIO.md) · [recorrido manual](../prompts/MOTOR-17-recorrido-manual.md).
- **MOTOR-17B** (cierre técnico y auditoría acotada: organización efectiva en el esencial, contraste de las 32 capacidades hasta la salida de su operación real con funciones compartidas con el productor, AUD05 derivado de la evidencia, crédito de robo con procedencia común y evidencia final verificable): [`motor17b.md`](motor17b.md) · [evidencia](evidencia-motor17b/00-LEEME.md) · [diccionario](evidencia-motor17b/DICCIONARIO.md) · [resumen operativo](evidencia-motor17b/RESUMEN-OPERATIVO.md) · [recorrido manual](../prompts/MOTOR-17B-recorrido-manual.md).
- **MOTOR-18** (familiaridad táctica, roles, posiciones y aprendizaje: conocimiento por jugador, ajuste único en calidad y avance presionado, aprendizaje/retención, laboratorio de sesión, corrección de sensibilidad y AUD11): [`motor18.md`](motor18.md).
- **MOTOR-18B** (cierre de familiaridad y curva de Polivalencia: Preparación sobre la copia activa, bloqueadores en los participantes, secuencias persistidas, exposición terminada, sesiones válidas, estimación coherente, unidades y curva lineal por tramos de cinco anclajes): [`motor18b.md`](motor18b.md).
- **Utilidades documentales** (`scripts/docs/`): descritas en [`../exportados/README.md`](../exportados/README.md).

## Pendiente (no existe aún)

- Base de datos, manager, CI y despliegue: no existen. Cuando se implemente algo, se documentará aquí lo real (no lo deseado), enlazando al diseño funcional en [`../motor/README.md`](../motor/README.md).
