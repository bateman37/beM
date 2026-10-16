// Escenarios de contraste de MOTOR-07 (§11.1): COPIAS identificadas de la entrada actual con cambios listados sobre jugadores existentes de EQ01/EQ02.
// Ninguna copia crea otros equipos, cambia la población ni sobrescribe la entrada editada de Dennis: devuelve una entrada NUEVA y la lista exacta de cambios.
// Sin DOM ni sistema de ficheros: la usan el laboratorio y las pruebas. Son escenarios para OBSERVAR mecanismos, no pruebas de causalidad por marcador.
import { deepCopy } from './data.js';

const clampTo = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
const TEC = ['TEC01', 'TEC02', 'TEC03', 'TEC04', 'TEC05', 'TEC06', 'TEC07', 'TEC08'];
const FIS_MOV = ['FIS01', 'FIS02', 'FIS03', 'FIS04', 'FIS05'];
const starters = (team) => Object.values(team.plan.starters);

// Utilidad: aplica un cambio y lo registra (antes/después), respetando la escala de la capacidad.
function editor(input, bounds) {
  const changes = []; const byId = Object.fromEntries(input.teams.flatMap((t) => t.players.map((p) => [p.id, p])));
  return {
    changes,
    ability(id, attr, delta) { const p = byId[id]; const before = p.abilities[attr]; const after = clampTo(before + delta, bounds); p.abilities[attr] = after; changes.push({ jugador: id, campo: `capacidad ${attr}`, antes: before, despues: after }); },
    abilitySet(id, attr, value) { const p = byId[id]; const before = p.abilities[attr]; p.abilities[attr] = clampTo(value, bounds); changes.push({ jugador: id, campo: `capacidad ${attr}`, antes: before, despues: p.abilities[attr] }); },
    state(id, key, value) { const p = byId[id]; const before = p.state[key]; p.state[key] = value; changes.push({ jugador: id, campo: `estado ${key}`, antes: before, despues: value }); },
    field(id, key, value) { const p = byId[id]; const before = p[key]; p[key] = value; changes.push({ jugador: id, campo: key, antes: before, despues: value }); },
    team(idx, key, value) { const t = input.teams[idx]; const before = t.plan[key]; t.plan[key] = value; changes.push({ equipo: t.id, campo: `plan.${key}`, antes: before, despues: value }); },
    top(key, value) { const before = input[key]; input[key] = value; changes.push({ campo: key, antes: before, despues: value }); },
  };
}

export const CONTRAST_SCENARIOS = [
  { id: 'C00', name: 'Base neutral declarada', summary: 'Sin cambios: Forma, momentos y T iniciales en 0 e importancia ordinaria, explícitos en la entrada.',
    apply: () => {} },
  { id: 'C01', name: 'Forma positiva / negativa', summary: 'Titulares de EQ01 en buena Forma (+0,6) y de EQ02 en mala Forma (−0,6). La Forma no cambia durante el partido.',
    apply(ed, input) { starters(input.teams[0]).forEach((id) => ed.state(id, 'form', 0.6)); starters(input.teams[1]).forEach((id) => ed.state(id, 'form', -0.6)); } },
  { id: 'C02', name: 'Referente fatigado y recambio', summary: 'El director principal de EQ01 empieza con energía 30 (el recambio, 100); el de EQ02, con energía 10. La rotación no cambia: el referente fatigado sigue siendo valorable por su utilidad real.',
    apply(ed, input) { ed.state(input.teams[0].plan.directorPriority[0], 'energy', 30); ed.state(input.teams[0].plan.directorPriority[1], 'energy', 100); ed.state(input.teams[1].plan.directorPriority[0], 'energy', 10); } },
  { id: 'C03', name: 'Veterano técnico / joven atlético', summary: 'En EQ01, un titular exterior de 38 años con más técnica y lectura y menos físicas; en EQ02, uno de 21 con más físicas y peor lectura. La edad por sí sola no cambia nada: solo cuentan las capacidades editadas.',
    apply(ed, input) {
      const vet = input.teams[0].plan.starters.SG; const yng = input.teams[1].plan.starters.SG;
      ed.field(vet, 'age', 38); for (const a of TEC) ed.ability(vet, a, 4); for (const a of FIS_MOV) ed.ability(vet, a, -5); for (const a of ['MEN02', 'MEN03', 'MEN04']) ed.ability(vet, a, 3);
      ed.field(yng, 'age', 21); for (const a of FIS_MOV) ed.ability(yng, a, 5); for (const a of ['MEN02', 'MEN03']) ed.ability(yng, a, -4);
    } },
  { id: 'C04', name: 'Consistencia alta / baja', summary: 'Titulares de EQ01 con Consistencia alta (MEN06 = 26) y de EQ02 con Consistencia baja (MEN06 = 6). Cambia la amplitud de los altibajos, no el nivel medio.',
    apply(ed, input) { starters(input.teams[0]).forEach((id) => ed.abilitySet(id, 'MEN06', 26)); starters(input.teams[1]).forEach((id) => ed.abilitySet(id, 'MEN06', 6)); } },
  { id: 'C05', name: 'Momentos y T iniciales, importancia decisiva', summary: 'Tirador y alero titulares de EQ01 con M-TIR +0,5; el pívot de EQ02 con M-DEF −0,5; T de EQ01 +0,4 y de EQ02 −0,4; encuentro decisivo. Estados de entrada controlados, no instrucciones del entrenador.',
    apply(ed, input) {
      const a = input.teams[0].plan.starters; const b = input.teams[1].plan.starters;
      ed.state(a.SG, 'M_TIR', 0.5); ed.state(a.SF, 'M_TIR', 0.5); ed.state(b.C, 'M_DEF', -0.5);
      ed.team(0, 'initialTeamMoment', 0.4); ed.team(1, 'initialTeamMoment', -0.4); ed.top('importance', 'decisive');
    } },
  { id: 'C06', name: 'Forma y energía combinadas', summary: 'Forma +0,5 y energía 70 en los titulares de EQ01; Forma −0,5 y energía 100 en los de EQ02 (recorrido integrado: sirve para revisar estado por tarea en contexto, no para atribuir causas).',
    apply(ed, input) { starters(input.teams[0]).forEach((id) => { ed.state(id, 'form', 0.5); ed.state(id, 'energy', 70); }); starters(input.teams[1]).forEach((id) => ed.state(id, 'form', -0.5)); } },
];
export const CONTRAST_BY_ID = Object.fromEntries(CONTRAST_SCENARIOS.map((s) => [s.id, s]));

// Devuelve { input, changes, scenario }: una COPIA de la entrada con los cambios listados (la original no se toca).
export function buildContrastScenario(id, source, profile) {
  const sc = CONTRAST_BY_ID[id]; if (!sc) throw new Error(`escenario de contraste desconocido: ${id}`);
  const input = deepCopy(source); const ed = editor(input, profile.abilityBounds);
  sc.apply(ed, input);
  input.contrast = { id: sc.id, name: sc.name }; // la copia se identifica en su entrada congelada
  return { input, changes: ed.changes, scenario: { id: sc.id, name: sc.name, summary: sc.summary } };
}
