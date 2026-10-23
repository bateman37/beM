# 14 · Pendientes de SIM-MOTOR-01 (sin mezclar defectos, aproximaciones, decisiones y 02)

## Defectos conocidos
- **No se conoce ningún defecto abierto** en el alcance de 01 tras las 3.000 ejecuciones oficiales (todas válidas), la suite completa y el recorrido de Chromium.
- **Objetivo de rendimiento**: ver `09-RENDIMIENTO.json` y `00-LEEME.md` para el resultado real de B02 (frío) y B03 (caliente). No se ha buscado más rendimiento recortando cobertura ni cambiando probabilidades.
- Los workers reales no escalan linealmente en la máquina de medición (hilos lógicos compartidos): la cifra de cuatro workers depende del hardware.

## Incidencias de desarrollo corregidas antes de medir (conservadas por trazabilidad)
1. El reparto de rebote defensivo tomaba a los participantes del propio equipo (la conciliación R07 lo detectó en el primer lote de prueba). Corregido: los defensores salen del equipo rival.
2. Tras una exclusión quedaban puestos vacantes que no se cubrían (el quinteto se reducía de forma permanente). Corregido: una plaza vacante se cubre con el mejor sustituto elegible; solo hay inferioridad cuando no quedan sustitutos.
3. Identificadores duplicados en la interfaz (`plan0-pressure` de dos controles) y reentrada del repintado durante un `change`: corregidos y cubiertos por el recorrido de Chromium.
4. Familiaridad: el bloque táctico del conocimiento se llama `tactics`, no `modules`.
Ninguna de ellas afectó a las ejecuciones oficiales de B01/B02/B03 (se detectaron y corrigieron antes).

## Aproximaciones declaradas (SIM representa el efecto, no la mecánica del detallado)
1. Las probabilidades «por interacción» del detallado se transforman a «por control» normalizando las categorías terminales; la falta defensiva sin tiro no cierra el control salvo bonus.
2. Un único tipo de terminal por control (más cadena de rebote ofensivo); sin pases, ayudas, desplazamientos ni continuaciones por debajo.
3. Los aciertos se sortean tirador a tirador (equivalente a binomiales por celda con la probabilidad de cada jugador).
4. Zonas del perfil sin coordenadas ni lados: aro, interior, media y triple; las áreas defensivas se asocian a zonas con una tabla derivada.
5. Transición y decisiones espontáneas: zona, pase y movimiento derivados del catálogo ESP (reparto igual entre situaciones); la parte de transición usa el origen esperado (robos y rebotes defensivos) con la tasa de fallo de campo media de las cuatro zonas.
6. Momentos individuales/colectivo y presión: procesos compactos por tramo; los episodios EPI01–EPI06 y la dinámica fina del detallado no se reconstruyen. La tensión de periodo es una rampa lineal sobre la ventana final (lectura de SIM de las filas heredadas).
7. Familiaridad: se aplica solo a la calidad de la oportunidad (no al avance presionado, que aquí se aproxima por la altura de presión).
8. `box and one`: marca individual dedicada sobre el objetivo; el resto se organiza como la zona de reserva.
9. Rotación básica con las políticas ENTREF01–03: revisión de energía, permanencias mínimas, protección por faltas y retorno de titulares; sin búsqueda de la mejor alineación y sin tiempos muertos ni estrategia de cierre.
10. Sin técnicas, antideportivas ni faltas de entrenador/banquillo; las faltas ofensivas cuentan para el contador de equipo.
11. Un tapón fuera de banda deja la posesión al equipo defensor y no genera rebote (causa terminal explícita).
12. Sin tiros libres técnicos, sin pérdidas de equipo por reloj de posesión (la fila heredada no se traduce a este universo).

## Decisiones requeridas (DECISIÓN REQUERIDA — ninguna bloquea 01)
1. **Calibración**: ¿contra qué referencia se calibrará SIM (el detallado, competiciones reales o ambos)? Los coeficientes heredados son SEM18/SEM17 sin calibrar; su traducción tampoco lo está (producción media por equipo en esta entrega: cifras en la nota técnica, sin valoración deportiva).
2. **Rendimiento**: si el objetivo de cinco segundos debe cumplirse en frío (proceso nuevo) o solo con workers calientes; condiciona si en 02 se admite una caché de magnitudes entre tramos (aproximación nueva).
3. **Tensión por periodo y transición esperada**: confirmar o sustituir la lectura de SIM (aproximaciones 5 y 6) antes de la campaña de 03.

## Alcance concreto de SIM-MOTOR-02 (no se ha anticipado)
Integración completa de lectores y laboratorio (todas las pantallas de Análisis sobre el contrato SIM), políticas pequeñas del entrenador/adaptación, aprendizaje posterior al partido (aplicación única, compatible y reversible; equivalencia de dosis entre motores), lotes persistentes con detener/reanudar tras reinicio, jornada simultánea con reloj virtual compartido y clasificación en directo (solo presente publicado), ejecución agrupada con estadísticas anuales individuales e historia por club/competición. SIM-MOTOR-03: campaña comparativa congelada sin calibración. SIM-MOTOR-04: calibraciones aceptadas y contrato de cierre para el manager.
