// Comprobador del paquete de auditoría de MOTOR-13. Uso: npm run audit:check -- <ZIP> [--json]
import { verifyAuditPackage } from '../src/audit/report.js';
const args = process.argv.slice(2); const target = args.find((a) => !a.startsWith('--'));
if (!target) { console.error('Uso: npm run audit:check -- <ruta al ZIP de auditoría> [--json]'); process.exit(2); }
let r; try { r = verifyAuditPackage(target); } catch (e) { console.error(`No se pudo abrir el paquete: ${e.message}`); process.exit(2); }
if (args.includes('--json')) console.log(JSON.stringify(r, null, 1));
else { console.log(`Comprobador ${r.version ?? ''} · ${target}`); for (const c of r.checks) console.log(`${c.status === 'pass' ? ' ✔' : ' ✘'} ${c.id} ${c.title}${c.detail ? ` — ${c.detail}` : ''}`); console.log(r.ok ? '\nPaquete de auditoría correcto.' : '\nPaquete NO válido.'); }
process.exit(r.ok ? 0 : 1);
