// SIM-MOTOR-04B · equivalencia (§9.3 OPT y §11.1 TECH). Compara registros de DOS ejecuciones del MISMO caso lógico por SECCIONES DEPORTIVAS canónicas (cada una con su huella y su primer punto de diferencia); separa metadatos operativos
// (tiempos, intento, ruta) de campos que legítimamente cambian por formato. La huella NO omite el bloqueador, la presión ni los denominadores de asistencia (campos nuevos de 04). Una comparación solo por marcador no basta.
//   node scripts/sim04b/equiv.js --mode=opt  --a=O04B-CONTROL --b=O04B-FINAL [--block-a=OPT --block-b=OPT]   O04B-CONTROL frente a O04B-FINAL: 12 entradas CAL, seis con perfil neutral y seis con la candidata
//   node scripts/sim04b/equiv.js --mode=tech [--out=...]                                                   TECH: 4 entradas VAL × {auto (control), steps, recover, reference}
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonl } from './tables.js';
import { canonical } from '../../src/sim/fp.js';
import { sha } from './lib.js';

// Secciones DEPORTIVAS comparadas.
export const SECTIONS = {
  marcador_periodos: (r) => ({ final: r.essential.score.final, periods: r.essential.score.periods, overtimes: r.essential.score.overtimes, winner: r.essential.score.winner, duration: r.essential.durationSeconds, controls: r.essential.controls }),
  hechos_deportivos_acta: (r) => r.essential.box,
  presencia_quintetos_tiempos: (r) => ({ quintets: r.quintets, director: r.director, segments: r.segments }),
  ordenes_decisiones_contexto: (r) => ({ decisions: r.decisions, commands: r.commands, plans: r.plans, nCommands: r.identity.nCommands, effective: r.identity.effectiveInputFingerprint }),
  azar_ordinal: (r) => ({ draws: r.rngDraws, events: r.events, sportFingerprint: r.identity.sportFingerprint }),
  zonas_familias_denominadores: (r) => ({ zones: r.essential.zones, families: r.essential.families, familyDenominators: r.essential.familyDenominators }),
  bloqueador_presion_asistencia: (r) => ({ assistDenominators: r.essential.assistDenominators, assistFunnel: r.essential.assistFunnel ?? null, pressOps: r.essential.pressOps, participation: r.analysis?.participation ?? null, playerFinalizations: r.analysis?.playerFinalizations ?? null }),
  tablas_auditoria_04b: (r) => (r.diag04b ? { czq: r.diag04b.czq, foulMiss: r.diag04b.foulMiss, subs: r.diag04b.subs } : null),
  exposicion_estados_consecuencias: (r) => ({ exposure: r.essential.exposure, states: r.states, evolution: r.evolution, analysis: r.analysis ? { defense: r.analysis.defense, orders: r.analysis.orders } : null, validity: r.essential.validity }),
};
// Intersección conservada por la ruta `reference` (registro mínimo del mundo: esencial y estado de cierre, sin análisis de tramos ni quintetos).
export const SECTIONS_ESSENTIAL = {
  marcador_periodos: SECTIONS.marcador_periodos, hechos_deportivos_acta: SECTIONS.hechos_deportivos_acta,
  huella_deportiva: (r) => ({ sportFingerprint: r.identity.sportFingerprint, inputFingerprint: r.identity.inputFingerprint ?? r.essential.identity.inputFingerprint, seed: r.identity.seed }),
  zonas_familias_denominadores: SECTIONS.zonas_familias_denominadores,
  asistencia_presion: (r) => ({ assistDenominators: r.essential.assistDenominators, assistFunnel: r.essential.assistFunnel ?? null, pressOps: r.essential.pressOps }),
  exposicion_validez: (r) => ({ exposure: r.essential.exposure, validity: r.essential.validity, familyDenominators: r.essential.familyDenominators }),
};
export const firstDiff = (a, b, path = '') => { if (a === b) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], `${path}/${k}`); if (d) return d; } return null; } return canonical(a) === canonical(b) ? null : { path, a: a ?? null, b: b ?? null }; };
export const compare = (a, b, sections = SECTIONS) => Object.fromEntries(Object.entries(sections).map(([name, f]) => { const x = f(a); const y = f(b); const eq = canonical(x) === canonical(y); return [name, { equal: eq, hashA: sha(x).slice(0, 24), hashB: sha(y).slice(0, 24), ...(eq ? {} : { firstDifference: firstDiff(x, y) }) }]; }));
export const latest = (recs, block) => { const m = new Map(); for (const r of recs) { if (block && r.block !== block) continue; const p = m.get(r.case_id); if (!p || r.attempt >= p.attempt) m.set(r.case_id, r); } return m; };

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
  const root = new URL('../..', import.meta.url).pathname; const CAMP = arg('campaign', join(root, 'out/sim-motor04b/campaign')); const OUT = arg('out', join(root, 'out/sim-motor04b/equivalence')); mkdirSync(OUT, { recursive: true }); const mode = arg('mode', 'opt');
  const rd = (id, block) => latest(readJsonl(join(CAMP, `records-sim-${id}.jsonl`)), block);
  const out = { schema: 'beM-sim04b-equivalence/1', mode, sections: Object.keys(SECTIONS), runs: [], notIndependentObservations: true };
  if (mode === 'opt') {
    const A = rd(arg('a'), arg('block-a', 'CAL')); const B = rd(arg('b'), arg('block-b', 'OPT')); out.definition = `O04-CONTROL (${arg('a')}, ejecutado en CAL antes de optimizar) frente a O04-FINAL (${arg('b')}): mismos 56 casos, mismo vector, mismas entradas`;
    for (const [id, a] of A) { const b = B.get(id); const cmp = b ? compare(a, b) : null; out.runs.push({ case_id: id, controlPresent: true, finalPresent: !!b, statusA: a.status, statusB: b?.status ?? null, validA: a.valid, validB: b?.valid ?? null, comparison: cmp, allEqual: cmp ? Object.values(cmp).every((x) => x.equal) : null, operationalMetadata: { msA: a.ms, msB: b?.ms ?? null, commitA: null } }); }
  } else {
    // TECH: control = ruta `auto` (partido de una vez con registro normal); se comparan `steps`, `recover` y `reference` (esta última solo en la intersección conservada por el mundo)
    const ctl = rd('TECH-auto', 'TECH'); out.control = 'TECH-auto';
    for (const label of ['TECH-steps', 'TECH-recover', 'TECH-reference']) { const R = rd(label, 'TECH'); for (const [id, r] of R) { const a = ctl.get(id); const cmp = a ? compare(a, r, label === 'TECH-reference' ? SECTIONS_ESSENTIAL : SECTIONS) : null; out.runs.push({ run: `${label}:${id}`, label, case_id: id, route: r.route, controlPresent: !!a, status: r.status, valid: r.valid, sectionsCompared: Object.keys(cmp ?? {}), comparison: cmp, allEqual: cmp ? Object.values(cmp).every((x) => x.equal) : null, operationalMetadata: { attempt: r.attempt, ms: r.ms, route: r.route } }); } }
  }
  out.summary = { total: out.runs.length, equal: out.runs.filter((r) => r.allEqual === true).length, different: out.runs.filter((r) => r.allEqual === false).length, noControl: out.runs.filter((r) => !r.controlPresent || r.finalPresent === false).length };
  writeFileSync(join(OUT, `equivalence-${mode}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ summary: out.summary, unequal: out.runs.filter((r) => r.allEqual === false).slice(0, 5).map((r) => ({ run: r.run ?? r.case_id, sections: Object.entries(r.comparison).filter(([, v]) => !v.equal).map(([k, v]) => [k, v.firstDifference]) })) }, null, 1));
}
