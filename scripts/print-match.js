// Imprime el acta y el relato de un partido de referencia. Uso: node scripts/print-match.js [semilla] [--story N]
import { loadData } from './node-data.js';
import { buildMatchInput, runMatch, teamTotals } from '../src/match/index.js';
import { describeEvent, clockText } from '../src/match/narrative.js';

const args = process.argv.slice(2);
const seed = Number(args.find((a) => /^\d+$/.test(a)) ?? 20261016);
const { profile, players } = loadData();
const res = runMatch(buildMatchInput(profile, players, { seed }), profile, { detail: 'full' });
const names = Object.fromEntries(res.input.teams.flatMap((t) => t.players.map((p) => [p.id, p.name.replace('Jugador ', '')])));
const tn = (i) => res.teams[i].id;
console.log(`Semilla ${seed}: ${res.score.join('-')} (${res.status})`);
for (let t = 0; t < 2; t++) {
  console.log(`\n${res.teams[t].name}`);
  for (const p of res.input.teams[t].players) {
    const b = res.box.players[p.id];
    console.log(`${p.id.padEnd(9)} MIN ${b.min.toFixed(1).padStart(5)} PTS ${String(b.pts).padStart(2)} T2 ${b.fg2m}/${b.fg2a} T3 ${b.fg3m}/${b.fg3a} TL ${b.ftm}/${b.fta} RO ${b.oreb} RD ${b.dreb} PER ${b.tov} FAL ${b.pf} ROB ${b.stl} TAP ${b.blk}  E=${res.diagnostics.finalEnergy[p.id]}`);
  }
}
const lim = Number(args[args.indexOf('--story') + 1] ?? 0);
if (lim) {
  for (const ev of res.events.slice(0, lim)) {
    console.log(`${ev.id} P${ev.period} ${clockText(ev.clock.before)}→${clockText(ev.clock.after)} sc${(ev.shotClock.after / 10).toFixed(1)} [${ev.possessionId ?? '-'}] ${describeEvent(ev, { name: (id) => names[id] ?? id, teamName: tn })}`);
  }
}
