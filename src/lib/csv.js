/** Tiny CSV export helpers - no dependency, used by admin bulk-export screens. */

/** Escapes a single cell per RFC 4180 (quotes cells that need it). */
function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/**
 * @param {Record<string, any>[]} rows
 * @param {Array<{ key: string, label: string }>} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const lines = rows.map((row) => columns.map((column) => escapeCell(row[column.key])).join(','));
  return [header, ...lines].join('\r\n');
}

/** Triggers a browser download of a CSV string - a normal client-side Blob download. */
export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
