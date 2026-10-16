// Memoria defensiva colectiva pequeña (MOTOR-08, MEM01–MEM04). Una por equipo defensor, persistente dentro del encuentro y con un máximo de ocho
// patrones activos. Registra EXPOSICIÓN y calidad observable de la oportunidad ANTES de conocer el acierto, con decaimiento por ataques rivales
// (e = e·2^(−n/semivida)) y saturación. Reconocer un patrón solo habilita PROPONER una respuesta (coach.js); nunca resta acierto ni modifica una
// probabilidad: la respuesta, si se autoriza, cambia preparación o plan y se resuelve con las operaciones deportivas de siempre.
import { MatchCore } from './core.js';
import { round } from './mathx.js';

const P = MatchCore.prototype;

P.initMemory = function initMemory() {
  this.mem = [{ entries: [] }, { entries: [] }];
  this.memLog = []; // exposiciones, reconocimientos, respuestas, reemplazos y descartes (compacto: una fila por hecho, sin instantáneas completas)
  this.memSeq = 0;
};

P.memCfg = function memCfg() { return this.profile.memory; };

// ---------------------------------------------------------------- calidad observable de la oportunidad (causas deportivas, no un número oculto)
// «Cómoda» exige un hecho que la sostenga: receptor libre, ventana por ayuda sin relevo, cobertura superada o distancia concedida con calidad cómoda.
// «Incómoda»: la oportunidad fue negada o forzada. En otro caso, disputada. La etiqueta ESP no es prueba de nada.
P.observableOpportunity = function observableOpportunity(ex) {
  const o = this.memCfg().keys.opportunity; const causes = [];
  const cv = ex.cobertura;
  if (ex.window) causes.push('receiverFree');
  if (ex.helpWindow && !ex.window) causes.push('helpWindow');
  if (ex.coordFailure) causes.push('coordinationFailure');
  if (cv && (cv.seguimiento?.sigue === false || cv.cambio?.completa === false || cv.show?.recupera === false || cv.rotacion?.llega === false || cv.porDebajo?.recupera === false)) causes.push('coverageBeaten');
  if (ex.exec === 'dribble' && ex.pressureClose === false) causes.push('distanceConceded');
  const strong = causes.filter((c) => o.strongCauses.includes(c)); const weak = causes.filter((c) => o.weakCauses.includes(c));
  let cls = 'contested';
  if (strong.length || (weak.length && ex.quality?.cls === o.weakNeedsQuality)) cls = 'comfortable';
  else if (ex.quality?.cls === 'forced') cls = 'uncomfortable';
  return { cls, causes };
};

// ---------------------------------------------------------------- identidad semántica (MEM01): familia/recurso y salida, no el id de la ficha
P.memKey = function memKey(ex) {
  const k = this.memCfg().keys; const chain = ex.chain ?? [];
  const hd = k.helpDump;
  if (chain.includes(hd.chainLabel) && ex.helper) {
    return { key: `${hd.family}|${hd.role}`, family: hd.family, role: hd.role, specific: { helper: ex.helper, abandoned: ex.actor } };
  }
  let family; let role;
  if (ex.family) { family = k.familyMap[ex.family] ?? ex.family; role = ex.role ?? 'salida'; }
  else if (ex.procedencia === 'saque') { family = 'throwIn'; role = ex.origin; }
  else { family = k.directFamily; role = ex.origin ?? 'recurso'; }
  return { key: `${family}|${role}`, family, role, specific: { actor: ex.actor } };
};

// ---------------------------------------------------------------- evidencia efectiva (decaimiento perezoso por ataques rivales)
const decayFactor = (cfg, n) => 2 ** (-n / cfg.halfLifeAttacks);
P.memEffective = function memEffective(ent, now) { return ent.evidence * decayFactor(this.memCfg(), Math.max(0, now - ent.ref)); };
const comfortOf = (ent, f) => { const c = ent.comfort; const tot = (c.comfortable + c.contested + c.uncomfortable) * f; return tot > 0 ? (c.comfortable * f) / tot : 0; };

P.memLogPush = function memLogPush(type, team, data) {
  this.memSeq += 1;
  this.memLog.push({ n: this.memSeq, tipo: type, equipo: this.teams[team].id, periodo: this.period, reloj: round(this.clock / 10, 1), ...data });
};

// Una exposición válida por patrón y ataque continuo (la posesión del motor: un rebote ofensivo o una continuación pertenecen al mismo ataque).
P.memObserve = function memObserve(ex) {
  const poss = this.poss; if (!poss || ex.team == null) return;
  const off = ex.team; const def = 1 - off; const opp = this.observableOpportunity(ex);
  const rec = this.attackRecord?.(off, poss.id); if (rec && opp.cls === 'comfortable') rec.comfortable += 1;
  if (ex.coordFailure) this.coachFact('coordinationFailure', off); // la ayuda deja libre al receptor y el relevo no cubre o no llega
  if (!this.mem) return;
  const k = this.memKey(ex); const seen = (poss.memSeen ??= new Set());
  if (seen.has(k.key)) return; seen.add(k.key);
  this.memUpdate(def, off, k, opp, ex);
};

P.memUpdate = function memUpdate(defT, off, k, opp, ex) {
  const cfg = this.memCfg(); const M = this.mem[defT]; const now = this.attackSeq[off];
  let ent = M.entries.find((e) => e.key === k.key);
  if (!ent) {
    if (M.entries.length >= cfg.capacity) { // reemplazo: menor evidencia efectiva; desempate por mayor antigüedad y después clave estable
      const ranked = [...M.entries].map((e) => ({ e, v: this.memEffective(e, now) })).sort((a, b) => a.v - b.v || a.e.lastAttack - b.e.lastAttack || (a.e.key < b.e.key ? -1 : 1));
      const victim = ranked[0].e; M.entries.splice(M.entries.indexOf(victim), 1);
      this.memLogPush('reemplazo', defT, { sale: victim.key, evidenciaEfectiva: round(ranked[0].v, 3), entra: k.key });
    }
    this.memLogPush('inserción', defT, { clave: k.key, ataque: now, ocupadas: M.entries.length + 1 }); // MOTOR-09: se distingue la inserción inicial del reemplazo, el descarte y la actualización
    ent = { key: k.key, pattern: this.memCfg().patterns.find((p) => p.family === k.family && p.role === k.role)?.id ?? null, family: k.family, role: k.role, evidence: cfg.initialEvidence, ref: now, firstAttack: now, lastAttack: now, exposures: 0, comfort: { comfortable: 0, contested: 0, uncomfortable: 0 }, actors: {}, helpers: {}, abandoned: {}, zones: {}, response: null, lastAdjust: null };
    M.entries.push(ent);
  }
  // primero el decaimiento pendiente, después el incremento; se actualiza la referencia (un tramo de decaimiento nunca se aplica dos veces)
  const before = this.memEffective(ent, now); const f = decayFactor(cfg, Math.max(0, now - ent.ref));
  for (const c of Object.keys(ent.comfort)) ent.comfort[c] *= f;
  ent.evidence = Math.min(cfg.saturation, before + cfg.incrementPerExposure); ent.ref = now; ent.lastAttack = now; ent.exposures += 1;
  ent.comfort[opp.cls] += 1;
  const a = k.specific.actor; const h = k.specific.helper;
  if (a) { ent.actors[a] = (ent.actors[a] ?? 0) + 1; this.memTrim(ent.actors, cfg.specificContextMaxActors); }
  if (h) { ent.helpers[h] = (ent.helpers[h] ?? 0) + 1; this.memTrim(ent.helpers, cfg.specificContextMaxActors); }
  if (k.specific.abandoned) { ent.abandoned[k.specific.abandoned] = (ent.abandoned[k.specific.abandoned] ?? 0) + 1; this.memTrim(ent.abandoned, cfg.specificContextMaxActors); }
  const z = ex.zone ?? 'sin zona'; ent.zones[z] = (ent.zones[z] ?? 0) + 1;
  this.memLogPush('exposición', defT, { entrada: ent.exposures > 1 ? 'actualización' : 'nueva', ataque: now, clave: k.key, calidad: opp.cls, causas: opp.causes, evidenciaAntes: round(before, 3), evidenciaDespues: round(ent.evidence, 3), posesion: this.poss?.id ?? null });
  // descarte por irrelevancia: efectiva por debajo del umbral (sin tocar la entrada que acaba de observarse)
  for (const e of [...M.entries]) if (e !== ent) { const v = this.memEffective(e, now); if (v < cfg.discardThreshold) { M.entries.splice(M.entries.indexOf(e), 1); this.memLogPush('descarte', defT, { clave: e.key, evidenciaEfectiva: round(v, 3), umbral: cfg.discardThreshold }); } }
};
P.memTrim = function memTrim(map, max) {
  const ks = Object.keys(map); if (ks.length <= max) return;
  const worst = ks.sort((a, b) => map[a] - map[b] || (a < b ? -1 : 1))[0]; delete map[worst];
};

// Resumen acotado para la vista del entrenador y el diagnóstico (no copia el historial ni calcula nada con azar).
const top = (map) => { const ks = Object.keys(map).sort((a, b) => map[b] - map[a] || (a < b ? -1 : 1)); return ks.length ? ks[0] : null; };
P.memorySummary = function memorySummary(defT) {
  const cfg = this.memCfg(); const off = 1 - defT; const now = this.attackSeq[off];
  return this.mem[defT].entries.map((e) => {
    const f = decayFactor(cfg, Math.max(0, now - e.ref)); const ev = e.evidence * f;
    const pattern = cfg.patterns.find((p) => p.id === e.pattern) ?? null;
    return { key: e.key, pattern: e.pattern, patternName: pattern?.name ?? null, evidence: ev, comfortableShare: comfortOf(e, f), exposures: e.exposures, attacksSinceLast: now - e.lastAttack, zones: { ...e.zones },
      specific: { actor: top(e.actors), helper: top(e.helpers), abandoned: top(e.abandoned) }, response: e.response ? { ...e.response } : null, lastAdjust: e.lastAdjust ? { ...e.lastAdjust } : null };
  }).filter((x) => x.evidence >= cfg.discardThreshold).sort((a, b) => b.evidence - a.evidence || (a.key < b.key ? -1 : 1));
};
P.memoryEntry = function memoryEntry(defT, key) { return this.mem[defT].entries.find((e) => e.key === key) ?? null; };
P.memorySnapshot = function memorySnapshot() {
  return this.mem.map((M, t) => ({ equipo: this.teams[t].id, ataquesRivales: this.attackSeq[1 - t], entradas: this.memorySummary(t).map((e) => ({ ...e, evidence: round(e.evidence, 3), comfortableShare: round(e.comfortableShare, 3) })) }));
};

// ---------------------------------------------------------------- ruta B (MOTOR-09 §16.3): preparación dentro de la acción
// El reconocimiento prepara, al llegar la interacción pertinente, una cobertura YA permitida dentro del encargo actual: una respuesta declarada del catálogo
// MEM/DEF, compatible con la familia y sin cambiar el plan. No abre una ventana administrativa, no cambia silenciosamente una organización o cobertura
// bloqueadas, no garantiza leer bien y no concede un bonus de acierto ni de robo: la ejecución real (participantes y capacidades) la resuelve beginCoverage.
// Una misma evidencia no aplica A y B como ventajas acumuladas: si la ruta A ya tiene la respuesta pendiente o activa, se registra continuidad.
P.preparedCoverage = function preparedCoverage(entry, poss, ex) {
  const cfg = this.profile.memory.routeB;
  if (!cfg?.enabled || !this.mem || !this.coachState) return null;
  const defT = 1 - poss.team; const off = poss.team; const st = this.coachState[defT];
  const k = this.memKey(ex); const ent = this.memoryEntry(defT, k.key);
  if (!ent) return null;
  const mem = this.memCfg(); const pol = this.profile.coach.policies[st.policy]; const now = this.attackSeq[off];
  const f = decayFactor(mem, Math.max(0, now - ent.ref)); const ev = ent.evidence * f;
  if (ev < pol.recognitionThreshold || comfortOf(ent, f) < mem.recognition.minComfortableShare) return null; // sin reconocimiento no hay preparación
  const pattern = mem.patterns.find((p) => p.family === k.family && p.role === k.role);
  if (!pattern) return null;
  const record = (resultado, motivo, extra = {}) => {
    const row = { clave: k.key, patron: pattern.id, resultado, motivo, posesion: poss.id, ataque: now, ...extra };
    this.memLogPush('preparación', defT, row); return row;
  };
  if (!st.delegation.adjustments) return null; // ámbito no delegado: queda como recomendación (ruta A lo registra)
  if ((poss.routeB ?? 0) >= cfg.maxPerAttack) return null;
  const cands = mem.responses.filter((r) => r.pattern === pattern.id && r.order.type === 'defCoverage' && !r.order.navigation).sort((a, b) => a.priority - b.priority);
  if (!cands.length) return null;
  const plan = this.teams[defT].plan;
  const locks = this.manualLocks(defT); const pend = this.pendingPlanFields(defT);
  if (locks.has('defCoverage')) { poss.routeB = (poss.routeB ?? 0) + 1; record('impedida', `orden manual vigente sobre la cobertura (${locks.get('defCoverage')}): no se prepara nada`); return null; }
  if (pend.has('defCoverage')) { poss.routeB = (poss.routeB ?? 0) + 1; record('continuidad', 'la ruta A ya tiene una orden de cobertura pendiente para esta evidencia: no se aplica también la ruta B'); return null; }
  for (const c of cands) {
    const cob = c.order.coverage;
    if (plan.coverage === cob) { poss.routeB = (poss.routeB ?? 0) + 1; record('continuidad', `la respuesta ${c.id} (${cob}) ya está activa en el plan: preparación continuada, no un cambio de plan`, { respuesta: c.id, cobertura: cob }); return null; }
    if (!this.coverageCompatible(k.family === 'pnr' ? 'pnr' : k.family, cob).ok) continue;
    poss.routeB = (poss.routeB ?? 0) + 1;
    return { cob, response: c.id, trace: record('preparada', `${c.id}: ${cob} dentro del encargo actual; sin cambio de plan ni bonus`, { respuesta: c.id, cobertura: cob, planVigente: plan.coverage }) };
  }
  return null;
};
