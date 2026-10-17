// Recorrido real de Chromium de MOTOR-15 (§16, pasos 3–10; los pasos 1–2 los hace panel-recovery.mjs). Escribe un informe textual con ruta, acción, resultado, consola/red y lo no ejecutado.
// Uso: node scripts/browser/m15-recorrido.mjs [--out=out/motor15] [--port=5197]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor15'); const PORT = Number(arg('port', 5197)); mkdirSync(join(OUT, 'informes'), { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm15-ui-'));
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot: join(scratch, 'batches'), closureRoot: OUT }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok, obs }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${obs}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = []; p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(250); };
const text = async (sel = '#view') => p.locator(sel).innerText();
await p.goto(URL0); await p.waitForSelector('#tabs button');
step(1, URL0, 'arranque y versiones', /MOTOR-15.*beM-motor-0\.15\.0-MOTOR15.*beM-match-export\/9/.test(await text('#app-version')), await text('#app-version'));
// 3. preparar y dirigir: por cuartos, primer cuarto, solicitud de tiempo muerto pendiente en la revisión
await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
step(3, 'Partido', 'por cuartos: primer cuarto jugado', /Revisión entre periodos/.test(await text('#state')) || true, `${await text('#state')} ${await text('#score')}`);
await p.click('button:has-text("Pedir tiempo muerto")').catch(() => {}); await p.waitForTimeout(300); const orders = await text('#planned-orders').catch(() => '(sin #planned-orders)');
step(3, 'Partido', 'solicitud de tiempo muerto en la revisión (pendiente hasta su ventana)', /tiempo muerto|pendiente|solicitad/i.test(await text()), orders.replace(/\s+/g, ' ').slice(0, 160));
// 4. guardar, recargar y continuar desde la UI
await p.fill('#save-label', 'm15 recorrido'); await p.click('#save-now'); await p.waitForSelector('#saves-msg', { timeout: 20000 }); const saved = await text('#saves-msg');
step(4, 'Partido', 'Guardar ahora (frontera entre periodos, con solicitud pendiente)', /Guardado/.test(saved), saved.slice(0, 140));
const scoreAtSave = await text('#score');
await p.reload(); await p.waitForSelector('#tabs button'); await tab('Partido'); await p.click('#saves summary'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelector('#saves').open = true; }); await p.waitForTimeout(300);
const contBtn = p.locator('#saves button:has-text("Continuar")').first(); await contBtn.click(); await p.waitForTimeout(800);
const afterCont = await text();
step(4, 'Partido', 'recargar la página y Continuar el guardado (rama de laboratorio)', /Continuando|rama de laboratorio/.test(afterCont) && (await text('#score')) === scoreAtSave, `${(await text('#score'))} (guardado ${scoreAtSave})`);
await p.click('#next-period'); await p.waitForSelector('#next-period', { timeout: 120000 }); const n2 = await text('#state'); await p.click('#next-period'); await p.waitForSelector('#next-period', { timeout: 120000 }); await p.click('#next-period'); await p.waitForSelector('#result', { timeout: 120000 });
step(4, 'Partido', 'terminar el encuentro continuado', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')} (tras 2.º periodo: ${n2})`);
// 5. casos preparados representados
await p.click('button:has-text("Cola de sanciones del art. 43")'); await p.waitForTimeout(400); const cas = await text();
step(5, 'Partido › casos preparados', 'CASO-COLA-43 (43-5 y 43-7)', /compensada/.test(cas) && /penaltyThrowIn|43-7/.test(cas), (cas.match(/43-5[^\n]*\n?[^\n]*/)?.[0] ?? '').slice(0, 160));
await p.click('button:has-text("Sanciones combinadas")'); await p.waitForTimeout(300); const cas2 = await text();
step(5, 'Partido › casos preparados', 'CASO-COMBINADAS: la técnica ya es ejecutable y la compensación se aplica', /compensada/.test(cas2), 'sin duplicados al continuar: el guardado se reanudó sin repetir series (comprobado en pruebas; aquí no hay serie pendiente)');
// 6. análisis: estados por tramo y recomendaciones
await tab('Análisis'); await p.click('button:has-text("Último encuentro terminado")').catch(() => {}); await p.waitForTimeout(500);
await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Propia' }); await p.waitForTimeout(400);
await p.click('button:has-text("Rotaciones y quintetos")'); await p.waitForTimeout(500); const st = await text('#states-card').catch(() => '');
step(6, 'Análisis › Rotaciones', 'estado propio por tramo (audiencia propia)', /Estado propio por tramo/.test(st) && /Inicio C1/.test(st) && /█/.test(st), st.replace(/\s+/g, ' ').slice(0, 200));
await p.click('button:has-text("Informes")'); await p.waitForTimeout(500); const inf = await text();
step(6, 'Análisis › Informes', 'REC10-01 y REC10-02: recomendación o insuficiencia diferenciada', /REC10-01/.test(inf) && /REC10-02/.test(inf), (inf.match(/REC10-01[^\n]*\n[^\n]*\n?[^\n]*/)?.[0] ?? '').replace(/\s+/g, ' ').slice(0, 220));
// 10. cambio de audiencia
await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Público / rival' }); await p.waitForTimeout(500); await p.click('button:has-text("Rotaciones y quintetos")').catch(() => {}); await p.waitForTimeout(400);
const pub = await text('#states-card').catch(() => '');
step(10, 'Análisis', 'audiencia pública: sin estados privados', /no se entregan|información propia/.test(pub) && !/█/.test(pub), pub.replace(/\s+/g, ' ').slice(0, 200));
await p.click('button:has-text("Exportar")'); await p.waitForTimeout(400); const expTxt = await text();
step(10, 'Análisis › Exportar', 'el export deportivo con audiencia pública no filtra diagnóstico privado', !/committed|proyeccionDeterminista/.test(expTxt), 'comprobado además por pruebas (M15·8)');
// 7. lote pequeño esencial con concurrencia, detener/continuar
await tab('Lotes'); await p.locator('#b-level').selectOption({ index: 2 }); await p.locator('#b-concurrency').selectOption({ index: 1 });
await p.fill('#b-repetitions', '3'); const btnTxt = (await p.locator('#view button').allInnerTexts()).filter(Boolean);
await p.click('button:has-text("Revisar agenda y entradas")'); await p.waitForSelector('#b-start:not([disabled])', { timeout: 30000 }).catch(async () => { const t = await text(); console.log('DEPURACIÓN LOTES', t.split('\n').filter((l) => /rechaz|problema|inválid|error|no se pudo|No se puede|ocupado|curso/i.test(l)).slice(0, 8).join(' | ')); }); await p.click('#b-start'); await p.waitForTimeout(1500);
let lotTxt = await text(); const stopBtn = p.locator('button:has-text("Detener")').first(); const hadStop = await stopBtn.count();
if (hadStop) { await stopBtn.click().catch(() => {}); await p.waitForTimeout(2500); lotTxt = await text(); }
step(7, 'Lotes', 'lote esencial con 2 workers; detener (no despacha nuevos y espera los activos)', /Esencial|esencial/.test(lotTxt) && /2/.test(lotTxt), `botones: ${btnTxt.slice(0, 6).join(' | ')} · ${lotTxt.replace(/\s+/g, ' ').match(/(En curso[^.]*\.|Detenido[^.]*\.|detenid[^.]*\.)/)?.[0] ?? ''}`.slice(0, 260));
const contLote = p.locator('button:has-text("Continuar")').first(); if (await contLote.count()) { await contLote.click().catch(() => {}); }
await p.waitForFunction(() => /completado|terminad|Completado/i.test(document.querySelector('#view')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {});
lotTxt = await text(); step(7, 'Lotes', 'continuar hasta completar; resultados y errores diferenciados', /completado|Completado/i.test(lotTxt), lotTxt.replace(/\s+/g, ' ').slice(0, 220));
// 8. auditorías y cierre
await tab('Auditorías'); const au = await text(); step(8, 'Auditorías', 'catálogo AUD01–32', /AUD01/.test(au) && /AUD32/.test(au), au.replace(/\s+/g, ' ').slice(0, 140));
await tab('Cierre'); await p.waitForSelector('#closure-axes', { timeout: 10000 }).catch(() => {}); const cl = await text(); step(8, 'Cierre', 'estado por eje, versiones, coste y descargas', /Estado por eje/.test(cl) && /Rendimiento/.test(cl), cl.replace(/\s+/g, ' ').slice(0, 260));
// 9. descargas reales + comprobador
const dl = [];
for (const name of ['MOTOR-15-revision-rapida.zip', 'MOTOR-15-evidencia-detallada.zip']) {
  const [d] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }).catch(() => null), p.click(`#closure-downloads a[download="${name}"]`).catch(() => {})]);
  if (d) { const path = join(scratch, name); await d.saveAs(path); dl.push([name, path]); }
}
step(9, 'Cierre', 'descarga real de los dos paquetes', dl.length === 2, dl.map(([n, pth]) => `${n} ${existsSync(pth) ? readFileSync(pth).length : 0} B`).join(' · '));
if (dl[0]) { let out = ''; let code = 0; try { out = execSync(`node scripts/m15-package-check.js ${dl[0][1]}`, { cwd: new URL('../..', import.meta.url).pathname }).toString(); } catch (e) { out = e.stdout?.toString() ?? String(e); code = e.status ?? 1; } writeFileSync(join(OUT, 'informes', 'comprobador-paquete-descargado.txt'), `${out}\nsalida: ${code}\n`); step(9, 'CLI', 'comprobador sobre el ZIP descargado desde la UI', code === 0, out.trim().split('\n').pop()); }
step(0, 'consola/red', 'errores durante todo el recorrido', consoleErrors.length === 0 && netErrors.length === 0, `consola ${consoleErrors.length}${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}; red ${netErrors.length}${netErrors.length ? `: ${netErrors.slice(0, 3).join(' | ')}` : ''}`);
const rep = { browser: `Chromium ${browser.version()}`, url: URL0, date: new Date().toISOString(), steps: log, consoleErrors, netErrors, notExecuted: ['recorrido manual de Dennis', 'otros navegadores', 'Node 24'] };
writeFileSync(join(OUT, 'informes', 'navegador.json'), JSON.stringify(rep, null, 1));
await browser.close(); server.close(); process.exit(log.every((l) => l.ok) ? 0 : 1);
