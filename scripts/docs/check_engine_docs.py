#!/usr/bin/env python3
"""Comprueba la documentacion del motor: integridad, navegacion y exportado.

Uso:
    python3 scripts/docs/check_engine_docs.py                  # integridad, enlaces, exportado
    python3 scripts/docs/check_engine_docs.py --importacion    # ademas, conservacion frente al original importado

--importacion compara las secciones con docs/historico/motor/unificado-original.md.
Solo tiene sentido en el punto de importacion: tras cambios funcionales aceptados
las secciones pueden diferir legitimamente del original historico.
Solo libreria estandar. Devuelve 0 si todo pasa y 1 si hay algun fallo.
"""
import argparse
import collections
import hashlib
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_engine_docs as B  # noqa: E402

ROOT, MOTOR = B.ROOT, B.MOTOR
DOCS = os.path.join(ROOT, 'docs')
FAILS = []


def report(ok, name, detail=None):
    print('%s  %s' % ('PASS' if ok else 'FAIL', name))
    if not ok:
        FAILS.append(name)
    for d in (detail or [])[:12]:
        print('        ' + d)
    if detail and len(detail) > 12:
        print('        ... (%d más)' % (len(detail) - 12))


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


def md_files():
    out = []
    for base in (ROOT,):
        for r, ds, fs in os.walk(base):
            ds[:] = [d for d in ds if d not in ('.git', 'node_modules')]
            for f in fs:
                if f.endswith('.md'):
                    out.append(os.path.join(r, f))
    return sorted(out)


def fence_flags(lines):
    return B.in_fence_flags(lines)


def slugs(lines):
    seen, out = collections.Counter(), set()
    fl = fence_flags(lines)
    for i, l in enumerate(lines):
        m = re.match(r'^#{1,6}\s+(.*?)\s*#*\s*$', l)
        if m and not fl[i]:
            t = re.sub(r'<[^>]+>', '', m.group(1)).lower()
            t = re.sub(r'[`*_\[\]()]', '', t)
            t = re.sub(r'[^\w\- ]', '', t).replace(' ', '-')
            n = seen[t]
            seen[t] += 1
            out.add(t if n == 0 else '%s-%d' % (t, n))
    return out


def anchors_of(text):
    lines = text.split('\n')
    return set(re.findall(r'<a id="([^"]+)"></a>', text)) | slugs(lines)


LINK = re.compile(r'(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')


def links_of(text):
    lines = text.split('\n')
    fl = fence_flags(lines)
    res = []
    for i, l in enumerate(lines):
        if fl[i]:
            continue
        l2 = re.sub(r'`[^`]*`', '', l)
        for m in LINK.finditer(l2):
            res.append((i + 1, m.group(1)))
    return res


def check_links(files):
    cache, bad, graph = {}, [], collections.defaultdict(set)
    total = 0
    for f in files:
        text = read(f)
        for ln, tgt in links_of(text):
            if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', tgt):
                continue
            total += 1
            path, _, frag = tgt.partition('#')
            dest = f if path == '' else os.path.normpath(os.path.join(os.path.dirname(f), path))
            if not os.path.exists(dest):
                bad.append('%s:%d -> %s (no existe)' % (os.path.relpath(f, ROOT), ln, tgt))
                continue
            if dest.endswith('.md') and os.path.isfile(dest):
                graph[f].add(dest)
                if frag:
                    if dest not in cache:
                        cache[dest] = anchors_of(read(dest))
                    if frag not in cache[dest]:
                        bad.append('%s:%d -> %s (ancla inexistente)' % (os.path.relpath(f, ROOT), ln, tgt))
    return total, bad, graph


def reachable(graph, starts):
    seen, stack = set(), list(starts)
    while stack:
        x = stack.pop()
        if x in seen:
            continue
        seen.add(x)
        stack.extend(graph.get(x, ()))
    return seen


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--importacion', action='store_true', help='compara tambien con el original importado')
    args = ap.parse_args(argv)
    man = B.load_manifest()
    blocks = man['bloques']
    by_id = {b['id']: b for b in blocks}

    # --- estructura del manifiesto y archivos
    missing = [b['archivo'] for b in blocks if not os.path.isfile(os.path.join(MOTOR, b['archivo']))]
    listed = {b['archivo'] for b in blocks}
    stray = []
    for r, ds, fs in os.walk(MOTOR):
        for f in fs:
            rel = os.path.relpath(os.path.join(r, f), MOTOR)
            if f.endswith('.md') and os.sep in rel and f != 'README.md' and rel.replace(os.sep, '/') not in listed:
                stray.append(rel)
    report(not missing and not stray, 'Manifiesto: todos los módulos existen y no hay módulos sin registrar', missing + stray)
    order = man['composicion']['orden']
    ids_ok = set(order) == set(by_id) | set(B.GENERATED)
    report(ids_ok, 'Manifiesto: el orden de composición cubre exactamente los bloques y los dos índices generados')

    # --- formato de pagina, tablas, bloques de codigo, ids
    fmt, ids = [], collections.defaultdict(list)
    for b in blocks:
        text = read(os.path.join(MOTOR, b['archivo']))
        try:
            content, rep = B.split_page(text)
        except Exception as e:  # noqa: BLE001
            fmt.append('%s: %s' % (b['archivo'], e))
            continue
        if text.count('```') % 2:
            fmt.append('%s: bloque de código sin cerrar' % b['archivo'])
        if rep != ('cabecera_repetida_desde_linea_origen' in b):
            fmt.append('%s: marca de cabecera repetida incoherente con el manifiesto' % b['archivo'])
        raw = text.split('\n')
        fl = fence_flags(raw)
        for i, l in enumerate(raw):
            if l.startswith('|') and not fl[i] and (i == 0 or not raw[i - 1].startswith('|')):
                nxt = raw[i + 1] if i + 1 < len(raw) else ''
                if not re.fullmatch(r'\|[\s:|-]+\|', nxt.strip()):
                    fmt.append('%s:%d: tabla sin cabecera y separador' % (b['archivo'], i + 1))
        for a in re.findall(r'<a id="([^"]+)"></a>', '\n'.join(content)):
            ids[a].append(b['archivo'])
    report(not fmt, 'Páginas: formato, bloques de código cerrados y tablas con cabecera tras la partición', fmt)
    dup = ['%s en %s' % (k, v) for k, v in ids.items() if len(v) > 1]
    report(not dup, 'Identificadores explícitos únicos (%d anclajes)' % len(ids), dup)
    mm = [k for k, v in man['anclajes'].items() if ids.get(k, [None])[0] != by_id[v]['archivo']]
    mm += [k for k in ids if k not in man['anclajes']]
    report(not mm, 'El mapa de anclajes del manifiesto coincide con los módulos', mm)

    # --- enlaces
    files = md_files()
    total, bad, graph = check_links(files)
    report(not bad, 'Enlaces locales de todos los Markdown (%d enlaces locales en %d archivos)' % (total, len(files)), bad)
    starts = [os.path.join(ROOT, 'README.md'), os.path.join(DOCS, 'README.md')]
    reach = reachable(graph, [s for s in starts if os.path.exists(s)])
    unreachable = [os.path.relpath(f, ROOT) for f in files if f.startswith(DOCS) and f not in reach]
    report(not unreachable, 'Todo documento de docs/ es alcanzable desde README.md o docs/README.md', unreachable)

    # --- exportado
    expected = B.compose(man)
    exp_path = B.EXPORT
    current = read(exp_path) if os.path.exists(exp_path) else None
    report(current == expected, 'Exportado: coincide con lo generado desde las secciones')
    if current is not None:
        etext = current
        eanch = set(re.findall(r'<a id="([^"]+)"></a>', etext))
        elinks = [t for _, t in links_of(etext) if t.startswith('#')]
        broken = sorted({t for t in elinks if t[1:] not in eanch and t[1:] not in slugs(etext.split('\n'))})
        report(not broken, 'Exportado: %d enlaces internos resueltos' % len(elinks), broken)
        dupe_e = [a for a, n in collections.Counter(re.findall(r'<a id="([^"]+)"></a>', etext)).items() if n > 1]
        report(not dupe_e, 'Exportado: sin identificadores duplicados', dupe_e)
        leaks = [m for m in ('beM:nav-inicio', 'beM:pie-inicio', 'beM:cab-repetida') if m in etext]
        report(not leaks, 'Exportado: sin marcas de navegación de las páginas', leaks)

    # --- importacion frente al original
    if args.importacion:
        hist = os.path.join(ROOT, 'docs', man['origen']['copia_historica'].replace('../', '', 1)) \
            if man['origen']['copia_historica'].startswith('../') else None
        hist = os.path.normpath(os.path.join(MOTOR, man['origen']['copia_historica']))
        raw = open(hist, 'rb').read()
        sha = hashlib.sha256(raw).hexdigest()
        report(sha == man['origen']['sha256'] and len(raw) == man['origen']['bytes'],
               'Original: SHA-256 y tamaño de la copia histórica coinciden con el manifiesto (%s)' % sha[:16])
        src = raw.decode('utf-8').split('\n')
        covered = [None] * len(src)
        diffs = []
        for b in blocks:
            s, e = b['lineas_origen']
            for i in range(s - 1, e):
                if covered[i] is not None:
                    diffs.append('%s solapa con %s en la línea %d' % (b['id'], covered[i], i + 1))
                covered[i] = b['id']
            got = B.read_block(b)
            want = src[s - 1:e]
            if got != want:
                k = next((j for j, (x, y) in enumerate(zip(got, want)) if x != y), min(len(got), len(want)))
                diffs.append('%s: difiere del original (primera diferencia en línea de origen %d; %d vs %d líneas)' % (b['id'], s + k, len(got), len(want)))
            elif hashlib.sha256('\n'.join(got).encode('utf-8')).hexdigest() != b['sha256_origen']:
                diffs.append('%s: huella del manifiesto incorrecta' % b['id'])
        report(not diffs, 'Importación: cada módulo reproduce literalmente sus líneas del original (%d bloques)' % len(blocks), diffs)
        for nv in man['navegacion_sustituida']:
            s, e = nv['lineas_origen']
            for i in range(s - 1, e):
                covered[i] = covered[i] or nv['id']
        left = ['línea %d: %r' % (i + 1, l[:60]) for i, l in enumerate(src[:-1] if src[-1] == '' else src) if covered[i] is None and l.strip()]
        report(not left, 'Importación: toda línea no vacía del original está en un módulo o es navegación sustituida', left)
        # blancos previos y reconstruccion completa
        gaps = []
        prev = -1
        ranges = sorted([(b['lineas_origen'][0] - 1, b['lineas_origen'][1] - 1, b['id'], b['lineas_en_blanco_previas']) for b in blocks] +
                        [(n['lineas_origen'][0] - 1, n['lineas_origen'][1] - 1, n['id'], None) for n in man['navegacion_sustituida']])
        for s, e, ident, bb in ranges:
            if bb is not None and bb != s - prev - 1:
                gaps.append('%s: líneas en blanco previas %d, esperadas %d' % (ident, bb, s - prev - 1))
            prev = e
        report(not gaps, 'Importación: separaciones en blanco registradas igual que en el original', gaps)
        a_orig = set(re.findall(r'<a id="([^"]+)"></a>', raw.decode('utf-8')))
        nav_text = '\n'.join('\n'.join(src[n['lineas_origen'][0] - 1:n['lineas_origen'][1]]) for n in man['navegacion_sustituida'])
        a_nav = set(re.findall(r'<a id="([^"]+)"></a>', nav_text))
        report(a_orig - a_nav == set(ids), 'Importación: los %d anclajes del original están todos en los módulos' % len(a_orig - a_nav))
        ntab = sum(1 for l in src if l.startswith('|'))
        nmod = sum(1 for b in blocks for l in B.read_block(b) if l.startswith('|'))
        nnav = sum(1 for l in nav_text.split('\n') if l.startswith('|'))
        report(ntab == nmod + nnav, 'Importación: filas de tabla conservadas (%d en el original, %d en los módulos)' % (ntab, nmod))
        chap = collections.Counter(b['capitulo'] for b in blocks if b['capitulo'])
        report(sorted(chap) == list(range(1, 35)), 'Importación: los 34 capítulos tienen destino (%d archivos)' % sum(chap.values()))

    print()
    if FAILS:
        print('RESULTADO: %d comprobaciones fallidas.' % len(FAILS))
        return 1
    print('RESULTADO: todas las comprobaciones pasan.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
