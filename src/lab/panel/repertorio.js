// Vista «Repertorio» (MOTOR-04 y MOTOR-05): contenido declarativo del perfil consultado, para inspeccionarlo sin leer código.
// Disposiciones y funciones, roles ofensivos, las quince fichas con sus referencias al perfil común (recetas y pesos de la ficha
// donante) y las nueve continuaciones. Solo lectura: las magnitudes están en las filas de la tabla maestra.
import { h, table } from '../dom.js';
import { ps, ctx, repaint } from './common.js';
import { FAMILY_NAMES, FAMILY_ORDER } from '../styles.js';

export function renderRepertorio() {
  const c = ctx(); const eff = c.consult.effective; const rep = eff.repertoire;
  if (!rep) return h('div', { class: 'card' }, h('p', { class: 'muted' }, `La versión consultada (${c.consult.id}) es anterior a MOTOR-04 y no declara repertorio. Crea una candidata explícita desde Inicio o consulta la base de MOTOR-05.`));
  const row = (id) => c.cRows.byId.get(id);
  const goRow = (ids, label) => h('button', { class: 'link small', type: 'button', onclick: () => { ps.filters.ids = new Set(c.cRows.rows.filter((r) => ids.some((i) => r.id === i || r.id.startsWith(`${i}.`))).map((r) => r.id)); ps.filters.idsLabel = label; ps.filters.view = ''; ps.tab = 'tabla'; repaint(); } }, 'ver filas');
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

  // ---------------------------------------------------------------- MOTOR-05: repertorio defensivo
  const dr = eff.defenseRepertoire;
  if (dr) {
    root.append(h('div', { class: 'card' }, h('h2', { style: 'margin:0' }, `Repertorio defensivo de ${eff.effectiveId}`),
      h('p', { class: 'small muted' }, 'Contenido declarativo: organizaciones, funciones, responsabilidades y concesiones. Es lectura de Claude de los apartados 4–10 del encargo (provisional, a revisar); las magnitudes (estilos, adecuación, presión, coberturas, especiales) son filas del perfil, editables en la tabla maestra o su editor de detalle. Ninguna organización recibe un porcentaje de victoria ni de reducción del ataque.')));
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Seis organizaciones, funciones y responsabilidades'),
      Object.entries(dr.organizations).map(([id, o]) => h('details', {}, h('summary', {}, h('strong', {}, id), ` ${o.name} — ${o.description}`),
        h('div', { class: 'small' },
          o.functions ? table(['Función', 'Línea', 'Receta de adecuación', 'Favorecida por roles (etiquetas)'], Object.entries(o.functions).map(([k, f]) => [`${k} · ${f.label}`, f.line, f.fit, f.tags.join(', ')])) : h('p', {}, 'Cinco referencias personales: cada defensor recibe un atacante por adecuación a la función observada de ese atacante, marcas manuales y estabilidad.'),
          o.areas ? table(['Función del atacante', 'Primera referencia', 'Relevo compatible'], Object.entries(o.areas).flatMap(([fn, a]) => [].concat(a).map((x, i) => [`${fn}${Array.isArray(a) ? ` #${i + 1}` : ''}`, x.first, x.relief.join(', ')]))) : null,
          o.rim ? h('p', {}, h('strong', {}, 'Protección del aro (finalización en el aro/interior): '), o.rim.join(' → ')) : null,
          h('ul', {}, (o.concessions ?? []).map((c) => h('li', {}, c))))))));
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Doce roles defensivos'),
      table(['Rol', 'Encargo favorecido', 'Etiquetas que favorece'], Object.entries(eff.fixtureContract.defensiveRoleDictionary).map(([code, n]) => [`${code} ${n}`, dr.roles[code]?.encargo ?? '', (dr.roles[code]?.tags ?? []).join(', ')])),
      goRow(['defense.assignment.roleFitWeight', 'defense.assignment.otherRoleFitWeight', 'defense.assignment.retainedReferenceScorePoints'], 'Roles defensivos y adecuación'),
      h('p', { class: 'small muted' }, 'Independientes del rol ofensivo. Orientan la asignación y las ayudas; no suben notas ni velocidad, y la posición nominal solo recomienda.')));
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Cinco estilos defensivos'),
      table(['Dimensión', 'Niveles 1 → 5'], Object.entries(dr.styles).map(([k, d]) => [d.label, d.levels.join(' · ')])),
      goRow(Object.keys(eff.defense.styles).map((k) => `defense.styles.${k}`).concat(Object.keys(eff.defense.choiceReferences).map((k) => `defense.choiceReferences.${k}`)), 'Estilos defensivos')));
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Tres alturas de presión y cuatro coberturas'),
      table(['Altura', 'Significado'], Object.entries(dr.heights)),
      table(['ID', 'Cobertura', 'Compromiso', 'Concesión y continuidad', 'Navegación preparada'], Object.entries(dr.coverages).map(([id, c]) => [id, c.name, c.commitment, c.concession, c.navigation.map((n) => dr.navigationLabels[n]).join(' / ')])),
      goRow(Object.keys(eff.defense.pressure).map((k) => `defense.pressure.${k}`).concat(Object.keys(eff.defense.coverage).map((k) => `defense.coverage.${k}`)), 'Presión y coberturas')));
    root.append(h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Tres instrucciones especiales'),
      table(['ID', 'Instrucción', 'Campos'], Object.entries(dr.specials).map(([id, d]) => [id, d.name, d.fields.join(', ')])),
      h('p', { class: 'small muted' }, 'Pendientes de cobertura posterior (DEF08 defensas de saque, DEF09 memoria): sus filas de catálogo no marcan «defensa completa».'),
      goRow(Object.keys(eff.defense.specials).map((k) => `defense.specials.${k}`), 'Instrucciones especiales')));
  }
  return root;
}
