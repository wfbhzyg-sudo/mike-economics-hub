// Parse one byte range. Multiple ranges may be ignored; malformed/unsatisfiable
// single ranges are rejected. Call only after the file authorization check.
export function byteRange(header, size) {
  if (!header || !header.startsWith('bytes=') || header.includes(',')) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!m || (!m[1] && !m[2]) || !Number.isSafeInteger(size) || size <= 0) return false;
  let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  let end = m[1] && m[2] ? Math.min(size - 1, Number(m[2])) : size - 1;
  if (![start, end].every(Number.isSafeInteger) || start >= size || start > end) return false;
  return {start, end, length: end - start + 1};
}
