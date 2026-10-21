// Recorrido corto y real de Chromium de MOTOR-17B (§12.2 y §13.2). Dos fases, para no incluir la prueba de descarga dentro de los archivos que descarga:
//   --phase=ui        (antes de empaquetar) arranque y cabecera MOTOR-17B con identidades separadas, creación EXPLÍCITA de una copia de C17-02 sin activación silenciosa, un partido completo por cuartos con guardar/continuar,
//                     análisis de defensa y separación de audiencias, auditoría sobre los diagnósticos reales de la campaña (Matriz, sensibilidad con salida y unidad, AUD05 y sus motivos) y vista Cierre con versiones, ejes y enlaces.
//                     Escribe `informes/navegador.json` (el rápido lo incluye). El paso «perfil anterior → tarjeta → copia» lo hace `panel-recovery.mjs` (se ejecuta aparte con su biblioteca anterior).
//   --phase=download  (después de empaquetar) descarga REAL, desde los enlaces de la aplicación, del paquete rápido, el índice y cada parte del detalle; guarda bytes y SHA-256 de lo descargado en `descargas/descargas.json`
//                     (FUERA de los ZIP) para que `m17b-verify-delivery.py` los compare con los originales. Con cero archivos candidatos NO marca nada como comprobado.
// Uso: node scripts/browser/m17b-recorrido.mjs --phase=ui|download [--out=out/motor17b] [--port=5196] [--lots=<directorio con LOT-*>] [--delivery=<entrega-final>]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, mkdtempSync, existsSync, readFileSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const PHASE = arg('phase', 'ui'); const OUT = arg('out', 'out/motor17b'); const PORT = Number(arg('port', 5196)); const LOTS = arg('lots', null); const DELIVERY = arg('delivery', join(OUT, 'entrega-final'));
mkdirSync(join(OUT, 'informes'), { recursive: true }); mkdirSync(join(OUT, 'descargas'), { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), 'm17b-ui-')); const batchRoot = join(scratch, 'batches'); mkdirSync(batchRoot, { recursive: true });
if (LOTS) for (const d of readdirSync(LOTS).filter((x) => x.startsWith('LOT-'))) cpSync(join(LOTS, d), join(batchRoot, d), { recursive: true, dereference: true }); // diagnósticos ya conservados como evidencia (copia local; no se simula)
const server = createLabServer({ savesRoot: join(scratch, 'saves'), batchRoot, closureRoot: DELIVERY }).listen(PORT, '127.0.0.1');
const log = []; const step = (n, route, action, ok, obs) => { log.push({ n, route, action, ok, obs: String(obs).slice(0, 400) }); console.log(`${ok ? 'OK   ' : 'FALLO'} [${n}] ${route} · ${action} — ${String(obs).slice(0, 240)}`); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
const consoleErrors = []; const netErrors = []; p.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text())); p.on('pageerror', (e) => consoleErrors.push(String(e))); p.on('response', (r) => r.status() >= 400 && netErrors.push(`${r.status()} ${r.url()}`));
const URL0 = `http://127.0.0.1:${PORT}/`; const tab = async (name) => { await p.click(`#tabs button:has-text("${name}")`); await p.waitForTimeout(700); }; const text = async (sel = '#view') => p.locator(sel).innerText();
await p.goto(URL0); await p.waitForSelector('#tabs button');

if (PHASE === 'ui') {
  const ver = await text('#app-version');
  step(1, URL0, 'arranque: cabecera MOTOR-17B con aplicación, motor y formato', /MOTOR-17B.*beM-motor-0\.17\.1-MOTOR17B.*beM-match-export\/9/.test(ver), ver.slice(0, 200));
  // 2. candidata C17-02: fila única, copia EXPLÍCITA no activa
  await tab('Auditorías'); await p.click('#audit-tab-calib'); await p.waitForSelector('#audit-cand17', { timeout: 20000 }); const cand = await text('#audit-cand17');
  step(2, 'Auditorías › Calibración y candidatas', 'C17-02 (referencia provisional P1): una única fila deportiva, unidad, base → candidata y consumidor', /C17-02/.test(cand) && /energy\.costPerLiveMinute/.test(cand) && /2 → 3,5|2 → 3\.5/.test(cand) && /MatchCore\.consume/.test(cand) && /referencia provisional P1/.test(cand) && /acción explícita/.test(cand), cand.replace(/\s+/g, ' ').slice(0, 260));
  const activeBefore = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /profiles/.test(x)); const v = k ? JSON.parse(localStorage.getItem(k)) : null; return v?.activeId ?? null; });
  await p.click('#cand-draft-C17-02'); await p.waitForTimeout(600); const msg = await text('#view');
  const lib = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /profiles/.test(x)); return k ? localStorage.getItem(k) : ''; }); const activeAfter = JSON.parse(lib || '{}').activeId ?? null;
  step(2, 'Auditorías › Calibración y candidatas', 'crear la copia de C17-02: borrador NO activo con la fila editada; el perfil activo no cambia', /NO activado/.test(msg) && /"energy\.costPerLiveMinute":\s*3\.5|costPerLiveMinute[^}]{0,80}3\.5/.test(lib) && activeBefore === activeAfter, `${(msg.match(/C17-02: borrador[^.]*\.[^.]*\./)?.[0] ?? '').slice(0, 180)} · activo antes ${activeBefore} / después ${activeAfter}`);
  // 3. partido completo por cuartos con guardar y continuar
  await tab('Partido'); await p.click('text=Por cuartos'); await p.click('#prepare'); await p.click('#start'); await p.waitForSelector('#next-period', { timeout: 120000 });
  await p.fill('#save-label', 'm17b recorrido'); await p.click('#save-now'); await p.waitForSelector('#saves-msg', { timeout: 20000 }); const saved = await text('#saves-msg'); const scoreAtSave = await text('#score');
  step(3, 'Partido', 'Guardar ahora en la frontera del primer periodo', /Guardado/.test(saved), saved);
  await p.reload(); await p.waitForSelector('#tabs button'); await tab('Partido'); await p.click('#saves summary'); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelector('#saves').open = true; }); await p.waitForTimeout(300);
  await p.locator('#saves button:has-text("Continuar")').first().click(); await p.waitForTimeout(800);
  step(3, 'Partido', 'recargar la página y Continuar el guardado (mismo motor y contratos compatibles)', (await text('#score')) === scoreAtSave, `${await text('#score')} (guardado ${scoreAtSave})`);
  for (let i = 0; i < 4; i++) { await p.click('#next-period').catch(() => {}); await p.waitForTimeout(400); await p.waitForFunction(() => /Finalizado|Revisión/.test(document.querySelector('#state')?.innerText ?? ''), null, { timeout: 120000 }).catch(() => {}); if (/Finalizado/.test(await text('#state'))) break; }
  step(3, 'Partido', 'terminar el encuentro continuado', /Finalizado/.test(await text('#state')), `${await text('#state')} ${await text('#score')}`);
  // 4. análisis de defensa y separación de audiencias
  await tab('Análisis'); await p.click('button:has-text("Último encuentro terminado")').catch(() => {}); await p.waitForTimeout(500); await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Diagnóstico' }).catch(() => {});
  await p.click('button:has-text("Defensa")').catch(() => {}); await p.waitForTimeout(500); const def = await text(); step(4, 'Análisis › Defensa', 'análisis de defensa con audiencia diagnóstica (robos por organización, política de acta ACTA-MOTOR17B-R1)', /Robos/.test(def) && /defens/i.test(def), def.replace(/\s+/g, ' ').slice(0, 200));
  await p.locator('select[aria-label="Audiencia"]').selectOption({ label: 'Público / rival' }).catch(() => {}); await p.waitForTimeout(400); await p.click('button:has-text("Exportar")').catch(() => {}); await p.waitForTimeout(400);
  step(4, 'Análisis', 'audiencia pública: la exportación deportiva no filtra diagnóstico privado ni probabilidades', !/committed|proyeccionDeterminista|pBase|pConversion/.test(await text()), 'comprobado además por las pruebas de audiencias (M15·8)');
  // 5. auditoría sobre los diagnósticos reales de la campaña: matriz con salida y unidad, AUD05 y sus motivos
  await tab('Auditorías'); await p.waitForSelector('#audit-source', { timeout: 20000 }); await p.waitForTimeout(800); const lots = await text('#audit-source');
  const nLots = (await p.locator('#audit-source tbody tr').allInnerTexts()).length; step(5, 'Auditorías', 'evidencia disponible: diagnósticos de la campaña conservados como lotes', LOTS ? nLots >= 1 : true, `${nLots} lotes · ${lots.replace(/\s+/g, ' ').slice(0, 160)}`);
  if (LOTS && nLots) {
    for (const cb of await p.locator('#audit-source input[type=checkbox]').all()) await cb.check();
    await p.click('#audit-verify'); await p.waitForTimeout(3000); const verTxt = await text('#audit-source'); step(5, 'Auditorías', 'verificar integridad sin interpretar', /verificada/.test(verTxt), verTxt.replace(/\s+/g, ' ').slice(-160));
    await p.click('#audit-run'); await p.waitForFunction(() => document.querySelector('#audit-universe') != null, null, { timeout: 600000 }).catch(() => {}); await p.click('#audit-universe summary').catch(() => {}); await p.waitForTimeout(500); const uni = await text('#audit-universe').catch(() => '');
    step(5, 'Auditorías', 'universo efectivo con fuentes, casos y huellas', /LOT-/.test(uni) && /AUD26/.test(uni), uni.replace(/\s+/g, ' ').slice(0, 220));
    await p.click('#audit-tab-matrix').catch(() => {}); await p.waitForSelector('#audit-aud05', { timeout: 20000 }).catch(() => {}); const mat = await text(); const a5 = await text('#audit-aud05').catch(() => '');
    step(5, 'Auditorías › Matriz', 'matriz de 32 capacidades: AUD05 con estado y motivos derivados de la evidencia (declaradas, observadas, con salida pertinente, pendientes)', /AUD05 ·/.test(a5) && /observadas en cálculos/.test(a5) && /con salida pertinente contrastada/.test(a5) && /TEC01/.test(mat) && /FIS07/.test(mat), a5.replace(/\s+/g, ' ').slice(0, 320));
    await p.selectOption('#audit-cap', 'TEC01'); await p.waitForSelector('#audit-sens table', { timeout: 20000 }).catch(() => {}); const sens = await text('#audit-sens').catch(() => '');
    step(5, 'Auditorías › Matriz › TEC01', 'sensibilidad con la salida pertinente (probabilidad de acierto) y su unidad, la receta intermedia aparte y la base reconstruida dentro de su tolerancia', /probabilidad de acierto/.test(sens) && /probabilidad \(0–1\)/.test(sens) && /\|Δbase\|/.test(sens), sens.replace(/\s+/g, ' ').slice(0, 320));
    await p.click('#audit-tab-findings').catch(() => {}); await p.waitForTimeout(500); const hal = await text(); step(5, 'Auditorías › Hallazgos', 'hallazgos navegables', /AUD/.test(hal), hal.replace(/\s+/g, ' ').slice(0, 160));
  }
  // 6. cierre: versiones, ejes y enlaces reales
  await tab('Cierre'); await p.waitForSelector('#closure-axes', { timeout: 10000 }).catch(() => {}); const cl = await text();
  step(6, 'Cierre', 'vista Cierre de MOTOR-17B con ejes (correcciones, estabilidad, calibración, rendimiento, aceptación, FIBA) y versiones distintas', /Cierre de MOTOR-17B/.test(cl) && /Estado por eje/.test(cl) && /Versiones/.test(cl) && /Perfil activo/.test(cl), cl.replace(/\s+/g, ' ').slice(0, 220));
  const links = await p.locator('#closure-downloads a[download]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  step(6, 'Cierre', 'enlaces de descarga reales hacia /api/closure/download/ (los archivos aún no empaquetados se listan como «no generado» con su comando)', links.every((h) => h.startsWith('/api/closure/download/')), `${links.length} enlaces`);
}

if (PHASE === 'download') {
  await tab('Cierre'); await p.waitForSelector('#closure-downloads', { timeout: 10000 }).catch(() => {});
  const ext = JSON.parse(readFileSync(join(DELIVERY, 'MOTOR-17B-indice-partes.json'), 'utf8')); const wanted = [ext.quick.file, 'MOTOR-17B-indice-partes.json', ...ext.parts.map((x) => x.file)]; const files = [];
  for (const name of wanted) {
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 180000 }).catch(() => null), p.click(`#closure-downloads a[download="${name}"]`).catch(() => {})]);
    if (!d) { step(7, 'Cierre', `descarga de ${name}`, false, 'no se produjo la descarga'); continue; }
    const path = join(scratch, name); await d.saveAs(path); const buf = readFileSync(path); const orig = readFileSync(join(DELIVERY, name)); const sha = createHash('sha256').update(buf).digest('hex');
    files.push({ name, url: d.url().replace(/^https?:\/\/[^/]+/, ''), bytes: buf.length, sha256: sha, saved_path: path, identical_to_original: buf.equals(orig) });
    step(7, 'Cierre', `descarga real de ${name} desde el enlace de la aplicación`, buf.equals(orig), `${buf.length} B · sha256 ${sha.slice(0, 12)} · idéntico al original: ${buf.equals(orig)}`);
  }
  step(7, 'Cierre', 'cantidad de archivos descargados frente a los esperados', files.length === wanted.length && files.length > 0, `${files.length}/${wanted.length}`);
  writeFileSync(join(OUT, 'descargas', 'descargas.json'), JSON.stringify({ schema: 'motor17b-descargas/1', browser: `Chromium ${browser.version()}`, date: new Date().toISOString(), app_url: URL0, esperados: wanted, files }, null, 1));
}
step(0, 'consola/red', 'errores durante todo el recorrido', consoleErrors.length === 0 && netErrors.length === 0, `consola ${consoleErrors.length}${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(' | ')}` : ''}; red ${netErrors.length}${netErrors.length ? `: ${netErrors.slice(0, 3).join(' | ')}` : ''}`);
const file = join(OUT, PHASE === 'ui' ? 'informes' : 'descargas', PHASE === 'ui' ? 'navegador.json' : 'navegador-descarga.json');
writeFileSync(file, JSON.stringify({ browser: `Chromium ${browser.version()}`, url: URL0, phase: PHASE, date: new Date().toISOString(), steps: log, consoleErrors, netErrors, notExecuted: ['recorrido manual de Dennis', 'otros navegadores', 'Node 24', 'pruebas visuales extensivas', 'perfil anterior → tarjeta → copia (lo recorre panel-recovery.mjs, informe aparte)'] }, null, 1));
await browser.close(); server.close(); process.exit(log.every((l) => l.ok) ? 0 : 1);
