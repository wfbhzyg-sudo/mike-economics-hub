import {test} from 'node:test';
import assert from 'node:assert/strict';
import {byPublication, publicationTime} from '../homework/assignment-navigation.js';

test('published work uses the first release or original paper date in both directions', () => {
  const rows = [
    {id:'draft-2', published:false}, {id:'past', published:true, publishedAt:'2026-10-01T00:00:00Z', updatedAt:'2027-03-20'},
    {id:'draft-1'}, {id:'no-date', published:true, createdAt:'2026-12-01', opensAt:'2027-01-01', dueAt:'2027-03-01', recipients:{at:'2026-12-01'}},
    {id:'paper', published:true, offline:true, opensAt:'2026-11-11T00:00:00+08:00', createdAt:'2026-12-12'},
    {id:'same-b', published:true, publishedAt:'2026-11-15T05:00:00Z'}, {id:'same-a', published:true, publishedAt:'2026-11-15T13:00:00+08:00'}
  ];
  const original = structuredClone(rows);
  const ids = order => byPublication(rows, order).map(row => row.id);
  assert.deepEqual(ids('desc'), ['same-a','same-b','paper','past','no-date','draft-2','draft-1']);
  assert.deepEqual(ids('asc'), ['past','paper','same-a','same-b','no-date','draft-2','draft-1']);
  assert.deepEqual(rows, original);
  assert.equal(publicationTime({published:true, publishedAt:'invalid'}), null);
  assert.equal(publicationTime({published:true, format:'score', createdAt:'2027-01-01'}), null);
});
