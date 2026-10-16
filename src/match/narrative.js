// Relato en español derivado de los hechos de cada acontecimiento. No decide nada ni consume azar.
const ZONA = { rim: 'a canasta', inside: 'tiro corto', midrange: 'media distancia', three: 'triple', freeThrow: 'tiro libre' };
const CALIDAD = { comfortable: 'cómoda', normal: 'normal', forced: 'forzada' };

export function clockText(tenths) {
  const s = Math.max(0, tenths) / 10; const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}

export function describeEvent(ev, { name, teamName }) {
  const n = (id) => (id ? name(id) : '—');
  const e = ev.effects ?? {}; const i = ev.intent ?? {}; const p = ev.participants ?? {};
  const origin = i.origen ? ` (${i.origen}${i.continuacion ? `, ${[].concat(i.continuacion).join('+')}` : ''})` : '';
  switch (ev.type) {
    case 'tipoff': return `Salto inicial: gana ${e.gana}. La flecha apunta a ${e.flechaApunta === 0 ? 'el primer equipo' : 'el segundo equipo'}.`;
    case 'period_start': return `Comienza el periodo ${ev.period}. Saca ${teamName(ev.team)} (${i.origen}).`;
    case 'period_end': return `Final del periodo ${ev.period}. Marcador ${e.marcador?.join('–')}.`;
    case 'interval': return `Intervalo (${i.origen}); recuperación +${e.recuperacion} de energía.`;
    case 'inbound': return e && i.relojEnMarcha ? `Saque con reloj en marcha para ${teamName(ev.team)}.` : `Saque de ${teamName(ev.team)} con reloj parado.`;
    case 'advance': return `${teamName(ev.team)} avanza el balón a pista de ataque.`;
    case 'reorganization': return `${teamName(ev.team)} reorganiza (${i.motivo}).`;
    case 'timeout': return `Tiempo muerto de ${teamName(ev.team)} (${e.ventana}). Le quedan ${e.restantesBloque} en este bloque; todos los jugadores disponibles recuperan +${e.recuperacionEnergia} de energía.`;
    case 'substitution': return `Cambio en ${teamName(ev.team)}: entra ${n(p.entra)}, sale ${n(p.sale)} (${i.motivo}).`;
    case 'foul': return `Falta de ${n(p.infractor)} sobre ${n(p.sobre)} (${e.causaTirosLibres}). Faltas: ${e.faltasPersonales}${e.excluido ? ', excluido' : ''}.`;
    case 'free_throw': return `Tiro libre ${i.serie} de ${n(p.lanzador)}: ${e.entra ? 'anotado' : 'fallado'}.`;
    case 'rebound': return `Rebote ${e.ofensivo ? 'ofensivo' : 'defensivo'} de ${n(p.captor)}.`;
    case 'loose_ball': return `Balón suelto: ${e.control === 'ataque' ? 'conserva el ataque' : `recupera ${n(e.recupera)}`}.`;
    case 'expiry': return `${i.motivo}${i.pendiente ? ` (se iba a producir: ${i.pendiente})` : ''}.`;
    case 'attempt': {
      const cat = i.categoria;
      const who = n(p.actor);
      const calidad = i.calidad ? `, oportunidad ${CALIDAD[i.calidad]}` : '';
      if (cat === 'fieldShot' || cat === 'shootingFoul') {
        const pas = p.pasador && p.pasador !== p.actor ? `${n(p.pasador)} habilita a ${who}. ` : '';
        const ayuda = p.ayudante ? ` Ayuda de ${n(p.ayudante)}${p.ventanaLibre ? ', deja libre al receptor' : ''}.` : '';
        if (e.tapon) return `${pas}${who} lanza (${ZONA[e.zona]}) y es taponado por ${n(ev.stats.find((s) => s.k === 'blk')?.p)}${origin}. ${e.destino}.${ayuda}`;
        const res = e.entra ? 'anota' : 'falla';
        const falta = e.falta ? ` con falta de ${n(e.falta.de)} (${e.falta.canastaValida ? 'canasta válida y 1 libre' : `${e.falta.tirosLibres} libres`})` : '';
        return `${pas}${who} ${res} ${ZONA[e.zona]}${falta}${origin}${calidad}.${ayuda}`;
      }
      if (cat === 'turnover') return `Pérdida de ${n(ev.stats[0]?.p)} (${ev.stats[0]?.cause})${origin}${e.robo ? `; roba ${n(e.robo)}` : e.fuera ? '; el balón sale fuera' : '; recupera la defensa sin robo'}.`;
      if (cat === 'offensiveFoul') return `Falta ofensiva de ${n(e.faltaOfensiva)} (${e.contacto})${origin}.`;
      if (cat === 'defensiveNonShootingFoul') return `Contacto: falta de ${n(e.faltaDefensiva)} sobre ${who}${origin}.`;
      if (cat === 'ballViolation') return `Infracción de balón de ${who}${origin}.`;
      if (cat === 'looseBall') return `Balón suelto tras la acción de ${who}${origin}.`;
      return `${cat}`;
    }
    default: return ev.type;
  }
}
