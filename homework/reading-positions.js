// Reading a question is device-local. It must not mark an answer draft dirty.
export function readingPositions(key, initial = {}, storage = () => localStorage) {
  const positions = new Map(Object.entries(initial));
  try {
    const saved = JSON.parse(storage().getItem(key) || '{}');
    for (const [question, view] of Object.entries(saved)) positions.set(question, view);
  } catch {}
  let dirty = false, timer;
  function flush() {
    clearTimeout(timer);
    if (!dirty) return;
    try {
      storage().setItem(key, JSON.stringify(Object.fromEntries(positions)));
      dirty = false;
    } catch {}
  }
  return {
    get: question => positions.get(String(question)),
    snapshot: () => Object.fromEntries(positions),
    set(question, view) {
      const old = positions.get(String(question));
      if (old && old.x === view.x && old.y === view.y && old.zoom === view.zoom && old.text === view.text) return;
      positions.set(String(question), view);
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(flush, 150);
    },
    flush,
    clear() {
      clearTimeout(timer);
      dirty = false;
      try { storage().removeItem(key); } catch {}
    }
  };
}
