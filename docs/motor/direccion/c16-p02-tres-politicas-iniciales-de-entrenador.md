<!-- beM:nav-inicio -->
> [Índice del motor](../README.md) · [Tema: direccion](README.md) · Capítulo 16 — Entrenador: rotación, faltas, pausas y finales · parte 2 de 2
> Anterior: [c16-p01-rotaciones-funciones-y-gestion-de-faltas](c16-p01-rotaciones-funciones-y-gestion-de-faltas.md) · Siguiente: [c17-memoria-defensiva-y-adaptacion](c17-memoria-defensiva-y-adaptacion.md)
<!-- beM:nav-fin -->

<a id="grupo-16-05"></a>

### 16.5. Tres políticas iniciales de entrenador

*Procedencia: MD07, §22.*

<a id="src-md07-l1133"></a>

#### 16.5.1. Identidad

*Origen: MD07 §22.1.*

| ID | Política | Significado |
|---|---|---|
| ENTREF01 | Cauta | Prefiere seguridad contextual y protege recursos cuando la necesidad permite hacerlo. |
| ENTREF02 | Equilibrada | Combina riesgo, continuidad y recursos según el contexto. |
| ENTREF03 | Agresiva en decisiones | Acepta antes determinados riesgos y ajustes cuando el contexto y su información los justifican. |

Son plantillas de política, no capacidades nuevas. «Agresiva» no impone presión máxima o triples constantes; el estilo y el plan del equipo siguen siendo entradas separadas.

<a id="src-md07-l1143"></a>

#### 16.5.2. Diferencias de precarga

*Origen: MD07 §22.2.*

| Materia | Cauta | Equilibrada | Agresiva en decisiones |
|---|---|---|---|
| Revisión de fatiga | Mayor preferencia por relevo compatible si la necesidad es baja. | Contrasta valor actual y recambio. | Acepta más continuidad del referente cuando su valor contextual lo justifica. |
| Problemas de faltas | Mayor protección ante riesgo evitable. | Librillo con urgencia y alternativas. | Mayor disposición a mantener con urgencia o recambio insuficiente. |
| Pausas | Protege recursos sin ignorar desorden relevante. | Combina cortar racha, organizar y preparar. | Mayor disposición a intervenir antes ante evidencia suficiente. |
| Ajustes | Pide estabilidad y evidencia consistente. | Balance entre continuidad y respuesta. | Tolera antes un ajuste permitido y su riesgo. |
| Finales | Prima control cuando protege el objetivo. | Selección contextual. | Acepta riesgo antes cuando necesita cambiar la situación. |

La magnitud de esas diferencias se carga en ENT. Esta tabla cierra su intención, no umbrales numéricos universales. Ninguna política ve el futuro ni garantiza mejores resultados.

<a id="src-md07-l1155"></a>

#### 16.5.3. Obligaciones comunes

*Origen: MD07 §22.3.*

Todas respetan elegibilidad, ventanas, órdenes manuales y límites de conocimiento. Todas pueden mantener una estrella con energía 30 y retirar un jugador fresco por una razón deportiva pertinente.

La presión del marcador puede hacer que la cauta acepte riesgo. Una ventaja puede hacer que la agresiva conserve balón. Las etiquetas no sustituyen las condiciones.

<a id="src-md07-l1161"></a>

#### 16.5.4. Comparación

*Origen: MD07 §22.4.*

Para estudiar el efecto de política se conservan plantilla, contexto y resto de parámetros cuando corresponde. Si cambian también talento y estilo, la comparación debe identificarlo y no atribuir todo al entrenador.

La dirección automática sirve tanto al partido completo simulado como a los ámbitos que delegue Dennis durante el visionado. Los cambios se aplican en sus fronteras deportivas reales.

<a id="grupo-16-06"></a>

### 16.6. Ejemplos integrados

*Procedencia: MD06, §22.*

<a id="src-md06-l1547"></a>

#### 16.6.1. Tiempo muerto que no cambia la racha

*Origen: MD06 §22.18.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** el entrenador pide una pausa para cortar una mala secuencia y cambia instrucciones.

**Resolución vigente:** se administra el tiempo muerto, descanso, atenuación y órdenes válidas. El rival también recibe los efectos de pausa que le correspondan. El siguiente tiro rival puede entrar.

**Interpretación:** no demuestra que el tiempo muerto no se aplicó. Hay que revisar oportunidad y ejecución, no exigir un fallo inmediato como confirmación.

<a id="src-md06-l1555"></a>

#### 16.6.2. Estrella cansada al final

*Origen: MD06 §22.19.*

**Caso funcional ilustrativo; no es un resultado de ejecución.**

**Situación:** una estrella llega al tramo decisivo con energía 30 y sigue ofreciendo más valor contextual que el sustituto disponible.

**Resolución vigente:** puede continuar. Su fatiga no se elimina; el coste aparece en tareas pertinentes. La rotación considera faltas, alternativas, rol, margen y necesidad, evitando entradas y salidas por umbrales idénticos.

**Visibilidad:** el usuario conoce la energía propia exacta presentada y decide con esa información. No ve el número interno del rival para encontrar al oponente más cansado con certeza.

<!-- beM:pie-inicio -->
> [Índice del tema](README.md) · Anterior: [c16-p01-rotaciones-funciones-y-gestion-de-faltas](c16-p01-rotaciones-funciones-y-gestion-de-faltas.md) · Siguiente: [c17-memoria-defensiva-y-adaptacion](c17-memoria-defensiva-y-adaptacion.md)
