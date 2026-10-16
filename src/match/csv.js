// Lectura de CSV simple (sin comillas), con cabecera. No inventa campos.
export function parseCsv(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV vacío o sin filas de datos');
  const header = lines[0].split(',');
  const rows = lines.slice(1).map((l, i) => {
    const cells = l.split(',');
    if (cells.length !== header.length) {
      throw new Error(`CSV fila ${i + 2}: ${cells.length} columnas, se esperaban ${header.length}`);
    }
    const o = {};
    header.forEach((h, k) => { o[h] = cells[k]; });
    return o;
  });
  return { header, rows };
}
