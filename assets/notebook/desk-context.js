// A book page is navigation context only. The task itself always comes from the signed-in account.
export function deskPage(params) {
  const raw = params.get('deskPage');
  return /^(0|[1-9]\d{0,3})$/.test(raw) ? Number(raw) : null;
}

export function onDeskPage(href, page) {
  const url = new URL(href, 'https://desk.invalid');
  url.searchParams.set('deskPage', String(page));
  return url.pathname + url.search + url.hash;
}

export const taskChangeKey = 'mike:notebook:tasks-changed';

export function affectsDeskTask(path, options) {
  if (options.method !== 'POST') return false;
  if (path === 'submissions') return options.body?.draft === false;
  return /^mcq\/attempt\/[^/]+\/submit$/.test(path) ||
    /^submissions\/[^/]+\/(publish|return|review-request|regrade)$/.test(path);
}
