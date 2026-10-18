#!/usr/bin/env python3
"""MOTOR-17 §18.3: comprobaciones MECÁNICAS de la entrega con herramientas estándar (no es evaluación deportiva ni sustituye a `batch:check`, que no admite lotes esenciales ni el contenedor externo).
Comprueba: apertura/CRC de ZIP, tamaños reales (bytes), SHA-256 de partes, de ZIP internos y del paquete rápido; agenda/índice/nivel/semillas por lote; ficheros esenciales (SHA y JSON); claves globales, recuentos y referencias
de las tablas; `team_index` sin nulos; coherencia de las auditorías (resumen.json = ejecuciones.csv = informe); benchmarks. Los fallos se conservan en el registro: no se ocultan con otro comprobador.
Uso: python3 scripts/m17-verify-delivery.py [--root out/motor17]
"""
import os, sys, json, hashlib, zipfile, io, glob, csv, re

ROOT = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else 'out/motor17'
FINAL = f'{ROOT}/entrega-final'; ok = True; res = {}; fails = []

def sha_b(b): return hashlib.sha256(b).hexdigest()
def sha_f(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()
def fail(m):
    global ok; ok = False; fails.append(m); print('FALLO:', m)

# 1 · partes e índice externo
ext = json.load(open(f'{FINAL}/MOTOR-17-indice-partes.json')); n_inner = 0
q = ext['quick']; qp = f"{FINAL}/{q['file']}"
if os.path.getsize(qp) != q['bytes']: fail('tamaño del paquete rápido distinto del índice')
if sha_f(qp) != q['sha256']: fail('SHA-256 del paquete rápido distinto del índice')
with zipfile.ZipFile(qp) as z:
    if z.testzip(): fail('CRC del paquete rápido')
    qnames = set(z.namelist())
    inner_index = json.loads(z.read('14-INDICE-DE-PARTES.json'))
    if [(p['file'], p['bytes'], p['sha256']) for p in inner_index['parts']] != [(p['file'], p['bytes'], p['sha256']) for p in ext['parts']]: fail('el índice de partes del paquete rápido no coincide con el externo')
res['paquete_rapido'] = {'bytes': q['bytes'], 'MiB': round(q['bytes'] / 1048576, 2), 'ficheros': len(qnames), 'sha256': q['sha256']}
for need in ['00-LEEME.md', '01-RESUMEN-OPERATIVO.md', '02-HIPOTESIS.csv', '03-TABLA-DE-CAMBIOS.csv', '04-IDENTIDADES-Y-GIT.json', '12-DICCIONARIO.md', '14-INDICE-DE-PARTES.json']:
    if need not in qnames: fail(f'falta {need} en el paquete rápido')
for p in ext['parts']:
    path = f"{FINAL}/{p['file']}"
    if os.path.getsize(path) != p['bytes']: fail(f"tamaño {p['file']}")
    if sha_f(path) != p['sha256']: fail(f"sha {p['file']}")
    with zipfile.ZipFile(path) as z:
        if z.testzip(): fail(f"CRC {p['file']}")
        names = set(z.namelist())
        for c in p['contents']:
            if c['path'] not in names: fail(f"falta {c['path']} en {p['file']}"); continue
            data = z.read(c['path']); n_inner += 1
            if len(data) != c['bytes'] or sha_b(data) != c['sha256']: fail(f"inner {c['path']}")
            if c['path'].endswith('.zip'):
                with zipfile.ZipFile(io.BytesIO(data)) as zi:
                    if zi.testzip(): fail(f"CRC interno {c['path']}")
res['partes'] = [{'file': p['file'], 'bytes': p['bytes'], 'MiB': round(p['bytes'] / 1048576, 2), 'sha256': p['sha256']} for p in ext['parts']]
res['zip_internos_verificados'] = n_inner

# 2 · agenda, índice, nivel, semillas y ficheros esenciales por lote, por versión
tot = {}
for v in ('R0', 'R17'):
    plan = json.load(open(f'{ROOT}/plan/lotes-{v}.json')); t = {'solicitados': 0, 'terminados_validos': 0, 'terminados_no_validos': 0, 'fallidos_o_interrumpidos': 0, 'no_ejecutados': 0, 'principales': 0, 'diagnosticos': 0, 'reintentos': 0}; files_checked = 0
    for l in plan['lots']:
        d = f"{ROOT}/lotes/{v}/{l['batch_id']}"; lote = json.load(open(f'{d}/entradas/lote.json'))
        recs = [json.loads(s) for s in open(f'{d}/indice.jsonl') if s.strip()]; att = [r for r in recs if r['type'] == 'attempt']
        if len(lote['agenda']) != l['executions']: fail(f"agenda {l['label']}")
        if lote['record_level'] != l['level']: fail(f"nivel lote {l['label']}")
        per_case = {}
        for e in lote['agenda']: per_case.setdefault(e['case_id'], e['seed'])
        if [per_case[k] for k in sorted(per_case)] != l['case_seeds']: fail(f"semillas {l['label']}")
        seen = set()
        for a in att:
            if a['match_id'] in seen: t['reintentos'] += 1
            seen.add(a['match_id'])
            if a['exec_state'] != 'terminada': t['fallidos_o_interrumpidos'] += 1
            elif a['valid']: t['terminados_validos'] += 1
            else: t['terminados_no_validos'] += 1
            if a['record_level'] != l['level']: fail(f"nivel intento {a['attempt_id']}")
            if a['engine_version'] != plan['engine']: fail(f"motor del intento {a['attempt_id']}: {a['engine_version']} ≠ {plan['engine']}")
            for f in a.get('files', []):
                p = f"{d}/intentos/{a['match_id']}/{a['attempt_id']}/{f['path']}"; b = open(p, 'rb').read(); files_checked += 1
                if len(b) != f['bytes'] or sha_b(b) != f['sha256']: fail(f"sha {p}")
                if f['path'].startswith('esencial/'): json.loads(b)
        t['solicitados'] += len(lote['agenda']); t['no_ejecutados'] += len(lote['agenda']) - len(seen)
        t['principales' if l['kind'] == 'principal' else 'diagnosticos'] += len(lote['agenda'])
    t['ficheros_verificados_sha'] = files_checked; tot[v] = t
    if t['solicitados'] != 236 or t['principales'] != 224 or t['diagnosticos'] != 12: fail(f'cantidades de {v}: {t}')
    if t['terminados_no_validos'] or t['fallidos_o_interrumpidos'] or t['no_ejecutados']: fail(f'{v}: hay ejecuciones no válidas, fallidas o no ejecutadas: {t}')
res['agenda_indice'] = tot

# 3 · tablas: anchura constante, claves únicas, recuentos y team_index sin nulos
tables = {}
for f in sorted(glob.glob(f'{ROOT}/rapido/*.csv')):
    rows = list(csv.reader(open(f, newline='', encoding='utf-8'))); w = len(rows[0])
    if any(len(r) != w for r in rows): fail(f'anchura {f}')
    tables[os.path.basename(f)] = len(rows) - 1
res['tablas'] = tables
ex = list(csv.DictReader(open(f'{ROOT}/rapido/05-EJECUCIONES.csv', encoding='utf-8')))
if len({x['row_key'] for x in ex}) != len(ex): fail('row_key repetida en 05-EJECUCIONES')
res['ejecuciones_por_version_y_proposito'] = {f'{v}|{p}': sum(1 for x in ex if x['version'] == v and x['purpose'] == p) for v in ('R0', 'R17') for p in ('principal', 'diagnostico_completo')}
prin = [x for x in ex if x['purpose'] == 'principal']
for v in ('R0', 'R17'):
    keys = [x['logical_key'] for x in prin if x['version'] == v]
    if len(set(keys)) != len(keys): fail(f'clave lógica repetida en principales de {v}')
if any(x['purpose'] != 'principal' and not x['principal_row_key'] for x in ex): fail('repetición diagnóstica sin su principal')
res['principales_por_bloque'] = {b: sum(1 for x in prin if x['block'] == b and x['version'] == 'R17') for b in 'ABCD'}
pl = list(csv.DictReader(open(f'{ROOT}/rapido/07-JUGADORES-POR-EJECUCION.csv', encoding='utf-8')))
if any(p['team_index'] not in ('0', '1') for p in pl): fail('team_index vacío o inválido en 07-JUGADORES-POR-EJECUCION')
res['jugadores_team_index_sin_nulos'] = len(pl); res['filas_equipo'] = tables.get('06-EQUIPOS-POR-EJECUCION.csv')
if tables.get('06-EQUIPOS-POR-EJECUCION.csv') != 2 * sum(1 for x in ex if x['record_level'] == 'world-essential'): fail('equipos por ejecución ≠ 2 × ejecuciones esenciales')
if tables.get('07-JUGADORES-POR-EJECUCION.csv') != 24 * sum(1 for x in ex if x['record_level'] == 'world-essential'): fail('jugadores por ejecución ≠ 24 × ejecuciones esenciales (doce por equipo)')

# 4 · auditorías por versión: resumen = ejecuciones.csv = informe; integridad y universo
au = {}
for lec in sorted(glob.glob(f'{ROOT}/auditoria/*')):
    nm = os.path.basename(lec); ej = list(csv.DictReader(open(f'{lec}/ejecuciones.csv', encoding='utf-8'))); cnt = {}
    for e in ej: cnt[e['resultado']] = cnt.get(e['resultado'], 0) + 1
    rep = open(f'{lec}/informe-auditoria.md', encoding='utf-8').read(); m = re.search(r'Conformes al control: (\d+)', rep)
    if not m or int(m.group(1)) != cnt.get('conforme', 0): fail(f'{nm}: el informe no coincide con ejecuciones.csv')
    if os.path.exists(f'{lec}/resumen.json'):
        rs = json.load(open(f'{lec}/resumen.json'))
        if rs['por_resultado'] != cnt: fail(f'{nm}: resumen.json ≠ ejecuciones.csv')
    lect = json.load(open(f'{lec}/lectura.json')); au[nm] = {'por_resultado': cnt, 'partidos': lect['partidos'], 'lector': lect['lector']}
res['auditorias'] = au

# 5 · coste: cuatro trabajos reales con su tamaño y validez
cost = {}
for v in ('R0', 'R17'):
    for n in (100, 200):
        j = json.load(open(f'{ROOT}/coste/coste-{v}-{n}.json'))
        if j['n'] != n or j['counters']['solicitados'] != n or j['counters']['fallidos'] != 0 or j['counters']['validos'] != n: fail(f'coste {v}-{n}: recuentos')
        if j['config']['concurrency_requested'] != 4 or j['config']['concurrency_effective']['effective'] != 4: fail(f'coste {v}-{n}: concurrencia efectiva ≠ 4')
        cost[f'{v}-{n}'] = {'wall_s': round(j['timing_ms']['dispatch_to_last_persisted_wall'] / 1000, 1), 'total_s': round(j['timing_ms']['total_from_process_start'] / 1000, 1), 'validos': j['counters']['validos'], 'rss_mib': j['memory']['max_rss_mib_process_incl_worker_threads']}
res['coste'] = cost
print(json.dumps(res, indent=1, ensure_ascii=False)); print('RESULTADO:', 'CORRECTO' if ok else 'CON FALLOS')
os.makedirs(f'{ROOT}/logs', exist_ok=True); json.dump({'ok': ok, 'fallos': fails, **res}, open(f'{ROOT}/logs/verificacion-entrega.json', 'w'), indent=1, ensure_ascii=False)
sys.exit(0 if ok else 1)
