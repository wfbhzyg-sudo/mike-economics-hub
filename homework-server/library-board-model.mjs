import {assert,text} from './validation.mjs';

export const BOARD_KINDS = ['discovery', 'key', 'question', 'resource', 'teacher'];
export const BOARD_KIND_LABELS = {discovery:'发现',key:'重点',question:'疑问',resource:'资源',teacher:'老师提示'};
export const BOARD_MAX_BODY = 1000;
export const BOARD_MAX_IMAGES = 4;
export const BOARD_MAX_PDFS = 1;

export function boardWallKey(unitId, topicId) {
  assert(/^(micro|macro)-unit-[1-6]$/.test(unitId), '教学包编号无效', 400);
  return `${unitId}:${topicId || 'all'}`;
}

export function validateBoardInput(input, {teacher = false} = {}) {
  const body = text(input.body || '').trim();
  assert(body && body.length <= BOARD_MAX_BODY, `便签内容需为 1–${BOARD_MAX_BODY} 字`, 400);
  const kind = BOARD_KINDS.includes(input.kind) ? input.kind : 'discovery';
  assert(teacher || kind !== 'teacher', '只有教师可以发布老师提示', 403);
  const attachments = Array.isArray(input.attachments) ? input.attachments.slice(0, 5) : [];
  return {body, kind, attachments};
}

export function validateBoardAttachments(attachments) {
  let images = 0, pdfs = 0;
  const clean = [];
  for (const file of attachments) {
    assert(file && typeof file.fileId === 'string', '附件信息不完整', 400);
    const mime = String(file.mime || '');
    if (mime === 'application/pdf') { pdfs += 1; assert(pdfs <= BOARD_MAX_PDFS, '最多上传 1 个 PDF', 400); }
    else {
      assert(/^image\/(jpeg|png|webp)$/.test(mime), '附件仅支持 JPG、PNG、WebP 或 PDF', 400);
      images += 1; assert(images <= BOARD_MAX_IMAGES, '最多上传 4 张图片', 400);
    }
    clean.push({fileId: file.fileId, name: String(file.name || '附件').slice(0, 160), mime, size: Number(file.size) || 0});
  }
  return clean;
}

export function publicBoardNote(note, {viewerId, canModerate = false, authorLeft = false, useful = 0, mine = false} = {}) {
  return {
    id: note.id,
    wallKey: note.wallKey,
    kind: note.kind,
    body: note.body,
    authorId: note.authorId,
    authorName: note.authorName,
    authorRole: note.authorRole,
    authorClassLabel: note.authorClassLabel || '',
    authorLeft: Boolean(authorLeft),
    attachments: (note.attachments || []).map(({fileId,name,mime,size}) => ({fileId,name,mime,size})),
    pinned: Boolean(note.pinned),
    status: note.status,
    hiddenReason: note.hiddenReason || '',
    useful,
    mine: Boolean(mine),
    canModerate,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    reports: canModerate ? (note.reportCount || 0) : 0,
  };
}

export function sortBoardNotes(notes, sort = 'latest') {
  return notes.slice().sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) return b.pinned ? 1 : -1;
    if (sort === 'useful') return (b.useful || 0) - (a.useful || 0) || String(b.createdAt).localeCompare(String(a.createdAt));
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export function boardCounts(notes) {
  const counts = {all: notes.length, discovery: 0, key: 0, question: 0, resource: 0, teacher: 0};
  for (const note of notes) if (counts[note.kind] !== undefined) counts[note.kind] += 1;
  return counts;
}
