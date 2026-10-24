// SIM-MOTOR-04E · evaluación de una identidad SIM frente al detallado sobre las MISMAS entradas (§8). Une los registros, las tablas y el selector: población de actuaciones de equipo → errores → M04E y M04E_comparable.
import { join } from 'node:path';
import { readJsonl, buildTables, COLS } from './tables.js';
import * as S from './select.js';

// Último intento de cada caso del bloque (un reintento operativo sustituye al interrumpido; un caso terminado no se repite).
export function loadRecords(out, identity, resolver, block) {
  const blocks = Array.isArray(block) ? block : [block]; const m = new Map(); for (const r of readJsonl(join(out, `records-${resolver}-${identity}.jsonl`))) { if (!blocks.includes(r.block)) continue; const q = m.get(r.case_id); if (!q || (r.attempt ?? 1) >= (q.attempt ?? 1)) m.set(r.case_id, r); } return [...m.values()];
}
const idx = { res: COLS.team.indexOf('resolver'), id: COLS.team.indexOf('identity') };
// DET: se construyen sus tablas UNA vez (son las mismas para todas las identidades)
export function detTables(out, block, caseIds) { const recs = loadRecords(out, 'DET', 'detailed', block).filter((r) => caseIds.includes(r.case_id)); return buildTables([], recs).tables; }
export function evaluate({ out, identity, block, caseIds, det }) { return evaluateRecords({ simRecs: loadRecords(out, identity, 'sim', block), identity, caseIds, det }); }
// Evaluación pura desde registros ya cargados (la usa el comprobador offline sobre los registros de los ZIP finales: sin simular)
export function evaluateRecords({ simRecs: allRecs, identity, caseIds, det }) {
  const simRecs = allRecs.filter((r) => caseIds.includes(r.case_id)); const simT = buildTables(simRecs, []).tables;
  const simL = S.linesOf(simT, caseIds, 'sim', identity); const detL = S.linesOf(det, caseIds, 'detailed', 'DET'); const ci = (n) => COLS.team.indexOf(n);
  const simIds = new Set(simL.rows.map((r) => r[ci('case_id')])); const detIds = new Set(detL.rows.map((r) => r[ci('case_id')])); const common = new Set([...simIds].filter((id) => detIds.has(id)));
  const zc = COLS.zone.indexOf('case_id'); const zr = (tab, res, id) => tab.zone.filter((r) => r[COLS.zone.indexOf('resolver')] === res && r[COLS.zone.indexOf('identity')] === id && common.has(r[zc]));
  const sim = S.populationOf(simL.rows.filter((r) => common.has(r[ci('case_id')])), zr(simT, 'sim', identity)); const dt = S.populationOf(detL.rows.filter((r) => common.has(r[ci('case_id')])), zr(det, 'detailed', 'DET'));
  const errs = S.errorsOf(sim, dt); const both = S.scoreBoth(errs);
  const invariantsOk = common.size === caseIds.length && simL.excluded.length === 0 && detL.excluded.length === 0 && simRecs.length === caseIds.length;
  return { id: identity, comparableCases: common.size, sim, det: dt, errs, eZ: S.eZOf(errs), M04E: both.full, M04E_comparable: both.comparable, outOfBand: S.outOfBand(errs), outOfBandComparable: S.outOfBand(errs, S.COMPARABLE_EXCLUSIONS.map((x) => x.id)), invariantsOk, excluded: { sim: simL.excluded, detailed: detL.excluded }, tables: simT };
}
