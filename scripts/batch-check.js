// Comprobador del paquete de análisis de MOTOR-12 (§16.2). Uso: npm run batch:check -- <ZIP | directorio de un paquete | directorio con índice + partes> [--json]
// Verifica integridad (SHA-256, bytes, registros lógicos), relaciones, duplicados, conteos, marcador/minutos, sorteos, agregados recalculados y permisos SIN volver a simular ningún partido.
import { verifyTarget } from '../src/batch/check.js';

const args = process.argv.slice(2); const target = args.find((a) => !a.startsWith('--'));
if (!target) { console.error('Uso: npm run batch:check -- <ruta al ZIP, al índice o al directorio> [--json]'); process.exit(2); }
let r;
try { r = verifyTarget(target); } catch (e) { console.error(`No se pudo abrir el paquete: ${e.message}`); process.exit(2); }
if (args.includes('--json')) console.log(JSON.stringify(r, null, 1));
else {
  console.log(`Comprobador ${r.version} · ${target}`);
  for (const c of r.checks) console.log(`${c.status === 'pass' ? ' ✔' : c.status === 'fail' ? ' ✘' : ' ○'} ${c.id} ${c.title}${c.detail ? ` — ${c.detail}` : ''}`);
  if (r.problems.length) { console.log('\nPROBLEMAS:'); r.problems.forEach((p) => console.log(` - ${p}`)); }
  console.log(r.ok ? '\nPaquete correcto.' : '\nPaquete NO válido.');
}
process.exit(r.ok ? 0 : 1);
