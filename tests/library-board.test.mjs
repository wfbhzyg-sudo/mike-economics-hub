import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardWallKey, validateBoardInput, validateBoardAttachments, publicBoardNote,
  sortBoardNotes, boardCounts,
} from '../homework-server/library-board-model.mjs';

test('board wall key is stable per unit and topic', () => {
  assert.equal(boardWallKey('micro-unit-2', '2.1'), 'micro-unit-2:2.1');
  assert.equal(boardWallKey('micro-unit-2', ''), 'micro-unit-2:all');
});

test('student input rejects teacher notes and empty bodies', () => {
  assert.throws(() => validateBoardInput({body: '', kind: 'discovery'}), /1–1000/);
  assert.throws(() => validateBoardInput({body: 'hi', kind: 'teacher'}, {teacher: false}), /只有教师/);
  const out = validateBoardInput({body: '  重点：供需曲线移动  ', kind: 'key'}, {teacher: false});
  assert.equal(out.kind, 'key');
  assert.equal(out.body, '重点：供需曲线移动');
});

test('attachments allow one pdf and up to four images', () => {
  const img = i => ({fileId: 'f' + i, name: i + '.png', mime: 'image/png'});
  assert.deepEqual(validateBoardAttachments([img(1), img(2)]).length, 2);
  assert.throws(() => validateBoardAttachments([1, 2, 3, 4, 5].map(img)), /最多上传 4/);
  assert.throws(() => validateBoardAttachments([
    {fileId: 'a', name: 'a.pdf', mime: 'application/pdf'},
    {fileId: 'b', name: 'b.pdf', mime: 'application/pdf'},
  ]), /最多上传 1 个 PDF/);
  assert.throws(() => validateBoardAttachments([{fileId: 'x', name: 'x.docx', mime: 'application/msword'}]), /附件仅支持/);
});

test('public note hides moderation fields but keeps author left flag', () => {
  const note = {
    id: 'n1', wallKey: 'w', kind: 'question', body: '为什么？', authorId: 'u1', authorName: '林同学',
    authorRole: 'student', authorClassLabel: 'AP Micro A', status: 'visible', pinned: false,
    hiddenReason: 'secret', hiddenBy: 'teacher', createdAt: '2026-11-16T00:00:00.000Z',
  };
  const view = publicBoardNote(note, {viewerId: 'u2', canModerate: false, authorLeft: true, useful: 3});
  assert.equal(view.authorLeft, true);
  assert.equal(view.hiddenReason, 'secret');
  assert.equal(view.hiddenBy, undefined);
  assert.equal(view.useful, 3);
  assert.equal(view.mine, false);
});

test('sort puts pinned notes first then newest', () => {
  const notes = [
    {id: 'a', pinned: false, createdAt: '2026-11-16T01:00:00.000Z', useful: 1},
    {id: 'b', pinned: true, createdAt: '2026-11-15T01:00:00.000Z', useful: 0},
    {id: 'c', pinned: false, createdAt: '2026-11-16T02:00:00.000Z', useful: 9},
  ];
  assert.deepEqual(sortBoardNotes(notes, 'latest').map(n => n.id), ['b', 'c', 'a']);
  assert.deepEqual(sortBoardNotes(notes, 'useful').map(n => n.id), ['b', 'c', 'a']);
});

test('counts include teacher notes separately', () => {
  const c = boardCounts([
    {kind: 'teacher', status: 'visible'}, {kind: 'discovery', status: 'visible'},
    {kind: 'discovery', status: 'hidden'},
  ]);
  assert.equal(c.all, 3);
  assert.equal(c.teacher, 1);
  assert.equal(c.discovery, 2);
});
