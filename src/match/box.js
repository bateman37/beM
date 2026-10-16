// Acta básica proyectada exclusivamente desde los hechos (event.stats y duraciones). Sin contadores paralelos.
// Las métricas no implementadas (asistencias, +/-, etc.) se omiten; no se presentan como ceros observados.

export const BOX_PENDING = [
  'Asistencias', 'Créditos de equipo distintos de la pérdida de reloj de posesión', 'Coordenadas y mapa de tiros',
  'Estadísticas avanzadas', 'Más/menos', 'Atribución exhaustiva del acta (MOTOR-09)',
];

const zeroLine = () => ({ min: 0, pts: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, oreb: 0, dreb: 0, tov: 0, pf: 0, stl: 0, blk: 0 });

export function projectBox(events, lineupTable, input) {
  const lineBy = Object.fromEntries(lineupTable.map((l) => [l.id, Object.values(l.slots)]));
  const players = {};
  const teamIdOf = {};
  input.teams.forEach((t, ti) => t.players.forEach((p) => { players[p.id] = { team: ti, ...zeroLine() }; teamIdOf[p.id] = ti; }));
  const teams = input.teams.map(() => ({ points: 0, teamTov: 0 }));
  const periods = {};
  const addPeriod = (period, team, pts) => { (periods[period] ??= [0, 0])[team] += pts; };
  for (const ev of events) {
    if (ev.durationTenths > 0) for (const lid of ev.lineups) for (const pid of lineBy[lid]) players[pid].min += ev.durationTenths;
    for (const f of ev.stats) {
      switch (f.k) {
        case 'shot': {
          const pl = players[f.p]; const three = f.zone === 'three';
          if (three) { pl.fg3a += 1; if (f.made) pl.fg3m += 1; } else { pl.fg2a += 1; if (f.made) pl.fg2m += 1; }
          if (f.made) { pl.pts += f.points; teams[f.team].points += f.points; addPeriod(ev.period, f.team, f.points); }
          break;
        }
        case 'ft': { const pl = players[f.p]; pl.fta += 1; if (f.made) { pl.ftm += 1; pl.pts += 1; teams[f.team].points += 1; addPeriod(ev.period, f.team, 1); } break; }
        case 'reb': if (f.off) players[f.p].oreb += 1; else players[f.p].dreb += 1; break;
        case 'tov': if (f.p) players[f.p].tov += 1; else teams[f.team].teamTov += 1; break;
        case 'stl': players[f.p].stl += 1; break;
        case 'blk': players[f.p].blk += 1; break;
        case 'foul': players[f.p].pf += 1; break;
        default: throw new Error(`hecho de acta desconocido ${f.k}`);
      }
    }
  }
  for (const id of Object.keys(players)) players[id].min = players[id].min / 600; // décimas -> minutos
  return { players, teams, periods: Object.entries(periods).map(([period, points]) => ({ period: Number(period), points })), pending: BOX_PENDING };
}

export function teamTotals(box, input, teamIdx) {
  const t = zeroLine(); delete t.min;
  for (const p of input.teams[teamIdx].players) for (const k of Object.keys(t)) t[k] += box.players[p.id][k];
  return { ...t, min: input.teams[teamIdx].players.reduce((s, p) => s + box.players[p.id].min, 0), teamTov: box.teams[teamIdx].teamTov };
}
