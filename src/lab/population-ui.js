// Población de MOTOR-11 en la pantalla «Plantillas»: equipos en uso (puestos A y B), catálogo de referencias/generados/variantes, inspección de las doce fichas,
// ficha completa (lectura y edición), generador y diferencias. Solo coloca entradas: ninguna selección cambia en silencio el rival ni su plan.
import { h, table, fmt } from './dom.js';
import { store, ATTR_GROUPS, popProfile, popFromActive, assignTeam, restoreSlot, loadNaturalPlan, saveVariantFromSlot, slotDirty, refTeam, logicalTeam, persist, fpOf } from './store.js';
import { generateTeam, diffToCenters, DISPERSION_NAMES, validateTeamRecord, diffTeams, REFERENCE_IDS, genOf, recipeSummary, generatedId } from '../population/index.js';
import { momentCategory, CATEGORY_LABELS } from '../match/index.js';
import { prepProfile } from './store.js';

export const srcText = (s) => {
  if (!s) return 'entrada guardada (sin procedencia)';
  if (s.kind === 'reference') return `Referencia ${s.teamId} · revisión ${s.revision} · plan ${s.planVersion}`;
  if (s.kind === 'generated') return `Generado de ${s.base} · semilla ${s.seed} · dispersión ${s.dispersion} · ${s.recipe?.version ?? '—'}`;
  if (s.kind === 'variant') return `Variante de ${s.base?.teamId ?? '—'} (${s.base?.kind ?? ''})`;
  return s.kind ?? '—';
};
export function planSummary(profile, plan) {
  const rep = profile.repertoire; const dr = profile.defenseRepertoire; const nat = plan.natural ? ` · ${plan.natural.version}` : '';
  const first = plan.playbook.filter((b) => b.priority === 1).map((b) => b.playId).join(', ') || '—'; const second = plan.playbook.filter((b) => b.priority === 2).map((b) => b.playId).join(', ') || '—';
  return `${plan.disposition} ${rep.dispositions[plan.disposition]?.name ?? ''} · ${plan.defense} ${dr.organizations[plan.defense]?.name ?? ''}${plan.pressureHeight !== 'normal' ? ` (${dr.heights?.[plan.pressureHeight] ?? plan.pressureHeight})` : ''} · ${plan.coverage} · libro P1 ${first} / P2 ${second}${nat}`;
}
const pill = (txt, cls = '') => h('span', { class: `pill ${cls}` }, txt);
const labelOf = (a) => `${a} ${store.labels[a] ?? ''}`;

// ---------------------------------------------------------------------------------------------- ficha completa (lectura/edición)
const GROUP_HEAD = [['Técnicas (18)', ['Tiro', 'Balón, pase y juego sin balón', 'Defensa', 'Rebote']], ['Físicas (7)', ['Físicas']], ['Mentales (7)', ['Mentales']]];
function roleLine(p, team) {
  const plan = team.plan; const bits = [];
  const slot = Object.entries(plan.starters).find(([, id]) => id === p.id)?.[0]; if (slot) bits.push(`titular ${slot}`);
  const pair = plan.participation?.pairs?.find((q) => q.relief === p.id); if (pair) bits.push(`relevo de ${pair.starter.split('-')[1]} (${pair.slot})`);
  if (plan.participation?.situational?.includes(p.id)) bits.push('recurso situacional');
  const dr = plan.directorPriority.indexOf(p.id); if (dr >= 0) bits.push(dr === 0 ? 'director' : `director alternativo ${dr}`);
  return bits.length ? bits.join(' · ') : 'sin función especial en el plan';
}
function describe(p) {
  const arr = Object.entries(p.abilities).sort((a, b) => b[1] - a[1]);
  const f = arr.slice(0, 3).map(([a, v]) => `${labelOf(a)} (${fmt(v, 1)})`).join(', '); const c = arr.slice(-3).reverse().map(([a, v]) => `${labelOf(a)} (${fmt(v, 1)})`).join(', ');
  return { f, c };
}
const num = (p, key, set, { min, max, step = 1, int = false, label }) => h('input', { type: 'number', min, max, step, value: Number(p[key]), 'aria-label': `${label ?? key} de ${p.id}`, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= min && v <= max && (!int || Number.isInteger(v))) { set(v); persist(); } else { e.target.value = p[key]; alert(`${label ?? key}: valor entre ${min} y ${max}${int ? ' (entero)' : ''}.`); } } });

// `edit`: { onRepaint, diag } o null (lectura). La lectura no modifica nada.
export function playerSheet(p, team, edit = null) {
  const prof = prepProfile(); const rep = prof.fixtureContract; const d = describe(p);
  const ro = !edit; const again = () => edit?.onRepaint?.();
  const setAttr = (a, v) => { p.abilities[a] = v; persist(); };
  const abil = GROUP_HEAD.map(([head, groups]) => h('div', {}, h('h3', {}, head), ATTR_GROUPS.filter(([g]) => groups.includes(g)).map(([g, list]) => h('div', {}, h('div', { class: 'small muted' }, g),
    h('div', { class: 'attrgrid' }, list.map((a) => h('div', { class: 'attr' }, h('label', { for: `a-${p.id}-${a}` }, labelOf(a)),
      ro ? h('span', { class: 'num' }, fmt(p.abilities[a], 2)) : h('input', { id: `a-${p.id}-${a}`, type: 'number', min: 1, max: 30, step: 0.1, value: Number(p.abilities[a].toFixed(4)), onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 1 && v <= 30) setAttr(a, v); else { e.target.value = p.abilities[a]; alert('La capacidad debe estar entre 1 y 30.'); } } }))))))));
  const kv = (k, v) => [h('div', { class: 'muted' }, k), h('div', {}, v)];
  const field = (label, readText, input) => kv(label, ro ? readText : input);
  const body = h('div', {}, h('h3', {}, 'Cuerpo, edad y posiciones'), h('div', { class: 'kv' },
    field('Edad', `${p.age} años`, num(p, 'age', (v) => { p.age = v; }, { min: 14, max: 60, int: true, label: 'Edad' })),
    field('Altura', `${p.heightCm} cm`, num(p, 'heightCm', (v) => { p.heightCm = v; }, { min: 170, max: 220, step: 0.5, label: 'Altura (cm)' })),
    field('Envergadura', `${p.wingspanCm} cm`, num(p, 'wingspanCm', (v) => { p.wingspanCm = v; }, { min: 170, max: 235, step: 0.5, label: 'Envergadura (cm)' })),
    field('Peso', `${p.weightKg} kg (efecto directo adicional: cero)`, num(p, 'weightKg', (v) => { p.weightKg = v; }, { min: 40, max: 200, step: 0.5, label: 'Peso (kg)' })),
    field('Posiciones', p.positions.join('|'), h('span', {}, ['PG', 'SG', 'SF', 'PF', 'C'].map((s) => h('label', { class: 'small', style: 'margin-right:8px' }, h('input', { type: 'checkbox', checked: p.positions.includes(s), onchange: (e) => { const set = new Set(p.positions); if (e.target.checked) set.add(s); else set.delete(s); if (!set.size) { e.target.checked = true; alert('Una ficha necesita al menos una posición.'); return; } p.positions = ['PG', 'SG', 'SF', 'PF', 'C'].filter((x) => set.has(x)); persist(); again(); } }), ` ${s}`))))),
    h('p', { class: 'small muted' }, 'La edad y el peso no modifican capacidades ni añaden rendimiento por sí solos; cambiar el cuerpo no vuelve a generar Fuerza. Los límites son los del contrato corporal del perfil.'));
  const zsum = p.zonePreference.rim + p.zonePreference.midrange + p.zonePreference.three;
  const zone = (k, label) => field(label, fmt(p.zonePreference[k], 3), num({ id: p.id, ...p, zone: p.zonePreference[k] }, 'zone', (v) => { p.zonePreference[k] = v; }, { min: 0, max: 1, step: 0.01, label }));
  const tend = h('div', {}, h('h3', {}, 'Tendencias (no son capacidades)'), h('div', { class: 'kv' },
    field('Iniciativa', fmt(p.initiative, 3), num(p, 'initiative', (v) => { p.initiative = v; }, { min: 0, max: 1, step: 0.01, label: 'Iniciativa' })),
    field('Vocación de finalización', fmt(p.finishingVocation, 3), num(p, 'finishingVocation', (v) => { p.finishingVocation = v; }, { min: 0, max: 1, step: 0.01, label: 'Vocación' })),
    zone('rim', 'Preferencia aro'), zone('midrange', 'Preferencia media distancia'), zone('three', 'Preferencia triple'),
    kv('Suma de preferencias de zona', h('span', {}, fmt(zsum, 3), ' ', Math.abs(zsum - 1) > 1e-6 ? h('span', { class: 'pill warn' }, 'no suma 1') : null, ro ? null : h('button', { class: 'link small', type: 'button', onclick: () => { const t = zsum || 1; for (const k of ['rim', 'midrange', 'three']) p.zonePreference[k] = Number((p.zonePreference[k] / t).toFixed(4)); p.zonePreference.three = Number((1 - p.zonePreference.rim - p.zonePreference.midrange).toFixed(4)); persist(); again(); } }, 'normalizar a 1'))),
    ),
    h('p', { class: 'small muted' }, 'Capacidad, tendencia, rol y estado son cosas distintas: un tirador no recibe precisión por su etiqueta y una capacidad alta no impone una preferencia máxima.'));
  const roleSel = (kind, dict) => ro ? `${p[kind].code} ${p[kind].name}` : h('select', { 'aria-label': `${kind} de ${p.id}`, onchange: (e) => { p[kind] = { code: e.target.value, name: dict[e.target.value] }; persist(); again(); } }, Object.entries(dict).map(([c, n]) => h('option', { value: c, selected: p[kind].code === c }, `${c} ${n}`)));
  const roles = h('div', {}, h('h3', {}, 'Roles y función'), h('div', { class: 'kv' },
    kv('Rol ofensivo', roleSel('offensiveRole', rep.offensiveRoleDictionary)), kv('Rol defensivo', roleSel('defensiveRole', rep.defensiveRoleDictionary)), kv('Función en el plan', roleLine(p, team)),
    kv('Fortalezas descritas', d.f), kv('Carencias descritas', d.c)), h('p', { class: 'small muted' }, 'Cambiar un rol no cambia capacidades ni crea aptitud; fortalezas y carencias son una descripción de los valores, no un atributo.'));
  const cat = (kind, v) => CATEGORY_LABELS[kind][momentCategory(prof, v)];
  const stateRow = (key, kind, label) => {
    const [lo, hi] = key === 'form' ? prof.form.range : prof.moment.range;
    return kv(label, ro || !edit.diag ? cat(kind, p.state[key]) : h('span', {}, h('input', { type: 'number', min: lo, max: hi, step: 0.05, value: p.state[key], 'aria-label': `${key} inicial de ${p.id}`, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= lo && v <= hi) { p.state[key] = v; persist(); } else e.target.value = p.state[key]; } }), ` ${cat(kind, p.state[key])}`));
  };
  const states = h('div', {}, h('h3', {}, 'Estados de entrada'), h('div', { class: 'kv' },
    kv('Energía inicial', ro ? p.state.energy : h('input', { type: 'number', min: 0, max: 100, step: 1, value: p.state.energy, 'aria-label': `Energía inicial de ${p.id}`, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0 && v <= 100) { p.state.energy = v; persist(); } else { e.target.value = p.state.energy; alert('La energía inicial debe estar entre 0 y 100.'); } } })),
    stateRow('form', 'forma', 'Forma'), stateRow('M_TIR', 'momento', 'M-TIR (tiro)'), stateRow('M_OFE', 'momento', 'M-OFE (control y ejecución ofensiva)'), stateRow('M_DEF', 'momento', 'M-DEF (defensa y disputa)'), kv('Faltas', p.state.fouls), kv('Disponible', p.state.available ? 'Sí' : 'No')),
    h('p', { class: 'small muted' }, 'La Forma se recibe al empezar y no cambia durante el partido; los momentos son altibajos breves por ámbito. Se muestran como categorías; el número exacto se edita solo en el modo diagnóstico. Los botones +1/+3/+5 no los tocan.'));
  const prov = h('div', {}, h('h3', {}, 'Procedencia'), h('ul', { class: 'small' }, (p.provenance ?? [{ revision: 'sin registro', source: 'entrada guardada sin procedencia' }]).map((x) => h('li', {}, `${x.revision}: ${x.source}${x.change ? ` — ${x.change}` : ''}${x.note ? ` (${x.note})` : ''}`))));
  return h('div', {}, h('div', { class: 'grid2' }, body, tend, roles, states), prov, abil);
}

// ---------------------------------------------------------------------------------------------- equipos en uso
export function slotsCard(ctx) {
  const { ui, rerender } = ctx;
  const diff = (t) => {
    const src = t.source; let base = null;
    try { if (src?.kind === 'reference') base = refTeam(src.teamId, { revision: src.revision, planKind: src.planKind }); else if (src?.kind === 'variant' || src?.kind === 'generated') base = store.pop.team(src.savedAs ?? src.instance?.of) ?? (src.kind === 'generated' ? generateTeam(popProfile(), store.players, { base: src.base, seed: src.seed, dispersion: src.dispersion, label: src.label }) : null); } catch { base = null; }
    return base ? diffTeams(base, t) : null;
  };
  const card = (i) => {
    const t = store.edit.teams[i]; const dirty = slotDirty(t); const src = t.source; const prof = prepProfile();
    const errs = validateTeamRecord(t, prof, { rivalCheck: false });
    const showDiff = ui.diffSlot === i; const d = showDiff ? diff(t) : null;
    return h('div', { class: 'card' },
      h('div', { class: 'row' }, h('h3', { style: 'margin:0' }, `Equipo ${i === 0 ? 'A' : 'B'} · ${t.id} — ${t.name}`), dirty ? pill('editado respecto a la base cargada', 'warn') : pill('sin ediciones', 'ok'), errs.length ? pill(`${errs.length} errores de ficha`, 'bad') : null),
      h('p', { class: 'small' }, srcText(src)), h('p', { class: 'small muted' }, planSummary(prof, t.plan)),
      h('p', { class: 'small muted' }, src?.fingerprint ? `huella de origen ${src.fingerprint}` : '', src?.instance && src.instance.of !== t.id ? ` · instancia ${t.id} del equipo lógico ${src.instance.of}` : ''),
      h('div', { class: 'row' },
        h('button', { class: `btn ${ui.team === i && !ui.inspect ? '' : 'secondary'}`, type: 'button', onclick: () => { ui.team = i; ui.openPlayer = null; ui.inspect = null; rerender(); } }, 'Abrir plantilla y fichas'),
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { if (dirty && !confirm('Restaurar sustituye tus ediciones de este equipo por su base. ¿Seguir? (puedes guardarlas antes como variante)')) return; const r = restoreSlot(i); ui.msg = r.ok ? `${t.id} restaurado desde su referencia (${srcText(store.edit.teams[i].source)}).` : `No se pudo restaurar: ${r.error}`; rerender(); } }, 'Restaurar referencia'),
        src?.kind === 'reference' && store.pop && popProfile().scenario.plans.some((p) => p.teamId === src.teamId) ? h('button', { class: 'btn secondary', type: 'button', onclick: () => { if (dirty && !confirm('Se sustituyen tus ediciones. ¿Seguir?')) return; const r = restoreSlot(i, { planKind: src.planKind === 'historical' ? 'natural' : 'historical' }); ui.msg = r.ok ? `${t.id}: cargado el plan ${store.edit.teams[i].source.planVersion}.` : r.error; rerender(); } }, src.planKind === 'historical' ? 'Pasar al plan natural de MOTOR-11' : 'Usar el plan histórico de MOTOR-10') : null,
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.diffSlot = showDiff ? null : i; rerender(); } }, showDiff ? 'Ocultar diferencias' : 'Ver diferencias con la base'),
        h('button', { class: 'btn secondary', type: 'button', onclick: () => { const name = prompt('Nombre de la variante (identidad nueva; la referencia no se toca):', `${t.name} (variante)`); if (name === null) return; const r = saveVariantFromSlot(i, name); ui.msg = r.ok ? `Variante guardada como ${r.id} con ${r.record.changeCount} diferencias respecto a su base.${r.record.changeCount ? '' : ' (sin diferencias: es una copia de la base)'}` : `No se guardó: ${r.error}`; rerender(); } }, 'Guardar como variante')),
      showDiff ? (d == null ? h('p', { class: 'small' }, 'No hay una base reconstruible para comparar.') : d.length ? h('div', {}, h('p', { class: 'small' }, `${d.length} diferencias respecto a la base cargada (mostrando ${Math.min(d.length, 250)}).`), table(['Campo', 'Antes', 'Después'], d.slice(0, 250).map((x) => [x.campo, String(x.antes ?? '—'), String(x.despues ?? '—')]))) : h('p', { class: 'small' }, 'Sin diferencias: el equipo es idéntico a su base.')) : null);
  };
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Equipos en uso en el próximo encuentro'),
    h('p', { class: 'small muted' }, 'Elige abajo qué equipo ocupa cada puesto. Cargar un equipo no cambia el rival ni su plan; las referencias del plan se revalidan con el equipo propio y, si el rival tenía marcas u objetivos sobre jugadores que ya no existen, se retiran y se avisa.'),
    h('div', { class: 'grid2' }, card(0), card(1)));
}

// ---------------------------------------------------------------------------------------------- catálogo
function teamCard(ctx, { key, title, sub, line, extra, logical, saved }) {
  const { ui, rerender } = ctx;
  const use = (slot) => { const cur = store.edit.teams[slot]; if (slotDirty(cur) && !confirm(`El equipo ${slot ? 'B' : 'A'} (${cur.id}) tiene ediciones sin guardar que se perderán al sustituirlo. ¿Seguir? (puedes guardarlas como variante)`)) return;
    try { const r = assignTeam(slot, logical()); ui.team = slot; ui.openPlayer = null; ui.inspect = null; ui.diffSlot = null; ui.msg = `${r.inst.id} colocado como equipo ${slot ? 'B' : 'A'} (${srcText(r.inst.source)}).${r.removed.length ? ` Se retiraron referencias que ya no existen: ${r.removed.join('; ')}.` : ''}`; } catch (e) { ui.msg = `No se pudo colocar: ${e.message}`; } rerender(); };
  return h('div', { class: 'card', style: 'margin:0', 'data-team': key },
    h('div', { class: 'row' }, h('strong', {}, title), sub ? pill(sub) : null), h('p', { class: 'small' }, line), extra ? h('p', { class: 'small muted' }, extra) : null,
    h('div', { class: 'row' },
      h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.inspect = key; ui.openPlayer = null; rerender(); } }, 'Inspeccionar'),
      h('button', { class: 'btn', type: 'button', id: `use-a-${key}`, onclick: () => use(0) }, 'Usar como A'), h('button', { class: 'btn', type: 'button', id: `use-b-${key}`, onclick: () => use(1) }, 'Usar como B'),
      saved ? h('button', { class: 'link small err', type: 'button', onclick: () => { if (confirm(`¿Eliminar ${key} de la biblioteca local? Los partidos y escenarios ya guardados conservan su copia.`)) { store.pop.remove(key); if (ui.inspect === key) ui.inspect = null; ui.msg = `${key} eliminado.`; rerender(); } } }, 'eliminar') : null));
}
export function catalogCard(ctx) {
  const prof = popProfile(); const pop = prof.population; const { ui } = ctx;
  const refs = REFERENCE_IDS.map((id) => { const spec = pop.teams[id]; const t = refTeam(id); const vet = t.players.find((p) => p.age >= 40);
    return teamCard(ctx, { key: id, title: `${id} — ${spec.name}`, sub: `rev. ${pop.currentRevision}`, line: planSummary(prof, spec.plan), extra: `${spec.identity}${vet ? ` · incluye a ${vet.id} de ${vet.age} años` : ''} · 12 fichas`, logical: () => refTeam(id) }); });
  const saved = (list) => list.map((r) => teamCard(ctx, { key: r.id, title: `${r.id} — ${r.name}`, sub: r.kind === 'generated' ? 'generado' : 'variante', line: planSummary(prof, r.team.plan), extra: `${srcText(r.team.source)}${r.changeCount != null ? ` · ${r.changeCount} diferencias` : ''} · guardado ${String(r.savedAt ?? '').slice(0, 16).replace('T', ' ')}`, logical: () => store.pop.team(r.id), saved: true }));
  const gen = store.pop.generated(); const vars = store.pop.variants();
  return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Catálogo de equipos: doce de referencia, generados y variantes'),
    h('p', { class: 'small muted' }, `Referencias de ${pop.version} (revisión ${pop.currentRevision}); ${popFromActive() ? 'tomadas del perfil activo' : 'tomadas de la base de MOTOR-11 (el perfil activo es anterior: actívala en Panel › Inicio para editar su receta)'}. Las doce fichas de cada equipo son las del anexo B de MOTOR-01 y no se vuelven a sortear. No hay una fuerza global de equipo: cada tarjeta describe identidad y plan.`),
    h('div', { class: 'grid2' }, refs),
    h('h3', {}, `Generados (${gen.length})`), gen.length ? h('div', { class: 'grid2' }, saved(gen)) : h('p', { class: 'small muted' }, 'Ninguno guardado todavía.'),
    h('h3', {}, `Variantes (${vars.length})`), vars.length ? h('div', { class: 'grid2' }, saved(vars)) : h('p', { class: 'small muted' }, 'Ninguna guardada todavía. Una variante nace al guardar el equipo en uso («Guardar como variante») y no sustituye jamás a la referencia.'),
    store.pop.loadError ? h('div', { class: 'errbox' }, h('strong', { class: 'err' }, store.pop.loadError.message), ' ', h('button', { class: 'btn danger', type: 'button', onclick: () => { if (confirm('¿Descartar los datos locales dañados de la biblioteca de población?')) { store.pop.discardDamaged(); ctx.rerender(); } } }, 'Descartar datos dañados')) : null,
    store.pop.saveState.error ? h('p', { class: 'pill bad' }, store.pop.saveState.error) : null, void ui);
}

// ---------------------------------------------------------------------------------------------- inspección de las doce fichas (solo lectura)
export function inspectCard(ctx) {
  const { ui, rerender } = ctx; if (!ui.inspect) return null;
  let t; try { t = logicalTeam(ui.inspect); } catch (e) { return h('div', { class: 'errbox' }, `No se puede inspeccionar ${ui.inspect}: ${e.message}`); }
  const prof = popProfile();
  const rows = t.players.map((p) => h('tr', {},
    h('td', {}, p.id), h('td', {}, p.positions.join('|')), h('td', {}, `${p.offensiveRole.code} ${p.offensiveRole.name} · ${p.defensiveRole.code} ${p.defensiveRole.name}`), h('td', {}, `${p.age} a.`), h('td', {}, `${p.heightCm}/${p.wingspanCm} cm · ${p.weightKg} kg`), h('td', {}, roleLine(p, t)),
    h('td', {}, h('button', { class: 'link', type: 'button', onclick: () => { ui.inspectPlayer = ui.inspectPlayer === p.id ? null : p.id; rerender(); } }, ui.inspectPlayer === p.id ? 'cerrar' : 'ver ficha'))));
  const open = t.players.find((p) => p.id === ui.inspectPlayer);
  return h('div', { class: 'card', id: 'inspect' },
    h('div', { class: 'row' }, h('h3', { style: 'margin:0' }, `Inspección de ${t.id} — ${t.name}`), pill(srcText(t.source)), h('button', { class: 'btn secondary', type: 'button', onclick: () => { ui.inspect = null; ui.inspectPlayer = null; rerender(); } }, 'Cerrar inspección')),
    h('p', { class: 'small muted' }, `Solo lectura: no modifica el equipo en uso. ${planSummary(prof, t.plan)}.`),
    h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, ['Plaza', 'Posiciones', 'Roles ofensivo y defensivo', 'Edad', 'Cuerpo (altura/envergadura/peso)', 'Función de referencia en el plan', ''].map((x) => h('th', {}, x)))), h('tbody', {}, rows))),
    open ? h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, `Ficha ${open.id} (lectura)`), playerSheet(open, t, null)) : null);
}

// ---------------------------------------------------------------------------------------------- generador
export function generatorCard(ctx) {
  const { ui, rerender } = ctx; const prof = popProfile(); const gen = genOf(prof); const g = ui.gen;
  if (!gen) return h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Generador'), h('p', {}, 'Ningún perfil disponible incluye la receta del generador.'));
  const run = () => { try { const t = generateTeam(prof, store.players, { base: g.base, seed: g.seed, dispersion: g.dispersion, label: g.label }); g.preview = { team: t, centers: diffToCenters(t, refTeam(g.base)), errors: validateTeamRecord(t, prof) }; g.check = null; ui.msg = ''; } catch (e) { g.preview = null; ui.msg = `No se pudo generar: ${e.message}`; } rerender(); };
  const pv = g.preview;
  const dispSel = h('select', { id: 'gen-disp', 'aria-label': 'dispersión', onchange: (e) => { g.dispersion = Number(e.target.value); g.preview = null; rerender(); } }, Object.entries(gen.dispersions).map(([k, v]) => h('option', { value: v, selected: g.dispersion === v }, `${DISPERSION_NAMES[k] ?? k} (${v})`)));
  const ctl = h('div', { class: 'row' },
    h('label', {}, 'Identidad base ', h('select', { id: 'gen-base', onchange: (e) => { g.base = e.target.value; g.preview = null; rerender(); } }, REFERENCE_IDS.map((id) => h('option', { value: id, selected: g.base === id }, `${id} — ${prof.population.teams[id].identity}`)))),
    h('label', {}, 'Semilla de generación ', h('input', { id: 'gen-seed', type: 'number', class: 'wide', min: 0, max: 4294967295, step: 1, value: g.seed, onchange: (e) => { const v = Number(e.target.value); if (Number.isInteger(v) && v >= 0 && v <= 4294967295) { g.seed = v; g.preview = null; } else e.target.value = g.seed; rerender(); } })),
    h('label', {}, 'Dispersión ', dispSel), h('label', {}, 'Etiqueta opcional ', h('input', { id: 'gen-label', type: 'text', value: g.label, maxlength: 80, onchange: (e) => { g.label = e.target.value; } })));
  const actions = h('div', { class: 'row' },
    h('button', { class: 'btn', type: 'button', id: 'gen-preview', onclick: run }, 'Previsualizar'),
    h('button', { class: 'btn secondary', type: 'button', id: 'gen-other', onclick: () => { g.seed += 1; run(); } }, 'Volver a generar con otra semilla (+1)'),
    h('button', { class: 'btn secondary', type: 'button', id: 'gen-check', disabled: !pv, onclick: () => { const again = generateTeam(prof, store.players, { base: g.base, seed: g.seed, dispersion: g.dispersion, label: g.label }); g.check = again.source.fingerprint === pv.team.source.fingerprint ? `Misma configuración → huella idéntica ${again.source.fingerprint}.` : `DIFERENTE: ${again.source.fingerprint} ≠ ${pv.team.source.fingerprint}`; rerender(); } }, 'Comprobar reproducción'),
    h('button', { class: 'btn secondary', type: 'button', id: 'gen-save', disabled: !pv || pv.errors.length > 0, onclick: () => { const r = store.pop.saveGenerated(pv.team); ui.msg = r.ok ? (r.existing ? `${pv.team.id} ya estaba guardado con los mismos valores.` : `Guardado ${pv.team.id}: fichas y plan materializados con su procedencia.`) : `No se guardó: ${r.error}`; rerender(); } }, 'Guardar como equipo generado'),
    [0, 1].map((slot) => h('button', { class: 'btn', type: 'button', id: `gen-use-${slot ? 'b' : 'a'}`, disabled: !pv || pv.errors.length > 0, onclick: () => { const cur = store.edit.teams[slot]; if (slotDirty(cur) && !confirm('El equipo del puesto tiene ediciones sin guardar. ¿Sustituirlo?')) return; const r = assignTeam(slot, pv.team); ui.msg = `${r.inst.id} colocado como equipo ${slot ? 'B' : 'A'}.${r.removed.length ? ` Referencias retiradas: ${r.removed.join('; ')}.` : ''}`; ui.team = slot; rerender(); } }, `Usar como ${slot ? 'B' : 'A'}`)));
  const pvTable = pv ? h('div', { class: 'scroll' }, table(['Jugador', 'Posiciones', 'Edad (Δ)', 'Altura Δ cm', 'Peso Δ kg', 'Máx |Δ| capacidad', 'Δ medio', 'Mayor desplazamiento'], pv.team.players.map((p, i) => { const c = pv.centers[i]; const top = [...c.deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    return [`${p.id.split('-')[1]} ← ${c.center}`, p.positions.join('|'), `${p.age} (${c.ageDelta >= 0 ? '+' : ''}${c.ageDelta})`, fmt(c.heightDelta, 1), fmt(c.weightDelta, 1), fmt(c.maxAbs, 2), fmt(c.mean, 2), `${labelOf(top.attr)}: ${fmt(top.before, 1)} → ${fmt(top.after, 2)}`]; }), { numeric: [3, 4, 5, 6] })) : null;
  return h('div', { class: 'card', id: 'generator' }, h('h3', { style: 'margin-top:0' }, 'Generador de equipos ficticios correlacionados'),
    h('p', { class: 'small muted' }, `Receta ${recipeSummary(prof)}${popFromActive() ? '' : ' (de la base de MOTOR-11; el perfil activo es anterior)'}. Toma los doce perfiles de la identidad base como centros y los perturba con factores compartidos de equipo e individuales más un residuo; no genera Forma ni momentos extremos, no es una fuerza de equipo y no está calibrado. La semilla de generación es independiente de la semilla deportiva del partido y no consume su azar. Identificador previsto: ${generatedId(g.base, g.seed, g.dispersion)}.`),
    ctl, actions, g.check ? h('p', { class: `pill ${g.check.startsWith('DIFERENTE') ? 'bad' : 'ok'}`, id: 'gen-check-msg' }, g.check) : null,
    pv ? h('div', {}, h('p', { class: 'small' }, `Vista previa de ${pv.team.id} — huella ${pv.team.source.fingerprint} · ${pv.errors.length ? `${pv.errors.length} errores de validación` : 'valida'}. Las diferencias son respecto a los centros de ${g.base}; no se proclama un equipo equilibrado ni calibrado. Nada está guardado hasta pulsar «Guardar».`), pv.errors.length ? h('ul', {}, pv.errors.slice(0, 6).map((e) => h('li', {}, `${e.path}: ${e.message}`))) : null, pvTable) : h('p', { class: 'small muted' }, 'La generación no se ejecuta sola al dibujar la pantalla: pulsa «Previsualizar».'));
}

export const defaultGen = () => ({ base: 'EQ04', seed: 20261017, dispersion: 1, label: '', preview: null, check: null });
void fpOf; void persist;
