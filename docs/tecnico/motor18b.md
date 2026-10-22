# MOTOR-18B — Cierre de familiaridad y mayor diferencia de Polivalencia

> [Prompt archivado](../prompts/MOTOR-18B-cierre-y-polivalencia.md) · [Recorrido manual](../prompts/MOTOR-18B-recorrido-manual.md) · [Estado](../estado.md) · base: [`motor18.md`](motor18.md) · evidencia compacta en [`evidencia-motor18b/`](evidencia-motor18b/)

**Veredicto honesto.** MOTOR-18B corrige seis observaciones aceptadas de la revisión independiente de MOTOR-18 (M18-R01…R06), corrige una etiqueta de unidades y sustituye el factor de Polivalencia del aprendizaje por una curva con mucha más diferencia entre un jugador de 8 y uno de 24. **Ningún coeficiente deportivo cambia**: la curva es una semilla **SEM18B autorizada por el encargo**, no una calibración; la Polivalencia sigue sin entrar en el partido. «Corregido y comprobado» significa comprobado por Claude, no validado por Dennis.

## 1 · Base, Git y control

MOTOR-18 (PR [#19](https://github.com/bateman37/beM/pull/19), commit `fa13869`) seguía **abierta y sin fusionar** al empezar: 18B se desarrolla encima de su implementación, en la misma rama `claude/busy-edison-b1fmnc`, y amplía esa PR como unidad **MOTOR-18 + MOTOR-18B**. CONTROL17B = worktree inmutable de `f67113e`. El control de MOTOR-18 (agenda, congelación, planes de lotes, tabla L18 histórica y huellas de los paquetes finales) se copió antes de editar y viaja en la evidencia detallada (`control-motor18/`); nada se reescribe como si lo hubiera producido 18B.

Commits: (1) curva y datos, (2) correcciones R01–R06 y regresiones, (3) recorrido de Chromium, identidad del encuentro y scripts de campaña, (4) evidencia y documentación.

## 2 · Curva de Polivalencia (§3)

```text
fJugador(P) = Fa + (Fb − Fa)·(P − Pa)/(Pb − Pa)   entre anclajes consecutivos; extremos exactos
anclajes: 1→0,25 · 8→0,50 · 16→1,00 · 24→2,00 · 30→2,50
G = tasa·dosis·fJugador·fEnseñanza·fContenido·fTransferencia ;  K' = 30 − (30 − K)·exp(−G/29)
```

- Vive en `familiarity.learning.factors.player` (`kind: 'piecewise-linear'`, `points`) mediante la extensión `data/match/motor18b-seed-extension.json` (`SEM-MOTOR18B-20261022`: dos identidades, la curva y una nota de procedencia; los archivos SEM18 históricos no se tocan). Función pura única `playerFactor(P, params)` (`src/knowledge/model.js`) consumida por posiciones, roles ofensivos, roles defensivos y módulos, en sesión y en partido; fuera de 1–30, ausente o no finita = `RangeError` localizado (nunca 16 silencioso).
- **Compatibilidad:** un perfil con `{base, slope}` conserva su factor lineal anterior (no se convierte en silencio ni cambia sus recibos). El recibo de cada objetivo lleva `factors.playerModel`; la propuesta, `playerCurve`, `paramsVersion` y `paramsFingerprint`.
- **Panel:** once filas (tipo y 5 × nivel/factor; los niveles son referencia) con unidad y efecto; las filas base/pendiente solo existen en perfiles que las conservan (`onlyIfPresent`); validación `validatePlayerCurve` (orden estricto, extremos 1/30, anclajes previstos, factores positivos y no decrecientes); tarjeta «Polivalencia y aprendizaje» con modelo efectivo, anclajes, unidad y comparación P8/P16/P24 y, si el perfil activo es el de MOTOR-18, aviso y botón explícito para activar la base 18B.
- **No cambia:** tasas, enseñanza, contenido, transferencia, reaprendizaje (solo hasta `peak`), desuso, suelo, techo ni presupuestos. P=16 pasa de 1,0086206897 a **1 exacto**; no se compensó con otras tasas.

| P | Factor anterior | Factor nuevo | K final anterior | K final nuevo |
|---:|---:|---:|---:|---:|
| 1 | 0,7500000000 | 0,25 | 12,4451195113 | 12,1496132881 |
| 8 | 0,8706896552 | 0,50 | 12,5157125829 | 12,2979830131 |
| 16 | 1,0086206897 | 1,00 | 12,5960428442 | 12,5910330331 |
| 24 | 1,1465517241 | 2,00 | 12,6760040341 | 13,1626593971 |
| 30 | 1,2500000000 | 2,50 | 12,7357337437 | 13,4413950352 |

(Ejemplo ORG02, K=12, **1 hora equivalente efectiva al objetivo**; la tabla completa de siete niveles, G y la comparación de ganancias está en [`evidencia-motor18b/l18b/`](evidencia-motor18b/l18b/L18B.md).) G(P24)/G(P8) = 4; ganancia(P24)/ganancia(P8) ≈ 3,901764. Dosis eficaz necesaria de K12 a K18 (lectura pura `doseToReach`, no un calendario): P8 24,289281 · P16 12,144640 · P24 6,072320 h-eq.

## 3 · Correcciones

| ID | Defecto (MOTOR-18) | Corrección | Dónde |
|---|---|---|---|
| R01 | Preparación editaba `store.edit`; el partido congelaba `scenario.input`; el indicador `learning` se buscaba fuera de `scenario.scenario`. Defensa ORG02 editada → ORG01 recibida; rol O01 → O12. | Preparación edita la entrada activa (la copia de aprendizaje si lo es); selección pura y centralizada; banner de qué entrada se edita; defensa de demostración/plan natural y persistencia sobre la misma entrada. | `src/lab/prep-source.js`, `store.js`, `prep.js`, `knowledge-ui.js` |
| R02 | `exitsFor` sustituía `offContact` de pantalla por el de penetración y `famQualityContext` perdía al bloqueador (35 operaciones en los seis diagnósticos: 29 de bloqueo directo y 6 de otras familias, sin continuación listada). | La salida lleva `blocker` (de la ficha, independiente del contacto); una continuación que inicia otra interacción lo deja en `null`; calidad y exposición usan la misma selección (un crédito por jugador–operación, repartido por los pesos). Caso fijo: −0,045 logit (antes 0). | `src/match/plays.js`, `flow.js`, `familiarity.js` |
| R03 | `S.seq=1` al recargar: la sesión nueva repetía `S1` y se rechazaba. | Secuencia de sesión persistida por copia (derivada de todos los recibos si falta), secuencia de instancia de laboratorio en la identidad de la copia, identidad estable del encuentro (`input.labMatchId`, viaja en guardados y exportaciones). | `learning-model.js`, `learning-ui.js`, `knowledge-ui.js`, `game.js`, `match/index.js` |
| R04 | `proposeFromMatch` aceptaba un parcial (`complete:false` no se verificaba). | `complete === true` y fuente global exigidos; productor común `buildExposure`/`finishedExposure`/`exposureFromResult` (no fabrica finalización). | `src/learning/exposure.js`, `team.js`, `engine/index.js` |
| R05 | 4 h con reparto 2/−1 daba 8 h-eq consumiendo 4 h; repartos no finitos consumían horas sin dosis. | Validación previa de fuente, horas, reparto ([0,1], suma 1, tolerancia 1e-9), días, jugadores, focos, Polivalencia y enseñanza; exposición numérica y por catálogo; propuesta ligada a la huella de parámetros efectivos (`applyProposal(..., params)`); `adoptLearningParams` conserva el estado. | `src/learning/team.js` |
| R06 | Candidato estimado con un defensor y ORG03 (peso 1); la operación real, con COB01, dos defensores y 0,70/0,30. | Un solo constructor de contexto; la cobertura y sus defensores solo cuentan si pertenecen a **la misma interacción** (`inter`); alcance `resuelta`/`determinada`/`limitada` con lo que falta; estimar no cambia nada. | `familiarity.js`, `mathx.js`, `plays.js` |

La diferencia de 0,045 entre estimar sin cobertura determinada y resolver con ella es **legítima** (cobertura que aún requiere decisión/sorteo): se declara, no se compensa con un coeficiente inventado.

**Efecto de la referencia de interacción (R06) sobre MOTOR-18:** la cobertura de otra interacción de la misma posesión ya no cuenta como módulo/defensores de una operación distinta (p. ej. un recurso tras una ficha negada). En un partido de prueba (semilla 382000002, EQ01 con `FAM:pick_and_roll` = 8) las operaciones con módulo de cobertura bajan de 120 a 96 respecto a MOTOR-18; en la campaña, los 17 registros B/D01 recalculados mantienen su trayectoria, aunque cambian las sumas de ajuste por operación ([`comparacion-historica-M18.json`](evidencia-motor18b/RESUMEN-OPERATIVO.md)).

## 4 · Unidades (§9.1)

`min_tenths` y `liveTenths` = **décimas de segundo de juego vivo** (600 = 1 minuto; 24.000 = 40 minutos); el nombre histórico del campo se conserva y `claves.json` lo declara; una columna derivada en minutos se identificaría como derivada. Créditos tácticos = participaciones ponderadas por operación (9 créditos de B02 no son nueve posesiones: 15 participaciones × 0,60); dosis = horas equivalentes.

## 5 · Versiones y compatibilidad

| Elemento | Identidad |
|---|---|
| Aplicación | `MOTOR-18B` |
| Motor | `beM-motor-0.18.1-MOTOR18B` |
| Extensión | `SEM-MOTOR18B-20261022` |
| Conocimiento | `KNOW-MOTOR18-R1` (62 niveles, sin cambio) |
| Aprendizaje | `LEARN-MOTOR18B-R1` |
| Familiaridad y participantes | `FAM-MOTOR18B-R1` |
| Esencial | `ESE-MOTOR18B-R1` (lector del anterior conservado) |
| Entrada / export | `beM-match-input/7` · `beM-match-export/10` (cambios aditivos: `input.labMatchId`, unidades, alcance de la estimación) |

Un export de MOTOR-18 se **consulta** como histórico y no se reproduce con el motor 18B (la versión del motor lo distingue); un guardado de MOTOR-18 no se continúa en silencio. Los perfiles anteriores no se sustituyen: la biblioteca conserva su activo y ofrece activar la base 18B de forma explícita.

## 6 · Pruebas y evidencia

Regresiones agrupadas por propiedad en `tests/motor18b.test.js` (L18B-01…12, falla con el caso anterior y pasa con la corrección) y `tests/motor18b-campaign.test.js`; las expectativas de versión de MOTOR-18 se actualizaron con su motivo; `tests/fixtures/baseline-motor17b.json` conserva la huella anterior (`previousMotor18Sha256`) y documenta que solo cambia la cadena de identidad del perfil. L18 permanece como tabla **histórica** (perfil de MOTOR-18); L18B es nueva (`scripts/m18b-l18b-table.js`).

Campaña `MOTOR18B-CIERRE-20261022`: 36 ejecuciones planificadas (A 12 + B 16 + C 6 + D 2; no son 36 observaciones independientes), agenda y perfiles congelados antes de simular. Cifras reales, estado de cada comprobación y límites: [`evidencia-motor18b/RESUMEN-OPERATIVO.md`](evidencia-motor18b/RESUMEN-OPERATIVO.md) (generado desde los archivos finales). Recorrido real de Chromium: [`evidencia-motor18b/ui/recorrido-navegador.json`](evidencia-motor18b/ui/recorrido-navegador.json). Paquetes finales fuera de Git en `out/motor18b/entrega-final/` (`scripts/m18b-package.py`, `scripts/m18b-verify-delivery.py`).

Comandos: congelar `node scripts/m18b-campaign.js create --version=CONTROL17B --tree=<control> && … --version=M18B --tree=$PWD && node scripts/m18b-freeze.js --control=<control> --m18=$PWD`; simular `run`; auditoría `m18b-audit-regen.js`; tablas `m18b-compare.js`, `m18b-tables.js`, `m18b-l18b-table.js`, `m18b-evidence.js`, `m18b-summary.js`; paquetes `m18b-package.py` y `m18b-verify-delivery.py`.

## 7 · Límites

- Aceptación manual de Dennis, calibración deportiva global, conformidad FIBA integral y presupuesto de rendimiento del mundo (partidos simultáneos): no se cierran aquí. No se ejecutaron otros navegadores ni Node 24.
- La curva es una semilla de producto autorizada, sin evidencia empírica; C17-02 (gasto 3,5) sigue siendo una referencia provisional.
- Una semilla por contraste no mide efectos medios; no se ajustó nada mirando marcadores ni se eligió otra semilla.
- El coste observado se registra por ejecución sin extrapolar a cien o doscientos partidos.
