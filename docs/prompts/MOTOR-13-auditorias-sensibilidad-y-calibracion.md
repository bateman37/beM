# MOTOR-13 — Auditorías, sensibilidad y calibración

> Prompt para Claude Code en **beM**. Objetivo: convertir partidos y lotes en evidencia revisable sobre coherencia, efecto de capacidades/tácticas y calidad del comportamiento del motor, con ajustes declarados desde tablas administrables.
>
> La entrega incluye un primer ciclo real de evaluación. No basta con añadir un panel vacío; tampoco se declara calibrado todo el motor por completar una batería pequeña o reproducir un marcador.

## Índice

1. [Mandato y normas](#1-mandato-y-normas)
2. [Base real y aprendizaje de MOTOR-12](#2-base-real-y-aprendizaje-de-motor-12)
3. [Resultado esperado y alcance](#3-resultado-esperado-y-alcance)
4. [Modelo común de auditoría](#4-modelo-común-de-auditoría)
5. [Catálogo AUD01–AUD32](#5-catálogo-aud01aud32)
6. [Cobertura, estados y severidad](#6-cobertura-estados-y-severidad)
7. [Sensibilidad de las 32 capacidades](#7-sensibilidad-de-las-32-capacidades)
8. [Contrastes tácticos y estados](#8-contrastes-tácticos-y-estados)
9. [Probabilidades, resultados e incertidumbre](#9-probabilidades-resultados-e-incertidumbre)
10. [Referencias y bandas](#10-referencias-y-bandas)
11. [Monopolios, bucles y efectos duplicados](#11-monopolios-bucles-y-efectos-duplicados)
12. [Coste, ingestión y reutilización de evidencia](#12-coste-ingestión-y-reutilización-de-evidencia)
13. [Campaña inicial de partidos completos](#13-campaña-inicial-de-partidos-completos)
14. [Primer ciclo de calibración](#14-primer-ciclo-de-calibración)
15. [Panel de auditorías y ajustes](#15-panel-de-auditorías-y-ajustes)
16. [Paquetes, informes y trazabilidad](#16-paquetes-informes-y-trazabilidad)
17. [Deuda heredada y frontera de cierre](#17-deuda-heredada-y-frontera-de-cierre)
18. [Versiones, neutralidad y compatibilidad](#18-versiones-neutralidad-y-compatibilidad)
19. [Verificación automática acotada](#19-verificación-automática-acotada)
20. [Recorrido manual para Dennis](#20-recorrido-manual-para-dennis)
21. [Documentación y entrega](#21-documentación-y-entrega)
22. [Criterios de aceptación](#22-criterios-de-aceptación)

## 1. Mandato y normas

Implementa el catálogo de auditorías, el análisis contextual de las 32 capacidades y el flujo de calibración desde el laboratorio existente. El motor continúa resolviendo acontecimientos dentro de posesiones; el objetivo de evaluación es el partido completo con sus tácticas, jugadores, dirección y acta conectados.

Reglas obligatorias:

- Trabaja exclusivamente en beM. No inspecciones `v-apps`, Basket Manager, BeManager, ZenGM ni otros repositorios. Puedes consultar las fuentes públicas explícitamente necesarias, con procedencia.
- No construyas un simulador de acciones aisladas como sustituto de partidos completos ni otro resolutor para calibrar. No añadas ticks, trayectorias o movimiento continuo.
- Reutiliza lotes y paquetes de MOTOR-12, consultas de MOTOR-10, población/escenarios de MOTOR-11 y panel de parámetros.
- No añadas capacidades, un overall, una nota universal del jugador/entrenador, bonus de experiencia o puntos evitados contrafactuales.
- Una auditoría lee hechos y calcula diagnósticos. No corrige automáticamente un marcador ni altera un partido observado.
- Un error de invariante, una señal estadística, una referencia externa poco comparable y una falta de exposición son estados distintos.
- No impongas que cada atributo/táctica mejore cada marcador. Revisa mecanismo, tarea, exposición, coste y resultado pertinentes.
- Mantén originales, snapshots, perfiles y baselines. Candidatas explícitas y activación manual desde el panel; nada de migraciones silenciosas.
- La prueba de desarrollo será acotada. No ejecutes 32 lotes por tener 32 capacidades, ni 32 campañas por el catálogo AUD. Dennis hará mucho test manual y podrá ampliar muestras desde la UI.
- No cambies stack, base de datos, infraestructura, ni instales un servicio de IA o entrenamiento automático de modelos.
- No hagas resets destructivos, no reescribas historial, no fusiones ni te suscribas a la PR y no envíes mensajes a terceros.

El tamaño orientativo sigue siendo aproximadamente la mitad de una ventana de cinco horas de Claude Code. No puedes prometer o inventar una medición de cuota. No añadas simulaciones para consumirla. Si un límite real impide terminar, registra el estado de cada bloque y un punto de continuación preciso.

## 2. Base real y aprendizaje de MOTOR-12

### 2.1 Comprobar la base

El informe sitúa MOTOR-12 en la PR `bateman37/beM#13`, abierta sin fusionar. Dennis comunica la implementación, pero este mensaje no confirma expresamente la fusión.

- Si `main` ya lo contiene, crea desde esa base actualizada la rama de MOTOR-13.
- Si sigue en su rama y está disponible, parte de su commit real y documenta PR dependiente; no lo fusiones por tu cuenta.
- Si no hay base accesible con MOTOR-12, identifica la dependencia. No reimplementes sus lotes desde el informe ni finjas que el motor anterior tiene la extracción completa.

Rama propuesta: `feature/MOTOR-13-auditorias-y-calibracion`, o la impuesta por el entorno. Conserva rama y commit base efectivos.

### 2.2 Estado declarado que debes verificar

- Suite 161/161; doce pruebas nuevas de MOTOR-12.
- `data:check` y comprobación documental correctos.
- Referencia `20261016`: 83–103 y 6.505 sorteos, misma `trajectory_fp` en registro completo y reducido.
- Lotes persistidos en `out/batches/<lote>/`, raíz configurable por `BEM_BATCH_ROOT`; `indice.jsonl` es la fuente de verdad del controlador.
- Límite técnico de 5.000 ejecuciones por lote.
- Paquete diagnóstico `beM-analysis-package/1`, comprobador de quince controles y formatos deportivos existentes.
- Lote de cierre `LOT-c268fba2`: cinco casos × dos variantes, diez terminados válidos, sin fallos.
- Paquete de cierre: índice más nueve partes, 27,5 MiB comprimidos y 378,6 MiB sin comprimir.

Estas son afirmaciones del informe, no comprobaciones ejecutadas por ti. Si los archivos del lote no están presentes por estar fuera de Git, registra su ausencia; no afirmes haber analizado sus trazas por leer el resumen.

### 2.3 Mediciones que condicionan el trabajo

Entorno del informe: cuatro CPU, Node 22.22. Completo ≈6,1 s/partido y ≈36,9 MiB sin comprimir; reducido ≈1,2 s y ≈3,5 MiB. Decisiones: 82 % del volumen. Paquete de cierre: 24 s de construcción y 16–17 s de comprobación.

Usa estas cifras como mediciones de esa ejecución, no promesas para otro equipo. Reutiliza evidencia, lee por bloques y reserva diagnóstico completo para lo que lo necesita. La optimización final es MOTOR-14.

### 2.4 Lección AN08 y límites

MOTOR-12 corrigió un falso positivo del lector: una posesión mixta para dos quintetos marcaba un partido válido como inválido. Conserva la regresión. No restaures la identidad falsa de repartir una posesión completa a cada cinco participante.

Antes de tocar una probabilidad, distingue defecto de simulación, de productor, de lectura, de agregación y de regla de auditoría. Una alerta roja no demuestra cuál de ellos falló.

El 404 anterior no se reprodujo y el favicon no quedó demostrado como causa; no reabras esa búsqueda sin nueva evidencia. Reinicio/fallos del controlador se probaron con ejecutor sintético, no con partidos naturales fallidos: conserva ese alcance.

### 2.5 Lectura dirigida

Normas raíz, índice, roadmap, estado y documentación MOTOR-12. Después:

- Funcional de auditorías y aceptación, capítulo 28 del unificado.
- Catálogo AUD01–AUD32, C01–C65 y A06-01–A06-60: relaciones, no 157 tests únicos obligatorios.
- Mapa de 32 capacidades y tareas, estados, libro, defensa, memoria y controles pertinentes.
- Inventario REF01/REF02/LAB01, EST y soportes SUP.
- `docs/tecnico/motor12.md`, IMP-M12-01, comprobador, índice de lotes y esquemas reales.
- Registros/datos de los partidos que vas a estudiar y productor/cálculo específico cuando una anomalía lo requiera.

Los adjuntos históricos `DESIGN(1).md` y `CLAUDE.odt` no sustituyen el funcional vigente. Este encargo se preparó con ese funcional y el informe, sin afirmar una auditoría del código de la PR.

## 3. Resultado esperado y alcance

Debe poderse:

1. Seleccionar auditorías por pregunta, cobertura y coste estimado medido.
2. Analizar un partido, un lote almacenado o un paquete verificable de MOTOR-12 sin resimularlo.
3. Ver evidencia disponible/faltante de cada una de las 32 capacidades.
4. Preparar contrastes de capacidad/táctica/estado mediante escenarios y lotes existentes.
5. Distinguir cálculo local bajo contexto fijo y comportamiento observado en partidos.
6. Detectar incoherencias, concentraciones, bucles y duplicidades con hechos navegables.
7. Comparar distribuciones y referencias con unidades/población compatibles.
8. Proponer una candidata acotada de parámetros desde el panel y evaluarla frente a una base congelada.
9. Guardar resultados, decisión y límites junto a versiones/perfiles.
10. Descargar evidencia e informe para revisarlo con Dennis/ChatGPT.

La entrega ejecuta una campaña inicial y un ciclo de revisión reales. Puede concluir mantener la base si no hay justificación suficiente para cambiar cifras. No se exige inventar una calibración o una mejora para que el título de la entrega parezca cumplido.

El cierre exhaustivo de rendimiento, cobertura pendiente y contratos para el manager sigue siendo MOTOR-14. Una función exigida ausente sigue pendiente aunque tenga una ficha de auditoría.

## 4. Modelo común de auditoría

### 4.1 Definición declarativa

Cada auditoría contiene ID, nombre, pregunta, hipótesis, tipo de control, entradas necesarias, productores/cobertura, escenarios sugeridos, indicadores/universos, referencias, tolerancias, severidad, coste conocido, evidencia y regla de interpretación.

No hace falta una función, pantalla o simulador por cada ID. Reutiliza operaciones compartidas de validación, consulta y comparación, con datos administrables.

La ficha de una ejecución conserva base/candidata, cambios, población, semillas, versión, muestra real, controles ejecutados, hallazgos, limitaciones y conclusión. Diferencia definición de auditoría de resultado de ejecutarla.

### 4.2 Ejecución sobre evidencia

Un auditor recibe hechos/consultas/versiones congeladas y los permisos correspondientes. No llama al entrenador ni solicita RNG del partido. Abrir un hallazgo no actualiza estados del encuentro.

Antes de evaluar, valida integridad del lote/paquete y cobertura de los campos. Analizar una parte aislada no equivale a analizar todo el lote; registra alcance y dependencias ausentes.

### 4.3 Hallazgo navegable

Como mínimo: ID, auditoría/regla, severidad, sujeto, universo, conteos/esperado/observado, versiones, motivo, estado y evidencias. Las evidencias enlazan partido/intento, secuencia, posesión/F/ejecución, decisión y filas de parámetros pertinentes.

Guarda conteos completos y referencias necesarias. La UI puede mostrar pocos ejemplos representativos con acceso al resto. No necesita imprimir cientos de megabytes de JSON en la respuesta ni en la pantalla.

## 5. Catálogo AUD01–AUD32

Precarga todas las familias acordadas. Cada una debe tener un evaluador o una evaluación parcial con requisitos/faltantes explícitos; una descripción textual sin consumidor no es auditoría implementada.

| ID | Pregunta operativa | Evidencia/evaluación mínima |
|---|---|---|
| AUD01 | Administración y acta | Conciliaciones y consecuencias del perfil implementado; cobertura normativa aparte. |
| AUD02 | Posesiones y continuidad | Inicio/cierre, rebote ofensivo, reanudación, origen y F sin duplicidad. |
| AUD03 | Relojes y ventanas | Orden temporal, consumo, solicitudes frente a aplicación y recursos. |
| AUD04 | Perfiles y datos | Tipos, referencias, sumas, curvas, herencia y valores efectivos. |
| AUD05 | Uso de las 32 capacidades | Mapa, exposición, contribución y sensibilidad contextual. |
| AUD06 | Selección frente a ejecución | Disponibilidad/percepción/elección/ejecución/conversión, sin fases inventadas. |
| AUD07 | Libro y prioridades | Niveles 1–5, empates, elegibilidad y equivalencia semántica de fichas. |
| AUD08 | Libertad y director | Iniciativa, lectura, rol, preferencias y decisiones efectivas. |
| AUD09 | Juego espontáneo | Exposición y decisiones ESP01–20 reales; sin cuotas por etiqueta. |
| AUD10 | Estilos ofensivos | Efecto en selección, tiempo y coste, no solo en un valor declarado. |
| AUD11 | Organizaciones defensivas | Responsabilidades/recepciones/calidad concedida y planes completos/mixtos. |
| AUD12 | Presión y ayudas | Avance, pérdidas, tiempo/carga y concesión al superar presión. |
| AUD13 | Oportunidad y oposición | Calidad previa, participantes reales y separación del acierto. |
| AUD14 | Finalización y preparación | TEC03/TEC04 y TEC06/distancia; tarea pertinente, sin doble puntería. |
| AUD15 | Rebote y balance | Cierre/acceso/captura, rol sin balón y transición posterior. |
| AUD16 | Tiempo y exposición | Riesgo/gasto por intervalo pertinente, sin multiplicarlo por frases. |
| AUD17 | Curva de energía | 100–70 casi neutro y deterioro creciente/crítico en tareas sensibles. |
| AUD18 | Rotación contextual | Valor del fatigado/recambio, estabilidad y motivos de cambio. |
| AUD19 | Librillo de faltas | Regla, excepción, urgencia, recambio y límite legal. |
| AUD20 | Forma y experiencia | Estados de entrada, veteranos útiles y límites físicos; sin bonus de edad. |
| AUD21 | Consistencia/momento individual | Persistencia, variación y neutralidad bajo el protocolo pertinente. |
| AUD22 | Momento colectivo | Aplicaciones permitidas, episodios y coordinación, no aura de tiro. |
| AUD23 | Presupuesto de estados | Lugares de aplicación, límites y ausencia de un tercer bonus de racha. |
| AUD24 | Tiempos muertos | Motivo, efectos únicos y antes/después descriptivo, sin garantía. |
| AUD25 | Memoria y repetición | Claves, exposición, decaimiento, respuestas A/B y cuarta repetición posible. |
| AUD26 | Saques y finales | Receptor real, secuencia directa/continuidad, reloj y decisiones. |
| AUD27 | Estadística/universos | Tasas, estimaciones, mixtas, administrativos y correcciones. |
| AUD28 | Visibilidad/dirección | Entrada permitida de humano/IA, informes y export por audiencia. |
| AUD29 | Modos y continuación | Igualdad bajo mismas entradas/órdenes; límites de snapshot explícitos. |
| AUD30 | Población y estilos | Escala, contrastes, generación y ausencia de homogeneización/bonus. |
| AUD31 | Partidos y colas | Ritmo, producción, reparto, errores, extremos y variedad por contexto. |
| AUD32 | Conservación y coste | Datos necesarios, integridad, crecimiento por acontecimientos y coste medido. |

Una misma evidencia puede alimentar varias familias. No la cuentes como múltiples partidos ni dupliques hallazgos idénticos bajo cinco nombres.

## 6. Cobertura, estados y severidad

### 6.1 Estado de requisito y resultado

Mantén ejes separados:

- Implementación del mecanismo: ejecutable, parcial, ausente.
- Registro: suficiente, parcial, no registrado.
- Exposición: observada, insuficiente, no observada, no aplicable.
- Resultado: conforme al control, defecto demostrado, señal para revisar, inconcluso, no evaluado.
- Revisión humana: pendiente, revisado, aceptado/descartado con motivo.

No convierte `sin datos` en verde, ni una muestra pequeña en fallo, ni «no se observó una técnica» en «técnicas implementadas correctamente».

### 6.2 Severidad

- **Error determinista:** relación imposible, resultado incompatible con regla implementada, RNG/estado alterado por un lector o participantes inexistentes. Un solo caso confirmado basta para corregirlo.
- **Aviso de cobertura:** falta productor, normativa no verificada, parte ausente o universo no reconstruible.
- **Señal deportiva/estadística:** concentración, desviación o comportamiento extraño que requiere exposición/contexto.
- **Información:** conteos, extremos y patrones que no implican defecto.

Las alertas blandas no hacen inválido un partido que cumple su contrato. La validez del experimento tampoco demuestra realismo de todas sus probabilidades.

### 6.3 Clasificación de causa

Al confirmar una anomalía distingue simulación, administración, productor, lector, agregado, referencia, auditor o interfaz. Registra evidencia mínima que permita reproducirla.

AN08 debe quedar como caso de lector/auditor corregido. Si el mismo ataque mixto aparece en dos tablas contextuales legítimas, no lo elimines del motor para que una suma equivocada coincida.

## 7. Sensibilidad de las 32 capacidades

### 7.1 Matriz obligatoria

Una fila por capacidad y tarea/rol pertinente, con:

- ID/nombre y sujeto propietario.
- Mecanismo declarado y filas que lo consumen.
- Exposición registrada, usos efectivos y contribuciones disponibles.
- Valor base/efectivo, peso o lugar real de aplicación.
- Saturaciones/límites y situaciones donde no debe influir.
- Contraste de cálculo fijo si se puede hacer con operaciones existentes.
- Contraste de partidos disponible, muestra y límite de interpretación.
- Estado/faltantes y evidencia navegable.

No basta con hallar el nombre del atributo en un archivo. No tiene que intervenir cada capacidad en cada partido: sin libres no hay exposición a Tiro libre.

### 7.2 Mapa de pertinencia

Contrasta los IDs con el diccionario actual, manteniendo exactamente estas 32:

| ID | Capacidad | Qué revisar |
|---|---|---|
| TEC01 | Triple | Ejecución de tres y amenaza en decisiones donde corresponda. |
| TEC02 | Media distancia | Su ejecución pertinente, no todo tiro de dos. |
| TEC03 | Tiro interior | Finalización estable próxima, no entrada en movimiento por etiqueta. |
| TEC04 | Finalización en movimiento | Llegada al aro, corte/continuación/transición pertinentes. |
| TEC05 | Tiro libre | Libres válidos y presión/estados aplicables. |
| TEC06 | Tiro en movimiento | Preparación tras bote/salida; no otra puntería universal. |
| TEC07 | Manejo | Avance, protección y separación con balón. |
| TEC08 | Pase | Emisor real, ventana/riesgo y ejecución de envío. |
| TEC09 | Bloqueos | Pantalla legal/útil y su participante; no AS oficial del bloqueador. |
| TEC10 | Movimiento sin balón | Oferta/recepción/desmarque reales. |
| TEC11 | Poste | Posición/recursos de poste; técnica final pertinente por separado. |
| TEC12 | Defensa perimetral | Contención/oposición exterior pertinente. |
| TEC13 | Defensa interior | Posición/ayuda/oposición interior. |
| TEC14 | Robo | Intervención sobre balón accesible; no crea acceso ni segundo sorteo. |
| TEC15 | Tapón | Acceso/intervención legal y tiro elegible. |
| TEC16 | Defensa de bloqueos | Seguimiento/recuperación y respuesta actual. |
| TEC17 | Cierre de rebote | Limitar acceso; captura del compañero no demuestra por sí sola utilidad. |
| TEC18 | Captura de rebote | Oferta/acceso/control; no duplicar cierre. |
| FIS01 | Velocidad | Avance/retorno/persecución cuando distancia funcional importa. |
| FIS02 | Aceleración | Primer paso, ayuda, recuperación y acceso corto. |
| FIS03 | Agilidad | Dirección/contención/navegación. |
| FIS04 | Fuerza | Contacto pertinente, sin duplicación oculta por peso. |
| FIS05 | Salto | Acceso vertical donde puede llegar; alcance no es otro salto. |
| FIS06 | Resistencia | Gasto por intervalo/carga; no bonus directo de tiro. |
| FIS07 | Equilibrio | Estabilidad/protección/preparación comprometida. |
| MEN01 | Comprensión táctica | Función/preparación/coordinación pertinente. |
| MEN02 | Visión | Opciones/amenazas percibidas, con conocimiento permitido. |
| MEN03 | Decisiones | Elección entre opciones percibidas; no precisión técnica. |
| MEN04 | Anticipación | Preparación/lectura pertinente sin futuro garantizado. |
| MEN05 | Concentración | Atención/errores de tarea sin crear disciplina universal. |
| MEN06 | Consistencia | Amplitud de fluctuación, no talento medio automático. |
| MEN07 | Rendimiento bajo presión | Alteración por presión, sin reemplazar la capacidad técnica. |

Las contribuciones corporales están fuera de las 32 y se revisan por separado, con edad/peso sin bonus deportivo directo si la base mantiene esa decisión.

### 7.3 Tres niveles de evidencia

**A. Observación de partidos:** qué se usó y qué pasó en los encuentros reales.

**B. Contraste de cálculo bajo contexto fijo:** sobre una operación ya observada, conservar sus entradas y variar una capacidad +1/+3/+5, respetando límite 30. Invocar la misma operación pura de combinación/probabilidad/tiempo/gasto, sin sortear desenlaces ni cambiar el partido original.

**C. Contraste de partidos completos:** entradas/variantes declaradas con las mismas semillas de casos; medir oportunidades, decisiones, ejecución y costes, admitiendo divergencia posterior del RNG.

B prueba una relación del cálculo en ese contexto, no un resultado que ocurrió ni cuántos puntos habría añadido el jugador. C observa el sistema completo y no aísla automáticamente el mérito de cada capacidad si cambian varias.

No implementes un segundo juego para B. Reutiliza cálculos comunes; si hace falta extraer una función pura de un bloque existente, conserva semántica y comprueba neutralidad. No vuelvas a ejecutar el resolutor con RNG o getters que actualicen estados.

### 7.4 Muestra de cálculos, no recorte de los paquetes

Para evitar millones de recomputaciones, usa como precarga hasta 24 contextos registrados por capacidad, seleccionados de forma determinista por tarea/actor/fase antes de mirar el acierto. Incluye límites/contextos donde no debe influir si están disponibles.

Registra el criterio y la cobertura de esta selección analítica. Los registros originales MOTOR-12 permanecen completos; no se recortan para ahorrar el análisis. La matriz agrega todos los usos observados, aunque los contrastes B usen esa muestra declarada.

Si un cálculo no puede aislarse con el contrato actual, marca la dependencia exacta. No inventes una derivada ni copies otra fórmula para aparentar sensibilidad.

### 7.5 Dirección y límites

- Aumentar defensa puede reducir una probabilidad rival: documenta sujeto y significado del resultado, no solo signo numérico.
- Pesos normalizados pueden redistribuir opciones sin mejorar todas. No exijas monotonía de todos los porcentajes a la vez.
- Atributo ya en 30 implica incremento efectivo cero; una probabilidad limitada puede saturarse. Distingue saturación de desconexión.
- Resistencia afecta desgaste futuro; no es un fallo que no cambie el siguiente tiro bajo energía fijada.
- Consistencia/Presión usan sus protocolos y estados, no se evalúan como «más valor → más puntos siempre».
- Un cambio en selección puede bajar volumen propio y mejorar calidad colectiva, o producir otro coste. No se decide solo por PTS.

Detecta uso declarado pero no aplicado, actor equivocado, peso nulo no explicado, exposición incorrecta y constantes que anulan el efecto. Una ausencia sin exposición no se clasifica como atributo muerto.

## 8. Contrastes tácticos y estados

Prepara doce experimentos reutilizables mediante LAB y lotes. Son datos/escenarios, no doce motores. La intervención y variables conservadas se muestran antes de lanzar.

| ID | Contraste inicial | Qué examinar |
|---|---|---|
| EXP13-01 | TEC08 +3 en directores seleccionados frente a base | Pérdidas de pase, ventanas, creación y selección; no AS como único efecto. |
| EXP13-02 | TEC01 +3 en finalizadores exteriores seleccionados | Conversión condicionada y cambios de atención/elección si están modelados. |
| EXP13-03 | MEN02/MEN03 +3 al mismo director | Percepción/elección y calidad; intervención en dos capacidades declarada. |
| EXP13-04 | Libertad 1 frente a 5, mismo libro/plantilla | Prioridades, autonomía, lectura, reloj y riesgo. |
| EXP13-05 | Individual frente a 2–3, mismos jugadores | Responsabilidades, recepción/tiro concedidos y costes, no factor genérico de zona. |
| EXP13-06 | Presión normal frente a tres cuartos | Tiempo/errores de avance, carga y concesión al superarla. |
| EXP13-07 | Después del tiro 2 frente a 4 | Rebote ofensivo, balance y transición rival, con ofertas/fallos comparables. |
| EXP13-08 | Referencia EQ11 con energía 100 frente a 30 | Valor actual/relevo y efectos físicos; sin retirada obligatoria por 30. |
| EXP13-09 | Forma −0,5 frente a +0,5 en el mismo actor | Estado persistente de entrada y tareas pertinentes; energía/momentos iguales. |
| EXP13-10 | Consistencia 10 frente a 24 en el mismo actor | Variación/episodios, complementados por protocolo neutral fijo. |
| EXP13-11 | T colectivo inicial −0,5 frente a +0,5, resto igual | Coordinación/tareas autorizadas y presupuesto compartido, sin bonus directo de tiro. |
| EXP13-12 | Política cauta frente a agresiva, misma plantilla/plan/contexto | Rotación, faltas, pausas, ajuste y riesgo contextual, no talento del entrenador. |

Mapea escalas a las vigentes si difieren, con conversión explícita. Selecciona participantes/IDs al preparar el experimento y congélalos. No elijas después los que mejoraron para sostener la hipótesis.

El resto del catálogo se estudia reutilizando partidos/trazas, reglas y controles compartidos: prioridades empatadas, disposiciones, coberturas, saques, ESP, memoria A/B y fines. No ejecutar un contraste nuevo no autoriza a marcarlo empíricamente demostrado.

### 8.1 Neutralidad de Consistencia

Reutiliza el protocolo de MOTOR-07: contexto fijo, estados iniciales neutrales y episodios fuera del contraste cuando corresponde; comprobar la salida final de probabilidad, no únicamente media cero de una innovación en logit.

Las innovaciones opuestas pueden servir para comprobar simetría del mecanismo. No exige igualdad de rendimiento en partidos con episodios, selección o estados iniciales distintos. El banquillo atenúa hacia neutral sin ruido según la precisión aceptada; no lo cambies para generar variación artificial.

### 8.2 Energía, presión y T

Consulta curvas reales y puntos de aplicación. Energía 100–70 debe conservar la casi neutralidad acordada en tareas sensibles, y menos de 10 deteriorar considerablemente sin fallo total impuesto. No restes igual a las 32 capacidades.

Presión e importancia no son el filtro estadístico final ajustado. La importancia ordinaria 0,25 y su efecto en MEN07 siguen siendo SEM: documenta la alteración, no la neutralices por intuición.

T solo interviene en los ámbitos permitidos. Un parcial o una etiqueta de líder no puede añadir otro bonus a compañeros. Una pausa no borra memoria ni garantiza cortar una racha.

### 8.3 Memoria y repetición

Revisa capacidad 8, claves semánticas, decaimiento, exposición/reconocimiento y respuestas autorizadas/compatibles/aplicadas. No conviertas cada revisión en otro patrón.

Una defensa que ya contiene una salida puede no cambiar. Cuarta repetición puede funcionar; no impongas un fallo ni una penalización directa por ordinal. Renombrar una ficha equivalente no debe borrar señal ni multiplicar masa ofensiva.

## 9. Probabilidades, resultados e incertidumbre

### 9.1 Consistencia interna no es realismo

Compara probabilidades realmente consumidas y resultados de sus sorteos. Si un modelo asigna una probabilidad deportiva inadecuada y después la cumple, su RNG puede ser coherente y el baloncesto seguir mal calibrado.

Separa coherencia matemática, consistencia de muestreo, pertinencia deportiva y contraste externo. No optimices un score sobre los propios resultados sintéticos para afirmar que el mundo real lo valida.

### 9.2 Unidad correcta

Para cada decisión binaria consumida, conserva `p_i` final antes del sorteo y `y_i` de esa decisión. No uses la probabilidad anterior a estados ni el marcador final como etiqueta de una intervención intermedia.

Ejemplos: intento de robo dado acceso no es robo acreditado; resultado de lanzamiento sorteado no es idéntico a FGA validado después de todas las incidencias. Excluir por un resultado posterior puede sesgar esta auditoría.

Para categorías excluyentes usa la distribución completa de esa decisión. Para canasta y falta compatibles conserva su relación condicional. No trates todas las etiquetas como un multinomial ni sumes probabilidades compatibles como si fueran exclusivas.

### 9.3 Lectura inicial sencilla

Por mecanismo/contexto previo: n, número de partidos, media de p, observados, esperados `sum(p_i)`, diferencia observados−esperados y exposiciones. En multinomial, lo mismo por categoría con las sumas correspondientes.

Diagrama de fiabilidad con cinco intervalos fijos: `[0, 0.2)`, `[0.2, 0.4)`, `[0.4, 0.6)`, `[0.6, 0.8)`, `[0.8, 1]`, usando punto decimal también en datos; la última frontera incluye 1. Muestra media de p, frecuencia y n por intervalo, sin interpolar observaciones inexistentes.

Brier binario descriptivo: `media((y_i−p_i)^2)`, solo sobre decisiones compatibles. No lo conviertas en una nota global del motor ni en prueba suficiente de calibración.

Las probabilidades 0/1 y su resultado incompatible constituyen un control determinista si el registro corresponde a la decisión exacta y no a otro hecho posterior. El resto de desviaciones requiere muestra/contexto: no fijes un fallo por cada fluctuación.

### 9.4 Incertidumbre proporcionada

Muestra distribución por partido y comparación de casos emparejados cuando exista. Los acontecimientos de un mismo partido comparten contexto; no los presentes automáticamente como miles de observaciones independientes equivalentes.

No son necesarios p-valores, bootstrap masivo, correcciones múltiples automáticas ni intervalos causales para cerrar esta entrega. Si se ofrece un intervalo binomial, debe corresponder a un ensayo binario y supuestos documentados; no se aplica de forma indiscriminada a eventos heterogéneos o agrupados.

Una regla de alerta de muestra es una preferencia editorial SEM, no certifica significación. Ninguna línea de fiabilidad se rellena con cero cuando no hubo decisiones elegibles.

### 9.5 Referencias metodológicas consultadas para este encargo

- scikit-learn, documentación oficial de calibración: <https://scikit-learn.org/stable/modules/calibration.html>. Apoya la lectura de diagramas por intervalos y la distinción entre fiabilidad y otros componentes del Brier. No se propone instalar la librería ni entrenar un calibrador.
- NIST/SEMATECH, intervalos de proporciones: <https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm>. Referencia metodológica para no dar precisión injustificada a muestras pequeñas bajo un modelo binomial.

Estas referencias orientan el análisis; no son frecuencias de baloncesto ni fijan el acierto que debería tener beM.

## 10. Referencias y bandas

### 10.1 REF01/REF02

Toda referencia identifica fuente, fecha/temporada, población/nivel, reglas, muestra, definición, numerador/denominador, unidad, distribución disponible y comparabilidad. Distingue:

- Dato externo medido y verificado.
- Banda/expectativa de diseño SEM.
- Referencia candidata con fuente localizada pero datos no extraídos.
- Sin referencia comparable.

No inventes una «media FIBA» ni una banda min/máx por memoria. No conviertas p0 condicionada de una receta en porcentaje final esperado de una liga.

### 10.2 Fuentes deportivas candidatas

Páginas oficiales localizadas para contrastes futuros/complementarios:

- EuroBasket 2025: <https://www.fiba.basketball/en/events/fiba-eurobasket-2025/stats>.
- Mundial FIBA 2023: <https://www.fiba.basketball/en/history/201-fiba-basketball-world-cup/208182/stats>.

En la preparación de este encargo se localizaron, pero el acceso directo devolvió 403; **no se han extraído de ellas medias ni bandas**. Cárgalas como fuentes candidatas, no referencias numéricas aprobadas.

Reutiliza primero referencias ya verificadas del repositorio con sus unidades/población. Si completas una extracción oficial accesible, conserva los datos/fecha/alcance y calcula tasas desde conteos compatibles, distinguiendo promedios de equipo de promedio global.

La población ficticia EQ01–12 no se declara equivalente a selecciones de élite. Reglas 2026, anotación, bonus y categorías pueden diferir de una temporada anterior. Posesiones estimadas externas no son posesiones beM exactas. Transición/contraataque y AS tienen convenciones que deben mapearse.

### 10.3 Comparar distribuciones

Muestra centro, dispersión, colas y segmentos por plantilla, plan, director y rival. No fuerces que un equipo exterior y uno interior compartan frecuencia de triple o ritmo.

Una banda de diseño o referencia externa genera una señal explicable, no un clamp al marcador ni una corrección durante el partido. Un extremo se abre para revisión, no se elimina de la muestra.

Si no hay referencia externa comparable, la calibración inicial puede documentarse como evaluación funcional/SEM; no se certifica validación externa completa.

## 11. Monopolios, bucles y efectos duplicados

### 11.1 Concentración con contexto

Revisa participación por familia, actor, prioridad, sector y recurso. Precarga de aviso SEM: una familia supera 80 % de las ejecuciones elegibles o un jugador 60 % de las F de su equipo, con al menos 40 unidades del denominador y presencia en tres partidos.

Es un aviso, no un defecto. Un libro de una ficha o EQ11 pueden producir concentración buscada. Examina alternativas elegibles, plan, cobertura, coste, negaciones y calidad; no redistribuyas cuotas para que todo salga equilibrado.

Distingue ausencia de exposición de opción descartada sistemáticamente por un filtro erróneo o peso nulo. «No jugó POS10» no demuestra que una puerta atrás esté rota si nunca hubo negación pertinente.

### 11.2 Repeticiones y progreso

Detecta secuencias que repiten contexto/acción sin progreso deportivo ni causa legal. El reloj igual por sí solo no basta: libres, sanciones y cambios pueden consumir cero tiempo de juego.

Precarga de señal: diez revisitas consecutivas del mismo estado lógico sin avance de tiempo ni cambio causal relevante. No corta automáticamente la posesión ni la transforma en PER. Un límite técnico del ejecutor, si actúa, marca ejecución inválida con diagnóstico.

### 11.3 Presupuesto de efectos

Construye una lectura por operación y causa: dato de entrada → capacidad/selección/estado afectado → punto de consumo → resultado. Revisa:

- Energía aplicada al valor efectivo y restada de nuevo como otra fatiga general.
- Forma/momento/racha que duplican la misma alteración.
- T añadido directamente al tiro o al pase personal cuando está excluido.
- Altura/envergadura/alcance o peso/Fuerza que repiten una ventaja corporal.
- Cobertura aplicada como preparación real y además como descuento universal de acierto.
- Memoria/reconocimiento como otro castigo directo por repetición.
- Tendencia/rol que regala precisión además de seleccionar uso.
- Exposición/riesgo cobrada varias veces por subdividir el mismo acontecimiento.

No todo uso compartido es duplicidad: una capacidad puede explicar tareas diferentes. El hallazgo debe identificar causa/consumo y regla infringida; coincidencia de nombre no basta.

## 12. Coste, ingestión y reutilización de evidencia

### 12.1 Evidencia MOTOR-12

Busca el lote de cierre en la raíz configurada y verifica su índice/paquete antes de usarlo. Si existe, analízalo sin simularlo otra vez. Si falta, registra la ausencia y usa los nuevos lotes acotados; no reconstruyas diez partidos completos solo para conseguir el mismo nombre de carpeta.

Soporta auditoría de lote conservado y de paquetes/directorio verificados de MOTOR-12, con la normalización/índices ya existentes. No implementes otra plataforma de ingestión o un segundo formato incompatible.

### 12.2 Lectura progresiva

Lee JSONL/CSV por bloques y prepara proyecciones reutilizables por huella de evidencia, política de auditoría y filtros. No escanees 378,6 MiB treinta y dos veces para cada pestaña.

Conserva conteos completos y listas/índices de evidencia en archivos cuando crezcan; la UI puede paginar. No carga todas las decisiones en el navegador a la vez. No sobrescribas registros originales al producir índices de auditoría.

### 12.3 Captura proporcional

Usa reducido para distribución general y completo para contextos diagnósticos seleccionados desde el inicio. No cambies detalle retrospectivamente para fabricar valores que no se guardaron.

Una segunda ejecución explícita con detalle completo es otra ejecución con misma entrada/semilla, cuya trayectoria se compara, sin sustituir silenciosamente la original.

No se pide compresión nueva ni refactor masivo de logs. Registra el coste de análisis/export y el volumen para MOTOR-14. Los modos de registro deben mantener la neutralidad ya comprobada.

## 13. Campaña inicial de partidos completos

### 13.1 Plan congelado antes de mirar resultados

Materializa EXP13-01–12 con población, actor seleccionado, intervención, variables conservadas y métricas. Reutiliza los escenarios correspondientes, no reconstruyas a mano toda una plantilla.

Sugerencias de enfrentamiento:

- Pase/libertad: EQ01–EQ02 o EQ05–EQ06.
- Tiro: EQ02–EQ09.
- Lectura: EQ06–EQ05.
- Organización/presión: EQ10–EQ04.
- Rebote/balance: EQ03–EQ10.
- Energía/rotación: EQ11–EQ12.
- Forma/Consistencia/T: mismo escenario de referencia con actor/estado identificado.

La diferencia de poblaciones entre preguntas no se utiliza como si fuera una intervención controlada entre ellas. Dentro de cada experimento conserva sus datos salvo el cambio declarado.

### 13.2 Tamaño de construcción

Precarga para esta primera pasada: **un caso por experimento × dos variantes = 24 encuentros nuevos**. No 24 por experimento ni 32 campañas de capacidades.

- EXP13-08 y EXP13-11: cuatro ejecuciones en total con diagnóstico completo.
- Los otros diez: veinte ejecuciones en registro reducido.

Si el nivel de registro se configura por lote, usa trabajos separados del mismo controlador. Un experimento puede ser un trabajo de un caso/dos variantes; los 12 trabajos suman 24 encuentros. No hace falta ampliar MOTOR-12 con una plataforma de experimentos distribuida.

Semillas de lote iniciales: 131001–131012 en el orden de experimentos, derivando y congelando sus semillas deportivas con el procedimiento vigente. Conserva la agenda real; no elijas semillas después de observar el marcador.

Los contextos detallados disponibles del cierre MOTOR-12 se reutilizan. Si faltan, los cuatro completos nuevos proporcionan evidencia parcial; no afirmes que cubren cualquier tarea rara. Registra cómo ampliar el diagnóstico cuando una pregunta concreta lo necesite.

### 13.3 Qué demuestra esta campaña

Es una evaluación integrada inicial y prueba del recorrido de auditoría/calibración. Un caso por intervención no certifica su efecto poblacional. La evidencia estructural y de cálculo se presenta junto a la observación, sin mezclarlas como 24 réplicas de la misma hipótesis.

El panel permite ampliar repeticiones de una pregunta con los lotes existentes. No es obligatorio ejecutar 100/1.000 durante esta entrega. Una muestra insuficiente queda marcada, no se aumenta indefinidamente hasta obtener un resultado favorable.

### 13.4 Reserva de validación

Antes del primer ajuste, reserva cuatro casos de validación distintos de los exploratorios:

- EQ01–EQ02 histórico.
- EQ03–EQ09 natural.
- EQ07–EQ08 natural.
- EQ11–EQ12 natural.

Semillas de lote 132001–132004, con derivación/agenda congeladas. Si existe candidata con cambio real, ejecutar base/candidata implica hasta ocho encuentros reducidos adicionales. No uses sus resultados para repetir ciclos de ajuste hasta hacerlos pasar y llamarlos después validación independiente.

Si decides mantener la base, no es obligatorio simular copias idénticas para fingir un ajuste; documenta por qué no se lanzó la reserva o qué contraste independiente se hizo.

Los tests existentes de referencia/invariantes se reutilizan. Reporta el número real de ejecuciones nuevas y relecturas, sin duplicar las cuentas.

## 14. Primer ciclo de calibración

### 14.1 Orden de trabajo

1. Validar entrada/paquete, créditos, administración y universos disponibles.
2. Analizar distribución y mecanismos por contexto.
3. Localizar los hechos de una desviación y clasificar su causa.
4. Confirmar defecto o formular hipótesis con alternativas.
5. Elegir la fila administrable que representa esa causa, con unidad y efecto previsto.
6. Crear candidata explícita con cambio pequeño y evidencia vinculada.
7. Comprobar coherencia, exposición, efectos colaterales y, si procede, reserva de validación.
8. Recomendar mantener/cambiar/ampliar/rechazar; conservar todo y dejar activación explícita a Dennis.

No es un optimizador automático. Crear la propuesta es trabajo autorizado de esta entrega; no hace falta detenerse a pedir aprobación antes de hacerla concreta y revisable. La activación de base en la aplicación conserva la decisión explícita del usuario.

### 14.2 Defecto frente a ajuste

Si hay un error demostrado de simulación/lector/auditor, corrige el punto común y añade una regresión pequeña. No compenses un actor equivocado con p0 ni un conteo doble con una penalización al acierto.

Identifica qué versión de motor o política cambió. El resultado de un motor corregido es otra ejecución; conserva entradas/evidencia anteriores. Una corrección del auditor no modifica retrospectivamente lo ocurrido en cancha.

Si falta una capacidad causalmente prevista, corrige su conexión real conforme al funcional; no le añadas un peso simbólico para que aparezca como usada ni una prima universal a todas las tareas.

### 14.3 Presupuesto de ajustes

Para la primera pasada: como máximo una hipótesis de calibración y hasta tres filas efectivas alteradas por candidata. Prioriza un ajuste explicable frente a varias causas mezcladas.

Precargas de paso del editor, no cambios obligatorios:

- p0 binaria: ±0,01 absoluto, validando rango.
- Sensibilidad en logit por punto de capacidad: ±0,005, si esa es su unidad real.
- Factor de carga/desgaste o duración: ±5 % del valor, respetando límites/unidades.
- Pesos normalizados: edición explícita y redistribución visible; no cambies otros pesos sin mostrarlos en el diff.

No aplica esos pasos a umbrales reglamentarios, categorías FIBA o cualquier magnitud que por su nombre parezca una probabilidad. Las recetas existentes y su unidad mandan. Si la hipótesis exige otro tamaño, justifícalo y regístralo; no escondas el cambio.

No uses los números antiguos del anexo inicial si el perfil efectivo ya tiene una revisión posterior. Lee y edita la fila vigente.

### 14.4 Criterios de decisión

Una candidata es interesante si mejora el comportamiento que motivó el ajuste sin violar invariantes, introducir otra bonificación duplicada o borrar diferencias entre perfiles. Se miran selección, exposición, calidad, conversión, coste y distribución, no solo puntos medios/victorias.

No exige una victoria en cada pareja ni que todos los indicadores se muevan en el mismo sentido. La valoración guarda qué empeoró y por qué sería aceptable, o por qué se rechaza.

Un resultado contradictorio o escaso admite ampliar muestra después; no obliga a adoptar la candidata ni a seguir buscando otra hasta agotar cuota.

### 14.5 Conclusión admisible y cierre honesto

Puede concluir:

- Base mantenida, con evidencia y límites.
- Candidata recomendada provisionalmente para revisión manual.
- Candidata rechazada por efecto lateral o ausencia de mejora pertinente.
- Ajuste no evaluable por cobertura/muestra/referencia insuficiente.

El estado de calibración indica qué población/mecanismos/versiones se evaluaron. «Evaluación funcional SEM inicial» y «validación externa comparable» son alcances distintos.

No declares calibrado el motor completo si faltan reglas, productores o exposición esencial. Entrega el camino y los datos para cerrar esas limitaciones; tampoco inventes un cambio numérico para satisfacer una expectativa de actividad.

## 15. Panel de auditorías y ajustes

### 15.1 Catálogo y ejecución

Amplía Panel/Laboratorio existentes, sin crear una aplicación BI paralela:

- Catálogo AUD01–32 con filtros por área, tipo de evidencia, cobertura y coste.
- Selección de lote/partido/paquete disponible, alcance y verificación previa.
- Ejecutar/recalcular lectura sin resimular.
- Preparar un contraste mediante escenario/lote existente, mostrando cuántos encuentros lanzará.
- Estado/progreso y posibilidad de consultar resultados parciales conservados.

Los ejecutores de lectura y de nuevos partidos se identifican claramente; pulsar «analizar» no simula otro lote silencioso.

### 15.2 Resultados y matriz

Vista resumida por auditoría, más tabla de hallazgos con severidad, muestra, causa/estado y evidencia. Click abre el conjunto/partido/decisión pertinente en MOTOR-10/12 o un detalle compacto del auditor.

La matriz de 32 capacidades permite filtrar tarea, actor, fase, estado y versión. Distingue declarado, observado, aplicado, contrastado y no expuesto. Presenta incrementos efectivos, unidades y saturaciones.

Tablas/gráficos de fiabilidad, distribuciones y colas comparten consulta/filtros. No muestres una nota global «motor 92 % realista» ni un porcentaje de cobertura que mezcle mecanismos implementados, observados y validados.

### 15.3 Parámetros y candidatas

Desde un hallazgo se puede abrir la fila de parámetros, ver fuente/unidad/rango, copiar base a candidata, editar y previsualizar el diff. Ninguna recomendación escribe código o activa valores por detrás.

Conserva motivo, hipótesis, valores anteriores/nuevos, dependencias y evidencia. «Guardar candidata» no toca perfil activo, lotes congelados o encuentros históricos.

Validar, evaluar, recomendar y activar son estados distintos conforme al mecanismo existente. Dennis puede activar/retirar explícitamente, y volver a una referencia conservada.

### 15.4 Parámetros de auditoría

Mapea a REF01, REF02, LAB01, SUP01–SUP04 y catálogo AUD. Precarga SEM:

| Parámetro | Valor inicial | Alcance |
|---|---:|---|
| Contextos fijos por capacidad | Hasta 24 | Muestreo analítico declarado, originales íntegros. |
| Incrementos de sensibilidad | +1, +3, +5 | Capacidad 1–30, saturación explícita. |
| Intervalos de fiabilidad | 5 | Fronteras fijas, n y partidos visibles. |
| Aviso de muestra de fiabilidad | Menos de 100 decisiones o de 3 partidos por grupo | Cautela editorial, no prueba de precisión al superarlo. |
| Concentración de familia | >80 % | Requiere ≥40 ejecuciones y ≥3 partidos. |
| Concentración de finalizador | >60 % | Requiere ≥40 F y ≥3 partidos. |
| Repetición sin progreso | 10 revisitas consecutivas | Señal contextual, sin alterar la posesión. |
| Ejemplos iniciales de un hallazgo | Hasta 5 | Acceso paginado al resto de evidencia. |
| Nuevos encuentros exploratorios | 24 | Doce contrastes con dos variantes; no por auditoría. |
| Diagnósticos completos nuevos | 4 dentro de los 24 | EXP13-08/11, no cuatro adicionales. |
| Reserva de validación | Hasta 8 reducidos | Solo candidata real u otra razón declarada. |

Las reglas no están como constantes deportivas ocultas. Validación de rangos/referencias y correspondencia con el panel. Ningún umbral de alerta limita el partido en ejecución.

## 16. Paquetes, informes y trazabilidad

### 16.1 Salidas

Reutiliza `beM-analysis-package/1` como contenedor cuando admita extensiones compatibles y `batch:check` para integridad. Añade sección de auditoría sin alterar archivos originales ya publicados:

| Salida propuesta | Contenido |
|---|---|
| `auditoria/catalogo.json` | Definiciones/versiones de AUD y parámetros efectivos. |
| `auditoria/ejecuciones.csv` | Qué auditor se ejecutó, sobre qué evidencia, estado y cobertura. |
| `auditoria/hallazgos.jsonl` | Regla, severidad, observados/esperados, contexto y evidencia. |
| `auditoria/capacidades.csv` | 32 capacidades por tarea/actor, exposición/uso/contribución/estado. |
| `auditoria/sensibilidad.csv` | Contexto fijo, incremento real, salida/unidad antes/después, saturación y límites. |
| `auditoria/fiabilidad.csv` | Mecanismo/intervalo, n/partidos, p media, resultados y esperados. |
| `auditoria/referencias.json` | REF01/REF02, origen, comparabilidad, números reales o ausencia. |
| `calibracion/hipotesis.json` | Pregunta, base, cambios, expectativas y validación reservada. |
| `calibracion/perfiles/*.json` | Base/candidata efectivos completos y diff. |
| `calibracion/comparacion.csv` | Métricas/universos, exposición, diferencias y efectos laterales. |
| `informe-auditoria.md` | Conclusión, qué sostiene la evidencia y qué queda pendiente. |
| `cierre-motor13.md` | Cobertura real, correcciones, candidata/decisión y preparación para MOTOR-14. |

Los nombres pueden mapearse a convenciones existentes. Manifest/checksums incluyen los nuevos archivos; si el contrato de contenedor necesita otra versión, identifícala y conserva compatibilidad/rechazo claro.

### 16.2 Evidencia completa y legible

El informe enlaza al paquete/lote fuente y a sus IDs. Si se descarga un paquete de auditoría autocontenido, incluye las entradas/registros necesarios o las partes fuente correspondientes; no lo anuncies autocontenido si requiere un directorio externo que Dennis no ha incluido.

El informe breve no necesita copiar los 378,6 MiB ni los cientos de repeticiones de un perfil. Se conservan archivos/índices y consultas reproducibles para abrirlos.

Mantén la distinción entre observado, cálculo fijo hipotético e inferencia. Un dato calculado en B no se inserta en `eventos` como acción que ocurrió.

### 16.3 Revisión con Dennis/ChatGPT

Incluye guía: paquete y fuentes completas + informe de auditoría + pregunta/hipótesis + diff de perfiles + alcance de muestra + pendientes. Reutiliza el formato de MOTOR-12.

No envíes los archivos automáticamente. La descarga deja a Dennis decidir qué compartir. El recorrido manual debe permitir preparar esa entrega con evidencia y sin copiar logs a mano.

### 16.4 Permisos

Las auditorías de pesos/probabilidades/estados exactos son diagnóstico. Un hallazgo diagnóstico no se convierte en una conclusión pública que revele el libro o estados internos del rival.

Las consultas públicas/propias existentes mantienen su matriz de visibilidad. La IA deportiva no recibe información del auditor ni anticipa resultados por estar abierto el panel.

## 17. Deuda heredada y frontera de cierre

### 17.1 Matriz de pendientes

Conserva lo que realmente siga abierto:

- Perfil normativo FIBA sin contraste completo y consecuencias/casos aún no ejecutables.
- Inferioridad legal natural, tiro en vuelo/interferencia y continuación reglamentaria persistida, si faltan.
- Continuación de ventaja/desviación en asistencia sin productor.
- Estado propio por tramo u otros registros parciales.
- Lateralidad desconocida: mantenerla es la simplificación funcional aprobada donde no existe un dato; no es obligatorio inventar izquierda/derecha para cerrar un mapa.
- Recorridos manuales y entornos no ejecutados.

Cada pendiente identifica requisito, implementación/registro actual, impacto, prueba posible y acción de cierre. Distingue simplificación aceptada de requisito obligatorio ausente.

### 17.2 Qué cerrar ahora y qué preparar

Corrige defectos concretos que esta auditoría demuestre y que impidan leer/evaluar correctamente el núcleo existente. No maquilles con calibración una regla inexistente ni declares resuelto todo el reglamento por pasar sus controles actuales.

Si la solución exige un bloque funcional no implementado más amplio, delimita el trabajo para cierre. No se transfiere como «decisión deportiva nueva» cuando el funcional ya lo fijó.

MOTOR-14 no hereda un cheque en blanco: entrega inventario concreto de esos bloques y riesgos, de modo que su prompt pueda cerrar trabajo real en vez de afirmar terminado lo que falta. Si el alcance excede una entrega, debe decirlo con precisión; el número 14 no borra requisitos.

### 17.3 Revisión manual

La aceptación deportiva de Dennis se registra cuando ocurra. No se marca completada porque el usuario dijo que en sus pruebas el motor se parece al baloncesto; esa valoración es valiosa, pero no sustituye recorrer una pantalla/caso todavía pendiente.

Una muestra pequeña puede sostener un defecto determinista o una observación contextual. No se utiliza para declarar toda la calibración poblacional validada.

## 18. Versiones, neutralidad y compatibilidad

Actualiza la fuente común de versión de aplicación a MOTOR-13. Consola/cabecera coherentes y perfil, dataset, auditoría/esquema separados.

Prepara extensión de auditorías/configuración con sufijo `+SEM-MOTOR13-20261017` conforme a la convención actual. Los parámetros de auditoría no afectan al deporte. La base deportiva no cambia por añadir filas de lectura.

Una candidata que cambia pesos deportivos tiene identidad/diff propios y evaluación asociada. No sobrescribas SEM-MOTOR12 ni el baseline de trayectoria para que el test pase.

Conserva `trajectory_fp` frente a checksums/huella de entrada. Los IDs decorativos de perfil que siguen en proyecciones brutas no se usan para afirmar una diferencia de juego. Tampoco se eliminan campos funcionales para esconder un cambio real.

Antes de cualquier ajuste, el lector/auditor debe conservar 83–103/6.505 sorteos de la referencia si se confirmó esa base. Si corriges un defecto deportivo o propones una candidata, sus diferencias son ejecuciones/versiones identificadas; no se exige mantener el marcador antiguo a costa del arreglo.

No cambies `export/8` por rutina para añadir auditorías si el contrato deportivo no cambia. Paquete de análisis y resultado de auditoría pueden tener versión propia. Conserva históricos y rechazos explicados cuando haya incompatibilidad real.

## 19. Verificación automática acotada

Ejecuta suite existente, `data:check` y control documental. Añade pocos grupos útiles, no un test por AUD, capacidad, celda o contexto:

1. Catálogo/referencias: 32 familias y 32 capacidades mapeadas, estados/exposición sin falso verde y evidencia resoluble.
2. Agregación/universos: mixtas AN08, datos ausentes, tasas ponderadas y pares incompletos, reutilizando regresiones.
3. Auditor de probabilidad: p realmente consumida, condición compatible, categorías excluyentes y bins sin observaciones; muestra no confundida con prueba de realismo.
4. Sensibilidad: misma operación pura, +1/+3/+5 efectivos, saturación/actor/unidad correctos y sin mutar el contexto/RNG.
5. Estados: protocolos Consistencia, T y energía pertinentes reutilizados; no otra batería de partidos para probar su álgebra.
6. Alertas: concentración contextual no invalida el partido, bucle no confunde libres sin reloj y duplicidad necesita causa/punto de consumo.
7. Candidata: guardar/evaluar no activa, no modifica snapshots y diff/revisión se conservan.
8. Neutralidad: abrir/recalcular/exportar auditoría no cambia estado/trajectory_fp/sorteos; audiencia diagnóstica no filtra a IA/informe público.
9. Persistencia/paquete: informe/índices verificables y auditoría offline coincide con la lectura del mismo lote conservado.

Los experimentos del apartado 13 son la campaña integrada compartida. No añadas después «cinco partidos de cierre por cada auditoría». Si una regresión nueva requiere un encuentro concreto, reutiliza uno ya ejecutado cuando sea válido.

Conserva controles de neutralidad existentes y el comprobador de paquetes. Si cambias su salida, no debilites validación para aceptar campos ausentes.

## 20. Recorrido manual para Dennis

Crea `docs/prompts/MOTOR-13-recorrido-manual.md` con arranque, URL real, perfiles, evidencia/semillas, pasos, observación esperada y señales de fallo. Desde UI, sin editar código:

1. Arrancar MOTOR-13, comprobar perfil/dataset separados y activar la nueva base de lectura explícitamente si procede.
2. Abrir catálogo AUD01–32 y distinguir definición, estado y ejecución real.
3. Seleccionar lote/paquete existente, validar y analizar sin simularlo otra vez.
4. Abrir hallazgo con partido/decisión/regla y comprobar sus números.
5. Ver una auditoría inconclusa por cobertura/exposición, con el motivo.
6. Recorrer matriz de 32 capacidades, usos y contraste de cálculo con saturación; distinguirlo de un resultado real.
7. Preparar y ejecutar un experimento desde escenario existente, revisar cantidad/semillas y cambios.
8. Consultar distribución/fiabilidad con n y diferencia entre coherencia de muestreo y realismo.
9. Ver concentración/extremo contextual sin que el partido se marque inválido automáticamente.
10. Abrir la regresión de mixtas AN08 o un caso preparado identificado y verificar universos.
11. Crear candidata desde un hallazgo, previsualizar diff y validar sin activarla.
12. Revisar comparación/reserva/conclusión real; si no hubo un ajuste justificado, ver la razón de mantener base.
13. Activar/retirar solo mediante acción explícita de Dennis y conservar referencias anteriores.
14. Descargar informe/paquete y comprobar sus referencias/checksums con el mecanismo disponible.
15. Revisar inventario de pendientes para MOTOR-14 y límites de fuentes/muestra.

Casos preparados se rotulan; no falsifican una anomalía natural. No marques probado por Dennis lo que hiciste automáticamente. Si recorres Chromium, informa acciones y descargas efectivas, errores y lo no recorrido; Node 24/otros navegadores solo si se ejecutan.

## 21. Documentación y entrega

### 21.1 Archivar el prompt

Guarda este prompt íntegro en `docs/prompts/MOTOR-13-auditorias-sensibilidad-y-calibracion.md` o equivalente del catálogo. Los prompts Claude Code se entregan y conservan en MD. Estado real: recibido/en ejecución/completado técnicamente/pendiente manual.

### 21.2 Documento técnico

Crea `docs/tecnico/motor13.md` con:

- Base/commit real y dependencia de MOTOR-12, rama efectiva y alcance final.
- Mapa de 32 auditorías a consumidores, datos y UI; partes no evaluables explícitas.
- Matriz completa de 32 capacidades y pertinencia, exposición, usos, contribuciones y sensibilidad.
- Procedimiento de contexto fijo frente a partidos; qué es observado y qué es cálculo hipotético.
- Criterios estadísticos, muestras, referencias/bandas SEM y limitaciones metodológicas.
- Campaña: entradas/semillas congeladas, variantes, niveles de registro, encuentros reales y evidencia reutilizada.
- Hallazgos por tipo de causa; defectos corregidos y controles añadidos.
- Primer ciclo: hipótesis/diff/candidata o razones para mantener base, reserva y efectos colaterales.
- Coste de lectura/contraste/partidos/export y memoria/bytes observados cuando se midan.
- Flujos de panel, permisos, versiones y export/compatibilidad.
- Inventario de cierre para MOTOR-14, separación entre simplificaciones aceptadas y requisitos ausentes.
- Pruebas ejecutadas, manual pendiente y entornos no probados.

Actualiza índices/páginas temáticas, diccionario, catálogo de prompts, estado y changelog. Conserva funcional íntegro de consulta y registra precisiones/cambios con procedencia y alcance; no reescribas la historia para ajustarla a la implementación.

### 21.3 Cierre de resultados

Entrega una PR revisable sin fusionar y responde:

1. Qué puede probar Dennis: arranque/URL, perfil, auditorías, evidencia, campaña y recorrido.
2. Qué lectores/contrastes funcionan y qué preguntas pueden contestar.
3. Resultado real de cada familia, sin afirmar «32 auditorías aprobadas» por tener sus filas.
4. Cobertura de las 32 capacidades y cuáles faltan por exposición o implementación.
5. Hallazgos confirmados, corregidos, señales y referencias insuficientes.
6. Candidata/decisión inicial, cambios precisos y efecto observado; o justificación de mantener base.
7. Muestra, número de simulaciones nuevas, registro completo/reducido, evidencia reutilizada y coste real.
8. Comprobaciones reales, manual/entornos pendientes y límites de calibración.
9. Base/commit, rama y PR; inventario concreto para MOTOR-14.

No informes cuota o duración de ventana sin medición del entorno. No fusiones, suscribas o envíes mensajes. No declares terminado/calibrado todo el motor por cerrar esta entrega.

## 22. Criterios de aceptación

- [ ] Base real con MOTOR-12 y dependencia de PR identificada.
- [ ] Catálogo AUD01–32 con consumidores, cobertura/estados y evidencias reales.
- [ ] Integridad/conciliación antes de interpretación, regresión AN08 conservada.
- [ ] Error, señal, muestra insuficiente y falta de productor/norma diferenciados.
- [ ] Matriz de exactamente 32 capacidades con actor, tarea, exposición/uso/aplicación.
- [ ] Sensibilidad +1/+3/+5 contextual, saturación/unidad correctas y sin otro simulador.
- [ ] Cálculo fijo hipotético separado de lo observado en partidos completos.
- [ ] Doce experimentos preparados, campaña inicial acotada y semillas congeladas.
- [ ] Energía, Forma, Consistencia, presión y T auditados en sus ámbitos sin bonificaciones duplicadas.
- [ ] Libro/estilos/defensa/autonomía/memoria revisables con coste y concesiones.
- [ ] Fiabilidad sobre probabilidades consumidas, sin etiquetas posteriores incompatibles.
- [ ] Referencias externas/SEM/ausentes separadas; ningún rango empírico inventado.
- [ ] Concentración/bucles/duplicidades con contexto, sin imponer cuotas o resultados.
- [ ] Reutilización de evidencia e ingestión progresiva, sin relecturas gigantes repetidas.
- [ ] Primer ciclo real documentado: candidata evaluable o mantenimiento de base justificado.
- [ ] Ajustes en filas administrables, diff/motivo/versiones y activación explícita.
- [ ] Auditoría/export/consulta no altera deporte, RNG ni conocimiento de la IA.
- [ ] Informes/paquetes verificables y permisos correctos, fuentes originales conservadas.
- [ ] Pendientes heredados y condiciones de cierre MOTOR-14 concretos, sin falso final.
- [ ] Pruebas automáticas acotadas, recorrido manual y cobertura efectiva declarados.
- [ ] Prompt/documentación actualizados y PR sin fusionar.
