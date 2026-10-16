<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: configuracion](README.md) · Capítulo 26 — Panel, parámetros, perfiles y versiones · parte 1 de 2
> Anterior: [c25-p02-eq08-jovenes-atleticos-y-menor-comprension](../validacion/c25-p02-eq08-jovenes-atleticos-y-menor-comprension.md) · Siguiente: [c26-p02-perfiles-versiones-y-ciclo-de-mejora](c26-p02-perfiles-versiones-y-ciclo-de-mejora.md)
<!-- beM:nav-fin -->

<a id="cap-26"></a>

## 26. Panel, parámetros, perfiles y versiones

<a id="grupo-26-01"></a>

### 26.1. Panel de administración: finalidad y organización

*Procedencia: MD05, §16.*

<a id="src-md05-l1094"></a>

#### 26.1.1. Requisito central de producto

*Origen: MD05 §16.1.*

Dennis tendrá un panel desde el que pueda comprender y modificar el comportamiento numérico del motor sin editar código. Debe permitir partir de un perfil completo, localizar un problema, tocar un dato, comparar, auditar y conservar o descartar el cambio.

No basta con mostrar una lista de constantes técnicas sin explicación. Tampoco basta con unos pocos controles globales mientras los pesos relevantes permanecen ocultos en funciones. El panel debe dar acceso al conjunto de parámetros deportivos configurables que utiliza el motor.

Puede ser muy amplio. Su uso habitual debe seguir siendo simple: nombre comprensible, valor, unidad, efecto esperado, procedencia y comparación. El detalle avanzado está disponible sin exigirlo para cada ajuste.

<a id="src-md05-l1102"></a>

#### 26.1.2. Dos formas de mirar los mismos datos

*Origen: MD05 §16.2.*

| Vista | Para qué sirve | Ejemplo de uso |
|---|---|---|
| **Mesa de ajustes** | Trabajo guiado por problema y ámbito, con parámetros principales y efecto legible. | «Hay demasiados triples tempranos forzados». |
| **Tabla maestra** | Inspeccionar, filtrar y editar todas las filas configurables con sus relaciones. | Revisar pesos de decisión directa exterior en todas las situaciones. |
| **Detalle de mecanismo** | Ver capacidades, referencias, condiciones y curva de un mecanismo compartido. | Entender cómo afecta defensa perimetral a esta tarea. |
| **Comparador** | Diferencias entre perfiles y resultados de auditoría. | Comparar base y candidata sin perder cuál se usó. |
| **Registro de cambios** | Saber qué se tocó, por qué y con qué evidencia. | Recuperar el ajuste anterior y su informe. |

Son vistas del mismo conjunto administrado. No hay una cifra simple en una pantalla y otra cifra oculta que realmente manda.

<a id="src-md05-l1114"></a>

#### 26.1.3. Organización del panel

*Origen: MD05 §16.3.*

| Área | Contenido principal |
|---|---|
| Inicio y estado del perfil | Perfil activo, versión, cambios pendientes, cobertura y auditorías recientes. |
| Selección ofensiva | Prioridades, estilos, libertad, iniciativa, roles, elección de participantes y decisiones directas. |
| Organización defensiva | Sistemas, ayudas, coberturas, presión, riesgos y responsabilidades. |
| Capacidades por tarea | Pesos y sensibilidades de las 32 capacidades en tareas pertinentes. |
| Oportunidades y desenlaces | Referencias, oposición, calidad, salidas excluyentes y relaciones condicionales. |
| Tiro y finalización | Zona, preparación, tipo de ejecución, oposición y referencias de conversión. |
| Rebote y continuidad | Acceso, cierre, disputa, captura, segunda opción y balance. |
| Tiempo y carga | Distribuciones de duración, exposición, esfuerzo y recuperación. |
| Estados | Curvas de energía, forma, momento individual/colectivo, consistencia y presión. |
| Entrenador y finales | Rotación, faltas, pausas, ajustes, estabilidad y delegación. |
| Adaptación | Identidad de patrones, tamaño, decaimiento, reconocimiento y respuestas. |
| Reglamento | Perfil oficial, reglas aplicables, oportunidades y consecuencias; separado de preferencias. |
| Contenido táctico | Fichas, requisitos, participantes, alternativas, saques y compatibilidad. |
| Población y referencias | Perfiles manuales, generación correlacionada, rangos y fuentes comparables. |
| Estadística y resumen | Políticas, categorías, muestras, visibilidad y selección de claves. |
| Laboratorio y auditorías | Escenarios, lotes, comparaciones, sensibilidad y diagnóstico. |
| Versiones e intercambio | Copiar, comparar, exportar/importar, restaurar y activar perfiles válidos. |

La separación evita que una corrección del resumen cambie probabilidades del partido o que un ajuste de entrenador se confunda con una nueva regla oficial.

<a id="src-md05-l1138"></a>

#### 26.1.4. Qué puede cambiar Dennis sin editar código

*Origen: MD05 §16.4.*

Debe poder modificar pesos, referencias, sensibilidades, límites, curvas, duraciones, costes, condiciones expresables por los selectores existentes, prioridades de política, fichas compatibles y perfiles de generación.

Puede hacer una acción más frecuente sin hacerla más eficaz; cambiar su eficacia sin alterar su selección; ajustar el coste de presión sin cambiar el reglamento; o modificar la respuesta a falta de energía sin modificar la habilidad base del jugador.

Estos controles deben estar separados. Un único deslizador de «mejorar ataque» que cambie muchas cosas sin mostrarlas no cumple el requisito.

<a id="src-md05-l1146"></a>

#### 26.1.5. Qué sigue perteneciendo a la implementación

*Origen: MD05 §16.5.*

El código ejecuta operaciones genéricas, administra el estado, garantiza invariantes y aplica los datos. Añadir una nueva clase de operación que el motor no sabe resolver puede necesitar código. El panel no se convierte en un editor de programas arbitrarios.

La frontera debe ser explícita:

| Cambio | Tratamiento |
|---|---|
| Ajustar la probabilidad base de un tiro ya representado | Dato administrable. |
| Cambiar pesos de capacidades de una tarea existente | Dato administrable con validación. |
| Añadir una ficha que combina tareas admitidas | Contenido declarativo administrable. |
| Crear una condición usando campos y operadores ya admitidos | Dato de política validable. |
| Introducir una nueva mecánica deportiva o un operador no existente | Decisión funcional y trabajo de implementación identificados. |
| Romper una restricción del perfil oficial | Otro perfil declarado; no cambio oculto del reglamento base. |

**Regla de diseño:** una magnitud cuyo valor se quiera calibrar no debe permanecer como constante deportiva escondida en código. Las restricciones estructurales y matemáticas no se confunden con parámetros de balance.

<a id="src-md05-l1163"></a>

#### 26.1.6. Uso guiado por pregunta

*Origen: MD05 §16.6.*

El panel debe permitir llegar desde una observación a los datos pertinentes. Ejemplos: «muchas pérdidas al avanzar», «el cansancio no se nota», «las estrellas salen demasiado», «no aparecen triples de transición», «se abusa de una salida», «las zonas apenas cambian oportunidades».

Al abrir un problema se muestran indicadores, posibles causas y parámetros relacionados. No se aplica automáticamente una receta. Debe poder distinguirse si faltan oportunidades, si se selecciona mal, si se ejecuta demasiado bien o si la clasificación está midiendo otra cosa.

<a id="src-md05-l1169"></a>

#### 26.1.7. Acciones de edición

*Origen: MD05 §16.7.*

Se requieren búsqueda por nombre o ID, filtros por grupo/tarea/contexto, ordenación, columnas seleccionables, fijación de filas, edición de una fila y de conjuntos compatibles, comparación con heredado, restauración de valor y exportación/importación de perfil.

Una edición en lote muestra qué filas afecta y qué cambia. «Aumentar 10 %» debe declarar si multiplica el valor por 1,10 o añade diez puntos porcentuales. La interfaz no elige silenciosamente una interpretación.

La tabla puede mostrar simultáneamente referencia, valor actual y candidato. Debe poder filtrarse por «modificado», «provisional», «sin referencia», «auditoría con incidencia» y «utilizado por este mecanismo».

<a id="src-md05-l1177"></a>

#### 26.1.8. El panel llega preconfigurado

*Origen: MD05 §16.8.*

En la futura implementación se entregará un perfil inicial completo y utilizable, con los mecanismos requeridos y sus datos. Dennis no tendrá que inventar todas las probabilidades antes de poder jugar un partido.

Cada dato inicial llevará estado: referencia contrastada, semilla de diseño o ajuste evaluado, con su alcance. «Preconfigurado» no significa «realismo demostrado». Los valores provisionales estarán cargados, identificados y disponibles para mejorar.

Una fila obligatoria vacía o una referencia rota impide validar el perfil. No activa un valor alternativo escondido en el código. Los datos opcionales explican qué significa su ausencia.

<a id="grupo-26-02"></a>

### 26.2. Diccionario y edición de parámetros

*Procedencia: MD05, §17.*

<a id="src-md05-l1187"></a>

#### 26.2.1. Ficha común de parámetro

*Origen: MD05 §17.1.*

La tabla maestra admite detalle amplio. No todas las columnas necesitan estar visibles a la vez, pero su significado debe existir.

| Campo | Significado y requisito |
|---|---|
| ID estable | Identificador que no cambia al renombrar la etiqueta. |
| Nombre legible | Concepto que Dennis puede reconocer. |
| Descripción | Qué controla y qué situación representa. |
| Grupo y subgrupo | Selección, desenlace, actualización, política, estadística o contenido. |
| Mecanismo/tarea | Dónde se consulta realmente. |
| Actor y contraparte | A quién corresponde la capacidad, riesgo o preferencia. |
| Contexto/selector | Condiciones de aplicación con campos admitidos. |
| Tipo de dato | Peso, probabilidad, sensibilidad, nodo, duración, umbral, categoría o referencia. |
| Unidad | Porcentaje, puntos porcentuales, logit, segundos, minutos, energía, peso relativo, etc. |
| Referencia deportiva | Población y situación para la que tiene sentido. |
| Valor heredado | Valor que se utilizaría sin sobreescritura. |
| Valor actual | Valor efectivo del perfil consultado. |
| Valor candidato | Edición aún no activada, si existe. |
| Origen del valor | Perfil y fila de procedencia; herencia explícita. |
| Mínimo, máximo y paso | Restricciones de entrada y presentación. |
| Dirección del efecto | Qué aumenta o disminuye al modificarlo, bajo condiciones comparables. |
| Modelo asociado | Operación compartida que interpreta el dato. |
| Dependencias | Filas, curvas, fichas y vistas afectadas. |
| Estado | Provisional, evaluado, reemplazado, deshabilitado u otro estado definido. |
| Fuente y muestra | Evidencia, enlace, definición, fecha y cobertura, si existe. |
| Motivo del ajuste | Hipótesis o problema que pretende resolver. |
| Versión e historial | Cuándo cambió y en qué perfil. |
| Auditoría asociada | Comparación que lo evaluó y resultado. |

Una descripción como «factor de balance» no es suficiente si no permite saber qué modifica. La tabla debe decir, por ejemplo, si aumenta participación en disputa o probabilidad de captura una vez que el jugador participa.

<a id="src-md05-l1219"></a>

#### 26.2.2. Tipos que no deben confundirse

*Origen: MD05 §17.2.*

| Tipo | Regla de edición | Ejemplo |
|---|---|---|
| Peso relativo | No negativo; se normaliza con sus alternativas elegibles. | 8 frente a 5 no significa 80 % frente a 50 %. |
| Distribución de probabilidades | Categorías excluyentes; suma 100 % dentro de su universo. | Conserva/pérdida/contacto. |
| Probabilidad binaria | Entre 0 y 1; referencia y condición explícitas. | Conversión bajo un contexto de referencia. |
| Sensibilidad | Unidad y rango declarados; efecto mostrado sobre casos. | Cambio en logit por diferencia normalizada. |
| Multiplicador | Se indica sobre qué valor opera y con qué límites. | Carga de una tarea respecto a referencia. |
| Umbral de política | Activa revisión o preferencia, salvo regla obligatoria. | Considerar descanso; no ordenar automáticamente descanso. |
| Curva | Nodos, rango, interpolación y restricciones. | Severidad de energía. |
| Duración | Unidad, distribución y elegibilidad temporal. | Tiempo de una acción rápida. |
| Categoría | Conjunto permitido y política de precedencia. | Calidad cómoda/normal/forzada. |
| Parámetro de muestra | Afecta lectura o clasificación del informe. | Aviso por pocos intentos; no altera el partido. |

Una distribución y un conjunto de pesos se editan en modos diferentes. La interfaz puede ofrecer normalizar pesos o reajustar una distribución, mostrando siempre la transformación. No debe convertir una fila de un tipo en otra silenciosamente.

<a id="src-md05-l1236"></a>

#### 26.2.3. Conversión legible de probabilidad

*Origen: MD05 §17.3.*

El administrador puede ver probabilidad de referencia y sensibilidad con ejemplos de jugador/oposición. El modo avanzado muestra los valores latentes utilizados, como logit.

Si una referencia pasa de 35 % a 38 %, el cambio es +3 puntos porcentuales y aproximadamente +8,57 % relativo. El panel debe mostrar cuál se editó. Si se modifica una sensibilidad, su efecto puede ser distinto según el punto de partida; se visualiza sobre varios casos, no con un único porcentaje engañoso.

La curva o tabla de ejemplo no es una predicción exacta de puntos por partido. Muestra el mecanismo bajo condiciones declaradas.

<a id="src-md05-l1244"></a>

#### 26.2.4. Pesos de capacidades

*Origen: MD05 §17.4.*

Cada tarea declara técnica principal, apoyos y oposición. Los pesos normalizados suman el total definido dentro de su grupo. El administrador ve las capacidades a cero y las ausentes, y puede entender si son irrelevantes o falta cobertura.

No se permite que una mezcla de apoyos convierta automáticamente una técnica muy baja en una ejecución excelente. El perfil debe mantener el peso principal y las limitaciones acordadas; las excepciones necesitan una justificación deportiva explícita.

Cambiar pesos modifica el perfil de esa tarea. No reescribe las capacidades del jugador, ni el historial de partidos, ni el generador de población salvo que se edite también ese grupo.

<a id="src-md05-l1252"></a>

#### 26.2.5. Condiciones y precedencia

*Origen: MD05 §17.5.*

Los selectores utilizan campos conocidos: contexto de entrada, tarea, sector, preparación, rol funcional, reloj, margen, estado, organización y otros datos ya representados. Sus operadores son simples y tipados: igualdad, pertenencia, rango, disponibilidad y combinación explícita.

Debe existir una precedencia estable entre fila general y sobreescritura contextual. Se utiliza herencia explícita y una precedencia que resuelve la configuración efectiva mediante especificidad y prioridad declaradas. Una colisión no resuelta bloquea validación.

**No se suman todas las filas coincidentes por defecto.** Una referencia sustituida no se vuelve a sumar como bonus. Si un mecanismo admite varios modificadores compatibles, su composición y límites forman parte de su definición y se ven en el detalle.

Una excepción amplia por equipo o liga no se introduce para forzar una media objetivo. Las diferencias deben venir de participantes, plan y condiciones deportivas legítimas, conservando la escala absoluta.

<a id="src-md05-l1262"></a>

#### 26.2.6. Herencia y ausencia

*Origen: MD05 §17.6.*

El usuario puede copiar un perfil base y cambiar unas filas. La consulta muestra el valor efectivo y su origen. Restablecer herencia elimina la sobreescritura; no pone el valor a cero.

Se distinguen **cero**, **deshabilitado**, **no aplicable**, **no registrado** y **sin valor requerido**. Un peso cero es una decisión de selección; no equivale a que no exista un dato.

Al activar un perfil se resuelve su conjunto completo. La ejecución conserva una identificación suficiente de los valores efectivos; cambiar después el perfil padre no cambia un partido iniciado.

<a id="src-md05-l1270"></a>

#### 26.2.7. Validaciones antes de usar un perfil

*Origen: MD05 §17.7.*

Se comprueban tipos, rangos, sumas, referencias, disponibilidad de alternativas, curvas válidas, condiciones solapadas, unidades, compatibilidad de reglas y cobertura de parámetros obligatorios.

La validación estructural informa dónde está el problema y cómo se interpreta. No demuestra que el perfil produzca buen baloncesto. Ese segundo nivel corresponde a las auditorías.

<a id="src-md05-l1276"></a>

#### 26.2.8. Explicación de un acontecimiento

*Origen: MD05 §17.8.*

El diagnóstico debe poder mostrar qué filas efectivas participaron: contexto, opciones elegibles, peso del plan/lectura, actor y capacidades pertinentes, oposición, estado aplicado, referencia y resultado, junto con tiempo y continuidad.

No necesita producir una novela de operaciones para todos los partidos. Se requiere que la explicación pueda obtenerse en modo diagnóstico y que sus nombres correspondan a los del panel. Una recomendación no puede depender de una constante que Dennis no puede localizar.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c25-p02-eq08-jovenes-atleticos-y-menor-comprension](../validacion/c25-p02-eq08-jovenes-atleticos-y-menor-comprension.md) · Siguiente: [c26-p02-perfiles-versiones-y-ciclo-de-mejora](c26-p02-perfiles-versiones-y-ciclo-de-mejora.md)
