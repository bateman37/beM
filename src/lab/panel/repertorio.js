// Vista «Repertorio» (MOTOR-04): contenido declarativo del perfil consultado, para inspeccionarlo sin leer código.
// Disposiciones y funciones, roles ofensivos, las quince fichas con sus referencias al perfil común (recetas y pesos de la ficha
// donante) y las nueve continuaciones. Solo lectura: las magnitudes están en las filas de la tabla maestra.
import { h, table } from '../dom.js';
import { ps, ctx, repaint } from './common.js';
import { FAMILY_NAMES, FAMILY_ORDER } from '../styles.js';

export function renderRepertorio() {
  const c = ctx(); const eff = c.consult.effective; const rep = eff.repertoire;
  if (!rep) return h('div', { class: 'card' }, h('p', { class: 'muted' }, `La versión consultada (${c.consult.id}) es anterior a MOTOR-04 y no declara repertorio. Crea una candidata explícita desde Inicio o consulta la base de MOTOR-04.`));
  const row = (id) => c.cRows.byId.get(id);
  const goRow = (ids, label) => h('button', { class: 'link small', type: 'button', onclick: () => { ps.filters.ids = new Set(ids.filter((i) => row(i))); ps.filters.idsLabel = label; ps.filters.view = ''; ps.tab = 'tabla'; repaint(); } }, 'ver filas');
  const fnL = (f) => rep.functions[f]?.label ?? f;
  const root = h('div', {});
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Repertorio ofensivo de ${eff.effectiveId}`),
    h('p', { class: 'small muted' }, 'Contenido declarativo (clase «contenido»): lo que cada ficha, disposición y rol significa. Los pesos, probabilidades y duraciones NO están aquí: son filas del perfil común que las fichas referencian. No se editan desde esta vista.')));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Disposiciones y funciones de entrada'),
    table(['ID', 'Nombre', 'Funciones (cinco referencias)', 'Descripción'], Object.entries(rep.dispositions).map(([id, d]) => [id, d.name, d.functions.map(fnL).join(' · '), d.description])),
    h('p', { class: 'small muted' }, 'Funciones y sectores conocidos, no coordenadas. Acceso funcional al aro: ', Object.entries(rep.functions).map(([k, f]) => `${f.label} = ${f.access}`).join(' · '))));
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Quince roles ofensivos'),
    table(['Rol', 'Funciones que favorece (sesgo moderado, una vez, al elegir participante)'], Object.entries(eff.fixtureContract.offensiveRoleDictionary).map(([code, n]) => [`${code} ${n}`, (rep.offensiveRoles[code]?.favors ?? []).join(', ')])),
    goRow(['selection.rolePreference.favoredFunctionWeight', 'selection.rolePreference.otherFunctionWeight', 'selection.newVariantPreference.unknownRoleFunctionWeight'], 'Roles ofensivos')));
  for (const f of FAMILY_ORDER) {
    const plays = Object.entries(rep.plays).filter(([, p]) => p.family === f);
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, FAMILY_NAMES[f]),
      plays.map(([id, p]) => h('details', {}, h('summary', {}, h('strong', {}, id), ` ${p.name} · sector ${p.sector} · entradas naturales ${p.natural.join(', ')}`),
        h('div', { class: 'small' },
          h('p', {}, p.intent),
          h('p', {}, h('strong', {}, 'Recetas y pesos de referencia: '), p.recipeFrom ? `los de ${p.recipeFrom} (la ficha no tiene base propia de acierto, pérdidas ni duración)` : 'propios del perfil común', ' ', goRow([`plays.${p.recipeFrom ?? id}.shotWeights.rim`, `plays.${p.recipeFrom ?? id}.qualityAttack`], `Recetas de ${p.recipeFrom ?? id}`)),
          table(['Función', 'Origen', 'Funciones de disposición admitidas', 'Posiciones recomendadas', 'Tareas favorecidas por rol'], Object.entries(p.roles).map(([r, d]) => [r + (d.opt ? ' (opc.)' : ''), d.src, d.fn === undefined ? '—' : d.fn === 'any' ? 'cualquiera' : d.fn.map(fnL).join(' / '), d.slotGroup ? (eff.participantSlots[d.slotGroup] ?? []).join(', ') : '—', (d.tags ?? []).join(', ')])),
          table(['Salida de primer nivel', 'Zonas', 'Ejecución', 'Continuación'], p.exits.map((e) => [e.role, e.zones.join('/'), e.exec + (e.from ? ` (pasa ${e.from})` : ''), e.label ?? '—'])),
          p.stages ? Object.entries(p.stages).map(([k, st]) => h('div', {}, h('strong', {}, `Etapa «${k}» — decide ${st.decider} con su propia lectura`), table(['Salida', 'Zonas', 'Ejecución', 'Continuación'], st.exits.map((e) => [e.role, e.zones.join('/'), e.exec + (e.from ? ` (pasa ${e.from})` : ''), e.label ?? '—'])))) : null,
          p.denial?.cut ? h('p', {}, `Ante negación: corte ${p.denial.cut.label} del ${p.denial.cut.role} (con la aceptación de oportunidad inmediata del perfil).`) : null,
          p.requires ? h('p', {}, h('strong', {}, 'Requisitos: '), JSON.stringify(p.requires)) : null,
          h('p', {}, h('strong', {}, 'Opciones: '), p.options.join(' · '), ' · ', h('strong', {}, 'Seguridad: '), p.safety.join(', ')))))));
  }
  root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Nueve continuaciones'), table(['ID', 'Nombre'], Object.entries(rep.continuations))));
  return root;
}
