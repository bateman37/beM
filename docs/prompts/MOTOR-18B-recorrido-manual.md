# MOTOR-18B — Recorrido manual para Dennis

Prueba **concreta y breve** de lo que cambia en 18B. Arranque: `npm run dev` y abrir la dirección que muestra la consola. Cabecera esperada: `MOTOR-18B … motor beM-motor-0.18.1-MOTOR18B … beM-match-export/10`. Perfil: la base inicial protegida (incluye `+SEM-MOTOR18B-20261022`). «Señal de fallo» = lo que indicaría un defecto.

Qué ha recorrido Claude y qué queda a Dennis: Claude recorrió con Chromium (Playwright) los pasos 1–5, 8 y 10 (24 pasos, consola 0, red 0; resultado en `docs/tecnico/evidencia-motor18b/ui/recorrido-navegador.json`). Los pasos 6, 7 y 9 se comprobaron con cálculo puro y con la campaña (no con clics). **Todo lo demás está pendiente de Dennis.** No se ha ejecutado otro navegador ni Node 24.

## 1 · Perfil anterior frente a base 18B

1. **Panel de ajustes › Inicio**. Verás la tarjeta «Polivalencia y aprendizaje»: modelo efectivo «curva lineal por tramos, 5 anclajes (MOTOR-18B)» y la tabla 1→0,25 · 8→0,50 · 16→1,00 · 24→2,00 · 30→2,50 con la comparación P8/P16/P24.
2. Si en tu navegador seguía activo un perfil de MOTOR-18, verás en su lugar el aviso «usa el factor de Polivalencia lineal de MOTOR-18» y el botón «Activar la base de MOTOR-18B» (no se activa solo).
3. En «¿Cómo aprenden y olvidan los jugadores?» solo aparecen los mandos del modelo efectivo (anclajes en la curva nueva; base/pendiente en la antigua).
- **Fallo:** dos juegos de mandos a la vez sobre la Polivalencia; un factor para P=16 distinto de 1; un perfil anterior convertido sin pedirlo.

## 2 · Defensa de la copia = defensa del partido (R01)

1. **Plantillas › Crear copia de aprendizaje MOTOR-18**. Anota el identificador (termina en `-I<n>`).
2. **Preparación**: arriba debe decir «Estás editando la COPIA DE APRENDIZAJE …». Cambia la **defensa de EQ01** (p. ej. a ORG02 o ORG03) y la **disposición**.
3. **Partido › preparar › empezar**: la defensa y la disposición mostradas son las que elegiste. Al terminar, **Descargar** el JSON: `input.teams[0].plan.defense`/`disposition` son las elegidas e `input.labMatchId` termina en `|M1`.
- **Fallo:** la defensa/rol del partido no coincide con el de Preparación; tu entrada editada (sin copia) cambia al editar la copia.

## 3 · Rol y puestos PG/C sin reinicializar conocimiento

1. En Preparación cambia el **rol ofensivo del primer jugador** (p. ej. O01 → O12) e intercambia PG y C.
2. Comprueba que el resumen de familiaridad muestra la familiaridad vigente con lo nuevo que se pide y que el apartado «Conocimiento» de la ficha **no** ha cambiado de niveles.
- **Fallo:** niveles que cambian solos al editar el plan; un nivel «30 por defecto» en una ficha sin copia.

## 4 · Entrenar → recargar → entrenar (R03)

1. **Plantillas › Laboratorio de conocimiento**: equipo EQ01, «Todos», foco colectivo `FAM:give_and_go`, 1 hora, **Previsualizar** y **Aplicar**. La fuente es `lab|<copia>|EQ01|S1`.
2. **Recarga la página (F5)**. La copia y su registro siguen ahí.
3. Repite la sesión (previsualizar y aplicar). Debe aplicarse con otra fuente (`…|S2`) y el presupuesto del día debe acumular (2 h de 4).
- **Fallo:** «la fuente … ya se aplicó» tras recargar con una sesión nueva; el presupuesto vuelve a 0.

## 5 · Deshacer

Pulsa **Deshacer la última aplicación**: conocimiento, peak, día y presupuestos vuelven al estado anterior y el registro conserva la aplicación como «revertida». Una sesión nueva después recibe un número nuevo.
- **Fallo:** un estado que no coincide exactamente con el previo; un número de sesión reutilizado.

## 6 · P8 frente a P24 con la misma dosis

En el panel (paso 1) mira la comparación (1 hora equivalente, conocimiento 12, enseñanza y competencia 16): factores 0,50 y 2,00; G = 0,4841 y 1,9364 (cociente 4); ganancia ≈ 0,2980 y ≈ 1,1627 (cociente ≈ 3,90). Tabla completa en `docs/tecnico/evidencia-motor18b/l18b/L18B.md`.
- **Fallo:** cociente de G distinto de 4 o factor distinto de la tabla.

## 7 · Cambiar solo la Polivalencia antes de jugar

En la ficha (modo diagnóstico) cambia la Polivalencia de todos los jugadores de un equipo de la copia y juega con la **misma semilla y conocimiento**: el partido debe ser idéntico (marcador, hechos, sorteos). La propuesta de aprendizaje posterior sí cambia (más dosis eficaz).
- **Fallo:** el marcador o los hechos cambian solo por la Polivalencia. (La propiedad está comprobada con 16 contrastes de la campaña; no hace falta una simulación nueva por comparación.)

## 8 · Guardar al terminar un cuarto, continuar y aprender solo del resultado completo

1. **Partido › Por cuartos**: juega un cuarto, **Guardar ahora** y **Continuar** el guardado; termina el encuentro.
2. Con el encuentro **sin terminar** no aparece «Aprendizaje propuesto por este partido». Al terminar sí: **Ver aprendizaje propuesto** no aplica nada; **Aplicar a esta variante** aplica una vez por equipo. La fuente lleva la identidad del encuentro (`…|M1|EQ01`), no semilla ni sorteos.
- **Fallo:** aprendizaje aplicable en un parcial; una fuente construida con semilla/marcador/sorteos; doble aplicación del mismo encuentro.

## 9 · El bloqueador y sus créditos

En **Análisis › Familiaridad (audiencia diagnóstico)** de un partido con la copia, localiza una operación de bloqueo directo: el bloqueador figura entre los participantes del bando atacante y recibe un único crédito repartido por los pesos (0,60 familia / 0,40 disposición). En una operación que lista continuación, el bloqueador anterior puede no figurar (otra interacción). Referencia numérica: caso fijo −0,045 logit (`L18B-11`).
- **Fallo:** un bloqueador registrado en el hecho (`participants.screener`), sin continuación listada, que no aparezca entre los participantes de familiaridad.

## 10 · Público, propio, diagnóstico y descargas

Audiencia pública/rival: sin niveles exactos ni Polivalencia ni enseñanza; propia: solo su equipo; diagnóstico: identificado como tal. **Descargar** el partido y el análisis: abre los archivos (el del partido pesa ~17 MB; el análisis público ~0,1 MB).
- **Fallo:** conocimiento privado del rival visible; descargas que no abren.

## Qué NO prueba este recorrido

Calibración deportiva, conformidad FIBA integral, rendimiento masivo (cien partidos en cinco segundos) ni la validez de los números de la curva (semillas SEM18B del encargo). Si algo no te convence, descríbelo: no se ajusta ninguna cifra sin una decisión tuya.
