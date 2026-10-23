// C04-02 · reparación de evidencia de SIM-MOTOR-03: regenera las tablas de la campaña de 03 con el lector reparado en un directorio NUEVO (no sobrescribe los ZIP ni las tablas originales), con versión del lector,
// hashes de origen y diferencias frente a las tablas originales. Si los registros de 03 ya no existen, lo declara.
//   node scripts/sim04/repair-03-tables.js [--in=out/sim-motor03/campaign] [--orig=out/sim-motor03/tables] [--out=out/sim-motor04/lectura-reparada-03]
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { readJsonl, buildTables, COLS, csvText } from './tables.js';
export const READER_VERSION = 'LEC-SIM04-R1';
const arg = (k, d = null) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const root = new URL('../..', import.meta.url).pathname; const IN = arg('in', join(root, 'out/sim-motor03/campaign')); const ORIG = arg('orig', join(root, 'out/sim-motor03/tables')); const OUT = arg('out', join(root, 'out/sim-motor04/lectura-reparada-03'));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const sources = ['records-sim.jsonl', 'records-detailed.jsonl'].map((f) => join(IN, f));
if (!sources.every(existsSync)) { console.log(JSON.stringify({ status: 'registros_de_03_ausentes', reader: READER_VERSION, in: IN })); process.exit(0); }
mkdirSync(OUT, { recursive: true });
const latest = (recs) => { const m = new Map(); for (const r of recs) { const p = m.get(r.case_id); if (!p || r.attempt >= p.attempt) m.set(r.case_id, r); } return [...m.values()]; };
const sim = latest(readJsonl(sources[0])); const det = latest(readJsonl(sources[1])); const { tables } = buildTables(sim, det);
for (const [name, cols] of Object.entries(COLS)) writeFileSync(join(OUT, `${name}.csv`), csvText(cols, tables[name]));
// diferencias frente a las tablas originales (zone.csv, team.csv): sumas por modelo
const parse = (p) => { if (!existsSync(p)) return null; const [h, ...rows] = readFileSync(p, 'utf8').trim().split('\n'); const cols = h.split(','); return rows.map((l) => { const f = l.split(','); return Object.fromEntries(cols.map((c, i) => [c, f[i]])); }); };
const oz = parse(join(ORIG, 'zone.csv')); const sum = (rows, key) => rows.reduce((s, r) => s + (r[key] === '' || r[key] == null ? 0 : Number(r[key])), 0);
const byRes = (rows, res) => rows.filter((r) => r.resolver === res);
const newZone = tables.zone.map((r) => Object.fromEntries(COLS.zone.map((c, i) => [c, r[i]])));
const diff = { schema: 'beM-sim04-lectura-reparada/1', reader: READER_VERSION, sources: Object.fromEntries(sources.map((p) => [p.replace(root, ''), { sha256: sha(p) }])), original: oz ? { path: ORIG.replace(root, ''), zoneRows: oz.length, simZoneRowsWithoutAttempts: byRes(oz, 'sim').filter((r) => r.attempts === '').length, simAttempts: sum(byRes(oz, 'sim'), 'attempts'), detailedAttempts: sum(byRes(oz, 'detailed'), 'attempts') } : { status: 'tablas_originales_ausentes' },
  repaired: { zoneRows: newZone.length, simZoneRowsWithoutAttempts: byRes(newZone, 'sim').filter((r) => r.attempts == null).length, simAttempts: sum(byRes(newZone, 'sim'), 'attempts'), detailedAttempts: sum(byRes(newZone, 'detailed'), 'attempts') } };
// conciliación con el acta por línea de equipo
const ci = (n) => COLS.team.indexOf(n); let bad = 0; let lines = 0; for (const r of tables.team) { if (r[ci('status')] !== 'finished') continue; lines++; const za = ['rim', 'inside', 'midrange', 'three'].reduce((a, z) => a + (r[ci(`${z}_a`)] ?? 0), 0); const zm = ['rim', 'inside', 'midrange', 'three'].reduce((a, z) => a + (r[ci(`${z}_m`)] ?? 0), 0); if (za !== r[ci('fga')] || zm !== r[ci('fgm')]) bad++; }
diff.reconciliation = { teamLines: lines, zonesDifferFromActa: bad };
writeFileSync(join(OUT, 'diferencias.json'), JSON.stringify(diff, null, 1)); console.log(JSON.stringify(diff, null, 1));
