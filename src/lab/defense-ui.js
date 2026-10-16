// Controles defensivos de MOTOR-05 compartidos por «Preparación» y por el panel de dirección en vivo: organización (con objetivo,
// alternativa y alternativa por ausencia en box and one), altura de presión, cinco estilos, cobertura con navegación preparada,
// roles defensivos, marcas y las dos instrucciones persistentes (doble a jugador y no abandonar). Solo presentación: los valores
// salen del perfil; ninguna etiqueta contiene coeficientes inventados.
import { h } from './dom.js';

const f2 = (v) => String(v).replace('.', ',');

export const DEF_STYLE_DEFS = [
  { key: 'help', title: 'Ayudas', effect: (d, i) => `odds de ayuda adicional ×${f2(d.styles.additionalHelpOddsRatio[i])}`,
    help: 'Cuántas oportunidades de ayuda ADICIONAL se aceptan. Quien ayuda abandona una responsabilidad: otro puede relevar, recuperar después o concederla. No elimina las funciones estructurales de una zona.' },
  { key: 'pressure', title: 'Presión al balón', effect: (d, i) => `odds de presión cercana ×${f2(d.styles.closePressureChoiceOddsRatio[i])}`,
    help: 'Elección entre presión cercana y dar distancia al balón. Cercana: más exposición a pérdida y contacto; distancia: concede espacio al manejador. Independiente de la altura de presión y del riesgo de robo.' },
  { key: 'receivers', title: 'Defensa de receptores', effect: (d, i) => `odds de negar la recepción ×${f2(d.styles.receiverDenialChoiceOddsRatio[i])}`,
    help: 'Negar recepciones o facilitar la ayuda. Negar puede conceder la puerta atrás y limita la ayuda de ese defensor; facilitar la ayuda puede conceder la recepción.' },
  { key: 'steal', title: 'Riesgo de robo', effect: (d, i) => `odds de intentar intervenir ×${f2(d.styles.stealAttemptChoiceOddsRatio[i])}`,
    help: 'Intentar intervención sobre el balón frente a contener. Un intento puede robar, desviar, fallar o contactar y comprometer la posición. Presionar no obliga a intentar robar.' },
  { key: 'protection', title: 'Protección del tiro', effect: (d, i) => `peso interior ×${f2(d.styles.interiorProtectionChoiceWeight[i])} · exterior ×${f2(d.styles.exteriorProtectionChoiceWeight[i])}`,
    help: 'Qué amenaza se prioriza cuando no pueden cubrirse todas. Proteger el aro puede conceder exterior; priorizar el exterior puede dejar espacio interior. No multiplica la calidad defensiva.' },
];
export const DEF_STYLE_TITLES = Object.fromEntries(DEF_STYLE_DEFS.map((d) => [d.key, d.title]));
export const defStyleLabels = (profile) => Object.fromEntries(DEF_STYLE_DEFS.map((d) => [d.key, profile.defenseRepertoire.styles[d.key].levels.map((n, i) => `${i + 1} — ${n} · ${d.effect(profile.defense, i)}`)]));

// Texto de una organización: funciones y concesiones declaradas (contenido del perfil).
export function orgSummary(profile, id) {
  const o = profile.defenseRepertoire.organizations[id];
  const fns = o.functions ? Object.values(o.functions).map((f) => f.label).join(' · ') : 'cinco referencias personales';
  return { name: o.name, text: `${o.description} Funciones: ${fns}.`, concessions: o.concessions ?? ['Las ayudas y los cambios modifican la responsabilidad actual; la referencia inicial se conserva.'] };
}

// Genera el bloque de controles. `m` es un modelo editable:
//   { defense, target, targetAlt, fallbackOrg, pressureHeight, coverage, navigation, defStyles{}, marks[], specials[] }
// `ops` = { profile, players (propios), rivals, disabled, getRole(pid), setRole(pid, code), touch(field), refresh(), onlyLive }.
export function defenseControls(m, ops) {
  const { profile, players, rivals, disabled } = ops; const rep = profile.defenseRepertoire; const cat = profile.activeCatalog;
  const touch = (f) => { ops.touch?.(f); ops.refresh(); };
  const nm = (id) => id;
  const orgs = cat.defenses.map((id) => [id, rep.organizations[id]]);
  const org = rep.organizations[m.defense];
  const sum = orgSummary(profile, m.defense);
  const labels = defStyleLabels(profile);
  const sel = (value, options, onChange, extra = {}) => h('select', { disabled, onchange: (e) => onChange(e.target.value), ...extra }, options.map(([v, t]) => h('option', { value: v ?? '', selected: (value ?? '') === (v ?? '') }, t)));

  const orgBlock = h('div', {}, h('h3', {}, 'Organización defensiva'),
    h('label', { class: 'row' }, sel(m.defense, orgs.map(([id, o]) => [id, `${id} · ${o.name}`]), (v) => { m.defense = v; if (rep.organizations[v].kind !== 'boxAndOne') { /* el objetivo solo se exige en box and one */ } touch('defense'); }, { id: ops.idPrefix ? `${ops.idPrefix}-org` : undefined })),
    h('p', { class: 'small' }, sum.text), h('ul', { class: 'small muted' }, sum.concessions.map((c) => h('li', {}, c))),
    org.kind === 'boxAndOne' ? h('div', {},
      h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Objetivo del perseguidor'), sel(m.target, [['', '— sin designar —'], ...rivals.map((p) => [p.id, nm(p.id)])], (v) => { m.target = v || null; touch('target'); })),
      h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Alternativa individual (opcional)'), sel(m.targetAlt, [['', '— ninguna —'], ...rivals.filter((p) => p.id !== m.target).map((p) => [p.id, nm(p.id)])], (v) => { m.targetAlt = v || null; touch('targetAlt'); })),
      h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Si ningún objetivo está en pista'), sel(m.fallbackOrg, orgs.filter(([, o]) => o.kind !== 'boxAndOne').map(([id, o]) => [id, `${id} · ${o.name}`]), (v) => { m.fallbackOrg = v; touch('fallbackOrg'); })),
      h('p', { class: 'small muted' }, 'Sin objetivo en pista se ejecuta la alternativa declarada (no se inventa otra estrella objetivo). Cuando el objetivo vuelve y la intención sigue vigente, se retoma en la siguiente reorganización pertinente.')) : null);

  const heightBlock = h('div', {}, h('h3', {}, 'Altura de presión'),
    h('label', { class: 'row' }, sel(m.pressureHeight, cat.pressureHeights.map((k) => [k, rep.heights[k]]), (v) => { m.pressureHeight = v; touch('pressureHeight'); })),
    h('p', { class: 'small muted' }, 'Indica dónde empieza el encargo principal; el estilo «Presión al balón» indica cómo se ejerce. Elegir total no activa por sí solo una zona press ni cambia la organización. Más altura = avance más largo, más riesgo de demora o presión superada y más carga para los comprometidos.'));

  const styleBlock = h('div', {}, h('h3', {}, 'Estilos defensivos (cinco dimensiones; 3 = equilibrado)'),
    h('div', { style: 'display:grid; gap:6px' }, DEF_STYLE_DEFS.map((d) => h('label', { class: 'row', title: d.help }, h('span', { style: 'width:230px' }, d.title),
      sel(String(m.defStyles[d.key]), labels[d.key].map((t, i) => [String(i + 1), t]), (v) => { m.defStyles[d.key] = Number(v); touch(`defStyles.${d.key}`); })))),
    h('p', { class: 'small muted' }, 'Los estilos orientan elecciones y encargos; ninguno descuenta la conversión del rival ni garantiza una victoria.'));

  const cov = rep.coverages[m.coverage];
  const navOpts = cov.navigation;
  const covBlock = h('div', {}, h('h3', {}, 'Cobertura de bloqueos'),
    h('label', { class: 'row' }, sel(m.coverage, cat.coverage.map((id) => [id, `${id} · ${rep.coverages[id].name}`]), (v) => { m.coverage = v; m.navigation = null; touch('coverage'); })),
    navOpts.length > 1 ? h('label', { class: 'row' }, h('span', { style: 'width:230px' }, 'Navegación del defensor del balón'), sel(m.navigation ?? navOpts[0], navOpts.map((k) => [k, rep.navigationLabels[k]]), (v) => { m.navigation = v === navOpts[0] ? null : v; touch('navigation'); })) : h('p', { class: 'small muted' }, `Navegación preparada: ${rep.navigationLabels[navOpts[0]]} (única combinación realizable).`),
    h('p', { class: 'small' }, h('strong', {}, 'Compromiso: '), cov.commitment), h('p', { class: 'small' }, h('strong', {}, 'Concesión: '), cov.concession),
    h('p', { class: 'small muted' }, 'Elegir cambiar no garantiza igualdad de emparejamiento; elegir show no garantiza recuperación; elegir trampa no elimina todas las líneas de pase. Si falta la pareja funcional de defensores, la interacción se resuelve sin efecto de cobertura y se registra.'));

  const roleBlock = h('div', {}, h('h3', {}, 'Roles defensivos'),
    h('p', { class: 'small muted' }, 'Independientes del rol ofensivo. Orientan asignación y encargo (sesgo moderado, una vez); no suben notas, tapones ni velocidad, y la posición nominal solo recomienda.'),
    h('div', { style: 'display:grid; gap:4px' }, players.map((p) => h('label', { class: 'row' }, h('span', { style: 'width:150px' }, ops.label ? ops.label(p.id) : p.id),
      sel(ops.getRole(p.id), Object.entries(profile.fixtureContract.defensiveRoleDictionary).map(([c, n]) => [c, `${c} ${n} — ${rep.roles[c]?.encargo ?? ''}`]), (v) => { ops.setRole(p.id, v); touch(`role.${p.id}`); })))));

  const marks = m.marks;
  const targetOpts = [['', '— atacante o función —'], ...rivals.map((p) => [`p:${p.id}`, nm(p.id)]), ...Object.entries(rep.attackerFunctions).map(([k]) => [`f:${k}`, `función ${k}`])];
  const markDef = h('select', { disabled, 'aria-label': 'defensor de la marca' }, players.map((p) => h('option', { value: p.id }, p.id)));
  const markAtt = h('select', { disabled, 'aria-label': 'objetivo de la marca' }, targetOpts.map(([v, t]) => h('option', { value: v }, t)));
  const markBlock = h('div', {}, h('h3', {}, 'Marcas manuales'),
    h('p', { class: 'small muted' }, 'Defensor, atacante o función y ámbito. Tienen prioridad sobre la adecuación automática (tras la elegibilidad). Una marca no impide un cambio: eso exige una cobertura compatible. En zona colocan al defensor en la función que cubre ese área.'),
    marks.length ? h('ul', { class: 'orders' }, marks.map((mk, i) => h('li', { class: 'ord row' }, `${mk.defender} → ${mk.attacker ?? `función ${mk.fn}`} · ámbito ${mk.scope === 'period' ? 'periodo' : 'partido'}`, ' ',
      h('button', { class: 'link small err', type: 'button', disabled, onclick: () => { marks.splice(i, 1); touch('marks'); } }, 'quitar')))) : h('p', { class: 'small muted' }, 'Sin marcas: la asignación es automática.'),
    h('div', { class: 'row' }, markDef, '→', markAtt,
      h('button', { class: 'btn secondary', type: 'button', disabled, onclick: () => {
        if (!markAtt.value) return;
        const mk = { defender: markDef.value, scope: 'game' };
        if (markAtt.value.startsWith('p:')) mk.attacker = markAtt.value.slice(2); else mk.fn = markAtt.value.slice(2);
        const clean = marks.filter((x) => x.defender !== mk.defender && (x.attacker ?? x.fn) !== (mk.attacker ?? mk.fn));
        marks.length = 0; marks.push(...clean, mk); touch('marks');
      } }, 'Añadir marca')));

  const sp2 = m.specials.find((x) => x.id === 'ESPD02'); const sp3 = m.specials.find((x) => x.id === 'ESPD03');
  const setSpecial = (id, cfg) => { const rest = m.specials.filter((x) => x.id !== id); m.specials.length = 0; m.specials.push(...rest, ...(cfg ? [{ id, ...cfg }] : [])); touch('specials'); };
  const specialBlock = h('div', {}, h('h3', {}, 'Instrucciones especiales'),
    h('div', { class: 'card inner' },
      h('label', { class: 'row' }, h('input', { type: 'checkbox', disabled, checked: !!sp2, onchange: (e) => setSpecial('ESPD02', e.target.checked ? { principal: rivals[0]?.id ?? null, alternate: null, activation: 'reception', executor: null, executorAlt: null } : null) }), h('strong', {}, ' ESPD02 · Doble a jugador')),
      sp2 ? h('div', { style: 'display:grid; gap:4px' },
        h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Jugador principal'), sel(sp2.principal, rivals.map((p) => [p.id, p.id]), (v) => setSpecial('ESPD02', { ...sp2, principal: v }))),
        h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Alternativa individual'), sel(sp2.alternate, [['', '— ninguna —'], ...rivals.filter((p) => p.id !== sp2.principal).map((p) => [p.id, p.id])], (v) => setSpecial('ESPD02', { ...sp2, alternate: v || null }))),
        h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Se activa en'), sel(sp2.activation, [['reception', 'la recepción'], ['firstDribble', 'el primer bote']], (v) => setSpecial('ESPD02', { ...sp2, activation: v }))),
        h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Ejecutor preferido'), sel(sp2.executor, [['', '— el mejor relevo funcional —'], ...players.map((p) => [p.id, p.id])], (v) => setSpecial('ESPD02', { ...sp2, executor: v || null }))),
        h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Ejecutor alternativo'), sel(sp2.executorAlt, [['', '— ninguno —'], ...players.filter((p) => p.id !== sp2.executor).map((p) => [p.id, p.id])], (v) => setSpecial('ESPD02', { ...sp2, executorAlt: v || null })))) : null,
      h('p', { class: 'small muted' }, 'Reutiliza el compromiso de dos de la trampa: no se ejecutan dos trampas sobre la misma interacción. No roba ni frena automáticamente al objetivo; si falta un ayudante compatible queda limitada y se explica.')),
    h('div', { class: 'card inner' },
      h('label', { class: 'row' }, h('input', { type: 'checkbox', disabled, checked: !!sp3, onchange: (e) => setSpecial('ESPD03', e.target.checked ? { protected: rivals[0]?.id ?? null } : null) }), h('strong', {}, ' ESPD03 · No abandonar tirador')),
      sp3 ? h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Tirador protegido'), sel(sp3.protected, rivals.map((p) => [p.id, p.id]), (v) => setSpecial('ESPD03', { protected: v }))) : null,
      h('p', { class: 'small muted' }, 'Restringe a los ayudantes que lo abandonarían; no sube atributos ni impide que reciba o anote. Si la doble necesita justo a ese ayudante y no hay otro compatible, la doble no se ejecuta.')),
    h('p', { class: 'small muted' }, 'ESPD01 · Falta táctica es una orden puntual: se pide durante el encuentro (panel de dirección › «Falta táctica»); no detiene el reloj por pulsar el botón.'));

  return h('div', {}, orgBlock, heightBlock, styleBlock, covBlock, roleBlock, markBlock, specialBlock);
}

// Resumen de una línea de la defensa efectiva (pantalla principal). `view` = match.defenseView(team).
export function defenseSummary(profile, view) {
  const rep = profile.defenseRepertoire; const p = view.plan; const e = view.effective;
  const parts = [`${p.org} ${rep.organizations[p.org].name}`, rep.heights[p.height], `${p.coverage} ${rep.coverages[p.coverage].name}${p.navigation ? ` (${rep.navigationLabels[p.navigation]})` : ''}`];
  const diverge = e.org !== p.org ? `${e.org} ${rep.organizations[e.org].name} activa como alternativa: ${e.reason ?? 'objetivo fuera de pista'}` : null;
  return { text: parts.join(' · '), diverge, objective: e.objective };
}
