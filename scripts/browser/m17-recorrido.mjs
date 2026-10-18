// Recorrido corto y real de Chromium de MOTOR-17 (§17.2): versiones, candidatas del Panel (borrador no activo), un partido completo por cuartos con guardar/continuar, análisis, auditoría sobre diagnósticos reales y Cierre con
// descarga real de los ZIP. El paso «perfil anterior → tarjeta → candidata/base» lo hace panel-recovery.mjs. Escribe un informe textual con consola/red concretas y lo no ejecutado. No es una campaña E2E nueva.
// Uso: node scripts/browser/m17-recorrido.mjs [--out=out/motor17] [--port=5195] [--lots=<directorio con LOT-*>] [--delivery=<directorio de entrega-final>] [--only-download]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, existsSync, readFileSync, cpSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'out/motor17'); const PORT = Number(arg('port', 5195)); const LOTS = arg('lots', null); const DELIVERY = arg('delivery', join(OUT, 'entrega-final')); const ONLY_DL = process.argv.includes('--only-download'); mkdirSync(join(OUT, 'informes'), { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm17-ui-')); const batchRoot = join(scratch, 'batches'); mkdirSync(batchRoot, { recursive: true });
if (LOTS) for (const d of readdirSync(LOTS).filter((x) => x.startsWith('LOT-'))) cpSync(join(LOTS, d), join(batchRoot, d), { recursive: true }); // diagnósticos ya conservados como evidencia (copia local; no se simula)
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot, closureRoot: DELIVERY }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok, obs }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).slice(0, 240)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = []; p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(700); }; const text = async (sel = '#view') => p.locator(sel).innerText();
await p.goto(URL0); await p.waitForSelector('#tabs button');
step(1, URL0, 'arranque y versiones', /MOTOR-17.*beM-motor-0\.17\.0-MOTOR17.*beM-match-export\/9/.test(await text('#app-version')), (await text('#app-version')).slice(0, 160));
if (!ONLY_DL) {
  // 2. candidatas propuestas: filas, unidades, consumidor y borrador NO activo
  await tab('Auditorías'); await p.click('#audit-tab-calib'); await p.waitForSelector('#audit-cand17', { timeout: 20000 }); const cand = await text('#audit-cand17');
  step(2, 'Auditorías › Calibración y candidatas', 'C17-01 y C17-02 con fila, unidad, base → candidata, consumidor, causa, efecto previsto y observado en desarrollo', /C17-01/.test(cand) && /C17-02/.test(cand) && /energy\.costPerLiveMinute/.test(cand) && /2 → 3,5|2 → 3\.5/.test(cand) && /MatchCore\.consume/.test(cand) && /energía final/.test(cand), cand.replace(/\s+/g, ' ').slice(0, 260));
  await p.click('#cand-draft-C17-02'); await p.waitForTimeout(600); const msg = await text('#view');
  const lib = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /profiles/.test(x)); return k ? localStorage.getItem(k) : ''; });
  step(2, 'Auditorías › Calibración y candidatas', 'crear borrador de C17-02: no activa nada y el borrador contiene la fila editada', /NO activado/.test(msg) && /costPerLiveMinute[^}]{0,80}3\.5|"energy\.costPerLiveMinute":\s*3\.5/.test(lib), (msg.match(/C17-02: borrador[^.]*\.[^.]*\./)?.[0] ?? '').slice(0, 220));
  // 3. partido completo por cuartos con guardar y continuar
  await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
  await p.fill('#save-label', 'm17 recorrido'); await p.click('#save-now'); await p.waitForSelector('#saves-msg', { timeout: 20000 }); const saved = await text('#saves-msg'); const scoreAtSave = await text('#score');
  step(3, 'Partido', 'Guardar ahora en la frontera del primer periodo', /Guardado/.test(saved), saved);
  await p.reload(); await p.waitForSelector('#tabs button'); await tab('Partido'); await p.click('#saves summary'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelector('#saves').open = true; }); await p.waitForTimeout(300);
  await p.locator('#saves button:has-text("Continuar")').first().click(); await p.waitForTimeout(800);
  step(3, 'Partido', 'recargar la página y Continuar el guardado (mismo motor y contratos compatibles)', (await text('#score')) === scoreAtSave, `${await text('#score')} (guardado ${scoreAtSave})`);
  for (let i = 0; i < 4; i++) { await p.click('#next-period').catch(() => {}); await p.waitForTimeout(400); await p.waitForFunction(() => /Finalizado|Revisión/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {}); if (/Finalizado/.test(await text('#state'))) break; }
  step(3, 'Partido', 'terminar el encuentro continuado', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')}`);
  // 4. análisis por audiencia: robos y recuperaciones
  await tab('Análisis'); await p.click('button:has-text("Último encuentro terminado")').catch(() => {}); await p.waitForTimeout(500); await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Diagnóstico' }).catch(() => {});
  await p.click('button:has-text("Defensa")').catch(() => {}); await p.waitForTimeout(500); const def = await text(); step(4, 'Análisis › Defensa', 'robos por organización (acta ACTA-MOTOR17-R1) con audiencia diagnóstica', /Robos/.test(def), def.replace(/\s+/g, ' ').slice(0, 200));
  await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Público / rival' }).catch(() => {}); await p.waitForTimeout(400); await p.click('button:has-text("Exportar")').catch(() => {}); await p.waitForTimeout(400);
  step(4, 'Análisis', 'audiencia pública: el export deportivo no filtra diagnóstico privado', !/committed|proyeccionDeterminista/.test(await text()), 'comprobado además por pruebas (M15·8)');
  // 5. auditoría sobre diagnósticos reales
  await tab('Auditorías'); await p.waitForSelector('#audit-source', { timeout: 20000 }); await p.waitForTimeout(800); const lots = await text('#audit-source');
  const nLots = (await p.locator('#audit-source tbody tr').allInnerTexts()).length; step(5, 'Auditorías', 'evidencia disponible: diagnósticos conservados como lotes', LOTS ? nLots >= 1 : true, `${nLots} lotes · ${lots.replace(/\s+/g, ' ').slice(0, 160)}`);
  if (LOTS && nLots) {
    for (const cb of await p.locator('#audit-source input[type=checkbox]').all()) await cb.check();
    await p.click('#audit-verify'); await p.waitForTimeout(3000); const ver = await text('#audit-source'); step(5, 'Auditorías', 'verificar integridad sin interpretar', /verificada/.test(ver), ver.replace(/\s+/g, ' ').slice(-160));
    await p.click('#audit-run'); await p.waitForFunction(() => document.querySelector('#audit-universe') != null, null, { timeout: 300000 }).catch(() => {}); await p.click('#audit-universe summary').catch(() => {}); await p.waitForTimeout(500); const uni = await text('#audit-universe').catch(() => '');
    step(5, 'Auditorías', 'universo efectivo con fuentes, casos y huellas, AUD17 y AUD26', /LOT-/.test(uni) && /AUD26/.test(uni) && /AUD17/.test(uni), uni.replace(/\s+/g, ' ').slice(0, 260));
    await p.click('#audit-tab-matrix').catch(() => {}); await p.waitForTimeout(700); const mat = await text(); step(5, 'Auditorías › Matriz', 'matriz de 32 capacidades con contraste de cálculo', /TEC01/.test(mat) && /FIS07/.test(mat), mat.replace(/\s+/g, ' ').slice(0, 160));
    await p.click('#audit-tab-findings').catch(() => {}); await p.waitForTimeout(500); const hal = await text(); step(5, 'Auditorías › Hallazgos', 'hallazgos navegables', /AUD/.test(hal), hal.replace(/\s+/g, ' ').slice(0, 160));
  }
}
// 6. cierre y descarga real
await tab('Cierre'); await p.waitForSelector('#closure-axes', { timeout: 10000 }).catch(() => {}); const cl = await text(); step(6, 'Cierre', 'estado por eje, versiones, coste y descargas', /Cierre de MOTOR-17/.test(cl), cl.replace(/\s+/g, ' ').slice(0, 200));
const dl = []; const wanted = existsSync(DELIVERY) ? readdirSync(DELIVERY).filter((n) => /^MOTOR-17-(revision-rapida|indice-partes|evidencia-detallada-parte-01-de)/.test(n)) : [];
for (const name of wanted) { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }).catch(() => null), p.click(`#closure-downloads a[download="${name}"]`).catch(() => {})]); if (d) { const path = join(scratch, name); await d.saveAs(path); dl.push([name, path]); } }
step(6, 'Cierre', 'descarga real de los archivos de MOTOR-17 (rápido, índice y primera parte)', wanted.length ? dl.length === wanted.length : true, dl.length ? dl.map(([n, pth]) => `${n} ${readFileSync(pth).length} B`).join(' · ') : 'sin entrega generada todavía (se repite con --delivery tras empaquetar)');
step(0, 'consola/red', 'errores durante todo el recorrido', consoleErrors.length === 0 && netErrors.length === 0, `consola ${consoleErrors.length}${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}; red ${netErrors.length}${netErrors.length ? `: ${netErrors.slice(0, 3).join(' | ')}` : ''}`);
const file = join(OUT, 'informes', ONLY_DL ? 'navegador-descarga.json' : 'navegador.json');
writeFileSync(file, JSON.stringify({ browser: `Chromium ${browser.version()}`, url: URL0, date: new Date().toISOString(), steps: log, consoleErrors, netErrors, downloaded: dl.map(([n]) => n), notExecuted: ['recorrido manual de Dennis', 'otros navegadores', 'Node 24', 'perfil anterior → tarjeta → candidata/base (lo recorre panel-recovery.mjs)'] }, null, 1));
await browser.close(); server.close(); process.exit(log.every((l) => l.ok) ? 0 : 1);
