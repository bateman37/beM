// Genera data/batch/matriz-consultas-motor15.json y docs/tecnico/motor15-c-matriz-consultas.md (MOTOR-15 §11.4): consulta → dato → nivel de registro.
// Los datos viven aquí (una sola fuente); el documento se deriva. Uso: node scripts/build-query-matrix.js
import { writeFileSync } from 'node:fs';
import { ROOT } from './node-data.js';
import { join } from 'node:path';

const D = 'diagnostic'; const R = 'reduced'; const E = 'world-essential';
const rows = [
  ['Q01', 'Identidad, versiones, estado y resultado de cancha frente a adjudicado', 'identity + result (court_score, administrative)', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'result, identity'],
  ['Q02', 'Parciales y duración', 'result.period_scores, game_tenths', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'result'],
  ['Q03', 'Acta individual (minutos, tiros, puntos, créditos, faltas, DNP)', 'acta.players', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'acta.players'],
  ['Q04', 'Acta colectiva (totales, colectivos, faltas por periodo, tiempos muertos)', 'acta.teams', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'acta.teams'],
  ['Q05', 'Series de libres y finalizaciones F', 'acta.series, acta.finals', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'acta.series, acta.finals'],
  ['Q06', 'Créditos y trazabilidad de asistencias y rebotes', 'acta.credits', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'acta.credits'],
  ['Q07', 'Posesiones beM (origen, cierre, puntos) y partición de puntos', 'acta.possessions, acta.partition', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'acta.possessions'],
  ['Q08', 'Secuencia de hechos (orden estable, referencias, créditos)', 'sequence', { [D]: 'sí (hechos completos)', [R]: 'sí (hechos completos)', [E]: 'sí (filas compactas; sin intent/effects/params)' }, 'sequence.columns/rows'],
  ['Q09', 'Presencia: entradas/salidas, quintetos, on-off, mixtas', 'presence.lineups, presence.intervals, sequence.lineup_*', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'presence'],
  ['Q10', 'Tiro: autor, sector funcional, valor, resultado/validez y causa', 'shots', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'shots'],
  ['Q11', 'Tiro: preparación/oposición en categorías (calidad, defensor, cobertura, organización efectiva)', 'shots.quality / defender / coverage / defense_org', { [D]: 'sí', [R]: 'sí', [E]: 'sí (categorías; sin probabilidades ni pesos)' }, 'shots'],
  ['Q12', 'Cruce jugador × defensa de tiro', 'shots.shooter × shots.defender', { [D]: 'sí', [R]: 'sí', [E]: 'sí (conservado por fila: los marginales por jugador y por defensa no bastarían y no se ofrecen como sustituto)' }, 'shots'],
  ['Q13', 'Táctica observada: familias ejecutadas, cobertura y organización efectivas por posesión', 'tactics', { [D]: 'sí', [R]: 'sí', [E]: 'sí' }, 'tactics'],
  ['Q14', 'Dirección: órdenes, comandos y delegación efectiva del entrenador', 'direction', { [D]: 'sí', [R]: 'sí', [E]: 'sí (órdenes y comandos; sin decisiones calculadas)' }, 'direction'],
  ['Q15', 'Estados propios por tramo (energía, Forma, momentos) autorizados', 'states', { [D]: 'sí', [R]: 'sí', [E]: 'sí (registro de cambios y episodios; los valores internos solo en diagnóstico)' }, 'states'],
  ['Q16', 'Integridad: huella de trayectoria, sorteos consumidos, pasos, cobertura observada', 'integrity', { [D]: 'sí (TRAY-MOTOR12-R1)', [R]: 'sí (TRAY-MOTOR12-R1)', [E]: 'sí (TRAYINC-MOTOR15-R1 incremental; `none` declarado si se desactiva)' }, 'integrity'],
  ['Q17', 'Conciliación del acta y conciliación analítica', 'validity', { [D]: 'sí', [R]: 'sí', [E]: 'sí (modo `full`; `acta` solo si se declara)' }, 'validity'],
  ['Q18', 'Sorteos con ordinal y propósito', 'sorteos.jsonl', { [D]: 'sí', [R]: 'sí', [E]: 'no (solo su cuenta y la huella)' }, '—'],
  ['Q19', 'Decisiones calculadas con capacidad base/efectiva y pesos', 'decisiones.jsonl', { [D]: 'sí', [R]: 'no', [E]: 'no' }, '—'],
  ['Q20', 'Contrafactuales y sensibilidad +1/+3/+5', 'decisiones.jsonl + capacidades-uso', { [D]: 'sí', [R]: 'no', [E]: 'no' }, '—'],
  ['Q21', 'Indicadores del catálogo MOTOR-10, ejecuciones y quintetos tabulados', 'tablas/*.csv', { [D]: 'sí', [R]: 'sí', [E]: 'no tabulados (recalculables desde Q03–Q15 con la capa de análisis sobre el resultado reproducido)' }, '—'],
  ['Q22', 'Relato / prosa', 'relato', { [D]: 'opcional', [R]: 'opcional', [E]: 'no' }, '—'],
  ['Q23', 'Paquete ZIP de análisis (MOTOR-12) y agregados del lote', 'paquetes/', { [D]: 'sí', [R]: 'sí', [E]: 'no: el nivel esencial no genera tablas; la extracción es el JSON esencial' }, '—'],
];
const doc = {
  schema: 'beM-query-matrix/1', version: 'MAT-MOTOR15-R1',
  levels: { [D]: 'Diagnóstico completo (detalle `full`)', [R]: 'Reducido (detalle `minimal`, sin decisiones calculadas)', [E]: 'Esencial para el mundo (detalle `minimal`, registro compacto)' },
  note: 'Los tres niveles usan el MISMO resolutor: trayectoria deportiva, sorteos, estados y acta idénticos para las mismas entradas y versión. Solo cambia lo que se conserva.',
  queries: rows.map(([id, query, data, availability, where]) => ({ id, query, data, availability, where_essential: where })),
};
writeFileSync(join(ROOT, 'data/batch/matriz-consultas-motor15.json'), `${JSON.stringify(doc, null, 1)}\n`);
const md = ['# Matriz consulta → dato → nivel de registro (MOTOR-15 §11.4)', '', `Versión \`${doc.version}\` · generada por \`node scripts/build-query-matrix.js\` desde \`data/batch/matriz-consultas-motor15.json\`.`, '', doc.note, '',
  '| ID | Consulta | Dato | Completo | Reducido | `world-essential` | Dónde (esencial) |', '|---|---|---|---|---|---|---|',
  ...rows.map(([id, q, d, a, w]) => `| ${id} | ${q} | \`${d}\` | ${a[D]} | ${a[R]} | ${a[E]} | ${w} |`), ''].join('\n');
writeFileSync(join(ROOT, 'docs/tecnico/motor15-c-matriz-consultas.md'), md);
console.log(`matriz: ${rows.length} consultas`);
