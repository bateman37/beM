// Recorrido real de Chromium de MOTOR-18B (§14.2): modelo de Polivalencia efectivo, copia de aprendizaje, Preparación sobre la copia activa (R01), entrenar → RECARGAR → entrenar (R03), guardar al terminar un cuarto y
// continuar, aprendizaje solo desde el resultado completo (R04), identidad estable del encuentro, deshacer y descargas comprobadas por bytes. Conserva los pasos y los errores reales de consola y red.
// Uso: node scripts/browser/m18b-recorrido.mjs [--out=docs/tecnico/evidencia-motor18b/ui] [--port=5199]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'docs/tecnico/evidencia-motor18b/ui'); const PORT = Number(arg('port', 5199)); mkdirSync(OUT, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm18b-ui-')); mkdirSync(join(scratch, 'batches'), { recursive: true });
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot: join(scratch, 'batches'), closureRoot: join(scratch, 'closure') }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok: !!ok, obs: String(obs).replace(/\s+/g, ' ').slice(0, 300) }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).replace(/\s+/g, ' ').slice(0, 160)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = [];
p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(600); }; const text = async (sel = '#view') => p.locator(sel).innerText();
const download = async (click) => { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), click()]); const path = await d.path(); const buf = readFileSync(path); return { name: d.suggestedFilename(), bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex'), buf }; };
const LS = (re) => p.evaluate((src) => { const e = Object.entries(localStorage).find(([k]) => new RegExp(src).test(k)); return e ? e[1] : null; }, re.source);
const learn = async () => JSON.parse(await LS(/m18\.learning/)); const edit = async () => JSON.parse(await LS(/motor01\.edit/) ?? 'null');
let session2Source = null;
try {
  await p.goto(URL0); await p.waitForSelector('#tabs button');
  const ver = await text('#app-version'); step(1, URL0, 'arranque: cabecera con aplicación, motor y formato de MOTOR-18B', /MOTOR-18B.*0\.18\.1-MOTOR18B.*export\/10/.test(ver), ver);
  // 2. panel: modelo de Polivalencia efectivo
  await tab('Panel de ajustes'); await p.waitForSelector('#poly-card', { timeout: 15000 }); const poly = await text('#poly-card'); const old = await p.locator('#poly-old').count();
  step(2, 'Panel de ajustes › Inicio', 'modelo efectivo: curva por tramos (0,50 / 1,00 / 2,00) con comparación P8/P16/P24; sin aviso de modelo anterior', /curva lineal por tramos/.test(poly) && /0\.50|0,50/.test(poly) && /2\.00|2,00/.test(poly) && /Comparación con la misma dosis/.test(poly) && old === 0, poly.slice(0, 160));
  // 3. copia de aprendizaje
  await tab('Plantillas'); await p.click('#learn-make'); await p.waitForSelector('#learn-msg'); const msg = await text('#learn-msg');
  const L0 = await learn(); step(3, 'Plantillas', 'crear la copia de aprendizaje: identificada con secuencia de instancia', /Copia activa/.test(msg) && /-I\d+$/.test(L0.copy.id), `${msg.slice(0, 80)} · ${L0.copy.id}`);
  // 4. Preparación sobre la copia activa (R01)
  await tab('Preparación'); await p.waitForSelector('#prep-source'); const banner = await text('#prep-source'); step(4, 'Preparación', 'señala qué entrada se edita: la copia de aprendizaje, que recibirá el próximo partido', /COPIA DE APRENDIZAJE/.test(banner), banner);
  const disBefore = await p.locator('#dis-0').inputValue(); const target = disBefore === 'DIS03' ? 'DIS04' : 'DIS03'; await p.selectOption('#dis-0', target); await p.waitForTimeout(300);
  const roleSel = p.locator('div:has(> h3:has-text("Roles ofensivos")) select').first(); const roleBefore = await roleSel.inputValue(); const roleTarget = roleBefore === 'O12' ? 'O11' : 'O12'; await roleSel.selectOption(roleTarget); await p.waitForTimeout(300);
  const L1 = await learn(); const E1 = await edit(); const copyT0 = L1.copy.input.teams[0];
  step(4, 'Preparación', 'disposición y rol editados quedan en la COPIA (persistida con su registro)', copyT0.plan.disposition === target && copyT0.players[0].offensiveRole.code === roleTarget, `${disBefore}→${copyT0.plan.disposition} · ${roleBefore}→${copyT0.players[0].offensiveRole.code}`);
  const refUntouched = !E1 || (E1.teams[0].plan.disposition === disBefore && E1.teams[0].players[0].offensiveRole.code === roleBefore); step(4, 'Preparación', 'la entrada editada de referencia no cambia', refUntouched, E1 ? `${E1.teams[0].plan.disposition} · ${E1.teams[0].players[0].offensiveRole.code}` : 'sin copia local de la entrada editada (referencia intacta)');
  const fam = await text('#fam-quintet-0').catch(() => ''); step(4, 'Preparación', 'familiaridad del quinteto visible sin reinicializar el conocimiento', /Disposición|Familiaridad|copia/.test(fam), fam.slice(0, 100));
  const kBefore = JSON.stringify(copyT0.players.map((q) => q.knowledge));
  // 5. entrenar → recargar → entrenar (R03)
  const train = async () => { await tab('Plantillas'); await p.selectOption('#ls-team', 'EQ01'); await p.click('#learn-session button:has-text("Todos")'); await p.selectOption('#ls-collective', 'FAM:give_and_go'); await p.waitForTimeout(200); await p.fill('#ls-hours', '1'); await p.press('#ls-hours', 'Tab'); await p.waitForTimeout(200); await p.click('#ls-preview'); await p.waitForSelector('#ls-preview-out'); const t = await text('#ls-preview-out'); await p.click('#ls-apply'); await p.waitForTimeout(300); return { t, msg: await text('#ls-msg') }; };
  const t1 = await train(); const L2 = await learn(); const a1 = L2.ledgers.EQ01.applications.filter((a) => a.status === 'aplicada');
  step(5, 'Plantillas › sesión', 'primera sesión aplicada con recibo; la fuente incluye copia, equipo y S1; factor de Polivalencia visible', /Aplicado \(APL-1\)/.test(t1.msg) && /\|EQ01\|S1$/.test(a1[0].source_id) && /×jugador 1\.00/.test(t1.t), `${t1.msg} · ${a1[0].source_id}`);
  await p.reload(); await p.waitForSelector('#tabs button'); await p.waitForSelector('#learning-copy'); step(5, 'Plantillas', 'RECARGA real: la copia, su registro y la secuencia de sesión se restauran', /Copia activa: LEARN18/.test(await text('#learning-copy')), (await text('#learning-copy')).slice(0, 90));
  const t2 = await train(); const L3 = await learn(); const a2 = L3.ledgers.EQ01.applications.filter((a) => a.status === 'aplicada'); session2Source = a2[1]?.source_id;
  step(5, 'Plantillas › sesión', 'tras recargar, la sesión nueva recibe OTRA fuente (S2) y se aplica; sin colisión con S1', /Aplicado \(APL-3\)|Aplicado \(APL-2\)/.test(t2.msg) && a2.length === 2 && /\|S2$/.test(session2Source), `${t2.msg} · ${session2Source}`);
  const hours = L3.states.EQ01.players['EQ01-J01'].ledger.training.hours; step(5, 'Plantillas › sesión', 'el presupuesto del día se acumula tras la recarga (2 h de 4)', hours === 2, `horas acumuladas ${hours}`);
  const k2 = JSON.stringify(L3.copy.input.teams[0].players.map((q) => q.knowledge)); step(5, 'Plantillas', 'el conocimiento cambia solo por el aprendizaje aplicado (no por editar el plan)', kBefore !== k2, `cambió=${kBefore !== k2}`);
  // 6. partido por cuartos: guardar al terminar un cuarto, continuar y terminar
  await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.waitForSelector('#start', { timeout: 15000 }); await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
  await p.click('#next-period').catch(() => {}); await p.waitForTimeout(500); await p.waitForFunction(() => /Revisión|Pausa|Entre periodos/.test(document.querySelector('#state')?.innerText ?? '') || document.querySelector('#save-now') && !document.querySelector('#save-now').disabled, null, { timeout: 120000 }).catch(() => {});
  const partialCard = await p.locator('#post-learning').count(); step(6, 'Partido', 'con el encuentro SIN terminar no se propone aprendizaje aplicable', partialCard === 0, `tarjeta de aprendizaje presente=${partialCard}`);
  if (!(await p.locator('#save-now').isVisible())) await p.click('#saves summary'); await p.click('#save-now'); await p.waitForSelector('#saves-msg'); const sm = await text('#saves-msg'); step(6, 'Partido', 'guardar en la frontera de un cuarto', /Guardado/.test(sm), sm.slice(0, 100));
  await p.click('#saves-refresh'); await p.waitForTimeout(500); await p.click('#saves button:has-text("Continuar")'); await p.waitForTimeout(800); const cm = await text('#saves-msg'); step(6, 'Partido', 'continuar el guardado (rama de laboratorio) con su entrada congelada', /Continuando/.test(cm), cm.slice(0, 100));
  for (let i = 0; i < 6; i++) { if (/Finalizado/.test(await text('#state'))) break; await p.click('#next-period').catch(() => {}); await p.waitForTimeout(400); await p.waitForFunction(() => /Finalizado|Revisión|Pausa/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {}); }
  step(6, 'Partido', 'terminar el encuentro continuado', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')}`);
  // 7. aprendizaje desde el resultado completo; identidad estable; no aplica al reabrir
  await p.waitForSelector('#post-learning', { timeout: 20000 }); const reg0 = (await learn()).ledgers.EQ01.applications.length; await p.click('#see-learning'); await p.waitForTimeout(300); const pl = await text('#post-learning');
  step(7, 'Partido', '«Ver aprendizaje propuesto» desde el resultado completo (fuente con identidad de encuentro, no semilla/sorteos)', /Aprendizaje propuesto/.test(pl) && /\|M1\|EQ01|\|M1/.test(pl) && !/seed\d|\|d\d+\|e\d+/.test(pl), pl.slice(0, 200));
  await tab('Análisis'); await tab('Partido'); step(7, 'Partido/Análisis', 'abrir el análisis y volver no aplica aprendizaje', (await learn()).ledgers.EQ01.applications.length === reg0, `aplicaciones ${reg0}`);
  await p.click('#apply-learning'); await p.waitForSelector('#pl-msg'); const am = await text('#pl-msg'); const L4 = await learn(); const ms = L4.ledgers.EQ01.applications.filter((a) => /\|M1\|/.test(a.source_id) && a.status === 'aplicada');
  step(7, 'Partido', 'aplicar a esta variante (acción separada): una aplicación por equipo con la identidad del encuentro', /aplicado \(APL-/.test(am) && ms.length === 1 && !/seed/.test(ms[0].source_id), `${am.slice(0, 80)} · ${ms[0]?.source_id}`);
  step(7, 'Partido', 'repetir la aplicación de la misma fuente queda bloqueado', await p.locator('#apply-learning').isDisabled(), 'botón deshabilitado');
  // 8. deshacer la última aplicación
  await tab('Plantillas'); const snapBefore = JSON.stringify((await learn()).states.EQ02); await p.click('#ls-undo'); await p.waitForTimeout(300); const um = await text('#ls-msg'); const L5 = await learn();
  step(8, 'Plantillas', 'deshacer: restaura el estado previo y deja la aplicación como revertida con rastro', /Deshecho APL-/.test(um) && L5.ledgers.EQ02.applications.some((a) => a.status === 'revertida') && JSON.stringify(L5.states.EQ02) !== snapBefore, um.slice(0, 120)); // la última aplicación es la del segundo equipo (EQ02)
  // 9. descargas reales (partido terminado)
  await tab('Partido'); const d1 = await download(() => p.click('#download')); const j = JSON.parse(d1.buf.toString('utf8')); const ti = j.input?.teams?.[0];
  step(9, 'Partido', 'descarga REAL del encuentro: bytes, SHA-256, motor 18B, identidad del encuentro y la disposición/rol editados en la entrada congelada', d1.bytes > 100000 && j.schema === 'beM-match-export/10' && j.meta?.engineVersion === 'beM-motor-0.18.1-MOTOR18B' && /\|M1$/.test(j.input.labMatchId ?? '') && ti.plan.disposition === target && ti.players[0].offensiveRole.code === roleTarget,
    `${d1.name} ${d1.bytes} B sha ${d1.sha256.slice(0, 12)} · ${j.input?.labMatchId} · ${ti?.plan?.disposition}/${ti?.players?.[0]?.offensiveRole?.code}`);
  step(9, 'Partido', 'el conocimiento de la entrada congelada es el de la copia antes del partido (no se modifica durante el juego)', JSON.stringify(ti.players.map((q) => q.knowledge)) === k2, 'igual al de la copia tras las dos sesiones');
  await tab('Análisis'); await p.click('button:has-text("Exportar")'); await p.waitForSelector('#dl-json'); const d2 = await download(() => p.click('#dl-json'));
  step(9, 'Análisis › Exportar', 'descarga REAL del análisis (audiencia pública) sin conocimiento privado', d2.bytes > 1000 && !/tacticalLearning|coachLearning/.test(d2.buf.toString('utf8')), `${d2.name} ${d2.bytes} B sha ${d2.sha256.slice(0, 12)}`);
} catch (e) { step(99, '—', 'excepción del recorrido', false, e.stack ?? e.message); }
writeFileSync(join(OUT, 'recorrido-navegador.json'), JSON.stringify({ app: 'MOTOR-18B', date: new Date().toISOString(), browser: 'Chromium (Playwright)', url: URL0, steps: log, consoleErrors, netErrors, passed: log.filter((s) => s.ok).length, failed: log.filter((s) => !s.ok).length }, null, 1));
console.log(`\nPasos OK ${log.filter((s) => s.ok).length}/${log.length} · errores de consola ${consoleErrors.length} · errores de red ${netErrors.length}`);
await browser.close(); server.close(); process.exit(log.every((s) => s.ok) && !consoleErrors.length && !netErrors.length ? 0 : 1);
