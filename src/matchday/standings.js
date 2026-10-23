// Clasificación de la jornada: inicial, provisional (desde los marcadores PUBLICADOS) y final (solo encuentros terminados válidos). Convención de laboratorio, NO el reglamento ACB/FIBA completo:
// victorias, diferencia de puntos, puntos a favor y, solo para ordenar empates persistentes, identificador estable. Un empate en un marcador en curso es PENDIENTE: no se inventa victoria ni derrota
// (sus puntos a favor y en contra sí cuentan en la provisional). Una tabla inicial hipotética de una fixture se identifica como `artificial`, nunca como historial calculado.
export const TIEBREAK_CONVENTION = ['victorias', 'diferencia de puntos', 'puntos a favor', 'identificador estable (solo empates persistentes)'];
export const rowOf = (team) => ({ team, played: 0, w: 0, l: 0, pf: 0, pa: 0, pending: 0, live: 0 });

// `base`: { artificial, rows: [{ team, w, l, pf, pa }] } (tabla de partida); `progress`: paquetes publicados de los encuentros de la competición (`teams`, `score`, `finished`, `status`).
// mode: 'provisional' (cuenta los marcadores en curso) | 'final' (solo terminados válidos; `valid` por encuentro).
export function computeTable(base, progress, { mode = 'provisional' } = {}) {
  const rows = new Map(base.rows.map((r) => [r.team, { ...rowOf(r.team), played: (r.w ?? 0) + (r.l ?? 0), w: r.w ?? 0, l: r.l ?? 0, pf: r.pf ?? 0, pa: r.pa ?? 0 }]));
  for (const p of progress) {
    const [a, b] = p.teams; const [sa, sb] = p.score; const done = p.finished && p.valid !== false;
    if (mode === 'final' && !done) continue; if (mode === 'provisional' && !done && !(p.started ?? true)) continue; if (p.status === 'error') continue;
    const A = rows.get(a); const B = rows.get(b); if (!A || !B) continue;
    A.pf += sa; A.pa += sb; B.pf += sb; B.pa += sa;
    if (done) { A.played++; B.played++; if (sa > sb) { A.w++; B.l++; } else { B.w++; A.l++; } }
    else if (mode === 'provisional') { A.live++; B.live++; if (sa === sb) { A.pending++; B.pending++; } else if (sa > sb) { A.w++; B.l++; A.played++; B.played++; } else { B.w++; A.l++; A.played++; B.played++; } }
  }
  const sorted = [...rows.values()].map((r) => ({ ...r, diff: r.pf - r.pa })).sort((x, y) => y.w - x.w || y.diff - x.diff || y.pf - x.pf || (x.team < y.team ? -1 : x.team > y.team ? 1 : 0));
  sorted.forEach((r, i) => { r.rank = i + 1; });
  return { artificial: !!base.artificial, mode, convention: TIEBREAK_CONVENTION, rows: sorted };
}
export const rankOf = (table, team) => table.rows.find((r) => r.team === team)?.rank ?? null;

// Necesidad declarada de un entrenador desde la tabla provisional: si el objetivo de clasificación (`target`: puesto máximo aceptable) no se cumple con la información actual, necesita MEJORAR el resultado
// (requiredMargin = margen actual + 1: debe ir por delante). No añade ningún atributo: el contexto sale de la tabla publicada.
export function needFromTable(objective, table, margin) {
  const rank = rankOf(table, objective.team); if (rank == null) return null;
  const unmet = objective.kind === 'rank' ? rank > objective.target : false;
  return { kind: 'need', team: objective.teamIdx, requiredMargin: unmet ? margin + 1 : -1e9, source: `clasificación provisional: puesto ${rank} frente al objetivo ≤ ${objective.target}`, unmet, rank };
}
