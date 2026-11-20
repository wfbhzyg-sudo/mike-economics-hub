import {readFile} from 'node:fs/promises';
import fontkit from '@pdf-lib/fontkit';
import {PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import {assert} from './validation.mjs';

const W = 595.28, H = 841.89, M = 46, BOTTOM = 52, TOP = H - 49, WIDTH = W - 2 * M;
const ink = rgb(.07,.14,.21), muted = rgb(.30,.36,.41), rule = rgb(.76,.80,.82);
let compactFont, fullFont;

function publicRows(questions) {
  return questions.map((q, index) => ({
    number: index + 1,
    sourceNumber: String(q.number || q.id || '').match(/^\d{1,4}(?:[.(）)（-]?[a-z\d]{1,3}[)）]?)?$/i)?.[0] || '',
    prompt: String(q.prompt || ''),
    points: Number.isFinite(q.maxPoints) ? q.maxPoints : null,
    short: q.type === 'short',
    options: (q.options || q.optionLabels || []).map(o => typeof o === 'string'
      ? {label:o, text:q.optionText?.[o] || ''} : {label:o.label, text:o.text || ''}),
    images: q.questionImages || [],
  }));
}

function wrapped(value, size, measure) {
  const lines = [];
  for (const raw of String(value).replace(/\r\n?/g,'\n').replace(/\t/g,'  ').split('\n')) {
    let line = '', width = 0;
    for (const token of raw.replace(/[\u0000-\u001f]/g,'').match(/[\x21-\x7e]+| +|[^]/gu) || []) {
      const tw = measure(token, size);
      if (line && width + tw > WIDTH) {
        lines.push(line.trimEnd()); line = ''; width = 0;
      }
      if (!line && !token.trim()) continue;
      if (tw <= WIDTH) { line += token; width += tw; continue; }
      for (const ch of token) {
        const cw = measure(ch,size);
        if (line && width + cw > WIDTH) { lines.push(line); line = ''; width = 0; }
        line += ch; width += cw;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

export async function questionPaperPDF({paper, questions = [], readAttachment}) {
  const rows = publicRows(questions);
  const used = new Set(rows.flatMap(q => q.images));
  const extras = [...new Set(paper.questionFiles || [])].filter(id => !used.has(id));
  if (extras.includes(paper.mainQuestionFile)) {
    extras.splice(extras.indexOf(paper.mainQuestionFile),1); extras.unshift(paper.mainQuestionFile);
  }
  assert(rows.length || extras.length || paper.instructions, '这份记录没有可导出的题面', 409);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  compactFont ||= readFile(new URL('./fonts/PaperText.ttf', import.meta.url)).then(bytes => ({bytes, face:fontkit.create(bytes)}));
  const compact = await compactFont;
  const texts = [paper.title,paper.instructions,paper.readingScope,paper.submissionGuide,
    ...rows.flatMap(q => [q.prompt,...q.options.map(o => o.text)])].filter(Boolean);
  const rare = texts.some(text => Array.from(text).some(ch => ch.codePointAt(0)>31 && !compact.face.hasGlyphForCodePoint(ch.codePointAt(0))));
  if (rare) fullFont ||= readFile(new URL('./fonts/NotoSansSC-Regular.ttf', import.meta.url));
  const font = await doc.embedFont(rare ? await fullFont : compact.bytes, {subset:false, features:{liga:false,clig:false}});
  const small = await doc.embedFont(StandardFonts.Helvetica);
  // A CJK font can substitute alternate digit glyphs in mixed-script text.
  // Keep Latin text and numbers in a PDF-native font with searchable encoding.
  const runs = value => String(value).match(/[ -~]+|[^ -~]+/gu) || [];
  const face = run => /^[ -~]/.test(run) ? small : font;
  const measure = (value,size) => runs(value).reduce((w,r)=>w+face(r).widthOfTextAtSize(r,size),0);
  function write(value,x,y,size,color){
    for(const run of runs(value)){
      const use=face(run);
      page.drawText(run,{x,y,size,font:use,color});
      x+=use.widthOfTextAtSize(run,size);
    }
  }
  doc.setTitle(paper.title); doc.setAuthor('Mike 经济一页通');
  const numbered = [];
  let page, y;
  const start = () => { page = doc.addPage([W,H]); numbered.push(page); y = TOP; };
  const need = h => { if (!page || y - h < BOTTOM) start(); };
  function drawLines(lines, size, color = ink) {
    for (const line of lines) {
      need(size * 1.55);
      if (line) write(line,M,y-size,size,color);
      y -= size * 1.55;
    }
  }
  const block = (text,size,color) => { if(text){drawLines(wrapped(text,size,measure),size,color); y -= 5;} };
  start();
  page.drawText('MIKE  /  ECONOMICS', {x:M,y:y-8,size:9,font:small,color:muted});
  y -= 24;
  block(paper.title,21);
  if (rows.length) block('共 '+rows.length+' 题',10,muted);
  for (const value of [paper.instructions,paper.readingScope && '本次范围　'+paper.readingScope,paper.submissionGuide && '作答要求　'+paper.submissionGuide]) block(value,11);
  y -= 4;

  const imageCache = new Map();
  async function image(id) {
    if (!imageCache.has(id)) {
      imageCache.set(id,await imageFromAttachment(await readAttachment(id), TOP-BOTTOM-55));
    }
    return imageCache.get(id);
  }
  function picture(p) {
    page.drawImage(p.img,{x:M+(WIDTH-p.width)/2,y:y-p.height,width:p.width,height:p.height});
    y -= p.height + 8;
  }
  for (const q of rows) {
    const source = q.sourceNumber && q.sourceNumber !== String(q.number) ? ' · 原题 '+q.sourceNumber : '';
    const heading = '第 '+q.number+' 题'+source;
    const body = wrapped(q.prompt,11,measure);
    const options = q.options.filter(o=>o.text).flatMap(o=>wrapped(o.label+'.  '+o.text,11,measure));
    const images = [];
    for (const id of q.images) images.push(await image(id));
    const lines = q.prompt ? body : [];
    const writing = q.short && !extras.length ? 2 : 0;
    const height = 26 + (lines.length+options.length)*17.05 + images.reduce((sum,p)=>sum+p.height+8,0) + 30 + writing*20;
    const first = lines.length ? Math.min(2,lines.length)*17.05 : (images[0]?.height || 18);
    need(height <= TOP-BOTTOM ? height : 26+first);
    page.drawLine({start:{x:M,y},end:{x:W-M,y},thickness:.7,color:rule});
    y -= 3;
    const header = continued => {
      write(heading+(continued?'（续）':''),M,y-14,12,ink);
      if (!continued && q.points !== null) {
        const score = q.points+' 分';
        write(score,W-M-measure(score,10),y-14,10,muted);
      }
      y -= 23;
    };
    header(false);
    const printLines = list => {
      for (const line of list) {
        if(y-17.05 < BOTTOM){ start(); header(true); }
        drawLines([line],11);
      }
    };
    printLines(lines);
    for (const p of images) {
      if (y-p.height < BOTTOM) { start(); header(true); }
      picture(p);
    }
    printLines(options);
    for(let i=0;i<writing;i++){
      if(y-20<BOTTOM){start();header(true);}
      y-=20;page.drawLine({start:{x:M,y},end:{x:W-M,y},thickness:.4,color:rule});
    }
    if (!q.short && q.options.length) {
      if(y-18<BOTTOM){start();header(true);}
      block('作答　'+q.options.map(o => '○ '+o.label).join('     '),10,muted);
    }
    y -= 6;
  }

  // These are separately uploaded student-facing originals. Keep their page boxes,
  // rotations and vector artwork, including landscape tables and diagrams.
  for (const id of extras) {
    const attachment = await readAttachment(id);
    if (attachment.mime === 'application/pdf') {
      const original = await PDFDocument.load(attachment.bytes);
      for (const p of await doc.copyPages(original,original.getPageIndices())) doc.addPage(p);
    } else {
      const p = await imageFromAttachment(attachment);
      start(); picture(p);
    }
  }
  async function imageFromAttachment({mime,bytes}, maxHeight = TOP-BOTTOM) {
    assert(['image/png','image/jpeg','image/webp'].includes(mime),'题纸附件格式异常',422);
    const img = mime==='image/jpeg' ? await doc.embedJpg(bytes) : await doc.embedPng(mime==='image/png'?bytes:await (await import('sharp')).default(bytes).png().toBuffer());
    const scale = Math.min(WIDTH/img.width,maxHeight/img.height);
    return {img,width:img.width*scale,height:img.height*scale};
  }
  const pages = doc.getPages(), total = pages.length, generated = new Set(numbered);
  pages.forEach((p,index) => {
    if(!generated.has(p)) return;
    const text = (index+1)+' / '+total;
    p.drawLine({start:{x:M,y:35},end:{x:W-M,y:35},thickness:.5,color:rule});
    p.drawText('Mike 经济一页通',{x:M,y:20,size:8,font,color:muted});
    p.drawText(text,{x:W-M-small.widthOfTextAtSize(text,9),y:20,size:9,font:small,color:muted});
  });
  return Buffer.from(await doc.save());
}
