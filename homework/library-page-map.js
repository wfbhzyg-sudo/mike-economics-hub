export function canonicalResourcePage(resource, page) {
  if (!resource) return null;
  const local = Number(page);
  const total = Number(resource.pages || 0);
  if (!Number.isInteger(local) || local < 1 || local > total) return null;
  let sourcePage = local;
  if (Array.isArray(resource.pageMap)) {
    const mapped = Number(resource.pageMap[local - 1]);
    if (!Number.isInteger(mapped) || mapped < 1) return null;
    sourcePage = mapped;
  }
  return { fileId: resource.sourceFileId || resource.fileId, page: sourcePage };
}

export function sourceResourcePage(resource, page) {
  if (!resource?.sourceFileId) return null;
  const canonical = canonicalResourcePage(resource, page);
  if (!canonical) return null;
  return {
    fileId: resource.sourceFileId,
    page: canonical.page,
    pages: Number(resource.sourcePages || resource.pages || 0),
  };
}

export function resourceTopicRange(resource, range) {
  const total = Number(resource.pages);
  if (Array.isArray(range)) {
    const [first, last] = range;
    if (Number.isInteger(first) && Number.isInteger(last) && first >= 1 && first <= last && last <= total) return [first, last];
    if (Array.isArray(resource.pageMap)) {
      const pages = resource.pageMap.flatMap((p, i) => p >= first && p <= last ? [i + 1] : []);
      if (pages.length) return [pages[0], pages.at(-1)];
    }
  }
  return [1, total];
}
