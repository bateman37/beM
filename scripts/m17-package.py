#!/usr/bin/env python3
"""MOTOR-17 §18: empaqueta la entrega para ChatGPT con herramientas estándar (sin dependencias). No interpreta nada.
Orden (sin dependencias circulares de hashes): 1) evidencia detallada en partes (~64 MiB, ZIP_STORED de ZIP ya comprimidos), 2) paquete rápido (≤ ~10 MiB) que incluye el índice de partes,
3) índice EXTERNO `MOTOR-17-indice-partes.json` con tamaños reales y SHA-256 de partes y paquete rápido.
Uso: python3 scripts/m17-package.py [--root out/motor17]
"""
import os, sys, json, glob, hashlib, zipfile, subprocess, shutil, io

ROOT = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else 'out/motor17'
FINAL = f'{ROOT}/entrega-final'; STAGE = f'{ROOT}/_stage'; LIM = 64 * 1024 * 1024
os.makedirs(FINAL, exist_ok=True)

def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()

def zip_dir(src, dst, arcroot=None):
    """Comprime un directorio en un ZIP (deflate) conservando rutas relativas."""
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        for base, _, files in os.walk(src):
            for fn in sorted(files):
                p = os.path.join(base, fn); rel = os.path.relpath(p, os.path.dirname(src) if arcroot is None else src)
                z.write(p, rel if arcroot is None else os.path.join(arcroot, rel))

plan = {v: json.load(open(f'{ROOT}/plan/lotes-{v}.json')) for v in ('R0', 'R17')}
shutil.rmtree(STAGE, ignore_errors=True); os.makedirs(f'{STAGE}/esenciales', exist_ok=True)
items = []  # (ruta interna, origen, categoría, etiqueta)

# 1a. lotes esenciales por versión y bloque (directorio íntegro del lote: entradas congeladas, índice y registros)
for v in ('R0', 'R17'):
    for blk in 'ABCD':
        lots = [l for l in plan[v]['lots'] if l['block'] == blk and l['kind'] == 'principal']
        out = f'{STAGE}/esenciales/ESE-{v}-{blk}.zip'
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
            for l in lots:
                d = f"{ROOT}/lotes/{v}/{l['batch_id']}"
                for base, _, files in os.walk(d):
                    for fn in sorted(files):
                        p = os.path.join(base, fn); z.write(p, os.path.join(l['batch_id'], os.path.relpath(p, d)))
            z.writestr('LOTES.json', json.dumps([{ 'label': l['label'], 'batch_id': l['batch_id'], 'executions': l['executions'], 'level': l['level'] } for l in lots], indent=1))
        items.append((f'esenciales/ESE-{v}-{blk}.zip', out, 'esencial', f'{v}-{blk}'))

# 1b. paquetes de análisis (beM-analysis-package/1) de los diagnósticos, construidos antes con la función existente (scripts/m17-diag-packages.mjs)
for d in sorted(glob.glob(f'{ROOT}/paquetes/*')):
    for p in sorted(glob.glob(f'{d}/*.zip')): items.append((f'diagnosticos/{os.path.basename(d)}/{os.path.basename(p)}', p, 'diagnostico', os.path.basename(d)))

# 1c. auditorías, coste, equivalencia, evidencia de causas, plan, informes y registros
def add_dir_zip(name, src, cat):
    if not os.path.isdir(src): return
    out = f'{STAGE}/{name}.zip'; zip_dir(src, out, arcroot=name); items.append((f'{name}.zip', out, cat, name))
add_dir_zip('auditorias', f'{ROOT}/auditoria', 'auditoria'); add_dir_zip('coste', f'{ROOT}/coste', 'coste'); add_dir_zip('equivalencia', f'{ROOT}/equivalencia', 'equivalencia')
add_dir_zip('evidencia-de-causas', f'{ROOT}/evidencia', 'causas'); add_dir_zip('desarrollo', f'{ROOT}/desarrollo-resultados', 'desarrollo'); add_dir_zip('plan', f'{ROOT}/plan', 'plan')
add_dir_zip('informes', f'{ROOT}/informes', 'informes'); add_dir_zip('logs', f'{ROOT}/logs', 'logs'); add_dir_zip('comandos', f'{ROOT}/comandos', 'comandos')
# 1d. código pertinente de solo lectura de R17 y diff frente a R0 (sin .git, node_modules, secretos ni otros repositorios)
code = f'{STAGE}/codigo'; os.makedirs(code, exist_ok=True)
head = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
subprocess.check_call(f'git archive {head} src scripts data docs/tecnico/motor17.md docs/tecnico/evidencia-motor17 docs/prompts/MOTOR-17-ajustes-rendimiento-y-auditoria-de-cierre.md docs/prompts/MOTOR-17-recorrido-manual.md tests/motor17.test.js tests/fixtures/baseline-motor17.json package.json | tar -x -C {code}', shell=True)
with open(f'{code}/r0-r17.diff', 'wb') as f: f.write(subprocess.check_output(['git', 'diff', '6a6814c', head, '--', 'src', 'scripts', 'data', 'tests']))
open(f'{code}/LEEME-CODIGO.md', 'w', encoding='utf-8').write(f'# Código pertinente de R17 (solo lectura)\n\nCommit de R17: `{head}`. Diff frente a R0 (`6a6814c`, MOTOR-15B): `r0-r17.diff` (src, scripts, data, tests). R0 no va incluido: se reproduce con `git worktree add --detach <ruta> 6a6814c`. Sin `.git`, `node_modules`, `.env` ni otros repositorios.\n')
out = f'{STAGE}/codigo-R17-y-diff.zip'; zip_dir(code, out, arcroot='codigo'); items.append(('codigo-R17-y-diff.zip', out, 'codigo', 'R17'))
# 1e. hojas de datos compactas (las mismas del paquete rápido) para que la evidencia detallada sea autosuficiente
add_dir_zip('rapido-tablas', f'{ROOT}/rapido', 'tablas')

# ---- partes
parts = []; cur = []; size = 0
for it in items:
    s = os.path.getsize(it[1])
    if cur and size + s > LIM: parts.append(cur); cur = []; size = 0
    cur.append(it); size += s
if cur: parts.append(cur)
n = len(parts); index = {'schema': 'motor17-indice-partes/1', 'study': 'MOTOR17-CIERRE-20261018', 'r17_commit': head, 'parts': []}
for f in glob.glob(f'{FINAL}/MOTOR-17-evidencia-detallada*.zip'): os.remove(f)
for i, part in enumerate(parts, 1):
    name = f'MOTOR-17-evidencia-detallada-parte-{i:02d}-de-{n:02d}.zip'; out = f'{FINAL}/{name}'; inv = []
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED, allowZip64=True) as z:
        for inner, src, cat, lab in part:
            z.write(src, inner); inv.append({'path': inner, 'bytes': os.path.getsize(src), 'sha256': sha(src), 'category': cat, 'label': lab})
        z.writestr('INVENTARIO-PARTE.json', json.dumps({'part': i, 'of': n, 'files': inv}, indent=1))
    index['parts'].append({'part': i, 'file': name, 'bytes': os.path.getsize(out), 'sha256': sha(out), 'contents': inv})
json.dump(index, open(f'{STAGE}/indice-partes-sin-rapido.json', 'w'), indent=1)
print(n, 'partes;', sum(p['bytes'] for p in index['parts']) // 1048576, 'MiB;', len(items), 'ZIP internos')

# ---- paquete rápido (≤ ~10 MiB): lectura, resumen, hipótesis, cambios, identidades, plan, resultados, auditorías, coste y diccionario
quick = f'{STAGE}/rapido'; shutil.rmtree(quick, ignore_errors=True); os.makedirs(quick)
def cp(src, dst):
    os.makedirs(os.path.dirname(f'{quick}/{dst}'), exist_ok=True)
    if os.path.isdir(src): shutil.copytree(src, f'{quick}/{dst}')
    elif os.path.exists(src): shutil.copy(src, f'{quick}/{dst}')
EV = 'docs/tecnico/evidencia-motor17'
cp(f'{EV}/00-LEEME.md', '00-LEEME.md'); cp(f'{EV}/RESUMEN-OPERATIVO.md', '01-RESUMEN-OPERATIVO.md'); cp(f'{EV}/01-HIPOTESIS.csv', '02-HIPOTESIS.csv'); cp(f'{EV}/02-CAMBIOS.csv', '03-TABLA-DE-CAMBIOS.csv')
cp(f'{ROOT}/plan/00-congelacion.json', '04-IDENTIDADES-Y-GIT.json'); cp(f'{ROOT}/plan', '05-PLAN-CONGELADO'); cp(f'{ROOT}/rapido', '06-RESULTADOS'); cp(f'{ROOT}/evidencia', '10-EVIDENCIA-DE-CAUSAS'); cp(f'{ROOT}/desarrollo-resultados', '11-DESARROLLO-Y-CANDIDATAS')
cp(f'{ROOT}/coste', '08-COSTE'); cp(f'{ROOT}/equivalencia', '09-EQUIVALENCIA'); cp(f'{EV}/DICCIONARIO.md', '12-DICCIONARIO.md'); cp(f'{ROOT}/informes', '13-PRUEBAS-Y-NAVEGADOR'); cp(f'{ROOT}/logs/pruebas', '13-PRUEBAS-Y-NAVEGADOR/pruebas')
for lec in sorted(glob.glob(f'{ROOT}/auditoria/*')):
    nm = os.path.basename(lec); os.makedirs(f'{quick}/07-AUDITORIAS/{nm}', exist_ok=True)
    for fn in ('informe-auditoria.md', 'ejecuciones.csv', 'hallazgos.jsonl', 'capacidades.csv', 'sensibilidad.csv', 'fiabilidad.csv', 'resumen.json', 'lectura.json', 'referencias.json', 'concentracion.json', 'partidos.csv', 'catalogo.json'):
        if os.path.exists(f'{lec}/{fn}'): shutil.copy(f'{lec}/{fn}', f'{quick}/07-AUDITORIAS/{nm}/{fn}')
json.dump(index, open(f'{quick}/14-INDICE-DE-PARTES.json', 'w'), indent=1)
qz = f'{FINAL}/MOTOR-17-revision-rapida.zip'
with zipfile.ZipFile(qz, 'w', zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as z:
    for base, _, files in os.walk(quick):
        for fn in sorted(files): p = os.path.join(base, fn); z.write(p, os.path.relpath(p, quick))
# ---- índice externo
ext = dict(index); ext['quick'] = {'file': 'MOTOR-17-revision-rapida.zip', 'bytes': os.path.getsize(qz), 'sha256': sha(qz)}; ext['note'] = 'índice externo: lista las partes de la evidencia detallada y el paquete rápido con tamaños reales (bytes) y SHA-256; el paquete rápido contiene una copia del índice SOLO de las partes (sin su propio hash, para evitar dependencias circulares)'
json.dump(ext, open(f'{FINAL}/MOTOR-17-indice-partes.json', 'w'), indent=1)
print('rápido', os.path.getsize(qz) // 1024, 'KiB', 'sha256', ext['quick']['sha256'][:16])
