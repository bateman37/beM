// Recorrido real de Chromium de MOTOR-15B (§11): caso preparado RG-I03, guardar/continuar, análisis con créditos de robo, auditorías con selección de evidencia (lotes de reproducción de C15-01…05) y cierre con
// descarga real de los ZIP MOTOR-15B + comprobador. Los pasos de perfil anterior → tarjeta → candidata/base los hace panel-recovery.mjs. Escribe un informe textual (consola/red y lo no ejecutado).
// Uso: node scripts/browser/m15b-recorrido.mjs [--out=out/motor15b] [--port=5198] [--only-download]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, existsSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor15b'); const PORT = Number(arg('port', 5198)); const ONLY_DL = process.argv.includes('--only-download'); mkdirSync(join(OUT, 'informes'), { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm15b-ui-')); const batchRoot = join(scratch, 'batches'); mkdirSync(batchRoot, { recursive: true });
for (const l of ['c15-lote-A', 'c15-lote-B']) { const src = join(OUT, 'auditoria', l); if (existsSync(src)) cpSync(src, batchRoot, { recursive: true }); } // los lotes de reproducción como evidencia conservada (copia local; no se simula)
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot, closureRoot: OUT }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok, obs }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).slice(0, 240)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = []; p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(700); }; const text = async (sel = '#view') => p.locator(sel).innerText();
await p.goto(URL0); await p.waitForSelector('#tabs button');
step(1, URL0, 'arranque y versiones', /MOTOR-15B.*beM-motor-0\.15\.1-MOTOR15B.*beM-match-export\/9/.test(await text('#app-version')), await text('#app-version'));
if (!ONLY_DL) {
  // 3. guardar y continuar en la frontera entre periodos
  await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
  await p.fill('#save-label', 'm15b recorrido'); await p.click('#save-now'); await p.waitForSelector('#saves-msg', { timeout: 20000 }); const saved = await text('#saves-msg'); const scoreAtSave = await text('#score');
  step(3, 'Partido', 'Guardar ahora en la frontera del primer periodo', /Guardado/.test(saved), saved);
  await p.reload(); await p.waitForSelector('#tabs button'); await tab('Partido'); await p.click('#saves summary'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelector('#saves').open = true; }); await p.waitForTimeout(300);
  await p.locator('#saves button:has-text("Continuar")').first().click(); await p.waitForTimeout(800);
  step(3, 'Partido', 'recargar la página y Continuar el guardado', (await text('#score')) === scoreAtSave, `${await text('#score')} (guardado ${scoreAtSave})`);
  for (let i = 0; i < 4; i++) { await p.click('#next-period').catch(() => {}); await p.waitForTimeout(400); await p.waitForFunction(() => /Finalizado|Revisión/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {}); if (/Finalizado/.test(await text('#state'))) break; }
  step(3, 'Partido', 'terminar el encuentro continuado', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')}`);
  // 3b. (tras terminar un encuentro, la tarjeta de casos preparados está visible) caso preparado RG-I03 (sin editar JSON a mano)
  await tab('Partido'); await p.click('button:has-text("Interferencia defensiva en el último libre")'); await p.waitForSelector('#case-out .card', { timeout: 120000 }); await p.waitForTimeout(500); const cas = await text('#case-out');
  step(2, 'Partido › casos preparados', 'CASO-RG-I03: punto único, técnica de categoría 2, libre adicional, una reanudación y continuación sin duplicados', /tecnica2/.test(cas) && /"categoria": "tecnica2"/.test(cas) && /"continuacionIgual": true/.test(cas) && /throw_in/.test(cas), (cas.match(/"tecnica": \{[^}]*\}/s)?.[0] ?? '').replace(/\s+/g, ' ').slice(0, 220));
  // 4. análisis: créditos de robo y audiencia
  await tab('Análisis'); await p.click('button:has-text("Último encuentro terminado")').catch(() => {}); await p.waitForTimeout(500); await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Diagnóstico' }).catch(() => {});
  await p.click('button:has-text("Defensa")').catch(() => {}); await p.waitForTimeout(500); const def = await text(); step(4, 'Análisis › Defensa', 'robos por organización (acta ACTA-MOTOR15B-R1) con audiencia diagnóstica', /Robos/.test(def), def.replace(/\s+/g, ' ').slice(0, 200));
  await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Público / rival' }).catch(() => {}); await p.waitForTimeout(400); await p.click('button:has-text("Exportar")').catch(() => {}); await p.waitForTimeout(400);
  step(4, 'Análisis', 'audiencia pública: el export deportivo no filtra diagnóstico privado', !/committed|proyeccionDeterminista/.test(await text()), 'comprobado además por pruebas (M15·8)');
  // 5. auditorías con evidencia correcta
  await tab('Auditorías'); await p.waitForSelector('#audit-source', { timeout: 20000 }); await p.waitForTimeout(800); const lots = await text('#audit-source');
  step(5, 'Auditorías', 'la evidencia disponible identifica los lotes de reproducción de C15 por su etiqueta', /reproducción/.test(lots) && /LOT-/.test(lots), lots.replace(/\s+/g, ' ').slice(0, 220));
  for (const cb of await p.locator('#audit-source input[type=checkbox]').all()) await cb.check();
  await p.click('#audit-verify'); await p.waitForTimeout(3000); const ver = await text('#audit-source'); step(5, 'Auditorías', 'verificar integridad sin interpretar', /verificada/.test(ver), ver.replace(/\s+/g, ' ').slice(-200));
  await p.click('#audit-run'); await p.waitForFunction(() => document.querySelector('#audit-universe') != null, null, { timeout: 180000 }).catch(() => {}); await p.click('#audit-universe summary').catch(() => {}); await p.waitForTimeout(500); const uni = await text('#audit-universe').catch(() => '');
  step(5, 'Auditorías', 'universo efectivo: fuentes reales, casos y huellas (C15-05 incluido) y AUD17/AUD26', /LOT-/.test(uni) && /AUD26/.test(uni) && /AUD17/.test(uni) && /< 10/.test(uni), uni.replace(/\s+/g, ' ').slice(0, 300));
  const ids = (await p.locator('#audit-source tbody tr').allInnerTexts()).length; step(5, 'Auditorías', 'dos lotes de reproducción seleccionables', ids >= 2, `${ids} lotes`);
  await p.click('button:has-text("Hallazgos")').catch(() => {}); await p.waitForTimeout(500); const hal = await text(); step(5, 'Auditorías › Hallazgos', 'AUD26 clasificado (interrumpida por final de periodo = comportamiento válido)', /SAQUE-INTERRUMPIDO-FIN-PERIODO|AUD26/.test(hal), hal.replace(/\s+/g, ' ').slice(0, 220));
}
// 6. cierre y descarga real de los dos ZIP MOTOR-15B + comprobador
await tab('Cierre'); await p.waitForSelector('#closure-axes', { timeout: 10000 }).catch(() => {}); const cl = await text(); step(6, 'Cierre', 'estado por eje, versiones, coste y descargas (MOTOR-15B y los de MOTOR-15 como histórico)', /Cierre de MOTOR-15B/.test(cl) && /histórico/.test(cl), cl.replace(/\s+/g, ' ').slice(0, 200));
const dl = [];
for (const name of ['MOTOR-15B-revision-rapida.zip', 'MOTOR-15B-evidencia-detallada.zip']) { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }).catch(() => null), p.click(`#closure-downloads a[download="${name}"]`).catch(() => {})]); if (d) { const path = join(scratch, name); await d.saveAs(path); dl.push([name, path]); } }
step(6, 'Cierre', 'descarga real de los dos paquetes', dl.length === 2, dl.map(([n, pth]) => `${n} ${existsSync(pth) ? readFileSync(pth).length : 0} B`).join(' · '));
if (dl.length === 2) { let out = ''; let code = 0; try { out = execSync(`node scripts/m15b-package-check.js ${dl[0][1]} --detail ${dl[1][1]} --base out/motor15`, { cwd: new URL('../..', import.meta.url).pathname }).toString(); } catch (e) { out = e.stdout?.toString() ?? String(e); code = e.status ?? 1; } writeFileSync(join(OUT, 'informes', 'comprobador-paquete-descargado.txt'), `comando: node scripts/m15b-package-check.js <ZIP descargado> --detail <ZIP descargado> --base out/motor15\n${out}\ncódigo de salida: ${code}\n`);
  step(6, 'Cierre', 'comprobador sobre los ZIP realmente descargados', code === 0, out.trim().split('\n').pop()); }
step(0, 'consola/red', 'errores durante todo el recorrido', consoleErrors.length === 0 && netErrors.length === 0, `consola ${consoleErrors.length}${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}; red ${netErrors.length}${netErrors.length ? `: ${netErrors.slice(0, 3).join(' | ')}` : ''}`);
const file = join(OUT, 'informes', ONLY_DL ? 'navegador-descarga.json' : 'navegador.json');
writeFileSync(file, JSON.stringify({ browser: `Chromium ${browser.version()}`, url: URL0, date: new Date().toISOString(), steps: log, consoleErrors, netErrors, notExecuted: ['recorrido manual de Dennis', 'otros navegadores', 'Node 24', 'perfil anterior → tarjeta → candidata/base (lo recorre panel-recovery.mjs)'] }, null, 1));
await browser.close(); server.close(); process.exit(log.every((l) => l.ok) ? 0 : 1);
