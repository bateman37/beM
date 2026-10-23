// SIM-MOTOR-03 · Bloque E (§9.1): 16 repeticiones técnicas = 8 casos SIM × {E1 un worker por fronteras/cuarto con consultas; E2 cuatro workers con guardado/recuperación y sufijo privado a nivel Análisis}.
// Cada caso tiene su control ya ejecutado en la campaña (misma entrada, política, revisiones y noticias). La comparación usa los DATOS deportivos canónicos, no un único hash opaco, y separa metadatos operativos
// (tiempos, intento, ruta) de campos que legítimamente cambian por formato. No son observaciones deportivas nuevas.
//   node scripts/sim03/equiv.js --plan=docs/tecnico/evidencia-sim-motor03/plan --campaign=out/sim-motor03/campaign --out=out/sim-motor03/equivalence
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as L from './lib.js';
import { contextToJSON } from '../../src/sim/context.js';
import { SimPool } from '../../src/sim/pool.js';
import { readJsonl } from './tables.js';
import { canonical } from '../../src/sim/fp.js';

const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const CAMP = arg('campaign', join(root, 'out/sim-motor03/campaign')); const OUT = arg('out', join(root, 'out/sim-motor03/equivalence')); mkdirSync(OUT, { recursive: true });
const PLAN = arg('plan', join(root, 'docs/tecnico/evidencia-sim-motor03/plan'));
const env = L.loadEnv(); const { sim } = L.allCases(env); const by = new Map(sim.map((c) => [c.case_id, c]));
const planAgenda = new Map(readFileSync(join(PLAN, 'agenda-sim.csv'), 'utf8').trim().split('\n').slice(1).map((l) => { const f = l.split(','); return [f[0], { entry_id: f[12], input_hash: f[13] }]; }));
const control = new Map(readJsonl(join(CAMP, 'records-sim.jsonl')).map((r) => [r.case_id, r]));
const prep = (id) => { const m = L.materialize(env, by.get(id)); const p = planAgenda.get(id); if (!p || p.input_hash !== m.input_hash) throw new Error(`la entrada de ${id} no coincide con el plan congelado`); return m; };

// Secciones DEPORTIVAS comparadas (cada una con su propia huella y, si difiere, el primer punto de diferencia)
const SECTIONS = {
  marcador_periodos: (r) => ({ final: r.essential.score.final, periods: r.essential.score.periods, overtimes: r.essential.score.overtimes, winner: r.essential.score.winner, duration: r.essential.durationSeconds, controls: r.essential.controls }),
  hechos_deportivos_acta: (r) => r.essential.box,
  presencia_quintetos_tiempos: (r) => ({ quintets: r.quintets, director: r.director, segments: r.segments, exposure: r.essential.exposure }),
  ordenes_decisiones_contexto: (r) => ({ decisions: r.decisions, commands: r.commands, plans: r.plans, nCommands: r.identity.nCommands, effective: r.identity.effectiveInputFingerprint }),
  azar_ordinal: (r) => ({ draws: r.rngDraws, events: r.events, sportFingerprint: r.identity.sportFingerprint }),
  zonas_familias_exposicion_consecuencias: (r) => ({ zones: r.essential.zones, families: r.essential.families, familyDenominators: r.essential.familyDenominators, exposure: r.essential.exposure, analysis: r.analysis, evolution: r.evolution, states: r.states }),
};
const firstDiff = (a, b, path = '') => { if (a === b) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], `${path}/${k}`); if (d) return d; } return null; } return canonical(a) === canonical(b) ? null : { path, control: a ?? null, repeat: b ?? null }; };
const compare = (ctl, rep) => Object.fromEntries(Object.entries(SECTIONS).map(([name, f]) => { const a = f(ctl); const b = f(rep); const eq = canonical(a) === canonical(b); return [name, { equal: eq, controlHash: L.sha(a).slice(0, 24), repeatHash: L.sha(b).slice(0, 24), ...(eq ? {} : { firstDifference: firstDiff(a, b) }) }]; }));

const out = { schema: 'beM-sim03-equivalence/1', campaign: L.CAMPAIGN_ID, definition: 'E1 = un worker, avance por instantes/cuartos con consultas intermedias (sin azar); E2 = cuatro workers, guardado + serialización + restauración con sufijo privado en los cortes indicados; ambos con el mismo control ya ejecutado', sections: Object.keys(SECTIONS), runs: [], notIndependentObservations: true };
const runs = [];
for (const [label, workers, mk] of [['E1', 1, (id) => ({ route: 'steps', steps: L.E_ROUTES[id].steps })], ['E2', 4, (id) => ({ route: 'recover', cuts: L.E_ROUTES[id].cuts })]]) {
  const pool = new SimPool({ workers }); await pool.start(contextToJSON(env.ctx), env.ctx.sp.fingerprint, env.teamMap, []);
  const cases = L.E_CASES.map((id) => { const m = prep(id); return { case_id: id, input: m.input, attempt: label === 'E1' ? 101 : 102, policy: true, ...mk(id) }; }); const t0 = performance.now(); const got = [];
  await pool.runStream(cases, { type: 'camp', chunk: 1, onChunk: async (batch, results) => { results.forEach((r, i) => got.push({ c: batch[i], record: r.record })); } }); await pool.close();
  for (const { c, record } of got) runs.push({ label, workers, case_id: c.case_id, route: record.route, record, wallMs: Math.round(performance.now() - t0) });
}
for (const r of runs) { const ctl = control.get(r.case_id); const cmp = ctl ? compare(ctl, r.record) : null; out.runs.push({ run: `${r.label}:${r.case_id}`, label: r.label, workers: r.workers, case_id: r.case_id, status: r.record.status, valid: r.record.valid, route: r.record.route, controlPresent: !!ctl, comparison: cmp, allEqual: cmp ? Object.values(cmp).every((x) => x.equal) : null, operationalMetadata: { attempt: r.record.attempt, ms: r.record.ms, route: r.record.route } }); }
out.summary = { total: runs.length, equal: out.runs.filter((r) => r.allEqual === true).length, different: out.runs.filter((r) => r.allEqual === false).length, noControl: out.runs.filter((r) => !r.controlPresent).length };
writeFileSync(join(OUT, 'equivalence.json'), JSON.stringify(out, null, 1)); writeFileSync(join(OUT, 'records-e.jsonl'), runs.map((r) => JSON.stringify({ ...r.record, run: `${r.label}:${r.case_id}` })).join('\n') + '\n');
console.log(JSON.stringify({ summary: out.summary, unequal: out.runs.filter((r) => r.allEqual === false).map((r) => ({ run: r.run, sections: Object.entries(r.comparison).filter(([, v]) => !v.equal).map(([k, v]) => [k, v.firstDifference]) })) }, null, 1));
process.exit(0);
