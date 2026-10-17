// Lote de cierre de MOTOR-12 (§21.2): CINCO casos × DOS variantes = diez encuentros reales con el controlador, la persistencia progresiva, el paquete de análisis y su comprobador.
// Base y candidata (+3 en Pase, TEC08, de los directores; mismos enfrentamientos y semillas). No calibra ni usa el marcador como objetivo.
// Uso: node scripts/integration-motor12.js [--out <directorio>] [--target-mib <n>]
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadData } from './node-data.js';
import * as P from '../src/population/index.js';
import { buildMatchInput, runMatch } from '../src/match/index.js';
import { JobStore } from '../src/batch/jobstore.js';
import { BatchController } from '../src/batch/runner.js';
import { WorkerExecutor } from '../src/batch/executors.js';
import { buildPackage } from '../src/batch/package.js';
import { verifyTarget } from '../src/batch/check.js';
import { trajectoryFingerprint } from '../src/batch/fingerprint.js';

const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const { profile, players } = loadData(); const out = opt('--out', null); const root = out ?? join(process.cwd(), 'out', 'batches');
const store = new JobStore(root); const exec = new WorkerExecutor({ store }); const ctl = new BatchController({ store, executor: exec });

// 1. referencia histórica y neutralidad del registro (mismo deporte con registro completo y reducido)
const input = buildMatchInput(profile, players, { seed: profile.scenario.seed });
const full = runMatch(input, profile, { detail: 'full' }); const min = runMatch(input, profile, { detail: 'minimal' });
console.log(JSON.stringify({ referencia: 20261016, score: full.score.join('–'), sorteos: full.diagnostics.sportingDraws, mismoMarcadorYSorteos: full.score.join() === min.score.join() && full.diagnostics.sportingDraws === min.diagnostics.sportingDraws, huellaTrayectoriaIgual: trajectoryFingerprint(full) === trajectoryFingerprint(min) }));

// 2. lote de cierre
const nat = (id) => P.referenceTeam(profile, players, id); const hist = (id) => P.referenceTeam(profile, players, id, { revision: 'R0', planKind: 'historical' });
const teams = { EQ01H: hist('EQ01'), EQ02H: hist('EQ02'), EQ04: nat('EQ04'), EQ05: nat('EQ05'), EQ06: nat('EQ06'), EQ10: nat('EQ10'), EQ07: nat('EQ07'), EQ08: nat('EQ08'), EQ11: nat('EQ11'), EQ12: nat('EQ12') };
const spec = { mode: 'pairs', pairs: [['EQ01H', 'EQ02H'], ['EQ04', 'EQ05'], ['EQ06', 'EQ10'], ['EQ07', 'EQ08'], ['EQ11', 'EQ12']], repetitions: 1, venue: 'fixed', batchSeed: 20261017, teams, recordLevel: 'diagnostic', prose: 'omitted',
  objective: 'Contraste inicial de integración: ¿cómo cambian pérdidas, creación y distribución de tiros al sumar +3 en Pase (TEC08) a los directores? (auditoría general de coherencia y distribuciones)',
  variants: [{ id: 'V0', label: 'Base' }, { id: 'V1', label: 'Candidata: +3 Pase (TEC08) a los directores', ops: [{ op: 'ability', team: '*', player: 'director', attrs: ['TEC08'], delta: 3 }] }] };
const cr = ctl.create(spec, profile, { players, label: 'cierre MOTOR-12' });
if (!cr.ok) { console.error('NO SE PUDO PREPARAR', cr.problems); process.exit(1); }
console.log('lote', cr.batchId, '·', cr.counts.explain);
const t0 = performance.now(); const run = await ctl.run(cr.batchId); const end = await run.done; const ms = performance.now() - t0;
const st = ctl.status(cr.batchId, { rows: true }); console.log('estado', end.state, JSON.stringify(st.counters));
for (const m of st.matches) console.log(m.match_id, m.case_id, m.variant_id, m.pair_id, m.exec_state, m.valid ? 'válido' : 'NO válido', `${m.facts.score_home}–${m.facts.score_away}`, `${m.facts.draws} sorteos`, `${Math.round(m.exec_ms)} ms`);
console.log(`ejecución total del lote: ${(ms / 1000).toFixed(1)} s`);

// 3. paquete completo + comprobador (partición por defecto del perfil, o --target-mib)
const target = opt('--target-mib', null);
const pk = await buildPackage(ctl, cr.batchId, target ? { partTargetMiB: Number(target) } : {});
console.log(`paquete: ${pk.kind}, ${pk.packages.length} ZIP, verificado previo = ${pk.verified}, construcción ${(pk.total_ms / 1000).toFixed(1)} s`);
for (const p of pk.packages) console.log(` ${p.name}  ${(p.bytes / 1048576).toFixed(2)} MiB ZIP  ${(p.uncompressed / 1048576).toFixed(2)} MiB sin comprimir`);
const t1 = performance.now(); const v = verifyTarget(pk.outDir); console.log(`comprobador: ${v.ok ? 'CORRECTO' : 'FALLOS'} (${((performance.now() - t1) / 1000).toFixed(1)} s)`); for (const c of v.checks) console.log(` ${c.status === 'pass' ? '✔' : c.status === 'fail' ? '✘' : '○'} ${c.id} ${c.detail}`);
if (!v.ok) { v.problems.slice(0, 10).forEach((p) => console.log(' -', p)); }
console.log('directorio del paquete:', pk.outDir);
await exec.close(); process.exit(v.ok && end.state === 'completado' ? 0 : 1);
