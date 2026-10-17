// Trabajo útil sin balón (MOTOR-10 §12). Cada aportación se deriva de tareas REALMENTE resueltas por el núcleo y de los hechos que ya conservan su efecto.
// Una aportación sin evidencia suficiente se declara con su dependencia concreta; un fallo no demuestra ayuda buena ni un acierto utilidad del bloqueador.
import { pctOf } from './formulas.js';

// `status`: derivado = salió de hechos existentes; parcial = solo una parte de la evidencia mínima; dependencia = falta el productor/dato.
export const OFFBALL_CATALOG = [
  { id: 'OB01', label: 'Pantalla útil', evidence: 'Pantalla legal ejecutada que produce un contexto favorable registrado (calidad cómoda o ventana libre).', status: 'derivado' },
  { id: 'OB02', label: 'Canasta tras pantalla', evidence: 'Vínculo de cadena con la finalización; indicador propio, no AS del bloqueador.', status: 'derivado' },
  { id: 'OB03', label: 'Corte disponible / utilizado', evidence: 'Corte realmente ejecutado (utilización) y, desde MOTOR-11, el corte ante negación que la propia operación evaluó (disponible y aceptado o no). Una opción de corte que ninguna operación evaluó no existe como hecho.', status: 'instrumentado', dependency: 'Partidos anteriores a MOTOR-11: la disponibilidad evaluada no se conservó (no registrado, sin cifra).' },
  { id: 'OB04', label: 'Desmarque útil', evidence: 'Recepción resuelta con ventana libre o calidad cómoda.', status: 'derivado' },
  { id: 'OB05', label: 'Ocupación que limita ayuda', evidence: 'Desde MOTOR-11, resultado de la propia operación de ayuda: elegibles, ocupados por compromisos previos de la posesión, bloqueados por no abandonar y candidatos finales. Solo interacciones interiores donde la ayuda se evaluó.', status: 'instrumentado', dependency: 'Partidos anteriores a MOTOR-11: el cálculo de ayuda no conservó qué ocupación la limitó (no registrado, sin cifra).' },
  { id: 'OB06', label: 'Continuación / apertura', evidence: 'Continuación resuelta con su receptor y resultado local.', status: 'derivado' },
  { id: 'OB07', label: 'Ayuda pertinente', evidence: 'Intervención, efecto local y continuidad.', status: 'derivado' },
  { id: 'OB08', label: 'Recuperación de responsabilidad', evidence: 'Redistribución real (relevo) y su llegada.', status: 'derivado' },
  { id: 'OB09', label: 'Seguimiento de pantalla', evidence: 'Respuesta ejecutada (seguimiento) y si la opción fue conservada o concedida.', status: 'derivado' },
  { id: 'OB10', label: 'Cierre útil', evidence: 'Encargo de carga de rebote y captura por un cargador asignado.', status: 'derivado' },
  { id: 'OB11', label: 'Desvío sin recuperación', evidence: 'Intento de robo sin control (no se convierte en REC).', status: 'derivado' },
  { id: 'OB12', label: 'Disputa recuperada', evidence: 'Balón suelto disputado y control final (distinto del rebote).', status: 'derivado' },
];

export function offBall(ix, team, ctx = null) {
  const att = ix.events.filter((e) => e.type === 'attempt' && e.team === team);
  const defAtt = ix.events.filter((e) => e.type === 'attempt' && e.team !== team); // las defensas de `team` actúan sobre ataques rivales
  const sh = (e) => (e.stats ?? []).find((x) => x.k === 'shot');
  const favorable = (e) => e.intent?.calidad === 'comfortable' || e.effects?.ventanaLibre === true;
  const withScreen = att.filter((e) => e.participants?.screener && ['pick_and_roll', 'off_ball_screen', 'handoff'].includes(e.intent?.familia));
  const out = {};
  out.OB01 = { n: withScreen.length, useful: withScreen.filter(favorable).length, ids: withScreen.filter(favorable).map((e) => e.id) };
  out.OB02 = { n: withScreen.filter((e) => sh(e)).length, made: withScreen.filter((e) => sh(e)?.made).length, ids: withScreen.filter((e) => sh(e)?.made).map((e) => e.id) };
  const cuts = att.filter((e) => e.participants?.cutter);
  // OB03 (disponibilidad evaluada) y OB05 son información PROPIA de ese equipo o de diagnóstico: la audiencia pública no ve candidatos ni ocupaciones internas
  const allowedInstr = ctx == null || ctx.audience === 'diagnostic' || (ctx.audience === 'own' && ctx.team === team);
  const instrumented = allowedInstr && ix.res.diagnostics?.instrumentation != null; // el partido se produjo con un motor que conserva el dato (no se rellena retrospectivamente)
  const cutEv = att.filter((e) => e.instr?.cut);
  out.OB03 = { used: cuts.length, madeAfter: cuts.filter((e) => sh(e)?.made).length, available: instrumented ? { evaluated: cutEv.length, available: cutEv.filter((e) => e.instr.cut.disponible).length, accepted: cutEv.filter((e) => e.instr.cut.aceptada).length } : null, ids: cuts.map((e) => e.id) };
  const recs = att.filter((e) => e.participants?.receiver && e.stats?.some((x) => x.k === 'shot'));
  out.OB04 = { n: recs.length, useful: recs.filter(favorable).length, ids: recs.filter(favorable).map((e) => e.id) };
  const helpEv = defAtt.filter((e) => e.instr?.help);
  out.OB05 = instrumented ? { n: helpEv.length, limited: helpEv.filter((e) => e.instr.help.ocupados > 0).length, noCandidates: helpEv.filter((e) => e.instr.help.decide === 'sin candidatos').length, blockedByDoNotAbandon: helpEv.filter((e) => e.instr.help.noAbandonar > 0).length, ids: helpEv.map((e) => e.id) } : null;
  const conts = att.filter((e) => e.intent?.continuacion);
  out.OB06 = { n: conts.length, made: conts.filter((e) => sh(e)?.made).length, ids: conts.map((e) => e.id) };
  const helps = defAtt.filter((e) => e.intent?.defensa?.ayuda);
  out.OB07 = { n: helps.length, arrived: helps.filter((e) => e.intent.defensa.ayuda.llega).length, ids: helps.map((e) => e.id) };
  out.OB08 = { n: helps.filter((e) => e.intent.defensa.ayuda.relevo).length, arrived: helps.filter((e) => e.intent.defensa.ayuda.relevoLlega).length, ids: helps.filter((e) => e.intent.defensa.ayuda.relevo).map((e) => e.id) };
  const seg = defAtt.filter((e) => e.intent?.cobertura?.seguimiento);
  out.OB09 = { n: seg.length, kept: seg.filter((e) => e.intent.cobertura.seguimiento.sigue).length, ids: seg.map((e) => e.id) };
  const rebs = ix.events.filter((e) => e.type === 'rebound' && e.effects?.encargos && (e.stats ?? []).some((x) => x.k === 'reb' && x.team === team && x.off));
  const withTask = rebs.filter((e) => e.effects.encargos.cargan?.length);
  out.OB10 = { n: withTask.length, byLoader: withTask.filter((e) => e.effects.encargos.cargan.includes(e.participants?.captor)).length, ids: withTask.map((e) => e.id) };
  const dev = defAtt.filter((e) => e.effects?.cadenaRobo?.intento && !e.effects.cadenaRobo.control);
  out.OB11 = { n: dev.length, ids: dev.map((e) => e.id) };
  const loose = ix.events.filter((e) => e.type === 'loose_ball' && (e.participants?.disputa ?? []).some((id) => ix.teamOf[id] === team));
  out.OB12 = { n: loose.length, recovered: loose.filter((e) => (e.effects?.control === 'ataque' ? e.team : (e.effects?.recupera ? ix.teamOf[e.effects.recupera] : null)) === team).length, ids: loose.map((e) => e.id) };
  return out;
}

export function offBallRows(ix, team, ctx = null) {
  const d = offBall(ix, team, ctx);
  const f = (id) => { const x = d[id]; return x; };
  const line = (id, text, ids) => ({ ...OFFBALL_CATALOG.find((c) => c.id === id), value: text, evidence_ids: ids ?? [] });
  return OFFBALL_CATALOG.map((c) => {
    const x = f(c.id); if (!x) return { ...c, value: (c.id === 'OB05' || c.id === 'OB03') && ctx && !(ctx.audience === 'diagnostic' || (ctx.audience === 'own' && ctx.team === team)) ? 'información propia o de diagnóstico: no autorizada para esta audiencia' : 'no registrado: ' + c.dependency, evidence_ids: [] };
    const txt = { OB01: `${x.useful} de ${x.n} pantallas con contexto favorable`, OB02: `${x.made} canastas en ${x.n} finalizaciones tras pantalla`, OB03: `${x.used} cortes utilizados (${x.madeAfter} canastas); ${x.available ? `${x.available.available} de ${x.available.evaluated} cortes ante negación evaluados estaban disponibles (${x.available.accepted} aceptados)` : 'disponibilidad no registrada'}`, OB05: x.n === undefined ? '' : `${x.limited} de ${x.n} evaluaciones de ayuda limitadas por ocupación previa; ${x.noCandidates} sin candidatos; ${x.blockedByDoNotAbandon} con candidatos bloqueados por no abandonar`, OB04: `${x.useful} de ${x.n} recepciones de tiro con contexto favorable`, OB06: `${x.made} canastas en ${x.n} continuaciones`, OB07: `${x.arrived} de ${x.n} ayudas llegan`, OB08: `${x.arrived} de ${x.n} relevos llegan`, OB09: `${x.kept} de ${x.n} seguimientos mantienen la opción`, OB10: `${x.byLoader} de ${x.n} capturas ofensivas con encargo, por un cargador asignado`, OB11: `${x.n} intentos de robo sin control`, OB12: `${x.recovered} de ${x.n} disputas recuperadas` }[c.id];
    return { ...c, value: txt, counts: x, evidence_ids: x.ids ?? [] };
  });
}
export { pctOf };
