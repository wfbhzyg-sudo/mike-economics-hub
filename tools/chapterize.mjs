#!/usr/bin/env node
/**
 * Chapterize a PPTX/PDF source into <=20-page chapter PDFs plus a manifest
 * that keeps every chapter page mapped to its canonical source page.
 *
 * Usage:
 *   node tools/chapterize.mjs \
 *     --source "/path/Unit.pptx" \
 *     --chapters chapters.json \
 *     --out operations/chapterize/<run> \
 *     [--title "Unit 2"] [--unit micro-unit-2] [--python python3]
 *
 * chapters.json: [{ "id": "ch-01", "title": "Demand", "from": 1, "to": 16 }]
 * `from`/`to` are 1-based pages in the converted source PDF.
 *
 * Hidden slides are retained: PPTX slides flagged show="0" are flipped to
 * visible in a temporary copy before LibreOffice converts it, so the page
 * numbering below always matches the original deck's slide order.
 */
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument} from 'pdf-lib';

const TOOL = 'tools/chapterize.mjs';
const MAX_CHAPTER_PAGES = 20;
const SOFFICE = process.env.SOFFICE_BIN || '/Applications/LibreOffice.app/Contents/MacOS/soffice';
const GS = process.env.GS_BIN || 'gs';
const COMPRESSION_PROFILES = new Set(['none', 'web', 'screen', 'ebook', 'printer']);

function fail(message) {
  console.error(`chapterize: ${message}`);
  process.exit(1);
}

function arg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function validChapter(chapter) {
  return chapter && typeof chapter.id === 'string' && chapter.id.length > 0 &&
    Number.isInteger(chapter.from) && Number.isInteger(chapter.to) &&
    chapter.from >= 1 && chapter.to >= chapter.from;
}

function readPptxHiddenSlides(python, file) {
  const code = 'import sys,json\n' +
    'from pptx import Presentation\n' +
    'p=Presentation(sys.argv[1])\n' +
    'print(json.dumps([i+1 for i,s in enumerate(p.slides) if s.element.get("show")=="0"]))';
  const run = spawnSync(python, ['-c', code, file], {encoding: 'utf8'});
  if (run.status !== 0) fail(`无法读取 PPTX 隐藏页（${python} 缺少 python-pptx？）：${run.stderr.trim()}`);
  return JSON.parse(run.stdout.trim() || '[]');
}

function unhidePptx(python, source, target) {
  const code = 'import sys\n' +
    'from pptx import Presentation\n' +
    'p=Presentation(sys.argv[1])\n' +
    'for s in p.slides:\n' +
    '    if s.element.get("show")=="0": s.element.set("show","1")\n' +
    'p.save(sys.argv[2])\n' +
    'print(len(p.slides))';
  const run = spawnSync(python, ['-c', code, source, target], {encoding: 'utf8'});
  if (run.status !== 0) fail(`无法展开 PPTX 隐藏页：${run.stderr.trim()}`);
  return Number(run.stdout.trim());
}

function convertToPdf(pptx, outDir) {
  const profile = path.join(outDir, '.lo-profile');
  const run = spawnSync(SOFFICE, [
    `-env:UserInstallation=file://${profile}`,
    '--headless', '--convert-to', 'pdf', '--outdir', outDir, pptx,
  ], {encoding: 'utf8'});
  if (run.status !== 0) fail(`LibreOffice 转换失败：${run.stderr.trim() || run.stdout.trim()}`);
  const base = path.basename(pptx).replace(/\.pptx?$/i, '.pdf');
  return path.join(outDir, base);
}

async function pageCount(file) {
  const pdf = await PDFDocument.load(await readFile(file));
  return pdf.getPageCount();
}

async function compressPdf(file, profile) {
  const temp = `${file}.compressed.pdf`;
  const preset = profile === 'web' ? [] : [`-dPDFSETTINGS=/${profile}`];
  const web = profile === 'web' ? [
    '-dDownsampleColorImages=true', '-dColorImageResolution=72',
    '-dDownsampleGrayImages=true', '-dGrayImageResolution=72',
    '-dDownsampleMonoImages=true', '-dMonoImageResolution=300',
    '-dColorImageDownsampleType=/Bicubic', '-dGrayImageDownsampleType=/Bicubic',
    '-dJPEGQ=78',
  ] : [];
  const run = spawnSync(GS, [
    '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7', ...preset,
    '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
    ...web, '-dPreserveAnnots=true', `-sOutputFile=${temp}`, file,
  ], {encoding: 'utf8'});
  if (run.status !== 0) fail(`Ghostscript 压缩失败：${run.stderr.trim()}`);
  const beforePages = await pageCount(file);
  const afterPages = await pageCount(temp);
  if (beforePages !== afterPages) fail(`压缩后页数变化：${file}`);
  const before = (await readFile(file)).length;
  await copyFile(temp, file);
  const after = (await readFile(file)).length;
  return {profile, beforeBytes: before, afterBytes: after};
}

async function splitChapter(sourcePdf, chapter, outDir) {
  const source = await PDFDocument.load(await readFile(sourcePdf));
  const target = await PDFDocument.create();
  const indexes = [];
  for (let page = chapter.from; page <= chapter.to; page += 1) indexes.push(page - 1);
  const copied = await target.copyPages(source, indexes);
  for (const page of copied) target.addPage(page);
  const bytes = Buffer.from(await target.save());
  const file = path.join(outDir, `${chapter.id}.pdf`);
  await writeFile(file, bytes);
  return {file, bytes};
}

async function main() {
  const source = path.resolve(arg('source'));
  const chaptersFile = path.resolve(arg('chapters'));
  const outDir = path.resolve(arg('out'));
  const python = arg('python', 'python3');
  const title = arg('title', path.basename(source));
  const unit = arg('unit', '');
  const compression = arg('compress', 'ebook');
  if (!COMPRESSION_PROFILES.has(compression)) fail(`未知压缩档位 ${compression}`);

  if (!source || !chaptersFile || !outDir) {
    fail('需要 --source、--chapters、--out');
  }

  let chapters;
  try {
    chapters = JSON.parse(await readFile(chaptersFile, 'utf8'));
  } catch (error) {
    fail(`无法读取 chapters JSON：${error.message}`);
  }
  if (!Array.isArray(chapters) || !chapters.length) fail('chapters 必须是非空数组');
  chapters.forEach((chapter, index) => {
    if (!validChapter(chapter)) fail(`第 ${index + 1} 个章节缺少合法 id/from/to`);
  });

  const sorted = [...chapters].sort((a, b) => a.from - b.from);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].from <= sorted[index - 1].to) {
      fail(`章节页范围重叠：${sorted[index - 1].id} 与 ${sorted[index].id}`);
    }
  }

  await mkdir(outDir, {recursive: true});
  const chaptersDir = path.join(outDir, 'chapters');
  await mkdir(chaptersDir, {recursive: true});

  const sourceBytes = await readFile(source);
  const sourceSha = sha256(sourceBytes);
  let convertedPdf = source;
  let hiddenSlides = [];

  if (/\.pptx$/i.test(source)) {
    hiddenSlides = readPptxHiddenSlides(python, source);
    const visible = path.join(outDir, 'source-visible.pptx');
    const slides = unhidePptx(python, source, visible);
    convertedPdf = convertToPdf(visible, outDir);
    if ((await pageCount(convertedPdf)) !== slides) {
      fail('转换后页数与幻灯片数量不一致，无法保证页映射');
    }
  } else if (/\.pdf$/i.test(source)) {
    const copy = path.join(outDir, 'source.pdf');
    if (path.resolve(copy) !== source) await copyFile(source, copy);
    convertedPdf = copy;
  } else {
    fail('只支持 .pptx 或 .pdf 源文件');
  }

  const sourcePages = await pageCount(convertedPdf);
  const results = [];
  for (const chapter of sorted) {
    if (chapter.to > sourcePages) fail(`${chapter.id} 超出源页数 ${sourcePages}`);
    const pages = chapter.to - chapter.from + 1;
    if (pages > MAX_CHAPTER_PAGES) fail(`${chapter.id} 为 ${pages} 页，超过 ${MAX_CHAPTER_PAGES} 页上限`);
    const split = await splitChapter(convertedPdf, chapter, chaptersDir);
    const compressed = compression === 'none' ? null : await compressPdf(split.file, compression);
    const bytes = await readFile(split.file);
    const pageMap = Array.from({length: pages}, (_, index) => chapter.from + index);
    results.push({
      id: chapter.id,
      title: chapter.title || chapter.id,
      file: path.relative(outDir, split.file),
      sha256: sha256(bytes),
      bytes: bytes.length,
      compression: compressed,
      pages,
      sourceFrom: chapter.from,
      sourceTo: chapter.to,
      pageMap,
    });
  }

  const covered = results.reduce((sum, chapter) => sum + chapter.pages, 0);
  const totalBytes = results.reduce((sum, chapter) => sum + chapter.bytes, 0);
  const originalBytes = results.reduce((sum, chapter) => sum + (chapter.compression?.beforeBytes || chapter.bytes), 0);
  const gaps = [];
  let cursor = 1;
  for (const chapter of results) {
    if (chapter.sourceFrom > cursor) gaps.push([cursor, chapter.sourceFrom - 1]);
    cursor = Math.max(cursor, chapter.sourceTo + 1);
  }
  if (cursor <= sourcePages) gaps.push([cursor, sourcePages]);

  const manifest = {
    tool: TOOL,
    version: 1,
    createdAt: new Date().toISOString(),
    title,
    unit: unit || null,
    source: {
      file: path.basename(source),
      sha256: sourceSha,
      bytes: sourceBytes.length,
      pages: sourcePages,
      format: path.extname(source).toLowerCase(),
      hiddenSlidesRetained: hiddenSlides,
      hiddenSlideCount: hiddenSlides.length,
    },
    chapters: results,
    coverage: {sourcePages, chapterPages: covered, gaps, totalBytes, originalBytes, savedBytes: originalBytes - totalBytes},
    validations: {
      allChaptersWithinPageLimit: results.every(chapter => chapter.pages <= MAX_CHAPTER_PAGES),
      pageMapsContiguous: results.every(chapter =>
        chapter.pageMap.every((page, index) => page === chapter.sourceFrom + index)),
      rangesDoNotOverlap: results.every((chapter, index) =>
        index === 0 || chapter.sourceFrom > results[index - 1].sourceTo),
      hiddenSlidesRetained: hiddenSlides.every(index => index >= 1 && index <= sourcePages),
    },
  };

  const libraryUnit = {
    id: unit || path.basename(outDir),
    type: 'library-unit',
    title,
    resources: results.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      fileId: `PENDING:${chapter.file}`,
      sourceFileId: 'PENDING:source',
      pages: chapter.pages,
      sourcePages: sourcePages,
      pageMap: chapter.pageMap,
    })),
  };

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(outDir, 'chapter-validation.json'), JSON.stringify({
    title,
    sourceSha256: sourceSha,
    sourcePages,
    chapters: results.map(({id, pages, sourceFrom, sourceTo, sha256: chapterSha}) =>
      ({id, pages, sourceFrom, sourceTo, sha256: chapterSha})),
    validations: manifest.validations,
  }, null, 2));
  await writeFile(path.join(outDir, 'library-unit.json'), JSON.stringify(libraryUnit, null, 2));

  const failed = Object.entries(manifest.validations).filter(([, ok]) => !ok);
  if (failed.length) fail(`校验失败：${failed.map(([key]) => key).join(', ')}`);

  console.log(JSON.stringify({
    out: outDir,
    sourcePages,
    compression,
    totalBytes,
    originalBytes,
    hiddenSlides,
    chapters: results.map(({id, pages, sourceFrom, sourceTo}) => ({id, pages, sourceFrom, sourceTo})),
    gaps,
  }, null, 2));
}

main().catch(error => fail(error.stack || error.message));
