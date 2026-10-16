<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: jugadores](README.md) · Capítulo 2 — Datos de entrada, capas y participantes
> Anterior: [c01-identidad-alcance-y-decisiones-de-direccion](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md) · Siguiente: [c03-p01-escala-visible-130](c03-p01-escala-visible-130.md)
<!-- beM:nav-fin -->

<a id="cap-02"></a>

## 2. Datos de entrada, capas y participantes

<a id="grupo-02-01"></a>

### 2.1. Qué información pertenece a cada capa

*Procedencia: MD02, §3.*

<a id="src-md02-l0069"></a>

| Capa | Qué expresa | Ejemplo | Uso |
|---|---|---|---|
| Capacidad | Lo bien que sabe realizar una tarea | Pase 24; anticipación 25 | Lectura, preparación o ejecución pertinente |
| Tendencia | Qué prefiere intentar cuando tiene margen | Iniciativa elevada | Elección de opciones |
| Orden | Qué solicita el entrenador | Priorizar bloqueo directo; pocas ayudas | Responsabilidades y preferencias |
| Estado | Cómo se encuentra ahora | Energía baja; buena forma; momento frío | Rendimiento actual, con duración propia |
| Medida corporal | Características en sus unidades | Altura, envergadura y peso | Alcance y emparejamientos pertinentes |
| Historial | Lo que ha vivido y producido | Minutos de carrera; experiencia acumulada | Desarrollo e información de carrera |
| Potencial y desarrollo | Posibilidades y evolución futura | Margen de mejora de decisiones | Sistema posterior de progresión |

<a id="src-md02-l0081"></a>

#### 2.1.1. Reglas para evitar duplicaciones

*Origen: MD02 §3.1.*

Un rol de tirador cambia la utilización del jugador; no aumenta su Triple. Una orden de presión cambia el esfuerzo y las oportunidades defensivas; no aumenta su Robo.

La buena visión permite percibir un pase. La precisión para ejecutarlo pertenece a Pase. Detectar bien y ejecutar bien son dos capacidades distintas.

La fatiga se deriva de la energía disponible y sus consecuencias. No se añade una segunda reserva independiente de fatiga con el mismo efecto.

La experiencia puede haber contribuido a mejorar decisiones. No vuelve a conceder otro bonus general de experiencia sobre esas decisiones durante el partido.

El overall, si se calcula para informar al usuario, no se utiliza como causa de éxito. Tampoco entran en una acción el potencial, la reputación ni los puntos anotados en el partido anterior como sustitutos de la capacidad pertinente.

<a id="src-md02-l0093"></a>

#### 2.1.2. Lo que no cuenta como una de las 32 capacidades

*Origen: MD02 §3.2.*

No cuentan la edad, las medidas corporales, las posiciones, los roles, la iniciativa, los tres estados, el historial, la experiencia o el potencial.

Su representación respeta el cuerpo derivado, los tres grupos de tendencias y los estados definidos en este diseño. Sus magnitudes por completar se identifican como datos, sin crear otra colección de capacidades ocultas.

<a id="grupo-02-02"></a>

### 2.2. Población, modalidades y conservación

*Procedencia: MD05, §15.*

<a id="src-md05-l1040"></a>

#### 2.2.1. Entradas mínimas del encuentro

*Origen: MD05 §15.3.*

| Grupo | Información requerida |
|---|---|
| Identidad y disponibilidad | Equipos, convocatoria, elegibilidad y participantes disponibles. |
| Capacidad | Las 32 capacidades y datos corporales pertinentes ya admitidos. |
| Función | Posiciones posibles, roles activos, director y alternativas. |
| Tendencias | Iniciativa y preferencias declaradas, separadas de habilidad. |
| Estados | Energía, forma y momento inicial conforme a su política; contexto colectivo inicial. |
| Plan | Estilos, disposiciones, prioridades, coberturas, saques, rotación y delegación. |
| Contexto | Importancia y condiciones deportivas declaradas. |
| Perfiles | Reglamento, estadística, parámetros numéricos y contenido identificados. |
| Reproducción | Versión del núcleo, azar pertinente, entradas y órdenes necesarias. |

Un campo requerido ausente no recibe una constante invisible del código. Se resuelve mediante herencia explícita de perfil o se informa de la falta antes de iniciar el encuentro.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c01-identidad-alcance-y-decisiones-de-direccion](../alcance/c01-identidad-alcance-y-decisiones-de-direccion.md) · Siguiente: [c03-p01-escala-visible-130](c03-p01-escala-visible-130.md)
