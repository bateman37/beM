<!-- beM:nav-inicio -->
> [Índice del motor](README.md) · [Índice general](../README.md)
<!-- beM:nav-fin -->

## Cómo leer y utilizar este documento

El índice general lleva a cada materia y el índice detallado a sus desarrollos. Los identificadores de capacidades, tareas, fichas, grupos, entradas, registros y casos conservan el significado de las fuentes. Los anclajes de procedencia permiten comprobar dónde quedó cada apartado original.

| Estado | Significado en la especificación consolidada |
|---|---|
| **DEC — decisión cerrada** | Comportamiento o cantidad aceptados. La implementación los respeta; no los cambia para completar un dato ausente. |
| **FUN — contenido funcional definido** | Catálogo, ficha, contrato o comportamiento descrito. Puede necesitar todavía filas y referencias cargables. |
| **SEM — semilla provisional** | Valor inicial explícito, administrable y revisable. No representa una frecuencia real demostrada ni un coeficiente calibrado. |
| **CARGA — contenido o dato por completar** | Valores, condiciones, correspondencias o perfiles concretos requeridos dentro de la estructura elegida. |
| **EVAL — evidencia de evaluación** | Comprobación asociada a una implementación, versión y muestra. La aceptación funcional o la revisión de Markdown no la sustituyen. |
| **Ilustración** | Ejemplo matemático, de interfaz o de caso. Sus cifras no se convierten automáticamente en datos deportivos del perfil. |

Estas etiquetas pueden concurrir: una regla DEC puede utilizar un coeficiente SEM y requerir otras filas CARGA. Un cero funcional cerrado —por ejemplo, la ausencia de efecto directo de T sobre la conversión del tiro— se distingue de un valor que falta.

El MD08 diferenciaba requisitos solicitados y concreciones propuestas. Se conserva esa naturaleza para los detalles que no tenían otro cierre expreso: entre ellos los accesos rápidos 10/100/1.000, las concreciones operativas de edición y lotes y el formato recomendado de intercambio. La descarga completa, doce jugadores por equipo, +1/+3/+5, las tres modalidades y la simulación masiva constan como requisitos solicitados. Esta consolidación no transforma sus números ilustrativos en valores calibrados.

### Criterio de precedencia aplicado

1. La instrucción expresa de Dennis sobre la materia.
2. El cierre o precisión específica más reciente de MD08, MD07, MD06 y MD05, en ese orden cuando existe una colisión real.
3. El contenido de MD01–04 que sigue siendo compatible y aporta detalle.
4. Las semillas y ejemplos anteriores compatibles, conservando su procedencia y estado.

Una omisión en un documento breve posterior no revoca un catálogo amplio anterior. Por eso el MD07 no reduce las estadísticas del MD04 y el MD08 no elimina el panel, las auditorías ni las decisiones deportivas ya cerradas. Los pendientes históricos resueltos se retiran de la lista de trabajo vigente y quedan relacionados con su cierre.

### Decisiones de dirección que gobiernan todo el diseño

| Materia | Decisión vigente | Procedencia principal |
|---|---|---|
| Granularidad | Acontecimientos pertinentes dentro de posesiones; los intervalos se procesan de una vez. Preparar, leer, elegir y ejecutar son funciones agrupables. | MD03 §§2–4; MD05 §3. |
| Contexto | Balón, oposición, apoyos, responsabilidades y continuidad necesarios; historial y memoria extensa quedan fuera del contexto activo. | MD05 §3; MD06 §21; MD07 §28. |
| Operaciones | Tres tablas funcionales y 17 tareas compartidas, activadas por pertinencia. | MD03 §§4–10; MD07 §17. |
| Jugadores | 32 capacidades: 18 técnicas, siete físicas y siete mentales; escala absoluta continua equivalente a 1–30 y redondeo de presentación. | MD02 §5; MD05 §15.2. |
| Preferencias | Iniciativa, Vocación de finalización y Preferencia de zona, fuera de las capacidades; orientan elección. | MD06 §§7–8. |
| Cuerpo | Alcance derivado único de altura y envergadura; combinación equilibrada normalizada como semilla. Salto permanece separado; peso sin modificador directo adicional inicial. | MD06 §6; MD07 §9. |
| Experiencia | Historial y aprendizaje reflejados en capacidades actuales; sin segunda prima de partido por edad o experiencia. | MD02 §§14–15. |
| Ataque | Siete estilos de cinco niveles, seis disposiciones, roles y libro de prioridades 1–5 compartibles. | MD01 §§4–9; MD07 §§14, 16. |
| Selección | Elegibilidad antes que preferencia; pesos normalizados; familia antes de variante; mejor prioridad elegible sin premio por duplicación. | MD05 §5; MD07 §6. |
| Libertad | Mezcla de plan y lectura, limitada por el margen concedido y orientada por Iniciativa; Visión y Decisiones mantienen su función propia. | MD05 §5; MD06 §8. |
| Juego directo | Son posibles decisiones espontáneas, recursos autónomos y oportunidades inmediatas sin iniciar una ficha. | MD05 §§6–7; MD07 §21. |
| Defensa | Seis organizaciones, tres alturas, cuatro coberturas y tres especiales; responsabilidades y concesiones reales. | MD01 §§10–14; MD07 §15. |
| Emparejamientos | Asignación de referencia y responsabilidad actual distintas; el desajuste continúa hasta una interacción o reorganización que lo modifique. | MD06 §§4–5. |
| Objetivo ausente | Alternativa individual declarada o suspensión. Box and one dispone de organización alternativa 2–3 preconfigurada; el regreso depende del plan vigente. | MD06 §5. |
| Resultado | Distribuciones entre excluyentes, logística para binarias pertinentes y relaciones condicionales para hechos compatibles. Cada causa se aplica una vez donde corresponde. | MD05 §5; MD07 §8. |
| Tiro | Técnica principal por gesto; TEC06 prepara cuando corresponde; TEC11 crea desde poste. Floater en progresión y palmeo directo pertinente usan TEC04; tiro corto controlado usa TEC03. | MD06 §12. |
| Tiempo | Distribución triangular acotada inicial por contexto y desenlace; la duración corresponde al hecho efectivamente producido. | MD07 §10. |
| Energía | Reserva 0–100; tramo 100–70 casi neutro y deterioro creciente, muy considerable bajo 10, selectivo por tarea. | MD05 §8; MD07 §10.3. |
| Forma | Estado continuo persistente recibido por el encuentro y estable durante él; no realimentado automáticamente desde puntos, VAL o victoria. | MD05 §9.2; MD07 §10.4. |
| Momento | M-TIR, M-OFE y M-DEF, más T por equipo; persistencia, retorno, variación y episodios agrupados. | MD06 §§15–17. |
| Alcance de T | Coordinación, atención compartida y elección; sin contribución directa a la conversión del tiro ni plus físico universal. | MD06 §16. |
| Consistencia y presión | Variación con control del centro de referencia después de la transformación; presión contextual sin duplicar exigencias. | MD05 §9; MD06 §15; MD07 §10.6. |
| Órdenes | Solicitud, vigencia y ejecución distintas; frontera por tipo, ámbito, consumo y caducidad. Obligación reglamentaria antes que manual válido, plan y delegación. | MD06 §§9–11. |
| Rotación | Plan con revisión contextual, estabilidad y alternativas. E = 30 puede seguir siendo la mejor opción, pagando fatiga pertinente. | MD05 §11. |
| Faltas y pausas | Librillo administrable; tiempos muertos con intención, descanso, atenuación y ajustes válidos, sin resultado garantizado. | MD05 §§11–12; MD06 §17. |
| Adaptación | Memoria colectiva pequeña, semántica y gradual; respuesta compatible y ejecutada. La cuarta repetición puede funcionar. | MD05 §13; MD07 §12. |
| Reglamento | Perfil principal FIBA 2026 v1.1 identificado; administración común y determinista, incidencias condicionadas y ventanas explícitas. | MD05 §4; MD07 §25. |
| Estadística | Catálogo máximo conservado; hechos, créditos, derivados e interpretaciones separados, con universos y permisos explícitos. | MD04; MD05 §14; MD06 §§13–14. |
| F | Acción de tiro y serie causal ligada; rebote ofensivo y nuevo tiro abren otra F. Penalización no de tiro y administración quedan fuera. | MD06 §§13–14. |
| Presencia | Minutos y más-menos por presencia efectiva; eficiencias de unidades completas y mixtas diferenciadas. | MD04 §§13, 23–24; MD05 §14.7. |
| Resumen | Tres claves principales sustentadas y ampliables, con menos cuando la evidencia válida resulte insuficiente; líderes por criterio, sin nueva fórmula integral de MVP. | MD07 §24.4; MD05 §14.9. |
| Información | Energía propia con número 0–100; Forma y momento propios cualitativos; rival observado, diagnóstico separado y conocimiento permitido común a humano y automático. | MD06 §18. |
| Modalidades | Simulado total, por cuartos y por tiempo x2/x4/x8/x16 comparten núcleo; también los partidos del mundo. Pausar la interfaz no produce descanso deportivo. | MD05 §15; MD06 §21; MD08 §4. |
| Panel | Control de todos los ajustes deportivos calibrables mediante datos administrados, vistas guiadas y tabla maestra, perfiles congelados y auditorías. | MD05 §§16–20; MD06 §20; MD07 §27. |
| Inventario | 81 grupos deportivos y de contenido y cuatro soportes. Los 23 elementos T06, las tres entradas y los ocho registros son otras clasificaciones. | MD07 §§4–13, 24–28, 30.2. |
| Precarga | 21 fichas ofensivas, seis respuestas de saque, nueve continuaciones, 20 situaciones espontáneas, tres políticas y doce equipos de doce plazas. | MD07 §§18–23 y anexo B. |
| Laboratorio | Fichas, edición masiva +1/+3/+5, preparación, las tres modalidades, lotes y comparación base/variante. | MD08 §§1–6. |
| Extracción | Paquete autocontenido del partido o lote: entradas, configuración efectiva, estadísticas, agregados, acontecimientos, decisiones, auditoría y resumen. | MD08 §7. |

### Qué entrega y qué queda por completar

La definición funcional y sus catálogos están reunidos aquí. Quedan datos concretos y trabajo de construcción: filas numéricas requeridas de los 81 grupos, correspondencias reglamentarias y estadísticas, perfiles completos de las 144 plazas, planes, rangos del generador y escenarios/tolerancias de auditoría. El primer perfil operativo se entrega completo y preconfigurado para que Dennis pueda jugar y ajustar.

Los valores y ejemplos que ya existen se conservan con sus estados. No se asignan 32 cifras nuevas a cada plaza ni se inventan probabilidades para completar huecos. Construcción, evaluación deportiva y medición del coste utilizarán partidos completos y muestras pertinentes. Las fuentes externas se conservan con el alcance de sus lecturas originales; esta consolidación no incorpora investigación nueva ni una auditoría nueva de repositorios.

La unificación solicitada queda realizada mediante este documento; deja de ser un trabajo pendiente. La implementación y la calibración conservan su propio estado y no se declaran ejecutadas por esta entrega documental.

<!-- beM:pie-inicio -->
> [Índice del motor](README.md) · [Presentación](presentacion.md)
