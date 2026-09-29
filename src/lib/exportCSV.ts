/**
 * Shared utility for exporting JSON data to a downloadable CSV file.
 * Safely guards against circular structures, DOM elements (HTMLDivElement / FiberNode), and React internals.
 */

function safeValueForCSV(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }

  // Format timestamps if they are Firestore objects or native Dates
  if (typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    try {
      return JSON.stringify(val.toDate().toISOString());
    } catch {
      return '""';
    }
  }

  if (val instanceof Date) {
    return JSON.stringify(val.toISOString());
  }

  // Detect DOM elements, React elements, Fiber nodes, Window, Document
  if (
    typeof val === 'function' ||
    (typeof Element !== 'undefined' && val instanceof Element) ||
    (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) ||
    (typeof window !== 'undefined' && (val === window || val === document)) ||
    (typeof val === 'object' && (
      val.$$typeof ||
      val.nodeType ||
      val._owner ||
      val.stateNode ||
      Object.keys(val).some((k) => k.startsWith('__react') || k.startsWith('__fiber'))
    ))
  ) {
    return '""';
  }

  // Simple primitives
  if (typeof val !== 'object') {
    return JSON.stringify(String(val));
  }

  // Objects or arrays: use circular-safe stringify
  try {
    const seen = new WeakSet();
    const cleaned = JSON.stringify(val, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (
          (typeof Element !== 'undefined' && value instanceof Element) ||
          (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) ||
          value.$$typeof ||
          value.nodeType ||
          key.startsWith('__react') ||
          key.startsWith('__fiber') ||
          key === 'stateNode' ||
          key === '_owner'
        ) {
          return undefined;
        }
        if (seen.has(value)) {
          return undefined;
        }
        seen.add(value);
      }
      return value;
    });

    return cleaned !== undefined ? JSON.stringify(cleaned) : '""';
  } catch {
    return '""';
  }
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !Array.isArray(data) || data.length === 0) return;

  try {
    // Filter out non-plain items or DOM elements
    const validData = data.filter(
      (item) => item && typeof item === 'object' && !(item instanceof Element) && !item.$$typeof
    );
    if (validData.length === 0) return;

    // Filter headers to only include valid, non-React internal keys
    const headers = Object.keys(validData[0]).filter(
      (key) => !key.startsWith('__react') && key !== '_owner' && key !== 'stateNode'
    );

    const rows = validData.map((row) =>
      headers
        .map((h) => safeValueForCSV(row[h]))
        .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export CSV safely:', err);
  }
}

