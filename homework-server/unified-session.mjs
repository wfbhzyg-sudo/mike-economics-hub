// The identity and membership reads remain authoritative on every request.
// Once the session is valid, independent database reads need not wait in line.
export async function loadUnifiedIdentity(externalAuth, req, db, now) {
  const signed = await externalAuth.session(req);
  if (!signed) return null;
  const key = 'bookself:' + signed.id;
  const [registeredClasses, existing] = await Promise.all([
    externalAuth.classrooms(signed), db.get(key),
  ]);
  let stored = existing;
  if (!stored) stored = await db.tx(async client => {
    let user = await db.get(key, client);
    if (!user) {
      user = {id: key, bookselfId: signed.id, username: signed.username,
        name: signed.name, role: signed.role, classIds: [], createdAt: now()};
      await db.put('user', user, client);
    }
    return user;
  });
  return {signed, registeredClasses, stored};
}
