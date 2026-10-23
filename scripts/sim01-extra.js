// Utilidad de cierre: resume en consola las pasadas oficiales y adicionales de la medición (sin simular). Uso: node scripts/sim01-extra.js
import { readFileSync, readdirSync } from 'node:fs';
const d = 'out/sim-motor01/bench'; for (const f of readdirSync(d).filter((x) => x.endsWith('.json')).sort()) { const j = JSON.parse(readFileSync(`${d}/${f}`, 'utf8')); console.log(f.padEnd(18), `${j.run} ${j.workers}w objetivo ${j.objective.measuredMs.toFixed(0)} ms ${j.objective.met ? 'ok' : 'no'} válidos ${j.counts.valid} rss ${j.memory.maxRssMiB.toFixed(0)} MiB`); }
