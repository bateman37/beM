// Mesa de ajustes por pregunta (MOTOR-03, §6.2): caminos de CONSULTA y posibles causas, vinculados a filas reales.
// No son diagnósticos automáticos ni recetas ejecutadas: ningún botón cambia valores. Los indicadores salen del acta del
// último encuentro con su fuente; si una parte del embudo aún no se registra, se dice. Nada se infiere del marcador.
import { teamTotals } from '../match/box.js';

const pct = (n, d, dec = 1) => (d > 0 ? `${((n / d) * 100).toFixed(dec).replace('.', ',')} %` : 'no calculable');
const ind = (label, value, denominator, source) => ({ label, value, denominator, source });

function counts(events, pick) { const o = {}; for (const e of events) { const k = pick(e); if (k) o[k] = (o[k] ?? 0) + 1; } return o; }
const attempts = (res) => res.events.filter((e) => e.type === 'attempt' && e.effects?.pConversion !== undefined);

export const QUESTIONS = [
  {
    id: 'triples', title: 'Se eligen demasiados triples',
    summary: 'Separa QUÉ tiro se elige (selección y preferencias) de CUÁNTO se acierta (eficacia del tiro). Subir la eficacia de un tiro no cambia cuántos se intentan, y viceversa.',
    sections: [
      { title: 'Selección: qué zona se elige', text: 'Orientación del estilo, peso de las salidas de cada ficha, ajuste por capacidad y vocación de finalización.', match: /^(selection\.(orientation|abilityFit|finishingVocationMix|priorityWeights)|plays\.[^.]+\.shotWeights\.)/ },
      { title: 'Eficacia: cuánto se acierta', text: 'Probabilidad de referencia y sensibilidades del triple y la media distancia, y calidad previa de la oportunidad.', match: /^(shots\.(three|midrange)\.(p0|sA|sD)|opportunity\.(qualityShotLogit|qualityBase|advantageSensitivity))/ },
    ],
    indicators(res) {
      const out = [];
      for (let t = 0; t < 2; t++) {
        const tt = teamTotals(res.box, res.input, t); const id = res.teams[t].id; const fga = tt.fg2a + tt.fg3a;
        out.push(ind(`${id} · triples sobre tiros de campo`, pct(tt.fg3a, fga), `${tt.fg3a}/${fga} intentos`, 'acta del último encuentro (tiros por tipo)'));
        out.push(ind(`${id} · acierto en triples`, pct(tt.fg3m, tt.fg3a), `${tt.fg3m}/${tt.fg3a}`, 'acta'));
      }
      return out;
    },
    pending: ['Oportunidades de triple disponibles y no tiradas (embudo de percepción SEL06) todavía no se registran: no se estima desde el marcador.'],
  },
  {
    id: 'perdidas', title: 'Hay demasiadas pérdidas',
    summary: 'Separa la OPORTUNIDAD y la decisión (cuánto bote o pase se elige y con qué valor) de la EJECUCIÓN y la oposición (control, robo, intercepción, fatiga).',
    sections: [
      { title: 'Oportunidad y decisión', text: 'Valor mínimo y coste esperado de una pérdida al elegir, pases adicionales y aceptación de oportunidades directas.', match: /^(selection\.(candidateRead|direct\.acceptanceFloor|safeReceiverWeights)|continuation\.)/ },
      { title: 'Ejecución y oposición', text: 'Masa base de pérdida, sensibilidad al control y recetas de bote y pase (aporte y oposición).', match: /^(outcomes\.(base\.(turnover|ballViolation|looseBall)|controlSensitivity|stealGivenTurnover|turnoverOutOfBoundsIfNotSteal|looseControlSensitivity)|tasks\.TAR0[67]\.)/ },
      { title: 'Fatiga de esas tareas', text: 'El deterioro por energía hace más probable perder el balón al final de un tramo largo.', match: /^(tasks\.TAR0[67]\.maxEnergyPenalty|energy\.(costPerLiveMinute|severityNodes))/ },
    ],
    indicators(res) {
      const out = []; const at = attempts(res);
      const byExec = counts(at, (e) => e.intent?.ejecucion);
      const causes = counts(res.events.flatMap((e) => (e.stats ?? []).filter((s) => s.k === 'tov').map((s) => ({ c: s.cause }))), (x) => x.c);
      for (let t = 0; t < 2; t++) { const tt = teamTotals(res.box, res.input, t); out.push(ind(`${res.teams[t].id} · pérdidas por posesión`, pct(tt.tov + tt.teamTov, res.diagnostics.possessions, 1), `${tt.tov + tt.teamTov} pérdidas / ${res.diagnostics.possessions} posesiones del encuentro`, 'acta y posesiones')); }
      out.push(ind('Acciones con bote / pase / sin ejecución previa', `${byExec.dribble ?? 0} / ${byExec.pass ?? 0} / ${byExec.none ?? 0}`, 'acciones resueltas con tiro o desenlace', 'hechos del encuentro (denominador por tipo de ejecución)'));
      out.push(ind('Causas de pérdida registradas', Object.entries(causes).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'ninguna', 'pérdidas del encuentro', 'hechos (estadísticas de pérdida)'));
      return out;
    },
    pending: ['Pérdidas evitadas por decisión (opciones descartadas por riesgo) no se registran: el embudo de oportunidad completo llega con MOTOR-04 y el registro avanzado con MOTOR-09.'],
  },
  {
    id: 'cansancio', title: 'El cansancio apenas se nota',
    summary: 'Separa el GASTO y la RECUPERACIÓN de energía de la SEVERIDAD (curva) y de la TAREA afectada: la fatiga solo cambia el resultado a través del deterioro máximo de cada tarea.',
    sections: [
      { title: 'Gasto y recuperación', text: 'Cuánta energía se pierde por minuto, cuánto pesa la Resistencia, la carga por tipo de juego y las recuperaciones.', match: /^(energy\.(costPerLiveMinute|baseEnduranceReference|enduranceSlope|enduranceFactorBounds|loadBounds|load\.|benchRecoveryPerLiveMinute|quarterRecovery|halftimeRecovery|overtimeIntervalRecovery)|motor02\.timeOutRecoveryEnergyPoints)/ },
      { title: 'Curva de severidad', text: 'Cuánto se nota la fatiga a cada nivel de energía (la penalización es severidad × deterioro de la tarea).', match: /^energy\.severityNodes$/ },
      { title: 'Tarea afectada: deterioro máximo', text: 'Puntos de capacidad que pierde cada tarea con la energía agotada.', match: /^(tasks\.[^.]+\.maxEnergyPenalty|energy\.(defaultPhysicalTaskMax|defaultTechnicalTaskMax|freeThrowTaskMax)|(rebound|block|contact)\.(maxEnergyPenalty|maximumEnergyPenalty)|rotation\.utilityMaxEnergyPenalty)$/ },
    ],
    indicators(res) {
      const out = []; const fe = res.diagnostics.finalEnergy;
      for (let t = 0; t < 2; t++) {
        const ids = res.input.teams[t].players.map((p) => p.id); const en = ids.map((id) => fe[id]);
        out.push(ind(`${res.teams[t].id} · energía final media / mínima`, `${(en.reduce((s, x) => s + x, 0) / en.length).toFixed(1).replace('.', ',')} / ${Math.min(...en).toFixed(1).replace('.', ',')}`, `${ids.length} jugadores`, 'estado final del encuentro'));
      }
      const subs = counts(res.events.filter((e) => e.type === 'substitution'), (e) => e.intent?.motivo);
      out.push(ind('Relevos por motivo', Object.entries(subs).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'ninguno', 'sustituciones del encuentro', 'hechos (sustituciones)'));
      return out;
    },
    pending: ['El efecto de la fatiga sobre el resultado no se mide aislado en un partido: usa la comparación base/candidata para ver la diferencia con tu cambio, sabiendo que es exploratoria.'],
  },
  {
    id: 'estrellas', title: 'Las estrellas salen demasiado',
    summary: 'Separa el UMBRAL de revisión (cuándo se plantea el cambio) de la UTILIDAD y las TOLERANCIAS (si el suplente es aceptable) y de la ESTABILIDAD de la rotación (tramos y descansos mínimos).',
    sections: [
      { title: 'Umbrales de revisión', text: 'Energía a partir de la cual se revisa el relevo, energía crítica y energía mínima del suplente.', match: /^rotation\.(reviewEnergy|criticalEnergy|benchReadyEnergy)$/ },
      { title: 'Utilidad y tolerancias', text: 'Cuánta utilidad puede perder una posición al cambiar y qué considera «buen sustituto» cada posición.', match: /^rotation\.(replacementUtilityTolerance|longStintTolerance|criticalReplacementTolerance|foulProtectionTolerance|slotAbilityWeights\.|utilityMaxEnergyPenalty)/ },
      { title: 'Estabilidad de la rotación', text: 'Tramos y descansos mínimos y máximos; protección de faltas.', match: /^rotation\.(minimumStintSeconds|minimumBenchSeconds|maximumNormalStintSeconds|foulProtection\.)/ },
      { title: 'Recuperación del banquillo', text: 'Cuánto se recupera mientras se descansa.', match: /^energy\.(benchRecoveryPerLiveMinute|severityNodes)$/ },
    ],
    indicators(res) {
      const out = [];
      const subs = res.events.filter((e) => e.type === 'substitution');
      for (let t = 0; t < 2; t++) {
        const mins = res.input.teams[t].players.map((p) => ({ id: p.id, min: res.box.players[p.id].min })).sort((x, y) => y.min - x.min).slice(0, 3);
        out.push(ind(`${res.teams[t].id} · minutos de los tres más utilizados`, mins.map((x) => `${x.id}: ${x.min.toFixed(1).replace('.', ',')}`).join(' · '), `${res.periodScores.length} periodos`, 'acta (minutos desde los hechos)'));
        out.push(ind(`${res.teams[t].id} · sustituciones`, `${subs.filter((e) => e.team === t).length}`, 'sustituciones del encuentro', 'hechos (sustituciones)'));
      }
      return out;
    },
    pending: ['Los minutos por jugador y por tramo están en el acta del partido; el librillo completo del entrenador llega con MOTOR-08.'],
  },
  {
    id: 'libro', title: 'El base sigue poco el libro',
    summary: 'Separa las PRIORIDADES del libro de la LIBERTAD que se concede al jugador, su Iniciativa y su LECTURA del juego: el libro solo manda en proporción a (1 − libertad efectiva).',
    sections: [
      { title: 'Prioridades del libro', text: 'Peso que recibe cada prioridad 1–5 y reparto de las salidas de cada ficha.', match: /^(selection\.priorityWeights|plays\.[^.]+\.shotWeights\.)/ },
      { title: 'Libertad, Iniciativa y lectura', text: 'Libertad máxima por nivel, mezcla de Iniciativa, mezcla de lectura (Visión y Decisiones), ajuste por capacidad y suelo de aceptación.', match: /^selection\.(freedom|initiativeMix|readingMix\.|abilityFit\.|direct\.acceptanceFloor)/ },
      { title: 'Coordinación del director', text: 'Receta de la tarea de coordinación (TAR01).', match: /^tasks\.TAR01\./ },
    ],
    indicators(res) {
      const out = [];
      for (let t = 0; t < 2; t++) {
        const plan = res.input.teams[t].plan; const prio = Object.fromEntries(plan.playbook.map((b) => [b.playId, b.priority]));
        const c = counts(attempts(res).filter((e) => e.team === t), (e) => e.intent?.origen);
        const orgTotal = Object.entries(c).filter(([k]) => prio[k] !== undefined).reduce((s, [, v]) => s + v, 0);
        out.push(ind(`${res.teams[t].id} · uso de fichas (prioridad)`, Object.entries(c).filter(([k]) => prio[k] !== undefined).map(([k, v]) => `${k} (P${prio[k]}): ${pct(v, orgTotal, 0)}`).join(' · ') || 'ninguna ficha resuelta', `${orgTotal} acciones de ficha`, 'hechos (origen de la acción) y libro del plan'));
        out.push(ind(`${res.teams[t].id} · acciones fuera de ficha (recursos y transición)`, `${Object.entries(c).filter(([k]) => prio[k] === undefined).reduce((s, [, v]) => s + v, 0)}`, 'acciones resueltas del equipo', 'hechos'));
      }
      return out;
    },
    pending: ['La desviación respecto a la llamada (procedencia llamada/autonomía/directo, SEL05) solo se registra parcialmente: no se reconstruye desde el marcador.'],
  },
  {
    id: 'rapido', title: 'El partido va demasiado rápido',
    summary: 'Separa la DURACIÓN DEPORTIVA (cuánto tarda un hecho en el reloj de juego, filas del perfil) de la VELOCIDAD DE VISIONADO (x2/x4/x8/x16: presentación, no deportiva).',
    sections: [
      { title: 'Duración deportiva', text: 'Distribuciones triangulares de cada hecho y factor por ritmo del estilo. Cambiarlas cambia cuántas posesiones caben en un cuarto.', match: /^(durationSeconds\.|selection\.organizedDurationFactor)/ },
      { title: 'Velocidad de visionado (solo consulta)', text: 'Parámetros de presentación: no alteran el deporte y no forman parte del perfil.', match: /^presentation\./ },
    ],
    indicators(res) {
      const total = res.events.reduce((s, e) => s + (e.durationTenths ?? 0), 0) / 10;
      return [
        ind('Posesiones del encuentro', `${res.diagnostics.possessions}`, `${res.periodScores.length} periodos`, 'posesiones registradas'),
        ind('Segundos de juego por posesión (media)', (total / res.diagnostics.possessions).toFixed(1).replace('.', ','), `${total.toFixed(0)} s de reloj consumidos`, 'duración de los hechos (reloj de juego)'),
      ];
    },
    pending: [],
  },
  {
    id: 'jugada', title: 'Se abusa de una jugada',
    summary: 'Separa la MASA DE FAMILIA y la elegibilidad (prioridades y reparto) de la ELECCIÓN y de la memoria rival, cuya cobertura está PENDIENTE (MEM01–MEM04, MOTOR-08): hoy la repetición no provoca que el rival se adapte.',
    sections: [
      { title: 'Masa y reparto', text: 'La masa de una familia es la de su mejor variante: más variantes de una misma familia no aumentan su masa.', match: /^(selection\.priorityWeights|plays\.[^.]+\.shotWeights\.)/ },
      { title: 'Continuaciones y reorganización', text: 'Con qué frecuencia se encadena un pase adicional o se reorganiza tras una negación.', match: /^continuation\./ },
    ],
    indicators(res) {
      const out = [];
      for (let t = 0; t < 2; t++) {
        const plan = res.input.teams[t].plan; const prio = Object.fromEntries(plan.playbook.map((b) => [b.playId, b.priority]));
        const c = Object.entries(counts(attempts(res).filter((e) => e.team === t), (e) => (prio[e.intent?.origen] !== undefined ? e.intent.origen : null))).sort((a, b) => b[1] - a[1]);
        const tot = c.reduce((s, [, v]) => s + v, 0);
        out.push(ind(`${res.teams[t].id} · ficha más usada`, c.length ? `${c[0][0]}: ${pct(c[0][1], tot)}` : 'ninguna', `${tot} acciones de ficha`, 'hechos y libro del plan'));
      }
      return out;
    },
    pending: ['Memoria rival y saturación (MEM01–MEM04): pendiente de MOTOR-08. No existe todavía un mecanismo que modere la repetición de una jugada.'],
  },
];

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export function questionRows(q, rows) {
  return q.sections.map((s) => ({ ...s, rows: rows.filter((r) => s.match.test(r.id)) }));
}
