// Imported course originals are immutable and carry a verified content hash.
// Revalidation MUST remain after authentication and file authorization, so a
// revoked release or a different signed-in student cannot reuse a cached page.
export function courseFileETag(file, {download = false, range = false} = {}) {
  if (download || range || !/^[a-f0-9]{64}$/.test(file?.sha256 || '')) return null;
  return `"sha256-${file.sha256}"`;
}

export function matchesETag(header, tag) {
  if (!tag || typeof header !== 'string') return false;
  return header.split(',').some(value => {
    const candidate = value.trim();
    return candidate === '*' || candidate.replace(/^W\//, '') === tag;
  });
}
