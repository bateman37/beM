// Análisis defensivo (MOTOR-10 §10): organización efectiva, coberturas, cadena de ayuda y responsabilidades. Solo intervenciones realmente resueltas.
import { ratio, pctOf } from './formulas.js';
import { FAMILY_LABEL } from './offense.js';

const pnum = (id) => Number(String(id).replace(/\D/g, ''));

// Organización defensiva efectiva de `defTeam` al comienzo de la posesión rival `p`: plan inicial + órdenes defOrg activadas antes.
// Una orden activada DENTRO de la posesión la convierte en «mixta». El hecho de tiro no registra la organización por sí mismo: dependencia declarada.
export function orgFor(ix, defTeam, p) {
  let org = ix.input.teams[defTeam].plan.defense; let mixed = false;
  const orders = (ix.res.orders ?? []).filter((o) => o.team === defTeam && o.type === 'defOrg' && o.activation && ['vigente', 'consumida', 'suspendida', 'sustituida'].includes(o.state));
  const seqOf = (id) => ix.byId[id]?.seq ?? 0;
  for (const o of orders.sort((a, b) => a.activation.step - b.activation.step)) {
    const a = o.activation; const before = a.possession ? pnum(a.possession) <= pnum(p.id) : seqOf(a.lastEvent) < p.startSeq;
    const inside = a.possession ? false : (seqOf(a.lastEvent) >= p.startSeq && seqOf(a.lastEvent) <= p.endSeq);
    if (before) org = o.content?.defense ?? org; else if (inside) mixed = true;
  }
  return { org, mixed };
}

export function organizationTable(ix, defTeam) {
  const att = 1 - defTeam; const rows = new Map();
  for (const p of ix.possessions.filter((x) => x.team === att)) {
    const { org, mixed } = orgFor(ix, defTeam, p); const key = mixed ? 'mixta' : org;
    const shots = ix.shots.filter((s) => s.possession === p.id && s.valid); const evs = p.events;
    const tov = evs.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'tov' && x.team === att)).length; const stl = evs.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'stl')).length;
    const fouls = evs.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'foul' && x.team === defTeam)).length;
    const fta = evs.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'ft' && (x.status ?? 'administered') === 'administered')).length;
    const dreb = evs.flatMap((e) => (e.stats ?? []).filter((x) => x.k === 'reb' && !x.off && x.team === defTeam)).length;
    const r = rows.get(key) ?? { org: key, poss: 0, points: 0, shots: 0, made: 0, three: 0, quals: { comfortable: 0, normal: 0, forced: 0 }, tov: 0, stl: 0, fouls: 0, fta: 0, dreb: 0, ids: [] };
    r.poss += 1; r.points += p.points; r.shots += shots.length; r.made += shots.filter((s) => s.pub.made).length; r.three += shots.filter((s) => s.zone === 'three').length;
    for (const s of shots) if (s.pub.quality in r.quals) r.quals[s.pub.quality] += 1; r.tov += tov; r.stl += stl; r.fouls += fouls; r.fta += fta; r.dreb += dreb; r.ids.push(p.id); rows.set(key, r);
  }
  const list = [...rows.values()].sort((a, b) => b.poss - a.poss).map((r) => ({ ...r, ppp: ratio(r.points, r.poss, { unit: 'pts concedidos/ataque', reason: 'sin ataques' }), fgPct: pctOf(r.made, r.shots) }));
  return { team: defTeam, rows: list, total: list.reduce((s, r) => s + r.poss, 0), pressureHeight: ix.input.teams[defTeam].plan.pressureHeight, note: 'Organización efectiva = plan inicial más órdenes activadas antes de la posesión; los ataques que cruzan un cambio de organización van a «mixta». La organización de cada tiro no se guarda en el hecho (dependencia): se lee por posesión. «Toda pista» no significa que en cada ataque se resolviera una intervención de presión.' };
}

// Cruza familia ofensiva y cobertura REALMENTE ejecutada. Una respuesta no ejecutada no entra en el numerador de uso.
export function coverageTable(ix, defTeam) {
  const att = 1 - defTeam; const by = new Map();
  for (const e of ix.events) {
    if (e.type !== 'attempt' || e.team !== att) continue; const c = e.intent?.cobertura; if (!c) continue;
    const k = `${c.cobertura}|${e.intent.familia ?? '—'}`; const sh = (e.stats ?? []).find((x) => x.k === 'shot');
    const g = by.get(k) ?? { cov: c.cobertura, nav: new Set(), family: e.intent.familia ?? null, n: 0, made: 0, miss: 0, tov: 0, foul: 0, exchangeDone: 0, exchangeFailed: 0, help: 0, ids: [] };
    g.n += 1; g.nav.add(c.navegacion); g.ids.push(e.id);
    if (sh) { if (sh.made) g.made += 1; else if (sh.fromFoul) g.foul += 1; else g.miss += 1; } else if (e.intent.categoria === 'turnover') g.tov += 1; else if (e.intent.categoria?.includes('Foul')) g.foul += 1;
    if (c.cambio) { if (c.cambio.completa) g.exchangeDone += 1; else g.exchangeFailed += 1; }
    if (e.intent?.defensa?.ayuda) g.help += 1; by.set(k, g);
  }
  const rows = [...by.values()].sort((a, b) => b.n - a.n).map((g) => ({ ...g, nav: [...g.nav], familyLabel: g.family ? (FAMILY_LABEL[g.family] ?? g.family) : '—' }));
  return { team: defTeam, rows, note: 'Solo interacciones con cobertura efectivamente ejecutada; una respuesta recomendada o incompatible no cuenta como uso.' };
}

// Cadena de ayuda: ayuda comprometida → llega o no → relevo; «producción después de ayuda» describe la cadena, no cuántos puntos causó o evitó la ayuda.
export function helpChain(ix, defTeam) {
  const att = 1 - defTeam; const rows = [];
  for (const e of ix.events) {
    if (e.type !== 'attempt' || e.team !== att) continue; const h = e.intent?.defensa?.ayuda; if (!h) continue; const sh = (e.stats ?? []).find((x) => x.k === 'shot');
    rows.push({ event: e.id, helper: h.ayudante, left: h.deja, arrives: !!h.llega, relief: h.relevo ?? null, reliefArrives: h.relevoLlega ?? null, result: sh ? (sh.made ? 'canasta' : 'fallo') : (e.intent?.categoria ?? '—'), quality: e.intent?.calidad ?? null });
  }
  const n = rows.length;
  return { team: defTeam, n, rows, arrived: rows.filter((r) => r.arrives).length, reliefFailed: rows.filter((r) => r.relief && r.reliefArrives === false).length, madeAfter: rows.filter((r) => r.result === 'canasta').length, note: 'Describe la cadena resuelta; no demuestra puntos causados ni evitados por la ayuda.' };
}

// Tres consultas de responsabilidad distintas (§10.3): inicial, oposición final y participaciones (solapables). Nunca se carga el tiro al defensor nominal.
export function responsibilities(ix, defTeam) {
  const att = 1 - defTeam; const init = {}; const fin = {}; const part = {};
  const add = (o, id, k) => { if (!id || ix.teamOf[id] !== defTeam) return; (o[id] ??= { id, n: 0, made: 0, ids: [] }); o[id].n += 1; if (k?.made) o[id].made += 1; o[id].ids.push(k?.id); };
  for (const e of ix.events) {
    if (e.type !== 'attempt' || e.team !== att) continue; const sh = (e.stats ?? []).find((x) => x.k === 'shot'); const k = { made: !!sh?.made, id: e.id };
    const c = e.intent?.cobertura?.defensores; if (c) { add(init, c.delBalon, k); add(init, c.delBloqueador, k); }
    if (sh) add(fin, e.participants?.defensor, k);
    const seen = new Set(); for (const id of [e.participants?.defensor, e.participants?.interceptor, e.participants?.ayudante, c?.delBalon, c?.delBloqueador, e.intent?.defensa?.ayuda?.relevo]) if (id && !seen.has(id)) { seen.add(id); add(part, id, k); }
  }
  const norm = (o) => Object.values(o).sort((a, b) => b.n - a.n);
  return { team: defTeam, initial: norm(init), finalOpposition: norm(fin), participations: norm(part), note: 'Tres lecturas distintas: responsabilidad inicial en la cobertura, oposición final al intento y participaciones (ayudas y relevos incluidos, solapables). Un tiro con tres participantes sigue siendo un tiro.' };
}
