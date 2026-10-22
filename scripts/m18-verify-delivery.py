#!/usr/bin/env python3
"""MOTOR-18 §16.3: comprobador mecánico de la entrega. Escribe MOTOR-18-verificacion-final.json FUERA de los ZIP, referenciando los archivos finales y sus comprobaciones (sin autorreferencia).

Comprueba: integridad (tamaño y SHA-256 frente al índice, límites de 5/64 MiB), recuentos (36 ejecuciones: A12/B16/C6/D2), pertenencia y team_index, semillas, diferencias declaradas (solo cambia el conocimiento contrastado),
neutralidad CONTROL17B↔M18, límites de dominio (1 ≤ nivel ≤ peak ≤ 30), presupuestos de exposición/aprendizaje, repetición de aplicación (propuestas no aplicadas; D02 igual), unidades y coherencia de agregados.
LÍMITE DECLARADO: comprobar un hash o la existencia de un campo no demuestra por sí solo que la sensibilidad esté completa, que la simulación sea realista ni que el efecto deportivo sea correcto.
Uso: python3 scripts/m18-verify-delivery.py --out out/motor18
"""
import argparse, csv, hashlib, io, json, os, sys, zipfile

ap = argparse.ArgumentParser(); ap.add_argument('--out', default='out/motor18'); ap.add_argument('--allow-incomplete', action='store_true', help='ensayo: no exige las 36 ejecuciones')
a = ap.parse_args(); FINAL = os.path.join(a.out, 'entrega-final'); MIB = 1024 * 1024
checks = []


def check(id_, ok, detail=None, level='error'):
    checks.append({'id': id_, 'ok': bool(ok), 'level': level, 'detail': detail})


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for c in iter(lambda: f.read(1 << 20), b''):
            h.update(c)
    return h.hexdigest()


index = json.load(open(os.path.join(FINAL, 'MOTOR-18-indice-partes.json')))
# 1 · integridad
for e in index['files']:
    p = os.path.join(FINAL, e['file']); ok = os.path.exists(p) and os.path.getsize(p) == e['bytes'] and sha(p) == e['sha256']
    check(f'integridad:{e["file"]}', ok, {'bytes': e['bytes'], 'sha256': e['sha256']})
    lim = 5 * MIB if e['role'] == 'revision-rapida' else 64 * MIB
    check(f'limite:{e["file"]}', e['bytes'] <= lim, {'bytes': e['bytes'], 'limite': lim})
quick = zipfile.ZipFile(os.path.join(FINAL, [e['file'] for e in index['files'] if e['role'] == 'revision-rapida'][0]))
qn = set(quick.namelist())
for need in ['00-LEEME.md', 'RESUMEN-OPERATIVO.md', 'AGENDA.json', '00-congelacion.json', 'parametros-SEM18.json', 'comparacion-neutral.json', 'contrastes-B.json', 'aplicaciones-familiaridad.json', 'aprendizaje.json', 'continuidad-y-niveles.json', 'coste.json', 'auditoria-y-sensibilidad.json', 'verificaciones.json', 'ejecuciones.csv', 'jugadores.csv', 'pertenencia.json', 'claves.json', 'L18-l18.json']:
    check(f'rapido-contiene:{need}', need in qn)
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
check('aprendizaje:propuestas-no-aplicadas', all(p.get('applied') is False for p in apr['proposals'] if p.get('ok')), len(apr['proposals']))
check('aprendizaje:presupuesto-diario', all(b['allowed'] <= b['cap'] + 1e-12 for p in apr['proposals'] if p.get('ok') for pl in p['players'].values() for b in (pl.get('budgets') or {}).values()))
cont = Q('continuidad-y-niveles.json')
check('continuidad:C-igual-esencial', all(x['same_sport'] in (True, None) for x in cont['c_pairs']) and (a.allow_incomplete or all(x['same_sport'] is True for x in cont['c_pairs'])), [x['diagnostic'] for x in cont['c_pairs'] if x['same_sport'] is not True])
check('continuidad:D02', (cont['d02'] or {}).get('identical') is True or a.allow_incomplete, (cont['d02'] or {}).get('equal_sections'))
check('continuidad:D01', cont['d01']['same_sport_as_B01K8'] in (True, None) and (a.allow_incomplete or cont['d01']['same_sport_as_B01K8'] is True))
sem = Q('parametros-SEM18.json')
check('parametros:solo-familiaridad', sem['diff_vs_control']['only_difference_is_added_familiarity_tree'] is True and sem['row_count'] > 0, sem['row_count'])
# recibo
failed_checks = [c for c in checks if not c['ok'] and c['level'] == 'error']
receipt = {'schema': 'beM-delivery-verification/1', 'study': 'MOTOR18-CIERRE-20261021', 'result': 'correcto' if not failed_checks else 'fallos', 'incomplete_allowed': a.allow_incomplete, 'files': [{'file': e['file'], 'bytes': e['bytes'], 'sha256': e['sha256']} for e in index['files']],
           'index_file': 'MOTOR-18-indice-partes.json', 'index_sha256': sha(os.path.join(FINAL, 'MOTOR-18-indice-partes.json')), 'checks': checks, 'failed': [c['id'] for c in failed_checks],
           'limit': 'Comprobar un hash o la existencia de un campo no demuestra por sí solo que la sensibilidad esté completa ni que la simulación sea realista; el comprobador no hace aceptación deportiva.'}
with open(os.path.join(FINAL, 'MOTOR-18-verificacion-final.json'), 'w') as f:
    json.dump(receipt, f, indent=1)
print(receipt['result'], json.dumps(receipt['failed']))
sys.exit(0 if not failed_checks else 1)
