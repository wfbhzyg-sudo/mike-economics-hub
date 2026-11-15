import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalResourcePage, sourceResourcePage} from '../homework/library-page-map.js';

const derived = {fileId: 'chapter-1', pages: 3, sourceFileId: 'book', sourcePages: 20, pageMap: [4, 5, 7]};

test('identity mapping without a page map', () => {
  assert.deepEqual(canonicalResourcePage({fileId: 'book', pages: 10}, 3), {fileId: 'book', page: 3});
});

test('chapter pages map to canonical book pages', () => {
  assert.deepEqual(canonicalResourcePage(derived, 1), {fileId: 'book', page: 4});
  assert.deepEqual(canonicalResourcePage(derived, 2), {fileId: 'book', page: 5});
  assert.deepEqual(canonicalResourcePage(derived, 3), {fileId: 'book', page: 7});
});

test('out of range or invalid pages do not map', () => {
  assert.equal(canonicalResourcePage(derived, 0), null);
  assert.equal(canonicalResourcePage(derived, 4), null);
  assert.equal(canonicalResourcePage(derived, 1.5), null);
  assert.equal(canonicalResourcePage({fileId: 'x', pages: 2, pageMap: [1, null]}, 2), null);
});

test('fallback target uses the canonical page and source page count', () => {
  assert.deepEqual(sourceResourcePage(derived, 2), {fileId: 'book', page: 5, pages: 20});
  assert.equal(sourceResourcePage({fileId: 'x', pages: 2}, 1), null);
});

test('resources without a source stay on their own file', () => {
  assert.deepEqual(canonicalResourcePage({fileId: 'book', pages: 2, sourcePages: 2}, 2), {fileId: 'book', page: 2});
  assert.equal(sourceResourcePage({fileId: 'book', pages: 2}, 2), null);
});
