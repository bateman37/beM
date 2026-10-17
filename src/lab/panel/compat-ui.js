// Compatibilidad del perfil consultado y recuperación explícita (MOTOR-15 §4). Nunca convierte ni activa en silencio.
import { h, table } from '../dom.js';
import { ps, repaint, toast } from './common.js';

const go = (tab) => { ps.tab = tab; repaint(); };

// Tarjeta común: identidad, módulos (no compatible ≠ valor cero) y las dos salidas explícitas.
export function compatCard(c) {
  const a = c.assessment; const L = c.L; const v = c.consult; const base = c.base;
  if (a.ready && !c.degraded) return null;
  const isBase = v.id === base.id;
  const upgrade = () => {
    const r = L.upgradeCandidate(v.id);
    if (r.ok) { ps.editing = r.draft.id; ps.tab = 'perfiles'; toast(`Candidata ${r.draft.id} creada desde la base actual; el original ${v.id} no se ha tocado`); } else toast(r.error, 'bad');
    repaint();
  };
  const activateBase = () => {
    if (!confirm(`¿Activar la base actual ${base.id} para los PRÓXIMOS encuentros? ${v.id} y todas sus versiones se conservan; los partidos ya iniciados no cambian.`)) return;
    const r = L.activate(base.id, `activar la base actual desde ${v.id} (perfil anterior)`);
    if (r.ok) { ps.consult = null; toast(`Activada ${base.id}`); } else toast(r.error ?? 'No se pudo activar', 'bad');
    window.dispatchEvent(new Event('beM:repaint')); repaint();
  };
  return h('div', { class: c.degraded || a.lackingToPlay.length ? 'errbox' : 'card', id: 'compat-card' },
    h('strong', { class: 'err' }, c.degraded ? `No se pudo leer el perfil ${v.id} con la versión actual. ` : a.lackingToPlay.length ? `El perfil ${v.id} es anterior al motor actual. ` : `El perfil ${v.id} está incompleto para el motor actual. `),
    h('span', {}, `Estado: ${a.summary}. Conserva su identidad y no se migra en silencio.`),
    h('div', { class: 'small', style: 'margin:6px 0' }, `Identidad: ${v.id} «${v.label}» · ${a.identity.effectiveId ?? 'sin identidad efectiva'} · huella ${v.hash.slice(0, 12)} · extensiones: ${a.identity.extensions.join(', ') || 'ninguna'}.`),
    c.degraded ? h('details', {}, h('summary', {}, 'Detalle técnico del fallo (para diagnóstico)'), h('pre', {}, `${c.degraded.message}\n${c.degraded.stack.split('\n').slice(0, 6).join('\n')}`)) : null,
    table(['Módulo', 'Introducido en', 'Estado en este perfil', 'Necesario para jugar'], a.modules.map((m) => [m.label, m.ext, m.present ? 'presente' : 'no compatible (no existe en esta versión; no equivale a cero)', m.requiredToPlay ? 'sí' : 'no (valor por defecto declarado)'])),
    h('p', { class: 'small muted' }, `Filas requeridas ausentes: ${a.missingRequiredRows}. Las vistas de catálogo, perfiles e intercambio siguen disponibles; la consulta fila a fila refleja solo lo que este perfil contiene.`),
    isBase ? null : h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', id: 'legacy-upgrade', onclick: upgrade }, `Crear candidata compatible desde la base actual (${base.id})`), ' ',
      h('button', { class: 'btn secondary', type: 'button', id: 'legacy-activate', onclick: activateBase }, `Activar la base actual (${base.id})`), ' ',
      h('button', { class: 'btn secondary', type: 'button', id: 'compat-consult-base', onclick: () => { ps.consult = base.id; repaint(); } }, 'Consultar la base actual'), ' ',
      h('button', { class: 'btn secondary', type: 'button', onclick: () => go('perfiles') }, 'Perfiles e historial')),
    h('p', { class: 'small muted' }, 'La candidata es un borrador sobre la base actual con los valores que este perfil había cambiado (las filas sustituidas por extensiones posteriores no se trasladan); hay que validarla y publicarla. La activación es una decisión explícita.'));
}
