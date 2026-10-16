// Controles de saques de banda y fondo (MOTOR-06), compartidos por «Preparación» y por el panel de dirección en vivo:
// libro de banda y de fondo (tres fichas cada uno, prioridad 1–5 compartida), sacador preferido y alternativo, y respuesta defensiva
// de cada tipo de saque con su objetivo visible. Solo presentación: todo sale del perfil y ninguna etiqueta contiene coeficientes.
import { h } from './dom.js';

const ui = { open: new Set() };
const KINDS = ['band', 'endline'];
const APPROACH = { free: 'desmarque', screen: 'desmarque con pantalla del compañero (si no hay bloqueador compatible, desmarque)', cut: 'corte al aro' };

// Ficha legible de una ficha de saque: intención, funciones, primera opción, alternativa, seguridad, continuidad y límite.
export function throwInSheet(profile, id) {
  const rep = profile.throwInRepertoire; const p = rep.plays[id];
  const roleText = Object.entries(p.roles).map(([r, d]) => `${d.label ?? r}${d.opt ? ' (opcional)' : ''}`);
  const opt = (o) => `${p.roles[o.role]?.label ?? o.role} · ${APPROACH[o.approach]} · ${rep.continuations[o.cont]}`;
  return h('div', { class: 'sheet small' },
    h('p', {}, h('strong', {}, 'Intención: '), p.intent),
    h('p', {}, h('strong', {}, 'Funciones: '), `sacador (fuera del campo durante el saque y distinto de su receptor) · ${roleText.join(' · ')}`),
    h('p', {}, h('strong', {}, 'Primera opción: '), opt(p.first)),
    h('p', {}, h('strong', {}, 'Alternativa si se niega: '), opt(p.alternative)),
    h('p', {}, h('strong', {}, 'Seguridad: '), `compañero con balón seguro, si queda plazo (${rep.continuations[p.safety.cont]})`),
    h('p', {}, h('strong', {}, 'Límite: '), p.limit),
    h('p', {}, h('strong', {}, 'Se registra: '), p.record.join(' · ')),
    h('p', { class: 'muted' }, `Colocación de entrada interna compatible (${p.entryReferences.join(' / ')}): no añade disposiciones al selector general ni exige coordenadas. Plazo del sacador: ${profile.rules.throwInReleaseSeconds} s; ninguna ficha concede una recepción ni una canasta garantizadas.`));
}

export function responseSummary(profile, id) {
  const r = profile.throwInRepertoire.responses[id];
  return `${r.name}. Concede: ${r.concedes}.`;
}

// ops = { profile, players (propios), rivals, disabled, coverage (cobertura declarada por el equipo), idPrefix, refresh(),
//         getPriority(id), setPriority(id, v|null), getServer(kind, field), setServer(kind, field, v|null), getDef(field), setDef(field, v|null), label(id) }
export function throwInControls(ops) {
  const { profile, players, rivals, disabled } = ops; const rep = profile.throwInRepertoire; const cat = profile.activeCatalog;
  const label = ops.label ?? ((id) => id);
  const sel = (value, options, onChange, extra = {}) => h('select', { disabled, onchange: (e) => onChange(e.target.value), ...extra }, options.map(([v, t]) => h('option', { value: v ?? '', selected: (value ?? '') === (v ?? '') }, t)));
  const kindBlock = (kind) => {
    const plays = cat.throwInPlays.filter((id) => rep.plays[id].kind === kind);
    const resp = Object.entries(rep.responses).filter(([id, r]) => r.kind === kind && cat.throwInResponses.includes(id));
    const cur = ops.getDef(kind);
    const chosen = rep.responses[cur];
    const incompatible = chosen?.chaseOrSwitch && !['COB01', 'COB02'].includes(ops.coverage);
    return h('div', { class: 'card inner' }, h('h3', { style: 'margin-top:0' }, `Saque de ${rep.kinds[kind].label.toLowerCase()}`),
      h('div', { class: 'small muted' }, 'Libro ofensivo'),
      plays.map((id) => {
        const pr = ops.getPriority(id); const k = `${ops.idPrefix}:${id}`; const open = ui.open.has(k);
        return h('div', { class: 'playrow' },
          h('div', { class: 'row' },
            h('label', { style: 'width:330px' }, h('input', { type: 'checkbox', disabled, checked: pr != null, 'aria-label': `Activar ${id}`, onchange: (e) => { ops.setPriority(id, e.target.checked ? 3 : null); ops.refresh(); } }), ` ${id} — ${rep.plays[id].name}`),
            pr != null ? h('select', { disabled, 'aria-label': `Prioridad de ${id}`, onchange: (e) => { ops.setPriority(id, Number(e.target.value)); ops.refresh(); } }, [1, 2, 3, 4, 5].map((n) => h('option', { value: n, selected: pr === n }, `Prioridad ${n} (peso ${profile.throwIns.priorityWeights[n - 1]})`))) : h('span', { class: 'muted small' }, 'desactivada'),
            h('button', { class: 'link small', type: 'button', onclick: () => { open ? ui.open.delete(k) : ui.open.add(k); ops.refresh(); } }, open ? 'ocultar ficha' : 'ver ficha')),
          open ? throwInSheet(profile, id) : null);
      }),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Sacador'),
      h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Preferido'), sel(ops.getServer(kind, 'preferred'), [['', '— política funcional (receta de Pase y roles) —'], ...players.map((p) => [p.id, label(p.id)])], (v) => { ops.setServer(kind, 'preferred', v || null); ops.refresh(); })),
      h('label', { class: 'row' }, h('span', { style: 'width:200px' }, 'Alternativo'), sel(ops.getServer(kind, 'alternate'), [['', '— ninguno —'], ...players.filter((p) => p.id !== ops.getServer(kind, 'preferred')).map((p) => [p.id, label(p.id)])], (v) => { ops.setServer(kind, 'alternate', v || null); ops.refresh(); })),
      h('p', { class: 'small muted' }, 'Si el sacador no está en pista (cambio o exclusión) se revalida: alternativo y, si no, la política funcional. Un sacador no puede ser su propio receptor.'),
      h('div', { class: 'small muted' }, 'Respuesta defensiva cuando saca el rival (una sola, un encargo contextual: las seis no se suman)'),
      h('label', { class: 'row' }, sel(cur, resp.map(([id, r]) => [id, `${id} · ${r.name}`]), (v) => { ops.setDef(kind, v); ops.refresh(); })),
      h('p', { class: 'small' }, chosen ? responseSummary(profile, cur) : ''),
      incompatible ? h('p', { class: 'small err' }, `Incompatible con la cobertura declarada (${ops.coverage}): persecución o cambio exigen COB01 o COB02. No se podrá aplicar hasta cambiar la cobertura.`) : null);
  };
  const needsTarget = ops.getDef('endline') === 'DSaqF02';
  return h('div', {},
    h('h3', {}, 'Saques de banda y fondo'),
    h('p', { class: 'small muted' }, 'Libros de banda y de fondo separados del libro posicional (prioridad 1–5 compartida; sin cuotas ni calidad por prioridad). Un saque de centro u otro origen administrativo no es de banda ni de fondo. Las reanudaciones tras canasta pueden usar la entrada segura de fondo sin preparar un bloqueo complejo, pero no regalan una recepción ni ignoran la presión rival.'),
    KINDS.map(kindBlock),
    h('div', { class: 'card inner' }, h('strong', {}, 'Objetivo visible para «Negar objetivo principal desde fondo»'),
      h('label', { class: 'row' }, sel(ops.getDef('target'), [['', '— sin designar —'], ...rivals.map((p) => [p.id, p.id])], (v) => { ops.setDef('target', v || null); ops.refresh(); })),
      h('p', { class: 'small muted' }, needsTarget ? 'DSaqF02 necesita un rival designado; si sale de la pista se aplica la alternativa vigente (DSaqF01). La defensa responde al objetivo visible o designado, nunca al libro privado del rival.' : 'Solo lo usa DSaqF02.')));
}
