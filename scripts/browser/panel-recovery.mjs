// Recorrido real de Chromium (MOTOR-15 §4/§16 pasos 1–2): perfil anterior → panel accesible → recuperación explícita sin perder el original.
// Uso: node scripts/browser/panel-recovery.mjs <biblioteca-antigua.json> [puerto]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createLabServer } from '../dev-server.js';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const lib = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const port = Number(process.argv[3] ?? 5199);
const server = createLabServer().listen(port, '127.0.0.1');
const log = []; const step = (s, ok, extra = '') => { log.push({ step: s, ok, extra }); console.log(`${ok ? 'OK ' : 'FALLO'} ${s}${extra ? ' — ' + extra : ''}`); };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? undefined });
const ctx = await browser.newContext(); const page = await ctx.newPage();
const consoleErrors = []; page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); }); page.on('pageerror', (e) => consoleErrors.push(String(e)));
const netErrors = []; page.on('response', (r) => { if (r.status() >= 400) netErrors.push(`${r.status()} ${r.url()}`); });
await page.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, [lib.key, lib.value]);
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForSelector('text=Panel de ajustes');
step('navegador', true, `Chromium ${browser.version()}`);
await page.click('button:has-text("Panel de ajustes")');
await page.waitForSelector('h2:has-text("Panel de ajustes del motor")');
const bodyText = async () => page.locator('#view, body').first().innerText();
let t = await page.locator('body').innerText();
step('el panel se abre sin «No se pudo preparar el panel»', !/No se pudo preparar el panel/.test(t));
step('muestra la tarjeta de compatibilidad con identidad y módulos', /anterior al motor actual/.test(t) && /no compatible/.test(t), 'V0 activo');
const before = await page.evaluate(([k]) => JSON.parse(localStorage.getItem(k)), [lib.key]);
const v0Hash = before.versions.V0.hash;
// vistas de catálogo y perfiles accesibles
await page.click('button:has-text("Catálogo 81 + 4")'); await page.waitForTimeout(200);
step('catálogo accesible con perfil anterior', !/Error al dibujar esta vista/.test(await page.locator('body').innerText()));
await page.click('button:has-text("Perfiles")'); await page.waitForTimeout(200);
step('perfiles accesible con perfil anterior', !/Error al dibujar esta vista/.test(await page.locator('body').innerText()));
for (const tab of ['Mesa de ajustes', 'Tabla maestra', 'Vistas temáticas', 'Repertorio', 'Comparador', 'Intercambio']) {
  await page.click(`button[role=tab]:has-text("${tab}")`); await page.waitForTimeout(250);
  const tt = await page.locator('body').innerText();
  step(`pestaña ${tab} no revienta`, !/Error al dibujar esta vista|No se pudo preparar/.test(tt));
}
await page.click('button[role=tab]:has-text("Inicio")');
// recuperación explícita: candidata desde la base actual
page.on('dialog', (d) => d.accept());
await page.click('#legacy-upgrade'); await page.waitForTimeout(300);
t = await page.locator('body').innerText();
step('se crea una candidata compatible (borrador visible)', /Borrador D\d+/.test(t) || /Candidata compatible/.test(t));
const mid = await page.evaluate(([k]) => JSON.parse(localStorage.getItem(k)), [lib.key]);
step('el original V0 sigue intacto y el activo sigue siendo V0', mid.versions.V0.hash === v0Hash && mid.activeId === 'V0', `activo ${mid.activeId}`);
// activación explícita de la base actual
await page.click('button[role=tab]:has-text("Inicio")');
await page.click('#legacy-activate'); await page.waitForTimeout(300);
const after = await page.evaluate(([k]) => JSON.parse(localStorage.getItem(k)), [lib.key]);
step('activar la base actual es explícito y conserva V0', after.activeId === after.baseId && after.activeId !== 'V0' && after.versions.V0.hash === v0Hash, `activo ${after.activeId}`);
step('sin errores de consola', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
step('sin errores de red', netErrors.length === 0, netErrors.slice(0, 3).join(' | '));
console.log(JSON.stringify({ browser: browser.version(), consoleErrors, netErrors }));
await browser.close(); server.close();
process.exit(log.every((l) => l.ok) ? 0 : 1);
