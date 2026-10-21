// Recorrido real de Chromium de MOTOR-18 (§14): fichas, copia neutral y sintética, plan con familiaridad, previsualización/aplicación/deshacer de sesión, desuso del veterano, partido y continuación,
// aprendizaje tras el partido, análisis por audiencias, panel y descargas (comprobadas por bytes, no por el enlace). Conserva los pasos y los errores reales de consola y red.
// Uso: node scripts/browser/m18-recorrido.mjs [--out=docs/tecnico/evidencia-motor18/ui] [--port=5198]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'docs/tecnico/evidencia-motor18/ui'); const PORT = Number(arg('port', 5198)); mkdirSync(OUT, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm18-ui-')); mkdirSync(join(scratch, 'batches'), { recursive: true });
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot: join(scratch, 'batches'), closureRoot: join(scratch, 'closure') }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok: !!ok, obs: String(obs).replace(/\s+/g, ' ').slice(0, 300) }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).replace(/\s+/g, ' ').slice(0, 160)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = [];
p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(600); }; const text = async (sel = '#view') => p.locator(sel).innerText();
const download = async (click) => { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), click()]); const path = await d.path(); const { readFileSync } = await import('node:fs'); const buf = readFileSync(path); return { name: d.suggestedFilename(), bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex'), buf }; };
try {
  await p.goto(URL0); await p.waitForSelector('#tabs button');
  const ver = await text('#app-version'); step(1, URL0, 'arranque: cabecera con aplicación, motor y formato de MOTOR-18', /MOTOR-18.*0\.18\.0-MOTOR18.*export\/10/.test(ver), ver);
  // 2. ficha neutral
  await p.click('button:has-text("Abrir ficha")'); await p.waitForSelector('#knowledge-sec'); await p.click('#knowledge-sec summary').catch(() => {});
  const neutral = await text('#knowledge-sec'); const poly = await text('#dev-poly');
  step(2, 'Plantillas › ficha', 'referencia sin copia: «sin historial de aprendizaje; compatibilidad neutra» (no «domina todo»); Polivalencia separada de las 32 capacidades', /sin historial de aprendizaje; compatibilidad neutra/.test(neutral) && /Polivalencia/.test(poly) && !/domina/i.test(neutral), `${neutral.slice(0, 90)} | ${poly.slice(0, 90)}`);
  // 3. copia sintética explícita
  await p.click('#learn-make'); await p.waitForSelector('#learn-msg'); const msg = await text('#learn-msg'); await p.waitForTimeout(300);
  const refEdit = await p.evaluate(() => { const v = Object.entries(localStorage).find(([k]) => /edit/.test(k))?.[1] ?? ''; return /"knowledge"/.test(v); });
  step(3, 'Plantillas', 'Crear copia de aprendizaje MOTOR-18: copia identificada y activa; las fichas editadas de referencia no reciben conocimiento', /Copia activa/.test(msg) && !refEdit, msg);
  await p.click('button:has-text("Abrir ficha")'); await p.waitForSelector('#knowledge-sec table'); const sec = await text('#knowledge-sec');
  step(3, 'Plantillas › ficha', 'apartado «Conocimiento» con nivel y categoría (posiciones, roles y módulos)', /dominado/.test(sec) && /FAM:pick_and_roll/.test(sec) && /ORG01/.test(sec), sec.slice(0, 120));
  // 4. edición masiva +3 con vista previa y deshacer exacto
  await p.click('button:has-text("Todos los jugadores del equipo abierto")'); await p.selectOption('#k-bulk select[aria-label="dominio"]', 'tactic'); await p.click('#k-bulk button:has-text("Todos los de este dominio")');
  await p.click('#k-bulk button:has-text("+3")'); await p.click('#k-preview'); await p.waitForTimeout(300); const prev = await text('#k-bulk');
  step(4, 'Plantillas', 'vista previa del +3 al conocimiento seleccionado (sin tocar las 32 capacidades)', /Se revisarán \d+ entradas/.test(prev), prev.slice(prev.indexOf('Se revisarán'), prev.indexOf('Se revisarán') + 90));
  const snap0 = await p.evaluate(() => JSON.stringify(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))?.[1] ?? ''));
  await p.click('#k-apply'); await p.waitForTimeout(300); const snap1 = await p.evaluate(() => JSON.stringify(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))?.[1] ?? ''));
  await p.click('#k-undo'); await p.waitForTimeout(300); const snap2 = await p.evaluate(() => JSON.stringify(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))?.[1] ?? ''));
  step(4, 'Plantillas', 'aplicar y deshacer: el estado guardado vuelve exactamente al anterior', snap1 !== snap0 && snap2 === snap0, `cambió=${snap1 !== snap0} restaurado=${snap2 === snap0}`);
  // 5. desuso del veterano: 3650 días → posición 30 → 26,4
  await p.selectOption('#ls-team', 'EQ01'); await p.click('#learn-session button:has-text("Todos")'); await p.fill('#ls-idle', '3650'); await p.press('#ls-idle', 'Tab'); await p.waitForTimeout(300); await p.click('#ls-idle-only'); await p.waitForSelector('#ls-preview-out, #ls-msg'); if (!(await p.locator('#ls-preview-out').count())) throw new Error(`sin vista previa: ${await text('#ls-msg')}`);
  const out = await text('#ls-preview-out'); step(5, 'Plantillas › sesión', 'previsualizar «solo desuso» a 3650 días: posición 30 → 26,40 (no se escribe nada)', /desuso position:PG[\s\S]*30\.00 → 26\.40/.test(out) && /laboratorio|Laboratorio de conocimiento/.test(await text('#learn-session')), out.slice(0, 160));
  await p.click('#ls-apply'); await p.waitForSelector('#ls-msg'); const ap = await text('#ls-msg'); step(5, 'Plantillas › sesión', 'aplicar a la copia con recibo', /Aplicado \(APL-/.test(ap), ap);
  await p.click('#ls-undo'); await p.waitForTimeout(300); const un = await text('#ls-msg'); step(5, 'Plantillas › sesión', 'deshacer: restaura conocimiento, peak, reloj y presupuestos; aplicación revertida con rastro', /Deshecho APL-/.test(un), un);
  // 6. sesión de entrenamiento real
  await p.selectOption('#ls-collective', 'FAM:give_and_go'); await p.waitForTimeout(300); await p.fill('#ls-idle', '0'); await p.press('#ls-idle', 'Tab'); await p.waitForTimeout(300); await p.fill('#ls-hours', '1'); await p.press('#ls-hours', 'Tab'); await p.waitForTimeout(300); await p.click('#ls-preview'); await p.waitForSelector('#ls-preview-out'); const tr = await text('#ls-preview-out');
  step(6, 'Plantillas › sesión', 'previsualizar entrenamiento colectivo (dosis, factores, presupuesto del día)', /FAM:give_and_go/.test(tr) && /presupuesto del día/.test(tr), tr.slice(0, 200));
  await p.click('#ls-apply'); await p.waitForTimeout(300); step(6, 'Plantillas › sesión', 'aplicar entrenamiento', /Aplicado/.test(await text('#ls-msg')), await text('#ls-msg'));
  // 7. Preparación
  await tab('Preparación'); await p.waitForSelector('#fam-quintet-0', { timeout: 15000 }); const prep = await text('#fam-quintet-0');
  step(7, 'Preparación', 'dominio del quinteto para disposición, organización, cobertura y familias elegidas, y jugadores con menor familiaridad', /Disposición/.test(prep) && /Menor familiaridad/.test(prep), prep.slice(0, 160));
  // 8. partido por cuartos
  await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.waitForSelector('#fam-live', { timeout: 15000 }); const fl = await text('#fam-live');
  step(8, 'Partido', 'antes de empezar: familiaridad propia con lo que se va a pedir (sin ventana de confirmación)', /Familiaridad/.test(fl), fl.slice(0, 140));
  await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
  for (let i = 0; i < 4; i++) { await p.click('#next-period').catch(() => {}); await p.waitForTimeout(400); await p.waitForFunction(() => /Finalizado|Revisión/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {}); if (/Finalizado/.test(await text('#state'))) break; }
  step(8, 'Partido', 'terminar el encuentro con copia de aprendizaje', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')}`);
  // 9. aprendizaje tras el partido (separado)
  await p.waitForSelector('#post-learning', { timeout: 20000 }); const regBefore = await p.evaluate(() => (JSON.parse(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))[1]).ledgers.EQ01.applications.length));
  await p.click('#see-learning'); await p.waitForTimeout(300); const pl = await text('#post-learning');
  step(9, 'Partido', '«Ver aprendizaje propuesto»: exposiciones y diferencias; ver no aplica nada', /Aprendizaje propuesto/.test(pl) && /EQ01/.test(pl), pl.slice(0, 160));
  await tab('Análisis'); await tab('Partido'); const regMid = await p.evaluate(() => (JSON.parse(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))[1]).ledgers.EQ01.applications.length));
  step(9, 'Partido/Análisis', 'abrir el análisis y volver no aplica aprendizaje', regMid === regBefore, `aplicaciones ${regBefore} → ${regMid}`);
  await p.click('#apply-learning'); await p.waitForSelector('#pl-msg'); const reg1 = await text('#pl-msg'); step(9, 'Partido', 'Aplicar a esta variante (acción separada)', /aplicado \(APL-/.test(reg1), reg1);
  const dis = await p.locator('#apply-learning').isDisabled(); step(9, 'Partido', 'repetir la aplicación de la misma fuente queda bloqueado', dis, `botón deshabilitado=${dis}`);
  // 10. análisis por audiencias 
  await tab('Análisis'); const hasRes = await p.locator('button:has-text("Familiaridad")').count();
  if (hasRes) {
    await p.click('button:has-text("Familiaridad")'); await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Público / rival' }); await p.waitForTimeout(300); const pub = await text('#view');
    await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Propia' }); await p.waitForTimeout(300); const own = await text('#view'); const ownHeads = (await p.locator('#view th').allInnerTexts()).join('|'); const ownCtx = own.split('\n').filter((l) => /Polivalencia/.test(l)).join(' | ').slice(0, 160);
    await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Diagnóstico' }); await p.waitForTimeout(300); const diag = await text('#view');
    step(10, 'Análisis › Familiaridad', 'público: no observable; propia: solo su equipo sin Polivalencia; diagnóstico identificado con Polivalencia', /no es observable/.test(pub) && !/Polivalencia/.test(ownHeads) && /DIAGNÓSTICO/.test(diag) && /Polivalencia/.test(diag), `${pub.slice(pub.indexOf('no es obs'), pub.indexOf('no es obs') + 50)} | propia sin columna Polivalencia=${!/Polivalencia/.test(ownHeads)} | diag=${/DIAGNÓSTICO/.test(diag)}`);
  } else step(10, 'Análisis', 'sin resultado en memoria', false, 'sin vista Familiaridad');
  // 11. persistencia: recargar y comprobar copia y registro
  await p.reload(); await p.waitForSelector('#tabs button'); await p.waitForSelector('#learn-msg, #learning-copy'); const copyTxt = await text('#learning-copy'); const reg2 = await p.evaluate(() => (JSON.parse(Object.entries(localStorage).find(([k]) => /m18\.learning/.test(k))[1]).ledgers.EQ01.applications.length));
  step(11, 'Plantillas', 'recargar: la copia de aprendizaje y su registro de aplicaciones se restauran', /Copia activa: LEARN18-S/.test(copyTxt) && reg2 >= 3, `${copyTxt.slice(copyTxt.indexOf('Copia activa'), copyTxt.indexOf('Copia activa') + 80)} · registros ${reg2}`);
  // 12. panel
  await tab('Panel de ajustes'); const panel = await text('#view'); step(12, 'Panel de ajustes', 'el panel abre con el perfil de MOTOR-18 sin errores', panel.length > 200, panel.slice(0, 100));
} catch (e) { step(99, '—', 'excepción del recorrido', false, e.stack ?? e.message); }
// 13. descargas reales (partido y análisis) tras un partido nuevo breve
try {
  await tab('Partido'); await p.click('#prepare'); await p.click('text=Simulado total').catch(() => {}); await p.click('#prepare'); await p.click('#start'); await p.waitForFunction(() => /Finalizado/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 180000 }).catch(() => {});
  const d1 = await download(() => p.click('#download')); const j = JSON.parse(d1.buf.toString('utf8'));
  step(13, 'Partido', 'descarga REAL del encuentro (JSON): bytes, SHA-256 y contenido de familiaridad/versión', d1.bytes > 100000 && j.schema === 'beM-match-export/10' && !!j.diagnostics?.familiarity?.exposure, `${d1.name} ${d1.bytes} B sha ${d1.sha256.slice(0, 12)} schema ${j.schema}`);
  await tab('Análisis'); await p.click('button:has-text("Exportar")'); await p.waitForSelector('#dl-json'); const d2 = await download(() => p.click('#dl-json'));
  step(13, 'Análisis › Exportar', 'descarga REAL del análisis (audiencia pública): bytes y sin conocimiento privado', d2.bytes > 1000 && !/tacticalLearning|coachLearning/.test(d2.buf.toString('utf8')), `${d2.name} ${d2.bytes} B sha ${d2.sha256.slice(0, 12)}`);
} catch (e) { step(98, 'descargas', 'excepción', false, e.stack ?? e.message); }
writeFileSync(join(OUT, 'recorrido-navegador.json'), JSON.stringify({ app: 'MOTOR-18', date: new Date().toISOString(), browser: 'Chromium (Playwright)', url: URL0, steps: log, consoleErrors, netErrors, passed: log.filter((s) => s.ok).length, failed: log.filter((s) => !s.ok).length }, null, 1));
console.log(`\nPasos OK ${log.filter((s) => s.ok).length}/${log.length} · errores de consola ${consoleErrors.length} · errores de red ${netErrors.length}`);
await browser.close(); server.close(); process.exit(log.every((s) => s.ok) && !consoleErrors.length && !netErrors.length ? 0 : 1);
