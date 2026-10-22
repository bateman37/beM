#!/usr/bin/env python3
"""MOTOR-18 §16: empaquetado de la campaña MOTOR18B-CIERRE-20261022 (solo biblioteca estándar).

Genera en <out>/entrega-final/ (fuera de Git):
  MOTOR-18B-revision-rapida.zip      ≤ 5 MiB: LEEME, resumen generado, agenda, congelación, tablas, parámetros SEM18, L18, correcciones 17B.
  MOTOR-18B-evidencia-detallada[-pNN].zip   partes ≤ 64 MiB: entradas congeladas, esenciales, diagnósticos completos (C), exposiciones, D02, L18,
                                    diff de código del control a este árbol, auditoría y logs.
  MOTOR-18B-indice-partes.json       tamaños, SHA-256 y contenido de cada archivo final (sin autorreferencia).
El recibo MOTOR-18B-verificacion-final.json lo escribe scripts/m18-verify-delivery.py DESPUÉS, fuera de los ZIP.
Uso: python3 scripts/m18-package.py --out out/motor18bb --tree /ruta/m18 --control /ruta/control17b
"""
import argparse, hashlib, json, os, subprocess, sys, zipfile

ap = argparse.ArgumentParser(); ap.add_argument('--out', default='out/motor18bb'); ap.add_argument('--tree', default='.'); ap.add_argument('--control', default='/home/user/control17b')
ap.add_argument('--quick-limit-mib', type=float, default=5); ap.add_argument('--part-mib', type=float, default=64)
a = ap.parse_args(); OUT = a.out; FINAL = os.path.join(OUT, 'entrega-final'); os.makedirs(FINAL, exist_ok=True)
MIB = 1024 * 1024


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def walk(base, skip=()):
    for root, _, files in os.walk(base):
        for n in sorted(files):
            p = os.path.join(root, n)
            if any(s in p for s in skip):
                continue
            yield p


# ---------------------------------------------------------------- paquete rápido
quick = os.path.join(FINAL, 'MOTOR-18BB-revision-rapida.zip'); quick_files = []
with zipfile.ZipFile(quick, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in walk(os.path.join(OUT, 'rapido')):
        arc = os.path.relpath(p, os.path.join(OUT, 'rapido')); z.write(p, arc); quick_files.append(arc)
    for n in ['00-congelacion.json', 'AGENDA.json', 'AGENDA.md']:
        p = os.path.join(OUT, 'plan', n)
        if os.path.exists(p):
            z.write(p, n); quick_files.append(n)
quick_bytes = os.path.getsize(quick)
if quick_bytes > a.quick_limit_mib * MIB:
    print(f'ERROR: el paquete rápido pesa {quick_bytes / MIB:.2f} MiB (> {a.quick_limit_mib} MiB)'); sys.exit(1)

# ---------------------------------------------------------------- evidencia detallada (partes)
members = []  # (ruta en disco, ruta en el zip)
for sub in ['plan', 'especiales', 'logs', 'verificaciones', 'auditoria']:
    d = os.path.join(OUT, sub)
    if os.path.isdir(d):
        for p in walk(d):
            members.append((p, os.path.join(sub, os.path.relpath(p, d))))
lots = os.path.join(OUT, 'lotes')
if os.path.isdir(lots):
    for p in walk(lots):
        rel = os.path.relpath(p, lots)
        members.append((p, os.path.join('lotes', rel)))
# diff de código del control a este árbol (lectura independiente) + L18
try:
    ch = subprocess.check_output(['git', '-C', a.control, 'rev-parse', 'HEAD'], text=True).strip()
    diff = subprocess.check_output(['git', '-C', a.tree, 'diff', ch, 'HEAD', '--', 'src', 'scripts', 'tests', 'data', 'docs/tecnico', 'docs/motor'], text=True)
except Exception as e:  # el diff es evidencia de lectura, no un requisito de integridad
    ch = None; diff = f'diff no disponible: {e}\n'
dp = os.path.join(FINAL, '_codigo-control-a-m18.patch'); open(dp, 'w').write(diff); members.append((dp, 'codigo/control-a-m18.patch'))
l18 = os.path.join(a.tree, 'docs/tecnico/evidencia-motor18/l18')
if os.path.isdir(l18):
    for p in walk(l18):
        members.append((p, os.path.join('l18', os.path.relpath(p, l18))))
for f in os.listdir(FINAL):
    if f.startswith('MOTOR-18BB-evidencia-detallada'):
        os.remove(os.path.join(FINAL, f))
parts = []; cur = None; zf = None; idx = 0; limit = a.part_mib * MIB * 0.97


def open_part():
    global cur, zf, idx
    idx += 1; cur = os.path.join(FINAL, f'MOTOR-18BB-evidencia-detallada-p{idx:02d}.zip'); zf = zipfile.ZipFile(cur, 'w', zipfile.ZIP_DEFLATED, compresslevel=6); parts.append({'file': cur, 'members': []})


open_part()
for src, arc in members:
    if os.path.getsize(cur) > limit:
        zf.close(); open_part()
    zf.write(src, arc); parts[-1]['members'].append(arc)
zf.close(); os.remove(dp)
if len(parts) == 1:
    final = os.path.join(FINAL, 'MOTOR-18BB-evidencia-detallada.zip'); os.replace(parts[0]['file'], final); parts[0]['file'] = final
for p in parts:
    if os.path.getsize(p['file']) > a.part_mib * MIB:
        print('ERROR: una parte supera el límite', p['file']); sys.exit(1)

# ---------------------------------------------------------------- índice (sin autorreferencia)
def entry(path, role, content):
    return {'file': os.path.basename(path), 'bytes': os.path.getsize(path), 'sha256': sha(path), 'role': role, 'content': content}


index = {'schema': 'beM-delivery-index/1', 'study': 'MOTOR18B-CIERRE-20261022', 'control_head': ch,
         'files': [entry(quick, 'revision-rapida', {'members': len(quick_files), 'names': sorted(quick_files)})] +
                  [entry(p['file'], 'evidencia-detallada', {'members': len(p['members']), 'by_top_dir': {k: sum(1 for m in p['members'] if m.split('/')[0] == k) for k in sorted({m.split('/')[0] for m in p['members']})}}) for p in parts],
         'note': 'el recibo MOTOR-18B-verificacion-final.json va fuera de los ZIP y no figura aquí (no hay autorreferencia).'}
with open(os.path.join(FINAL, 'MOTOR-18BB-indice-partes.json'), 'w') as f:
    json.dump(index, f, indent=1)
print(json.dumps({'quick_mib': round(quick_bytes / MIB, 2), 'parts': [(os.path.basename(p['file']), round(os.path.getsize(p['file']) / MIB, 1)) for p in parts]}))
