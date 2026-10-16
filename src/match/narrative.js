// Relato en español derivado de los hechos de cada acontecimiento. No decide nada ni consume azar.
const ZONA = { rim: 'a canasta', inside: 'tiro corto', midrange: 'media distancia', three: 'triple', freeThrow: 'tiro libre' };
const CALIDAD = { comfortable: 'cómoda', normal: 'normal', forced: 'forzada' };

export function clockText(tenths) {
  const s = Math.max(0, tenths) / 10; const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}

// Explicación deportiva breve de lo que la defensa produjo (solo cuando importa; no se narran marcas ni cambios que el motor no resolvió).
function defenseNote(i, n) {
  const c = i.cobertura; const d = i.defensa; const out = [];
  if (c?.cambio) out.push(c.cambio.completa ? 'El cambio deja un emparejamiento distinto' : 'El cambio no se completa y el bloqueo es efectivo');
  if (c?.show) out.push(c.show.recupera ? 'El defensor sale y recupera' : 'El defensor sale y el continuador queda libre mientras recupera');
  if (c?.rotacion) out.push(c.rotacion.llega ? 'La trampa fuerza el pase pero la rotación llega' : 'La trampa fuerza un pase y deja recepción corta');
  if (c?.porDebajo && !c.porDebajo.recupera) out.push('Por debajo del bloqueo: tiro antes de recuperar');
  if (c?.limitada) out.push(`Cobertura no ejecutable: ${c.limitada}`);
  if (d?.ayuda) out.push(d.ayuda.relevo ? (d.ayuda.relevoLlega ? `La ayuda de ${n(d.ayuda.ayudante)} tiene relevo` : `La ayuda de ${n(d.ayuda.ayudante)} no encuentra relevo`) : `La ayuda de ${n(d.ayuda.ayudante)} libera la salida`);
  if (d?.especial?.estado === 'ejecutada') out.push(`Doble a ${n(d.especial.objetivo)}`);
  else if (d?.especial?.motivo) out.push(d.especial.motivo);
  if (d?.ayudaBloqueadaPorNoAbandonar) out.push('Ayuda no disponible por no abandonar');
  return out.length ? ` ${out.join('; ')}.` : '';
}

export function describeEvent(ev, { name, teamName }) {
  const n = (id) => (id ? name(id) : '—');
  const e = ev.effects ?? {}; const i = ev.intent ?? {}; const p = ev.participants ?? {};
  const decide = i.decidePor ? `; decide ${n(i.decidePor.jugador)} tras recibir` : '';
  const nega = i.negacionPrevia ? '; tras negarse la primera opción' : '';
  const origin = i.origen ? ` (${i.origen}${i.continuacion ? `, ${[].concat(i.continuacion).join('+')}` : ''}${decide}${nega})` : '';
  switch (ev.type) {
    case 'tipoff': return `Salto inicial: gana ${e.gana}. La flecha apunta a ${e.flechaApunta === 0 ? 'el primer equipo' : 'el segundo equipo'}.`;
    case 'period_start': return `Comienza el periodo ${ev.period}. Saca ${teamName(ev.team)} (${i.origen}).`;
    case 'period_end': return `Final del periodo ${ev.period}. Marcador ${e.marcador?.join('–')}.`;
    case 'interval': return `Intervalo (${i.origen}); recuperación +${e.recuperacion} de energía.`;
    case 'inbound': return e && i.relojEnMarcha ? `Saque con reloj en marcha para ${teamName(ev.team)}.` : `Saque de ${teamName(ev.team)} con reloj parado.`;
    case 'defense': return `${teamName(1 - ev.team)} defiende ahora en ${i.efectiva} ${i.nombreEfectiva}${i.alternativa ? ` (alternativa: ${i.motivo})` : i.objetivo ? ` (objetivo ${n(i.objetivo)})` : ''}.${!i.alternativa && i.motivo ? ` ${i.motivo}.` : ''}`;
    case 'advance': return i.altura ? `${teamName(ev.team)} avanza bajo presión ${{ three_quarters: 'a tres cuartos', full: 'a toda pista' }[i.altura] ?? i.altura}: ${{ controlledAdvance: 'controla el avance', delayedAdvance: `se demora ${i.demoraSegundos} s`, pressureBeaten: `supera la presión de ${n(i.presionador)}${i.retorno ? ` (${n(i.retorno.asume)} asume y ${n(i.retorno.recupera)} recupera)` : ''}`, turnover: `pierde el balón${e.robo ? `; roba ${n(e.robo)}` : ''}`, contact: `contacto de ${n(i.presionador)}` }[i.resultado] ?? i.resultado}.` : `${teamName(ev.team)} avanza el balón a pista de ataque.`;
    case 'reorganization': return i.disposicion ? `${teamName(ev.team)} se reorganiza a ${i.disposicion} (${i.motivo}).` : `${teamName(ev.team)} reorganiza (${i.motivo}).`;
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
      if (e.faltaTactica) return `Falta táctica de ${n(e.faltaDefensiva)} sobre ${n(e.sobre)}: ${e.tipo}${origin}.`;
      const calidad = i.calidad ? `, oportunidad ${CALIDAD[i.calidad]}` : '';
      if (cat === 'fieldShot' || cat === 'shootingFoul') {
        const pas = p.pasador && p.pasador !== p.actor ? `${n(p.pasador)} habilita a ${who}. ` : '';
        const ayuda = p.ayudante ? ` Ayuda de ${n(p.ayudante)}${p.ventanaLibre ? ', deja libre al receptor' : ''}.` : '';
        if (e.tapon) return `${pas}${who} lanza (${ZONA[e.zona]}) y es taponado por ${n(ev.stats.find((s) => s.k === 'blk')?.p)}${origin}. ${e.destino}.${ayuda}`;
        const res = e.entra ? 'anota' : 'falla';
        const falta = e.falta ? ` con falta de ${n(e.falta.de)} (${e.falta.canastaValida ? 'canasta válida y 1 libre' : `${e.falta.tirosLibres} libres`})` : '';
        return `${pas}${who} ${res} ${ZONA[e.zona]}${falta}${origin}${calidad}.${ayuda}${defenseNote(i, n)}`;
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
