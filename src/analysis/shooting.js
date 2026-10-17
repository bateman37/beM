// Tiro, calidad previa, mapa sectorial, asistencias, cuatro factores, producción y margen (MOTOR-10 §6, §8).
import { pctOf, ratio, eFG, TS, threeRate, ftPerFg, fgPointsPerAttempt, rating, tovPctConv, orebPctActa, drebPctActa, flatTotals, assistedPct } from './formulas.js';

export const QUALITY = [['comfortable', 'cómoda'], ['normal', 'normal'], ['forced', 'forzada']];
export const ZONE_LABEL = { rim: 'Aro / cercanía inmediata', inside: 'Resto de pintura', midrange: 'Media distancia', three: 'Triple' };

// Sectores funcionales Z01–Z10 (§8.1). El motor solo registra la zona (aro / pintura / media / triple): NO hay lateralidad. Se conserva esa menor
// resolución y nunca se reparten tiros entre izquierda y derecha para llenar el mapa.
export const SECTORS = [
  { id: 'Z01', label: 'Aro / cercanía inmediata', zones: ['rim'], resolution: 'registrado' },
  { id: 'Z02', label: 'Resto de pintura', zones: ['inside'], resolution: 'registrado' },
  { id: 'Z03–Z05', label: 'Media distancia (izquierda, central y derecha sin distinguir)', zones: ['midrange'], resolution: 'sin lateralidad: el motor registra la zona de media, no el lado', members: ['Z03', 'Z04', 'Z05'] },
  { id: 'Z06–Z10', label: 'Triple (esquinas, exteriores y central sin distinguir)', zones: ['three'], resolution: 'sin lateralidad: el motor registra el triple, no el sector', members: ['Z06', 'Z07', 'Z08', 'Z09', 'Z10'] },
  { id: 'desconocido', label: 'Sector desconocido', zones: [], resolution: 'sin dato de zona' },
];

const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
export const validShots = (shots) => shots.filter((s) => s.valid);

// Fila de tiro de campo a partir de una lista de tiros ya filtrada.
export function shotLine(shots) {
  const v = validShots(shots);
  const m = v.filter((s) => s.made);
  const t3 = v.filter((s) => s.zone === 'three');
  return { att: v.length, made: m.length, pct: pctOf(m.length, v.length), points: sum(m, (s) => s.points), three: { att: t3.length, made: t3.filter((s) => s.made).length }, excludedFoulMiss: shots.length - v.length };
}

export function sectorMap(shots) {
  const v = validShots(shots); const total = v.length;
  return SECTORS.map((s) => {
    const rows = v.filter((x) => (s.id === 'desconocido' ? !['rim', 'inside', 'midrange', 'three'].includes(x.zone) : s.zones.includes(x.zone)));
    const made = rows.filter((x) => x.made);
    return { ...s, att: rows.length, made: made.length, pct: pctOf(made.length, rows.length), freq: pctOf(rows.length, total), points: sum(made, (x) => x.points), shots: rows.map((x) => x.id) };
  });
}

// Detalle del tiro exterior/media por la FUNCIÓN que ocupaba el tirador en la disposición vigente (dato propio del hecho; el motor no registra el lado). Se conserva lo que
// existe y no se sortea izquierda/derecha: «esquina» sigue siendo Z06/Z10 sin distinguir el lado. Sin dato: sin disposición (transición/recurso) o no autorizado para la audiencia.
export const FN_LABEL = { corner: 'esquina (lado desconocido)', wing: 'ala (lado desconocido)', top: 'cabecera', elbow: 'codo (lado desconocido)', highInside: 'pintura alta', inside: 'pintura', block: 'bloque (lado desconocido)', lowInside: 'poste bajo' };
export function sectorDetail(shots) {
  const v = validShots(shots).filter((x) => x.zone === 'three' || x.zone === 'midrange'); const rows = new Map();
  for (const x of v) {
    const fn = !('shooterFn' in x) ? '__hidden' : (x.shooterFn ?? '__none'); const key = `${x.zone}|${fn}`;
    const r = rows.get(key) ?? { zone: x.zone, fn, label: fn === '__hidden' ? 'función del tirador: información propia (no autorizada para esta audiencia)' : fn === '__none' ? 'sin disposición (transición o recurso): función desconocida' : (FN_LABEL[fn] ?? fn), att: 0, made: 0, ids: [] };
    r.att += 1; if (x.made) r.made += 1; r.ids.push(x.id); rows.set(key, r);
  }
  return [...rows.values()].sort((a, b) => (a.zone === b.zone ? b.att - a.att : a.zone < b.zone ? 1 : -1)).map((r) => ({ ...r, pct: pctOf(r.made, r.att) }));
}

// Calidad previa al desenlace (clasificación existente del motor). No se recalcula desde el acierto ni desde una probabilidad.
export function qualityTable(shots) {
  const v = validShots(shots); const total = v.length;
  const rows = [...QUALITY.map(([k, label]) => ({ k, label })), { k: null, label: 'sin clasificar' }].map((q) => {
    const r = v.filter((s) => (q.k == null ? !['comfortable', 'normal', 'forced'].includes(s.quality) : s.quality === q.k)); const m = r.filter((s) => s.made);
    return { ...q, att: r.length, made: m.length, pct: pctOf(m.length, r.length), freq: pctOf(r.length, total), shots: r.map((s) => s.id) };
  });
  return rows.filter((r) => r.k != null || r.att > 0);
}

// Estado de asistencia por tiro: criterio verificable (S09-03 cap. 6 según extracto de ChatGPT, sin lectura directa del PDF) con los estados funcionales reales.
export function assistState(shot, acta) {
  const credited = !!shot.credit;
  const hasFeedPub = shot.passer != null; // el pasador es observable; la ficha completa (`feed`) es propia
  if (shot.fromFoul && !shot.made) return { state: 'serie', credited: false, reason: 'tiro fallado con falta: la asistencia se evalúa en la serie de libres (una por serie con al menos un libre convertido)' };
  if (!hasFeedPub) return { state: 'sin pase final', credited, reason: 'sin último pase elegible: no hay candidato' };
  if (shot.moved) return { state: 'creación nueva', credited, reason: 'el receptor creó su propia ventaja con movimiento: el mero pase previo no basta' };
  if (shot.zone === 'rim' || shot.zone === 'inside') return { state: 'recepción interior', credited, reason: 'recibe y anota dentro de la pintura sin abandonar la zona' };
  return { state: 'recepción exterior', credited, reason: 'recibe y anota fuera de la pintura sin bote' };
}
export const ASSIST_STATES = ['recepción interior', 'recepción exterior', 'creación nueva', 'serie', 'sin pase final'];

export function assistReading(shots, acta, team) {
  const made = validShots(shots).filter((s) => s.made && s.team === team);
  const by = {}; for (const s of made) { const st = assistState(s, acta).state; by[st] = (by[st] ?? 0) + 1; }
  const astFg = made.filter((s) => s.credit).length;
  return { eligible: made.length, astFg, pct: assistedPct(astFg, made.length), byState: by, note: 'AS-C sobre canastas de campo válidas elegibles; AS-L y AS total quedan fuera de esta tasa (no se impone AS ≤ FGM).' };
}

// Cuatro factores (§6.3): cada equipo, con las dos versiones de pérdidas claramente nombradas.
export function fourFactors(ix, coef = 0.44) {
  const T = ix.acta.teams.map(flatTotals); const poss = [0, 1].map((t) => ix.acta.possessions.filter((p) => p.team === t).length);
  return [0, 1].map((t) => {
    const a = T[t]; const b = T[1 - t];
    return {
      team: t, eFG: eFG(a), tov100: ratio(a.tov, poss[t], { scale: 100, unit: 'PER/100 ataques', reason: 'sin posesiones' }), tovConv: tovPctConv(a, coef), oreb: orebPctActa(a, b), dreb: drebPctActa(a, b), ftRate: ftPerFg(a), threeRate: threeRate(a), ts: TS(a, coef), fgPpa: fgPointsPerAttempt(a),
      note: 'PER/100 ataques es exacto bajo la convención beM (denominador: posesiones registradas); TOV % convencional es otra estimación (denominador: TCI + 0,44·TLI + PER). No se mezclan.',
    };
  });
}

export function ratings(ix) {
  const T = ix.acta.teams; const poss = [0, 1].map((t) => ix.acta.possessions.filter((p) => p.team === t).length);
  return [0, 1].map((t) => ({ team: t, poss: poss[t], ortg: rating(T[t].points, poss[t]), drtg: rating(T[1 - t].points, poss[1 - t]), net: (() => { const o = rating(T[t].points, poss[t]); const d = rating(T[1 - t].points, poss[1 - t]); return o.value == null || d.value == null ? { value: null, reason: 'universo incompleto' } : { value: o.value - d.value, unit: 'pts/100' }; })(), note: 'ORtg/DRtg globales del equipo: incluyen puntos administrativos bajo la política global declarada.' }));
}

// Duración realmente disputada D (min) y ritmo con L reglamentaria.
export function paceReading(ix, L = 40) {
  const D = ix.totalTenths / 600; const poss = [0, 1].map((t) => ix.acta.possessions.filter((p) => p.team === t).length);
  return { D, L, possessions: poss, pace: D > 0 ? L * ((poss[0] + poss[1]) / 2) / D : null, unit: 'posesiones por L minutos', note: 'D incluye las prórrogas jugadas y excluye pausas.' };
}

// Producción: dos particiones excluyentes y etiquetas de contexto solapadas (§6.4). Las etiquetas NO se suman para explicar el margen.
export function production(ix, cfg = { clockEndTenths: 40 }) {
  const out = []; const pe = ix.acta.pointEvents; const A = ix.acta;
  for (const t of [0, 1]) {
    const mine = pe.filter((p) => p.team === t);
    const byKind = { fg2: 0, fg3: 0, ft: 0, admin: 0 };
    for (const p of mine) { if (p.kind === 'fg') (p.zone === 'three' ? (byKind.fg3 += p.pts) : (byKind.fg2 += p.pts)); else if (p.kind === 'ft') byKind.ft += p.pts; else byKind.admin += p.pts; }
    const finalsIds = new Set(A.finals.map((f) => f.id));
    const fPts = mine.filter((p) => p.kind === 'fg' || (p.kind === 'ft' && p.linked && finalsIds.has(p.linked))).reduce((s, p) => s + p.pts, 0);
    const sanction = mine.filter((p) => p.kind === 'ft' && !(p.linked && finalsIds.has(p.linked))).reduce((s, p) => s + p.pts, 0);
    const admin = byKind.admin;
    // etiquetas (solapables)
    const label = (f) => mine.filter(f).reduce((s, p) => s + p.pts, 0);
    const shotOf = (p) => ix.shots.find((s) => s.id === p.event);
    const possOf = (p) => ix.possessions.find((x) => x.id === p.possession);
    const evOf = (p) => ix.byId[p.event];
    const afterOreb = (p) => { const pos = possOf(p); if (!pos) return false; const reb = pos.events.find((e) => (e.stats ?? []).some((x) => x.k === 'reb' && x.off)); return !!reb && p.seq > reb.seq; };
    const labels = {
      paint: label((p) => p.kind === 'fg' && (p.zone === 'rim' || p.zone === 'inside')),
      bench: label((p) => p.kind === 'fg' && p.player && !ix.players[p.player]?.starter),
      afterTurnover: label((p) => { const pos = possOf(p); return !!pos && (pos.origin === 'robo' || pos.origin === 'pérdida'); }),
      transition: label((p) => p.kind === 'fg' && shotOf(p)?.pub.contexto === 'transición'),
      secondChance: label((p) => afterOreb(p)),
      restart: label((p) => !!evOf(p)?.intent?.saque),
      clockEnd: label((p) => p.kind === 'fg' && (evOf(p)?.shotClock?.after ?? 999) <= cfg.clockEndTenths),
    };
    out.push({ team: t, partitionKind: { ...byKind, total: byKind.fg2 + byKind.fg3 + byKind.ft + byKind.admin }, partitionOrigin: { f: fPts, sanction, administrative: admin, total: fPts + sanction + admin }, labels });
  }
  return out;
}

// Explicación aritmética del margen del tanteo de cancha: diferencia por dos, tres, libres y créditos especiales.
export function marginExplanation(ix) {
  const P = production(ix); const a = P[0].partitionKind; const b = P[1].partitionKind;
  const parts = [['Tiros de dos', a.fg2 - b.fg2], ['Triples', a.fg3 - b.fg3], ['Libres', a.ft - b.ft], ['Créditos administrativos', a.admin - b.admin]];
  const total = parts.reduce((s, x) => s + x[1], 0);
  return { parts, total, margin: ix.acta.score[0] - ix.acta.score[1], ok: total === ix.acta.score[0] - ix.acta.score[1] };
}
