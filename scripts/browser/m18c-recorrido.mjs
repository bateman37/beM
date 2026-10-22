// Recorrido focalizado de Chromium de MOTOR-18C: (1) partido terminado de la copia correcta: ver propuesta, aplicar, repetición bloqueada y deshacer; (2) sustituir la copia manteniendo ese resultado y volver a Partido:
// aviso de copia distinta y aplicación bloqueada. Juega UN partido nuevo y lo reutiliza en ambos recorridos. Conserva los pasos y los errores reales de consola y red.
// Uso: node scripts/browser/m18c-recorrido.mjs [--out=out/motor18c/navegador] [--port=5198]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor18c/navegador'); const PORT = Number(arg('port', 5198)); mkdirSync(OUT, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm18c-ui-')); mkdirSync(join(scratch, 'batches'), { recursive: true });
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot: join(scratch, 'batches'), closureRoot: join(scratch, 'closure') }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok: !!ok, obs: String(obs).replace(/\s+/g, ' ').slice(0, 300) }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).replace(/\s+/g, ' ').slice(0, 160)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = []; const dialogs = [];
p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
p.on('dialog', async (d) => { dialogs.push(d.message().slice(0, 120)); await d.accept(); }); // «¿Sustituir la copia activa?» se acepta: es parte del recorrido
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(600); }; const text = async (sel = '#view') => p.locator(sel).innerText();
const LS = (re) => p.evaluate((src) => { const e = Object.entries(localStorage).find(([k]) => new RegExp(src).test(k)); return e ? e[1] : null; }, re.source);
const learn = async () => JSON.parse(await LS(/m18\.learning/));
const applied = (L, tid) => L.ledgers[tid].applications.filter((a) => a.status === 'aplicada').map((a) => a.source_id);
try {
  await p.goto(URL0); await p.waitForSelector('#tabs button');
  const ver = await text('#app-version'); step(1, URL0, 'arranque: cabecera con la aplicación MOTOR-18C y el motor/formato de 18B sin cambio', /MOTOR-18C.*0\.18\.1-MOTOR18B.*export\/10/.test(ver), ver);
  await tab('Plantillas'); await p.click('#learn-make'); await p.waitForSelector('#learn-msg'); const LA = await learn(); const copyA = LA.copy.id;
  step(2, 'Plantillas', 'crear la copia de aprendizaje A (identificada con secuencia de instancia)', /-I\d+$/.test(copyA), copyA);
  await tab('Partido'); await p.click('text=Simulado total').catch(() => {}); await p.click('#prepare'); await p.waitForSelector('#start', { timeout: 15000 }); await p.click('#start');
  await p.waitForFunction(() => /Finalizado/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 180000 }); await p.waitForSelector('#post-learning', { timeout: 20000 });
  step(3, 'Partido', 'partido terminado (el único partido nuevo del recorrido): aparece la tarjeta de aprendizaje de la copia A', /Aprendizaje propuesto/.test(await text('#post-learning')), `${await text('#state')} ${await text('#score')}`);
  // ---------------- recorrido 1: copia correcta
  const L0 = await learn(); step(4, 'Partido', 'abrir la tarjeta no aplica nada (registro vacío)', applied(L0, 'EQ01').length === 0 && applied(L0, 'EQ02').length === 0, 'sin aplicaciones');
  await p.click('#see-learning'); await p.waitForTimeout(300); const pl = await text('#post-learning'); step(4, 'Partido', '«Ver aprendizaje propuesto»: fuentes con la identidad completa de copia y encuentro (<copia>|M1|<equipo>)', pl.includes(`${copyA}|M1|EQ01`) && pl.includes(`${copyA}|M1|EQ02`), pl.slice(0, 220));
  await p.click('#apply-learning'); await p.waitForSelector('#pl-msg'); const am = await text('#pl-msg'); const L1 = await learn();
  step(5, 'Partido', 'aplicar a esta variante: una aplicación por equipo con fuente exacta, mensaje de éxito', /EQ01: aplicado \(APL-1\) · EQ02: aplicado \(APL-1\)/.test(am) && applied(L1, 'EQ01').join() === `${copyA}|M1|EQ01` && applied(L1, 'EQ02').join() === `${copyA}|M1|EQ02` && (await p.locator('#pl-msg.ok').count()) === 1, `${am} · ${applied(L1, 'EQ01')}`);
  step(5, 'Partido', 'repetir la aplicación queda bloqueado (botón deshabilitado) y el registro no crece', (await p.locator('#apply-learning').isDisabled()) && (await learn()).ledgers.EQ01.applications.length === 1, 'botón deshabilitado');
  await tab('Plantillas'); await p.click('#ls-undo'); await p.waitForTimeout(300); const um1 = await text('#ls-msg'); await p.click('#ls-undo'); await p.waitForTimeout(300); const um2 = await text('#ls-msg'); const L2 = await learn();
  step(6, 'Plantillas', 'deshacer dos veces (control existente): aplicaciones revertidas con rastro y estado restaurado', /Deshecho APL-/.test(um1) && /Deshecho APL-/.test(um2) && applied(L2, 'EQ01').length === 0 && applied(L2, 'EQ02').length === 0 && L2.ledgers.EQ01.applications.some((a) => a.status === 'revertida'), `${um1.slice(0, 60)} · ${um2.slice(0, 60)}`);
  await tab('Partido'); await p.waitForSelector('#apply-learning'); step(6, 'Partido', 'tras deshacer, la misma fuente vuelve a poder aplicarse (política vigente de reaplicación)', !(await p.locator('#apply-learning').isDisabled()), 'botón habilitado');
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.click('#download')]); const buf = readFileSync(await dl.path()); const j = JSON.parse(buf.toString('utf8'));
  step(6, 'Partido', 'descarga REAL del encuentro: la entrada congelada lleva la identidad <copia>|M1 (bytes y SHA-256 conservados)', j.input?.labMatchId === `${copyA}|M1` && j.schema === 'beM-match-export/10', `${dl.suggestedFilename()} ${buf.length} B sha ${createHash('sha256').update(buf).digest('hex').slice(0, 16)} · ${j.input?.labMatchId}`);
  // ---------------- recorrido 2: sustituir la copia manteniendo el resultado
  await tab('Plantillas'); await p.click('#learn-make'); await p.waitForTimeout(500); const LB = await learn(); const copyB = LB.copy.id;
  step(7, 'Plantillas', 'sustituir la copia (se confirma el aviso): la copia B tiene otra identidad pero los mismos equipos EQ01/EQ02', copyB !== copyA && dialogs.length >= 1 && LB.copy.input.teams.map((t) => t.id).join() === 'EQ01,EQ02', `${copyA} → ${copyB} · aviso: ${dialogs[dialogs.length - 1]}`);
  const snapB = JSON.stringify((await learn()).ledgers) + JSON.stringify((await learn()).states);
  await tab('Partido'); await p.waitForSelector('#post-learning'); await p.click('#post-learning summary'); await p.waitForTimeout(200); const foreign = await text('#post-learning'); const applyBtn = await p.locator('#apply-learning').count(); const seeBtn = await p.locator('#see-learning').count();
  step(8, 'Partido', 'el resultado de A se mantiene: aviso de copia distinta, sin «Aplicar» ni propuesta, con ambas identidades en el detalle', /pertenece a otra copia de aprendizaje\. No se puede aplicar a la copia activa/.test(foreign) && applyBtn === 0 && seeBtn === 0 && foreign.includes(copyA) && foreign.includes(copyB), foreign.slice(0, 260));
  const LB2 = await learn(); step(8, 'Partido', 'la copia B no cambia (registro y estados idénticos; sin aplicaciones)', JSON.stringify(LB2.ledgers) + JSON.stringify(LB2.states) === snapB && applied(LB2, 'EQ01').length === 0 && applied(LB2, 'EQ02').length === 0, 'sin cambios');
  await tab('Análisis'); await tab('Partido'); step(8, 'Partido', 'abrir el análisis y volver mantiene el aviso y no aplica nada', (await p.locator('#pl-foreign').count()) === 1 && (await p.locator('#apply-learning').count()) === 0, 'aviso presente');
  await p.reload(); await p.waitForSelector('#tabs button'); step(9, 'Recarga', 'tras RECARGAR, la copia B y su identidad se restauran (el partido en memoria no persiste)', (await learn()).copy.id === copyB, (await learn()).copy.id);
} catch (e) { step(99, '—', 'excepción del recorrido', false, e.stack ?? e.message); }
writeFileSync(join(OUT, 'recorrido-navegador.json'), JSON.stringify({ app: 'MOTOR-18C', date: new Date().toISOString(), browser: 'Chromium (Playwright)', url: URL0, new_matches_played_in_walkthrough: 1, steps: log, dialogs, consoleErrors, netErrors, passed: log.filter((s) => s.ok).length, failed: log.filter((s) => !s.ok).length }, null, 1));
console.log(`\nPasos OK ${log.filter((s) => s.ok).length}/${log.length} · errores de consola ${consoleErrors.length} · errores de red ${netErrors.length}`);
await browser.close(); server.close(); process.exit(log.every((s) => s.ok) && !consoleErrors.length && !netErrors.length ? 0 : 1);
