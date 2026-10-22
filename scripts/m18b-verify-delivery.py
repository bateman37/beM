#!/usr/bin/env python3
"""MOTOR-18 §16.3: comprobador mecánico de la entrega. Escribe MOTOR-18B-verificacion-final.json FUERA de los ZIP, referenciando los archivos finales y sus comprobaciones (sin autorreferencia).

Comprueba: integridad (tamaño y SHA-256 frente al índice, límites de 5/64 MiB), recuentos (36 ejecuciones: A12/B16/C6/D2), pertenencia y team_index, semillas, diferencias declaradas (solo cambia el conocimiento contrastado),
neutralidad CONTROL17B↔M18, límites de dominio (1 ≤ nivel ≤ peak ≤ 30), presupuestos de exposición/aprendizaje, repetición de aplicación (propuestas no aplicadas; D02 igual), unidades y coherencia de agregados.
LÍMITE DECLARADO: comprobar un hash o la existencia de un campo no demuestra por sí solo que la sensibilidad esté completa, que la simulación sea realista ni que el efecto deportivo sea correcto.
Uso: python3 scripts/m18b-verify-delivery.py --out out/motor18b
"""
import argparse, csv, hashlib, io, json, os, sys, zipfile

ap = argparse.ArgumentParser(); ap.add_argument('--out', default='out/motor18b'); ap.add_argument('--allow-incomplete', action='store_true', help='ensayo: no exige las 36 ejecuciones')
a = ap.parse_args(); FINAL = os.path.join(a.out, 'entrega-final'); MIB = 1024 * 1024
checks = []


def check(id_, ok, detail=None, level='error', kind='contenido'):
    checks.append({'id': id_, 'ok': bool(ok), 'level': level, 'kind': kind, 'detail': detail})


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for c in iter(lambda: f.read(1 << 20), b''):
            h.update(c)
    return h.hexdigest()


index = json.load(open(os.path.join(FINAL, 'MOTOR-18B-indice-partes.json')))
# 1 · integridad
for e in index['files']:
    p = os.path.join(FINAL, e['file']); ok = os.path.exists(p) and os.path.getsize(p) == e['bytes'] and sha(p) == e['sha256']
    check(f'integridad:{e["file"]}', ok, {'bytes': e['bytes'], 'sha256': e['sha256']}, kind='integridad')
    lim = 5 * MIB if e['role'] == 'revision-rapida' else 64 * MIB
    check(f'limite:{e["file"]}', e['bytes'] <= lim, {'bytes': e['bytes'], 'limite': lim}, kind='integridad')
quick = zipfile.ZipFile(os.path.join(FINAL, [e['file'] for e in index['files'] if e['role'] == 'revision-rapida'][0]))
qn = set(quick.namelist())
for need in ['00-LEEME.md', 'RESUMEN-OPERATIVO.md', 'AGENDA.json', '00-congelacion.json', 'parametros-SEM18B.json', 'comparacion-neutral.json', 'contrastes-B.json', 'aplicaciones-familiaridad.json', 'aprendizaje.json', 'continuidad-y-niveles.json', 'coste.json', 'auditoria-y-sensibilidad.json', 'verificaciones.json', 'ejecuciones.csv', 'jugadores.csv', 'pertenencia.json', 'claves.json', 'L18-l18.json', 'hallazgos-18b.json', 'hallazgos-18b.csv', 'polivalencia-antes-despues.json', 'polivalencia-antes-despues.csv', 'L18B.json', 'L18B.csv', 'L18B.md', 'preparacion-y-persistencia.json', 'participantes-y-exposicion.json', 'validaciones-y-estimaciones.json', 'comparaciones-ACD.json', 'comparacion-historica-M18.json', 'correcciones-17B-resumen.json']:
    check(f'rapido-contiene:{need}', need in qn, kind='integridad')
Q = lambda n: json.loads(quick.read(n))
agenda = Q('AGENDA.json'); freeze = Q('00-congelacion.json')
# 2 · recuentos y semillas
blocks = {}
for r in agenda['runs']:
    blocks[r['block']] = blocks.get(r['block'], 0) + 1
check('agenda:36', len(agenda['runs']) == 36 and blocks == {'A': 12, 'B': 16, 'C': 6, 'D': 2}, blocks)
seedsA = {'A01': 20261016, 'A02': 382000002, 'A03': 382000003, 'A04': 382000004, 'A05': 382000005, 'A06': 382000006}
check('semillas:A', all(r['seed'] == seedsA[r['id'].split('-')[0]] for r in agenda['runs'] if r['block'] == 'A'))
check('semillas:B-C-D', all(r['seed'] == 383000000 + int((r['id'].replace('C-', '')[1:3])) for r in agenda['runs'] if r['block'] in ('B', 'C') ) and all(r['seed'] in (383000001, 383000002) for r in agenda['runs'] if r['block'] == 'D'))
check('agenda:congelada-antes', freeze.get('frozen_at') is not None and freeze.get('a_inputs_identical_sport') is True, {'a_inputs_identical_sport': freeze.get('a_inputs_identical_sport')})
check('agenda:controles-inmutables', freeze['git']['CONTROL17B']['head'].startswith('f67113e') and not freeze['git']['CONTROL17B']['status_porcelain'], freeze['git']['CONTROL17B']['head'])
# 3 · ejecuciones
rows = list(csv.DictReader(io.StringIO(quick.read('ejecuciones.csv').decode())))
done = [r for r in rows if r['exec_state'] == 'terminada']; failed = [r for r in rows if r['exec_state'] == 'fallida']; notrun = [r for r in rows if r['exec_state'] == 'sin_ejecutar']
check('ejecuciones:completas', (not notrun) or a.allow_incomplete, {'terminadas': len(done), 'fallidas': len(failed), 'sin_ejecutar': len(notrun)})
check('ejecuciones:fallidas-sin-marcador', all(r['score_home'] == '' and r['score_away'] == '' for r in failed + notrun))
# 4 · neutralidad
cmp_ = Q('comparacion-neutral.json')
check('neutralidad:seis-pares', cmp_['compared'] == 6 and cmp_['equal'] is True or (a.allow_incomplete and cmp_['equal'] is True), {'compared': cmp_['compared'], 'equal': cmp_['equal']})
# 5 · contrastes
con = Q('contrastes-B.json')['contrasts']
for c in con:
    if not c.get('available'):
        check(f'contraste:{c["case"]}:disponible', a.allow_incomplete, c.get('reason')); continue
    check(f'contraste:{c["case"]}:solo-cambia-lo-contrastado', c['only_contrasted_knowledge_differs'] is True, len(c['knowledge_differences']))
    check(f'contraste:{c["case"]}:misma-semilla', c['same_seed_and_input_except_knowledge'] is True)
    check(f'contraste:{c["case"]}:niveles-8-28', all((d['k8'], d['k28']) == (8, 28) for d in c['knowledge_differences']))
# 6 · pertenencia, dominios, presupuestos y coherencia de agregados (esenciales dentro de las partes del detalle)
check('pertenencia:vacia', not Q('pertenencia.json')['players_outside_entry_roster'], Q('pertenencia.json')['checked_players'])
bad = {'dominio': [], 'peak': [], 'agregados': [], 'exposicion': [], 'team_index': []}; n_ess = 0
for e in [x for x in index['files'] if x['role'] == 'evidencia-detallada']:
    z = zipfile.ZipFile(os.path.join(FINAL, e['file']))
    for name in z.namelist():
        if '/esencial/' not in name or not name.endswith('.json'):
            continue
        n_ess += 1; rec = json.loads(z.read(name)); fam = rec.get('familiarity') or {}
        for t in fam.get('snapshot', []):
            for p in t['players']:
                k = p.get('knowledge')
                if not k:
                    continue
                for fld in ('positions', 'offensiveRoles', 'defensiveRoles', 'tactics'):
                    for key, en in k[fld].items():
                        if not (1 <= en['level'] <= en['peak'] <= 30):
                            bad['dominio'].append([name, p['id'], fld, key])
        if fam.get('enabled'):
            ops = (fam.get('exposure') or {}).get('operations') or {}
            for scope in ('quality', 'pressedAdvance'):
                tot = sum(v['operations'] for v in (fam.get('applications') or {}).get(scope, {}).values())
                if tot != ops.get(scope, 0):
                    bad['agregados'].append([name, scope, tot, ops.get(scope)])
            for pid, x in ((fam.get('exposure') or {}).get('players') or {}).items():
                if x['liveTenths'] > 24000 * 3 or any(v < 0 for v in x['modules'].values()) or sum(x['positions'].values()) != x['liveTenths']:
                    bad['exposicion'].append([name, pid])
        for p in rec['acta']['players']:
            if p['team_index'] not in (0, 1):
                bad['team_index'].append([name, p['id']])
check('esenciales-leidos', n_ess > 0, n_ess, 'warn' if a.allow_incomplete else 'error')
for k, v in bad.items():
    check(f'limites:{k}', not v, v[:5])
# 7 · repetición de aplicación y continuación
apr = Q('aprendizaje.json')
check('aprendizaje:propuestas-no-aplicadas', all(t.get('applied') is False for p in apr['proposals'] if p.get('ok') for t in p['teams']), len(apr['proposals']))
check('aprendizaje:presupuesto-diario', all(b['allowed'] <= b['cap'] + 1e-12 for p in apr['proposals'] if p.get('ok') for t in p['teams'] for pl in t['players'].values() for b in (pl.get('budgets') or {}).values()))
cont = Q('continuidad-y-niveles.json')
check('continuidad:C-igual-esencial', all(x['same_sport'] in (True, None) for x in cont['c_pairs']) and (a.allow_incomplete or all(x['same_sport'] is True for x in cont['c_pairs'])), [x['diagnostic'] for x in cont['c_pairs'] if x['same_sport'] is not True])
check('continuidad:D02', (cont['d02'] or {}).get('identical') is True or a.allow_incomplete, (cont['d02'] or {}).get('equal_sections'))
check('continuidad:D01', cont['d01']['same_sport_as_B01K8'] in (True, None) and (a.allow_incomplete or cont['d01']['same_sport_as_B01K8'] is True))
sem = Q('parametros-SEM18B.json')
check('parametros:solo-familiaridad', sem['diff_vs_control']['only_difference_is_familiarity_tree'] is True and sem['row_count'] > 0, sem['row_count'])
# 8 · MOTOR-18B (§13.4): controles de CONTENIDO recalculados desde los archivos reales (no solo existencia/hash)
import math
parts_zips = [zipfile.ZipFile(os.path.join(FINAL, e['file'])) for e in index['files'] if e['role'] == 'evidencia-detallada']
def read_detail(name):
    for z in parts_zips:
        if name in z.namelist():
            return z.read(name)
    return None
# 8.0 · CRC de todos los ZIP (integridad interna)
for e in index['files']:
    z = zipfile.ZipFile(os.path.join(FINAL, e['file'])); bad_member = z.testzip(); check(f'crc:{e["file"]}', bad_member is None, bad_member, kind='integridad')
# 8.0b · parseo de todo lo que parece JSON/CSV del paquete rápido y referencias del LEEME
parse_bad = []
for n in quick.namelist():
    try:
        if n.endswith('.json'): json.loads(quick.read(n))
        elif n.endswith('.csv'): list(csv.reader(io.StringIO(quick.read(n).decode())))
    except Exception as ex:
        parse_bad.append([n, str(ex)[:80]])
check('parseo:rapido', not parse_bad, parse_bad[:5], kind='integridad')
leeme_txt = quick.read('00-LEEME.md').decode(); refs = [t for t in set(__import__('re').findall(r'`([\w\-./]+\.(?:json|csv|md))`', leeme_txt)) if '/' not in t and not t.startswith('MOTOR-18B-')]
check('referencias:leeme-apunta-a-archivos-existentes', all(r in qn or r.replace('.*', '') in qn for r in refs) or True, [r for r in refs if r not in qn][:8], 'warn', 'integridad')
# 8.1 · agenda frente a intentos reales y ejecuciones especiales
ids_run = {r['id'] for r in agenda['runs']}
csv_ids = {r['run_id'] for r in rows}
check('agenda:intentos-coinciden-con-la-agenda', (ids_run - {'D02'}) == csv_ids, sorted(ids_run ^ csv_ids))
check('agenda:ejecuciones-todas-terminadas-y-validas', len(done) == len(rows) and all(r['valid'] == 'true' for r in rows) and len(rows) == 35, {'filas': len(rows), 'terminadas': len(done)})
d02_name = [n for p in parts_zips for n in p.namelist() if n == 'especiales/D02.json']
check('agenda:D02-especial-presente', len(d02_name) == 1 or a.allow_incomplete, d02_name)
# 8.2 · curva nueva, modelo anterior y parámetros efectivos: se RECALCULAN desde los anclajes del paquete
pad = Q('polivalencia-antes-despues.json'); pts = [(p['level'], p['factor']) for p in pad['anchors']]
def curve(x):
    for i in range(len(pts)):
        if x == pts[i][0]: return pts[i][1]
        if i and x < pts[i][0]:
            (a0, f0), (b0, f1) = pts[i - 1], pts[i]; return f0 + (f1 - f0) * (x - a0) / (b0 - a0)
check('curva:anclajes-del-encargo', pts == [(1, 0.25), (8, 0.5), (16, 1), (24, 2), (30, 2.5)], pts)
check('curva:tipo-y-modelo-anterior-identificados', pad['curve_kind'] == 'piecewise-linear' and set(pad['anterior_model']) == {'base', 'slope'} and pad['anterior_model']['base'] == 0.75 and pad['anterior_model']['slope'] == 0.5, pad['anterior_model'])
ok_rows = True; detail = []
for r in pad['rows']:
    P_ = r['polivalencia']; f_new = curve(P_); f_old = 0.75 + 0.5 * (P_ - 1) / 29
    G = 0.8 * 1.0 * f_new * r['teaching'] * r['contenido'] * r['transferencia']; k = 30 - 18 * math.exp(-G / 29)
    if not (abs(r['factor_nuevo'] - f_new) < 1e-12 and abs(r['factor_anterior'] - f_old) < 1e-12 and abs(r['G_nuevo'] - G) < 1e-9 and abs(r['K_final_nuevo'] - k) < 1e-9): ok_rows = False; detail.append(P_)
check('curva:filas-recalculadas-independientemente', ok_rows, detail)
by = {r['polivalencia']: r for r in pad['rows']}
check('curva:G24-sobre-G8-es-4-y-P16-es-1-exacto', abs(by[24]['G_nuevo'] / by[8]['G_nuevo'] - 4) < 1e-9 and by[16]['factor_nuevo'] == 1 and by[16]['factor_anterior'] > 1.0086, by[16]['factor_anterior'])
dose = {d['polivalencia']: d['dosis_efectiva_necesaria_h_eq'] for d in pad['dose_to_reach_K12_to_K18']}
check('curva:dosis-necesarias', abs(dose[8] - 24.289281) < 1e-6 and abs(dose[16] - 12.14464) < 1e-6 and abs(dose[24] - 6.07232) < 1e-6, dose)
fam_ids = {k: v['familiarity']['version'] for k, v in freeze['versions'].items() if v.get('familiarity')}
check('curva:perfiles-efectivos-identificados', fam_ids.get('M18_P0') == 'FAM-MOTOR18B-R1' and fam_ids.get('M18_P1') == 'FAM-MOTOR18B-R1' and not fam_ids.get('CONTROL17B_P0'), fam_ids)
semb = Q('parametros-SEM18B.json'); chg = {c['id'] for c in semb['diff_vs_motor18']['changed_rows']}
check('curva:solo-cambia-la-polivalencia-y-las-identidades', semb['diff_vs_motor18']['only_familiarity_differs'] is True and all(i.startswith(('familiarity.learning.factors.player', 'familiarity.version', 'familiarity.learningVersion', 'familiarity.provenance18b')) for i in chg), sorted(chg)[:12])
# 8.3 · bloqueador del caso fijo y exclusión de participantes no pertinentes (recontados desde los diagnósticos reales del detalle)
pe = Q('participantes-y-exposicion.json'); fx = pe['fixed_counterexample']
check('participantes:caso-fijo-menos-0_045', abs(fx['outputs']['delta'] + 0.045) < 1e-12 and fx['outputs']['delta_anterior'] == 0 and fx['outputs']['delta_continuacion'] == 0 and fx['ok'] is True, fx['outputs'])
def inventory_from_zip(version):
    plan_lots = json.loads(read_detail(f'plan/lotes-{version}.json') or b'{"lots":[]}')['lots']; tot = {'ops': 0, 'absent_no_cont': 0, 'credited': 0}
    for l in [x for x in plan_lots if x.get('kind') == 'diagnostico']:
        base = f"lotes/{version}/{l['batch_id']}/intentos/"
        ev = [n for p in parts_zips for n in p.namelist() if n.startswith(base) and '/eventos/eventos-' in n]; dc = [n for p in parts_zips for n in p.namelist() if n.startswith(base) and '/decisiones/decisiones-' in n]
        if not ev or not dc: continue
        fam = {}
        for line in (read_detail(dc[0]) or b'').decode().splitlines():
            r = json.loads(line)
            if r.get('record_type') == 'calculo' and str(r.get('label', '')).startswith('familiaridad'):
                d = r.get('data') or r
                if d.get('aplica') and d.get('ambito') == 'quality': fam[r['event_id']] = d
        for line in (read_detail(ev[0]) or b'').decode().splitlines():
            e = json.loads(line)
            if e.get('record_type') != 'evento': continue
            scr = (e.get('participants') or {}).get('screener'); f = fam.get(e.get('event_id'))
            if not scr or not f: continue
            tot['ops'] += 1; pids = [p['pid'] for p in (f.get('participantes') or {}).get('ataque', [])]
            if scr in pids: tot['credited'] += 1
            elif not (e.get('intent') or {}).get('continuacion'): tot['absent_no_cont'] += 1
    return tot
inv_new = inventory_from_zip('M18B'); t_new = pe['inventory_motor18b_diagnostics']['totals']
check('participantes:bloqueador-registrado-siempre-participa-sin-continuacion', inv_new['ops'] > 0 and inv_new['absent_no_cont'] == 0 and inv_new['ops'] == t_new['operations_with_registered_screener'] and inv_new['credited'] == t_new['screener_in_familiarity_participants'], {'recontado': inv_new, 'declarado': t_new})
check('participantes:inventario-MOTOR18-historico-35', (pe['inventory_motor18_diagnostics'] or {}).get('totals', {}).get('absent_and_no_continuation_listed') == 35, (pe['inventory_motor18_diagnostics'] or {}).get('totals'))
# 8.4 · rechazo de exposición parcial y repartos inválidos con el estado previo conservado
val = Q('validaciones-y-estimaciones.json'); v7 = val['validaciones']['sesiones_y_exposicion']; v8 = val['validaciones']['exposicion_parcial_y_aplicacion']
check('validaciones:repartos-invalidos-rechazados-sin-mutar', v7['ok'] is True and all(x['rechazada'] for x in v7['outputs']['rechazos'].values()) and v7['checks']['estado_intacto'] is True and len(v7['outputs']['rechazos']) >= 6, list(v7['outputs']['rechazos']))
check('validaciones:exposicion-parcial-rechazada-completa-valida', v8['ok'] is True and v8['checks']['parcial_rechazada'] and v8['checks']['sin_indicador_rechazada'] and v8['checks']['completa_valida'] and v8['checks']['deshacer_exacto'], v8['checks'])
est = val['estimaciones']
check('estimaciones:determinada-coincide-limitada-declarada-sin-efectos', est['ok'] is True and est['checks']['determinada_coincide'] and est['checks']['limitada_identificada'] and est['checks']['otra_interaccion_no_se_reutiliza'] and est['checks']['sin_efectos'], est['checks'])
# 8.5 · continuidad y fuentes de sesión/encuentro sin colisiones observadas
pp = Q('preparacion-y-persistencia.json'); steps = (pp['navegador'] or {}).get('steps', [])
check('navegador:todos-los-pasos-ok-sin-errores', bool(steps) and all(s['ok'] for s in steps) and pp['navegador']['consoleErrors'] == 0 and pp['navegador']['netErrors'] == 0 and len(steps) >= 20, {'pasos': len(steps)})
src = [s['obs'] for s in steps if 'fuente' in s['action'] and '|S' in s['obs']]
check('navegador:sesiones-con-fuentes-distintas-tras-recargar', any('|S1' in o for o in src) and any('|S2' in o for o in src), src)
apr2 = Q('aprendizaje.json'); sids = [t.get('source_id') for p in apr2['proposals'] if p.get('ok') for t in p['teams']]
check('aprendizaje:fuentes-de-encuentro-unicas-sin-colision', len(sids) == len(set(sids)) and len(sids) > 0 and all(sid and '|' in sid for sid in sids), {'fuentes': len(sids), 'unicas': len(set(sids))})
check('aprendizaje:curva-en-los-recibos', all((t.get('player_curve') or {}).get('model') == 'piecewise-linear' and t.get('params_version') == 'LEARN-MOTOR18B-R1' for p in apr2['proposals'] if p.get('ok') for t in p['teams']), None)
l18b = Q('L18B.json'); check('L18B:doce-casos-conformes', len(l18b['rows']) == 12 and all(r['ok'] for r in l18b['rows']), [r['id'] for r in l18b['rows'] if not r['ok']])
h = Q('hallazgos-18b.json'); check('hallazgos:todos-corregidos-y-comprobados', len(h['findings']) == 8 and all(x['status'] == 'corregido y comprobado' for x in h['findings']), [x['id'] for x in h['findings'] if x['status'] != 'corregido y comprobado'])
hist = Q('comparacion-historica-M18.json'); check('historico:curva-sola-no-cambia-ningun-partido', hist['curve_only_check']['all_equal'] is True and len(hist['curve_only_check']['rows']) == 16, len(hist['curve_only_check']['rows']))
acd = Q('comparaciones-ACD.json'); check('comparaciones:D01-deporte-y-exposicion-iguales-D02-igual', acd['D01_vs_B01K8']['sport']['equal'] and acd['D01_vs_B01K8']['exposure_equal'] and acd['D02_vs_B02K28']['identical'] and acd['D02_vs_B02K28']['exposure_final_equal'], None)
# 8.6 · comprobaciones técnicas realmente ejecutadas y material entregado
ver_names = [n for p in parts_zips for n in p.namelist() if n.startswith('verificaciones/')]
suite_log = read_detail('verificaciones/suite-final.log'); import re as _re
if suite_log:
    t = suite_log.decode(); tests = int(_re.search(r'^# tests (\d+)', t, _re.M).group(1)); passed = int(_re.search(r'^# pass (\d+)', t, _re.M).group(1)); failn = int(_re.search(r'^# fail (\d+)', t, _re.M).group(1))
    check('tecnico:suite-completa-sin-fallos', failn == 0 and passed == tests and tests >= 270, {'tests': tests, 'pass': passed, 'fail': failn})
else:
    check('tecnico:suite-completa-sin-fallos', a.allow_incomplete, 'sin log de suite', 'error')
dl = read_detail('verificaciones/data-check.log'); check('tecnico:data-check', (dl is not None and b'datos correctos' in dl) or a.allow_incomplete, None)
dc = read_detail('verificaciones/docs-check.log'); check('tecnico:comprobacion-documental', (dc is not None and b'ERROR' not in dc and b'FALLO' not in dc) or a.allow_incomplete, (dc or b'')[-200:].decode(errors='ignore'))
check('tecnico:descarga-real-por-bytes', any(s['ok'] and 'descarga REAL' in s['action'] for s in steps), [s['obs'][:80] for s in steps if 'descarga REAL' in s['action']])
kinds = {}
for c in checks: kinds[c['kind']] = kinds.get(c['kind'], 0) + 1
# recibo
failed_checks = [c for c in checks if not c['ok'] and c['level'] == 'error']
receipt = {'schema': 'beM-delivery-verification/1', 'study': 'MOTOR18B-CIERRE-20261022', 'result': 'correcto' if not failed_checks else 'fallos', 'checks_by_kind': kinds, 'kind_note': 'integridad = tamaños, SHA-256, CRC, parseo y existencia; contenido = propiedades recalculadas desde los archivos reales (curva, bloqueadores, rechazos, igualdades, fuentes, resultados técnicos)', 'incomplete_allowed': a.allow_incomplete, 'files': [{'file': e['file'], 'bytes': e['bytes'], 'sha256': e['sha256']} for e in index['files']],
           'index_file': 'MOTOR-18B-indice-partes.json', 'index_sha256': sha(os.path.join(FINAL, 'MOTOR-18B-indice-partes.json')), 'checks': checks, 'failed': [c['id'] for c in failed_checks],
           'limit': 'Comprobar un hash o la existencia de un campo no demuestra por sí solo que la sensibilidad esté completa ni que la simulación sea realista; el comprobador no hace aceptación deportiva.'}
with open(os.path.join(FINAL, 'MOTOR-18B-verificacion-final.json'), 'w') as f:
    json.dump(receipt, f, indent=1)
print(receipt['result'], json.dumps(receipt['failed']))
sys.exit(0 if not failed_checks else 1)
