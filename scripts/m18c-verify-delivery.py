#!/usr/bin/env python3
"""MOTOR-18C §7: comprobador mecánico de la entrega. Escribe MOTOR-18C-verificacion-final.json FUERA del ZIP, identificándolo por nombre, tamaño y SHA-256.

Recalcula desde los archivos REALES del ZIP (no copia booleanos del informe): la distinción M1/M10 (fuentes registradas frente a la fuente completa esperada), el rechazo de la copia ajena y del manejador obsoleto (huellas recalculadas
con `teamFingerprint` de src/learning/team.js mediante Node), la aplicación legítima única, el deshacer, la igualdad de contenido de las áreas deportivas y las salidas de los comandos.
LÍMITE DECLARADO: comprobar hashes y propiedades de los datos no sustituye a la aceptación manual de Dennis ni demuestra calidad deportiva.
Uso: python3 scripts/m18c-verify-delivery.py --out out/motor18c
"""
import argparse, hashlib, json, os, re, subprocess, sys, zipfile

ap = argparse.ArgumentParser(); ap.add_argument('--out', default='out/motor18c'); a = ap.parse_args()
FINAL = os.path.join(a.out, 'entrega-final'); ZIP = os.path.join(FINAL, 'MOTOR-18C-revision-rapida.zip'); LIMIT = 5 * 1024 * 1024
checks = []
def check(id_, ok, detail=None, kind='contenido'): checks.append({'id': id_, 'ok': bool(ok), 'kind': kind, 'detail': detail})
sha = lambda b: hashlib.sha256(b).hexdigest()
zbytes = open(ZIP, 'rb').read(); z = zipfile.ZipFile(ZIP)

# 1 · integridad
check('zip:existe-y-tamano', os.path.getsize(ZIP) == len(zbytes) and len(zbytes) <= LIMIT, {'bytes': len(zbytes), 'limite': LIMIT}, 'integridad')
check('zip:crc', z.testzip() is None, None, 'integridad')
names = z.namelist(); check('zip:sin-duplicados', len(names) == len(set(names)), None, 'integridad')
for need in ['00-LEEME.md', 'identidad-casos.json', 'estados-y-recibos.json', 'cambios.patch', 'recorrido-manual.md', 'manifiesto.json', 'verificaciones/comparacion-areas-deportivas.json', 'verificaciones/suite-completa.txt', 'verificaciones/navegador/recorrido-navegador.json']:
    check(f'zip:contiene:{need}', need in names, None, 'integridad')
man = json.loads(z.read('manifiesto.json'))
listed = {f['path'] for f in man['files']}
check('manifiesto:cubre-todo-salvo-si-mismo', listed == set(names) - {'manifiesto.json'}, {'faltan': sorted(set(names) - {'manifiesto.json'} - listed), 'sobran': sorted(listed - set(names))}, 'integridad')
for f in man['files']:
    b = z.read(f['path']); check(f'manifiesto:{f["path"]}', len(b) == f['bytes'] and sha(b) == f['sha256'], {'bytes': f['bytes'], 'sha256': f['sha256']}, 'integridad')
J = lambda n: json.loads(z.read(n))
ident = J('identidad-casos.json'); cases = ident['cases']; est = J('estados-y-recibos.json')
check('identidad:base-y-cabeza-coinciden-con-manifiesto', ident['base'] == man['base'] and ident['code_head'] == man['code_head'], {'base': ident['base'], 'head': ident['code_head']})

def fps(states):
    r = subprocess.run(['node', 'scripts/m18c-fingerprint.js'], input=json.dumps(states), capture_output=True, text=True, check=True); return json.loads(r.stdout)

# 2 · distinción M1/M10 (T18C-01), recalculada con las fuentes registradas
rows = [c for c in cases if c['case'] == 'T18C-01']
for other in (10, 11, 100):
    sub = [c for c in rows if c['sub'] == f'M1 con M{other} aplicado: botón']
    ok = len(sub) == 2
    for c in sub:
        applied = [r['source_id'] for r in c['registered'] if r['status'] == 'aplicada']
        # la fuente de M1 esperada NO está entre las registradas (solo la de M<other>), pese a que `startsWith` las confundía
        ok = ok and c['expected_source'] not in applied and any(s.startswith(c['match']) for s in applied) and all(s != c['expected_source'] for s in applied) and c['accepted'] is True
    check(f'T18C-01:M{other}-no-bloquea-M1', ok, {'filas': len(sub)})
    after = [c for c in rows if c['sub'] == f'M1 aplicado tras M{other}']
    check(f'T18C-01:M1-se-aplica-tras-M{other}', len(after) == 2 and all(sum(1 for r in c['registered'] if r['source_id'] == c['expected_source'] and r['status'] == 'aplicada') == 1 and any(r['source_id'] == f"{c['match'][:-2]}M{other}|{c['team']}" and r['status'] == 'aplicada' for r in c['registered']) for c in after))
    rep = [c for c in rows if c['sub'] == f'M1 ya aplicado tras M{other}']
    check(f'T18C-01:repeticion-M1-rechazada-sin-cambios-tras-M{other}', len(rep) == 2 and all(c['accepted'] is False and c['state_unchanged'] is True and sum(1 for r in c['registered'] if r['source_id'] == c['expected_source']) == 1 for c in rep))
rev = [c for c in rows if c['sub'] == 'equipo y recibo revertido' and c['team'] == 'EQ02'][0]
check('T18C-01:recibo-revertido-no-es-vigente', [(r['id'], r['status']) for r in rev['registered']] == [('APL-1', 'aplicada'), ('APL-2', 'revertida'), ('RST-3', 'restauracion'), ('APL-4', 'aplicada')])

# 3 · copia ajena (T18C-02): igualdad exacta recalculada, sin aplicación y sin cambio de estado
fr = [c for c in cases if c['case'] == 'T18C-02' and c['sub'].startswith('resultado I')]
check('T18C-02:seis-filas-tres-pares', len(fr) == 6 and {c['sub'] for c in fr} == {'resultado I11 · copia activa I12', 'resultado I10 · copia activa I1', 'resultado I1 · copia activa I10'})
check('T18C-02:copias-distintas-por-igualdad-exacta', all(c['result_copy'] != c['active_copy'] and c['match'] == c['result_copy'] + '|M1' for c in fr))
check('T18C-02:rechazo-sin-aplicacion-ni-cambio', all(c['accepted'] is False and c['state_unchanged'] is True and c['controls'] == {'apply': False, 'see': False, 'foreign_notice': True} for c in fr))
check('T18C-02:prefijo-ingenuo-habria-aceptado-I10-sobre-I1', any(c['match'].startswith(c['active_copy']) and c['result_copy'] != c['active_copy'] for c in fr), 'premisa: el caso I10/I1 es el que startsWith(copy.id) confundía')
check('T18C-02:registros-vacios', all(c['registered'] == [] for c in fr))
# 4 · manejador obsoleto (T18C-03): huellas y registros antes/después recalculados
t3 = est['T18C-03']
for k in ('copyA', 'copyB'):
    b, af = t3[k]['before'], t3[k]['after']
    fb, fa = fps(b['learning']['states']), fps(af['learning']['states'])
    check(f'T18C-03:{k}-huellas-recalculadas-iguales', fb == fa and fb == b['fingerprints'] and fa == af['fingerprints'], {'antes': fb, 'despues': fa})
    check(f'T18C-03:{k}-registro-y-secuencias-iguales', b['registry'] == af['registry'] and b['sequences'] == af['sequences'] and all(len(l['applications']) == 0 for l in af['registry']['ledgers'].values()))
    check(f'T18C-03:{k}-snapshot-completo-igual', b['full_snapshot_sha256'] == af['full_snapshot_sha256'], b['full_snapshot_sha256'])
check('T18C-03:copias-distintas', t3['copyA']['before']['copy_id'] != t3['copyB']['before']['copy_id'])
sh = t3['stale_handler']; check('T18C-03:manejador-obsoleto-rechazado', sh['switchedToB']['accepted'] is False and sh['switchedToB']['retainedCopyUnchanged'] and sh['switchedToB']['activeCopyUnchanged'] and sh['noActiveCopy']['rejected'] and sh['restoredA']['messageClass'] == 'pill bad' and sh['restoredA']['message'].startswith('No aplicado:'))
# 5 · aplicación legítima única y deshacer (T18C-04)
t4 = est['T18C-04']; b, ap_, un = t4['before'], t4['after_apply'], t4['after_undo']
fb, fa = fps(b['learning']['states']), fps(ap_['learning']['states'])
check('T18C-04:huellas-antes-recalculadas', fb == b['fingerprints'], fb); check('T18C-04:huellas-tras-aplicar-recalculadas-y-distintas', fa == ap_['fingerprints'] and all(fa[t] != fb[t] for t in fa), fa)
check('T18C-04:deshacer-restaura-las-huellas-previas', un['fingerprints'] == fb, {'antes': fb, 'tras_deshacer': un['fingerprints']})
c4 = [c for c in cases if c['case'] == 'T18C-04']
for t in ('EQ01', 'EQ02'):
    led = ap_['registry']['ledgers'][t]['applications']; exp = f"{ap_['learning']['states'][t]['instanceId']}"
    src = [c for c in c4 if c['sub'] == 'aplicación legítima única' and c['team'] == t][0]['expected_source']
    check(f'T18C-04:{t}-una-aplicacion-vigente-con-fuente-exacta', [x['source_id'] for x in led if x['status'] == 'aplicada'] == [src] and len(led) == 1 and src.endswith(f'|M1|{t}'), src)
    pb = b['learning']['states'][t]['players']; pa = ap_['learning']['states'][t]['players']
    changed = sum(1 for pid in pa for dom in ('positions', 'offensiveRoles', 'defensiveRoles', 'tactics') for k, e in pa[pid]['block'][dom].items() if (e['level'], e['peak']) != (pb[pid]['block'][dom][k]['level'], pb[pid]['block'][dom][k]['peak']))
    check(f'T18C-04:{t}-niveles-cambiaron-de-verdad', changed > 0 and all(pb[pid]['ledger']['match']['used'] == {} and pa[pid]['ledger']['match']['used'] == {'position': 1, 'offensiveRole': 1, 'defensiveRole': 1, 'tactic': 1} for pid in pa), {'entradas_cambiadas': changed})
check('T18C-04:repeticion-rechazada', t4['observed']['repeat']['unchanged'] is True and t4['observed']['repeat']['core']['ok'] is False and t4['observed']['repeat']['message'] == 'EQ01: ya aplicado · EQ02: ya aplicado')
check('T18C-04:restaurar-la-misma-copia', t4['observed']['restored']['belongs'] is True and t4['observed']['restored']['applyDisabled'] is True and t4['observed']['reapply_enabled'] is True)
# 6 · áreas deportivas
cmp_ = J('verificaciones/comparacion-areas-deportivas.json')
check('areas:todo-identico-recalculado', cmp_['all_identical'] is True and cmp_['differing'] == [] and len(cmp_['files']) == cmp_['files_compared'] and all(f['equal'] and f['base_sha256'] == f['now_sha256'] for f in cmp_['files']), {'archivos': cmp_['files_compared'], 'comparado': cmp_['compared_prefixes'], 'excluido': cmp_['excluded']})
patch = z.read('cambios.patch').decode('utf8', 'replace'); touched = set(re.findall(r'^diff --git a/(\S+) b/', patch, re.M))
check('areas:el-parche-no-toca-motor-conocimiento-aprendizaje-ni-datos', not any(p.startswith(('src/match/', 'src/knowledge/', 'src/learning/', 'src/engine/', 'src/profiles/', 'src/population/', 'src/analysis/', 'src/audit/', 'src/batch/', 'data/')) for p in touched), sorted(touched))
# 7 · comandos
suite = z.read('verificaciones/suite-completa.txt').decode(); g = lambda k, t=suite: next((int(l.split()[2]) for l in t.splitlines() if l.startswith(f'# {k} ')), None)
check('suite:completa-sin-fallos', z.read('verificaciones/suite-completa.exit').decode().strip() == '0' and g('fail') == 0 and g('cancelled') == 0 and (g('pass') or 0) > 0, {'tests': g('tests'), 'pass': g('pass'), 'fail': g('fail'), 'skipped': g('skipped')})
check('dirigidas:T18C-con-correccion', g('pass', z.read('verificaciones/t18c-dirigidas.txt').decode()) == 4 and g('fail', z.read('verificaciones/t18c-dirigidas.txt').decode()) == 0)
old = z.read('verificaciones/t18c-con-comportamiento-anterior.txt').decode(); check('dirigidas:T18C-01-02-03-fallan-con-el-comportamiento-anterior', all(f'not ok {i}' in old for i in (1, 2, 3)) and 'ok 4 -' in old)
check('data-check:correcto', 'datos correctos' in z.read('verificaciones/data-check.txt').decode())
doc = z.read('verificaciones/doc-check.txt').decode(); check('doc-check:copia-limpia-sin-fallos', 'RESULTADO: todas las comprobaciones' in doc or ('FAIL' not in doc and 'PASS' in doc), doc.strip().splitlines()[-1] if doc.strip() else None)
nav = J('verificaciones/navegador/recorrido-navegador.json'); check('navegador:todos-los-pasos-sin-errores', nav['failed'] == 0 and nav['consoleErrors'] == [] and nav['netErrors'] == [], {'pasos': nav['passed'], 'partidos_nuevos': nav['new_matches_played_in_walkthrough']})

failed = [c for c in checks if not c['ok']]; kinds = {k: {'total': sum(1 for c in checks if c['kind'] == k), 'fallos': sum(1 for c in failed if c['kind'] == k)} for k in ('integridad', 'contenido')}
receipt = {'schema': 'beM-m18c-verificacion/1', 'study': 'MOTOR-18C', 'result': 'correcto' if not failed else 'fallos', 'zip': {'file': os.path.basename(ZIP), 'bytes': len(zbytes), 'sha256': sha(zbytes)}, 'base': man['base'], 'code_head': man['code_head'], 'checks_by_kind': kinds,
           'kind_note': 'integridad = existencia, tamaños, SHA-256 y CRC; contenido = propiedades recalculadas desde los archivos del ZIP (fuentes registradas, huellas con teamFingerprint vía Node, igualdades de contenido, salidas de comandos)',
           'limit': 'no sustituye la aceptación manual de Dennis ni demuestra calidad deportiva', 'checks': checks, 'failed': [c['id'] for c in failed]}
out = os.path.join(FINAL, 'MOTOR-18C-verificacion-final.json'); open(out, 'w').write(json.dumps(receipt, indent=1))
print(json.dumps({'result': receipt['result'], 'checks': len(checks), 'by_kind': kinds, 'failed': receipt['failed'], 'zip': receipt['zip']}, indent=1)); sys.exit(1 if failed else 0)
