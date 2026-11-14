import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTeacherStartup} from '../teacher/startup.js';
import {loadWorkspaceData, workspaceCollections} from '../homework/route-data.js';
import {loadUnifiedIdentity} from '../homework-server/unified-session.mjs';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
};

test('teacher startup starts independently authorized reads before any response arrives', async () => {
  const pending = new Map();
  const task = loadTeacherStartup(path => {
    const gate = deferred(); pending.set(path, gate); return gate.promise;
  }, {homework: true});
  assert.deepEqual([...pending.keys()], ['/api/portal/session', '/api/teacher-portal/core/teacher/workspace', '/api/homework/me']);
  pending.get('/api/homework/me').resolve({user: {id: 'bookself:t', role: 'teacher'}, csrf: 'hw'});
  pending.get('/api/teacher-portal/core/teacher/workspace').resolve({classes: [{id: 'c'}]});
  pending.get('/api/portal/session').resolve({user: {id: 't', role: 'teacher'}, csrf: 'portal'});
  const result = await task;
  assert.equal(result.session.user.id, 't');
  assert.equal(result.homeworkSession.value.user.id, 'bookself:t');
  assert.equal(result.metadata.classes[0].id, 'c');
});

test('startup preserves mandatory failures and defers a homework failure to its actual surface', async () => {
  const offline = Error('homework unavailable');
  const result = await loadTeacherStartup(async path => {
    if (path === '/api/homework/me') throw offline;
    return {path};
  }, {homework: true});
  assert.equal(result.homeworkSession.error, offline);
  await assert.rejects(loadTeacherStartup(async path => {
    if (path.includes('teacher/workspace')) throw Error('forbidden');
    return {user: null};
  }), /forbidden/);
});

test('reading and self-loading detail routes never wait for unrelated assignment collections', async () => {
  for (const route of ['library', 'library/micro-unit-2/2.3/slides', 'grades', 'gradebook/student',
    'mistakes/a/1', 'overview/a', 'mcq/a', 'mcq-analysis/a', 'paper/s/1', 'device', 'trash', 'new']) {
    const result = await loadWorkspaceData(() => {throw Error('unrelated request');}, route);
    assert.deepEqual(result, {assignments: [], submissions: [], classes: []}, route);
  }
  for (const route of ['new/upload', 'edit/a', 'answer/a', 'mcq-import/import', 'account']) {
    assert.deepEqual(workspaceCollections(route), ['classes'], route);
  }
});

test('returning after publish reloads fresh collections and keeps the requested class scope', async () => {
  let assignments = [{id: 'a', classIds: ['bookself-class:c']}, {id: 'other', classIds: ['bookself-class:d']}];
  const calls = [];
  const api = async key => {
    calls.push(key);
    return {[key]: key === 'assignments' ? assignments : key === 'submissions'
      ? [{id: 's', assignmentId: 'a'}, {id: 'foreign', assignmentId: 'other'}] : [{id: 'bookself-class:c'}]};
  };
  const first = await loadWorkspaceData(api, 'assignments', 'c');
  assert.deepEqual(first.assignments.map(a => a.id), ['a']);
  assert.deepEqual(first.submissions.map(s => s.id), ['s']);
  assignments = [...assignments, {id: 'newly-published', classIds: ['bookself-class:c']}];
  const second = await loadWorkspaceData(api, 'assignments', 'c');
  assert.deepEqual(second.assignments.map(a => a.id), ['a', 'newly-published']);
  assert.equal(calls.filter(key => key === 'assignments').length, 2);
  assert.deepEqual(workspaceCollections('review/s'), ['assignments', 'submissions', 'classes']);
  await assert.rejects(loadWorkspaceData(async () => {throw Error('access revoked');}, 'assignments'), /access revoked/);
});

test('unified identity checks the session first, then overlaps current membership and account reads', async () => {
  const classes = deferred(), stored = deferred(), started = [];
  const auth = {session: async () => ({id: 't', role: 'teacher'}), classrooms: user => {
    started.push('classes:' + user.id); return classes.promise;
  }};
  const db = {get: key => {started.push('account:' + key); return stored.promise;}, tx: () => {throw Error('unexpected write');}};
  const task = loadUnifiedIdentity(auth, {}, db, () => 'now');
  await Promise.resolve();
  assert.deepEqual(started, ['classes:t', 'account:bookself:t']);
  stored.resolve({id: 'bookself:t', role: 'teacher', preserved: 'history'});
  classes.resolve([{id: 'current-class'}]);
  const result = await task;
  assert.equal(result.stored.preserved, 'history');
  assert.deepEqual(result.registeredClasses, [{id: 'current-class'}]);
  let reads = 0;
  assert.equal(await loadUnifiedIdentity({session: async () => null, classrooms: () => {reads++;}}, {},
    {get: () => {reads++;}}, () => 'now'), null);
  assert.equal(reads, 0);
});

test('identity and classes are read again after membership changes or session revocation', async () => {
  let signed = {id: 's', role: 'student'}, classes = [{id: 'first'}], checks = 0;
  const auth = {session: async () => {checks++; return signed;}, classrooms: async () => classes};
  const db = {get: async key => ({id: key, role: 'student'})};
  assert.equal((await loadUnifiedIdentity(auth, {}, db)).registeredClasses[0].id, 'first');
  classes = [{id: 'new-class'}];
  assert.equal((await loadUnifiedIdentity(auth, {}, db)).registeredClasses[0].id, 'new-class');
  signed = null;
  assert.equal(await loadUnifiedIdentity(auth, {}, db), null);
  assert.equal(checks, 3);
});

test('first visits keep the transaction recheck and do not create records after a roster failure', async () => {
  const records = new Map(); let writes = 0, queue = Promise.resolve();
  const db = {
    get: async key => records.get(key),
    put: async (_kind, user) => {writes++; records.set(user.id, user);},
    tx: callback => {const result = queue.then(() => callback({})); queue = result.catch(() => {}); return result;},
  };
  const auth = {session: async () => ({id: 't', role: 'teacher', name: 'Teacher'}), classrooms: async () => []};
  const users = await Promise.all([loadUnifiedIdentity(auth, {}, db, () => 'now'), loadUnifiedIdentity(auth, {}, db, () => 'now')]);
  assert.equal(writes, 1);
  assert.equal(users[0].stored.id, users[1].stored.id);
  await assert.rejects(loadUnifiedIdentity({...auth, session: async () => ({id: 'other'}), classrooms: async () => {throw Error('roster unavailable');}}, {}, db, () => 'now'), /roster unavailable/);
  assert.equal(writes, 1);
  assert(!records.has('bookself:other'));
});
