// MOTOR-17B §7.2: reproducción DIRIGIDA de las cinco pérdidas vivas de MOTOR-17 que quedaron sin crédito por ausencia de interceptor. Lee la entrada congelada y la semilla de cada diagnóstico R17 conservado en `out/motor17/lotes/R17`
// (sin rehacer ninguna campaña), repite ese partido con el código actual (M17B) y compara el hecho señalado con el original de R17: debe ser el mismo hecho, con el mismo recuperador, y ahora con crédito justificado por el control conservado.
// Se cuenta aparte: 5 ejecuciones dirigidas, no forman parte de las 72 de la campaña. Si los archivos de R17 no están, se declara y no se inventa nada.
// Uso: node scripts/m17b-historic-five.js [--r17=out/motor17/lotes/R17] [--plan=out/motor17/plan/lotes-R17.json] [--out=out/motor17b/evidencia]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { JobStore, loadFrozen } from '../src/batch/jobstore.js';
import { defaultSimulate } from '../src/batch/attempt.js';
import { ENGINE_VERSION } from '../src/match/index.js';

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const R17 = arg('r17', 'out/motor17/lotes/R17'); const PLAN = arg('plan', 'out/motor17/plan/lotes-R17.json'); const OUT = arg('out', 'out/motor17b/evidencia'); mkdirSync(OUT, { recursive: true });
const CASES = [
  { lot: 'DIAG-B-EXP13-04-r01', match: 'M000002', event: 'E0267', recoverer: 'EQ01-J10' }, { lot: 'DIAG-B-EXP13-04-r01', match: 'M000002', event: 'E0550', recoverer: 'EQ02-J09' }, { lot: 'DIAG-B-EXP13-07-r01', match: 'M000002', event: 'E0189', recoverer: 'EQ03-J10' },
  { lot: 'DIAG-C-ORG02-COB01', match: 'M000001', event: 'E0256', recoverer: 'EQ01-J07' }, { lot: 'DIAG-D-F2-LAB11-03-r01', match: 'M000001', event: 'E0379', recoverer: 'EQ01-J06' }];
if (!existsSync(PLAN) || !existsSync(R17)) { writeFileSync(join(OUT, 'cinco-casos-historicos.json'), JSON.stringify({ ejecutado: false, motivo: `no están los archivos de R17 (${PLAN}, ${R17}): no se inspeccionaron los cinco originales; el criterio se prueba con contextos dirigidos del productor (tests/motor17b.test.js, M17B·3)` }, null, 1)); console.log('sin archivos de R17: declarado'); process.exit(0); }
const plan = JSON.parse(readFileSync(PLAN, 'utf8')); const store = new JobStore(R17); const res = [];
for (const c of CASES) {
  const lot = plan.lots.find((l) => l.label.endsWith(c.lot)); if (!lot) { res.push({ ...c, ejecutado: false, motivo: 'lote no encontrado en el plan de R17' }); continue; }
  const frozen = loadFrozen(store, lot.batch_id); const ex = frozen.lote.agenda.find((x) => x.match_id === c.match); const entry = frozen.entryOf(ex); const input = frozen.inputFor(entry, ex.seed);
  // original de R17: el hecho tal como se conservó (sin crédito)
  const evFile = join(R17, lot.batch_id, 'intentos', c.match, `${c.match}-A1`, 'eventos', `eventos-${c.match}--${c.match}-A1.jsonl`); const orig = existsSync(evFile) ? readFileSync(evFile, 'utf8').trim().split('\n').map((l) => JSON.parse(l)).find((e) => e.event_id === c.event) : null;
  const sim = defaultSimulate(input, frozen.profile, { level: 'diagnostic', planned: entry.planned_orders ?? [] }); const r = sim.res; const e = r?.events.find((x) => x.id === c.event);
  const stl = (e?.stats ?? []).find((s) => s.k === 'stl'); const tov = (e?.stats ?? []).find((s) => s.k === 'tov'); const ef = e?.effects ?? {};
  const prev = r?.events.filter((x) => x.seq < e?.seq && x.possessionId === e?.possessionId).slice(-3).map((x) => ({ id: x.id, type: x.type, intent: x.intent?.origen ?? null }));
  res.push({ ...c, lot: lot.label, batch_id_r17: lot.batch_id, semilla: ex.seed, ejecutado: !!e, r17: { encontrado: !!orig, tipo: orig?.type ?? null, perdida: (orig?.stats ?? []).find((s) => s.k === 'tov') ?? null, recupera: orig?.effects?.recupera ?? null, robo_en_r17: (orig?.stats ?? []).find((s) => s.k === 'stl') ?? null, cadenaRobo: orig?.effects?.cadenaRobo ?? null },
    m17b: { tipo: e?.type ?? null, perdida: tov ?? null, recupera: ef.recupera ?? null, balonVivo: !!ef.balonVivo, cadenaRobo: ef.cadenaRobo ?? null, robo: stl ?? null }, mismo_hecho_y_recuperador: !!orig && orig.type === e?.type && orig.effects?.recupera === ef.recupera && ef.recupera === c.recoverer,
    credito_justificado_por_el_control_conservado: !!stl && stl.p === c.recoverer && stl.contacto === 'recogida controlada' && ef.cadenaRobo?.intento !== true, antecedentes_de_la_posesion: prev, marcador_m17b: r?.score ?? null, sorteos_m17b: r?.diagnostics?.sportingDraws ?? null });
}
const doc = { study: 'MOTOR17B-CIERRE-20261021', nota: 'Cinco reproducciones dirigidas (no campaña): mismas entradas congeladas y semillas de los diagnósticos R17, código M17B. R17 conservó la pérdida y el recuperador; MOTOR-17B decide el crédito.', engine: ENGINE_VERSION, casos: res, todos_creditados_al_recuperador: res.length === 5 && res.every((x) => x.credito_justificado_por_el_control_conservado), todos_el_mismo_hecho: res.every((x) => x.mismo_hecho_y_recuperador) };
writeFileSync(join(OUT, 'cinco-casos-historicos.json'), JSON.stringify(doc, null, 1));
console.log(JSON.stringify({ casos: res.map((x) => [x.lot, x.event, x.mismo_hecho_y_recuperador, x.credito_justificado_por_el_control_conservado]), todos_creditados: doc.todos_creditados_al_recuperador }));
