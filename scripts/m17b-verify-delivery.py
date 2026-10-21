#!/usr/bin/env python3
"""MOTOR-17B §13.3: comprobaciones MECÁNICAS de la entrega con herramientas estándar. No es evaluación deportiva ni otorga aceptación; no re-simula nada.
Comprueba: integridad (CRC, tamaños reales, SHA-256 de partes, ZIP internos y paquete rápido), recuentos reales de la campaña (72 ejecuciones planificadas), claves únicas y enlaces entre tablas, pertenencia de jugadores y conciliaciones,
comparación CONTROL17↔M17B, semántica y tipo de los campos de organización efectiva (no solo que el JSON abra), alcance de la sensibilidad con salida/unidad/tolerancia, coherencia AUD05 = resumen.json = ejecuciones.csv = informe y existencia/resultado de las
evidencias finales (suite, datos, documentación, navegador y DESCARGAS reales). Un dato ausente se declara `no_ejecutado`, nunca como correcto.
El recibo se escribe FUERA de los ZIP (`entrega-final/MOTOR-17B-verificacion-final.json`): nombre, tamaño y SHA-256 de los archivos finales y del índice, y el resultado de cada comprobación. No se incluye ni se autorreferencia en ellos.
Uso: python3 scripts/m17b-verify-delivery.py [--root out/motor17b] [--downloads out/motor17b/descargas/descargas.json]
"""
import os, sys, json, hashlib, zipfile, io, glob, csv, re

ROOT = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else 'out/motor17b'
DL = sys.argv[sys.argv.index('--downloads') + 1] if '--downloads' in sys.argv else f'{ROOT}/descargas/descargas.json'
FINAL = f'{ROOT}/entrega-final'; STUDY = 'MOTOR17B-CIERRE-20261021'
checks = {}; fails = []

def sha_b(b): return hashlib.sha256(b).hexdigest()
def sha_f(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()
def rec(name, estado, detalle=None):
    checks[name] = {'estado': estado, 'detalle': detalle}
    if estado == 'fallido': fails.append(f'{name}: {detalle}'); print('FALLO:', name, detalle)
def run(name, fn):
    try: fn()
    except Exception as e: rec(name, 'fallido', f'excepción {type(e).__name__}: {e}')

# 1 · partes, índice y paquete rápido
def integrity():
    ext = json.load(open(f'{FINAL}/MOTOR-17B-indice-partes.json')); n_inner = 0; bad = []
    q = ext['quick']; qp = f"{FINAL}/{q['file']}"
    if os.path.getsize(qp) != q['bytes']: bad.append('tamaño del paquete rápido distinto del índice')
    if sha_f(qp) != q['sha256']: bad.append('SHA-256 del paquete rápido distinto del índice')
    with zipfile.ZipFile(qp) as z:
        if z.testzip(): bad.append('CRC del paquete rápido')
        qn = set(z.namelist()); inner = json.loads(z.read('12-INDICE-DE-PARTES.json'))
        if [(p['file'], p['bytes'], p['sha256']) for p in inner['parts']] != [(p['file'], p['bytes'], p['sha256']) for p in ext['parts']]: bad.append('el índice de partes del rápido no coincide con el externo')
    for need in ['00-LEEME.md', '01-RESUMEN-OPERATIVO.md', '02-HALLAZGOS-B17.csv', '03-IDENTIDADES-Y-GIT.json', '11-DICCIONARIO.md', '12-INDICE-DE-PARTES.json']:
        if need not in qn: bad.append(f'falta {need} en el rápido')
    for p in ext['parts']:
        path = f"{FINAL}/{p['file']}"
        if os.path.getsize(path) != p['bytes']: bad.append(f"tamaño {p['file']}")
        if sha_f(path) != p['sha256']: bad.append(f"sha {p['file']}")
        with zipfile.ZipFile(path) as z:
            if z.testzip(): bad.append(f"CRC {p['file']}")
            names = set(z.namelist())
            for c in p['contents']:
                if c['path'] not in names: bad.append(f"falta {c['path']} en {p['file']}"); continue
                data = z.read(c['path']); n_inner += 1
                if len(data) != c['bytes'] or sha_b(data) != c['sha256']: bad.append(f"inner {c['path']}")
                if c['path'].endswith('.zip'):
                    with zipfile.ZipFile(io.BytesIO(data)) as zi:
                        if zi.testzip(): bad.append(f"CRC interno {c['path']}")
    paths = [c['path'] for p in ext['parts'] for c in p['contents']]
    if len(paths) != len(set(paths)): bad.append('elementos duplicados entre partes')
    info = {'paquete_rapido': {'bytes': q['bytes'], 'MiB': round(q['bytes'] / 1048576, 2), 'ficheros': len(qn), 'sha256': q['sha256'], 'dentro_del_objetivo_5MiB': q['bytes'] <= 5 * 1048576}, 'partes': [{'file': p['file'], 'bytes': p['bytes'], 'MiB': round(p['bytes'] / 1048576, 2), 'sha256': p['sha256']} for p in ext['parts']], 'zip_internos_verificados': n_inner, 'limite_por_parte_MiB': 64, 'partes_dentro_del_limite': all(p['bytes'] <= 64 * 1048576 for p in ext['parts'])}
    if not info['partes_dentro_del_limite']: bad.append('una parte supera 64 MiB')
    rec('integridad_zip_indice', 'fallido' if bad else 'correcto', bad if bad else info)
    checks['integridad_zip_indice']['resumen'] = info
run('integridad_zip_indice', integrity)

# 2 · agenda, índice, nivel, semillas, versiones y ficheros esenciales por lote
plans = {v: json.load(open(f'{ROOT}/plan/lotes-{v}.json')) for v in ('CONTROL17', 'M17B')}; freeze = json.load(open(f'{ROOT}/plan/00-congelacion.json'))
def campaign():
    tot = {}; bad = []
    for v in ('CONTROL17', 'M17B'):
        plan = plans[v]; t = {'solicitadas': 0, 'terminadas_validas': 0, 'terminadas_no_validas': 0, 'fallidas_o_interrumpidas': 0, 'no_ejecutadas': 0, 'esenciales': 0, 'diagnosticas': 0, 'reintentos': 0, 'ficheros_verificados_sha': 0}
        for l in plan['lots']:
            d = f"{ROOT}/lotes/{v}/{l['batch_id']}"; lote = json.load(open(f'{d}/entradas/lote.json'))
            recs = [json.loads(s) for s in open(f'{d}/indice.jsonl') if s.strip()]; att = [r for r in recs if r['type'] == 'attempt']
            if len(lote['agenda']) != l['executions']: bad.append(f"agenda {v} {l['label']}")
            if lote['record_level'] != l['level']: bad.append(f"nivel lote {l['label']}")
            per_case = {}
            for e in lote['agenda']: per_case.setdefault(e['case_id'], e['seed'])
            if [per_case[k] for k in sorted(per_case)] != l['case_seeds']: bad.append(f"semillas {l['label']}")
            seen = set()
            for a in att:
                if a['match_id'] in seen: t['reintentos'] += 1
                seen.add(a['match_id'])
                if a['exec_state'] != 'terminada': t['fallidas_o_interrumpidas'] += 1
                elif a['valid']: t['terminadas_validas'] += 1
                else: t['terminadas_no_validas'] += 1
                if a['record_level'] != l['level']: bad.append(f"nivel intento {a['attempt_id']}")
                if a['engine_version'] != plan['engine']: bad.append(f"motor del intento {a['attempt_id']}: {a['engine_version']} ≠ {plan['engine']}")
                for f in a.get('files', []):
                    p = f"{d}/intentos/{a['match_id']}/{a['attempt_id']}/{f['path']}"; b = open(p, 'rb').read(); t['ficheros_verificados_sha'] += 1
                    if len(b) != f['bytes'] or sha_b(b) != f['sha256']: bad.append(f'sha {p}')
                    if f['path'].startswith('esencial/'): json.loads(b)
            t['solicitadas'] += len(lote['agenda']); t['no_ejecutadas'] += len(lote['agenda']) - len(seen)
            t['esenciales' if l['kind'] == 'principal' else 'diagnosticas'] += len(lote['agenda'])
        tot[v] = t
    exp = {'CONTROL17': (30, 30, 0), 'M17B': (42, 30, 12)}
    for v, (s, e, g) in exp.items():
        t = tot[v]
        if (t['solicitadas'], t['esenciales'], t['diagnosticas']) != (s, e, g): bad.append(f'cantidades de {v}: {t}')
        if t['terminadas_no_validas'] or t['fallidas_o_interrumpidas'] or t['no_ejecutadas']: bad.append(f'{v}: hay ejecuciones no válidas, fallidas o no ejecutadas: {t}')
    tot['total_planificadas'] = sum(tot[v]['solicitadas'] for v in ('CONTROL17', 'M17B'))
    if tot['total_planificadas'] != 72: bad.append(f"total planificado {tot['total_planificadas']} ≠ 72")
    rec('recuentos_campana', 'fallido' if bad else 'correcto', bad if bad else tot); checks['recuentos_campana']['resumen'] = tot
run('recuentos_campana', campaign)

# 3 · tablas, claves, enlaces, pertenencia y comparación de versiones
def tables():
    bad = []; res = {}
    for f in sorted(glob.glob(f'{ROOT}/rapido/*.csv')):
        rows = list(csv.reader(open(f, newline='', encoding='utf-8'))); w = len(rows[0])
        if any(len(r) != w for r in rows): bad.append(f'anchura {os.path.basename(f)}')
        res[os.path.basename(f)] = len(rows) - 1
    ex = list(csv.DictReader(open(f'{ROOT}/rapido/05-EJECUCIONES.csv', encoding='utf-8')))
    if len(ex) != 72: bad.append(f'05-EJECUCIONES: {len(ex)} filas ≠ 72')
    if len({x['row_key'] for x in ex}) != len(ex): bad.append('row_key repetida')
    if any(not x['row_key'].startswith(f'{STUDY}:') for x in ex): bad.append('clave global sin estudio')
    prin = [x for x in ex if x['purpose'] == 'principal']
    for v in ('CONTROL17', 'M17B'):
        keys = [x['logical_key'] for x in prin if x['version'] == v]
        if len(keys) != 30 or len(set(keys)) != 30: bad.append(f'30 casos lógicos únicos en {v}: {len(keys)}/{len(set(keys))}')
    if {x['logical_key'] for x in prin if x['version'] == 'CONTROL17'} != {x['logical_key'] for x in prin if x['version'] == 'M17B'}: bad.append('los casos lógicos de CONTROL17 y M17B no coinciden')
    diag = [x for x in ex if x['purpose'] != 'principal']
    if len(diag) != 12: bad.append(f'12 diagnósticos esperados, hay {len(diag)}')
    by = {x['row_key']: x for x in ex}
    for x in diag:
        p = by.get(x['principal_row_key'])
        if not p or p['logical_key'] != x['logical_key'] or p['version'] != 'M17B': bad.append(f"diagnóstico sin su esencial: {x['row_key']}")
    mp = list(csv.DictReader(open(f'{ROOT}/rapido/04-MAPA-CASOS.csv', encoding='utf-8')))
    if {m['row_key'] for m in mp} != set(by): bad.append('el mapa de casos no enlaza exactamente con las ejecuciones')
    pl = list(csv.DictReader(open(f'{ROOT}/rapido/07-JUGADORES-POR-EJECUCION.csv', encoding='utf-8'))); tm = list(csv.DictReader(open(f'{ROOT}/rapido/06-EQUIPOS-POR-EJECUCION.csv', encoding='utf-8')))
    ess = [x for x in ex if x['record_level'] == 'world-essential']
    if len(tm) != 2 * len(ess): bad.append('equipos ≠ 2 × esenciales')
    if len(pl) != 24 * len(ess): bad.append('jugadores ≠ 24 × esenciales')
    if any(p['team_index'] not in ('0', '1') for p in pl): bad.append('team_index vacío o inválido')
    if any(p['in_entry_roster'] != 'true' for p in pl): bad.append('jugador que no pertenece a la plantilla de la entrada congelada')
    if any(t['reconciles_points'] != 'true' for t in tm): bad.append('equipo cuyos puntos no concilian con los de sus jugadores')
    cmpr = list(csv.DictReader(open(f'{ROOT}/rapido/09-COMPARACION-CONTROL17-M17B.csv', encoding='utf-8')))
    if len(cmpr) != 30: bad.append(f'comparación CONTROL17↔M17B: {len(cmpr)} ≠ 30')
    nf = [c for c in cmpr if c['all_sporting_equal'] != 'true']
    res['comparacion'] = {'casos': len(cmpr), 'iguales_en_lo_deportivo': len(cmpr) - len(nf), 'con_desviacion': [c['logical_key'] for c in nf], 'robos_control17': sum(int(c['stl_credits_control']) for c in cmpr), 'robos_m17b': sum(int(c['stl_credits_m17b']) for c in cmpr)}
    if nf: bad.append(f"{len(nf)} casos con desviación deportiva no autorizada (ver 09b-DESVIACIONES…)")
    dv = list(csv.DictReader(open(f'{ROOT}/rapido/13-DIAGNOSTICO-VS-ESENCIAL-M17B.csv', encoding='utf-8')))
    if len(dv) != 12 or any(any(v == 'false' for k, v in d.items() if k.startswith('same_')) for d in dv): bad.append('diagnóstico y esencial de M17B no conservan el mismo deporte')
    res['jugadores_con_team_index_y_plantilla'] = len(pl); res['filas_equipo'] = len(tm)
    rec('tablas_enlaces_y_comparacion', 'fallido' if bad else 'correcto', bad if bad else res); checks['tablas_enlaces_y_comparacion']['resumen'] = res
run('tablas_enlaces_y_comparacion', tables)

# 4 · semántica y tipo de los campos de organización (no solo que el JSON abra) y compatibilidad con el contrato antiguo
def org_semantics():
    bad = []; n = 0; legacy = 0; ENUM = {'plan', 'orden aplicada', 'alternativa', 'no reconstruible'}
    for v in ('CONTROL17', 'M17B'):
        for l in plans[v]['lots']:
            if l['kind'] != 'principal': continue
            for f in glob.glob(f"{ROOT}/lotes/{v}/{l['batch_id']}/intentos/*/*/esencial/*.json"):
                e = json.load(open(f)); sh = e['shots']; cols = sh['columns']
                if v == 'CONTROL17':
                    if e['essential_version'] != 'ESE-MOTOR17-R1': bad.append(f'CONTROL17 con versión inesperada {e["essential_version"]}')
                    di = cols.index('defense_org'); legacy += sum(1 for r in sh['rows'] if isinstance(r[di], dict) or r[di] is None); continue
                if e['essential_version'] != 'ESE-MOTOR17B-R1' or e.get('field_semantics', {}).get('version') != 'ESE-MOTOR17B-R1': bad.append(f'M17B sin versión/semántica de conservación en {os.path.basename(f)}')
                ix = {c: cols.index(c) for c in ['defense_org', 'defense_org_intended', 'defense_org_alternate', 'defense_org_objective', 'defense_org_plan_version', 'defense_org_source', 'defense_org_reason', 'defense_intervention']}
                for r in sh['rows']:
                    n += 1
                    if not (r[ix['defense_org']] is None or re.fullmatch(r'ORG0[1-6]', str(r[ix['defense_org']]))): bad.append(f"defense_org no es un código de organización: {r[ix['defense_org']]!r}")
                    if r[ix['defense_org_source']] not in ENUM: bad.append('defense_org_source fuera del enum')
                    if r[ix['defense_org_alternate']] not in (True, False, None): bad.append('defense_org_alternate no booleano')
                    if not isinstance(r[ix['defense_org_plan_version']], int): bad.append('defense_org_plan_version no entero')
                    if r[ix['defense_org_source']] == 'no reconstruible' and (r[ix['defense_org']] is not None or not r[ix['defense_org_reason']]): bad.append('organización inventada o sin motivo en una posesión no reconstruible')
                    if r[ix['defense_org_source']] == 'alternativa' and not (r[ix['defense_org_alternate']] is True and r[ix['defense_org_intended']] != r[ix['defense_org']]): bad.append('alternativa sin condición o sin diferir de la pretendida')
                    if r[ix['defense_intervention']] is not None and not isinstance(r[ix['defense_intervention']], dict): bad.append('defense_intervention no es un objeto')
                if any(not (x['org_mixed'] is False or x['org'] is None) for x in e['tactics']): bad.append('posesión mixta con una organización única')
    res = {'filas_de_tiro_M17B': n, 'filas_CONTROL17_con_defense_org_objeto_o_nulo (histórico, no equivale al campo nuevo)': legacy}
    if n == 0: bad.append('sin filas de tiro de M17B que comprobar')
    rec('semantica_organizacion_efectiva', 'fallido' if bad else 'correcto', bad[:20] if bad else res); checks['semantica_organizacion_efectiva']['resumen'] = res
run('semantica_organizacion_efectiva', org_semantics)

# 5 · auditoría: resumen = ejecuciones = informe; AUD05 desde la matriz y la sensibilidad; alcance, unidades, tolerancia
def audit():
    bad = []; res = {}; lec = f'{ROOT}/auditoria/M17B'
    ej = list(csv.DictReader(open(f'{lec}/ejecuciones.csv', encoding='utf-8'))); cnt = {}
    for e in ej: cnt[e['resultado']] = cnt.get(e['resultado'], 0) + 1
    rep = open(f'{lec}/informe-auditoria.md', encoding='utf-8').read(); m = re.search(r'Conformes al control: (\d+)', rep)
    if not m or int(m.group(1)) != cnt.get('conforme', 0): bad.append('el informe no coincide con ejecuciones.csv')
    rs = json.load(open(f'{lec}/resumen.json'))
    if rs['por_resultado'] != cnt: bad.append('resumen.json ≠ ejecuciones.csv')
    a5 = rs['aud05']; row5 = [e for e in ej if e['audit_id'] == 'AUD05'][0]
    if [a['resultado'] for a in rs['por_auditoria'] if a['id'] == 'AUD05'][0] != row5['resultado']: bad.append('AUD05: resumen ≠ ejecuciones')
    sens = list(csv.DictReader(open(f'{lec}/sensibilidad.csv', encoding='utf-8'))); caps = list(csv.DictReader(open(f'{lec}/capacidades.csv', encoding='utf-8')))
    CAPS = sorted({c['cap'] for c in caps})
    if len(CAPS) != 32: bad.append(f'{len(CAPS)} capacidades en la matriz')
    if len(sens) > 768: bad.append(f'{len(sens)} filas de contraste > 768')
    obs = sorted({c['cap'] for c in caps if int(c['usos'] or 0) > 0}); pert = sorted({s['cap'] for s in sens if s['pertinente'] == 'true'})
    if len(obs) != a5['capacidadesObservadasEnCalculos']: bad.append('AUD05: observadas ≠ matriz')
    if len(pert) != a5['capacidadesConSalidaPertinenteContrastada']: bad.append('AUD05: con salida pertinente ≠ sensibilidad')
    ctxs = {}
    for s in sens: ctxs.setdefault(s['cap'], set()).add((s['gdec'], s['player'], s['role']))
    if any(len(v) > 8 for v in ctxs.values()): bad.append('más de ocho contextos en una capacidad')
    inc_bad = [s for s in sens if s['pertinente'] == 'true' and (not s['salidaUnidad'] or not s['consumidor'] or not s['funcion'] or s['tolerancia'] == '' or s['baseCoincide'] != 'true')]
    if inc_bad: bad.append(f'{len(inc_bad)} filas pertinentes sin unidad/consumidor/función/tolerancia o con base que no coincide')
    zero = [s for s in sens if s['incrementoEfectivo'] == '0' and s['pertinente'] == 'true' and float(s['salidaDelta'] or 0) != 0]
    if zero: bad.append(f'{len(zero)} filas con incremento efectivo 0 y cambio ≠ 0')
    for s in sens:
        if s['pertinente'] == 'true' and 'puntos porcentuales' in (s['unidad'] or '').lower(): bad.append('unidad «puntos porcentuales» en una fila de receta'); break
    if len(sens) and not any(s['study'] == STUDY and s['code_version'].startswith('M17B') for s in sens): bad.append('sensibilidad sin identidad de estudio y versión de código')
    unid = {}
    for s in sens:
        if s['pertinente'] == 'true': unid[s['salidaUnidad']] = unid.get(s['salidaUnidad'], 0) + 1
    ctxf = [json.loads(l) for l in open(f'{lec}/contextos-contraste.jsonl', encoding='utf-8')]
    if len(ctxf) != sum(len(v) for v in ctxs.values()): bad.append(f'contextos-contraste.jsonl ({len(ctxf)}) ≠ contextos de la sensibilidad ({sum(len(v) for v in ctxs.values())})')
    res = {'por_resultado': cnt, 'aud05': {k: a5[k] for k in ('capacidadesDeclaradas', 'capacidadesObservadasEnCalculos', 'capacidadesConSalidaPertinenteContrastada', 'capacidadesConSalidaExacta', 'capacidadesConContrasteAproximado', 'capacidadesConContrastePendiente', 'pendientesDeContraste', 'sinExposicionEnLaEvidencia', 'filasDeContraste', 'filasConSalidaPertinente')}, 'aud05_resultado': row5['resultado'], 'filas_sensibilidad': len(sens), 'contextos': sum(len(v) for v in ctxs.values()), 'salidas_por_unidad': unid, 'lectura': json.load(open(f'{lec}/lectura.json'))['partidos']}
    rec('auditoria_aud05_y_sensibilidad', 'fallido' if bad else 'correcto', bad[:20] if bad else res); checks['auditoria_aud05_y_sensibilidad']['resumen'] = res
run('auditoria_aud05_y_sensibilidad', audit)

# 6 · evidencias finales (suite, datos, documentación, navegador) y DESCARGAS reales
def final_evidence():
    P = f'{ROOT}/comprobaciones'
    def log(n): p = f'{P}/{n}'; return open(p, encoding='utf-8').read() if os.path.exists(p) else None
    t = log('npm-test.log')
    if t is None: rec('suite_completa', 'no_ejecutado', 'sin npm-test.log')
    else:
        g = lambda k: int(re.search(rf'^# {k} (\d+)', t, re.M).group(1)); ok = g('fail') == 0 and g('pass') == g('tests'); rec('suite_completa', 'correcto' if ok else 'fallido', {'tests': g('tests'), 'pass': g('pass'), 'fail': g('fail')})
    d = log('data-check.log'); rec('datos', 'no_ejecutado' if d is None else ('correcto' if 'datos correctos' in d else 'fallido'), None if d is None else d.strip().splitlines()[-1])
    c = log('docs-check.log'); rec('documentacion_copia_limpia', 'no_ejecutado' if c is None else ('correcto' if re.search(r'correcto|OK|sin problemas', c, re.I) and not re.search(r'FALLO|error', c.splitlines()[-1], re.I) else 'fallido'), None if c is None else c.strip().splitlines()[-1])
    nav = f'{ROOT}/informes/navegador.json'
    if not os.path.exists(nav): rec('navegador_chromium', 'no_ejecutado', 'sin navegador.json')
    else:
        n = json.load(open(nav)); ok = all(s['ok'] for s in n['steps']) and not n['consoleErrors'] and not n['netErrors']; rec('navegador_chromium', 'correcto' if ok else 'fallido', {'pasos': len(n['steps']), 'consola': len(n['consoleErrors']), 'red': len(n['netErrors']), 'navegador': n['browser']})
    ext = json.load(open(f'{FINAL}/MOTOR-17B-indice-partes.json')); expected = {ext['quick']['file']: (ext['quick']['bytes'], ext['quick']['sha256'])}
    for p in ext['parts']: expected[p['file']] = (p['bytes'], p['sha256'])
    expected['MOTOR-17B-indice-partes.json'] = (os.path.getsize(f'{FINAL}/MOTOR-17B-indice-partes.json'), sha_f(f'{FINAL}/MOTOR-17B-indice-partes.json'))
    if not os.path.exists(DL): rec('descargas_reales_desde_la_aplicacion', 'no_ejecutado', f'sin {DL}: la descarga real no se ejecutó (no se afirma ninguna)')
    else:
        dl = json.load(open(DL)); got = {x['name']: x for x in dl.get('files', [])}; bad = []
        if not dl.get('files'): bad.append('cero archivos descargados')
        for name, (b, h) in expected.items():
            x = got.get(name)
            if not x: bad.append(f'no se descargó {name}'); continue
            if not x.get('url', '').startswith('/api/closure/download/'): bad.append(f'{name}: no procede del enlace de la aplicación')
            if x['bytes'] != b or x['sha256'] != h: bad.append(f'{name}: bytes descargados ≠ originales')
            p = x.get('saved_path')
            if p and os.path.exists(p) and (os.path.getsize(p) != b or sha_f(p) != h): bad.append(f'{name}: el archivo guardado difiere')
        rec('descargas_reales_desde_la_aplicacion', 'fallido' if bad else 'correcto', bad if bad else {'archivos': len(got), 'esperados': sorted(expected), 'navegador': dl.get('browser'), 'fecha': dl.get('date')})
run('evidencias_finales', final_evidence)

# 7 · recibo FUERA de los ZIP
final_files = []
for p in sorted(glob.glob(f'{FINAL}/MOTOR-17B-*')):
    if p.endswith('verificacion-final.json'): continue
    final_files.append({'name': os.path.basename(p), 'bytes': os.path.getsize(p), 'sha256': sha_f(p)})
estados = {k: v['estado'] for k, v in checks.items()}; ok = not fails
receipt = {'schema': 'motor17b-verificacion-final/1', 'study': STUDY, 'resultado_global': 'correcto' if ok and all(s != 'no_ejecutado' for s in estados.values()) else ('con_fallos' if fails else 'incompleto: hay comprobaciones no ejecutadas'),
  'archivos_finales': final_files, 'estados': estados, 'comprobaciones': checks, 'alcance': 'comprobación MECÁNICA de integridad, recuentos, claves, enlaces, semántica de campos, alcance de la sensibilidad, coherencia AUD05 y existencia/resultado de las evidencias finales; no otorga aceptación deportiva ni reemplaza la revisión de ChatGPT y Dennis',
  'no_realizado_por_este_comprobador': ['re-simulación de partidos', 'validación deportiva o de calibración', 'conformidad FIBA integral', 'recorrido manual de Dennis', 'otros navegadores y Node 24'],
  'fuera_de_los_zip': 'este recibo no está dentro de ningún ZIP ni se autorreferencia: referencia los archivos finales y el índice por nombre, tamaño y SHA-256'}
json.dump(receipt, open(f'{FINAL}/MOTOR-17B-verificacion-final.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({'resultado_global': receipt['resultado_global'], 'estados': estados}, indent=1, ensure_ascii=False))
sys.exit(0 if ok else 1)
