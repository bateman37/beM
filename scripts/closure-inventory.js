// Inventario de cierre (MOTOR-14 §4): reconcilia los 81 grupos funcionales y los 4 soportes con las filas reales del perfil (consumidor, cobertura) y con la lista explícita de pendientes.
// NO afirma «hecho»: una fila con consumidor prueba que existe un mecanismo que la lee, no que el comportamiento sea correcto ni que se haya expuesto. Salida: Markdown y JSON.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, ROOT } from './node-data.js';
import { buildRows } from '../src/profiles/rows.js';
import { GROUPS } from '../src/profiles/groups.js';

const { profile } = loadData();
const rows = buildRows(profile).filter((r) => r.grp);
const by = {}; for (const r of rows) for (const g of String(r.grp).split(/[ ,/]+/).filter(Boolean)) (by[g] ??= []).push(r);
// Estados que NO se pueden deducir de las filas: se declaran a mano, con motivo y referencia (ver docs/tecnico/motor14.md §Pendientes).
const NOTES = {
  REG04: 'Inferioridad y terminación (art. 21) implementadas en el flujo natural; técnicas/antideportivas (RG-F07), compensación (RG-C02) y art. 45 (RG-R01) siguen PENDIENTES por falta del texto normativo; flagrante sin generación natural.',
  REG02: 'Tiro en vuelo/interferencia: administrador no generable sin fila numérica (vuelo, frecuencia de interferencia): contenido pendiente declarado.',
  EST04: 'Estado propio por tramo (energía, Forma, momentos en cada tramo de presencia): NO implementado como consulta histórica propia; solo muestras en fronteras (pendiente declarado).',
  EST05: 'Asistencia con ruptura causal/desvío: sin productor de la interacción (pendiente declarado); lateralidad desconocida = simplificación aceptada.',
};
const out = GROUPS.map((g) => {
  const rs = by[g.id] ?? []; const cons = rs.filter((r) => r.coverage === 'consumido').length;
  return { id: g.id, soporte: g.support, responsabilidad: g.resp, entrega: g.delivery, filas: rs.length, filasConsumidas: cons, filasSinConsumidor: rs.length - cons, mecanismos: [...new Set(rs.map((r) => r.mech).filter(Boolean))].slice(0, 6), nota: NOTES[g.id] ?? null };
});
const fam = {}; for (const g of out) { const f = g.id.replace(/\d+$/, ''); (fam[f] ??= { grupos: 0, filas: 0, sinFilas: 0 }); fam[f].grupos += 1; fam[f].filas += g.filas; if (!g.filas) fam[f].sinFilas += 1; }
const md = ['# Inventario de cierre generado (MOTOR-14)', '', `Generado por \`node scripts/closure-inventory.js\` desde \`src/profiles/groups.js\` y las filas reales del perfil efectivo \`${profile.effectiveId.slice(-40)}\`. **Una fila con consumidor no prueba el comportamiento**; los grupos sin filas editables son contenido declarativo (catálogos, fichas) verificado por las pruebas de cada entrega.`, '',
  `Totales: ${out.filter((g) => !g.soporte).length} grupos funcionales + ${out.filter((g) => g.soporte).length} soportes; ${rows.length} filas con grupo.`, '', '| Familia | Grupos | Filas | Grupos sin filas editables |', '|---|---:|---:|---:|', ...Object.entries(fam).map(([f, v]) => `| ${f} | ${v.grupos} | ${v.filas} | ${v.sinFilas} |`), '',
  '| Grupo | Entrega | Filas (consumidas/total) | Mecanismos de lectura | Nota de cierre |', '|---|---|---:|---|---|', ...out.map((g) => `| ${g.id} | ${g.entrega} | ${g.filasConsumidas}/${g.filas} | ${g.mecanismos.join('; ') || '—'} | ${g.nota ?? ''} |`), ''].join('\n');
const dir = join(ROOT, 'docs', 'tecnico', 'evidencia-motor14'); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'inventario.json'), JSON.stringify({ generatedFrom: 'src/profiles/groups.js + buildRows', effectiveId: profile.effectiveId, groups: out, families: fam }, null, 1));
writeFileSync(join(dir, 'inventario.md'), md);
console.log(`${out.length} entradas; ${out.filter((g) => !g.filas).length} sin filas editables`);
