#!/usr/bin/env python3
"""MOTOR-18C §7: empaquetado de la evidencia pequeña de revisión (solo biblioteca estándar).

Genera en <out>/entrega-final/ (fuera de Git):
  MOTOR-18C-revision-rapida.zip   00-LEEME.md, identidad-casos.json, estados-y-recibos.json, cambios.patch, verificaciones/, recorrido-manual.md, manifiesto.json (sin suma circular del manifiesto sobre sí mismo).
El recibo MOTOR-18C-verificacion-final.json lo escribe scripts/m18c-verify-delivery.py DESPUÉS, fuera del ZIP.
Entradas: <out>/rapido (generadas por scripts/m18c-evidence.js) y <out>/verificaciones (salidas reales de los comandos) y <out>/navegador. Exige árbol limpio para que el parche sea el diff real de HEAD.
Uso: python3 scripts/m18c-package.py --out out/motor18c --base d744e23
"""
import argparse, hashlib, json, os, subprocess, sys, zipfile

ap = argparse.ArgumentParser(); ap.add_argument('--out', default='out/motor18c'); ap.add_argument('--base', default='d744e23'); ap.add_argument('--limit-mib', type=float, default=5)
a = ap.parse_args(); FINAL = os.path.join(a.out, 'entrega-final'); os.makedirs(FINAL, exist_ok=True)
git = lambda *x: subprocess.check_output(['git', *x], text=True)
if git('status', '--porcelain').strip():
    print('ERROR: el árbol no está limpio; confirma los cambios antes de empaquetar (el parche debe ser el diff real de HEAD).'); sys.exit(1)
base = git('rev-parse', a.base).strip(); head = git('rev-parse', 'HEAD').strip(); branch = git('rev-parse', '--abbrev-ref', 'HEAD').strip()
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: open(p, 'rb').read()
members = []  # (ruta en el zip, bytes, procedencia)
def add(arc, data, prov): members.append((arc, data, prov))

changed = git('diff', '--name-status', base, 'HEAD').strip().splitlines()
patch = git('diff', base, 'HEAD')
add('cambios.patch', patch.encode(), f'git diff {base[:7]}..{head[:7]} (completo: código, pruebas, scripts, documentación)')
for n in ['identidad-casos.json', 'estados-y-recibos.json']:
    add(n, read(os.path.join(a.out, 'rapido', n)), f'scripts/m18c-evidence.js · {n}')
add('verificaciones/comparacion-areas-deportivas.json', read(os.path.join(a.out, 'rapido', 'comparacion-areas-deportivas.json')), 'scripts/m18c-evidence.js · SHA-256 de src/ (salvo lab y version.js) y data/ entre base y árbol final')
vdir = os.path.join(a.out, 'verificaciones')
for n in sorted(os.listdir(vdir)):
    add(f'verificaciones/{n}', read(os.path.join(vdir, n)), f'salida real de comando · out/motor18c/verificaciones/{n}')
add('verificaciones/navegador/recorrido-navegador.json', read(os.path.join(a.out, 'navegador', 'recorrido-navegador.json')), 'scripts/browser/m18c-recorrido.mjs (Chromium)')
add('recorrido-manual.md', read('docs/prompts/MOTOR-18C-recorrido-manual.md'), 'docs/prompts/MOTOR-18C-recorrido-manual.md')

def tap(name):
    try:
        t = open(os.path.join(vdir, name), encoding='utf8').read()
    except FileNotFoundError:
        return None
    g = lambda k: next((int(l.split()[2]) for l in t.splitlines() if l.startswith(f'# {k} ')), None)
    return {'tests': g('tests'), 'pass': g('pass'), 'fail': g('fail')}
suite = tap('suite-completa.txt'); dirigidas = tap('t18c-dirigidas.txt'); anterior = tap('t18c-con-comportamiento-anterior.txt')
nav = json.loads(read(os.path.join(a.out, 'navegador', 'recorrido-navegador.json')))
ex = lambda n: open(os.path.join(vdir, n)).read().strip() if os.path.exists(os.path.join(vdir, n)) else 'no ejecutado'
leeme = f"""# MOTOR-18C — Revisión rápida de las dos correcciones de identidad

**Resultado real.** MOTOR-18C corrige REV18B-01 (M1 aparecía como aplicado por una aplicación de M10) y REV18B-02 (el resultado de una copia podía aplicarse a otra copia con los mismos equipos). Sin cambio deportivo. Implementado y comprobado por Claude; **la aceptación manual está pendiente de Dennis**.

## Git
- Rama: `{branch}` · commit inicial (base efectiva, MOTOR-18/18B ya fusionadas en `main`): `{base}` · commit final de la entrega: `{head}`
- Parche completo: `cambios.patch` (diff real `{base[:7]}..{head[:7]}`).

## Archivos cambiados
```
{chr(10).join(changed)}
```

## Alcance
C18-01: `isMatchApplied` (igualdad exacta de la fuente completa, equipo y recibo vigente). C18-02: `matchBelongsToCopy` (igualdad exacta de la identidad completa de copia extraída de `input.labMatchId`), comprobada al dibujar la tarjeta y de nuevo en el manejador. Detalle: `docs/tecnico/motor18c.md`.

## Contenido del ZIP
`identidad-casos.json` (52 filas T18C), `estados-y-recibos.json` (estado de aprendizaje, registro y secuencias por separado, con datos para recalcular las huellas), `cambios.patch`, `verificaciones/`, `recorrido-manual.md`, `manifiesto.json`.

## Comprobado por Claude (salidas reales en `verificaciones/`)
- Pruebas T18C-01…04 con la corrección: {dirigidas}. Con el comportamiento anterior (interfaz de `main`): {anterior} (T18C-01, 02 y 03 fallan; T18C-04 pasa porque la copia correcta no cambia).
- Suite completa (`npm test`): {suite}, código de salida {ex('suite-completa.exit')}. `npm run data:check`: ver `data-check.txt`. Comprobador documental sobre copia limpia: ver `doc-check.txt`.
- Recorrido de Chromium: {nav['passed']}/{nav['passed'] + nav['failed']} pasos, errores de consola {len(nav['consoleErrors'])}, de red {len(nav['netErrors'])}; **{nav['new_matches_played_in_walkthrough']} partido nuevo** jugado en el recorrido.
- Comparación de contenido de `src/` (salvo `lab/` y `version.js`) y `data/` entre base y árbol final: ver `verificaciones/comparacion-areas-deportivas.json`.

## Pendiente de Dennis
Recorrido manual (`recorrido-manual.md`).

## No ejecutado
Otros navegadores, Node 24, campañas de 36/100/200 partidos, `m18b-evidence.js` ni los scripts que regeneran la campaña de 18B (no hacen falta para estos arreglos). Los partidos que ejecuta la suite internamente no se contabilizan por separado (el recuento de la suite no está disponible).
"""
add('00-LEEME.md', leeme.encode(), 'scripts/m18c-package.py (generado desde los archivos finales)')

manifest = {'schema': 'beM-m18c-manifiesto/1', 'base': base, 'code_head': head, 'branch': branch, 'note': 'sin suma del propio manifiesto (no hay autorreferencia)',
            'files': [{'path': arc, 'bytes': len(data), 'sha256': sha(data), 'provenance': prov} for arc, data, prov in sorted(members)]}
add('manifiesto.json', json.dumps(manifest, indent=1).encode(), 'este paquete')
zpath = os.path.join(FINAL, 'MOTOR-18C-revision-rapida.zip')
if os.path.exists(zpath): os.remove(zpath)
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for arc, data, _ in sorted(members, key=lambda m: (m[0] != '00-LEEME.md', m[0])):
        zi = zipfile.ZipInfo(arc, date_time=(2026, 10, 22, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16; z.writestr(zi, data, compresslevel=9)
size = os.path.getsize(zpath)
if size > a.limit_mib * 1024 * 1024:
    print(f'ERROR: el ZIP pesa {size / 1048576:.2f} MiB (> {a.limit_mib} MiB)'); sys.exit(1)
print(json.dumps({'zip': zpath, 'bytes': size, 'sha256': sha(read(zpath)), 'members': len(members)}))
