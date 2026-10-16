#!/usr/bin/env python3
"""Genera el funcional completo vigente del motor a partir de las secciones.

Uso:
    python3 scripts/docs/build_engine_docs.py           # escribe el exportado
    python3 scripts/docs/build_engine_docs.py --check   # solo comprueba que esta al dia

Lee docs/motor/manifest.json y los modulos de docs/motor/<tema>/ en el orden
del manifiesto, quita la navegacion anadida (cabecera, pie y cabeceras de tabla
repetidas), devuelve los enlaces internos a la forma «](#ancla)» y escribe
docs/exportados/beM-MOTOR-COMPLETO-VIGENTE.md. Solo libreria estandar. No
introduce marcas de tiempo: reconstruir sin cambios no modifica el archivo.
"""
import argparse
import hashlib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MOTOR = os.path.join(ROOT, 'docs', 'motor')
EXPORT = os.path.join(ROOT, 'docs', 'exportados', 'beM-MOTOR-COMPLETO-VIGENTE.md')

NAV_FIN = '<!-- beM:nav-fin -->'
PIE_INICIO = '<!-- beM:pie-inicio -->'
CAB_REP = '<!-- beM:cab-repetida -->'
GENERATED = ('indice-general', 'indice-detallado')
LINK_FILE = re.compile(r'\]\((?![A-Za-z][A-Za-z0-9+.-]*:)([^)#\s:]+\.md)#([^)\s]+)\)')
ANCHOR_LINE = re.compile(r'<a id="([^"]+)"></a>')


def load_manifest():
    with open(os.path.join(MOTOR, 'manifest.json'), encoding='utf-8') as f:
        return json.load(f)


def split_page(text):
    """Devuelve (lineas_de_contenido, tiene_cabecera_repetida) de una pagina."""
    lines = text.split('\n')
    if lines and lines[-1] == '':
        lines.pop()
    start = lines.index(NAV_FIN) + 2
    end = lines.index(PIE_INICIO)
    if lines[end - 1] != '' or lines[start - 1] != '':
        raise ValueError('formato de pagina no valido (faltan lineas en blanco de separacion)')
    content = lines[start:end - 1]
    rep = bool(content) and content[0] == CAB_REP
    if rep:
        content = content[3:]
    content = [LINK_FILE.sub(r'](#\2)', l) for l in content]
    return content, rep


def read_block(block):
    with open(os.path.join(MOTOR, block['archivo']), encoding='utf-8') as f:
        return split_page(f.read())[0]


def in_fence_flags(lines):
    flags, inside = [], False
    for l in lines:
        if l.startswith('```'):
            flags.append(True)
            inside = not inside
        else:
            flags.append(inside)
    return flags


def generated_indexes(blocks_content):
    """Indices general y detallado a partir de los encabezados de los capitulos."""
    caps = []  # (numero, titulo, ancla, [(titulo, ancla)])
    for lines in blocks_content:
        fl = in_fence_flags(lines)
        for i, l in enumerate(lines):
            if fl[i]:
                continue
            m2 = re.match(r'^## (\d+)\. (.*)$', l)
            m3 = re.match(r'^### (.*)$', l)
            if not (m2 or m3):
                continue
            j, ids = i - 1, []
            while j >= 0 and (lines[j].strip() == '' or ANCHOR_LINE.fullmatch(lines[j])):
                m = ANCHOR_LINE.fullmatch(lines[j])
                if m:
                    ids.append(m.group(1))
                j -= 1
            if m2:
                anchor = next((a for a in ids if a.startswith('cap-')), None)
                caps.append([int(m2.group(1)), m2.group(2), anchor, []])
            else:
                anchor = next((a for a in ids if a.startswith(('grupo-', 'traza-'))), ids[-1] if ids else None)
                caps[-1][3].append((m3.group(1), anchor))
    general = ['## Índice general', '', '_Índice generado a partir de los encabezados de los capítulos._', '']
    for n, t, a, _ in caps:
        general.append('%d. [%s](#%s)' % (n, t, a))
    detail = ['## Índice detallado', '']
    for n, t, a, subs in caps:
        detail += ['**[%d. %s](#%s)**' % (n, t, a), '']
        for st, sa in subs:
            detail.append('- [%s](#%s)' % (st, sa) if sa else '- %s' % st)
        detail.append('')
    return general, detail[:-1]


def compose(manifest=None):
    manifest = manifest or load_manifest()
    by_id = {b['id']: b for b in manifest['bloques']}
    content = {i: read_block(b) for i, b in by_id.items()}
    chapters = [content[i] for i in manifest['composicion']['orden'] if by_id.get(i, {}).get('tipo') == 'capitulo']
    general, detail = generated_indexes(chapters)
    body = []
    for ident in manifest['composicion']['orden']:
        if ident == 'indice-general':
            body += [''] + general
        elif ident == 'indice-detallado':
            body += [''] + detail
        else:
            b = by_id[ident]
            body += [''] * b['lineas_en_blanco_previas'] + content[ident]
    body_text = '\n'.join(body) + '\n'
    digest = hashlib.sha256(body_text.encode('utf-8')).hexdigest()
    o = manifest['origen']
    note = [
        '<!-- EXPORTADO GENERADO. No editar a mano: se reconstruye con scripts/docs/build_engine_docs.py -->',
        '',
    ]
    # La nota va tras la presentacion (primer bloque) para no alterar su texto.
    pres_end = len(content['presentacion'])
    note_block = [
        '',
        '> **Exportado generado: no editar a mano.** Reconstruido con `python3 scripts/docs/build_engine_docs.py` a partir de las secciones de [`docs/motor/`](../motor/README.md), en el orden de [`manifest.json`](../motor/manifest.json). '
        'La referencia congelada de la importación es [`unificado-original.md`](../historico/motor/unificado-original.md) '
        '(SHA-256 `%s`). Revisión de composición: `%s`. Huella SHA-256 del contenido compuesto (sin esta nota): `%s`. '
        'Los índices de este archivo se generan a partir de los encabezados; el índice original se conserva solo en la copia histórica. '
        'Diseño definido no equivale a implementado, validado ni calibrado.' % (o['sha256'], manifest['composicion']['revision'], digest),
    ]
    lines = body_text.rstrip('\n').split('\n')
    lines = lines[:pres_end] + note_block + lines[pres_end:]
    return '\n'.join(note + lines) + '\n'


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--check', action='store_true', help='no escribe; falla si el exportado no esta al dia')
    args = ap.parse_args(argv)
    text = compose()
    current = None
    if os.path.exists(EXPORT):
        with open(EXPORT, encoding='utf-8', newline='') as f:
            current = f.read()
    if args.check:
        if current == text:
            print('OK: el exportado esta al dia (%d bytes).' % len(text.encode('utf-8')))
            return 0
        print('ERROR: el exportado no coincide con lo generado desde las secciones.')
        return 1
    if current == text:
        print('Sin cambios: %s' % os.path.relpath(EXPORT, ROOT))
        return 0
    os.makedirs(os.path.dirname(EXPORT), exist_ok=True)
    with open(EXPORT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print('Escrito: %s (%d bytes)' % (os.path.relpath(EXPORT, ROOT), len(text.encode('utf-8'))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
