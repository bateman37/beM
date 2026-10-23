// Contexto de ejecución SIM: perfil SIM efectivo + tablas heredadas. Serializable a trabajadores (filas y tablas en JSON; el perfil se reconstruye sin el detallado).
import { buildSimProfile, applyOverrides, finalize } from './profile.js';
import { extractTables } from './tables.js';

export function makeContext(detailed, overrides = null) {
  let sp = buildSimProfile(detailed); const T = extractTables(detailed); const base = sp;
  if (overrides && overrides.length) sp = applyOverrides(sp, overrides);
  return { sp, T, base };
}
export const contextToJSON = (ctx) => ({ rows: ctx.sp.rows, id: ctx.sp.id, detailedProfileId: ctx.sp.detailedProfileId, overrides: ctx.sp.overrides ?? [], T: ctx.T, baseRows: ctx.base.rows === ctx.sp.rows ? null : ctx.base.rows });
export function contextFromJSON(j) {
  const sp = finalize({ id: j.id, detailedProfileId: j.detailedProfileId, rows: j.rows, overrides: j.overrides });
  const base = j.baseRows ? finalize({ id: j.id.replace(/\+candidata$/, ''), detailedProfileId: j.detailedProfileId, rows: j.baseRows }) : sp;
  return { sp, T: j.T, base };
}
