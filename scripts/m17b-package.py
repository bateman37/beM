#!/usr/bin/env python3
"""MOTOR-17B §13: empaqueta la entrega para ChatGPT con herramientas estándar (sin dependencias). No interpreta nada y NO repite ningún partido.
Orden (sin dependencias circulares de hashes): 1) evidencia detallada (ZIP internos de ZIP_DEFLATED dentro de partes ≤ 64 MiB), 2) paquete rápido (objetivo ≤ 5 MiB) que incluye el índice SOLO de las partes,
3) índice EXTERNO `MOTOR-17B-indice-partes.json` con tamaños reales y SHA-256 del rápido y de cada parte. El recibo `MOTOR-17B-verificacion-final.json` lo escribe `m17b-verify-delivery.py` FUERA de estos ZIP
(no se incluye ni se autorreferencia aquí: así no hay que regenerar ningún ZIP para contener la prueba de su propia descarga).
Uso: python3 scripts/m17b-package.py [--root out/motor17b] [--implementation-commit <sha>]
"""
import os, sys, json, glob, hashlib, zipfile, subprocess, shutil

ROOT = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else 'out/motor17b'
FINAL = f'{ROOT}/entrega-final'; STAGE = f'{ROOT}/_stage'; LIM = 64 * 1024 * 1024; QUICK_TARGET = 5 * 1024 * 1024
STUDY = 'MOTOR17B-CIERRE-20261021'
os.makedirs(FINAL, exist_ok=True)

def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()

def zip_dir(src, dst, arcroot=None, skip=()):
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        for base, dirs, files in os.walk(src):
            dirs[:] = [d for d in sorted(dirs) if d not in skip]
            for fn in sorted(files):
                p = os.path.join(base, fn); rel = os.path.relpath(p, src)
                z.write(p, os.path.join(arcroot, rel) if arcroot else rel)

freeze = json.load(open(f'{ROOT}/plan/00-congelacion.json'))
plan = {v: json.load(open(f'{ROOT}/plan/lotes-{v}.json')) for v in ('CONTROL17', 'M17B')}
impl = sys.argv[sys.argv.index('--implementation-commit') + 1] if '--implementation-commit' in sys.argv else freeze['git']['M17B']['head']
head = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
shutil.rmtree(STAGE, ignore_errors=True); os.makedirs(f'{STAGE}/esenciales', exist_ok=True); os.makedirs(f'{STAGE}/diagnosticos', exist_ok=True)
items = []  # (ruta interna, origen, categoría, etiqueta)

# 1a. lotes esenciales por versión (directorio íntegro de cada lote: entradas congeladas con perfiles y órdenes, índice y registros)
for v in ('CONTROL17', 'M17B'):
    out = f'{STAGE}/esenciales/ESE-{v}.zip'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        lots = [l for l in plan[v]['lots'] if l['kind'] == 'principal']
        for l in lots:
            d = f"{ROOT}/lotes/{v}/{l['batch_id']}"
            for base, _, files in os.walk(d):
                for fn in sorted(files):
                    p = os.path.join(base, fn); z.write(p, os.path.join(l['label'], os.path.relpath(p, d)))
        z.writestr('LOTES.json', json.dumps([{'label': l['label'], 'batch_id': l['batch_id'], 'block': l['block'], 'case': l.get('case'), 'executions': l['executions'], 'level': l['level'], 'profile': l['profile']} for l in lots], indent=1))
    items.append((f'esenciales/ESE-{v}.zip', out, 'esencial', v))
# 1b. los doce diagnósticos (solo M17B): lote íntegro por diagnóstico
for l in [x for x in plan['M17B']['lots'] if x['kind'] == 'diagnostico']:
    d = f"{ROOT}/lotes/M17B/{l['batch_id']}"; out = f"{STAGE}/diagnosticos/DIAG-{l['label']}.zip"; zip_dir(d, out, arcroot=l['label'])
    items.append((f"diagnosticos/DIAG-{l['label']}.zip", out, 'diagnostico', l['label']))
# 1c. auditoría (sin la caché de proyecciones, reconstruible), plan, evidencia, comprobaciones y comandos
def add_dir_zip(name, src, cat, skip=()):
    if not os.path.isdir(src): return
    out = f'{STAGE}/{name}.zip'; zip_dir(src, out, arcroot=name, skip=skip); items.append((f'{name}.zip', out, cat, name))
add_dir_zip('auditoria', f'{ROOT}/auditoria', 'auditoria', skip=('raiz-auditoria',)); add_dir_zip('plan', f'{ROOT}/plan', 'plan'); add_dir_zip('evidencia', f'{ROOT}/evidencia', 'evidencia'); add_dir_zip('logs', f'{ROOT}/logs', 'logs'); add_dir_zip('comprobaciones', f'{ROOT}/comprobaciones', 'comprobaciones'); add_dir_zip('informes', f'{ROOT}/informes', 'informes')
add_dir_zip('rapido-tablas', f'{ROOT}/rapido', 'tablas')
# 1d. código pertinente de M17B (sin .git, node_modules, secretos ni otros repositorios) y diff frente a CONTROL17
code = f'{STAGE}/codigo'; os.makedirs(code, exist_ok=True)
subprocess.check_call(f'git archive {head} src scripts data docs/tecnico/motor17b.md docs/tecnico/evidencia-motor17b docs/prompts/MOTOR-17B-cierre-y-auditoria-acotada.md docs/prompts/MOTOR-17B-recorrido-manual.md tests/motor17b.test.js tests/fixtures/baseline-motor17b.json package.json | tar -x -C {code}', shell=True)
control = freeze['git']['CONTROL17']['head']
with open(f'{code}/control17-m17b.diff', 'wb') as f: f.write(subprocess.check_output(['git', 'diff', control, head, '--', 'src', 'scripts', 'data', 'tests']))
open(f'{code}/LEEME-CODIGO.md', 'w', encoding='utf-8').write(f'# Código pertinente de MOTOR-17B (solo lectura)\n\nImplementación auditada (commit congelado antes de simular): `{impl}`. Commit de documentación y embalaje: `{head}`.\nDiff frente a CONTROL17 (`{control}`, MOTOR-17): `control17-m17b.diff` (src, scripts, data, tests). CONTROL17 no va incluido: se reproduce con `git worktree add --detach <ruta> {control}`.\nSin `.git`, `node_modules`, `.env` ni otros repositorios.\n')
out = f'{STAGE}/codigo-M17B-y-diff.zip'; zip_dir(code, out, arcroot='codigo'); items.append(('codigo-M17B-y-diff.zip', out, 'codigo', 'M17B'))

# ---- partes (agrupación estable por orden; ningún elemento se repite entre partes)
parts = []; cur = []; size = 0
for it in items:
    s = os.path.getsize(it[1])
    if cur and size + s > LIM: parts.append(cur); cur = []; size = 0
    cur.append(it); size += s
if cur: parts.append(cur)
n = len(parts); index = {'schema': 'motor17b-indice-partes/1', 'study': STUDY, 'implementation_commit': impl, 'packaging_commit': head, 'parts': []}
for f in glob.glob(f'{FINAL}/MOTOR-17B-evidencia-detallada*.zip'): os.remove(f)
single = n == 1
for i, part in enumerate(parts, 1):
    name = 'MOTOR-17B-evidencia-detallada.zip' if single else f'MOTOR-17B-evidencia-detallada-parte-{i:02d}-de-{n:02d}.zip'; out = f'{FINAL}/{name}'; inv = []
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED, allowZip64=True) as z:
        for inner, src, cat, lab in part:
            z.write(src, inner); inv.append({'path': inner, 'bytes': os.path.getsize(src), 'sha256': sha(src), 'category': cat, 'label': lab})
        z.writestr('INVENTARIO-PARTE.json', json.dumps({'part': i, 'of': n, 'files': inv}, indent=1))
    index['parts'].append({'part': i, 'file': name, 'bytes': os.path.getsize(out), 'sha256': sha(out), 'contents': inv})
print(n, 'parte(s);', sum(p['bytes'] for p in index['parts']) // 1048576, 'MiB;', len(items), 'ZIP internos')

# ---- paquete rápido (objetivo ≤ 5 MiB): lectura, resumen, plan, resultados, auditoría, sensibilidad, pruebas y navegador; sin esenciales brutos
quick = f'{STAGE}/rapido'; shutil.rmtree(quick, ignore_errors=True); os.makedirs(quick)
def cp(src, dst):
    os.makedirs(os.path.dirname(f'{quick}/{dst}') or quick, exist_ok=True)
    if os.path.isdir(src): shutil.copytree(src, f'{quick}/{dst}')
    elif os.path.exists(src): shutil.copy(src, f'{quick}/{dst}')
EV = 'docs/tecnico/evidencia-motor17b'
cp(f'{EV}/00-LEEME.md', '00-LEEME.md'); cp(f'{EV}/RESUMEN-OPERATIVO.md', '01-RESUMEN-OPERATIVO.md'); cp(f'{EV}/01-HALLAZGOS-B17.csv', '02-HALLAZGOS-B17.csv'); cp(f'{ROOT}/plan/00-congelacion.json', '03-IDENTIDADES-Y-GIT.json'); cp(f'{ROOT}/plan', '04-PLAN-CONGELADO'); cp(f'{ROOT}/rapido', '05-RESULTADOS')
for lec in sorted(glob.glob(f'{ROOT}/auditoria/*')):
    nm = os.path.basename(lec)
    for fn in ('informe-auditoria.md', 'ejecuciones.csv', 'hallazgos.jsonl', 'capacidades.csv', 'sensibilidad.csv', 'contextos-contraste.jsonl', 'fiabilidad.csv', 'resumen.json', 'lectura.json', 'referencias.json', 'concentracion.json', 'partidos.csv', 'catalogo.json'):
        if os.path.exists(f'{lec}/{fn}'): os.makedirs(f'{quick}/06-AUDITORIA-Y-SENSIBILIDAD/{nm}', exist_ok=True); shutil.copy(f'{lec}/{fn}', f'{quick}/06-AUDITORIA-Y-SENSIBILIDAD/{nm}/{fn}')
cp(f'{ROOT}/evidencia', '07-EVIDENCIA-DE-CAUSAS'); cp(f'{ROOT}/logs', '08-LOGS-DE-EJECUCION'); cp(f'{ROOT}/comprobaciones', '09-PRUEBAS-Y-DATOS'); cp(f'{ROOT}/informes', '10-NAVEGADOR'); cp(f'{EV}/DICCIONARIO.md', '11-DICCIONARIO.md')
json.dump(index, open(f'{quick}/12-INDICE-DE-PARTES.json', 'w'), indent=1)
qz = f'{FINAL}/MOTOR-17B-revision-rapida.zip'
with zipfile.ZipFile(qz, 'w', zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as z:
    for base, _, files in os.walk(quick):
        for fn in sorted(files): p = os.path.join(base, fn); z.write(p, os.path.relpath(p, quick))
qsize = os.path.getsize(qz)
# ---- índice externo
ext = dict(index); ext['quick'] = {'file': 'MOTOR-17B-revision-rapida.zip', 'bytes': qsize, 'sha256': sha(qz), 'target_bytes': QUICK_TARGET, 'within_target': qsize <= QUICK_TARGET, 'over_target_cause': None if qsize <= QUICK_TARGET else 'ver informe: superado el objetivo de 5 MiB; no se eliminó evidencia para falsear el tamaño'}
ext['note'] = 'índice externo: lista el paquete rápido y las partes de la evidencia detallada con tamaños reales (bytes) y SHA-256; el paquete rápido contiene una copia del índice SOLO de las partes (sin su propio hash, para evitar dependencias circulares). El recibo de verificación y descarga está FUERA de estos archivos.'
json.dump(ext, open(f'{FINAL}/MOTOR-17B-indice-partes.json', 'w'), indent=1)
print('rápido', qsize // 1024, 'KiB', 'sha256', ext['quick']['sha256'][:16], '· dentro del objetivo de 5 MiB:', qsize <= QUICK_TARGET)
