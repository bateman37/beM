// MOTOR-18C: identidad exacta del encuentro aplicado (C18-01) y pertenencia a la copia activa (C18-02). Cuatro escenarios sobre los consumidores reales (tarjeta posterior al partido y su manejador, activación de copia,
// núcleo de aprendizaje) en un DOM mínimo. Los valores esperados están escritos aquí (cadenas y estados), no obtenidos de la misma función que se comprueba. Los fixtures parten de nivel 12: un nivel ya en 30 no probaría que se aplicó.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runScenarios, M, store, makeCopy, activate, resultFor, view, apply, byId, registered, snap } from './m18c-fixture.js';

const R = runScenarios();
const rows = (c, sub) => R.identity.filter((x) => x.case === c && (sub == null || x.sub === sub || (sub instanceof RegExp && sub.test(x.sub))));

test('T18C-01 M10, M11 y M100 no bloquean M1; la aplicación vigente de M1 al equipo correcto sí se reconoce (manejador real de la tarjeta)', () => {
  for (const k of ['T18C-01']) assert.equal(R.errors[k], undefined, `el escenario {k} no debe lanzar: ${R.errors[k]}`);
  for (const other of [10, 11, 100]) {
    for (const t of ['EQ01', 'EQ02']) {
      const [seen] = rows('T18C-01', `M1 con M${other} aplicado: botón`).filter((x) => x.team === t); assert.equal(seen.accepted, true, `M${other}/${t}: el botón de M1 sigue habilitado`);
      const [applied] = rows('T18C-01', `M1 aplicado tras M${other}`).filter((x) => x.team === t); assert.equal(applied.accepted, true, `M${other}/${t}: M1 se aplica`);
      assert.deepEqual(applied.registered.filter((a) => a.status === 'aplicada').map((a) => a.source_id), [`${applied.match.replace(/M1$/, `M${other}`)}|${t}`, `${applied.match}|${t}`], 'quedan las dos fuentes completas, distintas');
      const [again] = rows('T18C-01', `M1 ya aplicado tras M${other}`).filter((x) => x.team === t); assert.equal(again.accepted, false); assert.equal(again.state_unchanged, true); assert.match(again.reason, /botón deshabilitado; manejador: EQ01: ya aplicado · EQ02: ya aplicado/);
    }
  }
  // equipo y recibo vigente: revertir M1 solo en EQ02 reabre solo EQ02; el registro revertido no cuenta como aplicación vigente
  const [u] = rows('T18C-01', 'equipo y recibo revertido').filter((x) => x.team === 'EQ02'); assert.equal(u.accepted, true); assert.match(u.reason, /EQ01: ya aplicado · EQ02: aplicado \(APL-4\)/);
  assert.deepEqual(u.registered.map((a) => `${a.id}:${a.status}`), ['APL-1:aplicada', 'APL-2:revertida', 'RST-3:restauracion', 'APL-4:aplicada']);
  // tabla pura del encargo (§3.3): el helper compartido decide por igualdad exacta de la fuente completa, equipo y estado vigente
  const led = (...apps) => ({ applications: apps.map(([source_id, teamInstance, status]) => ({ source_id, teamInstance, status })) });
  for (const [reg, exp] of [[['A|M10|EQ01', 'EQ01', 'aplicada'], false], [['A|M11|EQ01', 'EQ01', 'aplicada'], false], [['A|M100|EQ01', 'EQ01', 'aplicada'], false], [['A|M1|EQ01', 'EQ01', 'aplicada'], true], [['A|M1|EQ01', 'EQ01', 'revertida'], false]]) assert.equal(M.isMatchApplied(led(reg), 'A|M1', 'EQ01'), exp, reg.join());
  assert.equal(M.isMatchApplied(led(['A|M1|EQ01', 'EQ01', 'aplicada']), 'A|M1', 'EQ02'), false, 'el registro de EQ01 no acredita EQ02');
  assert.equal(M.isMatchApplied(led(['A|M1|EQ01', 'EQ02', 'aplicada']), 'A|M1', 'EQ01'), false, 'un registro de otra instancia no cuenta');
});

test('T18C-02 un resultado de la copia A no se propone ni se aplica a B con los mismos equipos; I1/I10 no introducen otro prefijo ambiguo', () => {
  for (const k of ['T18C-02', 'T18C-02b']) assert.equal(R.errors[k], undefined, `el escenario {k} no debe lanzar: ${R.errors[k]}`);
  const TEXT = 'Este partido pertenece a otra copia de aprendizaje. No se puede aplicar a la copia activa.';
  for (const [key, f] of Object.entries(R.foreign)) {
    assert.equal(f.applyPresent, false, `${key}: sin aplicación activa`); assert.equal(f.seePresent, false, `${key}: sin propuesta`); assert.equal(f.noticePresent, true); assert.match(f.text, new RegExp(TEXT.replace(/[.]/g, '\\.')));
    assert.equal(f.unchanged, true, `${key}: no se adoptan metadatos ni se persiste nada de esa copia (estado idéntico)`); assert.equal(f.belongs.ok, false);
    assert.ok(f.text.includes(f.copies[0]) && f.text.includes(f.copies[1]), `${key}: el detalle muestra ambas identidades`);
  }
  assert.deepEqual(Object.keys(R.foreign), ['I11-I12', 'I10-I1', 'I1-I10']);
  // el prefijo ingenuo habría aceptado I10 sobre I1 (y lo contrario no): la igualdad exacta rechaza ambos sentidos
  assert.ok('X-I10|M1'.startsWith('X-I1'), 'premisa: startsWith(copy.id) confunde I10 con I1');
  assert.equal(M.matchBelongsToCopy('X-I10|M1', 'X-I1').ok, false); assert.equal(M.matchBelongsToCopy('X-I1|M1', 'X-I10').ok, false); assert.equal(M.matchBelongsToCopy('X-I1|M1', 'X-I1').ok, true);
  assert.deepEqual(M.parseMatchId('X-I1|M12'), { ok: true, matchId: 'X-I1|M12', copyId: 'X-I1', seq: 12 }); assert.equal(M.parseMatchId('a|M5|M7').copyId, 'a|M5');
  for (const [bad, p] of Object.entries(R.malformed)) { assert.equal(p.parsed.ok, false, `«${bad}»`); assert.ok(p.parsed.reason.length > 10); assert.equal(p.applyPresent, false); assert.equal(p.unchanged, true); }
  // la copia propia sí obtiene la tarjeta con aplicación (control del propio test)
  const L = activate(makeCopy(50)); assert.ok(apply(view(resultFor(`${L.copy.id}|M1`, L.copy))), 'copia propia: botón presente');
});

test('T18C-03 un manejador creado para A y activado B antes de invocarlo se rechaza sin cambiar el estado ni los registros de ninguna copia', () => {
  for (const k of ['T18C-03']) assert.equal(R.errors[k], undefined, `el escenario {k} no debe lanzar: ${R.errors[k]}`);
  const s = R.stale; assert.equal(s.switchedToB.accepted, false); assert.equal(s.switchedToB.retainedCopyUnchanged, true, 'la copia A retenida por el cierre no se escribe'); assert.equal(s.switchedToB.activeCopyUnchanged, true, 'la copia B activa no se escribe');
  assert.equal(s.switchedToB.repaints, 1, 'el rechazo se muestra (repintado), no se ignora');
  for (const t of ['EQ01', 'EQ02']) { const [r] = rows('T18C-03').filter((x) => x.team === t); assert.equal(r.accepted, false); assert.deepEqual(r.registered, [], 'ningún recibo en B'); }
  const S = R.states.T18C_03; assert.deepEqual(S.copyA_after, S.copyA_before); assert.deepEqual(S.copyB_after, S.copyB_before);
  for (const t of ['EQ01', 'EQ02']) { assert.equal(S.copyA_after.ledgers[t].applications.length, 0); assert.equal(S.copyB_after.ledgers[t].applications.length, 0); }
  assert.match(s.restoredA.message, /^No aplicado: Este partido pertenece a otra copia de aprendizaje/); assert.equal(s.restoredA.messageClass, 'pill bad', 'ningún mensaje de éxito aparente'); assert.equal(s.restoredA.belongs, true); assert.equal(s.restoredA.applyEnabled, true, 'la copia propia restaurada conserva su aplicación');
  assert.equal(s.noActiveCopy.rejected, true); assert.equal(s.noActiveCopy.stateIsNull, true, 'sin copia activa el manejador tampoco escribe');
});

test('T18C-04 en la copia correcta se aplica una vez, se rechaza la repetición, se deshace y se conserva el comportamiento al restaurar la misma copia', () => {
  for (const k of ['T18C-04']) assert.equal(R.errors[k], undefined, `el escenario {k} no debe lanzar: ${R.errors[k]}`);
  const o = R.ok4; const S = R.states.T18C_04;
  assert.match(o.first.message, /^EQ01: aplicado \(APL-1\) · EQ02: aplicado \(APL-1\)$/);
  for (const t of ['EQ01', 'EQ02']) {
    assert.ok(o.first.changed[t] > 0, `${t}: el aprendizaje cambió niveles de verdad (fixture con margen, no 30)`);
    assert.deepEqual(o.first.applied[t].map((a) => a.source_id), [`LEARN18-S-EQ01-EQ02-d0-I31|M1|${t}`]); assert.deepEqual(o.first.applied[t].map((a) => a.status), ['aplicada']);
    const used = Object.values(o.first.matchBudgetUsed[t])[0]; assert.deepEqual(used, { position: 1, offensiveRole: 1, defensiveRole: 1, tactic: 1 }, 'presupuesto de experiencia consumido: 1 por dominio y día (40 minutos vivos)');
    assert.notEqual(S.after_apply.fingerprints[t], S.before.fingerprints[t]);
    for (const pid of Object.keys(S.before.learning[t].players)) { assert.deepEqual(S.before.learning[t].players[pid].ledger.match.used, {}); assert.deepEqual(S.after_apply.learning[t].players[pid].ledger.match.used, { position: 1, offensiveRole: 1, defensiveRole: 1, tactic: 1 }); }
  }
  assert.equal(o.disabledAfter, true); assert.equal(o.repeatMessage, 'EQ01: ya aplicado · EQ02: ya aplicado'); assert.equal(o.repeatUnchanged, true, 'la repetición no cambia nada');
  assert.equal(o.coreRejectsDuplicate.ok, false); assert.match(o.coreRejectsDuplicate.reason, /ya se aplicó a la instancia EQ01 \(APL-1\)/);
  assert.equal(o.restored.copyId, 'LEARN18-S-EQ01-EQ02-d0-I31'); assert.equal(o.restored.belongs, true, 'la identidad persistida sigue siendo válida tras serializar/restaurar'); assert.equal(o.restored.applyDisabled, true, 'la aplicación vigente se reconoce en la copia restaurada');
  assert.equal(o.undo.ok, true); assert.equal(o.undo.fingerprintsRestored, true, 'deshacer restaura las huellas previas'); assert.deepEqual(S.after_undo.fingerprints, S.before.fingerprints);
  for (const t of ['EQ01', 'EQ02']) assert.deepEqual(o.undo.statuses[t].map((a) => `${a.id}:${a.status}`), ['APL-1:revertida', 'RST-2:restauracion']);
  assert.equal(o.reapplyEnabled, true, 'política vigente: una fuente revertida vuelve a ser aplicable'); assert.deepEqual(o.reapply.EQ01.map((a) => `${a.id}:${a.status}`), ['APL-1:revertida', 'RST-2:restauracion', 'APL-3:aplicada']);
  // la identidad de la copia no depende de la referencia en memoria
  const L = activate(makeCopy(60)); const copy2 = M.deserializeLearning(M.serializeLearning(L)); assert.notEqual(copy2.copy, L.copy); assert.equal(M.matchBelongsToCopy(`${L.copy.id}|M3`, copy2.copy.id).ok, true);
  assert.equal(store.learn.copy.id, L.copy.id); assert.deepEqual(registered(L, 'EQ01'), []); assert.equal(typeof snap(L), 'string');
});
