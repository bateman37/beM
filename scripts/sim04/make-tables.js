// Escribe las tablas CSV de una campaña desde sus registros JSONL (sin simular), con el lector reparado de SIM-MOTOR-04 (C04-02).
//   node scripts/sim04/make-tables.js --in=out/sim-motor04/campaign --out=out/sim-motor04/tables [--identity=C04-FINAL] [--recs=records-sim.jsonl,records-detailed.jsonl]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonl, buildTables, COLS, csvText, summaries, contrasts } from './tables.js';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const IN = arg('in', join(root, 'out/sim-motor04/campaign')); const OUT = arg('out', join(root, 'out/sim-motor04/tables')); mkdirSync(OUT, { recursive: true });
const latest = (recs) => { const m = new Map(); for (const r of recs) { const p = m.get(r.case_id); if (!p || r.attempt >= p.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const sim = latest(readJsonl(join(IN, arg('sim', 'records-sim.jsonl')))); const det = latest(readJsonl(join(IN, arg('det', 'records-detailed.jsonl'))));
const { tables } = buildTables(sim, det); const files = {};
for (const [name, cols] of Object.entries(COLS)) { const f = `${name}.csv`; writeFileSync(join(OUT, f), csvText(cols, tables[name])); files[f] = tables[name].length; }
const sm = summaries(tables.team); writeFileSync(join(OUT, 'resumenes.csv'), csvText(sm.cols, sm.rows)); writeFileSync(join(OUT, 'resumenes-bandas.csv'), csvText(sm.bands.cols, sm.bands.rows)); files['resumenes.csv'] = sm.rows.length; files['resumenes-bandas.csv'] = sm.bands.rows.length;
const ct = contrasts(tables.team); writeFileSync(join(OUT, 'contrastes.csv'), csvText(ct.cols, ct.rows)); writeFileSync(join(OUT, 'contrastes-agregado.csv'), csvText(ct.aggCols, ct.aggRows)); files['contrastes.csv'] = ct.rows.length; files['contrastes-agregado.csv'] = ct.aggRows.length;
console.log(JSON.stringify({ sim: sim.length, detailed: det.length, files, percentileMethod: sm.percentileMethod }, null, 1));
