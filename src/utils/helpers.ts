export function fmtDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function baseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
